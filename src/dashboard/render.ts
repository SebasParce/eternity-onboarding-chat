import type { Creator, CreatorStage, InteractionLogEntry } from "../types/domain.js";

/**
 * Todo lo que llega a estas plantillas puede venir de lo que un creador
 * escribió por WhatsApp (nombre, @tiktok, contenido de mensajes) — nunca es
 * seguro insertarlo directo en HTML. `esc()` se usa en cada interpolación de
 * texto que pueda venir de un usuario, para evitar XSS almacenado.
 */
function esc(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const STAGE_LABELS: Record<CreatorStage, string> = {
  nuevo: "Nuevo",
  nombre_recibido: "Nombre recibido",
  handle_recibido: "@TikTok recibido",
  programa_enviado: "Programa enviado",
  resolviendo_dudas: "Resolviendo dudas (FAQ)",
  quiere_iniciar: "Quiere iniciar",
  derivado_elearning: "Derivado a e-learning",
  en_programa_4_dias: "En programa (4 días)",
  revision_dia_5: "Revisión día 5",
  ingreso_oficial: "Ingreso oficial ✅",
  no_completado: "No completado",
};

const STAGE_COLORS: Partial<Record<CreatorStage, string>> = {
  nuevo: "#8696a0",
  nombre_recibido: "#8696a0",
  handle_recibido: "#8696a0",
  programa_enviado: "#53bdeb",
  resolviendo_dudas: "#ffb454",
  quiere_iniciar: "#a78bfa",
  derivado_elearning: "#25d366",
  en_programa_4_dias: "#25d366",
  revision_dia_5: "#25d366",
  ingreso_oficial: "#25d366",
  no_completado: "#e17055",
};

/** Paleta de colores de WhatsApp (tema oscuro) aplicada a un layout de dashboard normal. */
const WA = {
  bg: "#0b141a",
  sidebar: "#111b21",
  panel: "#182229",
  header: "#202c33",
  headerBorder: "#2a3942",
  bubbleIn: "#202c33",
  bubbleOut: "#005c4b",
  accent: "#00a884",
  accentBright: "#25d366",
  textPrimary: "#e9edef",
  textMuted: "#8696a0",
  systemPill: "#202c33",
};

const AVATAR_COLORS = ["#f97316", "#a855f7", "#0ea5e9", "#22c55e", "#ec4899", "#eab308", "#6366f1"];

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(nombre: string | null, whatsappNumber: string): string {
  if (nombre?.trim()) {
    const parts = nombre.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return whatsappNumber.slice(-2);
}

function avatar(nombre: string | null, whatsappNumber: string, size = 40): string {
  const color = avatarColor(whatsappNumber);
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#0b141a;font-weight:700;font-size:${
    size * 0.4
  }px;flex-shrink:0;">${esc(initials(nombre, whatsappNumber))}</div>`;
}

function stageBadge(stage: CreatorStage): string {
  const color = STAGE_COLORS[stage] ?? WA.textMuted;
  return `<span style="display:inline-block;font-size:12px;font-weight:600;color:${color};background:${color}1f;border:1px solid ${color}44;padding:2px 9px;border-radius:999px;white-space:nowrap;">${esc(
    STAGE_LABELS[stage] ?? stage
  )}</span>`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `${diffD} d`;
}

function timeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Shell general del dashboard: menú lateral fijo + área de contenido. Se
 * mantiene la paleta de colores de WhatsApp, pero la estructura es la de un
 * panel de administración normal (sidebar + contenido), no la del chat.
 */
function dashboardShell(title: string, creators: Creator[], mainContent: string): string {
  const now = Date.now();
  const totalCount = creators.length;
  const nuevosCount = creators.filter((c) => now - new Date(c.creado_at).getTime() < 24 * 60 * 60 * 1000).length;
  const pausadosCount = creators.filter((c) => c.bot_pausado).length;

  const statRow = (label: string, value: number, color: string) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 14px;">
      <span style="font-size:13px;color:${WA.textMuted};">${esc(label)}</span>
      <span style="font-size:14px;font-weight:700;color:${color};">${value}</span>
    </div>`;

  const sidebar = `
  <div style="width:250px;flex-shrink:0;background:${WA.sidebar};border-right:1px solid ${WA.headerBorder};display:flex;flex-direction:column;height:100vh;position:sticky;top:0;">
    <div style="display:flex;align-items:center;gap:10px;padding:20px 18px;border-bottom:1px solid ${WA.headerBorder};">
      <div style="width:36px;height:36px;border-radius:10px;background:${WA.accent};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">💚</div>
      <div style="min-width:0;">
        <div style="font-weight:700;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Eternity Agency</div>
        <div style="font-size:11.5px;color:${WA.textMuted};">LATAM · Fase 1</div>
      </div>
    </div>

    <div style="padding:16px 10px 6px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${WA.textMuted};padding:0 8px 8px;">Menú</div>
      <a href="/dashboard" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:${WA.accent}22;color:${WA.textPrimary};border-left:3px solid ${WA.accent};font-weight:600;font-size:13.5px;">
        💬 Conversaciones
      </a>
    </div>

    <div style="margin:10px 10px 0;background:${WA.panel};border-radius:10px;border:1px solid ${WA.headerBorder};overflow:hidden;">
      <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${WA.textMuted};padding:10px 14px 2px;">Resumen</div>
      ${statRow("Creadores totales", totalCount, WA.textPrimary)}
      ${statRow("Nuevos (24h)", nuevosCount, WA.accentBright)}
      ${statRow("Bot en pausa", pausadosCount, pausadosCount > 0 ? "#ffb454" : WA.textMuted)}
    </div>

    <div style="margin-top:auto;padding:14px 18px;font-size:11px;color:${WA.textMuted};border-top:1px solid ${WA.headerBorder};">
      Dashboard interno · solo lectura de conversaciones + respuesta manual
    </div>
  </div>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; background: ${WA.bg}; color: ${WA.textPrimary};
    font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }
  a { color: inherit; text-decoration: none; }
  button { font: inherit; cursor: pointer; }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: ${WA.headerBorder}; border-radius: 6px; }
</style>
</head>
<body>
  <div style="display:flex;min-height:100vh;">
    ${sidebar}
    <div style="flex:1;min-width:0;">
      ${mainContent}
    </div>
  </div>
</body>
</html>`;
}

export function renderCreatorsList(creators: Creator[]): string {
  const now = Date.now();
  const rows = creators
    .map((c) => {
      const isNew = now - new Date(c.creado_at).getTime() < 24 * 60 * 60 * 1000;
      return `<tr style="border-bottom:1px solid ${WA.headerBorder};">
        <td style="padding:12px 16px;">
          <a href="/dashboard/creators/${esc(c.id)}" style="display:flex;align-items:center;gap:12px;">
            ${avatar(c.nombre, c.whatsapp_number)}
            <span style="font-weight:600;">${isNew ? "🆕 " : ""}${
              esc(c.nombre) || `<span style="color:${WA.textMuted};font-weight:400;">Sin nombre todavía</span>`
            }</span>
          </a>
        </td>
        <td style="padding:12px 16px;color:${WA.textMuted};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;">
          ${esc(c.tiktok_handle ? `@${c.tiktok_handle}` : "—")}
        </td>
        <td style="padding:12px 16px;color:${WA.textMuted};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;">
          ${esc(c.whatsapp_number)}
        </td>
        <td style="padding:12px 16px;">${stageBadge(c.etapa)}</td>
        <td style="padding:12px 16px;">
          ${
            c.bot_pausado
              ? `<span style="font-size:12px;color:#ffb454;">⏸ manager</span>`
              : `<span style="font-size:12px;color:${WA.textMuted};">🤖 auto</span>`
          }
        </td>
        <td style="padding:12px 16px;color:${WA.textMuted};font-size:13px;white-space:nowrap;">${esc(relativeTime(c.actualizado_at))}</td>
        <td style="padding:12px 16px;text-align:right;">
          <a href="/dashboard/creators/${esc(c.id)}" style="color:${WA.accentBright};font-size:13px;font-weight:600;">Ver conversación →</a>
        </td>
      </tr>`;
    })
    .join("\n");

  const main = `
    <div style="padding:28px 32px;max-width:1200px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:22px;">
        <div>
          <h1 style="margin:0 0 4px;font-size:22px;">Creadores</h1>
          <p style="margin:0;color:${WA.textMuted};font-size:13.5px;">${creators.length} registrado${creators.length === 1 ? "" : "s"} · los más recientes primero</p>
        </div>
        <a href="/dashboard" style="color:${WA.accentBright};font-size:13.5px;">↻ Recargar</a>
      </div>

      <div style="background:${WA.panel};border:1px solid ${WA.headerBorder};border-radius:12px;overflow:hidden;">
        ${
          creators.length === 0
            ? `<div style="padding:56px 24px;text-align:center;color:${WA.textMuted};">Todavía no hay creadores registrados.</div>`
            : `<div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;">
                  <thead>
                    <tr style="border-bottom:1px solid ${WA.headerBorder};">
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">Creador</th>
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">@TikTok</th>
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">WhatsApp</th>
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">Etapa</th>
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">Responde</th>
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">Actividad</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>`
        }
      </div>
    </div>`;

  return dashboardShell("Dashboard — Eternity Agency", creators, main);
}

export function renderConversation(creator: Creator, entries: InteractionLogEntry[], allCreators: Creator[]): string {
  const messages = entries
    .map((e) => {
      if (e.tipo === "evento_sistema") {
        return `<div style="display:flex;justify-content:center;margin:10px 0;">
          <div style="background:${WA.systemPill};color:${WA.textMuted};font-size:12.5px;padding:6px 14px;border-radius:8px;max-width:85%;text-align:center;">
            ${esc(e.contenido)}
          </div>
        </div>`;
      }

      const isOutgoing = e.rol === "sistema" || e.rol === "manager";
      const roleTag =
        e.rol === "manager"
          ? `<div style="font-size:11.5px;font-weight:700;color:${WA.accentBright};margin-bottom:2px;">Tú (manager)</div>`
          : e.rol === "sistema"
            ? `<div style="font-size:11.5px;font-weight:700;color:${WA.accent};margin-bottom:2px;">Bot</div>`
            : "";

      return `<div style="display:flex;justify-content:${isOutgoing ? "flex-end" : "flex-start"};margin:3px 0;">
        <div style="max-width:70%;background:${isOutgoing ? WA.bubbleOut : WA.bubbleIn};padding:7px 10px 6px;border-radius:9px;${
          isOutgoing ? "border-top-right-radius:2px;" : "border-top-left-radius:2px;"
        }box-shadow:0 1px 1px rgba(0,0,0,0.3);">
          ${roleTag}
          <div style="white-space:pre-wrap;word-break:break-word;">${esc(e.contenido)}</div>
          <div style="text-align:right;font-size:11px;color:${WA.textMuted};margin-top:2px;">${esc(timeOnly(e.creado_at))}</div>
        </div>
      </div>`;
    })
    .join("\n");

  const statusPill = creator.bot_pausado
    ? `<span style="font-size:12px;background:#5c1f1f;color:#ffb4a8;padding:3px 10px;border-radius:999px;">⏸ Bot en pausa — respondes tú</span>`
    : `<span style="font-size:12px;background:#0f3d33;color:${WA.accentBright};padding:3px 10px;border-radius:999px;">🟢 Bot activo</span>`;

  const toggleButton = creator.bot_pausado
    ? `<form method="POST" action="/dashboard/creators/${esc(creator.id)}/resume">
         <button type="submit" style="background:${WA.accent};color:#03251d;border:none;padding:7px 14px;border-radius:8px;font-weight:700;">▶ Reactivar bot</button>
       </form>`
    : `<form method="POST" action="/dashboard/creators/${esc(creator.id)}/pause">
         <button type="submit" style="background:transparent;color:${WA.textMuted};border:1px solid ${WA.headerBorder};padding:7px 14px;border-radius:8px;">⏸ Pausar bot</button>
       </form>`;

  const main = `
    <div style="padding:28px 32px;max-width:1200px;">
      <a href="/dashboard" style="display:inline-block;margin-bottom:16px;color:${WA.textMuted};font-size:13px;">← Todos los creadores</a>

      <div style="background:${WA.panel};border:1px solid ${WA.headerBorder};border-radius:12px;overflow:hidden;max-width:760px;">
        <div style="padding:14px 18px;display:flex;align-items:center;gap:12px;border-bottom:1px solid ${WA.headerBorder};">
          ${avatar(creator.nombre, creator.whatsapp_number, 42)}
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${
              esc(creator.nombre) || esc(creator.whatsapp_number)
            }</div>
            <div style="font-size:12.5px;color:${WA.textMuted};">
              ${esc(creator.tiktok_handle ? `@${creator.tiktok_handle}` : "sin @tiktok")} ·
              <span>${esc(creator.whatsapp_number)}</span> · ${stageBadge(creator.etapa)}
            </div>
          </div>
        </div>

        <div style="padding:10px 18px;display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid ${WA.headerBorder};background:${WA.header}55;">
          ${statusPill}
          ${toggleButton}
        </div>

        <div style="padding:16px 18px;max-height:60vh;overflow-y:auto;background:${WA.bg};">
          ${
            entries.length === 0
              ? `<div style="text-align:center;color:${WA.textMuted};padding:32px;">Todavía no hay mensajes.</div>`
              : messages
          }
        </div>

        <form method="POST" action="/dashboard/creators/${esc(creator.id)}/send" style="display:flex;gap:8px;padding:14px 18px;border-top:1px solid ${WA.headerBorder};">
          <input
            type="text"
            name="mensaje"
            placeholder="Escribe un mensaje como manager…"
            autocomplete="off"
            style="flex:1;background:${WA.header};border:1px solid ${WA.headerBorder};border-radius:20px;padding:10px 16px;color:${WA.textPrimary};font-size:14px;"
          />
          <button type="submit" title="Enviar" style="background:${WA.accent};color:#03251d;border:none;width:40px;height:40px;border-radius:50%;font-size:16px;flex-shrink:0;">➤</button>
        </form>
      </div>
      <p style="max-width:760px;font-size:11.5px;color:${WA.textMuted};margin-top:8px;">
        Enviar un mensaje pausa el bot automáticamente para este creador.
      </p>
    </div>`;

  return dashboardShell(`${creator.nombre ?? creator.whatsapp_number} — Conversación`, allCreators, main);
}

export function renderNotFound(creators: Creator[]): string {
  const main = `
    <div style="padding:28px 32px;">
      <a href="/dashboard" style="color:${WA.accentBright};font-size:13.5px;">← Todos los creadores</a>
      <div style="text-align:center;color:${WA.textMuted};padding:64px 24px;">Ese creador no existe.</div>
    </div>`;
  return dashboardShell("No encontrado", creators, main);
}
