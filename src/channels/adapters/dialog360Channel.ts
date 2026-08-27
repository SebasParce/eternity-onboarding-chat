import type { WhatsAppChannel } from "../WhatsAppChannel.js";
import type { InboundMessage, OutboundMessage } from "../../types/domain.js";

/**
 * Adapter para 360dialog (WhatsApp Business API, integración directa con Meta Cloud API).
 *
 * ESTADO: stub documentado, sin credenciales reales todavía (ver plan Fase 1).
 *
 * --- Envío (sendMessage) ---
 * 360dialog expone (casi) la Cloud API de Meta tal cual, vía REST:
 *   POST {DIALOG360_BASE_URL}/v1/messages
 *   headers: { "D360-API-KEY": DIALOG360_API_KEY, "Content-Type": "application/json" }
 *   body: {
 *     to: message.to,                 // sin "whatsapp:" prefix, solo E.164
 *     type: "text",
 *     text: { body: message.text },
 *   }
 * Para botones interactivos (ej. "Quiero iniciar"), usar type "interactive"
 * con "action.buttons" (reply buttons nativos de WhatsApp, hasta 3 por mensaje).
 * Fuera de la ventana de 24h, cambiar a type "template" con el nombre de la
 * plantilla ya aprobada por Meta.
 *
 * --- Webhook entrante (parseInboundWebhook) ---
 * 360dialog reenvía el formato nativo de Meta Cloud API:
 *   body.entry[0].changes[0].value.messages[0] = {
 *     from: "573001234567",           // sin "+"
 *     text: { body: "hola" },
 *     interactive?: { button_reply: { id: "quiero_iniciar", title: "..." } },
 *     timestamp: "1699999999",
 *   }
 * Ojo: el número no trae "+" — hay que normalizarlo a E.164 (agregar "+")
 * antes de usarlo como whatsapp_number en creators.
 */
export class Dialog360WhatsAppChannel implements WhatsAppChannel {
  readonly providerName = "360dialog";

  async sendMessage(_message: OutboundMessage): Promise<void> {
    throw new Error(
      "Dialog360WhatsAppChannel.sendMessage no implementado todavía — falta cuenta/credenciales de 360dialog. " +
        "Ver comentarios de este archivo para la integración real."
    );
  }

  parseInboundWebhook(_rawBody: unknown): InboundMessage | null {
    throw new Error(
      "Dialog360WhatsAppChannel.parseInboundWebhook no implementado todavía. " +
        "El payload sigue el formato de Meta Cloud API — ver comentarios de este archivo."
    );
  }

  verifyWebhookSignature(
    _fullUrl: string,
    _headers: Record<string, string | string[] | undefined>,
    _rawBody: unknown
  ): boolean {
    throw new Error(
      "Dialog360WhatsAppChannel.verifyWebhookSignature no implementado todavía — 360dialog/Meta Cloud API " +
        "firma con HMAC-SHA256 sobre el raw body (header 'X-Hub-Signature-256'), similar a Twilio pero con SHA-256."
    );
  }
}
