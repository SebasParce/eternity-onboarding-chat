/**
 * Fallback de RAG para la FAQ — solo se usa cuando `matchFaq()` (gratis, por
 * keywords, en `knowledgeBase.ts`) no encontró nada.
 *
 * Diseño pensado para que sea lo más barato posible:
 *
 * 1. Retrieval 100% local y gratis (`localRetrieval.ts`, TF-IDF). Si no hay
 *    ninguna entrada por encima del umbral de similitud, esta función
 *    devuelve `null` SIN llamar a la API — un mensaje que no tiene nada que
 *    ver con el banco de preguntas no cuesta nada.
 * 2. Cuando sí hay candidatas, se llama una sola vez al modelo más barato
 *    que ofrece hoy la API de Anthropic directamente (Claude Haiku 4.5:
 *    $1/MTok de entrada, $5/MTok de salida — ver
 *    docs.claude.com/en/docs/about-claude/pricing). El prompt manda pocas
 *    candidatas (no las 317 entradas) y el modelo NUNCA redacta la
 *    respuesta final: solo elige un id vía tool use (salida de ~10 tokens).
 *    La respuesta que de verdad se envía por WhatsApp sigue siendo el texto
 *    ya validado de `FaqEntry.respuesta` — el modelo clasifica, no genera.
 *    Esto además evita que el modelo invente o mezcle datos de dos niveles
 *    (principiante/Elite) o dos tablas de bonos, que es justo el error que
 *    el banco de preguntas fuente marca como el más caro de cometer.
 * 3. Cualquier error (falta la API key, falla la red, la API devuelve un
 *    error) se traga y devuelve `null` — nunca tira el bot. Ante un `null`
 *    de esta función, `stateMachine.ts` escala a un manager humano, igual
 *    que si `matchFaq()` no hubiera encontrado nada.
 *
 * Requiere `ANTHROPIC_API_KEY` en el entorno (ver `.env.example`). Sin esa
 * variable, esta función es un no-op (log de aviso + `null`) — el bot sigue
 * funcionando solo con el matcher de keywords, como antes de este archivo.
 */

import type { FaqEntry } from "./knowledgeBase.js";
import { retrieveCandidates } from "./localRetrieval.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Modelo más barato disponible hoy vía la API directa de Anthropic
// (Claude Haiku 3.5 es más barato aún, pero está retirado excepto en Bedrock/
// Vertex — no se puede llamar así, directo, con una API key de Anthropic).
const RAG_MODEL = "claude-haiku-4-5-20251001";

const MAX_CANDIDATES = 5;
const TOOL_NAME = "elegir_respuesta";
const NINGUNA = "NINGUNA";

function buildSystemPrompt(): string {
  return [
    "Eres un clasificador para el bot de WhatsApp de Eternity Agency LATAM (agencia de creadores de TikTok LIVE).",
    "Tu única tarea es decidir, entre las entradas candidatas que te muestro, cuál (si alguna) responde EXACTAMENTE lo que preguntó el creador.",
    "",
    "Reglas estrictas, sin excepción:",
    "- No inventes información que no esté en el texto de las entradas candidatas.",
    "- No combines datos de dos entradas distintas en una sola respuesta.",
    "- No elijas una entrada de un nivel/programa distinto al que el creador mencionó (ejemplo: si la pregunta es genérica, no elijas una entrada que sea específicamente de \"Elite\" salvo que el creador haya dicho \"Elite\").",
    "- Si ninguna candidata responde con suficiente certeza, o dos candidatas podrían aplicar y no estás seguro de cuál, NO ELIJAS NINGUNA.",
    `- Para "ninguna candidata aplica", usa el id literal "${NINGUNA}".`,
    "",
    "Es preferible no elegir ninguna (y que un manager humano responda) que elegir la entrada equivocada — dar el dato del nivel o la tabla incorrecta es peor que escalar.",
    "",
    `Responde SIEMPRE llamando a la herramienta "${TOOL_NAME}", nunca con texto libre.`,
  ].join("\n");
}

function buildUserContent(userText: string, candidates: FaqEntry[]): string {
  const list = candidates
    .map((c, i) => `[${i + 1}] id: ${c.id}\npregunta: ${c.embeddingText}\nrespuesta: ${c.respuesta}`)
    .join("\n\n");
  return `Mensaje del creador: "${userText}"\n\nEntradas candidatas:\n\n${list}`;
}

interface AnthropicContentBlock {
  type: string;
  name?: string;
  input?: { entry_id?: string };
}

interface AnthropicMessagesResponse {
  content?: AnthropicContentBlock[];
}

export async function ragMatchFaq(userText: string): Promise<FaqEntry | null> {
  const hits = retrieveCandidates(userText, MAX_CANDIDATES);
  if (hits.length === 0) return null; // sin candidatas -> ni se llama al modelo, costo cero

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn(
      "[ragMatchFaq] Falta ANTHROPIC_API_KEY en el entorno — se omite el fallback de RAG " +
        "(el bot sigue funcionando solo con matchFaq() por keywords)."
    );
    return null;
  }

  const candidates = hits.map((h) => h.entry);

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: RAG_MODEL,
        max_tokens: 100,
        system: buildSystemPrompt(),
        messages: [{ role: "user", content: buildUserContent(userText, candidates) }],
        tools: [
          {
            name: TOOL_NAME,
            description:
              `Elige el id EXACTO de la entrada candidata que responde la pregunta del creador, o "${NINGUNA}" si ninguna aplica con suficiente certeza.`,
            input_schema: {
              type: "object",
              properties: {
                entry_id: {
                  type: "string",
                  description: `El id de una de las entradas candidatas listadas, o el texto literal "${NINGUNA}".`,
                },
              },
              required: ["entry_id"],
            },
          },
        ],
        tool_choice: { type: "tool", name: TOOL_NAME },
      }),
    });

    if (!response.ok) {
      console.error(`[ragMatchFaq] Anthropic API respondió ${response.status}: ${await response.text()}`);
      return null;
    }

    const data = (await response.json()) as AnthropicMessagesResponse;
    const toolUse = data.content?.find((b) => b.type === "tool_use" && b.name === TOOL_NAME);
    const chosenId = toolUse?.input?.entry_id;

    if (!chosenId || chosenId === NINGUNA) return null;
    return candidates.find((c) => c.id === chosenId) ?? null;
  } catch (err) {
    console.error("[ragMatchFaq] Error llamando a la API de Anthropic:", err);
    return null;
  }
}
