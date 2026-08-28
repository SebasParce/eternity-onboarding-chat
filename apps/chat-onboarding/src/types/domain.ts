/**
 * Tipos de dominio de Fase 1 (motor conversacional de WhatsApp). `CreatorStage`
 * y `Creator` viven en @eternity/shared-types porque Fase 2 (apps/elearning)
 * lee/escribe la misma fila de `creators` — se re-exportan aquí para no
 * romper los imports existentes en todo este código. Los tipos de progreso de
 * módulos/validación de setup (usados por el dashboard) también viven ahí.
 */

import type { CreatorStage } from "@eternity/shared-types";
export type {
  CreatorStage,
  Creator,
  ModuleKey,
  ModuleStatus,
  ModuleProgress,
  ValidationStatus,
  ValidationMediaType,
  SetupValidation,
} from "@eternity/shared-types";
export { MODULE_ORDER, isProfileComplete } from "@eternity/shared-types";

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
