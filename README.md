# Eternity Agency LATAM — plataforma de creadores

Un solo producto, dos módulos, una sola base de datos (Supabase):

- **`apps/chat-onboarding`** — Fase 1: onboarding y soporte por WhatsApp Business API (Twilio), motor de conversación, FAQ, y el dashboard interno que usan los managers.
- **`apps/elearning`** — Fase 2: "Academia de Creadores", la plataforma de capacitación (Mi Perfil, módulos con desbloqueo secuencial y ventana de acceso, validación de setup). Next.js + TypeScript, autenticación por teléfono (Supabase Auth OTP).
- **`packages/shared-types`** — tipos de dominio (`Creator`, `CreatorStage`, `ModuleProgress`, `SetupValidation`, ...) compartidos entre los dos, reflejando 1:1 el esquema de `supabase/migrations/`. Correr `npm run build -w @eternity/shared-types` tras editarlo.
- **`supabase/migrations/`** — esquema compartido, con RLS habilitado en las 4 tablas (`creators`, `interaction_log`, `module_progress`, `setup_validation`): un creador autenticado solo lee/escribe su propia fila.

Ambos módulos leen/escriben la **misma fila** de `creators` — Fase 2 nunca crea una fila nueva, solo se vincula (vía `auth_user_id`) a la que Fase 1 ya creó cuando el creador escribió "Quiero iniciar" por WhatsApp.

## Cómo correr esto

```bash
npm install                                # instala todo el monorepo
npm run build -w @eternity/shared-types    # una vez, y tras cada cambio ahí

npm run dev -w apps/chat-onboarding        # webhook + dashboard de managers
npm run dev -w apps/elearning              # Academia de Creadores

npm run typecheck                          # ambas apps
```

Cada app tiene su propio `.env.example` — ver `apps/chat-onboarding/README.md` y `apps/elearning/README.md`.

## Seguridad — RLS

`creators` e `interaction_log` tenían RLS deshabilitado (privilegios abiertos de fábrica para `anon`/`authenticated`) hasta la migración `phase2_data_model_and_rls`. Ahora las 4 tablas del esquema tienen RLS habilitado y privilegios mínimos: un creador autenticado (`auth.uid()`, vinculado vía `creators.auth_user_id`) solo puede leer su propia fila, y solo puede escribir columnas de perfil (`nombre`, `tiktok_handle`, `ciudad`) — nunca `etapa`, `bot_pausado`, ni nada de `module_progress`/`setup_validation` (eso lo deciden las API routes de `apps/elearning` con `service_role`, o un mentor desde el dashboard de Fase 1). El backend de ambas apps sigue usando `service_role`, que ignora RLS.

Pendiente, sin bloquear nada de lo anterior: migrar de las legacy `anon`/`service_role` keys al nuevo sistema de publishable/secret keys antes de que Supabase las deprecie (fin de 2026).
