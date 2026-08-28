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

/** Paleta inspirada en WhatsApp (tema oscuro), para que el dashboard se sienta como el chat real. */
const WA = {
  bg: "#0b141a",
  panel: "#111b21",
  header: "#202c33",
  headerBorder: "#2a3942",
  bubbleIn: "#202c33",
  bubbleOut: "#005c4b",
  accent: "#00a884",
  accentBright: "#25d366",
  textPrimary: "#e9edef",
  textMuted: "#8696a0",
  danger: "#e17055",
  systemPill: "#182229",
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

function avatar(nombre: string | null, whatsappNumber: string, size = 44): string {
  const color = avatarColor(whatsappNumber);
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#0b141a;font-weight:700;font-size:${
    size * 0.4
  }px;flex-shrink:0;">${esc(initials(nombre, whatsappNumber))}</div>`;
}

function stagePill(stage: CreatorStage): string {
  return `<span style="color:${WA.textMuted};">${esc(STAGE_LABELS[stage] ?? stage)}</span>`;
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

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; height: 100%; background: ${WA.bg}; color: ${WA.textPrimary};
    font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }
  a { color: inherit; text-decoration: none; }
  button { font: inherit; cursor: pointer; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

export function renderCreatorsList(creators: Creator[]): string {
  const now = Date.now();
  const rows = creators
    .map((c) => {
      const isNew = now - new Date(c.creado_at).getTime() < 24 * 60 * 60 * 1000;
      return `<a href="/dashboard/creators/${esc(c.id)}" style="display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid ${WA.headerBorder};">
        ${avatar(c.nombre, c.whatsapp_number)}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
            <span style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${isNew ? "🆕 " : ""}${esc(c.nombre) || `<span style="color:${WA.textMuted};font-weight:400;">Sin nombre todavía</span>`}
            </span>
            <span style="font-size:12px;color:${WA.textMuted};flex-shrink:0;">${esc(relativeTime(c.actualizado_at))}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:2px;">
            <span style="color:${WA.textMuted};font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${esc(c.tiktok_handle ? `@${c.tiktok_handle}` : "sin @tiktok")} · ${stagePill(c.etapa)}
            </span>
            ${
              c.bot_pausado
                ? `<span style="font-size:11px;background:#5c1f1f;color:#ffb4a8;padding:2px 8px;border-radius:999px;flex-shrink:0;">⏸ manager</span>`
                : ""
            }
          </div>
        </div>
      </a>`;
    })
    .join("\n");

  const body = `
  <div style="max-width:720px;margin:0 auto;min-height:100vh;background:${WA.panel};display:flex;flex-direction:column;">
    <div style="background:${WA.header};padding:18px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${WA.headerBorder};">
      <div>
        <div style="font-weight:700;font-size:17px;">Eternity Agency LATAM</div>
        <div style="font-size:12px;color:${WA.textMuted};">${creators.length} creador${creators.length === 1 ? "" : "es"} registrado${
    creators.length === 1 ? "" : "s"
  }</div>
      </div>
      <a href="/dashboard" title="Recargar" style="color:${WA.accentBright};font-size:20px;">↻</a>
    </div>
    <div style="flex:1;">
      ${
        creators.length === 0
          ? `<div style="padding:48px 24px;text-align:center;color:${WA.textMuted};">Todavía no hay creadores registrados.</div>`
          : rows
      }
    </div>
  </div>`;

  return layout("Dashboard — Eternity Agency", body);
}

export function renderConversation(creator: Creator, entries: InteractionLogEntry[]): string {
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

  const body = `
  <div style="max-width:720px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:${WA.bg};">
    <div style="background:${WA.header};padding:12px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid ${WA.headerBorder};">
      <a href="/dashboard" style="font-size:20px;color:${WA.textMuted};" title="Volver">←</a>
      ${avatar(creator.nombre, creator.whatsapp_number, 38)}
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${
          esc(creator.nombre) || esc(creator.whatsapp_number)
        }</div>
        <div style="font-size:12px;color:${WA.textMuted};">
          ${esc(creator.tiktok_handle ? `@${creator.tiktok_handle}` : "sin @tiktok")} ·
          <span>${esc(creator.whatsapp_number)}</span> · ${stagePill(creator.etapa)}
        </div>
      </div>
    </div>
    <div style="background:${WA.header};padding:8px 16px;display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid ${WA.headerBorder};">
      ${statusPill}
      ${toggleButton}
    </div>
    <div style="flex:1;padding:14px 16px;overflow-y:auto;">
      ${
        entries.length === 0
          ? `<div style="text-align:center;color:${WA.textMuted};padding:32px;">Todavía no hay mensajes.</div>`
          : messages
      }
    </div>
    <form method="POST" action="/dashboard/creators/${esc(creator.id)}/send" style="display:flex;gap:8px;padding:12px 16px;background:${WA.header};border-top:1px solid ${WA.headerBorder};">
      <input
        type="text"
        name="mensaje"
        placeholder="Escribe un mensaje como manager…"
        autocomplete="off"
        style="flex:1;background:${WA.headerBorder};border:none;border-radius:20px;padding:11px 16px;color:${WA.textPrimary};font-size:14px;"
      />
      <button type="submit" title="Enviar" style="background:${WA.accent};color:#03251d;border:none;width:42px;height:42px;border-radius:50%;font-size:17px;flex-shrink:0;">➤</button>
    </form>
    <div style="text-align:center;font-size:11px;color:${WA.textMuted};padding:4px 16px 10px;background:${WA.header};">
      Enviar un mensaje pausa el bot automáticamente para este creador.
    </div>
  </div>`;

  return layout(`${creator.nombre ?? creator.whatsapp_number} — Conversación`, body);
}

export function renderNotFound(): string {
  return layout(
    "No encontrado",
    `<div style="max-width:720px;margin:0 auto;padding:24px;">
      <a href="/dashboard" style="color:${WA.accentBright};">← Todos los creadores</a>
      <div style="text-align:center;color:${WA.textMuted};padding:48px;">Ese creador no existe.</div>
    </div>`
  );
}
