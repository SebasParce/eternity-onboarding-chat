import type { InboundMessage, OutboundMessage } from "../types/domain.js";

/** Botón usado para que el creador confirme que quiere empezar el programa. */
export const QUIERO_INICIAR_BUTTON = { id: "quiero_iniciar", title: "Quiero iniciar 🚀" };

export function greetingAndAskName(): string {
  return (
    "¡Hola! 👋 Bienvenid@ a Eternity Agency LATAM.\n\n" +
    "Antes de contarte cómo funciona nuestro programa, cuéntame: ¿cuál es tu nombre?"
  );
}

export function askTikTokHandle(nombre: string): string {
  const primerNombre = nombre.trim().split(/\s+/)[0];
  return `¡Un gusto, ${primerNombre}! 💚 Ahora cuéntame, ¿cuál es tu @ (usuario) de TikTok?`;
}

/**
 * Mensaje del "Programa para Creadores Principiantes" — contenido validado
 * con el negocio, se usa tal cual (no parafrasear). Se envía completo apenas
 * el creador da su @tiktok.
 */
export function programMessage(nombre: string): string {
  const primerNombre = nombre.trim().split(/\s+/)[0];
  return (
    `${primerNombre}, te cuento sobre nuestro...\n\n` +
    "✨ Nuestro Programa para Creadores Principiantes! 💚\n" +
    "Te cuento cómo funciona.\n\n" +
    "Es un acompañamiento personalizado de 4 días, diseñado para ayudar a los creadores que están " +
    "comenzando en TikTok LIVE a crear el hábito de transmitir, mejorar la calidad de sus LIVE y empezar " +
    "a obtener mejores resultados.\n\n" +
    "Durante esos 4 días trabajarás de la mano con un manager, quien hará seguimiento a tu proceso y te " +
    "acompañará antes, durante y después de cada transmisión.\n\n" +
    "¿Qué haremos durante el programa?\n" +
    "✨ Revisaremos tus LIVE y te daremos retroalimentación personalizada.\n" +
    "✨ Te compartiremos estrategias para mejorar la interacción con tu audiencia.\n" +
    "✨ Resolveremos todas las dudas que tengas durante el proceso.\n" +
    "✨ Te ayudaremos a crear una rutina de transmisión constante.\n" +
    "✨ Estaremos pendientes de tu evolución para que aproveches al máximo cada LIVE.\n\n" +
    "Lo único que te pedimos es compromiso durante esos 4 días:\n" +
    "✅ Transmitir todos los días.\n" +
    "✅ Procurar que cada LIVE tenga una duración mínima de 2 horas.\n" +
    "✅ Avisarle a tu manager 10 minutos antes de iniciar cada transmisión.\n" +
    "✅ Aplicar las recomendaciones que te iremos compartiendo.\n\n" +
    "🎯 ¿Cuál es el objetivo del programa?\n" +
    "Que al finalizar los 4 días ya hayas creado el hábito de transmitir, notes una evolución en tus LIVE, " +
    "comiences a mejorar tu monetización y estés listo para dar el siguiente paso.\n\n" +
    "💚 El quinto día revisaremos tu proceso y, si completaste el programa con compromiso y constancia, " +
    "realizaremos tu ingreso oficial a ETERNITY AGENCY LATAM.\n\n" +
    "¿Tienes alguna duda? Escríbemela con confianza. Si ya tienes todo claro, toca el botón de abajo 👇"
  );
}

export function faqFallbackEscalate(): string {
  return (
    "Buena pregunta 🤔 Esa la quiero resolver bien contigo, así que la voy a pasar directo con tu manager " +
    "para que te responda personalmente. Mientras tanto, ¿tienes alguna otra duda o ya quieres iniciar?"
  );
}

export function redirectToElearning(nombre: string): string {
  const primerNombre = nombre.trim().split(/\s+/)[0];
  return (
    `¡Vamos ${primerNombre}! 🚀 Este es tu siguiente paso: entra a la plataforma para crear tu perfil y ` +
    "empezar tu capacitación:\n\n👉 https://academia-eternity.vercel.app\n\n" +
    "Ahí vas a encontrar los módulos de preparación y la validación de tu setup antes de arrancar los 4 días " +
    "del programa. ¡Nos vemos en tu primer LIVE! 💚"
  );
}

/**
 * Detecta la intención "quiero iniciar", ya sea por botón interactivo
 * (preferido — más confiable) o por texto libre (fallback para proveedores/
 * clientes que no soportan botones, ej. Twilio en ciertos tiers).
 */
export function isQuieroIniciarIntent(inbound: InboundMessage): boolean {
  if (inbound.interactiveId === QUIERO_INICIAR_BUTTON.id) return true;

  const normalized = inbound.text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

  return ["quiero iniciar", "quiero empezar", "iniciar", "empezar", "listo", "lista"].some(
    (kw) => normalized === kw || normalized.includes(kw)
  );
}

export function withQuieroIniciarButton(text: string): OutboundMessage["buttons"] {
  return [QUIERO_INICIAR_BUTTON];
}
