import type { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";

/**
 * Autenticación HTTP Basic muy simple para proteger el dashboard interno.
 *
 * El dashboard muestra datos personales de los creadores (nombre, número de
 * WhatsApp, contenido de sus mensajes), así que no puede quedar abierto en la
 * URL pública (ngrok hoy, el dominio de producción después). No es un sistema
 * de usuarios real — es una sola credencial compartida (usuario/contraseña en
 * variables de entorno), suficiente para Fase 1. Si en el futuro varios
 * managers necesitan cuentas separadas, esto se reemplaza por un login real.
 *
 * Si DASHBOARD_USER/DASHBOARD_PASSWORD no están configurados, el middleware
 * bloquea el acceso por completo (nunca lo deja abierto "por defecto").
 */
export function dashboardBasicAuth() {
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

    const header = req.headers.authorization ?? "";
    const [scheme, encoded] = header.split(" ");

    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf8");
      const separatorIndex = decoded.indexOf(":");
      const user = separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : decoded;
      const password = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : "";

      if (safeEqual(user, expectedUser) && safeEqual(password, expectedPassword)) {
        next();
        return;
      }
    }

    res.set("WWW-Authenticate", 'Basic realm="Dashboard Eternity Agency"');
    res.status(401).type("text/plain").send("Autenticación requerida.");
  };
}

/** Comparación en tiempo constante para no filtrar la credencial por timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Igualamos longitudes con padding antes de comparar: timingSafeEqual exige
  // buffers del mismo tamaño, y no queremos filtrar la longitud real tampoco
  // más de lo que ya se filtra por naturaleza de este esquema simple.
  const maxLength = Math.max(bufA.length, bufB.length, 1);
  const paddedA = Buffer.concat([bufA], maxLength);
  const paddedB = Buffer.concat([bufB], maxLength);
  return timingSafeEqual(paddedA, paddedB) && bufA.length === bufB.length;
}
