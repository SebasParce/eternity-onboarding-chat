/**
 * Tipos de dominio — reflejan 1:1 el esquema de supabase/migrations/0001_init.sql
 * Mantener ambos sincronizados manualmente (fase 1, sin generador de tipos aún).
 */

export type CreatorStage =
  | "nuevo"
  | "nombre_recibido"
  | "handle_recibido"
  | "programa_enviado"
  | "resolviendo_dudas"
  | "quiere_iniciar"
  | "derivado_elearning"
  // etapas de fase 2 (e-learning) — ya moduladas para no requerir migración futura
  | "en_programa_4_dias"
  | "revision_dia_5"
  | "ingreso_oficial"
  | "no_completado";

export interface Creator {
  id: string;
  whatsapp_number: string;
  nombre: string | null;
  tiktok_handle: string | null;
  etapa: CreatorStage;
  ventana_ingreso_at: string | null;
  ultimo_mensaje_entrante_at: string | null;
  ultimo_mensaje_saliente_at: string | null;
  contexto: Record<string, unknown>;
  creado_at: string;
  actualizado_at: string;
}

export type InteractionType = "mensaje_flujo" | "duda_faq" | "evento_sistema";
export type InteractionRole = "creador" | "sistema" | "manager";

export interface InteractionLogEntry {
  id: string;
  creator_id: string;
  rol: InteractionRole;
  tipo: InteractionType;
  contenido: string;
  faq_entry_id: string | null;
  etapa_en_momento: CreatorStage | null;
  creado_at: string;
}

/** Mensaje entrante normalizado, independiente del proveedor de WhatsApp. */
export interface InboundMessage {
  /** Número del creador en formato E.164, ej. +573001234567 */
  from: string;
  /** Texto del mensaje. Para botones/quick replies, el título del botón presionado. */
  text: string;
  /** Id del botón interactivo presionado, si aplica (ej. "quiero_iniciar"). */
  interactiveId?: string;
  /** Timestamp del proveedor, si viene; si no, se usa la hora de recepción. */
  providerTimestamp?: string;
  /** Payload crudo del proveedor, para debugging. */
  raw?: unknown;
}

/** Mensaje saliente que el motor de conversación entrega al adapter de canal. */
export interface OutboundMessage {
  to: string;
  text: string;
  /** Botones tipo quick-reply, ej. [{ id: "quiero_iniciar", title: "Quiero iniciar 🚀" }] */
  buttons?: { id: string; title: string }[];
}
