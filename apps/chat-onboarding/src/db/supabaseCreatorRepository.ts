import { randomUUID } from "node:crypto";
import { supabase } from "./supabaseClient.js";
import type { CreatorRepository } from "./creatorRepository.js";
import type { Creator, InteractionLogEntry, ModuleProgress, SetupValidation } from "../types/domain.js";

/** Implementación real del repositorio, contra las tablas de Supabase. */
export class SupabaseCreatorRepository implements CreatorRepository {
  async findByWhatsappNumber(whatsappNumber: string): Promise<Creator | null> {
    const { data, error } = await supabase
      .from("creators")
      .select("*")
      .eq("whatsapp_number", whatsappNumber)
      .maybeSingle();

    if (error) throw new Error(`[creators.findByWhatsappNumber] ${error.message}`);
    return (data as Creator) ?? null;
  }

  async create(whatsappNumber: string): Promise<Creator> {
    const { data, error } = await supabase
      .from("creators")
      .insert({ id: randomUUID(), whatsapp_number: whatsappNumber })
      .select("*")
      .single();

    if (error) throw new Error(`[creators.create] ${error.message}`);
    return data as Creator;
  }

  async update(id: string, patch: Partial<Creator>): Promise<Creator> {
    const { data, error } = await supabase
      .from("creators")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(`[creators.update] ${error.message}`);
    return data as Creator;
  }

  async logInteraction(entry: {
    creator_id: string;
    rol: InteractionLogEntry["rol"];
    tipo: InteractionLogEntry["tipo"];
    contenido: string;
    faq_entry_id?: string | null;
    etapa_en_momento: InteractionLogEntry["etapa_en_momento"];
  }): Promise<InteractionLogEntry> {
    const { data, error } = await supabase
      .from("interaction_log")
      .insert({ id: randomUUID(), ...entry })
      .select("*")
      .single();

    if (error) throw new Error(`[interaction_log.insert] ${error.message}`);
    return data as InteractionLogEntry;
  }

  async listCreators(): Promise<Creator[]> {
    const { data, error } = await supabase
      .from("creators")
      .select("*")
      .order("actualizado_at", { ascending: false });

    if (error) throw new Error(`[creators.listCreators] ${error.message}`);
    return (data as Creator[]) ?? [];
  }

  async listInteractionsForCreator(creatorId: string): Promise<InteractionLogEntry[]> {
    const { data, error } = await supabase
      .from("interaction_log")
      .select("*")
      .eq("creator_id", creatorId)
      .order("creado_at", { ascending: true });

    if (error) throw new Error(`[interaction_log.listInteractionsForCreator] ${error.message}`);
    return (data as InteractionLogEntry[]) ?? [];
  }

  async listAllModuleProgress(): Promise<ModuleProgress[]> {
    const { data, error } = await supabase.from("module_progress").select("*");
    if (error) throw new Error(`[module_progress.listAllModuleProgress] ${error.message}`);
    return (data as ModuleProgress[]) ?? [];
  }

  async listModuleProgressForCreator(creatorId: string): Promise<ModuleProgress[]> {
    const { data, error } = await supabase.from("module_progress").select("*").eq("creator_id", creatorId);
    if (error) throw new Error(`[module_progress.listModuleProgressForCreator] ${error.message}`);
    return (data as ModuleProgress[]) ?? [];
  }

  async listAllSetupValidations(): Promise<SetupValidation[]> {
    const { data, error } = await supabase
      .from("setup_validation")
      .select("*")
      .order("creado_at", { ascending: false });
    if (error) throw new Error(`[setup_validation.listAllSetupValidations] ${error.message}`);
    return (data as SetupValidation[]) ?? [];
  }

  async listSetupValidationsForCreator(creatorId: string): Promise<SetupValidation[]> {
    const { data, error } = await supabase
      .from("setup_validation")
      .select("*")
      .eq("creator_id", creatorId)
      .order("creado_at", { ascending: false });
    if (error) throw new Error(`[setup_validation.listSetupValidationsForCreator] ${error.message}`);
    return (data as SetupValidation[]) ?? [];
  }

  async updateModuleProgress(id: string, patch: Partial<ModuleProgress>): Promise<ModuleProgress> {
    const { data, error } = await supabase.from("module_progress").update(patch).eq("id", id).select("*").single();
    if (error) throw new Error(`[module_progress.update] ${error.message}`);
    return data as ModuleProgress;
  }

  async updateSetupValidation(id: string, patch: Partial<SetupValidation>): Promise<SetupValidation> {
    const { data, error } = await supabase.from("setup_validation").update(patch).eq("id", id).select("*").single();
    if (error) throw new Error(`[setup_validation.update] ${error.message}`);
    return data as SetupValidation;
  }
}
