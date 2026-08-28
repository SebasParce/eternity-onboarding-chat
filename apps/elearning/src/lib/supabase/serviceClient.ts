import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con la service_role key — IGNORA RLS por completo. Solo se importa
 * desde Route Handlers (server-side), nunca desde un Client Component ni
 * desde código que corra en el navegador. Se usa exclusivamente para:
 *
 *   1. Vincular auth_user_id la primera vez que un creador inicia sesión
 *      (buscar su fila de `creators` por whatsapp_number).
 *   2. Reglas de negocio de progreso de módulos (desbloqueo secuencial,
 *      ventana de acceso, expiración) que un creador no debe poder manipular
 *      directamente aunque tenga la anon key.
 *   3. Aprobar/rechazar validaciones de setup — eso lo hace un mentor desde
 *      el dashboard de Fase 1, no desde esta app.
 */
export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor (ver .env.example)."
    );
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}
