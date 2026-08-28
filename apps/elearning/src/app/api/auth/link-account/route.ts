import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { ensureModuleProgressRows } from "@/lib/moduleProgress";
import type { Creator } from "@eternity/shared-types";

/**
 * Se llama una vez, justo después de que el OTP por teléfono verifica y
 * queda una sesión de Supabase Auth activa. Vincula esa sesión con la fila
 * de `creators` que ya existe de Fase 1 (creada cuando el creador escribió
 * "Quiero iniciar" por WhatsApp) — nunca crea una fila nueva: si no existe un
 * creador con ese número, algo salió mal en el flujo de WhatsApp y no
 * dejamos avanzar.
 *
 * Usa service_role porque `auth_user_id` es una columna que un creador NO
 * puede escribir directamente (no está en el GRANT UPDATE de `authenticated`
 * — ver supabase/migrations). Todo lo demás en esta ruta primero valida la
 * sesión del que llama antes de tocar nada.
 */
export async function POST() {
  const userClient = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user || !user.phone) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  // Supabase Auth guarda el teléfono sin "+". Normalizamos a E.164 para que
  // coincida con whatsapp_number tal como lo guarda Fase 1.
  const whatsappNumber = user.phone.startsWith("+") ? user.phone : `+${user.phone}`;

  const service = createSupabaseServiceClient();

  const { data: creator, error: findError } = await service
    .from("creators")
    .select("*")
    .eq("whatsapp_number", whatsappNumber)
    .maybeSingle();

  if (findError) {
    return NextResponse.json({ error: "lookup_failed", detail: findError.message }, { status: 500 });
  }

  if (!creator) {
    return NextResponse.json(
      {
        error: "creator_not_found",
        message:
          "Este número no está registrado todavía. Escríbele a la agencia por WhatsApp y confirma 'Quiero iniciar' antes de entrar aquí.",
      },
      { status: 404 }
    );
  }

  const typedCreator = creator as Creator;

  if (typedCreator.auth_user_id && typedCreator.auth_user_id !== user.id) {
    // No debería pasar en operación normal (un número = un auth.users), pero
    // si pasa, no sobreescribimos en silencio.
    return NextResponse.json({ error: "already_linked_to_other_user" }, { status: 409 });
  }

  if (!typedCreator.auth_user_id) {
    const { error: linkError } = await service
      .from("creators")
      .update({ auth_user_id: user.id })
      .eq("id", typedCreator.id);
    if (linkError) {
      return NextResponse.json({ error: "link_failed", detail: linkError.message }, { status: 500 });
    }
  }

  await ensureModuleProgressRows(service, typedCreator.id);

  return NextResponse.json({ ok: true, creatorId: typedCreator.id });
}
