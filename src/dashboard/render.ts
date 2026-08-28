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
  nuevo: "#64748b",
  nombre_recibido: "#64748b",
  handle_recibido: "#64748b",
  programa_enviado: "#2563eb",
  resolviendo_dudas: "#d97706",
  quiere_iniciar: "#7c3aed",
  derivado_elearning: "#059669",
  en_programa_4_dias: "#059669",
  revision_dia_5: "#059669",
  ingreso_oficial: "#059669",
  no_completado: "#dc2626",
};

function stageBadge(stage: CreatorStage): string {
  const color = STAGE_COLORS[stage] ?? "#64748b";
  return `<span class="badge" style="background:${color}22;color:${color};border:1px solid ${color}55;">${esc(
    STAGE_LABELS[stage] ?? stage
  )}</span>`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "hace un momento";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `hace ${diffD} d`;
}

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 24px; background: #0b0f14; color: #e6edf3;
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  a { color: #6ea8fe; text-decoration: none; }
  a:hover { text-decoration: underline; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .subtitle { color: #8b949e; margin: 0 0 24px; }
  .card {
    background: #11161d; border: 1px solid #262c36; border-radius: 10px;
    overflow: hidden; margin-bottom: 16px;
  }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid #1c222b; white-space: nowrap; }
  th { color: #8b949e; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
  tr:last-child td { border-bottom: none; }
  tr.new-row { background: #16210f; }
  .badge { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .muted { color: #8b949e; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .topbar { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
  .refresh { font-size: 12px; }
  .msg { padding: 12px 14px; border-bottom: 1px solid #1c222b; }
  .msg:last-child { border-bottom: none; }
  .msg-meta { font-size: 12px; color: #8b949e; margin-bottom: 4px; display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
  .msg-role { font-weight: 600; }
  .msg-role.creador { color: #58a6ff; }
  .msg-role.sistema { color: #3fb950; }
  .msg-role.manager { color: #d29922; }
  .msg-content { white-space: pre-wrap; }
  .back { display: inline-block; margin-bottom: 16px; }
  .empty { padding: 24px; text-align: center; color: #8b949e; }
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
      return `<tr class="${isNew ? "new-row" : ""}">
        <td>${isNew ? "🆕 " : ""}${esc(c.nombre) || '<span class="muted">—</span>'}</td>
        <td class="mono">${esc(c.tiktok_handle ? `@${c.tiktok_handle}` : "—")}</td>
        <td class="mono muted">${esc(c.whatsapp_number)}</td>
        <td>${stageBadge(c.etapa)}</td>
        <td class="muted">${esc(relativeTime(c.actualizado_at))}</td>
        <td><a href="/dashboard/creators/${esc(c.id)}">Ver conversación →</a></td>
      </tr>`;
    })
    .join("\n");

  const body = `
  <div class="topbar">
    <div>
      <h1>Creadores — Eternity Agency LATAM</h1>
      <p class="subtitle">${creators.length} creador${creators.length === 1 ? "" : "es"} registrado${
    creators.length === 1 ? "" : "s"
  } · los más recientes primero</p>
    </div>
    <a class="refresh" href="/dashboard">↻ Recargar</a>
  </div>
  <div class="card">
    ${
      creators.length === 0
        ? `<div class="empty">Todavía no hay creadores registrados.</div>`
        : `<table>
      <thead><tr><th>Nombre</th><th>@TikTok</th><th>WhatsApp</th><th>Etapa</th><th>Última actividad</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`
    }
  </div>`;

  return layout("Dashboard — Eternity Agency", body);
}

export function renderConversation(creator: Creator, entries: InteractionLogEntry[]): string {
  const messages = entries
    .map((e) => {
      const roleLabel = e.rol === "creador" ? "Creador" : e.rol === "sistema" ? "Sistema" : "Manager";
      const escalated = e.tipo === "evento_sistema" ? ' <span class="badge" style="background:#7c2d1226;color:#f0883e;border:1px solid #7c2d1255;">escalado</span>' : "";
      return `<div class="msg">
        <div class="msg-meta">
          <span class="msg-role ${esc(e.rol)}">${esc(roleLabel)}</span>
          <span>${esc(new Date(e.creado_at).toLocaleString("es-CO"))}</span>
          <span class="muted">·</span>
          <span class="muted">${esc(STAGE_LABELS[e.etapa_en_momento as CreatorStage] ?? e.etapa_en_momento ?? "")}</span>
          ${escalated}
        </div>
        <div class="msg-content">${esc(e.contenido)}</div>
      </div>`;
    })
    .join("\n");

  const body = `
  <a class="back" href="/dashboard">← Todos los creadores</a>
  <div class="topbar">
    <div>
      <h1>${esc(creator.nombre) || esc(creator.whatsapp_number)}</h1>
      <p class="subtitle">
        ${esc(creator.tiktok_handle ? `@${creator.tiktok_handle}` : "sin @tiktok todavía")} ·
        <span class="mono">${esc(creator.whatsapp_number)}</span> ·
        ${stageBadge(creator.etapa)}
      </p>
    </div>
    <a class="refresh" href="/dashboard/creators/${esc(creator.id)}">↻ Recargar</a>
  </div>
  <div class="card">
    ${entries.length === 0 ? `<div class="empty">Todavía no hay mensajes.</div>` : messages}
  </div>`;

  return layout(`${creator.nombre ?? creator.whatsapp_number} — Conversación`, body);
}

export function renderNotFound(): string {
  return layout(
    "No encontrado",
    `<a class="back" href="/dashboard">← Todos los creadores</a><div class="card"><div class="empty">Ese creador no existe.</div></div>`
  );
}
