-- Nota: entre 0001_init.sql y esta migración se aplicaron remotamente (vía
-- Supabase MCP, apply_migration) otras dos que no quedaron capturadas como
-- archivo local en su momento: "harden_set_actualizado_at_search_path" y
-- "add_bot_pausado_to_creators" (agrega la columna creators.bot_pausado,
-- boolean not null default false). Ver supabase/migrations en el proyecto
-- real (mcp__Supabase__list_migrations) para el historial completo.

-- ============================================================================
-- Fase 2: vínculo con Supabase Auth, modelo de datos de e-learning, y RLS.
-- ============================================================================

-- --- 1. creators: vínculo con auth.users + campo de perfil que faltaba ------
alter table public.creators
  add column if not exists auth_user_id uuid unique references auth.users(id),
  add column if not exists ciudad text;

comment on column public.creators.auth_user_id is
  'Vincula la fila con auth.users tras el primer login (OTP por teléfono) del '
  'creador en la plataforma de e-learning. Se completa una sola vez, del lado '
  'servidor (service_role), buscando por whatsapp_number.';

-- --- 2. module_progress: progreso por módulo del programa de e-learning ----
create type public.module_key as enum (
  'perfil',
  'bienvenida',
  'monetizacion',
  'setup_espacio',
  'reglas',
  'validacion_setup',
  'graduacion'
);

create type public.module_status as enum (
  'bloqueado',
  'disponible',
  'en_progreso',
  'completado',
  'vencido_esperando_extension'
);

create table public.module_progress (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  module_key public.module_key not null,
  estado public.module_status not null default 'bloqueado',
  unlocked_at timestamptz,
  expires_at timestamptz,
  extended_at timestamptz,
  extended_by text,
  completed_at timestamptz,
  creado_at timestamptz not null default now(),
  actualizado_at timestamptz not null default now(),
  unique (creator_id, module_key)
);

comment on table public.module_progress is
  'Estado de avance de cada creador por módulo de la Academia de Creadores '
  '(Fase 2). Una fila por (creator_id, module_key).';
comment on column public.module_progress.expires_at is
  'Fin de la ventana de acceso (24-48h) al desbloquear el módulo.';
comment on column public.module_progress.extended_by is
  'Identificador/nombre del mentor que otorgó una extensión tras vencer la ventana. '
  'Nunca se auto-extiende: un módulo vencido queda en '
  'vencido_esperando_extension hasta que un mentor actúe desde el dashboard.';

create trigger set_actualizado_at
  before update on public.module_progress
  for each row execute function public.set_actualizado_at();

-- --- 3. setup_validation: envíos de foto/video del espacio de transmisión --
create type public.validation_status as enum ('pendiente', 'aprobado', 'rechazado');
create type public.validation_media_type as enum ('imagen', 'video');

create table public.setup_validation (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  media_url text not null,
  media_type public.validation_media_type not null,
  brightness_score numeric,
  estado public.validation_status not null default 'pendiente',
  reviewed_by text,
  reviewed_at timestamptz,
  notas text,
  creado_at timestamptz not null default now()
);

comment on table public.setup_validation is
  'Envíos de validación de setup (foto/video del espacio de transmisión). El '
  'brightness_score es un pre-filtro objetivo calculado 100% client-side (nunca '
  'decide nada por sí solo); estado/reviewed_by/reviewed_at los completa un '
  'mentor humano desde el dashboard — nunca se auto-aprueba.';

-- --- 4. RLS: habilitar en las 4 tablas ---------------------------------------
alter table public.creators enable row level security;
alter table public.interaction_log enable row level security;
alter table public.module_progress enable row level security;
alter table public.setup_validation enable row level security;

-- --- 5. Privilegios base: cerrar todo, abrir solo lo necesario --------------
-- anon (visitante sin sesión) no debe tocar ninguna de estas tablas.
revoke all on public.creators, public.interaction_log, public.module_progress, public.setup_validation
  from anon;

-- authenticated (creador con sesión OTP) parte también sin privilegios; se
-- conceden abajo, tabla por tabla, solo lo estrictamente necesario.
revoke all on public.creators, public.interaction_log, public.module_progress, public.setup_validation
  from authenticated;

-- creators: el creador puede leer su fila y actualizar solo columnas de
-- perfil (nunca etapa, bot_pausado, contexto, etc. — eso solo lo toca el
-- backend con service_role). No se concede insert/delete: la fila la crea el
-- backend cuando entra por WhatsApp.
grant select on public.creators to authenticated;
grant update (nombre, tiktok_handle, ciudad) on public.creators to authenticated;

-- interaction_log: sin privilegios para authenticated por ahora (nada en Fase
-- 2 necesita leer el historial de chat de WhatsApp todavía).

-- module_progress: solo lectura: los cambios de estado (desbloqueo, ventana,
-- extensión, completado) los decide el backend/dashboard con service_role
-- según reglas de negocio (video visto + quiz correcto, aprobación de mentor).
grant select on public.module_progress to authenticated;

-- setup_validation: el creador puede insertar su propio envío y ver sus
-- propios envíos; aprobar/rechazar es exclusivo del mentor (service_role).
grant select, insert on public.setup_validation to authenticated;

-- --- 6. Políticas de fila -----------------------------------------------------
create policy creators_select_own on public.creators
  for select
  using (auth.uid() = auth_user_id);

create policy creators_update_own on public.creators
  for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

create policy module_progress_select_own on public.module_progress
  for select
  using (creator_id in (select id from public.creators where auth_user_id = auth.uid()));

create policy setup_validation_select_own on public.setup_validation
  for select
  using (creator_id in (select id from public.creators where auth_user_id = auth.uid()));

create policy setup_validation_insert_own on public.setup_validation
  for insert
  with check (creator_id in (select id from public.creators where auth_user_id = auth.uid()));
