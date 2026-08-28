import { Router } from "express";
import type { Creator } from "../types/domain.js";
import type { CreatorRepository } from "../db/creatorRepository.js";
import type { WhatsAppChannel } from "../channels/WhatsAppChannel.js";
import { requireDashboardSession } from "./sessionAuth.js";
import { createSession, DASHBOARD_SESSION_COOKIE, destroySession, parseCookies, safeEqual } from "./session.js";
import { renderConversation, renderCreatorsList, renderLogin, renderNotFound, renderRegistros } from "./render.js";

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
 *     respondiendo manualmente (bot_pausado = false).
 *
 * Autenticación: login con usuario/contraseña (DASHBOARD_USER/
 * DASHBOARD_PASSWORD) que crea una sesión en cookie httpOnly — ver
 * session.ts/sessionAuth.ts. Sin esas variables, el dashboard completo
 * responde 503 en vez de quedar abierto.
 */
export function createDashboardRouter(repo: CreatorRepository, channel: WhatsAppChannel): Router {
  const router = Router();

  // --- Login / logout: deben quedar FUERA del middleware de sesión, si no
  // nadie podría llegar nunca a la pantalla de login. ---
  router.get("/login", (req, res) => {
    if (!process.env.DASHBOARD_USER || !process.env.DASHBOARD_PASSWORD) {
      res
        .status(503)
        .type("text/plain")
        .send("El dashboard no está configurado: faltan DASHBOARD_USER / DASHBOARD_PASSWORD en el entorno.");
      return;
    }
    const next = typeof req.query.next === "string" ? req.query.next : undefined;
    res.type("html").send(renderLogin({ error: req.query.error === "1", next }));
  });

  router.post("/login", (req, res) => {
    const expectedUser = process.env.DASHBOARD_USER;
    const expectedPassword = process.env.DASHBOARD_PASSWORD;
    const usuario = typeof req.body?.usuario === "string" ? req.body.usuario : "";
    const contrasena = typeof req.body?.contrasena === "string" ? req.body.contrasena : "";

    if (expectedUser && expectedPassword && safeEqual(usuario, expectedUser) && safeEqual(contrasena, expectedPassword)) {
      const token = createSession();
      res.cookie(DASHBOARD_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: req.secure,
        maxAge: 12 * 60 * 60 * 1000,
        path: "/dashboard",
      });
      const next = typeof req.body?.next === "string" && req.body.next.startsWith("/dashboard") ? req.body.next : "/dashboard";
      res.redirect(next);
      return;
    }

    res.redirect("/dashboard/login?error=1");
  });

  router.post("/logout", (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    destroySession(cookies[DASHBOARD_SESSION_COOKIE]);
    res.clearCookie(DASHBOARD_SESSION_COOKIE, { path: "/dashboard" });
    res.redirect("/dashboard/login");
  });

  // --- Todo lo de abajo requiere sesión iniciada. ---
  router.use(requireDashboardSession());

  router.get("/", async (_req, res) => {
    const creators = await repo.listCreators();
    res.type("html").send(renderCreatorsList(creators));
  });

  router.get("/registros", async (_req, res) => {
    const creators = await repo.listCreators();
    res.type("html").send(renderRegistros(creators));
  });

  router.get("/creators/:id", async (req, res) => {
    const { creator, all } = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound(all));
      return;
    }

    const entries = await repo.listInteractionsForCreator(creator.id);
    res.type("html").send(renderConversation(creator, entries, all));
  });

  router.post("/creators/:id/send", async (req, res) => {
    const { creator, all } = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound(all));
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
    const { creator, all } = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound(all));
      return;
    }
    await repo.update(creator.id, { bot_pausado: true });
    res.redirect(`/dashboard/creators/${creator.id}`);
  });

  router.post("/creators/:id/resume", async (req, res) => {
    const { creator, all } = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound(all));
      return;
    }
    await repo.update(creator.id, { bot_pausado: false });
    res.redirect(`/dashboard/creators/${creator.id}`);
  });

  return router;
}

async function findCreator(
  repo: CreatorRepository,
  id: string
): Promise<{ creator: Creator | null; all: Creator[] }> {
  const all = await repo.listCreators();
  return { creator: all.find((c) => c.id === id) ?? null, all };
}
