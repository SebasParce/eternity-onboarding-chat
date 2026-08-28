import "dotenv/config";
import { app, channel } from "../app.js";

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`🚀 Webhook de onboarding escuchando en :${port} (adapter: ${channel.providerName})`);
});
