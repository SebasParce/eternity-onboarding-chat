import type { NextFunction, Request, Response } from "express";
import { DASHBOARD_SESSION_COOKIE, isValidSession, parseCookies } from "./session.js";

/**
 * Exige una sesión de dashboard válida (cookie httpOnly). Si no hay
 * DASHBOARD_USER/DASHBOARD_PASSWORD configurados, bloquea todo el dashboard
 * con 503 en vez de dejarlo abierto — igual que antes con Basic Auth.
 */
export function requireDashboardSession() {
  const expectedUser = process.env.DASHBOARD_USER;
  const expectedPassword = process.env.DASHBOARD_PASSWORD;

  return (req: Request, res: Response, next: NextFunction) => {
    if (!expectedUser || !expectedPassword) {
      res
        .status(503)
        .type("text/plain")
        .send(
          "El dashboard no está configurado: faltan DASHBOARD_USER / DASHBOARD_PASSWORD en el entorno " +
            "(ver .env.example). Por seguridad, el dashboard no se habilita sin esas credenciales."
        );
      return;
    }

    const cookies = parseCookies(req.headers.cookie);
    if (isValidSession(cookies[DASHBOARD_SESSION_COOKIE])) {
      next();
      return;
    }

    const next_ = encodeURIComponent(req.originalUrl);
    res.redirect(`/dashboard/login?next=${next_}`);
  };
}
