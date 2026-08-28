"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para Client Components — usa la anon/publishable key.
 * Todo lo que este cliente lee/escribe pasa por RLS (ver
 * supabase/migrations/phase2_data_model_and_rls.sql): un creador solo ve y
 * edita su propia fila.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );
}
