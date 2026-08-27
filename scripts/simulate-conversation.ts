import { InMemoryCreatorRepository } from "../src/db/inMemoryCreatorRepository.js";
import { MockWhatsAppChannel } from "../src/channels/adapters/mockChannel.js";
import { handleInboundMessage } from "../src/conversation/stateMachine.js";
import type { InboundMessage } from "../src/types/domain.js";

/**
 * Simula una conversación completa de onboarding, de punta a punta, contra
 * el motor de conversación REAL (no un mock del motor) — solo el repositorio
 * y el canal son en memoria/consola. Sirve para validar el flujo sin
 * necesitar Supabase ni credenciales de WhatsApp todavía.
 *
 * Correr con: npm run simulate
 */

const FROM = "+573001234567";

async function send(repo: InMemoryCreatorRepository, channel: MockWhatsAppChannel, text: string, interactiveId?: string) {
  console.log(`\n📥 [creador -> sistema] "${text}"`);
  const inbound: InboundMessage = { from: FROM, text, interactiveId };
  await handleInboundMessage(repo, channel, inbound);
}

async function main() {
  const repo = new InMemoryCreatorRepository();
  const channel = new MockWhatsAppChannel();

  console.log("=".repeat(70));
  console.log("SIMULACIÓN: flujo completo de onboarding (Eternity Agency LATAM)");
  console.log("=".repeat(70));

  // 1) Primer contacto -> el sistema saluda y pide nombre
  await send(repo, channel, "Hola, vi el anuncio en TikTok");

  // 2) Responde su nombre -> el sistema pide @tiktok
  await send(repo, channel, "Camila Ramírez");

  // 3) Responde su @tiktok -> el sistema envía el programa completo
  await send(repo, channel, "@camilarami.live");

  // 4) Duda de FAQ: beneficios
  await send(repo, channel, "¿Qué beneficios tiene la agencia?");

  // 5) Duda de FAQ: seguidores mínimos
  await send(repo, channel, "¿Necesito un mínimo de seguidores?");

  // 6) Duda que NO está en la FAQ -> debe escalar a manager
  await send(repo, channel, "¿Puedo transmitir en otro idioma?");

  // 7) Confirma que quiere iniciar (vía botón, como en el prototipo real)
  await send(repo, channel, "Quiero iniciar 🚀", "quiero_iniciar");

  // 8) Mensaje después de derivado a e-learning
  await send(repo, channel, "ok gracias");

  console.log("\n" + "=".repeat(70));
  console.log(`Total de mensajes enviados por el sistema: ${channel.sentMessages.length}`);
  const creator = await repo.findByWhatsappNumber(FROM);
  console.log(`Etapa final del creador: ${creator?.etapa}`);
  console.log(`Nombre: ${creator?.nombre} | @tiktok: ${creator?.tiktok_handle}`);
  console.log(`Entradas en interaction_log: ${repo.getFullLog().length}`);
  console.log("=".repeat(70));
}

main().catch((err) => {
  console.error("Error en la simulación:", err);
  process.exit(1);
});
