import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasRealCredentials = Boolean(url && serviceRoleKey);

if (!hasRealCredentials) {
  // No lanzamos error en import-time para no romper `tsc --noEmit`, el modo
  // simulate (que usa el repositorio en memoria y nunca toca este cliente) ni
  // levantar el webhook server para probar el adapter mock end-to-end. Un
  // placeholder válido evita que `createClient` explote por URL vacía; el
  // error real ocurre recién al primer query, dentro de supabaseCreatorRepository.ts.
  console.warn(
    "[supabaseClient] Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno. " +
      "El cliente de Supabase no funcionará hasta configurarlos (ver .env.example)."
  );
}

/**
 * Cliente de Supabase con la service role key: el webhook escribe estado del
 * creador desde el backend, sin sesión de usuario final. NUNCA exponer esta
 * key al frontend/e-learning del lado del cliente.
 */
export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  serviceRoleKey ?? "placeholder-key",
  { auth: { persistSession: false } }
);
