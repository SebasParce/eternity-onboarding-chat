-- Fase 1: modelo de datos del "estado del creador"
-- Diseñado para ser la única fuente de verdad compartida entre el módulo de
-- CHAT (WhatsApp) y la PLATAFORMA E-LEARNING (fase 2). Ambos módulos leen y
-- escriben sobre estas mismas tablas para sentirse como un solo sistema.

-- ============================================================================
-- ENUM: etapa del creador dentro del flujo de onboarding + programa de 4 días
-- ============================================================================
create type creator_stage as enum (
  'nuevo',                 -- conversación recién iniciada, aún no dio su nombre
  'nombre_recibido',       -- ya dio su nombre, falta @tiktok
  'handle_recibido',       -- ya dio nombre y @tiktok, listo para recibir el programa
  'programa_enviado',      -- se envió el mensaje completo del programa
  'resolviendo_dudas',     -- modo FAQ activo (puede volver aquí las veces que haga falta)
  'quiere_iniciar',        -- presionó/escribió "Quiero iniciar" -> se redirige a e-learning
  'derivado_elearning',    -- ya se entregó el link/acceso a la plataforma e-learning
  -- etapas de la fase 2 (e-learning), incluidas ya en el enum para que el
  -- estado del creador no tenga que migrarse cuando conectemos ese módulo:
  'en_programa_4_dias',    -- dentro de los 4 días de acompañamiento con manager
  'revision_dia_5',        -- manager revisando cumplimiento el día 5
  'ingreso_oficial',       -- completó el programa -> ingresó a Eternity Agency LATAM
  'no_completado'          -- no cumplió el compromiso de los 4 días
);

-- ============================================================================
-- TABLA: creators — estado central de cada creador
-- ============================================================================
create table if not exists creators (
  id uuid primary key default gen_random_uuid(),

  -- identidad
  whatsapp_number text not null unique,   -- E.164, ej. +573001234567 (clave de match del webhook)
  nombre text,
  tiktok_handle text,                     -- sin '@', normalizado en minúsculas

  -- estado del flujo
  etapa creator_stage not null default 'nuevo',

  -- ventanas de tiempo relevantes
  ventana_ingreso_at timestamptz,         -- inicio de los 4 días de acompañamiento (fase 2)
  ultimo_mensaje_entrante_at timestamptz, -- para calcular la ventana de 24h de WhatsApp
  ultimo_mensaje_saliente_at timestamptz,

  -- contexto libre para el motor de conversación (última pregunta hecha, etc.)
  contexto jsonb not null default '{}'::jsonb,

  creado_at timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

create index if not exists idx_creators_whatsapp_number on creators (whatsapp_number);
create index if not exists idx_creators_etapa on creators (etapa);

-- mantiene actualizado_at al día en cada UPDATE
create or replace function set_actualizado_at()
returns trigger as $$
begin
  new.actualizado_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_creators_actualizado_at
before update on creators
for each row execute function set_actualizado_at();

-- ============================================================================
-- TABLA: interaction_log — historial de mensajes y dudas expresadas
-- ============================================================================
create type interaction_type as enum (
  'mensaje_flujo',   -- paso normal del state machine (ej. "¿cuál es tu nombre?")
  'duda_faq',        -- pregunta del creador resuelta por la base de conocimiento
  'evento_sistema'   -- transición de etapa, error de envío, nota de manager, etc.
);

create type interaction_role as enum ('creador', 'sistema', 'manager');

create table if not exists interaction_log (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators (id) on delete cascade,

  rol interaction_role not null,
  tipo interaction_type not null,
  contenido text not null,

  -- si el tipo es 'duda_faq', referencia qué entrada de la FAQ respondió (o null si no matcheó)
  faq_entry_id text,

  -- etapa del creador en el momento del mensaje (útil para depurar el flujo)
  etapa_en_momento creator_stage,

  creado_at timestamptz not null default now()
);

create index if not exists idx_interaction_log_creator_id on interaction_log (creator_id, creado_at);

-- ============================================================================
-- Notas de diseño
-- ============================================================================
-- 1. "ventana_ingreso_at" es lo que separa la conversación de onboarding
--    (fase 1) del programa de 4 días (fase 2). El motor de chat solo la setea
--    en el momento de "derivado_elearning"; la plataforma e-learning es quien
--    la usa para calcular en qué día del programa está el creador.
-- 2. "ultimo_mensaje_entrante_at" es la que el adapter de WhatsApp usa para
--    saber si todavía estamos dentro de la ventana de 24h de mensajes libres,
--    o si hay que enviar una plantilla aprobada por Meta.
-- 3. "contexto" (jsonb) existe para que el state machine guarde cosas puntuales
--    sin requerir una migración nueva por cada campo pequeño (ej. última
--    pregunta de FAQ sin resolver, número de recordatorios enviados).
