import { Router } from "express";
import type { CreatorRepository } from "../db/creatorRepository.js";
import { dashboardBasicAuth } from "./basicAuth.js";
import { renderConversation, renderCreatorsList, renderNotFound } from "./render.js";

/**
 * Dashboard interno de solo lectura para que un manager vea los creadores
 * registrados (con nombre y @tiktok en cuanto los capturan) y el historial
 * completo de su conversación, incluyendo las dudas escaladas.
 *
 * Deliberadamente no expone ninguna acción de escritura — es un visor, no un
 * panel de administración. Protegido con Basic Auth (ver basicAuth.ts) porque
 * muestra datos personales de los creadores.
 */
export function createDashboardRouter(repo: CreatorRepository): Router {
  const router = Router();
  router.use(dashboardBasicAuth());

  router.get("/", async (_req, res) => {
    const creators = await repo.listCreators();
    res.type("html").send(renderCreatorsList(creators));
  });

  router.get("/creators/:id", async (req, res) => {
    const creators = await repo.listCreators();
    const creator = creators.find((c) => c.id === req.params.id);

    if (!creator) {
      res.status(404).type("html").send(renderNotFound());
      return;
    }

    const entries = await repo.listInteractionsForCreator(creator.id);
    res.type("html").send(renderConversation(creator, entries));
  });

  return router;
}
