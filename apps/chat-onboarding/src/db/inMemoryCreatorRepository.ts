import { randomUUID } from "node:crypto";
import type { CreatorRepository } from "./creatorRepository.js";
import type { Creator, InteractionLogEntry, ModuleProgress, SetupValidation } from "../types/domain.js";

/**
 * Implementación en memoria del mismo puerto CreatorRepository. Se usa en
 * scripts/simulate-conversation.ts y en tests, para validar el motor de
 * conversación sin necesitar credenciales reales de Supabase.
 */
export class InMemoryCreatorRepository implements CreatorRepository {
  private creators = new Map<string, Creator>();
  private log: InteractionLogEntry[] = [];
  private moduleProgress = new Map<string, ModuleProgress>();
  private setupValidations = new Map<string, SetupValidation>();

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
      ciudad: null,
      auth_user_id: null,
      etapa: "nuevo",
      ventana_ingreso_at: null,
      ultimo_mensaje_entrante_at: null,
      ultimo_mensaje_saliente_at: null,
      contexto: {},
      bot_pausado: false,
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

  async listCreators(): Promise<Creator[]> {
    return [...this.creators.values()].sort((a, b) => b.actualizado_at.localeCompare(a.actualizado_at));
  }

  async listInteractionsForCreator(creatorId: string): Promise<InteractionLogEntry[]> {
    return this.log
      .filter((entry) => entry.creator_id === creatorId)
      .sort((a, b) => a.creado_at.localeCompare(b.creado_at));
  }

  // Fase 2 (e-learning) — nada en la simulación de Fase 1 crea progreso de
  // módulos ni validaciones de setup todavía, así que estos mapas arrancan
  // vacíos; existen igual (en vez de devolver siempre []) para que un test
  // futuro del dashboard pueda poblarlos y ejercitar approve/reject/extend.

  /** Solo para pruebas/fixtures: inserta una fila de module_progress ya armada. */
  seedModuleProgress(row: ModuleProgress): void {
    this.moduleProgress.set(row.id, row);
  }

  /** Solo para pruebas/fixtures: inserta una fila de setup_validation ya armada. */
  seedSetupValidation(row: SetupValidation): void {
    this.setupValidations.set(row.id, row);
  }

  async listAllModuleProgress(): Promise<ModuleProgress[]> {
    return [...this.moduleProgress.values()];
  }

  async listModuleProgressForCreator(creatorId: string): Promise<ModuleProgress[]> {
    return [...this.moduleProgress.values()].filter((m) => m.creator_id === creatorId);
  }

  async listAllSetupValidations(): Promise<SetupValidation[]> {
    return [...this.setupValidations.values()].sort((a, b) => b.creado_at.localeCompare(a.creado_at));
  }

  async listSetupValidationsForCreator(creatorId: string): Promise<SetupValidation[]> {
    return [...this.setupValidations.values()]
      .filter((v) => v.creator_id === creatorId)
      .sort((a, b) => b.creado_at.localeCompare(a.creado_at));
  }

  async updateModuleProgress(id: string, patch: Partial<ModuleProgress>): Promise<ModuleProgress> {
    const current = this.moduleProgress.get(id);
    if (!current) throw new Error(`ModuleProgress ${id} no existe`);
    const updated: ModuleProgress = { ...current, ...patch, actualizado_at: new Date().toISOString() };
    this.moduleProgress.set(id, updated);
    return updated;
  }

  async updateSetupValidation(id: string, patch: Partial<SetupValidation>): Promise<SetupValidation> {
    const current = this.setupValidations.get(id);
    if (!current) throw new Error(`SetupValidation ${id} no existe`);
    const updated: SetupValidation = { ...current, ...patch };
    this.setupValidations.set(id, updated);
    return updated;
  }
}
