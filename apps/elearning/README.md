# Academia de Creadores — Fase 2

Plataforma de e-learning de Eternity Agency LATAM. Next.js (App Router) + TypeScript.
Ver el README de la raíz del repo para cómo encaja con `apps/chat-onboarding` (Fase 1).

## Antes de correr esto

1. **Habilitar Phone Auth en Supabase** — Authentication → Providers → Phone,
   con un proveedor de SMS (Twilio Verify u otro). No hay forma de configurar
   esto por API/MCP; es un paso manual del equipo en el dashboard de Supabase.
2. Copiar `.env.example` a `.env.local` y completar:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — las mismas que usa cualquier cliente de este proyecto de Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY` — **solo servidor**, nunca con prefijo `NEXT_PUBLIC_`. Se usa exclusivamente en las API routes (`src/app/api/`) para vincular la cuenta la primera vez y para las reglas de desbloqueo de módulos — nunca se manda al navegador.

## Cómo funciona el login

Un creador entra con su número de WhatsApp (`/login`) → Supabase Auth manda un
OTP por SMS → al verificarlo, `POST /api/auth/link-account` busca la fila de
`creators` que Fase 1 ya creó por ese número y la vincula (`auth_user_id`) —
nunca crea un creador nuevo. Si no encuentra la fila, es porque ese número
todavía no pasó por el flujo de WhatsApp.

## Contenido de las lecciones

Solo el módulo `setup_espacio` tiene contenido real (el que el equipo ya
entregó, verbatim, en `src/lib/moduleContent.ts`). Los demás (`bienvenida`,
`monetizacion`, `reglas`) muestran un aviso de "contenido pendiente" en vez de
texto inventado — hay que pedirle al equipo el material real y completarlo ahí
mismo. Mientras tanto, un creador puede avanzar confirmando que leyó el aviso,
para que el flujo completo (incluida la validación de setup y el dashboard de
Fase 1) sea probable de punta a punta ya mismo.

## Reglas de negocio importantes

- Las transiciones de `module_progress` (completar un módulo, desbloquear el
  siguiente) las decide siempre el servidor (`/api/modules/complete`, con
  `service_role`) — un creador nunca tiene permiso de escritura directa sobre
  `module_progress` (ver políticas de RLS), justamente para que no pueda
  saltarse módulos.
- Un módulo vencido (`vencido_esperando_extension`) **nunca se auto-extiende**
  — la única forma de recuperarlo es que un mentor lo extienda desde el
  dashboard de Fase 1 (`apps/chat-onboarding`).
- La validación de setup (`validacion_setup`) tampoco se auto-completa: el
  análisis de brillo por canvas es 100% client-side y es solo un pre-filtro
  informativo — la aprobación/rechazo final siempre la hace un mentor humano,
  desde el dashboard de Fase 1.
