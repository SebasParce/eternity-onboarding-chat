import { MODULE_ORDER, type ModuleKey, type ModuleProgress } from "@eternity/shared-types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_ACCESS_WINDOW_HOURS = 48;

export function accessWindowHours(): number {
  const raw = Number(process.env.MODULE_ACCESS_WINDOW_HOURS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_ACCESS_WINDOW_HOURS;
}

/**
 * Crea (si no existen) las 7 filas de module_progress de un creador, con
 * "perfil" ya disponible y el resto bloqueado. Idempotente — se llama en cada
 * login, no solo el primero, por si un creador viejo no las tiene.
 */
export async function ensureModuleProgressRows(
  service: SupabaseClient,
  creatorId: string
): Promise<ModuleProgress[]> {
  const { data: existing, error: readError } = await service
    .from("module_progress")
    .select("*")
    .eq("creator_id", creatorId);
  if (readError) throw new Error(`[ensureModuleProgressRows.read] ${readError.message}`);

  const existingKeys = new Set((existing ?? []).map((row: ModuleProgress) => row.module_key));
  const missing = MODULE_ORDER.filter((key) => !existingKeys.has(key));
  if (missing.length === 0) return existing as ModuleProgress[];

  const now = new Date().toISOString();
  const rowsToInsert = missing.map((module_key) => ({
    creator_id: creatorId,
    module_key,
    estado: module_key === "perfil" ? "disponible" : "bloqueado",
    unlocked_at: module_key === "perfil" ? now : null,
    expires_at: null, // "perfil" no tiene ventana de tiempo — es el único paso sin timer.
  }));

  const { data: inserted, error: insertError } = await service
    .from("module_progress")
    .insert(rowsToInsert)
    .select("*");
  if (insertError) throw new Error(`[ensureModuleProgressRows.insert] ${insertError.message}`);

  return [...(existing as ModuleProgress[]), ...((inserted as ModuleProgress[]) ?? [])];
}

/**
 * Si un módulo quedó "disponible"/"en_progreso" pero su ventana ya venció,
 * lo pasa a vencido_esperando_extension — nunca se auto-extiende, eso lo
 * hace un mentor desde el dashboard de Fase 1. Se corrige de forma perezosa
 * (al leer), no con un cron aparte.
 */
export async function syncExpiredModules(service: SupabaseClient, rows: ModuleProgress[]): Promise<ModuleProgress[]> {
  const now = Date.now();
  const expiredIds = rows
    .filter((r) => (r.estado === "disponible" || r.estado === "en_progreso") && r.expires_at && new Date(r.expires_at).getTime() < now)
    .map((r) => r.id);

  if (expiredIds.length === 0) return rows;

  const { data, error } = await service
    .from("module_progress")
    .update({ estado: "vencido_esperando_extension" })
    .in("id", expiredIds)
    .select("*");
  if (error) throw new Error(`[syncExpiredModules] ${error.message}`);

  const updatedById = new Map((data as ModuleProgress[]).map((r) => [r.id, r]));
  return rows.map((r) => updatedById.get(r.id) ?? r);
}

export function findModule(rows: ModuleProgress[], key: ModuleKey): ModuleProgress | undefined {
  return rows.find((r) => r.module_key === key);
}

export function nextKey(current: ModuleKey): ModuleKey | null {
  const idx = MODULE_ORDER.indexOf(current);
  if (idx === -1 || idx === MODULE_ORDER.length - 1) return null;
  return MODULE_ORDER[idx + 1];
}
