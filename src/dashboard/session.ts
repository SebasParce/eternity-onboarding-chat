import { randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Sesiones de login del dashboard: muy simples a propósito (una sola
 * credencial compartida, sesión en memoria del proceso). No es un sistema de
 * usuarios real — si se necesitan cuentas separadas por manager más adelante,
 * esto se reemplaza. Al reiniciar el servidor, todas las sesiones activas se
 * invalidan (hay que volver a iniciar sesión) — comportamiento aceptable para
 * un dashboard interno de Fase 1.
 */
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas
const sessions = new Map<string, number>(); // token -> expira_en (epoch ms)

export const DASHBOARD_SESSION_COOKIE = "dashboard_session";

export function createSession(): string {
  const token = randomBytes(24).toString("hex");
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token: string | undefined): void {
  if (token) sessions.delete(token);
}

/** Parseo manual del header Cookie — evita agregar la dependencia cookie-parser solo para esto. */
export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const pair of header.split(";")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) {
      try {
        out[key] = decodeURIComponent(value);
      } catch {
        out[key] = value;
      }
    }
  }
  return out;
}

/** Comparación en tiempo constante para no filtrar la credencial por timing. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  const maxLength = Math.max(bufA.length, bufB.length, 1);
  const paddedA = Buffer.concat([bufA], maxLength);
  const paddedB = Buffer.concat([bufB], maxLength);
  return timingSafeEqual(paddedA, paddedB) && bufA.length === bufB.length;
}
