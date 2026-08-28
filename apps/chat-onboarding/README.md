# Eternity Onboarding Chat — Fase 1

Motor de onboarding conversacional para **Eternity Agency LATAM** (creadores de
TikTok LIVE, programa oficial Backstage). Esta carpeta (`apps/chat-onboarding`,
dentro del monorepo — ver el README de la raíz) cubre la **Fase 1**: el módulo
de CHAT (WhatsApp) + el dashboard de managers. El módulo de e-learning es la
Fase 2 (`apps/elearning`) y comparte la misma base de datos de estado del
creador — incluyendo, desde Fase 2, el progreso de módulos que este dashboard
también muestra.

## Qué incluye esta fase

- **Modelo de datos** del estado del creador en Supabase/Postgres (`supabase/migrations/0001_init.sql`).
- **Motor de conversación** (state machine) que replica el flujo validado con el negocio (`src/conversation/`).
- **Base de conocimiento (FAQ)** con los beneficios y respuestas ya validados (`src/faq/`).
- **Punto de integración con WhatsApp Business API**, con un adapter mock funcional hoy y stubs documentados de Twilio / 360dialog / Gupshup (`src/channels/`).
- Un **script de simulación** que corre la conversación completa de punta a punta sin credenciales reales (`scripts/simulate-conversation.ts`).

## Decisiones tomadas (confirmadas con Sebas)

| Decisión | Elegido |
|---|---|
| Runtime / lenguaje | Node.js + TypeScript |
| Base de datos del estado compartido | Supabase (Postgres) |
| Estrategia de proveedor WhatsApp | Adapter agnóstico (interfaz `WhatsAppChannel`), sin atar el motor a un BSP específico |

## Arquitectura (por qué está dividido así)

```
Webhook del proveedor (Twilio/360dialog/Gupshup)
        │
        ▼
 WhatsAppChannel (interfaz)  ←── el motor NUNCA importa un proveedor directamente
        │
        ▼
 handleInboundMessage()  ──uses──►  CreatorRepository (interfaz)
   (state machine)                  │
        │                           ▼
        │                   Supabase (producción) | InMemory (simulación/tests)
        ▼
 FAQ knowledgeBase (matchFaq)
```

Dos interfaces (`WhatsAppChannel` y `CreatorRepository`) son las que hacen
posible que **el mismo motor de conversación** corra en producción (Supabase +
un BSP real) y en la simulación local (memoria + consola), sin condicionales
de "si estamos en test". Esto también es lo que deja el sistema listo para
conectar cualquiera de los tres proveedores de WhatsApp sin tocar la lógica de
negocio: basta con implementar el adapter real (ver más abajo) y cambiar una
variable de entorno.

## Modelo de datos

Tabla `creators` — estado central de cada creador: `etapa` (enum con todo el
recorrido, incluidas ya las etapas de Fase 2 para no requerir migración
futura), `nombre`, `tiktok_handle`, ventanas de tiempo (`ultimo_mensaje_entrante_at`
para la ventana de 24h de WhatsApp, `ventana_ingreso_at` para los 4 días del
programa en Fase 2) y `contexto` (jsonb libre para el state machine).

Tabla `interaction_log` — historial completo de mensajes y dudas, tipado por
`tipo` (`mensaje_flujo` | `duda_faq` | `evento_sistema`) y `rol` (`creador` |
`sistema` | `manager`). Esto es lo que le da a un manager humano visibilidad
de qué dudas quedaron sin resolver (escaladas) y en qué punto del flujo está
cada creador — y es la misma tabla que leerá la plataforma e-learning para
mostrar el historial completo en el perfil del creador.

Para aplicar la migración en un proyecto real de Supabase:

```bash
# con la Supabase CLI, apuntando a tu proyecto
supabase db push
# o pegar el contenido de supabase/migrations/0001_init.sql en el SQL Editor del dashboard
```

## El flujo de conversación

Replica exactamente el validado con el prototipo:

1. `nuevo` → saluda y pregunta el nombre.
2. `nombre_recibido` → pregunta el @ de TikTok.
3. `handle_recibido` → envía el mensaje completo del "Programa para Creadores Principiantes" (contenido real, sin parafrasear) con el botón **"Quiero iniciar 🚀"**.
4. `resolviendo_dudas` → modo FAQ: cada mensaje se compara contra `src/faq/knowledgeBase.ts`.
   - Si matchea (seguidores, beneficios, horas de LIVE, imprevistos, día 5) → responde con el contenido validado.
   - Si NO matchea → **no improvisa una respuesta**: escala a un manager humano y lo deja registrado en `interaction_log` con `tipo: evento_sistema`.
   - Si detecta la intención "quiero iniciar" (botón o texto libre: "iniciar", "empezar", "listo"...) → pasa al siguiente paso.
5. `derivado_elearning` → envía el link de la plataforma e-learning y cierra el ciclo de esta fase.

Todo el árbol vive en `src/conversation/stateMachine.ts`; el copy vive aparte
en `src/conversation/messages.ts` para que ajustar textos no implique tocar
lógica.

## Base de conocimiento (FAQ)

`src/faq/knowledgeBase.ts` — matching por palabras clave (determinístico, sin
costo de LLM, fácil de auditar) sobre las FAQs ya validadas: beneficios,
seguidores mínimos, horas de LIVE, imprevistos, qué pasa el día 5. Cada
entrada ya incluye un `embeddingText` (la pregunta canónica) pensado para el
día en que esto pase a búsqueda semántica/RAG real — ese día se reemplaza
`matchFaq()` por una búsqueda vectorial, sin tocar el resto del motor ni el
contenido de las respuestas.

## Conectar WhatsApp Business API (cuando haya credenciales)

Hoy, `WHATSAPP_ADAPTER=mock` en `.env` permite probar todo el flujo sin
proveedor real. Cuando Eternity Agency LATAM tenga cuenta de Twilio, 360dialog
o Gupshup:

1. Elegir el proveedor y completar sus credenciales en `.env` (ver `.env.example`).
2. Implementar el adapter correspondiente en `src/channels/adapters/` — los
   tres stubs (`twilioChannel.ts`, `dialog360Channel.ts`, `gupshupChannel.ts`)
   ya documentan, en comentarios, la forma exacta del payload de envío y de
   webhook entrante de cada proveedor, y qué SDK/endpoint usar.
3. Registrar `https://tu-dominio.com/webhook/whatsapp` como webhook en el
   panel del proveedor.
4. Cambiar `WHATSAPP_ADAPTER` en `.env` al proveedor elegido — el motor de
   conversación no cambia.

Nada de esto requiere automatizar DMs de TikTok ni scraping de Backstage —
ambos quedan fuera de alcance por decisión ya tomada con el negocio.

## Cómo correr esto

Este paquete es parte de un workspace de npm — instalar y correr scripts
**desde la raíz del repo** (no desde esta carpeta), usando `-w apps/chat-onboarding`:

```bash
cd ..; cd ..                 # a la raíz del monorepo, si no estás ahí
npm install                  # instala TODO el monorepo (chat-onboarding + elearning + shared-types)
npm run build -w @eternity/shared-types   # una vez, o tras editar packages/shared-types

# 1. Simulación completa sin ninguna credencial (recomendado para revisar el flujo primero)
npm run simulate -w apps/chat-onboarding

# 2. Levantar el webhook localmente con el adapter mock
cp apps/chat-onboarding/.env.example apps/chat-onboarding/.env   # dejar WHATSAPP_ADAPTER=mock
npm run dev -w apps/chat-onboarding
curl -X POST http://localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"from": "+573001234567", "text": "hola"}'

# 3. Typecheck / build de producción
npm run typecheck -w apps/chat-onboarding
npm run build -w apps/chat-onboarding
```

Nota: para probar el webhook contra el adapter mock necesitas además un
proyecto real de Supabase con la migración aplicada (`SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` en `.env`) — `npm run simulate` es la forma de
validar el motor de conversación sin necesitar eso todavía.

## Qué falta para producción (fuera de alcance de esta fase)

- Credenciales reales de un BSP de WhatsApp e implementación del adapter elegido.
- Proyecto Supabase real + aplicar la migración.
- Lógica de plantillas pre-aprobadas por Meta para cuando se sale de la ventana de 24h (hoy el motor no la calcula automáticamente, solo guarda los timestamps necesarios para hacerlo).
- Vista/herramienta para que un manager atienda las dudas escaladas (`interaction_log` con `tipo: evento_sistema` y sin `faq_entry_id`).
- Fase 2: plataforma e-learning — ver `apps/elearning/README.md` y el README de la raíz. Ya implementada (perfil, módulos con desbloqueo secuencial + ventana de acceso, validación de setup); pendiente: habilitar Phone Auth (OTP) en el proyecto de Supabase, contenido real de las lecciones (bienvenida/monetización/reglas) de parte del equipo, y desplegar.
