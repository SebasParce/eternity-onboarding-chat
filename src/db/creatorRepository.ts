import type {
  Creator,
  CreatorStage,
  InteractionLogEntry,
  InteractionRole,
  InteractionType,
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
}
