import twilio from "twilio";
import type { WhatsAppChannel } from "../WhatsAppChannel.js";
import type { InboundMessage, OutboundMessage } from "../../types/domain.js";

/**
 * Adapter real de Twilio para WhatsApp Business API.
 *
 * Requiere en .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
 * (el sender de WhatsApp aprobado, o el número del Sandbox mientras se prueba
 * — formato "whatsapp:+14155238886", CON el prefijo "whatsapp:").
 *
 * --- Envío ---
 * Usa el Message resource de Twilio (`client.messages.create`) con `body`
 * libre. Eso cubre el 100% del flujo de Fase 1 porque todo el intercambio
 * ocurre dentro de la ventana de 24h (mensaje libre, sin costo de plantilla
 * de Meta).
 *
 * Nota sobre botones: WhatsApp/Twilio no permite adjuntar un botón táctil a
 * un mensaje de `body` libre — los Quick Replies reales requieren crear antes
 * un Content Template (Twilio Console → Messaging → Content Template Builder)
 * y enviarlo por `contentSid`. Para no bloquear Fase 1 en ese paso manual,
 * este adapter representa los "botones" como texto plano dentro del mensaje
 * (ej. "👉 Escribe *iniciar*"), y el motor de conversación ya detecta esa
 * intención por texto libre (ver conversation/messages.ts:isQuieroIniciarIntent).
 * Mejora futura: crear el Content Template con Quick Reply y cambiar
 * `sendMessage` para usar `contentSid` + `contentVariables` cuando haya botones.
 *
 * --- Webhook entrante ---
 * Twilio envía `application/x-www-form-urlencoded` (el server ya lo parsea
 * con `express.urlencoded`). Campos relevantes: `From` ("whatsapp:+57..."),
 * `Body` (texto), `ButtonText` (si vino de un Quick Reply real).
 *
 * --- Verificación de firma ---
 * Usa `twilio.validateRequest` con el Auth Token, la URL pública exacta del
 * webhook (incluyendo query params) y los parámetros recibidos.
 */
export class TwilioWhatsAppChannel implements WhatsAppChannel {
  readonly providerName = "twilio";

  private readonly client: twilio.Twilio;
  private readonly authToken: string;
  private readonly from: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !authToken || !from) {
      throw new Error(
        "Faltan TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN o TWILIO_WHATSAPP_FROM en el entorno " +
          "(ver .env.example). TWILIO_WHATSAPP_FROM debe incluir el prefijo 'whatsapp:', ej. " +
          "'whatsapp:+14155238886' (el número del Sandbox) o tu sender aprobado."
      );
    }

    this.authToken = authToken;
    this.from = from;
    this.client = twilio(accountSid, authToken);
  }

  async sendMessage(message: OutboundMessage): Promise<void> {
    const body = appendButtonsAsText(message.text, message.buttons);
    const to = message.to.startsWith("whatsapp:") ? message.to : `whatsapp:${message.to}`;

    // WhatsApp/Twilio rechaza (error 21617) cualquier body de más de 1600
    // caracteres. El mensaje del programa (conversation/messages.ts) supera
    // ese límite, así que partimos cualquier body largo en varios mensajes
    // secuenciales — esto protege también cualquier mensaje futuro largo,
    // no solo el actual. Los mensajes se envían en orden (await secuencial)
    // para que lleguen en el orden correcto a WhatsApp.
    const chunks = splitIntoWhatsAppChunks(body);
    for (const chunk of chunks) {
      await this.client.messages.create({ from: this.from, to, body: chunk });
    }
  }

  parseInboundWebhook(rawBody: unknown): InboundMessage | null {
    if (!rawBody || typeof rawBody !== "object") return null;
    const body = rawBody as Record<string, unknown>;

    // Twilio también pega a este mismo webhook los status callbacks de
    // mensajes salientes (delivered/read/failed) si se configuran así — esos
    // traen `MessageStatus` pero no `From`/`Body`. Los ignoramos aquí.
    if (typeof body.From !== "string") return null;

    const from = body.From.replace(/^whatsapp:/, "");
    // Un Quick Reply real llega con ButtonText y sin Body útil — lo tratamos
    // como el texto del mensaje para que isQuieroIniciarIntent() lo detecte
    // igual que si el creador lo hubiera escrito.
    const text = (typeof body.Body === "string" && body.Body.trim()) || (typeof body.ButtonText === "string" ? body.ButtonText : "");

    if (!text) return null;

    return { from, text, raw: rawBody };
  }

  verifyWebhookSignature(
    fullUrl: string,
    headers: Record<string, string | string[] | undefined>,
    rawBody: unknown
  ): boolean {
    const signatureHeader = headers["x-twilio-signature"];
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
    if (!signature) return false;

    const params = rawBody && typeof rawBody === "object" ? (rawBody as Record<string, string>) : {};
    return twilio.validateRequest(this.authToken, signature, fullUrl, params);
  }
}

function appendButtonsAsText(text: string, buttons: OutboundMessage["buttons"]): string {
  if (!buttons?.length) return text;
  const lines = buttons.map((b) => `👉 Escribe *${b.title.replace(/[^\p{L}\p{N}\s]/gu, "").trim()}*`);
  return `${text}\n\n${lines.join("\n")}`;
}

// Límite real de Twilio/WhatsApp es 1600; dejamos margen para no rozarlo.
const MAX_WHATSAPP_BODY_LENGTH = 1500;

/**
 * Parte un mensaje largo en varios mensajes que respetan el límite de
 * WhatsApp, intentando cortar en límites "naturales" del texto (párrafo,
 * luego línea, luego espacio) para no partir palabras ni emojis a la mitad.
 * Si el texto ya cabe en un solo mensaje, devuelve un array de un elemento.
 */
function splitIntoWhatsAppChunks(text: string): string[] {
  if (text.length <= MAX_WHATSAPP_BODY_LENGTH) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > MAX_WHATSAPP_BODY_LENGTH) {
    const window = remaining.slice(0, MAX_WHATSAPP_BODY_LENGTH);

    // Preferimos cortar en un salto de párrafo, luego un salto de línea,
    // luego un espacio; si no encontramos ninguno, cortamos duro en el límite.
    let cutIndex =
      window.lastIndexOf("\n\n") > 0
        ? window.lastIndexOf("\n\n")
        : window.lastIndexOf("\n") > 0
          ? window.lastIndexOf("\n")
          : window.lastIndexOf(" ") > 0
            ? window.lastIndexOf(" ")
            : MAX_WHATSAPP_BODY_LENGTH;

    chunks.push(remaining.slice(0, cutIndex).trimEnd());
    remaining = remaining.slice(cutIndex).trimStart();
  }

  if (remaining.length > 0) chunks.push(remaining);

  return chunks;
}
