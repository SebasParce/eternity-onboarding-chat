import type { WhatsAppChannel } from "../WhatsAppChannel.js";
import type { InboundMessage, OutboundMessage } from "../../types/domain.js";

/**
 * Adapter para Gupshup (WhatsApp Business API).
 *
 * ESTADO: stub documentado, sin credenciales reales todavía (ver plan Fase 1).
 *
 * --- Envío (sendMessage) ---
 *   POST https://api.gupshup.io/wa/api/v1/msg
 *   headers: { apikey: GUPSHUP_API_KEY, "Content-Type": "application/x-www-form-urlencoded" }
 *   body (form-urlencoded): {
 *     channel: "whatsapp",
 *     source: GUPSHUP_SOURCE_NUMBER,
 *     destination: message.to,
 *     "src.name": GUPSHUP_APP_NAME,
 *     message: JSON.stringify({ type: "text", text: message.text }),
 *   }
 * Para botones, `message` cambia a un objeto type "quick_reply". Fuera de la
 * ventana de 24h, usar el endpoint de plantillas (`/template/msg`) con el id
 * de la plantilla aprobada por Meta.
 *
 * --- Webhook entrante (parseInboundWebhook) ---
 * Gupshup envía JSON con esta forma aproximada:
 *   {
 *     type: "message",
 *     payload: {
 *       source: "573001234567",
 *       payload: { text: "hola" },        // o { id: "quiero_iniciar", title: "..." } si es botón
 *       sender: { phone: "573001234567" },
 *     }
 *   }
 * El campo exacto depende de si es texto plano o respuesta a un quick reply
 * — validar contra el payload real antes de confiar en esta forma.
 */
export class GupshupWhatsAppChannel implements WhatsAppChannel {
  readonly providerName = "gupshup";

  async sendMessage(_message: OutboundMessage): Promise<void> {
    throw new Error(
      "GupshupWhatsAppChannel.sendMessage no implementado todavía — falta cuenta/credenciales de Gupshup. " +
        "Ver comentarios de este archivo para la integración real."
    );
  }

  parseInboundWebhook(_rawBody: unknown): InboundMessage | null {
    throw new Error(
      "GupshupWhatsAppChannel.parseInboundWebhook no implementado todavía. Ver comentarios de este archivo."
    );
  }

  verifyWebhookSignature(
    _fullUrl: string,
    _headers: Record<string, string | string[] | undefined>,
    _rawBody: unknown
  ): boolean {
    // Gupshup no firma sus webhooks por defecto. La mitigación recomendada es
    // usar una URL de webhook con un token secreto en la query string y
    // compararlo aquí, en vez de validar una firma que no existe.
    throw new Error(
      "GupshupWhatsAppChannel.verifyWebhookSignature no implementado todavía. Ver comentarios de este archivo."
    );
  }
}
