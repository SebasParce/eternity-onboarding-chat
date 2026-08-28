import express from "express";
import { createWhatsAppChannel } from "./channels/createChannel.js";
import { SupabaseCreatorRepository } from "./db/supabaseCreatorRepository.js";
import { handleInboundMessage } from "./conversation/stateMachine.js";
import { createDashboardRouter } from "./dashboard/dashboardRouter.js";

const app = express();
app.set("trust proxy", true);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const channel = createWhatsAppChannel();
const repo = new SupabaseCreatorRepository();

app.get("/health", (_req, res) => {
  res.json({ ok: true, provider: channel.providerName });
});

app.use("/dashboard", createDashboardRouter(repo, channel));

app.post("/webhook/whatsapp", async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    if (!channel.verifyWebhookSignature(fullUrl, req.headers, req.body)) {
      console.warn(`[webhook/whatsapp] Firma inválida en request de ${channel.providerName}, rechazado.`);
      res.status(403).json({ ok: false, error: "invalid_signature" });
      return;
    }

    const inbound = channel.parseInboundWebhook(req.body);

    if (!inbound) {
      res.status(200).json({ ignored: true });
      return;
    }

    await handleInboundMessage(repo, channel, inbound);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[webhook/whatsapp] Error procesando mensaje:", err);
    res.status(200).json({ ok: false, error: "internal_error" });
  }
});

export { app, channel };
export default app;
