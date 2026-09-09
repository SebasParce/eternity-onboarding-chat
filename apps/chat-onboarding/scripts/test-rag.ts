/**
 * Prueba manual del fallback de RAG, sin WhatsApp/Twilio de por medio.
 *
 * Uso (con ANTHROPIC_API_KEY en el entorno o en .env):
 *   npm run test:rag -- "Como pagan?"
 *   npm run test:rag -- "Cuanto gano en Elite?"
 *
 * Muestra: las candidatas que trajo el retrieval local (gratis) y la
 * decisión final del modelo (o "sin match" si matchFaq() ya la hubiera
 * resuelto gratis, o si el RAG decide que ninguna candidata aplica).
 */
import "dotenv/config";
import { matchFaq } from "../src/faq/knowledgeBase.js";
import { retrieveCandidates } from "../src/faq/localRetrieval.js";
import { ragMatchFaq } from "../src/faq/ragMatch.js";

async function main() {
  const question = process.argv.slice(2).join(" ").trim();
  if (!question) {
    console.error('Uso: npm run test:rag -- "tu pregunta de prueba"');
    process.exit(1);
  }

  console.log(`\nPregunta: "${question}"\n`);

  const keywordMatch = matchFaq(question);
  if (keywordMatch) {
    console.log(`✅ Ya la resuelve matchFaq() (GRATIS, sin llamar a ningún modelo): ${keywordMatch.id}`);
    console.log(`   Respuesta: ${keywordMatch.respuesta}`);
    return;
  }

  console.log("matchFaq() no encontró nada — pasando al fallback de RAG...\n");

  const hits = retrieveCandidates(question);
  if (hits.length === 0) {
    console.log("Retrieval local: sin candidatas por encima del umbral -> NO se llama al modelo (costo $0).");
    console.log("Resultado final: null (se escalaría a un manager humano).");
    return;
  }

  console.log(`Retrieval local encontró ${hits.length} candidata(s):`);
  for (const h of hits) console.log(`   ${h.score.toFixed(3)}  ${h.entry.id}`);
  console.log("\nLlamando a Claude Haiku 4.5 para elegir entre esas candidatas...\n");

  const result = await ragMatchFaq(question);
  if (!result) {
    console.log("Resultado final: null — el modelo decidió que ninguna candidata responde con certeza.");
    console.log("(se escalaría a un manager humano, igual que si no hubiera match de ningún tipo)");
    return;
  }

  console.log(`✅ El modelo eligió: ${result.id}`);
  console.log(`   Respuesta: ${result.respuesta}`);
}

main().catch((err) => {
  console.error("Error corriendo la prueba:", err);
  process.exit(1);
});
