import { Router } from "express";
import { MODULE_ORDER } from "@eternity/shared-types";
import type { Creator, ModuleKey, ModuleProgress } from "../types/domain.js";
import type { CreatorRepository } from "../db/creatorRepository.js";
import type { WhatsAppChannel } from "../channels/WhatsAppChannel.js";
import { requireDashboardSession } from "./sessionAuth.js";
import { createSession, DASHBOARD_SESSION_COOKIE, destroySession, parseCookies, safeEqual } from "./session.js";
import { renderConversation, renderCreatorsList, renderLogin, renderNotFound, renderRegistros } from "./render.js";

/** Ventana de acceso que un mentor otorga al extender un módulo vencido (horas). */
const EXTENSION_WINDOW_HOURS = 48;

function groupModulesByCreator(rows: ModuleProgress[]): Map<string, ModuleProgress[]> {
  const map = new Map<string, ModuleProgress[]>();
  for (const row of rows) {
    const list = map.get(row.creator_id) ?? [];
    list.push(row);
    map.set(row.creator_id, list);
  }
  return map;
}

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
    const moduleByCreator = groupModulesByCreator(await repo.listAllModuleProgress());
    res.type("html").send(renderCreatorsList(creators, moduleByCreator));
  });

  router.get("/registros", async (_req, res) => {
    const creators = await repo.listCreators();
    const moduleByCreator = groupModulesByCreator(await repo.listAllModuleProgress());
    res.type("html").send(renderRegistros(creators, moduleByCreator));
  });

  router.get("/creators/:id", async (req, res) => {
    const { creator, all } = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound(all));
      return;
    }

    const entries = await repo.listInteractionsForCreator(creator.id);
    const moduleProgress = await repo.listModuleProgressForCreator(creator.id);
    const setupValidations = await repo.listSetupValidationsForCreator(creator.id);
    res.type("html").send(renderConversation(creator, entries, all, moduleProgress, setupValidations));
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

  // --- Fase 2 (Academia de creadores): acciones exclusivas de un mentor.
  // Un creador nunca puede ejecutar estas tres desde apps/elearning — ahí
  // solo tiene SELECT sobre module_progress y no puede aprobar su propio
  // setup ni extenderse un módulo vencido (ver supabase/migrations y
  // apps/elearning/src/app/api/modules/complete/route.ts).

  router.post("/creators/:id/validations/:validationId/approve", async (req, res) => {
    const { creator, all } = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound(all));
      return;
    }

    const reviewedBy = process.env.DASHBOARD_USER ?? "manager";
    await repo.updateSetupValidation(req.params.validationId, {
      estado: "aprobado",
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    });

    // Aprobar el setup completa el módulo 'validacion_setup' y desbloquea
    // 'graduacion' — la misma transición que /api/modules/complete hace para
    // el resto de módulos, pero acá la dispara un humano, no el creador.
    const rows = await repo.listModuleProgressForCreator(creator.id);
    const validationModule = rows.find((m) => m.module_key === "validacion_setup");
    if (validationModule && validationModule.estado !== "completado") {
      await repo.updateModuleProgress(validationModule.id, { estado: "completado", completed_at: new Date().toISOString() });
    }
    const graduacionIdx = MODULE_ORDER.indexOf("validacion_setup") + 1;
    const graduacionKey = MODULE_ORDER[graduacionIdx] as ModuleKey | undefined;
    const graduacionModule = graduacionKey ? rows.find((m) => m.module_key === graduacionKey) : undefined;
    if (graduacionModule && graduacionModule.estado === "bloqueado") {
      await repo.updateModuleProgress(graduacionModule.id, { estado: "disponible", unlocked_at: new Date().toISOString() });
    }

    res.redirect(`/dashboard/creators/${creator.id}`);
  });

  router.post("/creators/:id/validations/:validationId/reject", async (req, res) => {
    const { creator, all } = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound(all));
      return;
    }

    const reviewedBy = process.env.DASHBOARD_USER ?? "manager";
    await repo.updateSetupValidation(req.params.validationId, {
      estado: "rechazado",
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    });

    // Vuelve a "disponible" para que el creador pueda mandar un envío nuevo
    // en vez de quedar atascado en "en revisión" para siempre.
    const rows = await repo.listModuleProgressForCreator(creator.id);
    const validationModule = rows.find((m) => m.module_key === "validacion_setup");
    if (validationModule && validationModule.estado !== "completado") {
      await repo.updateModuleProgress(validationModule.id, { estado: "disponible" });
    }

    res.redirect(`/dashboard/creators/${creator.id}`);
  });

  router.post("/creators/:id/modules/:moduleKey/extend", async (req, res) => {
    const { creator, all } = await findCreator(repo, req.params.id);
    if (!creator) {
      res.status(404).type("html").send(renderNotFound(all));
      return;
    }

    const moduleKey = req.params.moduleKey as ModuleKey;
    const rows = await repo.listModuleProgressForCreator(creator.id);
    const target = rows.find((m) => m.module_key === moduleKey);
    if (target) {
      const now = new Date();
      const newExpiry = new Date(now.getTime() + EXTENSION_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
      await repo.updateModuleProgress(target.id, {
        estado: "disponible",
        unlocked_at: now.toISOString(),
        expires_at: newExpiry,
        extended_at: now.toISOString(),
        extended_by: process.env.DASHBOARD_USER ?? "manager",
      });
    }

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
