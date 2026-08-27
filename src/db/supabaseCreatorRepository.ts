import { randomUUID } from "node:crypto";
import { supabase } from "./supabaseClient.js";
import type { CreatorRepository } from "./creatorRepository.js";
import type { Creator, InteractionLogEntry } from "../types/domain.js";

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
}
