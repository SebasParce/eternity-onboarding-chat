import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Cliente de Supabase para Server Components / Route Handlers, atado a la
 * sesión del creador que hace el request (vía cookies). Sigue usando la
 * anon/publishable key — sigue pasando por RLS, nunca bypassea nada. Úsalo
 * para leer/escribir datos "como el creador".
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Llamado desde un Server Component (no puede escribir cookies) —
            // se ignora: el middleware/route handler que sí puede ya refresca la sesión.
          }
        },
      },
    }
  );
}
