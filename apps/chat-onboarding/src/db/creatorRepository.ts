import type {
  Creator,
  CreatorStage,
  InteractionLogEntry,
  InteractionRole,
  InteractionType,
  ModuleProgress,
  SetupValidation,
} from "../types/domain.js";

/**
 * Puerto (interfaz) del repositorio de creadores. El motor de conversación
 * (src/conversation/stateMachine.ts) solo depende de esta interfaz, nunca de
 * Supabase directamente — así el mismo motor corre en:
 *   - producción, contra Supabase (SupabaseCreatorRepository)
 *   - scripts/simulate-conversation.ts, en memoria (InMemoryCreatorRepository)
 * sin cambiar una línea de lógica de negocio.
 */
export interface CreatorRepository {
  findByWhatsappNumber(whatsappNumber: string): Promise<Creator | null>;
  create(whatsappNumber: string): Promise<Creator>;
  update(
    id: string,
    patch: Partial<
      Pick<
        Creator,
        | "nombre"
        | "tiktok_handle"
        | "etapa"
        | "ventana_ingreso_at"
        | "ultimo_mensaje_entrante_at"
        | "ultimo_mensaje_saliente_at"
        | "contexto"
        | "bot_pausado"
      >
    >
  ): Promise<Creator>;
  logInteraction(entry: {
    creator_id: string;
    rol: InteractionRole;
    tipo: InteractionType;
    contenido: string;
    faq_entry_id?: string | null;
    etapa_en_momento: CreatorStage;
  }): Promise<InteractionLogEntry>;

  /** Todos los creadores, más recientemente activos primero. Para el dashboard. */
  listCreators(): Promise<Creator[]>;

  /** Historial completo de un creador, en orden cronológico. Para el dashboard. */
  listInteractionsForCreator(creatorId: string): Promise<InteractionLogEntry[]>;

  // --- Fase 2 (Academia de creadores / e-learning) — lectura para el dashboard.
  // Escritas por apps/elearning y por el backend con service_role; nunca por el
  // motor de WhatsApp. Se leen todas de una vez (igual que listCreators) y el
  // dashboard agrupa/deriva lo que necesita, en vez de agregar una query por fila.

  /** Progreso de todos los módulos, de todos los creadores. Para las vistas de lista del dashboard. */
  listAllModuleProgress(): Promise<ModuleProgress[]>;

  /** Progreso de módulos de un creador puntual, sin ordenar (el caller aplica MODULE_ORDER). */
  listModuleProgressForCreator(creatorId: string): Promise<ModuleProgress[]>;

  /** Todos los envíos de validación de setup, de todos los creadores. */
  listAllSetupValidations(): Promise<SetupValidation[]>;

  /** Envíos de validación de setup de un creador puntual, más reciente primero. */
  listSetupValidationsForCreator(creatorId: string): Promise<SetupValidation[]>;

  /**
   * Escritura de module_progress — usada por el dashboard para: aprobar/
   * rechazar validación de setup (completa 'validacion_setup' y desbloquea
   * 'graduacion') y para que un mentor extienda un módulo vencido. apps/
   * elearning nunca llama esto directo desde el navegador (usa sus propias
   * API routes con service_role) — este método es para el dashboard de Fase 1.
   */
  updateModuleProgress(
    id: string,
    patch: Partial<Pick<ModuleProgress, "estado" | "unlocked_at" | "expires_at" | "extended_at" | "extended_by" | "completed_at">>
  ): Promise<ModuleProgress>;

  /** Escritura de setup_validation — usada por el dashboard para aprobar/rechazar un envío. */
  updateSetupValidation(
    id: string,
    patch: Partial<Pick<SetupValidation, "estado" | "reviewed_by" | "reviewed_at" | "notas">>
  ): Promise<SetupValidation>;
}
