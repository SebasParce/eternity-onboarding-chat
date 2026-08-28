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

/**
 * El embudo real del negocio, en 5 momentos simples (lo que pidió Sebas):
 * registrando -> en preguntas -> ya aceptó -> módulo educativo, más "no
 * completó" para las etapas de abandono. Cada etapa técnica (CreatorStage)
 * cae en exactamente uno de estos baldes.
 */
type FunnelBucket = "registrando" | "preguntas" | "acepto" | "modulo" | "no_completado";

const FUNNEL_BY_STAGE: Record<CreatorStage, FunnelBucket> = {
  nuevo: "registrando",
  nombre_recibido: "registrando",
  handle_recibido: "registrando",
  programa_enviado: "preguntas",
  resolviendo_dudas: "preguntas",
  quiere_iniciar: "acepto",
  derivado_elearning: "acepto",
  en_programa_4_dias: "modulo",
  revision_dia_5: "modulo",
  ingreso_oficial: "modulo",
  no_completado: "no_completado",
};

const FUNNEL_INFO: Record<FunnelBucket, { label: string; color: string; bg: string }> = {
  registrando: { label: "📝 Registrando", color: "#667781", bg: "#eef0f1" },
  preguntas: { label: "💬 En preguntas", color: "#b45309", bg: "#fef3e2" },
  acepto: { label: "✅ Ya aceptó", color: "#7c3aed", bg: "#f1e9fe" },
  modulo: { label: "🎓 Módulo educativo", color: "#008069", bg: "#d9fdd3" },
  no_completado: { label: "✖ No completó", color: "#dc2626", bg: "#fde2e1" },
};

function funnelBadge(stage: CreatorStage): string {
  const info = FUNNEL_INFO[FUNNEL_BY_STAGE[stage]];
  return `<span style="display:inline-block;font-size:12px;font-weight:600;color:${info.color};background:${info.bg};padding:3px 10px;border-radius:999px;white-space:nowrap;">${esc(
    info.label
  )}</span>`;
}

/** Paleta de WhatsApp en su tema claro (fondo blanco, verde de marca, burbujas claras). */
const WA = {
  bg: "#f0f2f5",
  sidebar: "#ffffff",
  panel: "#ffffff",
  header: "#f7f8fa",
  headerBorder: "#e9edef",
  bubbleIn: "#ffffff",
  bubbleInBorder: "#e9edef",
  bubbleOut: "#d9fdd3",
  accent: "#00a884",
  accentBright: "#008069",
  textPrimary: "#111b21",
  textMuted: "#667781",
  systemPill: "#eef0f1",
};

const AVATAR_COLORS = ["#f97316", "#a855f7", "#0ea5e9", "#22c55e", "#ec4899", "#ca8a04", "#6366f1"];

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
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${
    size * 0.4
  }px;flex-shrink:0;">${esc(initials(nombre, whatsappNumber))}</div>`;
}

function stageBadge(stage: CreatorStage): string {
  return `<span style="font-size:12.5px;color:${WA.textMuted};">${esc(STAGE_LABELS[stage] ?? stage)}</span>`;
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

function fullDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

type ActiveNav = "conversaciones" | "registros";

/**
 * Shell general del dashboard: menú lateral fijo + área de contenido, tema
 * claro con los colores de WhatsApp. Se usa en todas las páginas que
 * requieren sesión iniciada (Conversaciones, Registros, conversación 1-a-1).
 */
function dashboardShell(title: string, creators: Creator[], mainContent: string, active: ActiveNav): string {
  const now = Date.now();
  const totalCount = creators.length;
  const nuevosCount = creators.filter((c) => now - new Date(c.creado_at).getTime() < 24 * 60 * 60 * 1000).length;
  const pausadosCount = creators.filter((c) => c.bot_pausado).length;

  const statRow = (label: string, value: number, color: string) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 14px;">
      <span style="font-size:13px;color:${WA.textMuted};">${esc(label)}</span>
      <span style="font-size:14px;font-weight:700;color:${color};">${value}</span>
    </div>`;

  const navLink = (href: string, icon: string, label: string, key: ActiveNav) => {
    const isActive = active === key;
    return `<a href="${href}" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;${
      isActive
        ? `background:${WA.accent}1f;color:${WA.accentBright};border-left:3px solid ${WA.accent};font-weight:700;`
        : `color:${WA.textPrimary};border-left:3px solid transparent;font-weight:500;`
    }font-size:13.5px;margin-bottom:2px;">${icon} ${esc(label)}</a>`;
  };

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
      ${navLink("/dashboard", "💬", "Conversaciones", "conversaciones")}
      ${navLink("/dashboard/registros", "📋", "Registros", "registros")}
    </div>

    <div style="margin:10px 10px 0;background:${WA.header};border-radius:10px;border:1px solid ${WA.headerBorder};overflow:hidden;">
      <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${WA.textMuted};padding:10px 14px 2px;">Resumen</div>
      ${statRow("Creadores totales", totalCount, WA.textPrimary)}
      ${statRow("Nuevos (24h)", nuevosCount, WA.accentBright)}
      ${statRow("Bot en pausa", pausadosCount, pausadosCount > 0 ? "#b45309" : WA.textMuted)}
    </div>

    <div style="margin-top:auto;padding:14px 12px;border-top:1px solid ${WA.headerBorder};">
      <form method="POST" action="/dashboard/logout">
        <button type="submit" style="width:100%;display:flex;align-items:center;gap:8px;background:transparent;border:1px solid ${WA.headerBorder};color:${WA.textMuted};padding:9px 12px;border-radius:8px;font-size:13px;">
          🚪 Cerrar sesión
        </button>
      </form>
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
  ::-webkit-scrollbar-thumb { background: #d1d7db; border-radius: 6px; }
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
        <td style="padding:12px 16px;">${funnelBadge(c.etapa)}</td>
        <td style="padding:12px 16px;">
          ${
            c.bot_pausado
              ? `<span style="font-size:12px;color:#b45309;">⏸ manager</span>`
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
          <h1 style="margin:0 0 4px;font-size:22px;">Conversaciones</h1>
          <p style="margin:0;color:${WA.textMuted};font-size:13.5px;">${creators.length} creador${creators.length === 1 ? "" : "es"} · etapa del embudo y quién les está respondiendo ahora</p>
        </div>
        <a href="/dashboard" style="color:${WA.accentBright};font-size:13.5px;">↻ Recargar</a>
      </div>

      <div style="background:${WA.panel};border:1px solid ${WA.headerBorder};border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.04);">
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
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">Etapa del embudo</th>
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

  return dashboardShell("Dashboard — Eternity Agency", creators, main, "conversaciones");
}

/** Directorio simple: todos los @tiktok y nombres que han pasado por el bot, hayan avanzado o no. */
export function renderRegistros(creators: Creator[]): string {
  const sorted = [...creators].sort((a, b) => b.creado_at.localeCompare(a.creado_at));
  const rows = sorted
    .map(
      (c) => `<tr style="border-bottom:1px solid ${WA.headerBorder};">
        <td style="padding:12px 16px;">
          <a href="/dashboard/creators/${esc(c.id)}" style="display:flex;align-items:center;gap:12px;">
            ${avatar(c.nombre, c.whatsapp_number, 34)}
            <span style="font-weight:600;">${esc(c.nombre) || `<span style="color:${WA.textMuted};font-weight:400;">Sin nombre</span>`}</span>
          </a>
        </td>
        <td style="padding:12px 16px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;">
          ${esc(c.tiktok_handle ? `@${c.tiktok_handle}` : `<span style="color:${WA.textMuted};">sin @tiktok</span>`)}
        </td>
        <td style="padding:12px 16px;color:${WA.textMuted};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;">${esc(c.whatsapp_number)}</td>
        <td style="padding:12px 16px;">${funnelBadge(c.etapa)}</td>
        <td style="padding:12px 16px;color:${WA.textMuted};font-size:13px;white-space:nowrap;">${esc(fullDate(c.creado_at))}</td>
      </tr>`
    )
    .join("\n");

  const main = `
    <div style="padding:28px 32px;max-width:1200px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:22px;">
        <div>
          <h1 style="margin:0 0 4px;font-size:22px;">Registros</h1>
          <p style="margin:0;color:${WA.textMuted};font-size:13.5px;">Todos los nombres y @tiktok que han pasado por el bot, ${creators.length} en total</p>
        </div>
        <a href="/dashboard/registros" style="color:${WA.accentBright};font-size:13.5px;">↻ Recargar</a>
      </div>

      <div style="background:${WA.panel};border:1px solid ${WA.headerBorder};border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.04);">
        ${
          creators.length === 0
            ? `<div style="padding:56px 24px;text-align:center;color:${WA.textMuted};">Todavía no hay registros.</div>`
            : `<div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;">
                  <thead>
                    <tr style="border-bottom:1px solid ${WA.headerBorder};">
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">Nombre</th>
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">@TikTok</th>
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">WhatsApp</th>
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">Etapa del embudo</th>
                      <th style="text-align:left;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${WA.textMuted};">Registrado</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>`
        }
      </div>
    </div>`;

  return dashboardShell("Registros — Eternity Agency", creators, main, "registros");
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
        <div style="max-width:75%;background:${isOutgoing ? WA.bubbleOut : WA.bubbleIn};${
          isOutgoing ? "" : `border:1px solid ${WA.bubbleInBorder};`
        }padding:7px 10px 6px;border-radius:9px;${
          isOutgoing ? "border-top-right-radius:2px;" : "border-top-left-radius:2px;"
        }box-shadow:0 1px 1px rgba(0,0,0,0.06);">
          ${roleTag}
          <div style="white-space:pre-wrap;word-break:break-word;color:${WA.textPrimary};">${esc(e.contenido)}</div>
          <div style="text-align:right;font-size:11px;color:${WA.textMuted};margin-top:2px;">${esc(timeOnly(e.creado_at))}</div>
        </div>
      </div>`;
    })
    .join("\n");

  const statusPill = creator.bot_pausado
    ? `<span style="font-size:12px;background:#fde2e1;color:#b91c1c;padding:3px 10px;border-radius:999px;">⏸ Bot en pausa — respondes tú</span>`
    : `<span style="font-size:12px;background:#d9fdd3;color:${WA.accentBright};padding:3px 10px;border-radius:999px;">🟢 Bot activo</span>`;

  const toggleButton = creator.bot_pausado
    ? `<form method="POST" action="/dashboard/creators/${esc(creator.id)}/resume">
         <button type="submit" style="background:${WA.accent};color:#ffffff;border:none;padding:7px 14px;border-radius:8px;font-weight:700;">▶ Reactivar bot</button>
       </form>`
    : `<form method="POST" action="/dashboard/creators/${esc(creator.id)}/pause">
         <button type="submit" style="background:transparent;color:${WA.textMuted};border:1px solid ${WA.headerBorder};padding:7px 14px;border-radius:8px;">⏸ Pausar bot</button>
       </form>`;

  // Panel de datos a la derecha: todo lo que el sistema sabe hoy de este
  // creador, ya que el chat no ocupa todo el ancho disponible.
  const contextoEntries = Object.entries(creator.contexto ?? {});
  const infoRow = (label: string, value: string) => `
    <div style="padding:9px 0;border-bottom:1px solid ${WA.headerBorder};">
      <div style="font-size:11px;color:${WA.textMuted};text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px;">${esc(label)}</div>
      <div style="font-size:13.5px;color:${WA.textPrimary};word-break:break-word;">${value}</div>
    </div>`;

  const infoPanel = `
    <div style="width:290px;flex-shrink:0;background:${WA.panel};border:1px solid ${WA.headerBorder};border-radius:12px;padding:20px;align-self:flex-start;box-shadow:0 1px 2px rgba(0,0,0,.04);">
      <div style="text-align:center;padding-bottom:16px;border-bottom:1px solid ${WA.headerBorder};margin-bottom:4px;">
        <div style="display:flex;justify-content:center;margin-bottom:10px;">${avatar(creator.nombre, creator.whatsapp_number, 64)}</div>
        <div style="font-weight:700;font-size:16px;">${esc(creator.nombre) || "Sin nombre todavía"}</div>
        <div style="font-size:13px;color:${WA.textMuted};">${esc(creator.tiktok_handle ? `@${creator.tiktok_handle}` : "sin @tiktok")}</div>
      </div>
      ${infoRow("Etapa del embudo", funnelBadge(creator.etapa))}
      ${infoRow("Etapa detallada", stageBadge(creator.etapa))}
      ${infoRow("¿Quién responde?", creator.bot_pausado ? "⏸ Manager (bot en pausa)" : "🤖 Bot (automático)")}
      ${infoRow("Número de WhatsApp", esc(creator.whatsapp_number))}
      ${infoRow("Registrado", esc(fullDate(creator.creado_at)))}
      ${infoRow("Última actividad", esc(fullDate(creator.actualizado_at)))}
      ${infoRow("Último mensaje del creador", esc(fullDate(creator.ultimo_mensaje_entrante_at)))}
      ${infoRow("Último mensaje enviado", esc(fullDate(creator.ultimo_mensaje_saliente_at)))}
      ${infoRow("Mensajes en el historial", String(entries.length))}
      ${
        contextoEntries.length > 0
          ? infoRow(
              "Contexto interno",
              `<div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:${WA.textMuted};">${contextoEntries
                .map(([k, v]) => `${esc(k)}: ${esc(JSON.stringify(v))}`)
                .join("<br/>")}</div>`
            )
          : ""
      }
    </div>`;

  const main = `
    <div style="padding:28px 32px;max-width:1200px;">
      <a href="/dashboard" style="display:inline-block;margin-bottom:16px;color:${WA.textMuted};font-size:13px;">← Todos los creadores</a>

      <div style="display:flex;gap:20px;align-items:flex-start;">
        <div style="flex:1;min-width:0;max-width:700px;background:${WA.panel};border:1px solid ${WA.headerBorder};border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.04);">
          <div style="padding:14px 18px;display:flex;align-items:center;gap:12px;border-bottom:1px solid ${WA.headerBorder};background:${WA.header};">
            ${avatar(creator.nombre, creator.whatsapp_number, 42)}
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${
                esc(creator.nombre) || esc(creator.whatsapp_number)
              }</div>
              <div style="font-size:12.5px;color:${WA.textMuted};">
                ${esc(creator.tiktok_handle ? `@${creator.tiktok_handle}` : "sin @tiktok")} ·
                <span>${esc(creator.whatsapp_number)}</span>
              </div>
            </div>
          </div>

          <div style="padding:10px 18px;display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid ${WA.headerBorder};">
            ${statusPill}
            ${toggleButton}
          </div>

          <div id="chat-messages" style="padding:16px 18px;max-height:60vh;overflow-y:auto;background:${WA.bg};">
            ${
              entries.length === 0
                ? `<div style="text-align:center;color:${WA.textMuted};padding:32px;">Todavía no hay mensajes.</div>`
                : messages
            }
          </div>

          <form method="POST" action="/dashboard/creators/${esc(creator.id)}/send" style="display:flex;gap:8px;padding:14px 18px;border-top:1px solid ${WA.headerBorder};background:${WA.header};">
            <input
              id="chat-input"
              type="text"
              name="mensaje"
              placeholder="Escribe un mensaje como manager…"
              autocomplete="off"
              style="flex:1;background:#ffffff;border:1px solid ${WA.headerBorder};border-radius:20px;padding:10px 16px;color:${WA.textPrimary};font-size:14px;"
            />
            <button type="submit" title="Enviar" style="background:${WA.accent};color:#fff;border:none;width:40px;height:40px;border-radius:50%;font-size:16px;flex-shrink:0;">➤</button>
          </form>
        </div>

        ${infoPanel}
      </div>
      <p style="max-width:700px;font-size:11.5px;color:${WA.textMuted};margin-top:8px;">
        Enviar un mensaje pausa el bot automáticamente para este creador.
      </p>
    </div>
    <script>
      // Al cargar (incluyendo el reload que hace el POST de enviar/pausar/
      // reactivar), el chat debe abrir mostrando los mensajes más recientes,
      // no el inicio de la conversación.
      (function () {
        var messages = document.getElementById("chat-messages");
        if (messages) messages.scrollTop = messages.scrollHeight;
        var input = document.getElementById("chat-input");
        if (input) input.focus();
      })();
    </script>`;

  return dashboardShell(`${creator.nombre ?? creator.whatsapp_number} — Conversación`, allCreators, main, "conversaciones");
}

export function renderNotFound(creators: Creator[]): string {
  const main = `
    <div style="padding:28px 32px;">
      <a href="/dashboard" style="color:${WA.accentBright};font-size:13.5px;">← Todos los creadores</a>
      <div style="text-align:center;color:${WA.textMuted};padding:64px 24px;">Ese creador no existe.</div>
    </div>`;
  return dashboardShell("No encontrado", creators, main, "conversaciones");
}

/** Login — pantalla suelta, sin sidebar (todavía no hay sesión que mostrar en el menú). */
export function renderLogin(opts: { error?: boolean; next?: string } = {}): string {
  const nextField = opts.next ? `<input type="hidden" name="next" value="${esc(opts.next)}" />` : "";
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Iniciar sesión — Eternity Agency</title>
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; min-height: 100%; background: ${WA.bg}; color: ${WA.textPrimary};
    font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    display: flex; align-items: center; justify-content: center;
  }
  input { font: inherit; }
</style>
</head>
<body>
  <form method="POST" action="/dashboard/login" style="width:100%;max-width:340px;background:${WA.panel};border:1px solid ${WA.headerBorder};border-radius:14px;padding:32px 28px;box-shadow:0 4px 16px rgba(0,0,0,.06);">
    <div style="text-align:center;margin-bottom:22px;">
      <div style="width:48px;height:48px;border-radius:12px;background:${WA.accent};display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 12px;">💚</div>
      <div style="font-weight:700;font-size:17px;">Eternity Agency</div>
      <div style="font-size:12.5px;color:${WA.textMuted};">Iniciar sesión al dashboard</div>
    </div>

    ${
      opts.error
        ? `<div style="background:#fde2e1;color:#b91c1c;font-size:13px;padding:8px 12px;border-radius:8px;margin-bottom:14px;text-align:center;">Usuario o contraseña incorrectos.</div>`
        : ""
    }
    ${nextField}

    <label style="display:block;font-size:12.5px;color:${WA.textMuted};margin-bottom:4px;">Usuario</label>
    <input name="usuario" autocomplete="username" required
      style="width:100%;padding:10px 12px;border:1px solid ${WA.headerBorder};border-radius:8px;margin-bottom:14px;background:#fff;" />

    <label style="display:block;font-size:12.5px;color:${WA.textMuted};margin-bottom:4px;">Contraseña</label>
    <input name="contrasena" type="password" autocomplete="current-password" required
      style="width:100%;padding:10px 12px;border:1px solid ${WA.headerBorder};border-radius:8px;margin-bottom:20px;background:#fff;" />

    <button type="submit" style="width:100%;background:${WA.accent};color:#fff;border:none;padding:11px;border-radius:8px;font-weight:700;font-size:14px;">Iniciar sesión</button>
  </form>
</body>
</html>`;
}
