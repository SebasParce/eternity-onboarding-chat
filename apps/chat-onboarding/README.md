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
costo de LLM, fácil de auditar), 317 entradas:

- 5 entradas originales sobre el Programa para Creadores Principiantes (los
  4 días de onboarding): beneficios, seguidores mínimos, horas de LIVE,
  imprevistos, qué pasa el día 5.
- 312 entradas generadas desde "Banco de preguntas y respuestas · Eternity
  Agency" (1/sep/2026, 457 preguntas / 108 páginas) — toda la Parte 1
  ("Creadores") menos las 40 preguntas ⚠ SIN RESOLVER de esa parte. La Parte
  2 (105 preguntas de uso interno de la agencia) se excluye a propósito: el
  documento fuente es explícito en que no debe salir hacia un creador. Cada
  una trae además `respuestaAmpliada` y `fuente` (slide/política + sección +
  número original) para poder auditar el dato, aunque hoy no se envían por
  WhatsApp. Regenerar con
  `python3 scripts/rebuild-faq-from-banco.py /ruta/al/banco.pdf` si el banco
  cambia (requiere `pdftotext` de poppler-utils) — el script imprime el
  fragmento de entradas y estadísticas para verificar los conteos contra la
  portada del PDF; hay que pegar el fragmento a mano en `FAQ_ENTRIES`
  (después de las 5 entradas de onboarding) y confirmar `npm run typecheck`.

Con cientos de entradas, `matchFaq()` ya no es "la primera keyword que
calce": busca en todas las entradas la keyword más larga (más específica)
que aparezca en el mensaje del creador y devuelve la dueña de esa keyword,
para minimizar falsos positivos entre preguntas que comparten palabras
sueltas (p. ej. "bono", "diamantes"). Es deliberadamente estricto — el
documento fuente insiste en que responder con la tabla o el nivel
equivocado es peor que escalar a un manager, así que ante una duda que no
calza lo bastante bien, se escala en vez de forzar una respuesta. Cada
entrada ya incluye un `embeddingText` (pregunta canónica + variantes)
pensado para el día en que esto pase a búsqueda semántica/RAG real.

### Fallback de RAG (9/sep/2026)

Ese día llegó — se agregó un fallback de RAG (`src/faq/localRetrieval.ts` +
`src/faq/ragMatch.ts`) que **solo se llama cuando `matchFaq()` no encontró
nada**, así el costo es cero para todo lo que el matcher de keywords ya
resuelve gratis:

1. **Retrieval local y gratis**: TF-IDF + similitud coseno sobre
   `embeddingText` de las 317 entradas (`localRetrieval.ts`), calculado una
   sola vez al cargar el módulo. Si el mensaje del creador no tiene ningún
   solape de vocabulario relevante con el banco, no hay candidatas y **ni
   siquiera se llama al modelo** — costo $0 para mensajes que no tienen nada
   que ver con la FAQ.
2. **Clasificación, no generación**: si hay candidatas (hasta 5), se llama
   una sola vez a **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) — el
   modelo más barato disponible hoy vía la API directa de Anthropic ($1/MTok
   de entrada, $5/MTok de salida; Haiku 3.5 es más barato pero está retirado
   excepto en Bedrock/Vertex, no se puede llamar así con una API key normal
   — ver `docs.claude.com/en/docs/about-claude/pricing`). El modelo nunca
   redacta la respuesta final: solo elige, vía tool use, el id de la
   candidata correcta (o "NINGUNA") — una llamada de ~1.000-1.500 tokens de
   entrada y ~15 de salida, del orden de **$0.001-0.002 por pregunta
   escalada al RAG**. La respuesta que se envía por WhatsApp sigue siendo
   siempre el texto ya validado de `FaqEntry.respuesta`, nunca texto nuevo
   generado por el modelo — así se evita que invente o mezcle datos de dos
   niveles/tablas, que es justo el error que el banco de preguntas fuente
   marca como el más caro de cometer.
3. Cualquier falla (sin `ANTHROPIC_API_KEY`, error de red, error de la API)
   se traga y devuelve `null` — el bot nunca se cae por esto, simplemente
   escala a un manager humano igual que si no hubiera match de ningún tipo.

**Requiere** `ANTHROPIC_API_KEY` en `.env` (ver `.env.example`; conseguir la
key en console.anthropic.com). Sin esa variable, el fallback es un no-op (log
de aviso) y el bot sigue funcionando solo con `matchFaq()`, como antes de que
existiera este archivo.

**Para probarlo sin pasar por WhatsApp**: `npm run test:rag -- "Como pagan?"`
— muestra qué hace `matchFaq()`, qué candidatas trae el retrieval local, y la
decisión final del modelo. En `interaction_log`, una duda resuelta por este
camino se sigue viendo igual que una resuelta por keywords (`tipo: duda_faq`,
mismo `faq_entry_id`) — no hay hoy una marca aparte para distinguir "la
resolvió el matcher gratis" vs. "la resolvió el RAG"; si en algún momento
quieres medir cuánto se está usando (y cuánto está costando) el fallback,
hay que agregar esa marca.

**Upgrade futuro, si la calidad de retrieval no basta**: TF-IDF es
puramente léxico (compara palabras, no significado) — se eligió a propósito
por ser gratis y porque para preguntas cortas en español con bastante solape
de palabras funciona razonablemente bien. Si algún día notas que preguntas
formuladas de forma muy distinta a como está escrito el banco no encuentran
candidatas, el upgrade natural es reemplazar `localRetrieval.ts` por
embeddings reales (Anthropic no ofrece API de embeddings propia; recomienda
Voyage AI) sin tocar `ragMatch.ts` ni el resto del motor.

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
