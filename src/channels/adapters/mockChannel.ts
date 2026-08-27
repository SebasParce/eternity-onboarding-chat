import type { WhatsAppChannel } from "../WhatsAppChannel.js";
import type { InboundMessage, OutboundMessage } from "../../types/domain.js";

/**
 * Adapter mock: no llama a ningún proveedor real. Imprime en consola lo que
 * se "enviaría" por WhatsApp. Permite probar el flujo completo (webhook ->
 * motor -> respuesta) hoy mismo, sin credenciales de Twilio/360dialog/Gupshup.
 *
 * También se usa en scripts/simulate-conversation.ts, capturando los mensajes
 * enviados en un arreglo en vez de solo imprimirlos, para poder hacer
 * aserciones sobre la conversación simulada.
 */
export class MockWhatsAppChannel implements WhatsAppChannel {
  readonly providerName = "mock";
  public readonly sentMessages: OutboundMessage[] = [];

  async sendMessage(message: OutboundMessage): Promise<void> {
    this.sentMessages.push(message);
    const botones = message.buttons?.length
      ? `\n   [botones: ${message.buttons.map((b) => b.title).join(" | ")}]`
      : "";
    console.log(`\n📤 [mock -> ${message.to}]\n${message.text}${botones}\n`);
  }

  /**
   * Formato de entrada esperado en este mock (pensado para pruebas manuales
   * vía curl, no es el payload real de ningún proveedor):
   *   { "from": "+573001234567", "text": "hola", "interactiveId": "quiero_iniciar" }
   */
  parseInboundWebhook(rawBody: unknown): InboundMessage | null {
    if (!rawBody || typeof rawBody !== "object") return null;
    const body = rawBody as Record<string, unknown>;
    if (typeof body.from !== "string" || typeof body.text !== "string") return null;

    return {
      from: body.from,
      text: body.text,
      interactiveId: typeof body.interactiveId === "string" ? body.interactiveId : undefined,
      raw: rawBody,
    };
  }
}
