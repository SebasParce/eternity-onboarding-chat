import type { InboundMessage, OutboundMessage } from "../types/domain.js";

/**
 * Puerto (interfaz) del canal de WhatsApp. El motor de conversación
 * (src/conversation/stateMachine.ts) SOLO conoce esta interfaz — nunca sabe
 * si detrás hay Twilio, 360dialog, Gupshup o un mock de consola. Cambiar de
 * proveedor de WhatsApp Business API es, en teoría, cambiar el adapter que
 * se instancia en src/webhook/server.ts y nada más.
 *
 * Cada adapter real es responsable de:
 *  - Traducir el payload nativo del proveedor -> InboundMessage (parseInboundWebhook)
 *  - Traducir OutboundMessage -> la llamada/API nativa del proveedor (sendMessage)
 *  - Decidir si hay que usar un mensaje libre o una plantilla aprobada por Meta,
 *    según la ventana de 24h (ver Creator.ultimo_mensaje_entrante_at)
 */
export interface WhatsAppChannel {
  /** Nombre del proveedor, útil para logs ("mock" | "twilio" | "360dialog" | "gupshup"). */
  readonly providerName: string;

  /** Envía un mensaje saliente al creador a través del proveedor real. */
  sendMessage(message: OutboundMessage): Promise<void>;

  /**
   * Parsea el body crudo del webhook HTTP del proveedor a nuestro formato
   * normalizado. Devuelve `null` si el request no es un mensaje de usuario
   * (ej. es un evento de estado de entrega, o un ping de verificación).
   */
  parseInboundWebhook(rawBody: unknown): InboundMessage | null;
}
