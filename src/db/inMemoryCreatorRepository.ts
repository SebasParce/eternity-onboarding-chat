import { randomUUID } from "node:crypto";
import type { CreatorRepository } from "./creatorRepository.js";
import type { Creator, InteractionLogEntry } from "../types/domain.js";

/**
 * Implementación en memoria del mismo puerto CreatorRepository. Se usa en
 * scripts/simulate-conversation.ts y en tests, para validar el motor de
 * conversación sin necesitar credenciales reales de Supabase.
 */
export class InMemoryCreatorRepository implements CreatorRepository {
  private creators = new Map<string, Creator>();
  private log: InteractionLogEntry[] = [];

  async findByWhatsappNumber(whatsappNumber: string): Promise<Creator | null> {
    for (const c of this.creators.values()) {
      if (c.whatsapp_number === whatsappNumber) return c;
    }
    return null;
  }

  async create(whatsappNumber: string): Promise<Creator> {
    const now = new Date().toISOString();
    const creator: Creator = {
      id: randomUUID(),
      whatsapp_number: whatsappNumber,
      nombre: null,
      tiktok_handle: null,
      etapa: "nuevo",
      ventana_ingreso_at: null,
      ultimo_mensaje_entrante_at: null,
      ultimo_mensaje_saliente_at: null,
      contexto: {},
      creado_at: now,
      actualizado_at: now,
    };
    this.creators.set(creator.id, creator);
    return creator;
  }

  async update(id: string, patch: Partial<Creator>): Promise<Creator> {
    const current = this.creators.get(id);
    if (!current) throw new Error(`Creator ${id} no existe`);
    const updated: Creator = { ...current, ...patch, actualizado_at: new Date().toISOString() };
    this.creators.set(id, updated);
    return updated;
  }

  async logInteraction(entry: {
    creator_id: string;
    rol: InteractionLogEntry["rol"];
    tipo: InteractionLogEntry["tipo"];
    contenido: string;
    faq_entry_id?: string | null;
    etapa_en_momento: InteractionLogEntry["etapa_en_momento"];
  }): Promise<InteractionLogEntry> {
    const record: InteractionLogEntry = {
      id: randomUUID(),
      faq_entry_id: null,
      creado_at: new Date().toISOString(),
      ...entry,
    };
    this.log.push(record);
    return record;
  }

  /** Solo para debugging en la simulación: devuelve el historial completo. */
  getFullLog(): InteractionLogEntry[] {
    return this.log;
  }
}
