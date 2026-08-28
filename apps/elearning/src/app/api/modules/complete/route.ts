import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { accessWindowHours, findModule, nextKey, syncExpiredModules } from "@/lib/moduleProgress";
import { isProfileComplete, MODULE_ORDER, type Creator, type ModuleKey, type ModuleProgress } from "@eternity/shared-types";

/**
 * Marca un módulo como completado y desbloquea el siguiente. Toda la validez
 * de la transición se decide acá, del lado del servidor con service_role —
 * un creador nunca puede escribir module_progress directamente (solo tiene
 * SELECT vía RLS), justamente para que no pueda saltarse módulos ni
 * inventarse un "completado".
 *
 * Reglas:
 *  - El módulo debe estar 'disponible' o 'en_progreso' (no bloqueado, no ya
 *    completado, no vencido).
 *  - Si ya venció su ventana de acceso, se rechaza — hace falta que un
 *    mentor lo extienda desde el dashboard.
 *  - 'perfil' tiene una regla propia: requiere nombre/tiktok/ciudad/whatsapp
 *    completos (ver isProfileComplete).
 *  - 'validacion_setup' NUNCA se completa por esta ruta: la aprobación es
 *    manual, desde el dashboard de Fase 1 (ver src/dashboard/dashboardRouter.ts).
 *  - El resto de módulos (lecciones), mientras no haya contenido/quiz real
 *    cargado, se aceptan con la sola confirmación del creador — TODO: cuando
 *    el equipo entregue el contenido final, validar también la respuesta del
 *    quiz acá server-side en vez de confiar en el cliente.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const moduleKey = body?.moduleKey as ModuleKey | undefined;
  if (!moduleKey || !MODULE_ORDER.includes(moduleKey)) {
    return NextResponse.json({ error: "invalid_module_key" }, { status: 400 });
  }
  if (moduleKey === "validacion_setup") {
    return NextResponse.json(
      { error: "requires_manual_review", message: "Este módulo lo aprueba un mentor, no se auto-completa." },
      { status: 400 }
    );
  }

  const userClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "no_session" }, { status: 401 });

  // Leído con el cliente del usuario (pasa por RLS): solo puede llegar a su
  // propia fila, así que este .maybeSingle() ya es la verificación de identidad.
  const { data: creator, error: creatorError } = await userClient
    .from("creators")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (creatorError || !creator) {
    return NextResponse.json({ error: "creator_not_linked" }, { status: 404 });
  }
  const typedCreator = creator as Creator;

  if (moduleKey === "perfil" && !isProfileComplete(typedCreator)) {
    return NextResponse.json({ error: "profile_incomplete" }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const { data: rowsRaw, error: rowsError } = await service
    .from("module_progress")
    .select("*")
    .eq("creator_id", typedCreator.id);
  if (rowsError) return NextResponse.json({ error: "read_failed", detail: rowsError.message }, { status: 500 });

  const rows = await syncExpiredModules(service, rowsRaw as ModuleProgress[]);
  const current = findModule(rows, moduleKey);

  if (!current || (current.estado !== "disponible" && current.estado !== "en_progreso")) {
    return NextResponse.json(
      { error: "not_available", estado: current?.estado ?? "bloqueado" },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const { data: updatedCurrent, error: updateError } = await service
    .from("module_progress")
    .update({ estado: "completado", completed_at: now })
    .eq("id", current.id)
    .select("*")
    .single();
  if (updateError) return NextResponse.json({ error: "update_failed", detail: updateError.message }, { status: 500 });

  const upcoming = nextKey(moduleKey);
  let updatedNext: ModuleProgress | null = null;
  if (upcoming) {
    const windowMs = accessWindowHours() * 60 * 60 * 1000;
    // validacion_setup no tiene ventana de tiempo tipo lección: es "sube
    // cuando quieras", el timer no aplica ahí.
    const expiresAt = upcoming === "validacion_setup" || upcoming === "graduacion" ? null : new Date(Date.now() + windowMs).toISOString();
    const nextRow = findModule(rows, upcoming);
    const { data, error } = await service
      .from("module_progress")
      .update({ estado: "disponible", unlocked_at: now, expires_at: expiresAt })
      .eq("id", nextRow?.id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: "unlock_failed", detail: error.message }, { status: 500 });
    updatedNext = data as ModuleProgress;
  }

  return NextResponse.json({ ok: true, completed: updatedCurrent, unlocked: updatedNext });
}
