import type { WhatsAppChannel } from "./WhatsAppChannel.js";
import { MockWhatsAppChannel } from "./adapters/mockChannel.js";
import { TwilioWhatsAppChannel } from "./adapters/twilioChannel.js";
import { Dialog360WhatsAppChannel } from "./adapters/dialog360Channel.js";
import { GupshupWhatsAppChannel } from "./adapters/gupshupChannel.js";

/**
 * Único punto donde se decide QUÉ proveedor de WhatsApp Business API se usa.
 * Cambiar de proveedor en producción = cambiar WHATSAPP_ADAPTER en el .env,
 * nada más — el motor de conversación y el servidor de webhook no cambian.
 */
export function createWhatsAppChannel(): WhatsAppChannel {
  const adapter = (process.env.WHATSAPP_ADAPTER ?? "mock").toLowerCase();

  switch (adapter) {
    case "mock":
      return new MockWhatsAppChannel();
    case "twilio":
      return new TwilioWhatsAppChannel();
    case "360dialog":
      return new Dialog360WhatsAppChannel();
    case "gupshup":
      return new GupshupWhatsAppChannel();
    default:
      throw new Error(
        `WHATSAPP_ADAPTER="${adapter}" desconocido. Usa uno de: mock | twilio | 360dialog | gupshup`
      );
  }
}
