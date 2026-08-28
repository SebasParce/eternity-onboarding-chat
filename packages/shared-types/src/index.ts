/**
 * Tipos de dominio compartidos entre apps/chat-onboarding (Fase 1, WhatsApp) y
 * apps/elearning (Fase 2, Academia de Creadores) — ambos módulos del mismo
 * producto, leyendo/escribiendo la misma fila de `creators` en Supabase.
 *
 * Reflejan 1:1 el esquema de supabase/migrations/*.sql. Mantener sincronizados
 * manualmente (fase 1/2, sin generador de tipos aún) y correr `npm run build`
 * en este paquete tras cualquier cambio, para que ambas apps lo vean.
 */

export type CreatorStage =
  | "nuevo"
  | "nombre_recibido"
  | "handle_recibido"
  | "programa_enviado"
  | "resolviendo_dudas"
  | "quiere_iniciar"
  | "derivado_elearning"
  // etapas de fase 2 (e-learning)
  | "en_programa_4_dias"
  | "revision_dia_5"
  | "ingreso_oficial"
  | "no_completado";

export interface Creator {
  id: string;
  whatsapp_number: string;
  nombre: string | null;
  tiktok_handle: string | null;
  /** Ciudad del creador — capturada en "Mi Perfil" (Fase 2). */
  ciudad: string | null;
  /**
   * Vincula la fila con auth.users tras el primer login (OTP por teléfono) en
   * la plataforma de e-learning. null hasta ese primer login; lo completa
   * únicamente el backend (service_role), nunca el propio creador.
   */
  auth_user_id: string | null;
  etapa: CreatorStage;
  ventana_ingreso_at: string | null;
  ultimo_mensaje_entrante_at: string | null;
  ultimo_mensaje_saliente_at: string | null;
  contexto: Record<string, unknown>;
  /** true cuando un manager tomó la conversación desde el dashboard — el motor no responde solo. */
  bot_pausado: boolean;
  creado_at: string;
  actualizado_at: string;
}

/** Un creador tiene "perfil completo" cuando estos 4 campos están llenos — requisito antes de empezar la capacitación. */
export function isProfileComplete(creator: Pick<Creator, "nombre" | "tiktok_handle" | "ciudad" | "whatsapp_number">): boolean {
  return Boolean(creator.nombre?.trim() && creator.tiktok_handle?.trim() && creator.ciudad?.trim() && creator.whatsapp_number?.trim());
}

// --- Academia de creadores (módulos de e-learning) --------------------------

export type ModuleKey =
  | "perfil"
  | "bienvenida"
  | "monetizacion"
  | "setup_espacio"
  | "reglas"
  | "validacion_setup"
  | "graduacion";

/** Orden secuencial de desbloqueo — no es el orden de creación en DB. */
export const MODULE_ORDER: ModuleKey[] = [
  "perfil",
  "bienvenida",
  "monetizacion",
  "setup_espacio",
  "reglas",
  "validacion_setup",
  "graduacion",
];

export type ModuleStatus =
  | "bloqueado"
  | "disponible"
  | "en_progreso"
  | "completado"
  | "vencido_esperando_extension";

export interface ModuleProgress {
  id: string;
  creator_id: string;
  module_key: ModuleKey;
  estado: ModuleStatus;
  /** Cuándo se desbloqueó (arrancó la ventana de acceso). */
  unlocked_at: string | null;
  /** Fin de la ventana de acceso (24-48h desde unlocked_at). */
  expires_at: string | null;
  /** Cuándo un mentor otorgó una extensión tras vencer la ventana. */
  extended_at: string | null;
  /** Quién otorgó la extensión — nunca se auto-extiende. */
  extended_by: string | null;
  completed_at: string | null;
  creado_at: string;
  actualizado_at: string;
}

// --- Validación de setup ------------------------------------------------------

export type ValidationStatus = "pendiente" | "aprobado" | "rechazado";
export type ValidationMediaType = "imagen" | "video";

export interface SetupValidation {
  id: string;
  creator_id: string;
  media_url: string;
  media_type: ValidationMediaType;
  /**
   * Pre-filtro objetivo (0-255) calculado 100% en el navegador del creador —
   * nunca decide nada por sí solo, solo orienta la revisión humana.
   */
  brightness_score: number | null;
  estado: ValidationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notas: string | null;
  creado_at: string;
}
