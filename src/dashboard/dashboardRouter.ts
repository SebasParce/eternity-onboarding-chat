import { Router } from "express";
import type { CreatorRepository } from "../db/creatorRepository.js";
import type { WhatsAppChannel } from "../channels/WhatsAppChannel.js";
import { dashboardBasicAuth } from "./basicAuth.js";
import { renderConversation, renderCreatorsList, renderNotFound } from "./render.js";

/**
 * Dashboard interno para que un manager vea los creadores registrados (con
 * nombre y @tiktok en cuanto los capturan), entre a su conversación completa
 * (incluyendo dudas escaladas), y pueda tomar el control:
 *
 *   - Enviar un mensaje directo como manager -> se manda por el mismo
 *     WhatsAppChannel real (Twilio/etc), se loguea con rol "manager", y pausa
 *     el bot automáticamente (bot_pausado = true) para que el motor deje de
 *     responder solo mientras el humano está en la conversación.
 *   - Reactivar el bot con un botón cuando el manager ya no quiere seguir
 *     respondiendo manualmente (bot_pausado = false) — el motor retoma desde
 *     la etapa actual del creador, sin perder el hilo.
 *
 * Protegido con Basic Auth (ver basicAuth.ts) porque muestra y permite
 * escribir en conversaciones reales de creadores.
 */
export function createDashboardRouter(repo: CreatorRepository, channel: WhatsAppChannel): Router {
  const router = Router();
  router.use(dashboardBasicAuth());

  router.get("/", async (_req, res) => {
    const creators = await repo.listCreators();
    res.type("html").send(renderCreatorsList(creators));
  });

  router.get("/creators/:id", async (req, res) => {
    const creator = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound());
      return;
    }

    const entries = await repo.listInteractionsForCreator(creator.id);
    res.type("html").send(renderConversation(creator, entries));
  });

  router.post("/creators/:id/send", async (req, res) => {
    const creator = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound());
      return;
    }

    const mensaje = typeof req.body?.mensaje === "string" ? req.body.mensaje.trim() : "";
    if (mensaje) {
      await channel.sendMessage({ to: creator.whatsapp_number, text: mensaje });
      await repo.logInteraction({
        creator_id: creator.id,
        rol: "manager",
        tipo: "mensaje_flujo",
        contenido: mensaje,
        etapa_en_momento: creator.etapa,
      });
      // Un manager escribiéndole directo al creador es la señal de que tomó
      // la conversación — pausamos el bot para que no se cruce respondiendo
      // algo distinto al mismo tiempo.
      await repo.update(creator.id, {
        bot_pausado: true,
        ultimo_mensaje_saliente_at: new Date().toISOString(),
      });
    }

    res.redirect(`/dashboard/creators/${creator.id}`);
  });

  router.post("/creators/:id/pause", async (req, res) => {
    const creator = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound());
      return;
    }
    await repo.update(creator.id, { bot_pausado: true });
    res.redirect(`/dashboard/creators/${creator.id}`);
  });

  router.post("/creators/:id/resume", async (req, res) => {
    const creator = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound());
      return;
    }
    await repo.update(creator.id, { bot_pausado: false });
    res.redirect(`/dashboard/creators/${creator.id}`);
  });

  return router;
}

async function findCreator(repo: CreatorRepository, id: string) {
  const creators = await repo.listCreators();
  return creators.find((c) => c.id === id) ?? null;
}
