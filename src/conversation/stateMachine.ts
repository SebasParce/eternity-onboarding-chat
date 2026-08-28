import type { CreatorRepository } from "../db/creatorRepository.js";
import type { WhatsAppChannel } from "../channels/WhatsAppChannel.js";
import type { Creator, InboundMessage } from "../types/domain.js";
import { matchFaq } from "../faq/knowledgeBase.js";
import {
  askTikTokHandle,
  faqFallbackEscalate,
  greetingAndAskName,
  isQuieroIniciarIntent,
  programMessage,
  redirectToElearning,
  withQuieroIniciarButton,
} from "./messages.js";

/**
 * Motor de conversación — un solo punto de entrada, `handleInboundMessage`,
 * que replica el flujo validado con el prototipo:
 *
 *   nuevo -> (nombre) -> nombre_recibido -> (@tiktok) -> handle_recibido
 *         -> programa_enviado -> resolviendo_dudas (loop de FAQ)
 *         -> quiere_iniciar -> derivado_elearning
 *
 * Es agnóstico del proveedor de WhatsApp (recibe un WhatsAppChannel ya
 * resuelto) y de dónde vive el estado (recibe un CreatorRepository ya
 * resuelto) — así el mismo código sirve para producción (Supabase + Twilio/
 * 360dialog/Gupshup) y para la simulación en memoria de
 * scripts/simulate-conversation.ts.
 */
export async function handleInboundMessage(
  repo: CreatorRepository,
  channel: WhatsAppChannel,
  inbound: InboundMessage
): Promise<void> {
  let creator = await repo.findByWhatsappNumber(inbound.from);
  if (!creator) creator = await repo.create(inbound.from);

  creator = await repo.update(creator.id, {
    ultimo_mensaje_entrante_at: new Date().toISOString(),
  });

  await repo.logInteraction({
    creator_id: creator.id,
    rol: "creador",
    tipo: "mensaje_flujo",
    contenido: inbound.text,
    etapa_en_momento: creator.etapa,
  });

  // Un manager tomó esta conversación desde el dashboard: el mensaje ya quedó
  // registrado arriba (así el manager lo ve en el chat), pero el motor no
  // responde solo — el humano tiene el control hasta que reactive el bot.
  if (creator.bot_pausado) return;

  switch (creator.etapa) {
    case "nuevo":
      await handleEtapaNuevo(repo, channel, creator, inbound);
      break;

    case "nombre_recibido":
      await handleEtapaNombreRecibido(repo, channel, creator, inbound);
      break;

    case "handle_recibido":
      // Transitorio: en la práctica se resuelve dentro de handleEtapaNombreRecibido
      // (ver nota ahí). Si llega un mensaje en este estado, reenviamos el programa.
      await sendProgramAndEnterFaqMode(repo, channel, creator);
      break;

    case "programa_enviado":
    case "resolviendo_dudas":
      await handleModoFaq(repo, channel, creator, inbound);
      break;

    case "quiere_iniciar":
    case "derivado_elearning":
      await handlePostRedireccion(repo, channel, creator, inbound);
      break;

    default:
      // Etapas de fase 2 (en_programa_4_dias, revision_dia_5, etc.) no las
      // maneja este motor de chat de onboarding — quedan para el módulo de
      // e-learning / seguimiento del programa.
      await channel.sendMessage({
        to: creator.whatsapp_number,
        text: "¡Hola de nuevo! Tu manager tiene el contexto de tu proceso actual y te va a contactar por aquí. 💚",
      });
  }
}

async function handleEtapaNuevo(
  repo: CreatorRepository,
  channel: WhatsAppChannel,
  creator: Creator,
  inbound: InboundMessage
): Promise<void> {
  const yaSaludamos = Boolean(creator.contexto?.["nombre_prompted"]);

  if (!yaSaludamos) {
    await sendAndLog(repo, channel, creator, greetingAndAskName());
    await repo.update(creator.id, { contexto: { ...creator.contexto, nombre_prompted: true } });
    return;
  }

  // Este mensaje es la respuesta a "¿cuál es tu nombre?"
  const nombre = inbound.text.trim();
  const updated = await repo.update(creator.id, { nombre, etapa: "nombre_recibido" });
  await sendAndLog(repo, channel, updated, askTikTokHandle(nombre));
}

async function handleEtapaNombreRecibido(
  repo: CreatorRepository,
  channel: WhatsAppChannel,
  creator: Creator,
  inbound: InboundMessage
): Promise<void> {
  // Este mensaje es la respuesta a "¿cuál es tu @ de TikTok?"
  const handle = inbound.text.trim().replace(/^@/, "").toLowerCase();
  const updated = await repo.update(creator.id, { tiktok_handle: handle, etapa: "handle_recibido" });
  await sendProgramAndEnterFaqMode(repo, channel, updated);
}

async function sendProgramAndEnterFaqMode(
  repo: CreatorRepository,
  channel: WhatsAppChannel,
  creator: Creator
): Promise<void> {
  const text = programMessage(creator.nombre ?? "");
  await channel.sendMessage({
    to: creator.whatsapp_number,
    text,
    buttons: withQuieroIniciarButton(text),
  });
  await repo.logInteraction({
    creator_id: creator.id,
    rol: "sistema",
    tipo: "mensaje_flujo",
    contenido: text,
    etapa_en_momento: "programa_enviado",
  });
  await repo.update(creator.id, {
    etapa: "resolviendo_dudas", // queda abierto a dudas hasta que confirme "quiero iniciar"
    ultimo_mensaje_saliente_at: new Date().toISOString(),
  });
}

async function handleModoFaq(
  repo: CreatorRepository,
  channel: WhatsAppChannel,
  creator: Creator,
  inbound: InboundMessage
): Promise<void> {
  if (isQuieroIniciarIntent(inbound)) {
    const text = redirectToElearning(creator.nombre ?? "");
    await sendAndLog(repo, channel, creator, text);
    await repo.update(creator.id, { etapa: "derivado_elearning" });
    await repo.logInteraction({
      creator_id: creator.id,
      rol: "sistema",
      tipo: "evento_sistema",
      contenido: "Creador confirmó 'quiero iniciar' -> derivado a plataforma e-learning",
      etapa_en_momento: "derivado_elearning",
    });
    return;
  }

  const faqEntry = matchFaq(inbound.text);
  if (faqEntry) {
    await channel.sendMessage({ to: creator.whatsapp_number, text: faqEntry.respuesta });
    await repo.logInteraction({
      creator_id: creator.id,
      rol: "sistema",
      tipo: "duda_faq",
      contenido: faqEntry.respuesta,
      faq_entry_id: faqEntry.id,
      etapa_en_momento: creator.etapa,
    });
    await repo.update(creator.id, {
      etapa: "resolviendo_dudas",
      ultimo_mensaje_saliente_at: new Date().toISOString(),
    });
    return;
  }

  // No matcheó ninguna FAQ conocida: se escala a un manager humano en vez de
  // improvisar una respuesta. El manager puede seguir la conversación desde
  // interaction_log (rol "manager") sin perder el hilo del state machine.
  await sendAndLog(repo, channel, creator, faqFallbackEscalate());
  await repo.logInteraction({
    creator_id: creator.id,
    rol: "sistema",
    tipo: "evento_sistema",
    contenido: `Duda sin match en FAQ, escalada a manager: "${inbound.text}"`,
    etapa_en_momento: creator.etapa,
  });
}

async function handlePostRedireccion(
  repo: CreatorRepository,
  channel: WhatsAppChannel,
  creator: Creator,
  _inbound: InboundMessage
): Promise<void> {
  await sendAndLog(
    repo,
    channel,
    creator,
    "Ya te compartí el acceso a la plataforma para continuar tu proceso 💚 Si tienes problemas para entrar, " +
      "cuéntame y le aviso a tu manager."
  );
}

async function sendAndLog(
  repo: CreatorRepository,
  channel: WhatsAppChannel,
  creator: Creator,
  text: string
): Promise<void> {
  await channel.sendMessage({ to: creator.whatsapp_number, text });
  await repo.logInteraction({
    creator_id: creator.id,
    rol: "sistema",
    tipo: "mensaje_flujo",
    contenido: text,
    etapa_en_momento: creator.etapa,
  });
  await repo.update(creator.id, { ultimo_mensaje_saliente_at: new Date().toISOString() });
}
