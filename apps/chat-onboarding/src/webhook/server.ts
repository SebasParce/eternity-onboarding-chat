import "dotenv/config";
import express from "express";
import { createWhatsAppChannel } from "../channels/createChannel.js";
import { SupabaseCreatorRepository } from "../db/supabaseCreatorRepository.js";
import { handleInboundMessage } from "../conversation/stateMachine.js";
import { createDashboardRouter } from "../dashboard/dashboardRouter.js";

/**
 * Punto de integración con WhatsApp Business API.
 *
 * Hoy (Fase 1, sin credenciales reales): WHATSAPP_ADAPTER=mock en .env, y
 * puedes probar el flujo completo con:
 *
 *   curl -X POST http://localhost:3000/webhook/whatsapp \
 *     -H "Content-Type: application/json" \
 *     -d '{"from": "+573001234567", "text": "hola"}'
 *
 * Cuando haya cuenta real de Twilio/360dialog/Gupshup:
 *   1. Configurar WHATSAPP_ADAPTER + las credenciales del proveedor en .env
 *   2. Registrar esta URL (https://tu-dominio.com/webhook/whatsapp) como el
 *      webhook del proveedor en su panel / API de configuración.
 *   3. Implementar el adapter real correspondiente en src/channels/adapters/
 *      (los stubs ya documentan la forma exacta del payload de cada uno).
 *   4. Si el proveedor requiere un handshake de verificación por GET (Meta
 *      Cloud API / 360dialog lo piden), agregar esa ruta GET aquí mismo.
 */

const app = express();
// Necesario para que req.protocol/req.get('host') reflejen la URL pública
// real (https, dominio público) cuando el server corre detrás de un proxy/CDN
// (Vercel, ngrok, un load balancer) — si no, la validación de firma de Twilio
// falla porque la URL que reconstruimos no coincide con la que Twilio firmó.
app.set("trust proxy", true);

// Twilio manda application/x-www-form-urlencoded; Meta Cloud API/360dialog y
// Gupshup mandan JSON. El mock de pruebas también usa JSON. Con ambos
// middlewares montados, Express usa el que matchee el Content-Type real.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const channel = createWhatsAppChannel();
const repo = new SupabaseCreatorRepository();

app.get("/health", (_req, res) => {
  res.json({ ok: true, provider: channel.providerName });
});

// Dashboard interno para managers (ver src/dashboard/) — login con sesión en
// cookie (DASHBOARD_USER/DASHBOARD_PASSWORD en .env). Sin esas variables, el
// dashboard responde 503 en vez de quedar abierto.
app.use("/dashboard", createDashboardRouter(repo, channel));

app.post("/webhook/whatsapp", async (req, res) => {
  try {
    // Construye la URL pública exacta que el proveedor usó para firmar el
    // request. Detrás de un proxy/CDN (Vercel, ngrok, etc.) esto depende de
    // que 'trust proxy' esté configurado correctamente (ver abajo) para que
    // req.protocol/req.get('host') reflejen la URL pública real, no la interna.
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    if (!channel.verifyWebhookSignature(fullUrl, req.headers, req.body)) {
      console.warn(`[webhook/whatsapp] Firma inválida en request de ${channel.providerName}, rechazado.`);
      res.status(403).json({ ok: false, error: "invalid_signature" });
      return;
    }

    const inbound = channel.parseInboundWebhook(req.body);

    // No todo lo que llega al webhook es un mensaje de usuario (ej. eventos de
    // estado de entrega, pings de verificación). En esos casos no hacemos nada,
    // pero igual respondemos 200 para que el proveedor no reintente el request.
    if (!inbound) {
      res.status(200).json({ ignored: true });
      return;
    }

    await handleInboundMessage(repo, channel, inbound);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[webhook/whatsapp] Error procesando mensaje:", err);
    // Respondemos 200 igual: la mayoría de proveedores de WhatsApp reintentan
    // agresivamente ante un error 5xx, lo que puede duplicar mensajes al
    // creador. Preferimos loguear el error y seguir; ver interaction_log/
    // logs del server para depurar.
    res.status(200).json({ ok: false, error: "internal_error" });
  }
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`🚀 Webhook de onboarding escuchando en :${port} (adapter: ${channel.providerName})`);
});
