import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { ensureModuleProgressRows, syncExpiredModules } from "@/lib/moduleProgress";
import AcademyApp from "@/components/AcademyApp";
import type { Creator, ModuleProgress, SetupValidation } from "@eternity/shared-types";

export default async function HomePage() {
  const userClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Lectura server-side "confiable": este componente nunca se manda al
  // navegador, así que usar service_role acá (ya filtrando por auth_user_id =
  // user.id nosotros mismos) es seguro. Las escrituras del creador siguen
  // yendo por el cliente normal (RLS) o por las API routes que validan todo.
  const service = createSupabaseServiceClient();
  const { data: creator } = await service.from("creators").select("*").eq("auth_user_id", user.id).maybeSingle();

  if (!creator) {
    redirect("/login");
  }

  const typedCreator = creator as Creator;
  let rows = await ensureModuleProgressRows(service, typedCreator.id);
  rows = await syncExpiredModules(service, rows);

  const { data: validations } = await service
    .from("setup_validation")
    .select("*")
    .eq("creator_id", typedCreator.id)
    .order("creado_at", { ascending: false });

  return (
    <AcademyApp
      creator={typedCreator}
      modules={rows as ModuleProgress[]}
      validations={(validations as SetupValidation[]) ?? []}
    />
  );
}
