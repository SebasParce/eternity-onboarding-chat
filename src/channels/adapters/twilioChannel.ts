import type { WhatsAppChannel } from "../WhatsAppChannel.js";
import type { InboundMessage, OutboundMessage } from "../../types/domain.js";

/**
 * Adapter para Twilio WhatsApp Business API.
 *
 * ESTADO: stub documentado, sin credenciales reales todavía (ver plan Fase 1).
 * Implementar cuando Eternity Agency LATAM tenga cuenta de Twilio + número
 * de WhatsApp aprobado por Meta.
 *
 * --- Envío (sendMessage) ---
 * Usar el SDK oficial `twilio` (no incluido aún en package.json):
 *   npm install twilio
 *   const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
 *   await client.messages.create({
 *     from: process.env.TWILIO_WHATSAPP_FROM,     // "whatsapp:+1415XXXXXXX"
 *     to: `whatsapp:${message.to}`,
 *     body: message.text,
 *     // Fuera de la ventana de 24h, en vez de `body` libre hay que usar
 *     // `contentSid` + `contentVariables` apuntando a una plantilla aprobada.
 *   });
 * Twilio no soporta botones interactivos nativos como Gupshup/360dialog en
 * todos los tiers — para "Quiero iniciar" se puede usar un Quick Reply de
 * WhatsApp vía Content API, o pedirle al creador que responda con la palabra
 * "iniciar" (el matcher de intención en conversation/messages.ts ya lo cubre).
 *
 * --- Webhook entrante (parseInboundWebhook) ---
 * Twilio envía application/x-www-form-urlencoded (no JSON) con campos como:
 *   { From: "whatsapp:+573001234567", Body: "hola", ButtonText?: "..." }
 * Hay que:
 *   1. Configurar el server (ver webhook/server.ts) para parsear urlencoded
 *      en la ruta de Twilio.
 *   2. Validar la firma del request con `twilio.validateRequest(...)` usando
 *      TWILIO_AUTH_TOKEN antes de confiar en el payload.
 */
export class TwilioWhatsAppChannel implements WhatsAppChannel {
  readonly providerName = "twilio";

  async sendMessage(_message: OutboundMessage): Promise<void> {
    throw new Error(
      "TwilioWhatsAppChannel.sendMessage no implementado todavía — falta cuenta/credenciales de Twilio. " +
        "Ver comentarios de este archivo para la integración real."
    );
  }

  parseInboundWebhook(_rawBody: unknown): InboundMessage | null {
    throw new Error(
      "TwilioWhatsAppChannel.parseInboundWebhook no implementado todavía — el payload de Twilio " +
        "es application/x-www-form-urlencoded, no JSON. Ver comentarios de este archivo."
    );
  }
}
