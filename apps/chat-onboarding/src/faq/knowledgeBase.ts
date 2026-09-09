/**
 * Base de conocimiento (FAQ) del modo "resolviendo_dudas".
 *
 * Fase 1: matching por palabras clave (determinístico, sin costo de LLM,
 * fácil de auditar). Cada entrada expone `keywords` para el matcher simple
 * de hoy y un `embeddingText` explícito (la pregunta canónica + variantes)
 * ya preparado para el día en que esto se mueva a búsqueda semántica/RAG
 * real — en ese momento solo se reemplaza `matchFaq()` por una búsqueda
 * vectorial sobre `embeddingText`, sin tocar el resto del motor.
 *
 * Contenido:
 * - 5 entradas originales sobre el Programa para Creadores Principiantes
 *   (los 4 días de onboarding: beneficios de unirse, seguidores mínimos,
 *   horas de LIVE, imprevistos, qué pasa el día 5). Esta parte del flujo
 *   ocurre ANTES de que el creador entre oficialmente a la agencia.
 * - 312 entradas generadas a partir de "Banco de preguntas y respuestas ·
 *   Eternity Agency" (1 de septiembre de 2026, uso interno de la agencia,
 *   457 preguntas / 108 páginas). Son la Parte 1 completa de ese documento
 *   ("Lo que se le puede responder a un creador") menos las 40 preguntas
 *   marcadas ⚠ SIN RESOLVER en esa parte (sin respuesta verificada en el
 *   material — no se deben inventar). La Parte 2 del documento (105
 *   preguntas de uso interno de la agencia: sanciones, Health Score,
 *   economía de estudios, reportes entre agencias) queda fuera a propósito:
 *   el documento fuente es explícito en que "nada de ahí sale hacia un
 *   creador".
 *
 *   Estas 312 preguntas son sobre la vida del creador YA dentro de la
 *   agencia (bonos mensuales, nivel Elite, batallas, algoritmo, Group LIVE,
 *   políticas de TikTok, etc.) — un universo de temas más amplio que el de
 *   las 5 entradas originales de onboarding. Se agregan a la misma base
 *   porque el mismo modo FAQ puede recibir ese tipo de pregunta incluso
 *   antes de que el creador entre formalmente. Cada entrada trae además
 *   `respuestaAmpliada` (para si el creador repregunta) y `fuente` (slide o
 *   política exacta del banco, más la sección y el número de pregunta
 *   original) para poder auditar/verificar el dato — ninguna de las dos se
 *   envía por WhatsApp automáticamente hoy, quedan disponibles para un
 *   manager o para una futura función de "cuéntame más".
 *
 *   Regenerado desde el PDF con
 *   `apps/chat-onboarding/scripts/` (ver también el histórico de esta
 *   conversación) — si el banco de preguntas se actualiza, hay que volver a
 *   correr esa extracción en vez de editar las 312 entradas a mano.
 */

export interface FaqEntry {
  id: string;
  /** Pregunta canónica, se usa como texto a "embeddear" en la fase RAG. */
  embeddingText: string;
  /** Palabras/frases que activan esta entrada en el matcher de fase 1. */
  keywords: string[];
  /** Respuesta corta, lista para mandar tal cual por WhatsApp. */
  respuesta: string;
  /** Respuesta ampliada (para si el creador repregunta). No se auto-envía hoy. */
  respuestaAmpliada?: string;
  /** Slide/política exacta + sección + número de pregunta en el banco fuente, para poder verificar el dato. */
  fuente?: string;
}

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "beneficios_agencia",
    embeddingText:
      "¿Qué beneficios tiene estar en Eternity Agency LATAM? ¿Qué gano al unirme a la agencia?",
    keywords: [
      "beneficio",
      "beneficios",
      "que gano",
      "qué gano",
      "que me ofrece",
      "ventajas",
      "por que unirme",
      "por qué unirme",
    ],
    respuesta:
      "Estos son los beneficios de ser parte de Eternity Agency LATAM 💚\n\n" +
      "1️⃣ Manager personal — acompañamiento constante en todo tu proceso.\n" +
      "2️⃣ Equipo de marketing y contabilidad — te ayudamos a optimizar tu monetización.\n" +
      "3️⃣ Soporte técnico — resolvemos inconvenientes con TikTok o tus transmisiones.\n" +
      "4️⃣ Incentivos y recompensas por constancia.\n\n" +
      "¿Tienes alguna otra duda antes de empezar? 😊",
  },
  {
    id: "seguidores_minimos",
    embeddingText:
      "¿Cuántos seguidores necesito para entrar al programa o a la agencia? ¿Hay un mínimo de seguidores?",
    keywords: ["seguidor", "seguidores", "followers", "minimo de seguidores", "mínimo de seguidores"],
    respuesta:
      "El Programa para Creadores Principiantes no exige un número mínimo de seguidores 🙌 " +
      "Lo que sí te pedimos es compromiso: transmitir todos los días, con LIVEs de mínimo 2 horas, " +
      "durante los 4 días del programa. El foco es crear el hábito y mejorar la calidad de tus LIVE, " +
      "no partir de una cifra de seguidores.\n\n¿Alguna otra duda? 😊",
  },
  {
    id: "horas_de_live",
    embeddingText:
      "¿Cuántas horas debo transmitir en vivo? ¿Cuál es la duración mínima del LIVE durante el programa?",
    keywords: ["horas", "duracion", "duración", "cuanto tiempo", "cuánto tiempo", "cuanto dura", "cuánto dura"],
    respuesta:
      "Durante los 4 días del programa te pedimos que cada LIVE tenga una duración mínima de 2 horas, " +
      "transmitiendo todos los días. Eso es lo que nos permite ver una evolución real en tu constancia y " +
      "en los resultados. Tu manager te acompaña antes, durante y después de cada transmisión.\n\n" +
      "¿Tienes alguna otra duda? 😊",
  },
  {
    id: "imprevistos",
    embeddingText:
      "¿Qué pasa si tengo un imprevisto y no puedo transmitir un día del programa? ¿Puedo faltar un día?",
    keywords: [
      "imprevisto",
      "imprevistos",
      "no puedo",
      "falta",
      "faltar",
      "emergencia",
      "no alcanzo",
      "se me complica",
    ],
    respuesta:
      "Entendemos que pueden surgir imprevistos 🙏 Lo importante es que le avises a tu manager apenas lo sepas " +
      "— igual que le avisas 10 minutos antes de cada transmisión. La constancia es clave para el objetivo de los " +
      "4 días, así que entre los dos vemos cómo reorganizar tu LIVE de esa jornada sin perder el ritmo del programa.\n\n" +
      "¿Alguna otra duda? 😊",
  },
  {
    id: "que_pasa_al_finalizar",
    embeddingText:
      "¿Qué pasa el día 5? ¿Cómo entro oficialmente a la agencia después del programa?",
    keywords: ["dia 5", "día 5", "al finalizar", "despues del programa", "después del programa", "ingreso oficial"],
    respuesta:
      "El quinto día tu manager revisa todo tu proceso 💚 Si completaste el programa con compromiso y constancia " +
      "(transmitiendo cada día, con LIVEs de mínimo 2 horas y avisando antes de cada transmisión), ese día se hace " +
      "tu ingreso oficial a Eternity Agency LATAM.\n\n¿Alguna otra duda? 😊",
  },
  {
    id: "programa-1-1",
    embeddingText: `¿Cuántas horas tengo que transmitir al mes? También preguntan: "¿cuál es el mínimo de horas?"; "¿cuánto tengo que transmitir?"`,
    keywords: [`Cuántas horas tengo que transmitir al mes`, `cuál es el mínimo de horas`, `cuánto tengo que transmitir`],
    respuesta: `90 horas al mes. Es el mínimo para que se te active cualquier bono.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Las 90 horas aparecen en la columna izquierda de todas las tablas de bonos, desde el escalón más bajo hasta el más alto. Sin ellas la tabla de bonificaciones no existe para ti, por muchos diamantes que hagas. Van siempre acompañadas de los 22 días.`,
    fuente: `Slide 10 · Programa, bonos y permanencia · 1.1`,
  },
  {
    id: "programa-1-2",
    embeddingText: `¿Cuántos días tengo que conectarme al mes? También preguntan: "¿cuántos días son obligatorios?"; "¿puedo transmitir solo fines de semana?"`,
    keywords: [`Cuántos días tengo que conectarme al mes`, `cuántos días son obligatorios`, `puedo transmitir solo fines de semana`],
    respuesta: `22 días al mes. Y no, no se puede concentrar todo en fines de semana: son 22 días distintos de conexión.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los 22 días son la otra condición fija de todas las tablas. 90 horas repartidas en 22 días da poco más de 4 horas por día. Transmitir maratones el fin de semana y desaparecer entre semana no compensa, porque el requisito de días se incumple aunque las horas cuadren.`,
    fuente: `Slide 10 · Programa, bonos y permanencia · 1.2`,
  },
  {
    id: "programa-1-3",
    embeddingText: `¿Las horas y los días se acumulan de un mes a otro? También preguntan: "¿lo del mes pasado me sirve?"; "¿se suman las horas?"`,
    keywords: [`Las horas y los días se acumulan de un mes a otro`, `lo del mes pasado me sirve`, `se suman las horas`],
    respuesta: `No. Todo se reinicia mes a mes, del primer día al último. Lo que hiciste en junio no cuenta para julio.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El reinicio aplica a diamantes, horas y días por igual. Por eso conviene mirar en qué día del mes estás antes de fijar la meta: si vas por el día 20 y llevas 8 días, ya no alcanzas los 22 de ese mes y la meta realista es el mes siguiente.`,
    fuente: `Slide 9 · Programa, bonos y permanencia · 1.3`,
  },
  {
    id: "programa-1-4",
    embeddingText: `Si hago las 90 horas y los 22 días pero no llego a ningún escalón de diamantes, ¿me pagan algo? También preguntan: "hice todo y no me pagaron"; "por qué no me llegó nada"`,
    keywords: [`Si hago las 90 horas y los 22 días pero no llego a ningún escalón de diamantes, ¿me pagan algo`, `hice todo y no me pagaron`, `por qué no me llegó nada`],
    respuesta: `No. Las horas y los días habilitan la tabla, pero el bono lo activa la monetización. Necesitas las tres cosas juntas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es el error de cálculo más común. Horas y días son la puerta de entrada, no el pago. Con 90 horas, 22 días y 0 diamantes no hay bono. Con 300.000 diamantes y 20 días tampoco. Las tres condiciones se cumplen o no hay nada.`,
    fuente: `Slide 10 · Programa, bonos y permanencia · 1.4`,
  },
  {
    id: "programa-1-5",
    embeddingText: `Cumplí los diamantes pero me quedé en 20 días, ¿pierdo todo?`,
    keywords: [`Cumplí los diamantes pero me quedé en 20 días, ¿pierdo todo`],
    respuesta: `Sí, se pierde el premio completo. No hay pago parcial por quedarse cerca.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material es explícito en que es indispensable cumplir diamantes, horas y días, las tres, no dos de tres. Perder un bono por dos días de conexión es justamente lo que el calendario de LIVE busca evitar, porque avisa antes de que llegue fin de mes.`,
    fuente: `Slide 9 · Programa, bonos y permanencia · 1.5`,
  },
  {
    id: "programa-2-1",
    embeddingText: `¿Qué es este programa y quién lo paga? También preguntan: "¿esto tiene costo?"; "¿quién financia esto?"`,
    keywords: [`Qué es este programa y quién lo paga`, `esto tiene costo`, `quién financia esto`],
    respuesta: `Es TikTok LIVE Academy, agencias LATAM. Es 100% auspiciado y pagado por TikTok LATAM. A ti no te cuesta.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El objetivo declarado es formar creadores novatos y principiantes hasta que consigan su monetización y construyan comunidad. Es un proceso financiado y respaldado por TikTok, lo que significa que hay alguien poniendo dinero para que te formes, y a cambio se esperan los cuatro compromisos del creador.`,
    fuente: `Slides 7 y 15 · Programa, bonos y permanencia · 2.1`,
  },
  {
    id: "programa-2-2",
    embeddingText: `¿Cuál es el objetivo del programa?`,
    keywords: [`Cuál es el objetivo del programa`],
    respuesta: `Que llegues a ser un creador autosuficiente, en crecimiento constante y con tu marca personal construida.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Autosuficiente quiere decir que llegue el día en que no necesites preguntarle a nadie qué hacer un martes a las ocho de la noche. La agencia acompaña: da el mapa, los bonos, el acompañamiento y las herramientas. La transmisión la das tú.`,
    fuente: `Slide 4 · Programa, bonos y permanencia · 2.2`,
  },
  {
    id: "programa-2-3",
    embeddingText: `¿La agencia me consigue la audiencia? También preguntan: "¿ustedes me promocionan?"; "¿la agencia me hace crecer?"`,
    keywords: [`La agencia me consigue la audiencia`, `ustedes me promocionan`, `la agencia me hace crecer`],
    respuesta: `No. La agencia da mapa, bonos, acompañamiento y herramientas. La transmisión y el crecimiento los pones tú.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Creer que entrar a una agencia es lo que genera el crecimiento, en vez de la constancia propia, es uno de los errores señalados en el material. El crecimiento sale de la ecuación de más días más horas, no de la afiliación.`,
    fuente: `Slide 4 · Programa, bonos y permanencia · 2.3`,
  },
  {
    id: "programa-2-4",
    embeddingText: `¿Este programa sirve si nunca he transmitido? También preguntan: "¿esto es para principiantes?"; "¿me sirve si ya llevo tiempo?"`,
    keywords: [`Este programa sirve si nunca he transmitido`, `esto es para principiantes`, `me sirve si ya llevo tiempo`],
    respuesta: `Sirve para los dos casos: para el que arranca de cero y para el que ya transmite y siente que se estancó.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material dice que la diferencia entre los dos no está en el contenido sino en qué tan rápido aplican lo que ven, y apunta que el de cero a veces avanza más rápido porque no trae mañas. El riesgo del que ya transmite es saltarse los módulos básicos pensando que se los sabe, y después fallar en lo básico.`,
    fuente: `Slide 2 · Programa, bonos y permanencia · 2.4`,
  },
  {
    id: "programa-2-5",
    embeddingText: `¿Cuáles son mis responsabilidades como creador del programa?`,
    keywords: [`Cuáles son mis responsabilidades como creador del programa`],
    respuesta: `Cuatro: cumplir objetivos y horarios sugeridos, aplicar las recomendaciones del equipo y la plataforma, mantener constancia y actitud profesional, y participar en entrenamientos, dinámicas y evaluaciones.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Son los cuatro compromisos que se asumen al entrar. El material añade una advertencia directa: el programa está diseñado para personas comprometidas, y si un creador no lo toma en serio, no cumple o no muestra disposición para mejorar, no puede continuar en el proceso.`,
    fuente: `Slide 7 · Programa, bonos y permanencia · 2.5`,
  },
  {
    id: "programa-2-8",
    embeddingText: `¿Qué voy a aprender en el programa?`,
    keywords: [`Qué voy a aprender en el programa`],
    respuesta: `Seis temas: crecimiento y monetización sostenible en LIVE, marca personal y conexión con la audiencia, técnicas y herramientas de contenido, comunidad y red, normas de la comunidad, y funcionalidades y herramientas LIVE.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material marca dos con especial insistencia. En “sostenible” el punto es que no se trata de pegar un live bueno sino de que se sostenga. Y las normas de la comunidad son el tema que a todo el mundo le parece aburrido y el que tumba cuentas, por eso no se debe saltar.`,
    fuente: `Slide 3 · Programa, bonos y permanencia · 2.8`,
  },
  {
    id: "programa-3-1",
    embeddingText: `¿Qué premios hay para principiantes?`,
    keywords: [`Qué premios hay para principiantes`],
    respuesta: `Tres. Bronce con 80.000 diamantes gana trípode para live. Plata con 150.000 gana proyector. Oro con 300.000 gana Alexa.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los tres piden además lo mismo por debajo: 22 días de conexión y 90 horas de transmisión en el mes. Son premios físicos, no dinero. Solo aplican para creadores de nivel principiante.`,
    fuente: `Slide 9 · Programa, bonos y permanencia · 3.1`,
  },
  {
    id: "programa-3-2",
    embeddingText: `¿El premio de principiante lo puedo ganar más de una vez?`,
    keywords: [`El premio de principiante lo puedo ganar más de una vez`],
    respuesta: `No. Es un premio no recurrente, se gana una sola vez.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 9 · Programa, bonos y permanencia · 3.2`,
  },
  {
    id: "programa-4-1",
    embeddingText: `¿Cuánto me pagan según los diamantes que haga? También preguntan: "¿cuál es la tabla de bonos?"; "¿cuánto gano con X diamantes?"`,
    keywords: [`Cuánto me pagan según los diamantes que haga`, `cuál es la tabla de bonos`, `cuánto gano con X diamantes`],
    respuesta: `80.000 diamantes son 20 dólares, 150.000 son 35, 300.000 son 70, 500.000 son 100, 800.000 son 130, 1.200.000 son 180, 1.600.000 son 220 y 3.000.000 son 280 dólares.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Toda la tabla exige lo mismo en la columna izquierda: 90 horas y 22 días, en todas las filas sin excepción. La recomendación del material es no apuntarle a la fila más alta en el primer mes, sino a la fila inmediatamente superior a donde estás hoy.`,
    fuente: `Slide 10 · Programa, bonos y permanencia · 4.1`,
  },
  {
    id: "programa-4-2",
    embeddingText: `¿Cómo sé cuántos diamantes llevo este mes?`,
    keywords: [`Cómo sé cuántos diamantes llevo este mes`],
    respuesta: `En tu panel de creador dentro de TikTok. Ahí se ven los diamantes acumulados del mes.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El ejercicio que propone el material es mirar el acumulado y poner el dedo en la fila de la tabla que queda justo arriba: esa es la meta del mes, no la de tres millones.`,
    fuente: `Slide 10 · Programa, bonos y permanencia · 4.2`,
  },
  {
    id: "programa-4-3",
    embeddingText: `¿A qué escalón debería apuntarle este mes?`,
    keywords: [`A qué escalón debería apuntarle este mes`],
    respuesta: `Al inmediatamente superior al que llevas hoy, no al más alto de la tabla.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error que marca el material es apuntarle a la fila más alta en el primer mes y frustrarse. La tabla se sube escalón por escalón.`,
    fuente: `Slide 10 · Programa, bonos y permanencia · 4.3`,
  },
  {
    id: "programa-5-1",
    embeddingText: `¿Cuál es la diferencia entre el bono por actividad y el bono por rango? También preguntan: "¿por qué hay dos tablas?"; "¿son dos bonos distintos?"`,
    keywords: [`Cuál es la diferencia entre el bono por actividad y el bono por rango`, `por qué hay dos tablas`, `son dos bonos distintos`],
    respuesta: `El de actividad te paga por llegar a un escalón de diamantes en el mes. El de rango te paga por sostener el nivel que ya tenías el mes anterior.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Por eso la tabla de rango está en rangos y no en cifras exactas: de 80.000 a 149.000 son 20 dólares, de 150.000 a 299.000 son 35, y así hasta 3.000.000 o más que son 280. La condición escrita es que el creador, respecto a su nivel obtenido el mes anterior, debe sostenerse durante el mes en curso en ese nivel. Y también exige las 90 horas y los 22 días.`,
    fuente: `Slide 11 · Programa, bonos y permanencia · 5.1`,
  },
  {
    id: "programa-5-2",
    embeddingText: `Subí mucho un mes y al siguiente bajé, ¿cobro el bono por rango?`,
    keywords: [`Subí mucho un mes y al siguiente bajé, ¿cobro el bono por rango`],
    respuesta: `No. Si te caes de rango no cobras el bono por rango, aunque hayas hecho tus 90 horas y tus 22 días.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El ejemplo del material: una creadora hizo 310.000 diamantes en mayo y 90.000 en junio; otra hizo 310.000 en mayo y 320.000 en junio. Las dos cumplieron horas y días. Solo la segunda cobra. El riesgo típico es subir mucho un mes gracias a un solo donador grande y no poder sostener el rango al mes siguiente.`,
    fuente: `Slide 11 · Programa, bonos y permanencia · 5.2`,
  },
  {
    id: "programa-5-3",
    embeddingText: `¿Cuáles son los rangos de la app?`,
    keywords: [`Cuáles son los rangos de la app`],
    respuesta: `Ocho. Rango 1 de 0 a 40.000, rango 2 de 40.000 a 80.000, rango 3 de 80.000 a 150.000, rango 4 de 150.000 a 300.000, rango 5 de 300.000 a 500.000, rango 6 de 500.000 a 800.000, rango 7 de 800.000 a 1.200.000 y rango 8 de 1.200.000 a 1.600.000.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es la categorización que hace la app según diamantes. Sirve para saber si estás cerca de ascender, que es lo que activa el 15% adicional.`,
    fuente: `Slide 12 · Programa, bonos y permanencia · 5.3`,
  },
  {
    id: "programa-5-5",
    embeddingText: `¿Cómo sé en qué rango quedé el mes pasado?`,
    keywords: [`Cómo sé en qué rango quedé el mes pasado`],
    respuesta: `Revisando tus diamantes del mes anterior contra la tabla de los ocho rangos.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error que marca el material es no revisar en qué rango quedó el mes anterior y por eso no darse cuenta de que se estaba a pocos diamantes de ascender.`,
    fuente: `Slide 12 · Programa, bonos y permanencia · 5.5`,
  },
  {
    id: "programa-6-1",
    embeddingText: `¿Qué es el plan de conexión?`,
    keywords: [`Qué es el plan de conexión`],
    respuesta: `Son cuatro decisiones: qué días de la semana transmites, en qué franja horaria, cuánto dura cada live, y tu plan de acción fuera del live.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La duración sugerida es de dos horas en adelante. El plan de acción incluye full interacción con los espectadores mientras transmites, consumir TikTok en tus tiempos libres, ver lives de otras personas (para hacer amistades y para ver en vivo los conceptos de los módulos) y subir dos a tres videos semanales.`,
    fuente: `Slide 13 · Programa, bonos y permanencia · 6.1`,
  },
  {
    id: "programa-6-2",
    embeddingText: `¿Cuánto tiene que durar cada live?`,
    keywords: [`Cuánto tiene que durar cada live`],
    respuesta: `Lo sugerido es de dos horas en adelante. Dos horas es el piso, no la meta.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 13 · Programa, bonos y permanencia · 6.2`,
  },
  {
    id: "programa-6-3",
    embeddingText: `¿Tengo que subir videos además de transmitir?`,
    keywords: [`Tengo que subir videos además de transmitir`],
    respuesta: `Sí, dos a tres videos semanales hacen parte del plan de acción.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es el punto que más se olvida. El material lo resume en que el live no vive solo.`,
    fuente: `Slide 13 · Programa, bonos y permanencia · 6.3`,
  },
  {
    id: "programa-7-1",
    embeddingText: `¿Cuáles son las misiones que tengo que cumplir al entrar?`,
    keywords: [`Cuáles son las misiones que tengo que cumplir al entrar`],
    respuesta: `Dos. Misión 1: en tus primeros 15 días, 50% de actividad, o sea 7 días válidos. Misión 2: en tus primeros 30 días, 60% de actividad, o sea 18 días válidos.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Se cuentan desde el día en que entras, no desde el primero del mes. El material insiste en marcar el día 15 y el día 30 en el calendario apenas se entra, porque son las dos fechas de corte.`,
    fuente: `Slide 15 · Programa, bonos y permanencia · 7.1`,
  },
  {
    id: "programa-7-2",
    embeddingText: `¿Qué cuenta como día válido?`,
    keywords: [`Qué cuenta como día válido`],
    respuesta: `Un día en el que hiciste al menos un LIVE de más de 25 minutos consecutivos y recibiste al menos 1 diamante. Las tres condiciones juntas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La definición viene del módulo 2, no de la presentación de introducción. Los 25 minutos tienen que ser consecutivos, no la suma de varios lives cortos, y el diamante tiene que existir: un live largo sin ningún diamante no cuenta como día válido.`,
    fuente: `Glosario, módulo 2 · Programa, bonos y permanencia · 7.2`,
  },
  {
    id: "programa-7-3",
    embeddingText: `¿Puedo empezar suave la primera semana y ponerme al día después?`,
    keywords: [`Puedo empezar suave la primera semana y ponerme al día después`],
    respuesta: `No da. La misión 1 son solo 15 días: si arrancas en el día 8, ya necesitas 7 de 7.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es el error típico que marca el material. Como la ventana es corta, cada día que se pierde al principio sube el porcentaje exigido en los que quedan, hasta volverse imposible.`,
    fuente: `Slide 15 · Programa, bonos y permanencia · 7.3`,
  },
  {
    id: "programa-8-1",
    embeddingText: `¿Por qué insisten tanto en la constancia?`,
    keywords: [`Por qué insisten tanto en la constancia`],
    respuesta: `Porque la ecuación del programa es más días más horas igual monetización. No depende solo de aprender buenas estrategias.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Se descompone en tres variables que se multiplican, no se suman: constancia (no desaparecer tres semanas y volver), frecuencia (cuántas veces por semana estás en vivo) y duración (cuánto dura cada live). Un creador que transmite todos los días 20 minutos no está haciendo lo mismo que uno que transmite tres veces por semana tres horas, y los dos están lejos del que tiene las tres bien.`,
    fuente: `Slide 6 · Programa, bonos y permanencia · 8.1`,
  },
  {
    id: "programa-8-2",
    embeddingText: `¿Sirve hacer maratones el fin de semana para cuadrar las horas?`,
    keywords: [`Sirve hacer maratones el fin de semana para cuadrar las horas`],
    respuesta: `No. Las horas no compensan los días, y el requisito de 22 días se incumple igual.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 6 · Programa, bonos y permanencia · 8.2`,
  },
  {
    id: "elite-1-1",
    embeddingText: `¿Cuál es la diferencia entre el programa Elite y el de principiante? También preguntan: "¿qué cambia en Elite?"; "¿por qué mi tabla es distinta?"`,
    keywords: [`Cuál es la diferencia entre el programa Elite y el de principiante`, `qué cambia en Elite`, `por qué mi tabla es distinta`],
    respuesta: `En Elite son 80 horas al mes en vez de 90, pero la vara de diamantes sube: tu primer bono arranca en 100.000 en vez de 80.000. Además tienes un bono que en principiante no existe, el de retención y crecimiento.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material lo resume así: en principiante te miden el aguante, en Elite ya demostraste que aguantas y te miden el rendimiento por hora. Cambian los premios, cambia la tabla de actividad completa, y se suma el bono de crecimiento del slide 11.`,
    fuente: `Gancho y slide 8 · Elite: bonos y crecimiento · 1.1`,
  },
  {
    id: "elite-1-2",
    embeddingText: `¿Por qué en Elite son 80 horas y en principiante 90?`,
    keywords: [`Por qué en Elite son 80 horas y en principiante 90`],
    respuesta: `Porque la exigencia se movió al resultado. Te piden menos horas y más diamantes por esas horas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Nadie regala diez horas: a cambio de las diez menos, el primer escalón de la tabla sube de 80.000 a 100.000 diamantes.`,
    fuente: `Gancho · Elite: bonos y crecimiento · 1.2`,
  },
  {
    id: "elite-1-3",
    embeddingText: `¿Cuánto más se gana en Elite que en principiante?`,
    keywords: [`Cuánto más se gana en Elite que en principiante`],
    respuesta: `En el escalón más alto, más del doble. Tres millones de diamantes pagan 280 dólares en principiante y 700 en Elite.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material subraya que es la misma transmisión y el mismo mes pagados distinto, y que la diferencia no sale de trabajar más horas sino de rendir más por hora.`,
    fuente: `Slide 10 · Elite: bonos y crecimiento · 1.3`,
  },
  {
    id: "elite-1-4",
    embeddingText: `Estaba viendo el video de bienvenida general, ¿me sirve?`,
    keywords: [`Estaba viendo el video de bienvenida general, ¿me sirve`],
    respuesta: `No si eres Elite. Hay dos versiones de la capacitación y las cifras no son las mismas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El video general es para el creador nuevo, sin monetización todavía. El Elite es para el que ya transmite, ya monetiza y ya sabe lo que es cerrar un mes contando diamantes. El error que marca el material es planear el mes con la tabla equivocada.`,
    fuente: `Slide 1 · Elite: bonos y crecimiento · 1.4`,
  },
  {
    id: "elite-2-1",
    embeddingText: `¿Cuántas horas y días necesito al mes en Elite?`,
    keywords: [`Cuántas horas y días necesito al mes en Elite`],
    respuesta: `80 horas de transmisión y 22 días de conexión al mes. Aparecen en los ocho escalones de la tabla.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 10 · Elite: bonos y crecimiento · 2.1`,
  },
  {
    id: "elite-2-2",
    embeddingText: `Si cumplo las 80 horas y los 22 días pero no llego a 100.000 diamantes, ¿me pagan algo?`,
    keywords: [`Si cumplo las 80 horas y los 22 días pero no llego a 100.000 diamantes, ¿me pagan algo`],
    respuesta: `No. Las horas y los días habilitan la tabla, la monetización activa el bono. Se necesitan las tres.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 10 · Elite: bonos y crecimiento · 2.2`,
  },
  {
    id: "elite-2-3",
    embeddingText: `¿Las horas y los días se acumulan de un mes a otro?`,
    keywords: [`Las horas y los días se acumulan de un mes a otro`],
    respuesta: `No. Las métricas se reinician mes a mes, del primer día al último.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 9 · Elite: bonos y crecimiento · 2.3`,
  },
  {
    id: "elite-3-1",
    embeddingText: `¿Qué premios hay en Elite?`,
    keywords: [`Qué premios hay en Elite`],
    respuesta: `Tres. Bronce Elite con 100.000 diamantes gana proyector. Plata Elite con 250.000 gana Alexa. Oro Elite con 450.000 gana micrófono profesional.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los tres exigen además 22 días de conexión y 80 horas de transmisión en el mes. El detalle que señala el material: el proyector, que en principiante era el premio del medio, en Elite es el de entrada. Tu piso es el techo de otro.`,
    fuente: `Slide 9 · Elite: bonos y crecimiento · 3.1`,
  },
  {
    id: "elite-3-3",
    embeddingText: `¿A cuál de los tres premios Elite debería apuntarle?`,
    keywords: [`A cuál de los tres premios Elite debería apuntarle`],
    respuesta: `Al realista según tus diamantes del mes pasado, no al oro.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error que marca el material es apuntarle al oro Elite el primer mes en el nivel y quedarse sin ninguno de los tres.`,
    fuente: `Slide 9 · Elite: bonos y crecimiento · 3.3`,
  },
  {
    id: "elite-4-1",
    embeddingText: `¿Cuál es la tabla de bonos por actividad en Elite? También preguntan: "¿cuánto gano con X diamantes en Elite?"`,
    keywords: [`Cuál es la tabla de bonos por actividad en Elite`, `cuánto gano con X diamantes en Elite`],
    respuesta: `100.000 diamantes son 40 dólares, 200.000 son 70, 300.000 son 100, 500.000 son 150, 800.000 son 250, 1.000.000 son 300, 2.000.000 son 500 y 3.000.000 son 700 dólares.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Ocho escalones, todos con las mismas 80 horas y 22 días en la columna izquierda.`,
    fuente: `Slide 10 · Elite: bonos y crecimiento · 4.1`,
  },
  {
    id: "elite-4-2",
    embeddingText: `¿Cómo sé si voy a alcanzar mi escalón este mes?`,
    keywords: [`Cómo sé si voy a alcanzar mi escalón este mes`],
    respuesta: `Divide los diamantes que llevas entre los días transcurridos del mes, multiplica por los días que faltan y súmalo. Ese número es donde vas a terminar si no cambias nada.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es el cálculo de proyección que enseña el material. El error asociado es no proyectar el cierre a mitad de mes y darse cuenta el día 28 de que faltaba poco. El cierre del video insiste: el creador Elite revisa sus números el día 15, el principiante el día 30, cuando ya no hay nada que hacer.`,
    fuente: `Slide 10 · Elite: bonos y crecimiento · 4.2`,
  },
  {
    id: "elite-5-1",
    embeddingText: `¿Qué es el bono de retención y crecimiento? También preguntan: "¿qué es el bono que solo tenemos en Elite?"`,
    keywords: [`Qué es el bono de retención y crecimiento`, `qué es el bono que solo tenemos en Elite`],
    respuesta: `Premia crecer por encima de tus propios diamantes del mes anterior. Si creces 20% ganas un 10% de bonificación. Si creces 50%, ganas un 15%.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Se mide contra ti mismo, no contra los demás. Los ejemplos del slide: un creador hizo 100.000 en febrero y 120.000 en marzo, creció 20% y se lleva el 10%. Otro hizo 100.000 en febrero y 150.000 en marzo, creció 50% y se lleva el 15%. Exige igual diamantes, horas y días, y las métricas se reinician mes a mes.`,
    fuente: `Slide 11 · Elite: bonos y crecimiento · 5.1`,
  },
  {
    id: "elite-5-2",
    embeddingText: `¿Este bono premia al que hace más diamantes?`,
    keywords: [`Este bono premia al que hace más diamantes`],
    respuesta: `No. Premia la pendiente, no el volumen. Puedes hacer menos diamantes que otro y cobrarlo tú.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El ejemplo del material: el primero hizo 400.000 en febrero y 420.000 en marzo, un crecimiento del 5%, y no llega ni al primer escalón. El segundo hizo 200.000 y luego 260.000, un 30%, y sí cobra. En este bono el que va grande no siempre gana.`,
    fuente: `Slide 11 · Elite: bonos y crecimiento · 5.2`,
  },
  {
    id: "elite-5-3",
    embeddingText: `Si el mes pasado tuve un mes excepcional, ¿me perjudica?`,
    keywords: [`Si el mes pasado tuve un mes excepcional, ¿me perjudica`],
    respuesta: `Sí. El bono se calcula contra tu mes anterior, así que un mes muy alto sube tu propia vara del mes siguiente.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es la contracara del bono. Por eso el material advierte sobre el bajón después de alcanzar la meta: en Elite ese bajón cuesta el doble, porque arruina la base del mes siguiente.`,
    fuente: `Slide 11 · Elite: bonos y crecimiento · 5.3`,
  },
  {
    id: "elite-5-6",
    embeddingText: `¿Cuánto tengo que hacer este mes para cobrar el bono de crecimiento?`,
    keywords: [`Cuánto tengo que hacer este mes para cobrar el bono de crecimiento`],
    respuesta: `Tus diamantes del mes pasado más 20% para el primer escalón, o más 50% para el segundo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La tarea que deja el material es mandarle al equipo tres números: los diamantes del mes pasado, la meta de este mes, y esa meta más 20%. El tercero es el objetivo real.`,
    fuente: `Slide 11 · Elite: bonos y crecimiento · 5.6`,
  },
  {
    id: "elite-6-1",
    embeddingText: `Ya llevo tiempo transmitiendo, ¿igual tengo que escribir el plan de conexión?`,
    keywords: [`Ya llevo tiempo transmitiendo, ¿igual tengo que escribir el plan de conexión`],
    respuesta: `Sí. Ya tienes un plan aunque no lo hayas escrito; el ejercicio es sacarlo de tu cabeza al papel para poder revisarlo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El razonamiento del material: lo que no está escrito no se puede corregir. El error del creador con experiencia es no tener el plan escrito y por eso no poder detectar cuál semana se le cae.`,
    fuente: `Slide 12 · Elite: bonos y crecimiento · 6.1`,
  },
  {
    id: "elite-6-2",
    embeddingText: `¿Cuáles son las cuatro variables del plan de conexión?`,
    keywords: [`Cuáles son las cuatro variables del plan de conexión`],
    respuesta: `Días de la semana, franja horaria, duración por live (dos horas en adelante) y el plan de acción fuera del live.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El plan de acción son cuatro cosas: full interacción con espectadores mientras transmites, consumir TikTok en tus tiempos libres, ver lives de otras personas (para hacer amistades y ver los conceptos aplicados) y subir dos a tres videos semanales.`,
    fuente: `Slide 12 · Elite: bonos y crecimiento · 6.2`,
  },
  {
    id: "elite-6-3",
    embeddingText: `¿Cuánto tiene que durar cada live en Elite?`,
    keywords: [`Cuánto tiene que durar cada live en Elite`],
    respuesta: `Lo sugerido son dos horas en adelante, igual que en principiante.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 12 · Elite: bonos y crecimiento · 6.3`,
  },
  {
    id: "elite-7-2",
    embeddingText: `¿Los 7 días de la misión son los mismos 22 días del bono?`,
    keywords: [`Los 7 días de la misión son los mismos 22 días del bono`],
    respuesta: `No. Son dos cuentas separadas que corren al tiempo. Las misiones son tu permanencia en el programa; las 80 horas y los 22 días son tu bono.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es la confusión que el material marca explícitamente: cumplir la misión no significa haber cumplido el requisito del bono.`,
    fuente: `Slide 13 · Elite: bonos y crecimiento · 7.2`,
  },
  {
    id: "elite-7-3",
    embeddingText: `¿Ser Elite me protege de que me saquen del programa?`,
    keywords: [`Ser Elite me protege de que me saquen del programa`],
    respuesta: `No. El material dice que la letra fina se aplica igual: que ya monetices no te vuelve intocable.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los cuatro compromisos son los mismos que en principiante, y la condición también: si un creador no lo toma en serio, no cumple o no muestra disposición para mejorar, no puede continuar en el proceso. El error asociado es asumir que la trayectoria acumulada protege.`,
    fuente: `Slide 7 · Elite: bonos y crecimiento · 7.3`,
  },
  {
    id: "elite-8-2",
    embeddingText: `¿Qué se espera de mí en Elite que no se esperaba antes?`,
    keywords: [`Qué se espera de mí en Elite que no se esperaba antes`],
    respuesta: `Que uses la formación para corregir, no para confirmar que ya lo haces bien. Y que llegues a un mes bueno sin que la agencia te tenga que escribir.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material propone una prueba concreta de autosuficiencia: si este mes nadie del equipo te escribiera ni una vez, ¿tu mes saldría igual? Y advierte que si terminas el programa sin haber cambiado nada de tu rutina, lo perdiste. En Elite mejorar significa cambiar algo que ya te funcionaba más o menos, que es lo más difícil.`,
    fuente: `Slides 2 y 4 · Elite: bonos y crecimiento · 8.2`,
  },
  {
    id: "elite-9-1",
    embeddingText: `¿Cuál es el problema típico de constancia de un creador Elite?`,
    keywords: [`Cuál es el problema típico de constancia de un creador Elite`],
    respuesta: `No es la duración, es el bajón de tres días después de un mes fuerte.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material lo dice directo: tu problema no suele ser la duración, tú aguantas cuatro horas sin despeinarte. Es la constancia después de alcanzar la meta. Y en Elite ese bajón cuesta el doble porque el bono de crecimiento se calcula contra tu propio mes anterior.`,
    fuente: `Slide 6 · Elite: bonos y crecimiento · 9.1`,
  },
  {
    id: "elite-9-2",
    embeddingText: `¿Da lo mismo hacer los diamantes concentrados o repartidos?`,
    keywords: [`Da lo mismo hacer los diamantes concentrados o repartidos`],
    respuesta: `No. Las dos formas cobran el bono del mes, pero la repartida tiene mejor mes siguiente.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El ejemplo del material: dos creadoras hicieron 250.000 diamantes en marzo, una en 25 días parejos y otra en 11 días con dos fines de semana enormes. Las dos cobran marzo, pero la primera tiene mejor abril, y no por disciplina sino porque su audiencia sabe cuándo encontrarla.

1 0. CONTA CTO`,
    fuente: `Slide 6 · Elite: bonos y crecimiento · 9.2`,
  },
  {
    id: "algoritmo-1-1",
    embeddingText: `¿Cuántos seguidores necesito para transmitir en vivo? También preguntan: "no me sale el botón de LIVE"; "¿por qué no puedo transmitir?"`,
    keywords: [`Cuántos seguidores necesito para transmitir en vivo`, `no me sale el botón de LIVE`, `por qué no puedo transmitir`],
    respuesta: `Al menos 1.000 seguidores para que se active la función de LIVE.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Si no aparece la opción, casi siempre es eso y no un fallo de la cuenta. El error que marca el material es intentar transmitir sin los mil seguidores y creer que la app está fallando.`,
    fuente: `Slide 2 · TikTok LIVE, algoritmo y funciones · 1.1`,
  },
  {
    id: "algoritmo-1-2",
    embeddingText: `¿Qué es TikTok LIVE?`,
    keywords: [`Qué es TikTok LIVE`],
    respuesta: `Una transmisión de video en tiempo real para interactuar directamente con tu audiencia, construir comunidad, ganar seguidores y monetizar con regalos virtuales.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es siempre en formato vertical. TikTok está en más de 150 países, admite más de 75 idiomas y a principios de 2026 tiene entre 1.900 y 1.990 millones de usuarios activos al mes. Latinoamérica es uno de los mercados con mayor crecimiento y potencial.`,
    fuente: `Slide 2 · TikTok LIVE, algoritmo y funciones · 1.2`,
  },
  {
    id: "algoritmo-1-3",
    embeddingText: `¿No es que ya hay demasiada gente transmitiendo?`,
    keywords: [`No es que ya hay demasiada gente transmitiendo`],
    respuesta: `Los dos mil millones de usuarios no son tu competencia, son tu audiencia posible. Tu competencia son los que transmiten en tu país, en tu horario, sobre tu tema.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 2 · TikTok LIVE, algoritmo y funciones · 1.3`,
  },
  {
    id: "algoritmo-1-4",
    embeddingText: `¿Qué es ser creador de contenido?`,
    keywords: [`Qué es ser creador de contenido`],
    respuesta: `Un usuario que genera una comunidad partiendo de su talento para conectar a través de la producción audiovisual, y en TikTok LIVE ese contenido es monetizable.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material añade dos ideas. Ser creador es crear estrategia, usar las herramientas y aprovechar las oportunidades de la plataforma, no solo prender la cámara. Y la razón de ser del creador es su audiencia. El orden de la definición importa: primero comunidad, después plata.`,
    fuente: `Slide 3 · TikTok LIVE, algoritmo y funciones · 1.4`,
  },
  {
    id: "algoritmo-1-5",
    embeddingText: `¿Necesito un talento especial para esto?`,
    keywords: [`Necesito un talento especial para esto`],
    respuesta: `No un talento espectacular. Escuchar bien ya es un talento monetizable.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error que marca el material es creer que hace falta algo extraordinario. Cantar, hablar, hacer reír, escuchar, jugar: todos sirven. Lo que separa al que dura del que no es el compromiso con la audiencia.`,
    fuente: `Slide 3 · TikTok LIVE, algoritmo y funciones · 1.5`,
  },
  {
    id: "algoritmo-1-6",
    embeddingText: `¿Cuántas horas transmite un creador exitoso?`,
    keywords: [`Cuántas horas transmite un creador exitoso`],
    respuesta: `Más de 3 horas al día y al menos 100 horas al mes. Ojo: no confundir con las 90 horas del bono.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Son dos cifras distintas y las dos son ciertas. Las 90 horas son el mínimo para que te paguen el bono en nivel principiante. Las 100 horas son lo que hace un creador exitoso. Una es el piso y la otra es el estándar. El error es planear el mes contra el mínimo y quedar siempre al filo.`,
    fuente: `Slide 4 · TikTok LIVE, algoritmo y funciones · 1.6`,
  },
  {
    id: "algoritmo-2-1",
    embeddingText: `¿Qué debe tener mi perfil?`,
    keywords: [`Qué debe tener mi perfil`],
    respuesta: `Tres cosas: nombre de usuario, foto de perfil donde se te vea bien la cara y alineada a tu estilo, y biografía completa.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La biografía debe ser única, concisa, memorable y clara, con palabras que enganchen e inviten a ver tu contenido. No es un currículum: es una línea que le diga a alguien que llegó por accidente por qué se debería quedar. Tu perfil es tu carta de presentación y debe construir identidad de marca personal.`,
    fuente: `Slide 5 · TikTok LIVE, algoritmo y funciones · 2.1`,
  },
  {
    id: "algoritmo-2-2",
    embeddingText: `¿Puedo poner un logo o un paisaje de foto de perfil?`,
    keywords: [`Puedo poner un logo o un paisaje de foto de perfil`],
    respuesta: `No. El requisito es que se vea la cara del creador, no un paisaje ni un logo.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 5 · TikTok LIVE, algoritmo y funciones · 2.2`,
  },
  {
    id: "algoritmo-2-3",
    embeddingText: `Mi biografía está vacía, ¿importa mucho?`,
    keywords: [`Mi biografía está vacía, ¿importa mucho`],
    respuesta: `Sí. Es lo que decide si se queda el que entró de casualidad. Escríbela aunque quede fea: fea y escrita es mejor que perfecta y pendiente.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error concreto que marca el material es dejar la biografía vacía o poner solo emojis.`,
    fuente: `Slide 5 · TikTok LIVE, algoritmo y funciones · 2.3`,
  },
  {
    id: "algoritmo-3-1",
    embeddingText: `¿Qué necesito técnicamente para un buen live?`,
    keywords: [`Qué necesito técnicamente para un buen live`],
    respuesta: `Conexión a internet, excelente iluminación, sistema de sonido, decoración de fondo, cámara óptima, y trípode y silla.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Esa es la lista técnica, la que se arregla con plata o con maña. Pero el material advierte que la otra lista pesa más.`,
    fuente: `Slide 6 · TikTok LIVE, algoritmo y funciones · 3.1`,
  },
  {
    id: "algoritmo-3-2",
    embeddingText: `¿Qué es más importante, el equipo o la actitud?`,
    keywords: [`Qué es más importante, el equipo o la actitud`],
    respuesta: `La actitud. El material lo dice directo: hay lives con iluminación de estudio y cero gente, y lives grabados con luz de ventana llenos.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La lista que no se compra: ser genuino y auténtico, interacción constante, recordar a tus donadores, celebrar metas y objetivos, tener un entorno atractivo, narrativa durante el live, lenguaje corporal e historias compartidas. El error es invertir primero en equipo y dejar la interacción para después.`,
    fuente: `Slide 6 · TikTok LIVE, algoritmo y funciones · 3.2`,
  },
  {
    id: "algoritmo-3-3",
    embeddingText: `¿Cuál es la base de un live?`,
    keywords: [`Cuál es la base de un live`],
    respuesta: `Dos cosas distintas. La interacción in app, que es lo que hace el espectador con los botones (tap tap, comentarios, compartir, seguir, donación). Y la comunicación, que es lo que haces tú (lenguaje verbal y corporal, postura y gestos, invitación a tap tap, carisma y empatía).

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El detalle clave: la invitación al tap tap está en la columna de comunicación, no en la de botones. El tap tap no pasa solo, pasa cuando alguien lo pide.`,
    fuente: `Slide 7 · TikTok LIVE, algoritmo y funciones · 3.3`,
  },
  {
    id: "algoritmo-3-4",
    embeddingText: `¿Para qué sirve tanto insistir en la interacción?`,
    keywords: [`Para qué sirve tanto insistir en la interacción`],
    respuesta: `Es una cadena: más interacción sube tus métricas, mejores métricas hacen que TikTok te muestre a más gente, y más gente te da más de dónde fidelizar.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Son tres beneficios encadenados: mejores métricas, más distribución y mayor fidelización.`,
    fuente: `Slide 8 · TikTok LIVE, algoritmo y funciones · 3.4`,
  },
  {
    id: "algoritmo-3-5",
    embeddingText: `¿Cuáles son las tres fases de la interacción?`,
    keywords: [`Cuáles son las tres fases de la interacción`],
    respuesta: `Preparación (autopresentación lista, temas de conversación, dinámicas), ampliar base (convertir espectadores nuevos en seguidores y luego en consumidores habituales) y cuidar tu base (convertir seguidores en donadores y luego en donadores recurrentes).

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error que marca el material es vivir en la fase dos: todo el live persiguiendo gente nueva y sin saludar a los de siempre, que son los que donan. Ampliar sin cuidar es llenar un balde roto.`,
    fuente: `Slide 8 · TikTok LIVE, algoritmo y funciones · 3.5`,
  },
  {
    id: "algoritmo-3-6",
    embeddingText: `¿Cómo debo tratar a un espectador nuevo?`,
    keywords: [`Cómo debo tratar a un espectador nuevo`],
    respuesta: `Arranca conversación mirándole el perfil antes de hablarle. Trátalo cálidamente, hazle sentir tu entusiasmo, y siempre pídele que te siga.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error típico es dar una bienvenida genérica tipo “bienvenidos todos” en vez de decir el nombre de quien acaba de entrar. La recomendación del material es tener una frase de bienvenida fija que quepa en una respiración e incluya el nombre de la persona.`,
    fuente: `Slide 9 · TikTok LIVE, algoritmo y funciones · 3.6`,
  },
  {
    id: "algoritmo-3-7",
    embeddingText: `¿Cómo trato a los que ya me siguen?`,
    keywords: [`Cómo trato a los que ya me siguen`],
    respuesta: `Reacción apasionada para mostrar aprecio, bienvenida personalizada a todos, y haz que todo el mundo desee tu trato especial.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Sirve para tres cosas: mantener a los donadores que ya tienes, convertir a más espectadores en primeros donadores, y hacer que otros se interesen en volver. La última regla, que todo el mundo desee tu trato especial, es la que el material señala como la clave del negocio.`,
    fuente: `Slide 9 · TikTok LIVE, algoritmo y funciones · 3.7`,
  },
  {
    id: "algoritmo-4-1",
    embeddingText: `¿Qué me puede pasar si incumplo las normas? También preguntan: "me bloquearon"; "me suspendieron el live"; "me cayó una sanción"`,
    keywords: [`Qué me puede pasar si incumplo las normas`, `me bloquearon`, `me suspendieron el live`, `me cayó una sanción`],
    respuesta: `Va en escala: suspensión del LIVE por minutos, por días, de forma permanente, hasta la pérdida total de tu cuenta de TikTok.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La pérdida es de la cuenta completa, con los seguidores adentro. Las normas se aplican a todos y a todo en TikTok.`,
    fuente: `Slide 10 · TikTok LIVE, algoritmo y funciones · 4.1`,
  },
  {
    id: "algoritmo-4-2",
    embeddingText: `¿Cuáles son los tres motivos que más bloquean cuentas? También preguntan: "¿qué es lo que más tumba cuentas?"`,
    keywords: [`Cuáles son los tres motivos que más bloquean cuentas`, `qué es lo que más tumba cuentas`],
    respuesta: `Información personal, contenido no original, y enganche falso o manipulación con regalos.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Información personal incluye datos tuyos o de otros que puedan usarse para robo de identidad. Contenido no original incluye suplantar a otra persona y mostrar videos con derechos de autor, o sea poner una película o un partido de fondo. Enganche falso incluye pedir regalos a cambio de seguidores o de cualquier actividad, y pedir regalos por necesidad.`,
    fuente: `Slide 12 · TikTok LIVE, algoritmo y funciones · 4.2`,
  },
  {
    id: "algoritmo-4-3",
    embeddingText: `¿Puedo contar que estoy pasando por una situación difícil para que me donen?`,
    keywords: [`Puedo contar que estoy pasando por una situación difícil para que me donen`],
    respuesta: `No. Pedir regalos por necesidad está en el top de motivos de bloqueo, dentro de enganche falso y manipulación con regalos.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es el que más duele porque suena inocente. Contar un drama personal para que te donen es motivo de bloqueo, aunque el creador lo viva como sinceridad.`,
    fuente: `Slide 12 · TikTok LIVE, algoritmo y funciones · 4.3`,
  },
  {
    id: "algoritmo-4-4",
    embeddingText: `¿Puedo transmitir mientras manejo?`,
    keywords: [`Puedo transmitir mientras manejo`],
    respuesta: `No. Conducir está en la lista de motivos de bloqueo, y no importa que vayas despacio.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 10 · TikTok LIVE, algoritmo y funciones · 4.4`,
  },
  {
    id: "algoritmo-4-5",
    embeddingText: `¿Puedo tener una botella de licor en el fondo si no estoy bebiendo?`,
    keywords: [`Puedo tener una botella de licor en el fondo si no estoy bebiendo`],
    respuesta: `No conviene. Bebidas o botellas alcohólicas están en la lista de motivos de bloqueo, aunque no se esté bebiendo.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 10 · TikTok LIVE, algoritmo y funciones · 4.5`,
  },
  {
    id: "algoritmo-4-6",
    embeddingText: `¿Cuáles son todos los motivos de bloqueo?`,
    keywords: [`Cuáles son todos los motivos de bloqueo`],
    respuesta: `Ver lista completa abajo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Primera tanda: desnudez y actividades sexuales, vestimenta sexualmente sugerente, comportamiento sexual sugerente, bullying e intimidación, discursos y muestras de odio, discriminación racial, xenofobia, actividades ilegales y mercancías reguladas, conducir, bebidas o botellas alcohólicas, juegos de azar. Segunda tanda: suicidio y autolesión (incluye desorden alimenticio, retos y actividades peligrosas, retos o actos denigrantes), contenido perturbador o explícito (violento, maltrato animal, heridas abiertas o fluidos corporales), comportamiento violento o delictivo (amenazas e incitación a la violencia), abuso sexual (de menores incluido, maltrato de menores, exposición de menores solos en pantalla), información falsa (integridad cívica y electoral, contenido generado por IA sin aviso, publicidad sin aviso) y live de baja calidad.`,
    fuente: `Slides 10 y 11 · TikTok LIVE, algoritmo y funciones · 4.6`,
  },
  {
    id: "algoritmo-4-7",
    embeddingText: `Si dejo el live prendido mientras duermo, ¿esas horas me cuentan? También preguntan: "¿puedo dejar el live puesto de madrugada?"`,
    keywords: [`Si dejo el live prendido mientras duermo, ¿esas horas me cuentan`, `puedo dejar el live puesto de madrugada`],
    respuesta: `No solo no te sirven, te ponen en riesgo. Dormir durante el live está en la lista de live de baja calidad, que es motivo de bloqueo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Live de baja calidad incluye imagen estática o pantalla negra, video pregrabado y dormir durante el live. Las horas que te bloquean no cuentan.`,
    fuente: `Slide 11 · TikTok LIVE, algoritmo y funciones · 4.7`,
  },
  {
    id: "algoritmo-4-8",
    embeddingText: `¿Qué pasa si uso un fondo o una imagen hecha con inteligencia artificial?`,
    keywords: [`Qué pasa si uso un fondo o una imagen hecha con inteligencia artificial`],
    respuesta: `Tienes que etiquetarlo. TikTok exige etiquetar cualquier contenido que parezca real y haya sido creado o editado con IA antes de compartirlo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `No es recomendación, es obligación, y sin la etiqueta entra en información falsa. Aplica a un fondo generado, una voz clonada o una imagen hecha en una app y puesta de portada. El error es creer que la norma es solo para deepfakes.`,
    fuente: `Slide 25 · TikTok LIVE, algoritmo y funciones · 4.8`,
  },
  {
    id: "algoritmo-5-1",
    embeddingText: `¿Qué mide el algoritmo de TikTok? También preguntan: "¿cómo funciona el algoritmo?"; "¿cómo hago para que me muestren más?"`,
    keywords: [`Qué mide el algoritmo de TikTok`, `cómo funciona el algoritmo`, `cómo hago para que me muestren más`],
    respuesta: `Cinco cosas. Tasa de clics, tiempo de permanencia, tasa de enganche, tasa de nuevos seguidores y tasa de regalos.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Tasa de clics es cuántas personas hacen clic en tu LIVE desde el feed. Tiempo de permanencia es cuánto se queda cada espectador. Tasa de enganche es cuántos dan me gusta, comentan o comparten. Tasa de nuevos seguidores es cuántos le dan seguir a tu perfil. Tasa de regalos es cuántos te mandan un regalo. El algoritmo funciona con reconocimiento de patrones para recomendar contenido, y eso genera exposición y viralidad.`,
    fuente: `Slide 13 · TikTok LIVE, algoritmo y funciones · 5.1`,
  },
  {
    id: "algoritmo-5-2",
    embeddingText: `¿El algoritmo solo premia los regalos?`,
    keywords: [`El algoritmo solo premia los regalos`],
    respuesta: `No. La permanencia y el enganche pesan igual que los regalos.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 13 · TikTok LIVE, algoritmo y funciones · 5.2`,
  },
  {
    id: "algoritmo-5-3",
    embeddingText: `¿Cuál es la métrica que más falla en creadores nuevos?`,
    keywords: [`Cuál es la métrica que más falla en creadores nuevos`],
    respuesta: `El tiempo de permanencia. La gente entra, no entiende de qué se trata el live en diez segundos, y se va.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 13 · TikTok LIVE, algoritmo y funciones · 5.3`,
  },
  {
    id: "algoritmo-5-4",
    embeddingText: `¿Qué tips da el material para el algoritmo?`,
    keywords: [`Qué tips da el material para el algoritmo`],
    respuesta: `Experimenta con varios formatos, haz que tu contenido se consuma fácil, muestra tus habilidades y talentos, y genera alto nivel de interacción con la comunidad.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 13 · TikTok LIVE, algoritmo y funciones · 5.4`,
  },
  {
    id: "algoritmo-6-1",
    embeddingText: `¿Cómo consigo más seguidores durante el LIVE?`,
    keywords: [`Cómo consigo más seguidores durante el LIVE`],
    respuesta: `Da la bienvenida a los nuevos, agrega un llamado a la acción explicando por qué deben seguirte, y usa herramientas de producción como encuestas, stickers y pantalla verde.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error es decir “síganme” sin dar una razón ni mencionar los horarios de live. El llamado a la acción bueno es del tipo “sígueme que los lunes hago tal cosa”.`,
    fuente: `Slide 14 · TikTok LIVE, algoritmo y funciones · 6.1`,
  },
  {
    id: "algoritmo-6-2",
    embeddingText: `¿Tengo que subir videos cortos además del live?`,
    keywords: [`Tengo que subir videos cortos además del live`],
    respuesta: `Sí. El material da seis prácticas para los momentos en que no estás en LIVE.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Usa tus mejores momentos del live para subir al menos una recopilación semanal. Usa un editor como CapCut para un perfil homogéneo. Sube un video corto justo antes de prender el LIVE. Usa el video corto para presentarte y dejar espacio a preguntas. Usa audios en tendencia y hashtags. Y termina tus videos con “sígueme” y “visítame en LIVE”, mencionando tus horarios.`,
    fuente: `Slide 14 · TikTok LIVE, algoritmo y funciones · 6.2`,
  },
  {
    id: "algoritmo-6-3",
    embeddingText: `¿De dónde saco material para los videos cortos?`,
    keywords: [`De dónde saco material para los videos cortos`],
    respuesta: `De las grabaciones de tus propios lives. La función Grabaciones LIVE guarda los mejores momentos.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slides 14 y 25 · TikTok LIVE, algoritmo y funciones · 6.3`,
  },
  {
    id: "algoritmo-7-1",
    embeddingText: `¿Para qué sirve la foto de portada del LIVE?`,
    keywords: [`Para qué sirve la foto de portada del LIVE`],
    respuesta: `Es la miniatura que decide si alguien entra o sigue de largo en el feed. Es la función que más mueve la tasa de clics.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Usa una foto atractiva que impacte visualmente, sin pasarse de los términos de la comunidad. El error es dejar la portada por defecto, que es un fotograma cualquiera de la cámara.`,
    fuente: `Slide 15 · TikTok LIVE, algoritmo y funciones · 7.1`,
  },
  {
    id: "algoritmo-7-2",
    embeddingText: `¿Qué pongo en el mensaje de bienvenida?`,
    keywords: [`Qué pongo en el mensaje de bienvenida`],
    respuesta: `Resalta alguna virtud que tengas y cierra con un llamado a la acción.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La portada sube los clics y el mensaje de bienvenida sube la permanencia, porque le dice al que entró de qué se trata antes de que se aburra.`,
    fuente: `Slide 15 · TikTok LIVE, algoritmo y funciones · 7.2`,
  },
  {
    id: "algoritmo-7-4",
    embeddingText: `¿Dónde veo mis estadísticas? También preguntan: "¿cómo sé cómo van mis números?"`,
    keywords: [`Dónde veo mis estadísticas`, `cómo sé cómo van mis números`],
    respuesta: `En el Centro LIVE, que muestra tus estadísticas de los últimos 30 días.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es el lugar donde puedes ver las cinco métricas del algoritmo. Si nunca lo has abierto, estás transmitiendo a ciegas. Los números son tuyos y están en tu celular.`,
    fuente: `Slide 16 · TikTok LIVE, algoritmo y funciones · 7.4`,
  },
  {
    id: "algoritmo-7-5",
    embeddingText: `¿Puedo cambiar de cámara durante el live?`,
    keywords: [`Puedo cambiar de cámara durante el live`],
    respuesta: `Sí. Girar cámara te deja usar la frontal y la trasera y cambiarlas durante el LIVE, no solo antes.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 17 · TikTok LIVE, algoritmo y funciones · 7.5`,
  },
  {
    id: "algoritmo-7-6",
    embeddingText: `¿Está mal usar el filtro de belleza?`,
    keywords: [`Está mal usar el filtro de belleza`],
    respuesta: `Úsalo suave. Al máximo la cara pierde expresión, y tu cara es tu herramienta de trabajo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La función “mejorar” son ajustes a modo facial: suavizado, contraste y demás. Si no se te nota cuando te ríes, perdiste más de lo que ganaste.`,
    fuente: `Slide 17 · TikTok LIVE, algoritmo y funciones · 7.6`,
  },
  {
    id: "algoritmo-7-7",
    embeddingText: `¿Dónde está el botón para invitar gente a mi live?`,
    keywords: [`Dónde está el botón para invitar gente a mi live`],
    respuesta: `En “Kit de diversión para varios invitados”. Es lo que todo el mundo llama ventanillas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Las ventanillas se ven a fondo en el módulo 2.`,
    fuente: `Slide 18 · TikTok LIVE, algoritmo y funciones · 7.7`,
  },
  {
    id: "algoritmo-7-8",
    embeddingText: `¿Qué pongo en “Acerca de mí”?`,
    keywords: [`Qué pongo en “Acerca de mí”`],
    respuesta: `Una frase que diga qué va a pasar en tu live hoy. No quién eres, qué va a pasar.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es la descripción que ven los espectadores al entrar. El material lo compara con el letrero de una tienda: el que pasa por afuera decide si entra leyendo eso. El error es dejarlo vacío o repetir la biografía del perfil.`,
    fuente: `Slide 18 · TikTok LIVE, algoritmo y funciones · 7.8`,
  },
  {
    id: "algoritmo-7-9",
    embeddingText: `¿Para qué sirven los paneles?`,
    keywords: [`Para qué sirven los paneles`],
    respuesta: `Para resaltar información importante durante el live: horarios, meta del día, reglas de tu dinámica. Todo lo que repites cada quince minutos.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Tienen dos pestañas, general y varios invitados, y funcionan con plantillas: lo armas una vez y lo reutilizas. El error es repetir con la voz información fija que un panel podría mostrar todo el live.`,
    fuente: `Slides 19 y 33 · TikTok LIVE, algoritmo y funciones · 7.9`,
  },
  {
    id: "algoritmo-7-10",
    embeddingText: `¿Qué es la cámara doble?`,
    keywords: [`Qué es la cámara doble`],
    respuesta: `Emite desde la cámara frontal y la trasera al mismo tiempo. Puedes escoger la forma, rectángulo o círculo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Sirve si estás mostrando algo con las manos y quieres que también te vean la cara reaccionando.`,
    fuente: `Slides 19 y 33 · TikTok LIVE, algoritmo y funciones · 7.10`,
  },
  {
    id: "algoritmo-7-11",
    embeddingText: `¿Cómo practico sin que me vea nadie? También preguntan: "me da pena prender la cámara"; "¿puedo ensayar?"`,
    keywords: [`Cómo practico sin que me vea nadie`, `me da pena prender la cámara`, `puedo ensayar`],
    respuesta: `Con el modo práctica, que simula un LIVE y te deja explorar funciones antes de decidir si transmites de verdad. No lo ve nadie.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es la puerta de entrada para quien tiene pena. El error es no usarlo nunca y estrenar funciones nuevas en vivo delante de la audiencia.`,
    fuente: `Slide 20 · TikTok LIVE, algoritmo y funciones · 7.11`,
  },
  {
    id: "algoritmo-7-12",
    embeddingText: `¿Qué son los moderadores y cuándo los necesito?`,
    keywords: [`Qué son los moderadores y cuándo los necesito`],
    respuesta: `Espectadores que designas para ayudarte a silenciar, bloquear y mantener el orden mientras tú hablas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Cuando tu live crezca no vas a poder atender la conversación y la seguridad al tiempo. Se asignan y se eliminan desde la app.`,
    fuente: `Slide 20 · TikTok LIVE, algoritmo y funciones · 7.12`,
  },
  {
    id: "algoritmo-7-13",
    embeddingText: `Mi internet está flojo, ¿qué hago?`,
    keywords: [`Mi internet está flojo, ¿qué hago`],
    respuesta: `Bájale la calidad al live. Es mejor que congelarte, porque un live congelado te destroza el tiempo de permanencia.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 21 · TikTok LIVE, algoritmo y funciones · 7.13`,
  },
  {
    id: "algoritmo-7-14",
    embeddingText: `¿Puedo evitar que menores entren a mi live?`,
    keywords: [`Puedo evitar que menores entren a mi live`],
    respuesta: `Sí, con “limitar espectadores”, que censura tu live para menores de edad o cuentas sin verificar.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es la red de seguridad si tu contenido tiene algún matiz de adultos, y conecta con la sección de menores del bloque de normas.`,
    fuente: `Slide 21 · TikTok LIVE, algoritmo y funciones · 7.14`,
  },
  {
    id: "algoritmo-7-15",
    embeddingText: `¿“Limitar espectadores” y “quién puede mirar este live” son lo mismo?`,
    keywords: [`“Limitar espectadores” y “quién puede mirar este live” son lo mismo`],
    respuesta: `No. Limitar espectadores filtra por edad y verificación. “Quién puede mirar este live” filtra por quién es la persona.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error es confundirlas y dejar el live restringido sin darse cuenta. La segunda sirve para probar algo nuevo sin público general, o para dinámicas exclusivas del club de fans.`,
    fuente: `Slides 21 y 22 · TikTok LIVE, algoritmo y funciones · 7.15`,
  },
  {
    id: "algoritmo-7-17",
    embeddingText: `¿Qué son las listas de clasificación y por qué debo activarlas?`,
    keywords: [`Qué son las listas de clasificación y por qué debo activarlas`],
    respuesta: `Permiten que los espectadores vean tu posición en la liga. El material insiste en mayúsculas en tenerlas activadas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Hay dos vistas, clasificación diaria y LIVE populares. Tu posición es un motivo de conversación gratis: “estamos en el puesto tal, nos faltan tantos para subir” convierte a tu audiencia en equipo. La mayoría la tiene apagada sin saberlo.`,
    fuente: `Slide 24 · TikTok LIVE, algoritmo y funciones · 7.17`,
  },
  {
    id: "algoritmo-7-18",
    embeddingText: `¿Puedo controlar los comentarios?`,
    keywords: [`Puedo controlar los comentarios`],
    respuesta: `Sí. El ajuste de comentarios controla qué tipo de comentarios se permiten y cuánto tiempo estará silenciado un espectador.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 25 · TikTok LIVE, algoritmo y funciones · 7.18`,
  },
  {
    id: "algoritmo-7-19",
    embeddingText: `¿Cómo guardo los mejores momentos de mi live?`,
    keywords: [`Cómo guardo los mejores momentos de mi live`],
    respuesta: `Con Grabaciones LIVE, que guarda y recopila los mejores momentos para agradecer a tu comunidad y a tus donadores.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `De ahí sale la recopilación semanal de videos cortos.`,
    fuente: `Slide 25 · TikTok LIVE, algoritmo y funciones · 7.19`,
  },
  {
    id: "algoritmo-7-20",
    embeddingText: `¿Qué es el club de fans?`,
    keywords: [`Qué es el club de fans`],
    respuesta: `La función donde se visualiza la trayectoria de los fans y se personalizan sus ventajas. Desde el lado del espectador es un botón para unirse a tu equipo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Se configura desde los ajustes previos y se ve a fondo en el módulo 2. El error es tenerlo sin configurar y sin ventajas personalizadas.`,
    fuente: `Slides 26 y 29 · TikTok LIVE, algoritmo y funciones · 7.20`,
  },
  {
    id: "algoritmo-7-21",
    embeddingText: `¿Qué es “Interactúa”?`,
    keywords: [`Qué es “Interactúa”`],
    respuesta: `La función que personaliza dinámicas para tu live. Es la que más mueve dos de las cinco métricas: tiempo de permanencia y tasa de enganche.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Una dinámica es cualquier cosa que le da a tu espectador algo que hacer en vez de algo que ver. Una persona que está votando en tu encuesta no se va, y está comentando mientras lo hace. Dos métricas de cinco con un solo botón. El error es probar todas las dinámicas de golpe en un mismo live en vez de dominar una.`,
    fuente: `Slides 26 y 27 · TikTok LIVE, algoritmo y funciones · 7.21`,
  },
  {
    id: "algoritmo-7-22",
    embeddingText: `¿Cuándo debo compartir mi live?`,
    keywords: [`Cuándo debo compartir mi live`],
    respuesta: `Al iniciar. No a la media hora, cuando el pico de distribución ya pasó.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 28 · TikTok LIVE, algoritmo y funciones · 7.22`,
  },
  {
    id: "algoritmo-7-23",
    embeddingText: `¿Qué es la promoción del live?`,
    keywords: [`Qué es la promoción del live`],
    respuesta: `Genera pauta para tener mayor número de espectadores. Es publicidad pagada, así que ojo con el presupuesto.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 28 · TikTok LIVE, algoritmo y funciones · 7.23`,
  },
  {
    id: "algoritmo-7-24",
    embeddingText: `¿Para qué sirve el objetivo de live?`,
    keywords: [`Para qué sirve el objetivo de live`],
    respuesta: `Convierte tu transmisión en una barra que la gente quiere llenar. Sin objetivo cada regalo es un regalo suelto; con objetivo cada regalo es un paso.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material lo compara así: decir “gracias” cada vez que llega un regalo rinde menos que decir “nos faltan tres para la meta”, porque en el segundo caso donar es participar en algo y no hacerle un favor a alguien.`,
    fuente: `Slide 28 · TikTok LIVE, algoritmo y funciones · 7.24`,
  },
  {
    id: "algoritmo-7-25",
    embeddingText: `¿Cómo termino un live correctamente?`,
    keywords: [`Cómo termino un live correctamente`],
    respuesta: `Con el botón de apagar LIVE, no cerrando la app de golpe, porque eso puede cortarte la grabación.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 29 · TikTok LIVE, algoritmo y funciones · 7.25`,
  },
  {
    id: "algoritmo-7-26",
    embeddingText: `¿Debo estar pendiente del contador de espectadores?`,
    keywords: [`Debo estar pendiente del contador de espectadores`],
    respuesta: `No. Sube y baja todo el tiempo y no significa nada en un minuto suelto.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 29 · TikTok LIVE, algoritmo y funciones · 7.26`,
  },
  {
    id: "algoritmo-8-1",
    embeddingText: `¿Puedo cambiar mi objetivo de regalos a mitad del live?`,
    keywords: [`Puedo cambiar mi objetivo de regalos a mitad del live`],
    respuesta: `Sí, se puede editar o eliminar en pleno live. Si pusiste una meta muy alta y no da, la bajas y la celebras.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Un live que cierra cumpliendo una meta pequeña deja mejor sabor que uno que cierra fallando una grande. El error es dejar una meta inalcanzable hasta el final.`,
    fuente: `Slide 30 · TikTok LIVE, algoritmo y funciones · 8.1`,
  },
  {
    id: "algoritmo-8-2",
    embeddingText: `¿Qué trae el menú de herramientas creativas?`,
    keywords: [`Qué trae el menú de herramientas creativas`],
    respuesta: `Nueve herramientas: mejorar, efectos, stickers, música, efectos de voz, efectos de sonido, paneles, doble y fondo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Mejorar se abre en tres pestañas (rostro, maquillaje, filtros), y dentro de rostro están suavizar, contraste, afinar, ojos, lifting y nariz. Efectos está por categorías (popular, comedia, apariencia) e incluye máscaras y animaciones. Stickers se dividen en texto e imagen.`,
    fuente: `Slides 31, 32 y 33 · TikTok LIVE, algoritmo y funciones · 8.2`,
  },
  {
    id: "algoritmo-8-3",
    embeddingText: `¿Para qué sirven los stickers de texto?`,
    keywords: [`Para qué sirven los stickers de texto`],
    respuesta: `Son globos donde tú escribes. Sirven para dejar la pregunta del día en pantalla sin tener que repetirla.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 31 · TikTok LIVE, algoritmo y funciones · 8.3`,
  },
  {
    id: "algoritmo-8-4",
    embeddingText: `¿Cómo uso los efectos de sonido?`,
    keywords: [`Cómo uso los efectos de sonido`],
    respuesta: `Para premiar, no para hacer chistes. Aplausos cuando alguien entra al club de fans, un grito cuando cae un regalo grande.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Le pones sonido a los momentos buenos y la gente aprende que hacer cosas suena bonito. Los disponibles incluyen risa, aplausos, ánimo, beso, thriller, silbato, latidos y grito. La recomendación es escoger dos y asignarles un momento, no usar veinte.`,
    fuente: `Slide 32 · TikTok LIVE, algoritmo y funciones · 8.4`,
  },
  {
    id: "algoritmo-8-5",
    embeddingText: `¿Puedo poner música de fondo?`,
    keywords: [`Puedo poner música de fondo`],
    respuesta: `Sí, hay categorías (fiesta, electrónica, jazz, romántica, alegre) con reproductor y controles. Pero cuidado con el volumen.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error es dejar música alta que tapa la voz y arruina el sonido para el que llega.`,
    fuente: `Slide 32 · TikTok LIVE, algoritmo y funciones · 8.5`,
  },
  {
    id: "algoritmo-8-6",
    embeddingText: `Mi cuarto no está presentable, ¿puedo transmitir igual?`,
    keywords: [`Mi cuarto no está presentable, ¿puedo transmitir igual`],
    respuesta: `Sí. La función “fondo” tiene una galería para reemplazar el tuyo. No hay excusa para no transmitir.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Conviene probarlo antes: si el fondo se come el pelo o las manos, ese no es el tuyo, hay que probar otro.`,
    fuente: `Slide 33 · TikTok LIVE, algoritmo y funciones · 8.6`,
  },
  {
    id: "algoritmo-8-7",
    embeddingText: `¿Cómo hago una encuesta en el live?`,
    keywords: [`Cómo hago una encuesta en el live`],
    respuesta: `Con “Encuesta y votar con regalo”, que tiene cuatro variantes: encuesta rápida, votar con regalo, personalizado y encuesta sobre stickers.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Encuesta rápida ofrece dos opciones. Votar con regalo permite enviar regalos para votar varias veces entre dos opciones. Personalizado te deja definir pregunta, opciones y forma de votar. Encuesta sobre stickers vota opciones enviadas por los suscriptores.`,
    fuente: `Slide 34 · TikTok LIVE, algoritmo y funciones · 8.7`,
  },
  {
    id: "algoritmo-8-8",
    embeddingText: `¿Cómo pido regalos sin que suene a mendigar?`,
    keywords: [`Cómo pido regalos sin que suene a mendigar`],
    respuesta: `Envolviéndolos en una mecánica. “Equipo azul contra equipo rojo, cada regalo es un voto” funciona mucho mejor que “regálenme algo si les gusta el live”.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Votar con regalo convierte una donación en un voto: la persona no está donando, está ganando una discusión. Es la misma plata con una emoción distinta, y además vota varias veces. Recuerda que pedir regalos de forma directa por necesidad es motivo de bloqueo (ver 4.3).`,
    fuente: `Slide 34 · TikTok LIVE, algoritmo y funciones · 8.8`,
  },
  {
    id: "algoritmo-8-9",
    embeddingText: `¿Qué es “dibuja y adivina”?`,
    keywords: [`Qué es “dibuja y adivina”`],
    respuesta: `Tú dibujas encima de tu propia imagen y la gente adivina en los comentarios.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 35 · TikTok LIVE, algoritmo y funciones · 8.9`,
  },
  {
    id: "algoritmo-8-10",
    embeddingText: `¿Qué tipo de preguntas funcionan en el live?`,
    keywords: [`Qué tipo de preguntas funcionan en el live`],
    respuesta: `Cortas, opinables y sin respuesta correcta. Que se contesten en tres palabras.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El ejemplo del material es “de qué color te vestirías en una primera cita”. El criterio: si tu pregunta necesita un párrafo de respuesta, nadie la contesta. El error es hacer preguntas abiertas y largas y concluir que la audiencia está fría.`,
    fuente: `Slide 35 · TikTok LIVE, algoritmo y funciones · 8.10`,
  },
  {
    id: "algoritmo-8-11",
    embeddingText: `No sé de qué hablar en mi live, ¿qué hago?`,
    keywords: [`No sé de qué hablar en mi live, ¿qué hago`],
    respuesta: `Abre la función “Guía”. Es un menú de dinámicas prearmadas y la app te da el tema.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Adentro tiene una sección de diversión con reto de invitados, espectáculo LIVE, cuenta regresiva y panel. Y guías recomendadas con nombres como “hablemos” (conversaciones casuales) o “pregúntale al experto”.`,
    fuente: `Slide 36 · TikTok LIVE, algoritmo y funciones · 8.11`,
  },
  {
    id: "algoritmo-8-13",
    embeddingText: `¿Qué es la bolsa de obsequios?`,
    keywords: [`Qué es la bolsa de obsequios`],
    respuesta: `Un sorteo de monedas donde para participar hay que dejar un comentario específico. Enganche puro.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Tiene total de monedas, ganadores, quién puede unirse y cómo unirse.`,
    fuente: `Slide 37 · TikTok LIVE, algoritmo y funciones · 8.13`,
  },
  {
    id: "algoritmo-8-14",
    embeddingText: `¿Qué es “favorito del público”?`,
    keywords: [`Qué es “favorito del público”`],
    respuesta: `Define hasta 20 preferencias, y cada una es una acción que tú harás cuando te envíen el regalo que elijas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `En la app se ven ejemplos como saluda, gran abrazo, canta tu nombre y selecciones del creador. La persona sabe exactamente qué va a pasar si te manda ese regalo, y eso le quita la incertidumbre a la donación. El error es configurar acciones muy elaboradas que no puedes repetir cien veces en un live.`,
    fuente: `Slide 37 · TikTok LIVE, algoritmo y funciones · 8.14`,
  },
  {
    id: "algoritmo-8-15",
    embeddingText: `¿Dónde veo cuánto vale cada regalo?`,
    keywords: [`Dónde veo cuánto vale cada regalo`],
    respuesta: `En “Regalos LIVE”, el catálogo completo con cada regalo y su valor en monedas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Incluye además un registro de regalos con el histórico, y el Gift Box, donde los espectadores pueden enviar varios regalos de una sola vez.`,
    fuente: `Slide 38 · TikTok LIVE, algoritmo y funciones · 8.15`,
  },
  {
    id: "algoritmo-8-16",
    embeddingText: `Tengo que salir un momento, ¿cierro el live?`,
    keywords: [`Tengo que salir un momento, ¿cierro el live`],
    respuesta: `No. Usa “Pausar LIVE”. Cada vez que cierras y reabres arrancas de cero, con cero espectadores y sin la distribución que ya habías ganado.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 38 · TikTok LIVE, algoritmo y funciones · 8.16`,
  },
  {
    id: "algoritmo-8-17",
    embeddingText: `¿La agencia me puede ayudar mientras estoy transmitiendo?`,
    keywords: [`La agencia me puede ayudar mientras estoy transmitiendo`],
    respuesta: `Sí, con “Indicaciones del agente”, que recibe sugerencias en tiempo real de tu agente durante el LIVE. Ténla activada.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Está en el menú de ajustes, junto con escucha tu voz, clasificaciones, ajustes de comentarios, grabaciones LIVE, moderadores, espectadores marcados, cuentas silenciadas y cuentas bloqueadas.`,
    fuente: `Slide 38 · TikTok LIVE, algoritmo y funciones · 8.17`,
  },
  {
    id: "algoritmo-9-1",
    embeddingText: `Son muchísimas funciones, ¿por dónde empiezo?`,
    keywords: [`Son muchísimas funciones, ¿por dónde empiezo`],
    respuesta: `Escoge tres, no treinta. Si el mes que viene esas tres se te volvieron automáticas, ganaste el módulo.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 39 · TikTok LIVE, algoritmo y funciones · 9.1`,
  },
  {
    id: "batallas-1-1",
    embeddingText: `¿De dónde sale la mayor parte del ingreso de un creador? También preguntan: "¿de verdad tengo que hacer batallas?"`,
    keywords: [`De dónde sale la mayor parte del ingreso de un creador`, `de verdad tengo que hacer batallas`],
    respuesta: `El 70% de los ingresos de un creador LIVE en TikTok viene de las batallas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Si no haces batallas, estás trabajando con el 30% de tus posibilidades de ingreso: el mismo esfuerzo, las mismas horas, el mismo desgaste, por menos de la tercera parte. El material lo plantea así: el susto de la primera batalla dura tres minutos, el 30% dura todo el mes.`,
    fuente: `Slide 16 · Batallas, monetización y club de fans · 1.1`,
  },
  {
    id: "batallas-1-2",
    embeddingText: `Me da miedo hacer batallas, ¿qué hago? También preguntan: "me da pena la batalla"; "no quiero perder"; "nunca he batallado"`,
    keywords: [`Me da miedo hacer batallas, ¿qué hago`, `me da pena la batalla`, `no quiero perder`, `nunca he batallado`],
    respuesta: `Nadie se siente listo. El error que marca el material es posponer la primera batalla mes tras mes esperando sentirse preparado.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El miedo típico es perder delante de la gente, que el otro tenga más audiencia, o no saber qué hacer si te ganan. La recomendación práctica es agendar una con alguien de la agencia esta semana, y si no conoces a nadie, pedirle al equipo que te consiga.`,
    fuente: `Gancho y slide 16 · Batallas, monetización y club de fans · 1.2`,
  },
  {
    id: "batallas-2-1",
    embeddingText: `¿Qué son las ventanillas?`,
    keywords: [`Qué son las ventanillas`],
    respuesta: `En la app se llaman “invitados”. Te permiten subir espectadores a ventanilla, en audio y en video, para que aparezcan en pantalla contigo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Funciona en dos direcciones: tú invitas, o el espectador solicita y tú aceptas. Las dos las controlas tú. Una persona en ventanilla deja de ser público y se vuelve parte del show, y los que fueron parte del show vuelven.`,
    fuente: `Slide 2 · Batallas, monetización y club de fans · 2.1`,
  },
  {
    id: "batallas-2-2",
    embeddingText: `¿Las ventanillas son solo para creadores con mucha audiencia?`,
    keywords: [`Las ventanillas son solo para creadores con mucha audiencia`],
    respuesta: `Al revés. Cuando tienes poca gente es cuando más sirven: subir a uno de tres es la forma más rápida de que esa persona se sienta importante y vuelva mañana.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 2 · Batallas, monetización y club de fans · 2.2`,
  },
  {
    id: "batallas-2-3",
    embeddingText: `¿Qué se puede configurar en las ventanillas?`,
    keywords: [`Qué se puede configurar en las ventanillas`],
    respuesta: `Tres cosas: el diseño de las ventanillas, el acceso para recibir solicitudes, y el acceso automático a recibir solicitudes.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El tercero es el peligroso. “Automático” significa que la persona sube sin que tú apruebes. La recomendación es dejarlo en manual mientras estás aprendiendo, para decidir tú quién sube. El error es tenerlo activado sin saberlo y que suba cualquiera en el peor momento.`,
    fuente: `Slide 3 · Batallas, monetización y club de fans · 2.3`,
  },
  {
    id: "batallas-2-4",
    embeddingText: `¿Cuántas ventanillas debo tener abiertas?`,
    keywords: [`Cuántas ventanillas debo tener abiertas`],
    respuesta: `Pocas. Si tu cara ocupa menos de la mitad de la pantalla, ya no eres el protagonista de tu propio live.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material lo resume en cuatro palabras: distracción y pérdida de protagonismo. La ventanilla es buenísima usada con criterio y un desastre usada como sala de espera. Cuando hay cinco caras, no hay ninguna.`,
    fuente: `Slide 4 · Batallas, monetización y club de fans · 2.4`,
  },
  {
    id: "batallas-2-5",
    embeddingText: `¿Puedo tener batalla y ventanillas al mismo tiempo?`,
    keywords: [`Puedo tener batalla y ventanillas al mismo tiempo`],
    respuesta: `Técnicamente sí, la actualización lo permite. Pero el material desaconseja: provoca pérdida de enfoque, genera distracciones y reduce significativamente el protagonismo de la experiencia principal.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Cuando estás en batalla, la batalla es el show. Tu espectador tiene que saber a dónde mirar en el primer segundo; si tiene que buscar, se va.`,
    fuente: `Slide 9 · Batallas, monetización y club de fans · 2.5`,
  },
  {
    id: "batallas-3-1",
    embeddingText: `¿Qué es una batalla?`,
    keywords: [`Qué es una batalla`],
    respuesta: `Una dinámica donde dos creadores compiten para obtener una mayor puntuación en un tiempo determinado.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Dos creadores, un cronómetro, y quien junte más puntos gana. Los modos de juego con varios participantes son otra cosa, no la batalla básica.`,
    fuente: `Slide 5 · Batallas, monetización y club de fans · 3.1`,
  },
  {
    id: "batallas-3-2",
    embeddingText: `No conozco a otros creadores, ¿cómo consigo con quién pelear?`,
    keywords: [`No conozco a otros creadores, ¿cómo consigo con quién pelear`],
    respuesta: `Hay tres formas: invitaciones rápidas, invitaciones de amigos, e invitaciones recomendadas, que es la app sugiriéndote contrincante.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Las recomendadas son las que salvan a quien está empezando y no conoce a nadie. El error es no hacer batallas por no tener amigos creadores, sin saber que existen.`,
    fuente: `Slide 5 · Batallas, monetización y club de fans · 3.2`,
  },
  {
    id: "batallas-3-3",
    embeddingText: `Si voy perdiendo la batalla, ¿me puedo salir? También preguntan: "¿qué pasa si abandono una batalla?"`,
    keywords: [`Si voy perdiendo la batalla, ¿me puedo salir`, `qué pasa si abandono una batalla`],
    respuesta: `Puedes, pero pierdes. La app te avisa de forma preventiva: abandonar cuenta como derrota.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `No queda empate ni deja de contar. Si entraste, quédate hasta que suene el cronómetro aunque vayas perdiendo feo.`,
    fuente: `Slide 6 · Batallas, monetización y club de fans · 3.3`,
  },
  {
    id: "batallas-3-4",
    embeddingText: `¿Salir del modo coanfitrión me hace perder?`,
    keywords: [`Salir del modo coanfitrión me hace perder`],
    respuesta: `No. Perder es abandonar durante la batalla. Salir del modo coanfitrión cuando la batalla ya terminó es simplemente cerrar la conexión con el otro creador.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Son dos cosas distintas que la gente mezcla. El error asociado es quedarse pegado media hora con el coanfitrión después de que acabó, sin saber cómo salir.`,
    fuente: `Slide 7 · Batallas, monetización y club de fans · 3.4`,
  },
  {
    id: "batallas-3-5",
    embeddingText: `¿Puedo ver quién me invita antes de aceptar?`,
    keywords: [`Puedo ver quién me invita antes de aceptar`],
    respuesta: `Sí, hay previsualización de invitaciones. Mira el perfil antes de aceptar.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 6 · Batallas, monetización y club de fans · 3.5`,
  },
  {
    id: "batallas-3-7",
    embeddingText: `¿Qué veo en la pantalla de batalla?`,
    keywords: [`Qué veo en la pantalla de batalla`],
    respuesta: `Arriba la barra de puntos (puntos = diamantes), a los lados las wins de cada uno, debajo la franja de dobles o triples, a la derecha los botones de seguir y silenciar contrincante, y abajo compartir.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El botón de silenciar contrincante es tu botón de emergencia si el otro se pone pesado. Conviene saber dónde está antes de necesitarlo.`,
    fuente: `Slide 13 · Batallas, monetización y club de fans · 3.7`,
  },
  {
    id: "batallas-4-1",
    embeddingText: `¿Las wins sirven para ganar más plata? También preguntan: "¿pierdo algo si me rompen la racha?"`,
    keywords: [`Las wins sirven para ganar más plata`, `pierdo algo si me rompen la racha`],
    respuesta: `No. El material lo dice en mayúsculas: las wins no tienen ningún valor más allá del emocional y simbólico de la competencia entre creadores.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Son victorias que se acumulan hasta 99 con una racha ganadora. El material advierte explícitamente: no te limites a realizar batallas por conservar o cuidar las wins. Rechazar batallas para no perder la racha es dejar de ganar diamantes reales por cuidar un número que no se cobra.`,
    fuente: `Slide 11 · Batallas, monetización y club de fans · 4.1`,
  },
  {
    id: "batallas-4-2",
    embeddingText: `¿Qué recomienda el material sobre las wins?`,
    keywords: [`Qué recomienda el material sobre las wins`],
    respuesta: `Define un objetivo alcanzable de wins, celebra cuando cumplas objetivos, y negocia tus wins con tus contrincantes.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 11 · Batallas, monetización y club de fans · 4.2`,
  },
  {
    id: "batallas-4-3",
    embeddingText: `¿Qué son los multiplicadores y cómo se activan?`,
    keywords: [`Qué son los multiplicadores y cómo se activan`],
    respuesta: `Es una función automática que multiplica los puntos durante una partida. Se preactivan según el desempeño de tu LIVE en likes, tap tap, comentarios y regalos. Hay x2 y x3.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El multiplicador no te lo da la suerte, te lo da tu gente comentando y dando tap tap. El proceso tiene cinco pasos: notificación, tipo de multiplicador, requisitos, preactivación y activación. El error es creer que es aleatorio y no pedirle nada a la audiencia durante la batalla.`,
    fuente: `Slide 12 · Batallas, monetización y club de fans · 4.3`,
  },
  {
    id: "batallas-5-1",
    embeddingText: `¿Qué es una batalla oficial?`,
    keywords: [`Qué es una batalla oficial`],
    respuesta: `Partidas LIVE previamente aprobadas y supervisadas por TikTok, coordinadas y programadas con anticipación para tener un resultado destacado frente a las del día a día.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 15 · Batallas, monetización y club de fans · 5.1`,
  },
  {
    id: "batallas-5-2",
    embeddingText: `¿Con cuánta anticipación se programa una batalla oficial?`,
    keywords: [`Con cuánta anticipación se programa una batalla oficial`],
    respuesta: `Mínimo 15 días antes.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los cuatro tips del material: programación anticipada mínimo 15 días, publicidad personalizada con flyers y videos, crear el evento en tu perfil para que tus espectadores se registren, y comunicación constante informando e invitando a tu comunidad durante el live. Una batalla oficial anunciada con dos días es una batalla normal con nombre elegante.`,
    fuente: `Slide 15 · Batallas, monetización y club de fans · 5.2`,
  },
  {
    id: "batallas-5-3",
    embeddingText: `¿Quién programa las batallas oficiales?`,
    keywords: [`Quién programa las batallas oficiales`],
    respuesta: `La agencia. La fecha no la pones tú, pero la preparación sí es toda tuya.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Para estar en el radar cuando se programe la siguiente hay que estar transmitiendo con constancia.`,
    fuente: `Slide 15 · Batallas, monetización y club de fans · 5.3`,
  },
  {
    id: "batallas-6-1",
    embeddingText: `¿Cómo se determinan las recompensas LIVE?`,
    keywords: [`Cómo se determinan las recompensas LIVE`],
    respuesta: `En base al cumplimiento de las Misiones de Recompensas LIVE. Hay dos grupos: hasta 40% por misiones por sesión, y hasta 13% por misiones semanales.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La palabra clave es “hasta”: no te dan 40% por prender el live, 40% es lo máximo que puedes juntar sumando misiones y cada una aporta su pedacito. Las de sesión se juegan en cada live; las semanales a lo largo de siete días. Sumadas dan 53%.`,
    fuente: `Slide 17 · Batallas, monetización y club de fans · 6.1`,
  },
  {
    id: "batallas-6-2",
    embeddingText: `¿El porcentaje me lo dan automáticamente por transmitir?`,
    keywords: [`El porcentaje me lo dan automáticamente por transmitir`],
    respuesta: `No. Hay que cumplir misiones concretas. Cada una aporta su parte.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 17 · Batallas, monetización y club de fans · 6.2`,
  },
  {
    id: "batallas-6-3",
    embeddingText: `¿Dónde veo mi progreso de misiones? También preguntan: "¿cómo sé cuánto porcentaje llevo?"`,
    keywords: [`Dónde veo mi progreso de misiones`, `cómo sé cuánto porcentaje llevo`],
    respuesta: `En rendimiento en tiempo real durante el live, bajando a “Programa de Recompensas LIVE proporcionales” y dándole a ver detalles. Ahí se abre Recompensas LIVE escalonadas con dos pestañas: Este LIVE y Esta semana.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es el tablero donde vive todo el sistema. Si no lo encuentras, escríbele al equipo: sin él estás jugando a ciegas. La app además sugiere qué falta, con frases del tipo “si asciendes a la Liga A1 esta semana podrías obtener al menos un dólar cincuenta más”.`,
    fuente: `Slides 20 y 24 · Batallas, monetización y club de fans · 6.3`,
  },
  {
    id: "batallas-7-1",
    embeddingText: `¿Cuáles son las misiones por sesión?`,
    keywords: [`Cuáles son las misiones por sesión`],
    respuesta: `Tres: duración de la sesión, nuevos seguidores únicos, y ajuste por calidad de contenido (LMG). Las dos primeras suman, la tercera resta.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 18 · Batallas, monetización y club de fans · 7.1`,
  },
  {
    id: "batallas-7-2",
    embeddingText: `¿Cuánto da la duración de la sesión?`,
    keywords: [`Cuánto da la duración de la sesión`],
    respuesta: `Más de 25 minutos continuos dan +38%. Es la misión que más porcentaje aporta de todo el sistema.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los tramos completos: menos de 5 minutos, 20%. 5 minutos, 30%. 10 minutos, 35%. 25 minutos, 38%. Es duración continua: desconectarse reinicia el cronómetro.`,
    fuente: `Slides 19 y 20 · Batallas, monetización y club de fans · 7.2`,
  },
  {
    id: "batallas-7-3",
    embeddingText: `Se me cae el internet y se corta el live, ¿pierdo la duración?`,
    keywords: [`Se me cae el internet y se corta el live, ¿pierdo la duración`],
    respuesta: `Sí. La duración es continua y desconectarse reinicia el cronómetro.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El ejemplo del material: un live de 40 minutos seguidos cobra el 38%. Otro de una hora en tramos de menos de 15 minutos cobra menos, aunque transmitió más tiempo. El error es cortar y volver a prender el live varias veces.`,
    fuente: `Slide 19 · Batallas, monetización y club de fans · 7.3`,
  },
  {
    id: "batallas-7-4",
    embeddingText: `¿Cuánto dan los nuevos seguidores?`,
    keywords: [`Cuánto dan los nuevos seguidores`],
    respuesta: `Más de 5 nuevos seguidores únicos dan +2%.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los tramos: 1 a 2 seguidores dan 1%, 3 dan 1,5%, 5 dan 2%.`,
    fuente: `Slides 19 y 20 · Batallas, monetización y club de fans · 7.4`,
  },
  {
    id: "batallas-7-5",
    embeddingText: `¿Qué es el ajuste por calidad de contenido (LMG)?`,
    keywords: [`Qué es el ajuste por calidad de contenido (LMG)`],
    respuesta: `Es la penalización por infracciones a las políticas de monetización en LIVE. Sin infracción es 0. Con infracción es -20%.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slides 18 y 21 · Batallas, monetización y club de fans · 7.5`,
  },
  {
    id: "batallas-7-6",
    embeddingText: `¿Qué infracciones me quitan el 20%?`,
    keywords: [`Qué infracciones me quitan el 20%`],
    respuesta: `Dos: suspensión de regalos durante todo el LIVE, y suspensión de acceso a partidas LIVE (batallas).

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Estas dos no deducen: la advertencia (warning) y la suspensión de regalos por 10 minutos. O sea que hay dos escalones de aviso antes de que te toquen la plata.`,
    fuente: `Slide 21 · Batallas, monetización y club de fans · 7.6`,
  },
  {
    id: "batallas-7-7",
    embeddingText: `Me llegó una advertencia, ¿ya perdí el 20%?`,
    keywords: [`Me llegó una advertencia, ¿ya perdí el 20%`],
    respuesta: `No. La advertencia no deduce. Pero si sigues igual y te suspenden los regalos todo el live, ahí sí.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La advertencia es tu oportunidad gratis de corregir. El error es ignorarla creyendo que ya se perdió todo.`,
    fuente: `Slide 21 · Batallas, monetización y club de fans · 7.7`,
  },
  {
    id: "batallas-8-1",
    embeddingText: `¿Cuáles son las misiones semanales?`,
    keywords: [`Cuáles son las misiones semanales`],
    respuesta: `Tres: días válidos de LIVE esta semana, interacción medida en fans activos esta semana, y posición en la Liga de Creadores esta semana.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Las tres son de constancia y comunidad. Ninguna pide un live espectacular: piden estar, repetido, con la misma gente. El error es concentrar todo en dos lives largos el fin de semana; el maratón sirve para las horas del bono, no para estas misiones.`,
    fuente: `Slide 22 · Batallas, monetización y club de fans · 8.1`,
  },
  {
    id: "batallas-8-2",
    embeddingText: `¿Qué cuenta como día válido de LIVE? También preguntan: "¿cualquier día que prendí cuenta?"`,
    keywords: [`Qué cuenta como día válido de LIVE`, `cualquier día que prendí cuenta`],
    respuesta: `Un día en el que hiciste al menos un LIVE de más de 25 minutos consecutivos y recibiste al menos 1 diamante. Las tres condiciones juntas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `No es cualquier día que prendiste. Los 25 minutos tienen que ser consecutivos, y tiene que haber entrado al menos un diamante. Un live de 15 minutos no cuenta, y uno de una hora sin ningún diamante tampoco.`,
    fuente: `Slide 23 · Batallas, monetización y club de fans · 8.2`,
  },
  {
    id: "batallas-8-3",
    embeddingText: `¿Cuánto dan los días válidos?`,
    keywords: [`Cuánto dan los días válidos`],
    respuesta: `Más de 2 días válidos en la semana dan +8%. Un solo día da 6%.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slides 23 y 24 · Batallas, monetización y club de fans · 8.3`,
  },
  {
    id: "batallas-8-4",
    embeddingText: `¿Qué es un fan activo?`,
    keywords: [`Qué es un fan activo`],
    respuesta: `Un fan que acumuló al menos un punto de fan durante la semana. Los puntos se obtienen viendo, comentando o enviando regalos.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Para que un fan inactivo se reactive debe enviar un Quiéreme, que cuesta una moneda.`,
    fuente: `Slide 23 · Batallas, monetización y club de fans · 8.4`,
  },
  {
    id: "batallas-8-5",
    embeddingText: `¿Cuántos fans activos necesito y cuánto dan?`,
    keywords: [`Cuántos fans activos necesito y cuánto dan`],
    respuesta: `En LATAM: de 10 a 25 fans activos dan +1%, de 25 a 50 dan +1,5%, más de 50 dan +2%.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 23 · Batallas, monetización y club de fans · 8.5`,
  },
  {
    id: "batallas-8-6",
    embeddingText: `¿Cuánto da la liga de creadores?`,
    keywords: [`Cuánto da la liga de creadores`],
    respuesta: `De 0 a 3%, limitado a 1.000 dólares por semana.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Tres escenarios. Superas la liga más alta de tu historial: +3%. Mantienes la misma liga del historial: +1%. Caes de la liga del historial: 0%.`,
    fuente: `Slides 24 y 25 · Batallas, monetización y club de fans · 8.6`,
  },
  {
    id: "batallas-8-7",
    embeddingText: `Toqué una liga más alta pero bajé un día, ¿cobro?`,
    keywords: [`Toqué una liga más alta pero bajé un día, ¿cobro`],
    respuesta: `No. Si caes de tu liga histórica, aunque sea un solo día, te vas a cero.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El ejemplo del material: un creador con histórico B4 estuvo en B4 casi toda la semana y bajó a B5 un solo día, y eso ya lo dejó en cero. Comparado con quien hizo B4 parejo toda la semana y cobró 1%. Sostener vale más que picar alto.`,
    fuente: `Slide 25 · Batallas, monetización y club de fans · 8.7`,
  },
  {
    id: "batallas-9-1",
    embeddingText: `¿Cómo funcionan las ligas?`,
    keywords: [`Cómo funcionan las ligas`],
    respuesta: `Hay cuatro ligas, D (entrada), C, B y A (la más alta), cada una con cinco escalones. Los diamantes te dan posición, la posición te da fragmentos, y los fragmentos te suben de escalón.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Cada tarjeta te dice el escalón donde estás, cuántos fragmentos faltan para el siguiente, y tu posición en porcentaje (top 71%, top 5%). Abajo aparece una frase del tipo “se necesitan 316 diamantes más para alcanzar el 20% superior y conseguir un fragmento”.`,
    fuente: `Slide 26 · Batallas, monetización y club de fans · 9.1`,
  },
  {
    id: "batallas-9-2",
    embeddingText: `¿Se sube de liga con una cantidad fija de diamantes?`,
    keywords: [`Se sube de liga con una cantidad fija de diamantes`],
    respuesta: `No. Se compite por posición relativa, o sea contra los demás, no contra un número fijo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La consecuencia que sorprende: puedes hacer los mismos diamantes de la semana pasada y bajar de posición, simplemente porque a los demás les fue mejor.`,
    fuente: `Slide 27 · Batallas, monetización y club de fans · 9.2`,
  },
  {
    id: "batallas-9-3",
    embeddingText: `¿En qué liga estoy?`,
    keywords: [`En qué liga estoy`],
    respuesta: `Se ve en tu perfil. Esa letra y ese número son la referencia contra la que se mide tu porcentaje de liga cada semana.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `1 0. CLUB DE FA NS: QUÉ ES Y PA RA QUÉ SIRV E`,
    fuente: `Slide 26 · Batallas, monetización y club de fans · 9.3`,
  },
  {
    id: "batallas-10-1",
    embeddingText: `¿Qué es el club de fans?`,
    keywords: [`Qué es el club de fans`],
    respuesta: `Una herramienta para convertir espectadores ocasionales en parte activa de una comunidad, generando sentido de pertenencia y lealtad hacia el creador.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La palabra clave es “ocasionales”: el club no es para la gente que ya te quiere, esos ya están. Su objetivo, a través de misiones diarias, es fomentar la participación constante en tus LIVE (los fans activos) y maximizar las oportunidades de monetización con esa audiencia.`,
    fuente: `Slide 31 · Batallas, monetización y club de fans · 10.1`,
  },
  {
    id: "batallas-10-2",
    embeddingText: `¿Necesito tener muchos fans para abrir el club?`,
    keywords: [`Necesito tener muchos fans para abrir el club`],
    respuesta: `Al revés: el club es la herramienta para conseguirlos. Si esperas a tener comunidad para abrirlo, nunca lo vas a abrir.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 31 · Batallas, monetización y club de fans · 10.2`,
  },
  {
    id: "batallas-10-3",
    embeddingText: `¿Para qué me sirve el club de fans?`,
    keywords: [`Para qué me sirve el club de fans`],
    respuesta: `Es la máquina que alimenta la misión semanal de fans activos, la que te da hasta 2%.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los cuatro beneficios del material: fanáticos activos en una comunidad que los vuelve parte de tu día a día; actividades exclusivas para tus miembros más importantes que aumentan tu popularidad en TikTok LIVE; nuevas oportunidades de atraer más espectadores e ingresos a largo plazo; y super fans que representan a la comunidad más leal. El error es tratarlo como algo decorativo.`,
    fuente: `Slides 30 y 22 · Batallas, monetización y club de fans · 10.3`,
  },
  {
    id: "batallas-10-4",
    embeddingText: `¿Cuál es el ciclo del club de fans?`,
    keywords: [`Cuál es el ciclo del club de fans`],
    respuesta: `Cinco pasos que se reinician: construye tu comunidad, mantén a los fans activos, cultiva su lealtad, conviértete en creador popular, y genera ingresos y tráfico sostenibles.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Paso 1, invita a los espectadores a enviarte Quiéreme para unirse. Paso 2, establece conexión reconociendo su apoyo y mostrando agradecimiento. Paso 3, cultiva lealtad, que se traduce en regalos constantes. Paso 4, la actividad de tus fans mejora tu posición en el ranking. Paso 5, ser destacado en Popular LIVE aumenta tu visibilidad, atrae más espectadores, más fans, más ingresos, y reinicia el ciclo. TikTok recomienda los LIVES según cuatro indicadores de interacción: seguir, me gusta, comentarios y regalos.

1 1. CLUB DE FA NS: MECÁNICA`,
    fuente: `Slide 32 · Batallas, monetización y club de fans · 10.4`,
  },
  {
    id: "batallas-11-1",
    embeddingText: `¿Cómo entra alguien a mi club de fans? También preguntan: "¿cuánto cuesta entrar al club?"`,
    keywords: [`Cómo entra alguien a mi club de fans`, `cuánto cuesta entrar al club`],
    respuesta: `Enviando un Quiéreme, que cuesta una moneda, y siguiendo al creador. Eso es todo.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 33 · Batallas, monetización y club de fans · 11.1`,
  },
  {
    id: "batallas-11-2",
    embeddingText: `¿Qué hacen los fans para subir de nivel?`,
    keywords: [`Qué hacen los fans para subir de nivel`],
    respuesta: `Misiones diarias: enviar Quiéreme, dejar comentarios, enviar voto Popular, ver el LIVE del creador, y enviar otros regalos según el nivel del fan.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 33 · Batallas, monetización y club de fans · 11.2`,
  },
  {
    id: "batallas-11-3",
    embeddingText: `¿Cuál es la diferencia entre puntos de fan y puntos de popularidad?`,
    keywords: [`Cuál es la diferencia entre puntos de fan y puntos de popularidad`],
    respuesta: `Los puntos de fan suben de nivel al fan dentro de tu club. Los puntos de popularidad te suben a ti en el ranking de LIVE popular.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Son dos marcadores distintos, uno para él y uno para ti, y los dos se mueven con las mismas acciones. El error es confundirlos y no saber explicarle al espectador para qué sirve cada cosa.`,
    fuente: `Slide 33 · Batallas, monetización y club de fans · 11.3`,
  },
  {
    id: "batallas-11-4",
    embeddingText: `¿Cuáles son los niveles de regalo del club de fans?`,
    keywords: [`Cuáles son los niveles de regalo del club de fans`],
    respuesta: `Seis etapas. Corazón de felicitación (niveles 1-9, 99 monedas), corazón de amigos (10-19, 299), corazón floreciente (20-29, 1.599), corazón devoto (30-39, 5.999), corazón de cristal (40-49, 14.999) y corazón infinito (nivel 50, 23.999).

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El fan desbloquea un regalo en cada etapa, simbolizando el fortalecimiento de la relación. En los niveles 4, 5 y 6 hay personalización con foto de perfil del creador y del fan, y el número de días desde que se unió al club.`,
    fuente: `Slide 34 · Batallas, monetización y club de fans · 11.4`,
  },
  {
    id: "batallas-11-5",
    embeddingText: `¿Debo mencionar los niveles del club en vivo?`,
    keywords: [`Debo mencionar los niveles del club en vivo`],
    respuesta: `Sí. Nadie sube un nivel que no sabe que existe.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El ejemplo del material: decir “Sandra va en nivel 19, le falta uno para el corazón floreciente” convierte mucho más que no nombrar nunca los niveles.`,
    fuente: `Slide 34 · Batallas, monetización y club de fans · 11.5`,
  },
  {
    id: "batallas-11-6",
    embeddingText: `¿Qué es el voto Popular?`,
    keywords: [`Qué es el voto Popular`],
    respuesta: `Un regalo que cuesta una moneda (o Super Popular por nueve) y otorga un punto de popularidad al ranking de LIVE popular del creador. Los 99 creadores con más puntos se destacan en ese ranking.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La matemática importa: una moneda es un punto, así que veinte personas de tu club poniendo una moneda mueven la aguja más que un regalo grande de una sola persona. El club de fans es un ejército, no un mecenas.

1 2. CLUB DE FA NS: PA NELES Y GESTIÓN`,
    fuente: `Slide 37 · Batallas, monetización y club de fans · 11.6`,
  },
  {
    id: "batallas-12-1",
    embeddingText: `¿Qué ve el fan en su panel?`,
    keywords: [`Qué ve el fan en su panel`],
    respuesta: `Equipo del creador (el club), puntos del miembro (puntos de fan), puntos del equipo (puntos de popularidad) y check in diario (antes llamado misiones diarias).

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El check in diario son tareas simples que motivan a los fans a visitar tu club todos los días, aunque no estés transmitiendo. Hay además bonos por completar todas las tareas, misiones extras, y actividades del club para desbloquear regalos exclusivos.`,
    fuente: `Slide 35 · Batallas, monetización y club de fans · 12.1`,
  },
  {
    id: "batallas-12-2",
    embeddingText: `¿Mis fans pueden hacer algo los días que no transmito?`,
    keywords: [`Mis fans pueden hacer algo los días que no transmito`],
    respuesta: `Sí, el check in diario. La mayoría de creadores no lo sabe y por eso nunca lo menciona.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 35 · Batallas, monetización y club de fans · 12.2`,
  },
  {
    id: "batallas-12-4",
    embeddingText: `¿Le puedo poner nombre a mi club de fans?`,
    keywords: [`Le puedo poner nombre a mi club de fans`],
    respuesta: `Sí, en la zona del club de fans. También puedes configurar un regalo exclusivo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La recomendación es que no sea tu nombre de usuario, sino algo que la gente quiera decir que es. La diferencia entre “los fans de Xiomara” y un nombre con identidad propia es grande.

1 3. CÓMO HACER CRECER EL CLUB`,
    fuente: `Slide 36 · Batallas, monetización y club de fans · 12.4`,
  },
  {
    id: "batallas-13-1",
    embeddingText: `¿Cómo consigo que más gente entre a mi club de fans?`,
    keywords: [`Cómo consigo que más gente entre a mi club de fans`],
    respuesta: `Cuatro tips: pon el regalo Quiéreme como objetivo del LIVE, muestra stickers del club, muestra un sticker con mensaje invitando a unirse, y fija un comentario de un fan que anime a los demás.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Poner el Quiéreme como objetivo del live hace que cada persona que aporta a la meta se esté uniendo de paso a tu club. Y el comentario fijado de un fan es el más inteligente: que tú invites suena a que quieres algo, que un fan invite suena a recomendación.`,
    fuente: `Slide 38 · Batallas, monetización y club de fans · 13.1`,
  },
  {
    id: "batallas-13-2",
    embeddingText: `¿Cómo invito al club sin sonar insistente?`,
    keywords: [`Cómo invito al club sin sonar insistente`],
    respuesta: `Usando el testimonio de un fan existente. “Yo llevo tres meses en el club y vale la pena” convierte más que “únanse a mi club”.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `1 4. CIERRE DEL MÓDULO`,
    fuente: `Slide 38 · Batallas, monetización y club de fans · 13.2`,
  },
  {
    id: "batallas-14-1",
    embeddingText: `¿Qué debo hacer esta semana después de este módulo?`,
    keywords: [`Qué debo hacer esta semana después de este módulo`],
    respuesta: `Haz una batalla aunque la pierdas, ponle nombre a tu club de fans, configura el Quiéreme como objetivo de un live, y anota en qué porcentaje semanal vas.

¿Tienes alguna otra duda? 😊`,
    fuente: `Cierre · Batallas, monetización y club de fans · 14.1`,
  },
  {
    id: "mentalidad-1-1",
    embeddingText: `¿Cuáles son las claves del éxito en TikTok LIVE?`,
    keywords: [`Cuáles son las claves del éxito en TikTok LIVE`],
    respuesta: `Tres: constancia, ser auténtico y objetivos claros.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `No son tres consejos independientes, es una máquina de tres piezas. Los objetivos claros te dicen para dónde vas, la constancia es lo que te lleva, y la autenticidad es lo que hace que puedas sostener la constancia sin quemarte, porque mantener un personaje cansa más que ser uno mismo. Si le quitas una pieza, las otras dos se caen: con objetivos y autenticidad pero sin constancia no pasa nada, y con constancia sin objetivos te agotas sin avanzar.`,
    fuente: `Slide 2 · Mentalidad, constancia y objetivos · 1.1`,
  },
  {
    id: "mentalidad-1-2",
    embeddingText: `¿Qué diferencia a quien avanza de quien abandona?`,
    keywords: [`Qué diferencia a quien avanza de quien abandona`],
    respuesta: `No es talento, es la mentalidad.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material lo plantea así: aquí no hay audición ni casting, el filtro es quién sigue prendiendo la cámara en el mes ocho. La facilidad acelera, la mentalidad es lo que sostiene. El error es explicar el estancamiento propio con falta de talento en vez de con falta de constancia.`,
    fuente: `Slide 3 · Mentalidad, constancia y objetivos · 1.2`,
  },
  {
    id: "mentalidad-2-1",
    embeddingText: `¿Qué significa exactamente ser constante? También preguntan: "¿cómo sé si estoy siendo constante?"`,
    keywords: [`Qué significa exactamente ser constante`, `cómo sé si estoy siendo constante`],
    respuesta: `Cuatro cosas: transmitir todos los días aunque no tengas ganas, permanecer mínimo dos horas aunque haya pocos espectadores, volver mañana aunque hoy no haya sido buen live, y mantener horarios definidos.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Eso construye confianza en tres lugares a la vez: en el algoritmo, porque le enseñas cuándo apareces; en tu audiencia, porque saben dónde encontrarte; y en ti mismo, que es el que más cuesta. El error es transmitir solo los días que hay ganas y llamarle constancia a eso.`,
    fuente: `Slide 4 · Mentalidad, constancia y objetivos · 2.1`,
  },
  {
    id: "mentalidad-2-2",
    embeddingText: `¿Qué hago si un día de verdad no tengo ganas de transmitir? También preguntan: "hoy no tengo ánimo"; "estoy cansado"; "no me provoca transmitir"`,
    keywords: [`Qué hago si un día de verdad no tengo ganas de transmitir`, `hoy no tengo ánimo`, `estoy cansado`, `no me provoca transmitir`],
    respuesta: `El material es claro: ser constante incluye transmitir aunque no haya ganas. La motivación es temporal, la disciplina es permanente.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Si estás enfermo o hay una urgencia es otra cosa, pero la falta de ánimo no es motivo. La motivación es lo que te hizo entrar a la agencia; la disciplina es lo que te hace prender la cámara un martes lluvioso cuando entraron tres personas. Las dos sirven, pero solo una te paga.`,
    fuente: `Slides 4 y 5 · Mentalidad, constancia y objetivos · 2.2`,
  },
  {
    id: "mentalidad-2-3",
    embeddingText: `¿Cuánto tiempo mínimo debo quedarme si hay poca gente?`,
    keywords: [`Cuánto tiempo mínimo debo quedarme si hay poca gente`],
    respuesta: `Mínimo dos horas, aunque no haya mucha gente. Es la misma cifra del plan de conexión de la bienvenida.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 4 · Mentalidad, constancia y objetivos · 2.3`,
  },
  {
    id: "mentalidad-2-4",
    embeddingText: `¿Qué hace un streamer disciplinado?`,
    keywords: [`Qué hace un streamer disciplinado`],
    respuesta: `Respeta sus horarios, prepara su contenido, cuida su energía y su actitud, aprende de sus errores, y no depende del ánimo del día.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material añade la frase que cambia el marco: considera esto un trabajo real. Transmitir es un compromiso contigo mismo y con tu proceso.`,
    fuente: `Slide 5 · Mentalidad, constancia y objetivos · 2.4`,
  },
  {
    id: "mentalidad-2-5",
    embeddingText: `¿Cómo sé si tengo un problema de disciplina?`,
    keywords: [`Cómo sé si tengo un problema de disciplina`],
    respuesta: `Mira tu plan de conexión y pregúntate: si esto fuera un trabajo con jefe, horario y sueldo, ¿lo estarías cumpliendo? Ese sí o no es tu diagnóstico.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 5 · Mentalidad, constancia y objetivos · 2.5`,
  },
  {
    id: "mentalidad-3-1",
    embeddingText: `Llevo un mes y sigo con cinco espectadores, ¿estoy haciendo algo mal? También preguntan: "esto no está funcionando"; "¿por qué no crezco?"`,
    keywords: [`Llevo un mes y sigo con cinco espectadores, ¿estoy haciendo algo mal`, `esto no está funcionando`, `por qué no crezco`],
    respuesta: `Todos los streamers grandes empezaron con cero espectadores, y el crecimiento real es silencioso al inicio.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material dibuja una escalera: nadie te ve, 5 espectadores, 20, 200, más de 500. En la parte de abajo pasan cosas que no se ven, se está armando gente que todavía no comenta, gente que entra y sale, gente que te tiene en el radar. Eso no se refleja en el contador. Antes de concluir que algo está mal, revisa las cuatro condiciones de constancia.`,
    fuente: `Slide 6 · Mentalidad, constancia y objetivos · 3.1`,
  },
  {
    id: "mentalidad-3-2",
    embeddingText: `¿Cuánto se demora en verse el crecimiento?`,
    keywords: [`Cuánto se demora en verse el crecimiento`],
    respuesta: `El material no da un plazo, pero sí un ejemplo: una creadora con 5 espectadores en el mes uno que cumplió horarios tenía 20 fijos en el mes cuatro.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La diferencia con quien se va no fue talento, fue darle tiempo a la parte silenciosa. El error es juzgar el proyecto entero por el contador de las primeras semanas.`,
    fuente: `Slide 6 · Mentalidad, constancia y objetivos · 3.2`,
  },
  {
    id: "mentalidad-4-1",
    embeddingText: `¿Por qué insisten tanto en ser auténtico?`,
    keywords: [`Por qué insisten tanto en ser auténtico`],
    respuesta: `Porque lo falso se detecta rápido, y actuar como alguien que no eres te cansa más, te desgasta y te hace perder naturalidad. La audiencia conecta con personas, no con personajes forzados.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Del lado positivo, TikTok premia la conexión, no la perfección. Cuando eres auténtico respondes desde tu experiencia, reaccionas de forma genuina y generas conversaciones reales, y eso hace que la gente se quede más tiempo. O sea que ser auténtico no es solo un valor: es tiempo de permanencia, una de las cinco métricas del algoritmo.`,
    fuente: `Slide 7 · Mentalidad, constancia y objetivos · 4.1`,
  },
  {
    id: "mentalidad-4-2",
    embeddingText: `¿Ser auténtico significa contar mi vida personal?`,
    keywords: [`Ser auténtico significa contar mi vida personal`],
    respuesta: `No. El material lo aclara explícitamente: ser auténtico NO significa contar tu vida privada.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Tampoco significa dejar de mejorar tu comunicación ni dejar de aprender de la plataforma. Y hay un riesgo concreto: dar información personal es el primer motivo de bloqueo del módulo 1. Confundir autenticidad con exposición es un error caro.`,
    fuente: `Slide 8 · Mentalidad, constancia y objetivos · 4.2`,
  },
  {
    id: "mentalidad-4-3",
    embeddingText: `¿Puedo copiar el estilo de un creador que le va bien?`,
    keywords: [`Puedo copiar el estilo de un creador que le va bien`],
    respuesta: `No conviene. Si empiezas copiando a otros, atraes público que en realidad busca a otra persona, y cuando cambias se van.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Si eres tú, llegan personas que conectan con tu forma de pensar, hablar y reaccionar, y esos no se van cuando cambias porque tú eres la constante. Además, ser tú reduce la presión, te hace disfrutar el proceso y te ayuda a ser constante: mantener un personaje es agotador.`,
    fuente: `Slide 8 · Mentalidad, constancia y objetivos · 4.3`,
  },
  {
    id: "mentalidad-5-1",
    embeddingText: `¿Qué objetivos me pongo si estoy empezando?`,
    keywords: [`Qué objetivos me pongo si estoy empezando`],
    respuesta: `Los objetivos principales: perder el miedo y crear el hábito de conexión, mantener conversación sin silencios largos, responder a todos los comentarios, y que algunos espectadores empiecen a regresar constantemente.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Ninguno habla de plata. Son de oficio. El error es ponerse objetivos de monetización antes de tener resueltos los de oficio.`,
    fuente: `Slide 9 · Mentalidad, constancia y objetivos · 5.1`,
  },
  {
    id: "mentalidad-5-2",
    embeddingText: `¿Cuáles son los objetivos del siguiente escalón?`,
    keywords: [`Cuáles son los objetivos del siguiente escalón`],
    respuesta: `Crear comunidad, generar interacción constante con dinámicas, preguntas y batallas, incentivar regalos de forma natural, crear metas dentro del live, y profesionalizar el set de transmisión.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 9 · Mentalidad, constancia y objetivos · 5.2`,
  },
  {
    id: "mentalidad-5-3",
    embeddingText: `¿Qué son los objetivos personales?`,
    keywords: [`Qué son los objetivos personales`],
    respuesta: `Sentirte cada vez más cómodo frente a la cámara, aprender a improvisar, tener un club de fans de X miembros, disfrutar tu trabajo, aceptar los errores sin frustrarte, respetar tus días y horas de conexión, y ponerte una meta monetaria mensual.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 10 · Mentalidad, constancia y objetivos · 5.3`,
  },
  {
    id: "mentalidad-5-4",
    embeddingText: `¿En qué me debo enfocar en los primeros meses?`,
    keywords: [`En qué me debo enfocar en los primeros meses`],
    respuesta: `Confianza, comunicación, disciplina, disfrutar y autenticidad. En esa lista no aparece la monetización.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Tampoco aparecen los seguidores ni la liga. El error es medirse solo por monetización cuando el enfoque de la etapa de arranque es otro. Y la recomendación es trabajar uno de los cinco por mes, no los cinco a la vez.`,
    fuente: `Slide 10 · Mentalidad, constancia y objetivos · 5.4`,
  },
  {
    id: "mentalidad-5-5",
    embeddingText: `¿Cómo convierto un objetivo en algo útil?`,
    keywords: [`Cómo convierto un objetivo en algo útil`],
    respuesta: `Haciéndolo medible. En vez de “responder comentarios”, escribe “no dejar ningún comentario sin respuesta en mis próximos cinco lives”.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La frase del material es: convierte tus objetivos en un plan claro y accionable. Es la diferencia entre “quiero crecer” y algo que se puede verificar.`,
    fuente: `Slide 9 · Mentalidad, constancia y objetivos · 5.5`,
  },
  {
    id: "mentalidad-5-6",
    embeddingText: `¿Qué preguntas debo hacerme para proyectar mi crecimiento?`,
    keywords: [`Qué preguntas debo hacerme para proyectar mi crecimiento`],
    respuesta: `Tres: ¿qué quiero lograr?, ¿qué tipo de streamer quiero ser?, ¿qué puedo mejorar cada semana?

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La segunda es la más difícil y la más útil. No es quién quieres ser, es de qué tipo: la que conversa, el que juega, la que canta, el que acompaña de madrugada, la que arma dinámicas. Cuando sabes de qué tipo eres se acaban las noches de “no sé qué hacer hoy”. El error es no definirlo nunca y por eso improvisar cada noche.`,
    fuente: `Slide 12 · Mentalidad, constancia y objetivos · 5.6`,
  },
  {
    id: "mentalidad-6-1",
    embeddingText: `¿Cómo debo tratar mi actividad en TikTok?`,
    keywords: [`Cómo debo tratar mi actividad en TikTok`],
    respuesta: `Como un proyecto con cuatro pilares: objetivos claros, horarios, evaluación y mejora constante.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Y tres equivalencias: tú eres la marca, tu actitud es el producto, tu constancia es la inversión. Lo que la gente viene a consumir es cómo te comportas, no tu cara ni tu casa.`,
    fuente: `Slide 11 · Mentalidad, constancia y objetivos · 6.1`,
  },
  {
    id: "mentalidad-6-2",
    embeddingText: `¿Cuál de los cuatro pilares es el que más se descuida?`,
    keywords: [`Cuál de los cuatro pilares es el que más se descuida`],
    respuesta: `La evaluación. Todo el mundo transmite, poca gente se sienta a revisar cómo le fue.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Sin evaluación la mejora constante es imposible, porque no sabes qué mejorar.`,
    fuente: `Slide 11 · Mentalidad, constancia y objetivos · 6.2`,
  },
  {
    id: "mentalidad-7-1",
    embeddingText: `¿Contra quién debo medir mi progreso? También preguntan: "veo a otros creciendo más rápido"`,
    keywords: [`Contra quién debo medir mi progreso`, `veo a otros creciendo más rápido`],
    respuesta: `Contra ti mismo. El único dato honesto que tienes es tu propia semana pasada.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Compararse con otros es la primera de las tres mentalidades equivocadas, y no solo desanima: hace tomar malas decisiones. Empiezas a copiar formatos que a ti no te sirven, a envidiar horarios que no puedes cumplir, a medirte contra alguien que lleva tres años.`,
    fuente: `Slide 13 · Mentalidad, constancia y objetivos · 7.1`,
  },
  {
    id: "mentalidad-7-2",
    embeddingText: `¿Cuáles son las tres mentalidades equivocadas?`,
    keywords: [`Cuáles son las tres mentalidades equivocadas`],
    respuesta: `Compararte con otros, esperar resultados rápidos, y transmitir sin rumbo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Frente a cada una, la corrección: compararte solo contigo mismo, celebrar pequeños avances, y aprender todos los días.`,
    fuente: `Slide 13 · Mentalidad, constancia y objetivos · 7.2`,
  },
  {
    id: "mentalidad-7-3",
    embeddingText: `¿Qué me da la constancia, la disciplina y la paciencia?`,
    keywords: [`Qué me da la constancia, la disciplina y la paciencia`],
    respuesta: `La constancia te hace visible, la disciplina te hace profesional, la paciencia te hace crecer. En ese orden.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es una secuencia: primero te ven, después te toman en serio, después creces. Mucha gente quiere el crecimiento antes de la visibilidad, y eso no existe.`,
    fuente: `Slide 14 · Mentalidad, constancia y objetivos · 7.3`,
  },
  {
    id: "mentalidad-7-4",
    embeddingText: `¿Por qué se rinde tanta gente?`,
    keywords: [`Por qué se rinde tanta gente`],
    respuesta: `El material lo dice directo: no todos llegarán lejos en TikTok, no porque no puedan, sino porque muchos se rinden antes.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Pone dos caminos: ser uno más que lo intentó, o ser alguien que se mantuvo firme.`,
    fuente: `Slide 14 · Mentalidad, constancia y objetivos · 7.4`,
  },
  {
    id: "mentalidad-8-1",
    embeddingText: `¿Cómo debo verme en el live?`,
    keywords: [`Cómo debo verme en el live`],
    respuesta: `Siete puntos: encuadrado en la pantalla, set limpio, buena iluminación, atento a los espectadores, buen sonido, buena energía, y mantén el algoritmo de tu lado.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El séptimo no es de cámara, es la consecuencia de los otros seis: si estás encuadrado, con luz, con sonido y atento, la gente se queda, y si se queda el algoritmo te muestra. Los seis primeros son cosas de tu cuarto; el séptimo pasa solo.`,
    fuente: `Slide 15 · Mentalidad, constancia y objetivos · 8.1`,
  },
  {
    id: "mentalidad-8-2",
    embeddingText: `¿Qué es lo primero que debo arreglar si tengo poco presupuesto?`,
    keywords: [`Qué es lo primero que debo arreglar si tengo poco presupuesto`],
    respuesta: `Encuadre, iluminación y sonido. Ninguno depende de comprar equipo caro.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 15 · Mentalidad, constancia y objetivos · 8.2`,
  },
  {
    id: "mentalidad-8-3",
    embeddingText: `¿Cómo sé si mi encuadre está bien?`,
    keywords: [`Cómo sé si mi encuadre está bien`],
    respuesta: `Grábate 30 segundos como si estuvieras transmitiendo y míralo. ¿Se te ve la cara completa? ¿Hay algo feo en el fondo? ¿Se te oye bien?

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 15 · Mentalidad, constancia y objetivos · 8.3`,
  },
  {
    id: "mentalidad-8-4",
    embeddingText: `¿Qué tienen en común los lives que se ven bien?`,
    keywords: [`Qué tienen en común los lives que se ven bien`],
    respuesta: `Persona centrada y completa en el cuadro, luz en la cara, y chat con movimiento. Tres cosas, ninguna cuesta plata.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `En las batallas bien hechas, los dos creadores están al mismo nivel de encuadre, ninguno se ve más lejos ni más oscuro. Y en todas la persona está mirando a la cámara. El error es pensar que los lives que se ven bien necesitan equipo caro, cuando lo que tienen es encuadre y luz.`,
    fuente: `Slide 16 · Mentalidad, constancia y objetivos · 8.4`,
  },
  {
    id: "mentalidad-8-5",
    embeddingText: `¿Cuáles son los errores visuales más comunes?`,
    keywords: [`Cuáles son los errores visuales más comunes`],
    respuesta: `Cámara apuntando a un espacio sin nadie en cuadro, contrapicado extremo, encuadre torcido con la persona lejos, espacios grandes y oscuros sin protagonista, y ventanillas vacías.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Todas tienen algo en común: en ninguna sabes a quién mirar en el primer segundo. El error más frecuente es dejar la cámara apuntando a un espacio vacío mientras se hace otra cosa fuera de cuadro.`,
    fuente: `Slide 17 · Mentalidad, constancia y objetivos · 8.5`,
  },
  {
    id: "mentalidad-9-2",
    embeddingText: `Tuve un live malo, ¿qué hago mañana?`,
    keywords: [`Tuve un live malo, ¿qué hago mañana`],
    respuesta: `Volver. Volver mañana aunque hoy no haya sido un buen LIVE es una de las cuatro condiciones de la constancia.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La frase del material para los días malos: no todos los días serán buenos, pero cada día suma.`,
    fuente: `Slide 4 · Mentalidad, constancia y objetivos · 9.2`,
  },
  {
    id: "retencion-1-1",
    embeddingText: `¿Qué es la retención?`,
    keywords: [`Qué es la retención`],
    respuesta: `De espectadores que entran, a espectadores que se quedan.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Que entre gente es alcance. Que se quede es retención. Son cosas distintas y se arreglan de manera distinta. La ecuación del módulo es: retención = más alcance automático. Sin pagar, sin rogar y sin publicar nada.`,
    fuente: `Slide 2 · Retención, espectadores y donadores · 1.1`,
  },
  {
    id: "retencion-1-2",
    embeddingText: `¿Qué mide TikTok para impulsar un live?`,
    keywords: [`Qué mide TikTok para impulsar un live`],
    respuesta: `Cinco cosas: el tiempo promedio que las personas se quedan, la cantidad de comentarios, los likes y regalos, las personas nuevas que entran y no se van rápido, y el número de veces que te comparten.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `No son idénticas a las cinco del módulo 1. Allá estaban la tasa de clics y los nuevos seguidores; aquí están los comentarios y las veces compartidas. La cuarta, gente nueva que no se va rápido, es la que casi nadie recuerda.`,
    fuente: `Slide 2 · Retención, espectadores y donadores · 1.2`,
  },
  {
    id: "retencion-1-3",
    embeddingText: `¿Cómo funciona el ciclo del algoritmo?`,
    keywords: [`Cómo funciona el ciclo del algoritmo`],
    respuesta: `Cuatro pasos: TikTok le muestra tu live a pocas personas, si se quedan se lo muestra a más, si además interactúan lo expande aún más, y si se van rápido el live muere.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material usa la palabra “muere”, no “crece menos”. Por eso puedes tener 5.000 seguidores y que te vaya peor que a alguien con 500: el algoritmo no te premia por lo que acumulaste, te evalúa hoy, en esta transmisión.`,
    fuente: `Slide 3 · Retención, espectadores y donadores · 1.3`,
  },
  {
    id: "retencion-1-4",
    embeddingText: `¿Qué es más importante, que entre mucha gente o que se quede la que entra? También preguntan: "entra gente pero se va"; "no se me queda nadie"`,
    keywords: [`Qué es más importante, que entre mucha gente o que se quede la que entra`, `entra gente pero se va`, `no se me queda nadie`],
    respuesta: `Que se quede. No gana el live con más seguidores, gana el que retiene más.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Y hay una trampa: si entra más gente y se va igual de rápido, le estás dando al algoritmo más pruebas de que tu live no retiene. Más gente entrando con mala retención te hunde más rápido, no menos. El error es buscar más seguidores para arreglar un problema que en realidad es de retención.`,
    fuente: `Slide 3 · Retención, espectadores y donadores · 1.4`,
  },
  {
    id: "retencion-1-5",
    embeddingText: `¿Qué métrica debería estar mirando?`,
    keywords: [`Qué métrica debería estar mirando`],
    respuesta: `El tiempo promedio de visualización de tus lives, en tus estadísticas de LIVE.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error común es celebrar el pico de espectadores del minuto tres y no mirar nunca el tiempo promedio de permanencia.`,
    fuente: `Slide 1 · Retención, espectadores y donadores · 1.5`,
  },
  {
    id: "retencion-2-1",
    embeddingText: `¿Cuánto tiempo tengo para enganchar a alguien?`,
    keywords: [`Cuánto tiempo tengo para enganchar a alguien`],
    respuesta: `Diez segundos. Si no enganchas en diez segundos, pierdes al espectador.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 4 · Retención, espectadores y donadores · 2.1`,
  },
  {
    id: "retencion-2-2",
    embeddingText: `¿Cómo se hace un buen hook?`,
    keywords: [`Cómo se hace un buen hook`],
    respuesta: `Prometiendo algo que todavía no pasó. Los dos ejemplos del material: “Quédate, que en unos minutos les voy a contar cómo casi me roban llegando del trabajo” y “Cuando lleguemos a diez mil de tap tap, cumplo un reto, por ejemplo cien sentadillas”.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Uno promete una historia, el otro promete un premio. Ninguno habla del clima.`,
    fuente: `Slide 4 · Retención, espectadores y donadores · 2.2`,
  },
  {
    id: "retencion-2-3",
    embeddingText: `¿Qué nunca debo hacer al abrir el live?`,
    keywords: [`Qué nunca debo hacer al abrir el live`],
    respuesta: `Tres cosas: decir “hola, esperemos a que entre gente”, quedarte en silencio, o poner música sin hablar.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Son la forma más rápida de matar un live, y las hacemos todos al principio.`,
    fuente: `Slide 4 · Retención, espectadores y donadores · 2.3`,
  },
  {
    id: "retencion-2-4",
    embeddingText: `¿El hook es solo al abrir el live?`,
    keywords: [`El hook es solo al abrir el live`],
    respuesta: `No. Cada vez que entra alguien nuevo, esa persona está en su segundo cero. Tienes que estar dando hook durante las dos horas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Si a la hora y media alguien entra y te encuentra callada, para esa persona tu live entero es un live callado.`,
    fuente: `Slide 10 · Retención, espectadores y donadores · 2.4`,
  },
  {
    id: "retencion-2-6",
    embeddingText: `¿Cómo escojo el tema del live?`,
    keywords: [`Cómo escojo el tema del live`],
    respuesta: `Antes de prender la cámara, en una frase concreta. “Hoy hablamos de las peores citas que hemos tenido” sirve; “hoy hablamos de la vida” no sirve.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El tema no se improvisa. El error es saludar y quedarse callado esperando a que la gente proponga de qué hablar.`,
    fuente: `Slide 5 · Retención, espectadores y donadores · 2.6`,
  },
  {
    id: "retencion-2-7",
    embeddingText: `¿Por qué tengo que leer los nombres en voz alta?`,
    keywords: [`Por qué tengo que leer los nombres en voz alta`],
    respuesta: `Porque cuando lees un nombre, esa persona deja de ser público y pasa a ser participante. Y el que está mirando callado piensa “aquí sí me van a ver”.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Si el nombre es impronunciable, lees lo que puedas, dices “perdón si lo dije mal” y sigues: eso suena a persona, no a robot. El error es saludar solo a quienes envían regalos y dejar sin nombre a los que acaban de entrar.`,
    fuente: `Slide 7 · Retención, espectadores y donadores · 2.7`,
  },
  {
    id: "retencion-3-1",
    embeddingText: `¿Qué es una promesa de valor?`,
    keywords: [`Qué es una promesa de valor`],
    respuesta: `La razón para quedarse. La gente se queda cuando sabe que va a ganar algo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los tres ejemplos del material: “Responderé preguntas incómodas a los que estén interactuando”, “A los treinta minutos pondré un cofre”, “Estaré siguiendo a los que envíen el quiéreme”. Las tres tienen un cuándo o un qué hay que hacer. No son “quédense que va a estar bueno”. El error es prometer valor sin decir cuándo.`,
    fuente: `Slide 8 · Retención, espectadores y donadores · 3.1`,
  },
  {
    id: "retencion-3-2",
    embeddingText: `¿Cuál es el secreto real de la retención?`,
    keywords: [`Cuál es el secreto real de la retención`],
    respuesta: `La interacción constante: hacer preguntas constantemente, repetir las dinámicas o temas del live, y acompañar tu interacción con lenguaje facial y corporal.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Lo de repetir es lo que nadie hace. Llevas hora y media diciendo lo mismo y estás aburrida, pero el que acaba de entrar no ha oído nada. Repetir no es redundar, es recibir.`,
    fuente: `Slide 8 · Retención, espectadores y donadores · 3.2`,
  },
  {
    id: "retencion-3-3",
    embeddingText: `¿Qué premia TikTok en la forma de presentarse?`,
    keywords: [`Qué premia TikTok en la forma de presentarse`],
    respuesta: `Voz clara, energía alta, movimiento, sonrisa y seguridad.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 8 · Retención, espectadores y donadores · 3.3`,
  },
  {
    id: "retencion-3-4",
    embeddingText: `¿Por qué tengo que responder todos los comentarios?`,
    keywords: [`Por qué tengo que responder todos los comentarios`],
    respuesta: `Porque no es cortesía, es algoritmo. La cantidad de comentarios es una de las cinco cosas que mide TikTok.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Cada pregunta que haces es una invitación a comentar, y cada respuesta tuya es la razón por la que esa persona vuelve a escribir. El error es hacer una sola pregunta al abrir y después dedicarse a hablar solo.`,
    fuente: `Slide 6 · Retención, espectadores y donadores · 3.4`,
  },
  {
    id: "retencion-4-1",
    embeddingText: `¿Qué proporción de mi público comenta? También preguntan: "¿por qué nadie escribe en mi live?"`,
    keywords: [`Qué proporción de mi público comenta`, `por qué nadie escribe en mi live`],
    respuesta: `El 80% mira, el 15% interactúa y el 5% sostiene el live.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La trampa es que casi todos diseñamos el live para el 15%, porque es el que se oye. Pero el 80% es el que decide tu tiempo promedio, y el 5% es el que decide tu ingreso.`,
    fuente: `Slide 9 · Retención, espectadores y donadores · 4.1`,
  },
  {
    id: "retencion-4-2",
    embeddingText: `¿Qué tipos de espectador hay?`,
    keywords: [`Qué tipos de espectador hay`],
    respuesta: `Siete: el scroller, el silencioso, el participativo, el crítico, el que apoya, el curioso y el troll.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `En la rejilla del material aparecen seis; el curioso tiene slide propio pero no está en esa rejilla.`,
    fuente: `Slides 9 a 16 · Retención, espectadores y donadores · 4.2`,
  },
  {
    id: "retencion-4-3",
    embeddingText: `¿Qué es el scroller y cómo lo retengo?`,
    keywords: [`Qué es el scroller y cómo lo retengo`],
    respuesta: `Un espectador fugaz que entra entre 2 y 10 segundos, viene del “para ti” y decide rápido si se queda. Se retiene con hook inmediato, frases cortas y promesas rápidas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El riesgo es que se va si no entiende el live, no si no le gusta. Que es peor, porque se va sin haberte dado la oportunidad.`,
    fuente: `Slide 10 · Retención, espectadores y donadores · 4.3`,
  },
  {
    id: "retencion-4-4",
    embeddingText: `¿Qué hago con los que miran y no comentan? También preguntan: "nadie escribe"; "el chat está muerto"; "no me hablan"`,
    keywords: [`Qué hago con los que miran y no comentan`, `nadie escribe`, `el chat está muerto`, `no me hablan`],
    respuesta: `Es el silencioso, el 80%. No es desinteresado, es tímido o analítico. Se activa con preguntas fáciles y opciones simples.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Las tres frases exactas del material: “Si estás viendo en silencio, pon un emoji”, “Escribe sí, si te gusta la idea”, “Manito arriba si te identificas”. Ninguna le pide que escriba una frase; el costo de participar es casi cero y por eso funcionan. Además, el silencioso puede quedarse largo tiempo, o sea que es quien te sube el tiempo promedio de permanencia. El error es pedirle que cuente una historia.`,
    fuente: `Slide 11 · Retención, espectadores y donadores · 4.4`,
  },
  {
    id: "retencion-4-5",
    embeddingText: `¿Cómo cuido al que sí comenta?`,
    keywords: [`Cómo cuido al que sí comenta`],
    respuesta: `Es el participativo, tu 15%. Léelo en voz alta, agradécele y hazle preguntas. Si lo ignoras, se va.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Las frases: “Qué buen comentario”, “Gracias por participar”, “Cuéntame más”. La tercera es la más poderosa porque no cierra, abre: le da otro turno. El error típico es abandonar al que lleva una hora comentando en cuanto entra alguien que regala.`,
    fuente: `Slide 12 · Retención, espectadores y donadores · 4.5`,
  },
  {
    id: "retencion-4-6",
    embeddingText: `¿Qué hago con alguien que me cuestiona en el live?`,
    keywords: [`Qué hago con alguien que me cuestiona en el live`],
    respuesta: `Es el crítico, no el troll. Responde con calma, no lo enfrentes y úsalo a tu favor. Nunca discutir en vivo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Las frases: “Buena observación”, “Desde mi experiencia”, “Es válido pensar distinto”. Y el “úsalo a tu favor”: cuando alguien duda en el chat, hay otras veinte personas que dudaban lo mismo y no se atrevieron a escribirlo; si le respondes bien, le estás respondiendo a los veinte. El que discute en vivo se ve chiquito y le regala minutos de su live a alguien que no vino a apoyarlo.`,
    fuente: `Slide 13 · Retención, espectadores y donadores · 4.6`,
  },
  {
    id: "retencion-4-7",
    embeddingText: `¿Quién es “el que apoya”?`,
    keywords: [`Quién es “el que apoya”`],
    respuesta: `Tu 5%. Es fan, te conoce, te defiende y da likes y regalos. Se cuida reconociéndolo, dándole prioridad y mencionándolo.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Su valor es doble: sostiene el live e influye a otros. Cuando el que apoya comenta, los demás se sueltan; cuando regala, otros regalan. Las frases: “Gracias por estar siempre”, “Los que me apoyan saben”, “Esto es para mi gente fiel”. Es el candidato natural del club de fans. El error es darlo por sentado porque “ese siempre está” y no reconocerlo nunca en voz alta.`,
    fuente: `Slide 14 · Retención, espectadores y donadores · 4.7`,
  },
  {
    id: "retencion-4-9",
    embeddingText: `¿Cómo manejo a un troll? También preguntan: "me están insultando en el live"`,
    keywords: [`Cómo manejo a un troll`, `me están insultando en el live`],
    respuesta: `Ignorar, silenciar o bloquear, y continuar con el tema. Nunca darle protagonismo ni pelear.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El troll busca atención: toda su estrategia depende de que tú se la des. Lo que más se olvida es la tercera parte, continuar con el tema. Si bloqueas y después te quedas quince minutos hablando de lo que pasó, ya perdiste, le diste el live entero. Diferencia con el crítico: al crítico se le responde con calma; al troll no se le responde, punto.`,
    fuente: `Slide 16 · Retención, espectadores y donadores · 4.9`,
  },
  {
    id: "retencion-5-1",
    embeddingText: `¿Qué es un arquetipo de donador?`,
    keywords: [`Qué es un arquetipo de donador`],
    respuesta: `Un patrón de comportamiento repetido. Un donador no actúa al azar: dona según su motivación emocional, y el monto importa menos que la razón por la que dona.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La frase que ordena todo el bloque: el creador exitoso lee la intención, no el regalo. El porqué te dice qué hacer para que vuelva a pasar.`,
    fuente: `Slide 17 · Retención, espectadores y donadores · 5.1`,
  },
  {
    id: "retencion-5-2",
    embeddingText: `¿Cuáles son los arquetipos de donador?`,
    keywords: [`Cuáles son los arquetipos de donador`],
    respuesta: `Siete: el protector, el héroe, el competidor, el reconocido, el aprendiz, el estratégico y el dominante (tóxico).

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los primeros cinco son sanos, apoyan por razones distintas. El estratégico viene con riesgo. El dominante el material mismo lo marca como tóxico. El error es tratar a todos igual porque “todos están dando plata”.`,
    fuente: `Slide 18 · Retención, espectadores y donadores · 5.2`,
  },
  {
    id: "retencion-6-1",
    embeddingText: `¿Quién es el protector?`,
    keywords: [`Quién es el protector`],
    respuesta: `Dona para apoyar, se preocupa por el creador y aparece cuando el live baja. Lo motiva cuidar y sentirse necesario.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Se maneja con agradecimiento cálido, reconociendo sin dependencia y manteniendo autonomía. Frases: “Gracias por el apoyo, se aprecia mucho”, “Esto suma a mi crecimiento y a mi proceso”. Evita victimizarte y hacerlo sentir responsable. Frases como “si nadie apoya toca cerrar el live” suenan inocentes y son exactamente eso; cámbialas por “seguimos igual, con dos o con doscientos”.`,
    fuente: `Slide 19 · Retención, espectadores y donadores · 6.1`,
  },
  {
    id: "retencion-6-2",
    embeddingText: `¿Quién es el héroe y cómo le agradezco?`,
    keywords: [`Quién es el héroe y cómo le agradezco`],
    respuesta: `Dona fuerte en momentos críticos, busca impacto y cambia la energía del live. Lo motiva ser visto como el salvador y el reconocimiento público.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Diferencia con el protector: el protector aparece cuando bajas, calladito; el héroe aparece cuando hay algo en juego y quiere que se note. Frases correctas, cortas a propósito: “Gracias por el apoyo”, “Eso suma

muchísimo”. Evita “nos salvaste” y “sin ti no podríamos”, porque el día que no aparezca, tú misma dijiste que no puedes.`,
    fuente: `Slide 20 · Retención, espectadores y donadores · 6.2`,
  },
  {
    id: "retencion-6-3",
    embeddingText: `¿Quién es el competidor?`,
    keywords: [`Quién es el competidor`],
    respuesta: `Dona en retos o rankings, reacciona a otros donadores y le gusta ganar. Lo motiva el estatus y la comparación.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `No compite contigo, compite con los otros donadores de tu chat; tú eres la cancha. Se maneja con estructura: retos claros, rankings transparentes y límites de tiempo. Frases: “Top del live por ahora”, “Quedan tres minutos” — datos, no halagos. Evita peleas y favoritismo. Un reto sin reloj no le sirve, porque no puede saber si va ganando.`,
    fuente: `Slide 21 · Retención, espectadores y donadores · 6.3`,
  },
  {
    id: "retencion-6-4",
    embeddingText: `¿Quién es el reconocido?`,
    keywords: [`Quién es el reconocido`],
    respuesta: `Dona para ser mencionado, busca visibilidad y repite donaciones pequeñas. Lo motiva la atención y la presencia.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Lo valioso es que manda muchos regalos chiquitos toda la noche, y sumados suelen ser más que el del héroe. Se maneja con menciones breves, lectura del nombre y seguir con el contenido. Frases cortas a propósito: “Gracias por el apoyo”, “Se aprecia”. Evita darle demasiado tiempo e ignorar a otros: si te pasas la noche nombrándolo, tu live se vuelve una lista de agradecimientos y los otros ochenta se aburren.`,
    fuente: `Slide 22 · Retención, espectadores y donadores · 6.4`,
  },
  {
    id: "retencion-6-5",
    embeddingText: `¿Quién es el aprendiz?`,
    keywords: [`Quién es el aprendiz`],
    respuesta: `Dona por agradecimiento, valora el conocimiento y apoya después de recibir valor. Lo motiva la gratitud y el crecimiento personal.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es el único arquetipo donde tu trabajo no es manejar a la persona sino hacer bien tu contenido: si lo que dices sirve, aparece solo. Frases: “Me alegra que te sirva”, “Gracias por apoyar el contenido”. Por eso el creador que enseña algo, aunque sea chiquito, tiene una fuente de apoyo que el que solo entretiene no tiene.`,
    fuente: `Slide 23 · Retención, espectadores y donadores · 6.5`,
  },
  {
    id: "retencion-7-2",
    embeddingText: `Un donador grande me exige atención permanente, ¿qué hago?`,
    keywords: [`Un donador grande me exige atención permanente, ¿qué hago`],
    respuesta: `Es el dominante, el arquetipo tóxico. Respuestas neutrales, límites públicos y moderación si insiste. La frase exacta: “Respondo a todos por igual”.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Dona para controlar, exige atención y se molesta si no recibe prioridad. El riesgo es el más grave de todos: rompe la comunidad y espanta a otros donadores. Muchas veces se aguanta a un dominante porque da mucho, sin darse cuenta de que por él se fueron tres que daban poquito cada uno. El límite se pone donde todos lo vean, no por privado. Las tres frases son un guion completo: “Gracias por el apoyo”, “Seguimos con el tema”, “Respondo a todos por igual”. Se dice sin rabia, sin explicar, y se sigue.`,
    fuente: `Slide 25 · Retención, espectadores y donadores · 7.2`,
  },
  {
    id: "retencion-8-1",
    embeddingText: `Siento que le debo algo a quien me regala, ¿es normal? También preguntan: "¿tengo que darle más atención al que más da?"`,
    keywords: [`Siento que le debo algo a quien me regala, ¿es normal`, `tengo que darle más atención al que más da`],
    respuesta: `Le pasa a todo el mundo y es el error que rompe todo lo demás. Se llama sentirse en deuda.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La mentalidad correcta son tres líneas: el donador apoya voluntariamente (nadie lo obligó), el creador controla el espacio (tú, no el que más dio), y el respeto es mutuo (no de ti hacia él nada más). Desde la deuda no se ponen límites, y sin límites el dominante te arma el live a su gusto.`,
    fuente: `Slide 26 · Retención, espectadores y donadores · 8.1`,
  },
  {
    id: "retencion-8-2",
    embeddingText: `Si el monto no importa tanto, ¿entonces qué miro?`,
    keywords: [`Si el monto no importa tanto, ¿entonces qué miro`],
    respuesta: `La razón por la que donan. El creador exitoso lee la intención, no el regalo.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 17 · Retención, espectadores y donadores · 8.2`,
  },
  {
    id: "estrategias-1-1",
    embeddingText: `¿Qué porcentaje de la monetización son las batallas?`,
    keywords: [`Qué porcentaje de la monetización son las batallas`],
    respuesta: `Aproximadamente el 70% de la monetización de los creadores.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es el mismo 70% del módulo 2, dicho desde la monetización en vez de desde los ingresos. No es un dato nuevo, es el mismo confirmado. Si no haces batallas, estás jugando con el 30% del tablero.`,
    fuente: `Slide 3 · Estrategias de batalla y retos · 1.1`,
  },
  {
    id: "estrategias-1-3",
    embeddingText: `¿No debería esperar a tener más gente antes de batallar?`,
    keywords: [`No debería esperar a tener más gente antes de batallar`],
    respuesta: `Es al revés. La batalla es la forma de conseguir esa gente, porque te pone delante de la comunidad del otro creador.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material lo resume así: esperar a tener público para batallar es esperar a tener plata para trabajar.`,
    fuente: `Slide 3 · Estrategias de batalla y retos · 1.3`,
  },
  {
    id: "estrategias-1-4",
    embeddingText: `¿Para qué sirven las batallas, los retos y las dinámicas?`,
    keywords: [`Para qué sirven las batallas, los retos y las dinámicas`],
    respuesta: `Para aumentar la visibilidad, fortalecer la comunidad y generar mayor participación de la audiencia. En ese orden.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Visibilidad primero (que te vea gente nueva), comunidad después (que esa gente se quede) y participación (lo que hace que se quede la próxima). Es exactamente el ciclo del algoritmo del módulo 4: la batalla es la manera más rápida de meterle combustible a ese ciclo.`,
    fuente: `Slide 2 · Estrategias de batalla y retos · 1.4`,
  },
  {
    id: "estrategias-2-1",
    embeddingText: `¿Qué formatos de batalla existen?`,
    keywords: [`Qué formatos de batalla existen`],
    respuesta: `Tres: uno contra uno, dos contra dos, y todos contra todos.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los tres generan entretenimiento y ambiente de show. Los beneficios: relacionarte con otros creadores, aumentar la visibilidad entre comunidades, y ampliar las oportunidades de monetización.`,
    fuente: `Slide 4 · Estrategias de batalla y retos · 2.1`,
  },
  {
    id: "estrategias-2-2",
    embeddingText: `¿Qué formato me conviene si estoy empezando?`,
    keywords: [`Qué formato me conviene si estoy empezando`],
    respuesta: `El uno contra uno, porque es donde más se te ve: tienes media pantalla para ti.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El todos contra todos trae gente de más comunidades a la vez, pero te da mucha menos cámara. El error es meterse a un todos contra todos siendo nuevo y salir sin que nadie te haya visto.`,
    fuente: `Slide 4 · Estrategias de batalla y retos · 2.2`,
  },
  {
    id: "estrategias-2-3",
    embeddingText: `¿A quién debo escoger como contrincante?`,
    keywords: [`A quién debo escoger como contrincante`],
    respuesta: `A alguien equilibrado, que haga el enfrentamiento atractivo para ambas audiencias.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `No busques al más grande para que te vean, porque te barre y tu gente se desanima. Y no busques al más chiquito para ganar fácil, porque no te trae a nadie.`,
    fuente: `Slide 7 · Estrategias de batalla y retos · 2.3`,
  },
  {
    id: "estrategias-3-2",
    embeddingText: `¿Qué hago con el cuerpo durante la batalla?`,
    keywords: [`Qué hago con el cuerpo durante la batalla`],
    respuesta: `Tres recursos: agradecimientos constantes, movimientos de manos para guiar la batalla, y motivación a los puntos o taps de forma positiva.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La expresión corporal transmite emociones y energía sin necesidad de palabras, que importa porque en una batalla muchas veces ni te oyen bien. Los gestos hacen el contenido más dinámico, mantienen la atención y fortalecen la conexión. Ojo con “positiva”: animar no es gritar. El error es quedarse quieto de la cintura para arriba y confiar solo en la voz.`,
    fuente: `Slide 6 · Estrategias de batalla y retos · 3.2`,
  },
  {
    id: "estrategias-3-3",
    embeddingText: `Me da miedo perder delante de mi comunidad También preguntan: "¿quedo mal si pierdo?"`,
    keywords: [`Me da miedo perder delante de mi comunidad`, `quedo mal si pierdo`],
    respuesta: `En TikTok, perder también es parte de ganar. Lo que sí daña es perder con mala cara.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Cuando pierdes bien, con actitud y cumpliendo tu reto, tu comunidad se une más porque te vio jugar. Perder con mala cara cae además en dos malas prácticas de la lista: tomarlo todo personal y quejarse constantemente. No es perder, es cómo pierdes.`,
    fuente: `Slide 7 · Estrategias de batalla y retos · 3.3`,
  },
  {
    id: "estrategias-4-1",
    embeddingText: `¿Cuáles son las malas prácticas en batallas?`,
    keywords: [`Cuáles son las malas prácticas en batallas`],
    respuesta: `Diez. Visuales: estar acostado, quedarte callado o sin reacción, imagen estática, y pantalla sola. De actitud: rogar por regalos, ignorar al chat, tomarlo todo personal, fingir energía o exagerar, no cumplir los retos, y quejarse constantemente.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material dice que bajan la calidad de tu live, afectan la experiencia del público y hacen que tu audiencia pierda interés.`,
    fuente: `Slide 5 · Estrategias de batalla y retos · 4.1`,
  },
  {
    id: "estrategias-4-2",
    embeddingText: `¿Cuál es la peor mala práctica?`,
    keywords: [`Cuál es la peor mala práctica`],
    respuesta: `No cumplir los retos. Te quema la reputación con el otro creador y con las dos comunidades.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Un reto que pusiste y no hiciste te cuesta más que la batalla que perdiste. Si lo pusiste, lo haces.`,
    fuente: `Slides 5 y 8 · Estrategias de batalla y retos · 4.2`,
  },
  {
    id: "estrategias-4-3",
    embeddingText: `No tengo energía hoy, ¿mejor no hago batalla?`,
    keywords: [`No tengo energía hoy, ¿mejor no hago batalla`],
    respuesta: `Cuidado con las dos caras: quedarte callado o sin reacción es mala práctica, pero fingir energía o exagerar también.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Subir el volumen de la voz no arregla la falta de energía real: se nota y cansa. Si de verdad no puedes, es mejor un live tranquilo sin batalla que una batalla actuada.`,
    fuente: `Slide 5 · Estrategias de batalla y retos · 4.3`,
  },
  {
    id: "estrategias-5-1",
    embeddingText: `¿Qué retos puedo poner en una batalla?`,
    keywords: [`Qué retos puedo poner en una batalla`],
    respuesta: `Retos simples y positivos. Los ejemplos del material: levantar las manos, permanecer en silencio cuando se va perdiendo, arrodillarse por unos segundos, o bailar.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Ese es el molde: ninguno cuesta plata, ninguno duele, ninguno da vergüenza de verdad, y los cuatro se ven en cámara en un segundo. Convierten la competencia en un espectáculo más dinámico y divertido.`,
    fuente: `Slide 8 · Estrategias de batalla y retos · 5.1`,
  },
  {
    id: "estrategias-5-3",
    embeddingText: `¿Cuál es el reto más seguro para empezar?`,
    keywords: [`Cuál es el reto más seguro para empezar`],
    respuesta: `El reto gracioso. Nunca se te va de las manos: no hay nada humillante, peligroso ni que dé pena contar después.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El ejemplo del material es el baile del pollo. Pero que sea corto: un reto gracioso de tres minutos detiene la batalla mientras el marcador sigue corriendo.`,
    fuente: `Slide 10 · Estrategias de batalla y retos · 5.3`,
  },
  {
    id: "estrategias-5-5",
    embeddingText: `¿Puedo hacer retos de comer?`,
    keywords: [`Puedo hacer retos de comer`],
    respuesta: `Sí, están entre los tipos reconocidos, pero se preparan antes con lo que ya tienes en tu cocina y ya sabes que aguantas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Lo bueno es que la reacción de la cara es oro puro. Lo delicado es que hay comida de por medio: alergias, gastritis o intolerancia al picante no se negocian en vivo. El error es aceptar un reto de comer sin saber qué hay en la cocina.`,
    fuente: `Slide 12 · Estrategias de batalla y retos · 5.5`,
  },
  {
    id: "estrategias-5-6",
    embeddingText: `¿Cómo decido qué retos hago y cuáles no?`,
    keywords: [`Cómo decido qué retos hago y cuáles no`],
    respuesta: `Escribiendo tu lista antes del live. No tienes que hacer los seis tipos y nadie te puede obligar.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El filtro práctico que propone el material: ¿lo cumplirías delante de tu mamá? Si la respuesta es sí, sirve. La lista es tu defensa, porque en plena batalla, con el marcador en contra y la otra comunidad gritando, no se decide bien.`,
    fuente: `Slides 8, 9 y 13 · Estrategias de batalla y retos · 5.6`,
  },
  {
    id: "estrategias-6-1",
    embeddingText: `¿Qué retos me pueden bloquear la cuenta?`,
    keywords: [`Qué retos me pueden bloquear la cuenta`],
    respuesta: `Seis: retos de baile explícito, de nalgadas, de humillación, de actividades peligrosas, ofensivos, y de poca ropa.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `No son “mejor evítalos”: estos seis bloquean la cuenta, y conectan con los motivos de bloqueo del módulo 1.`,
    fuente: `Slide 13 · Estrategias de batalla y retos · 6.1`,
  },
  {
    id: "estrategias-6-2",
    embeddingText: `¿Qué hago si me piden un reto que no quiero hacer? También preguntan: "me están pidiendo algo que no quiero hacer"; "me presionan en la batalla"`,
    keywords: [`Qué hago si me piden un reto que no quiero hacer`, `me están pidiendo algo que no quiero hacer`, `me presionan en la batalla`],
    respuesta: `No lo haces. La respuesta es la del módulo 4: “gracias por el apoyo, seguimos con el tema”.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Si el reto está entre los seis del slide 13, ni siquiera es opcional. Y por eso la lista se escribe antes: cuando alguien pide algo que no está en tu lista, ya tienes la respuesta.`,
    fuente: `Slide 13 · Estrategias de batalla y retos · 6.2`,
  },
  {
    id: "estrategias-6-3",
    embeddingText: `¿Puedo prometer “hago lo que ustedes quieran” si llegamos a la meta?`,
    keywords: [`Puedo prometer “hago lo que ustedes quieran” si llegamos a la meta`],
    respuesta: `Nunca. Es una trampa que tú mismo pones: ya dijiste que sí a algo que todavía no sabes qué es.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Así es como llegan los retos prohibidos. Nadie despierta pensando en hacer uno: vas perdiendo, la otra comunidad está eufórica, alguien manda un regalo grande y pide algo, y en caliente dices que bueno. Nunca prometas un reto en blanco.`,
    fuente: `Slide 13 · Estrategias de batalla y retos · 6.3`,
  },
  {
    id: "liveroom-1-1",
    embeddingText: `¿Qué es la optimización de contenido en vivo?`,
    keywords: [`Qué es la optimización de contenido en vivo`],
    respuesta: `El desarrollo estratégico de los creadores que atraen a su audiencia por su presencia física, su estética visual y su carisma personal durante sus transmisiones.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Dos de las tres son cosas que se ven, no que se dicen. Y la palabra que manda es “estratégico”: no es “arréglate bonito”, es decidir a propósito cómo te ves, igual que decides a qué hora transmites. Es la primera información que recibe alguien de ti, antes de que abras la boca.`,
    fuente: `Slide 2 · LIVE room, videos y CapCut · 1.1`,
  },
  {
    id: "liveroom-1-2",
    embeddingText: `¿Cuáles son los componentes de la optimización?`,
    keywords: [`Cuáles son los componentes de la optimización`],
    respuesta: `Cuatro: la estética del LIVE room, la persona (identidad clara y coherente), los cuatro elementos del arranque, y el video corto.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La frase que los encabeza: esto no se trata solo de verse bien, es una experiencia completa e intencional. Para un creador visual, el espacio de transmisión es parte de su marca, y un entorno bien diseñado crea un ambiente premium y memorable.`,
    fuente: `Slide 3 · LIVE room, videos y CapCut · 1.2`,
  },
  {
    id: "liveroom-1-3",
    embeddingText: `¿Mis videos tienen que parecerse a mi live?`,
    keywords: [`Mis videos tienen que parecerse a mi live`],
    respuesta: `Sí. El video corto debe mantener el mismo tono visual y emocional del LIVE.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El error más común: videos con música de moda y cortes rápidos, y un live tranquilo de conversación. La gente llega por el video, entra al live y no reconoce nada, y se va. El video corto es la puerta, tiene que parecerse a la casa.`,
    fuente: `Slide 3 · LIVE room, videos y CapCut · 1.3`,
  },
  {
    id: "liveroom-1-4",
    embeddingText: `¿Optimizar significa volverme otra persona?`,
    keywords: [`Optimizar significa volverme otra persona`],
    respuesta: `No. La optimización debe enfocarse en profesionalizar tu presencia sin perder la naturalidad.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `En LATAM los creadores destacan por transmitir cercanía, autenticidad y carisma cultural, no solo por apariencia. Puedes mejorar tu luz, tu fondo y tu ropa sin volverte otra persona; si te ves impecable pero hablas distinto de como hablas, se siente raro y la gente de esta región lo detecta rapidísimo. El material lo dice directo: no se trata de ser alguien diferente, sino de resaltar lo mejor de ti. Profesionalizar es el cuarto, no el acento.`,
    fuente: `Slides 4 y 9 · LIVE room, videos y CapCut · 1.4`,
  },
  {
    id: "liveroom-2-1",
    embeddingText: `¿Qué necesita un LIVE room de alta calidad?`,
    keywords: [`Qué necesita un LIVE room de alta calidad`],
    respuesta: `Tres piezas, y ninguna es la cámara: iluminación, fondo y vestuario.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 5 · LIVE room, videos y CapCut · 2.1`,
  },
  {
    id: "liveroom-2-2",
    embeddingText: `¿Qué requisitos debe cumplir mi fondo?`,
    keywords: [`Qué requisitos debe cumplir mi fondo`],
    respuesta: `Cuatro: fijo, limpio, bien iluminado y acorde a tu estilo personal.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `“Fijo” es el que nadie cumple: quiere decir que mañana está igual, no que se mueve la cámara cada día. Ninguno de los cuatro cuesta plata. El error es cambiar de rincón de la casa cada transmisión y no tener nunca un fondo reconocible.`,
    fuente: `Slide 5 · LIVE room, videos y CapCut · 2.2`,
  },
  {
    id: "liveroom-2-4",
    embeddingText: `¿Qué errores de iluminación son los más comunes?`,
    keywords: [`Qué errores de iluminación son los más comunes`],
    respuesta: `Tres: que la luz principal no sea clara, no tener un aro de luz adecuado, y tener contraluz, que opaca la cara.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El contraluz es el más común: es cuando la luz está detrás de ti (una ventana, una lámpara) y te vuelves una silueta oscura. Se arregla girando. Cero pesos.`,
    fuente: `Slide 6 · LIVE room, videos y CapCut · 2.4`,
  },
  {
    id: "liveroom-2-5",
    embeddingText: `¿Necesito comprar luces? También preguntan: "necesito comprar luces"; "qué equipo compro"; "no tengo plata para equipo"`,
    keywords: [`Necesito comprar luces`, `qué equipo compro`, `no tengo plata para equipo`],
    respuesta: `No para empezar. Primero resuelve de dónde viene la luz que ya tienes.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Las buenas prácticas son luz principal clara, aro de luz adecuado que haga el rostro claramente visible, e iluminación ambiental personalizada (las luces de colores del fondo). Pero el orden importa: primero la cara, después el ambiente. Las luces de colores sin luz en la cara no sirven de nada, y el error es comprarlas antes de resolver la luz del rostro.`,
    fuente: `Slide 6 · LIVE room, videos y CapCut · 2.5`,
  },
  {
    id: "liveroom-2-7",
    embeddingText: `¿Tengo que maquillarme para transmitir?`,
    keywords: [`Tengo que maquillarme para transmitir`],
    respuesta: `No. Los seis estilos del material son referencias, no obligación.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los seis: romántica (suave, rubor rosado, iluminador glowy), elegante (definido, eyeliner fino, labios rojos), rebelde (bold, smokey eyes, labios oscuros), casual (natural, no makeup look, tonos nude), fashionista (glam, sombras metálicas, contour marcado) y artística (creativo, delineado colorido, sombras cálidas). Coinciden con las cinco vibras del vestuario: si tu vibra es relajada, el casual es el tuyo. Si no usas maquillaje, la traducción es la misma: escoge un estilo y sé constante con él.`,
    fuente: `Slide 10 · LIVE room, videos y CapCut · 2.7`,
  },
  {
    id: "liveroom-2-8",
    embeddingText: `Transmito en pijama porque “así soy yo”, ¿está mal?`,
    keywords: [`Transmito en pijama porque “así soy yo”, ¿está mal`],
    respuesta: `Eso no es autenticidad, es comodidad. Y “estar acostado” es una de las diez malas prácticas del módulo 5.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material lo plantea así: usa el vestuario y el maquillaje como herramientas para contar una historia visual. Herramientas, no disfraz. Ser auténtico no es dejar de arreglarse, es arreglarte para parecerte más a ti, no menos.`,
    fuente: `Slide 9 · LIVE room, videos y CapCut · 2.8`,
  },
  {
    id: "liveroom-3-1",
    embeddingText: `¿Cuáles son los cuatro elementos?`,
    keywords: [`Cuáles son los cuatro elementos`],
    respuesta: `Música de fondo, introducción personal, bienvenida y agradecimiento.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El material los define como prácticas sencillas pero poderosas que elevan la calidad del LIVE y ayudan a construir una comunidad sólida. La música crea ambiente y engancha desde el inicio. La introducción personal permite mostrar tu esencia, generando identidad y recordación. La bienvenida refuerza la interacción y hace sentir a la audiencia parte del LIVE. El agradecimiento fortalece el vínculo y motiva a los donadores a seguir apoyando.`,
    fuente: `Slide 11 · LIVE room, videos y CapCut · 3.1`,
  },
  {
    id: "liveroom-3-2",
    embeddingText: `¿Cuál de los cuatro elementos se olvida más?`,
    keywords: [`Cuál de los cuatro elementos se olvida más`],
    respuesta: `La introducción personal, porque uno cree que ya todos saben quién es. Y el que acaba de entrar, no.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 11 · LIVE room, videos y CapCut · 3.2`,
  },
  {
    id: "liveroom-4-1",
    embeddingText: `¿Qué es la creación de contenido?`,
    keywords: [`Qué es la creación de contenido`],
    respuesta: `El proceso de planear, producir y compartir contenido audiovisual o visual, con el objetivo de informar, educar o entretener.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los tres verbos van en ese orden y el primero es planear. Casi todo el mundo empieza por producir: graba algo y después ve qué hace con eso, y por eso se estanca. Y los tres objetivos también importan: si tu video no informa, educa ni entretiene, no es contenido, es un archivo de video.`,
    fuente: `Slide 12 · LIVE room, videos y CapCut · 4.1`,
  },
  {
    id: "liveroom-4-2",
    embeddingText: `¿Por qué tengo que hacer videos si ya transmito todos los días?`,
    keywords: [`Por qué tengo que hacer videos si ya transmito todos los días`],
    respuesta: `Porque el video corto es el anzuelo y el live es donde pasa la cosa. Sin videos, dependes de que TikTok te descubra justo en el momento en que estás transmitiendo.

¿Tienes alguna otra duda? 😊`,
    fuente: `Slide 12 · LIVE room, videos y CapCut · 4.2`,
  },
  {
    id: "liveroom-5-1",
    embeddingText: `¿Cuál es la estructura de un video?`,
    keywords: [`Cuál es la estructura de un video`],
    respuesta: `Cuatro pasos: planeación y guionización, gancho inicial o hook, desarrollo de la idea, y llamado a la acción.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Planeación es organizar lo que vas a decir: definir el tema, ordenar las ideas y escribir o pensar qué va primero, qué después y cómo termina. Desarrollo es ampliar y explicar la idea para que tenga sentido y valor.`,
    fuente: `Slides 13 y 14 · LIVE room, videos y CapCut · 5.1`,
  },
  {
    id: "liveroom-5-2",
    embeddingText: `¿Cuánto dura el hook de un video?`,
    keywords: [`Cuánto dura el hook de un video`],
    respuesta: `De 0 a 3 segundos. Algo interesante que enganche de inmediato.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Ojo con no confundirlo: en el LIVE tienes 10 segundos (módulo 4), en el video corto tienes 3.`,
    fuente: `Slide 14 · LIVE room, videos y CapCut · 5.2`,
  },
  {
    id: "liveroom-5-3",
    embeddingText: `¿Cuánto debe durar un video corto?`,
    keywords: [`Cuánto debe durar un video corto`],
    respuesta: `De 15 a 30 segundos, y los primeros 3 son el hook.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `O sea que el gancho es más o menos la décima parte del video. El error es hacer videos largos con introducción del tipo “bueno, hola, les quería contar”: lo abandonan en el segundo seis y eso lo mide TikTok.`,
    fuente: `Slide 15 · LIVE room, videos y CapCut · 5.3`,
  },
  {
    id: "liveroom-5-5",
    embeddingText: `¿Qué pido al final del video?`,
    keywords: [`Qué pido al final del video`],
    respuesta: `Sígueme, comenta, guarda este video, o comparte. Sirve para generar interacción y participación.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es lo que casi nadie hace: grabamos, publicamos y no pedimos nada. Si no pides, no pasa.`,
    fuente: `Slide 14 · LIVE room, videos y CapCut · 5.5`,
  },
  {
    id: "liveroom-5-6",
    embeddingText: `¿Cómo hago la portada del video?`,
    keywords: [`Cómo hago la portada del video`],
    respuesta: `Selecciona el momento más impactante del video o usa una imagen llamativa, y añade un texto corto que explique el tema y motive a hacer clic.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El momento más impactante no es el primer frame que salga: son cosas distintas y por eso existe la opción de escoger. El error es dejar la portada por defecto, que suele ser el primer frame y suele ser el peor.`,
    fuente: `Slide 16 · LIVE room, videos y CapCut · 5.6`,
  },
  {
    id: "liveroom-6-1",
    embeddingText: `¿A qué hora publico mis videos?`,
    keywords: [`A qué hora publico mis videos`],
    respuesta: `Tres franjas: de 5:00 a 10:00, de 12:00 a 14:00 y de 17:00 a 19:00.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El propio slide advierte que tu horario y tu algoritmo dependen de tu contenido y del público que quieres alcanzar: son un punto de partida, no una ley. El tip es analizar tus estadísticas para ver cuándo tu audiencia está más activa. Y la forma de probar un horario es escoger una franja y sostenerla dos semanas, no cambiarla cada día.`,
    fuente: `Slide 16 · LIVE room, videos y CapCut · 6.1`,
  },
  {
    id: "liveroom-6-2",
    embeddingText: `¿Dónde veo cuándo está conectada mi audiencia?`,
    keywords: [`Dónde veo cuándo está conectada mi audiencia`],
    respuesta: `En TikTok Studio, que trae las métricas de cada video, de cada live y de tus espectadores.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Si entras sin saber qué buscas te ahogas en gráficas. El orden sugerido: primero la hora en que tu gente está conectada, segundo el tiempo promedio de visualización (la métrica del módulo 4), y tercero cuáles de tus videos trajeron gente al live. El error es escoger el horario de transmisión por comodidad propia sin haber mirado nunca cuándo está conectada la audiencia.`,
    fuente: `Slide 17 · LIVE room, videos y CapCut · 6.2`,
  },
  {
    id: "liveroom-7-1",
    embeddingText: `¿Qué es CapCut y hace falta pagarlo?`,
    keywords: [`Qué es CapCut y hace falta pagarlo`],
    respuesta: `Un editor de video gratuito creado por ByteDance, los mismos de TikTok. No requiere conocimientos avanzados de edición y todo lo del módulo está en la parte gratuita.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Al ser de los mismos de TikTok está pensado para formato vertical y para exportar directo, así que no hay que pelear con tamaños ni calidades. Si algo te pide pagar, no lo necesitas para esto.`,
    fuente: `Slide 20 · LIVE room, videos y CapCut · 7.1`,
  },
  {
    id: "liveroom-7-2",
    embeddingText: `¿Dónde descargo CapCut y cómo empiezo?`,
    keywords: [`Dónde descargo CapCut y cómo empiezo`],
    respuesta: `App Store, Play Store, versión web o versión de escritorio. Luego “nuevo proyecto” e importas fotos, videos o plantillas.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Se recomienda el celular, porque ahí están los videos. Y las plantillas son el atajo que nadie usa: un video ya editado donde solo cambias los clips por los tuyos. Si estás arrancando, es la forma más rápida de sacar algo decente hoy mismo.`,
    fuente: `Slide 21 · LIVE room, videos y CapCut · 7.2`,
  },
  {
    id: "liveroom-7-3",
    embeddingText: `¿Cómo está organizada la pantalla de CapCut?`,
    keywords: [`Cómo está organizada la pantalla de CapCut`],
    respuesta: `Tres zonas: la línea de tiempo (abajo, donde editas los clips), la vista previa (arriba, ves los cambios en tiempo real) y el menú de herramientas (recorte, efectos, textos, audio).

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La lógica es siempre la misma: primero seleccionas en la línea de tiempo, después escoges la herramienta. Si una herramienta aparece apagada, casi siempre es porque no seleccionaste el clip primero. Es el 90% de los enredos.`,
    fuente: `Slide 22 · LIVE room, videos y CapCut · 7.3`,
  },
  {
    id: "liveroom-7-4",
    embeddingText: `¿Cuáles son las funciones básicas de edición?`,
    keywords: [`Cuáles son las funciones básicas de edición`],
    respuesta: `Seis: recortar, dividir, cambiar velocidad, revertir, congelar y zoom dinámico.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Recortar es quitarle lo que sobra al principio y al final, y es la que salva el hook. Dividir parte un clip en dos para sacar un pedazo del medio. Velocidad acelera o pone en cámara lenta (útil: si el video quedó en 40 segundos y necesitas 30, acelerarlo un poco lo arregla sin cortar contenido). Revertir reproduce al revés. Congelar deja un frame fijo, útil para meter texto encima. Zoom dinámico es un acercamiento suave automático.`,
    fuente: `Slides 23 y 24 · LIVE room, videos y CapCut · 7.4`,
  },
  {
    id: "liveroom-7-5",
    embeddingText: `¿Cuántos efectos le pongo a un video?`,
    keywords: [`Cuántos efectos le pongo a un video`],
    respuesta: `Pocos. Un zoom dinámico por video, en el hook, y ya.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El zoom en el hook funciona porque el movimiento retiene, pero en todo el video marea. Un video con zoom en cada clip, revertido dos veces y tres congelados se ve hecho por alguien que acaba de descubrir la app. El sobrio se ve profesional y tiene menos trabajo.`,
    fuente: `Slide 24 · LIVE room, videos y CapCut · 7.5`,
  },
  {
    id: "liveroom-7-6",
    embeddingText: `¿Qué música puedo usar?`,
    keywords: [`Qué música puedo usar`],
    respuesta: `Música libre de derechos, y CapCut tiene una biblioteca donde eso ya está resuelto.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Si usas una canción que no puedes usar, el video se puede silenciar o limitar, y eso conecta con las normas de contenido no original del módulo 1. Un efecto de sonido corto justo en el segundo uno hace que el que está haciendo scroll levante la cabeza.`,
    fuente: `Slide 25 · LIVE room, videos y CapCut · 7.6`,
  },
  {
    id: "liveroom-7-7",
    embeddingText: `¿Cómo pongo la música sin que tape mi voz?`,
    keywords: [`Cómo pongo la música sin que tape mi voz`],
    respuesta: `Bajándole el volumen a la pista hasta que quede debajo de tu voz. La música acompaña, no compite.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es el error más común de todos: música tan alta que no se oye al creador.`,
    fuente: `Slide 25 · LIVE room, videos y CapCut · 7.7`,
  },
  {
    id: "liveroom-7-8",
    embeddingText: `Me da pena hablar en cámara, ¿puedo hacer videos igual?`,
    keywords: [`Me da pena hablar en cámara, ¿puedo hacer videos igual`],
    respuesta: `Sí. Con “grabar voz” montas las imágenes primero y le pones la voz después, las veces que necesites.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Resuelve el problema número uno de quien tiene pena: no tienes que decirlo bien mientras te grabas. Grabas las imágenes, te calmas, y después le pones la voz hasta que quede. Las cinco funciones de audio son música libre de derechos, efectos de sonido, efectos de audio, velocidad de audio y grabar voz. Ojo con la velocidad: si aceleras el video, el audio se va con él y las voces se vuelven de ardilla.`,
    fuente: `Slide 26 · LIVE room, videos y CapCut · 7.8`,
  },
  {
    id: "liveroom-7-9",
    embeddingText: `¿Cómo hago que mis videos se vean como una serie?`,
    keywords: [`Cómo hago que mis videos se vean como una serie`],
    respuesta: `Escogiendo un filtro de color y usando siempre el mismo. Eso es identidad visual.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los efectos de video se parten en filtros de color (cambian la atmósfera) y efectos visuales tipo glitch, destellos y distorsiones. El que de verdad sirve es el filtro de color, porque el video corto debe mantener el tono visual del LIVE: si tu live tiene luces moradas, un filtro cálido rompe eso. El error es escoger un filtro distinto en cada video según lo que se vea bonito ese día, y terminar con un perfil que parece de cinco personas distintas. Los efectos corporales, con medida: el filtro de color se queda, el efecto de moda se ve viejo en dos meses.`,
    fuente: `Slide 27 · LIVE room, videos y CapCut · 7.9`,
  },
  {
    id: "liveroom-7-10",
    embeddingText: `¿Tengo que ponerle subtítulos a mis videos?`,
    keywords: [`Tengo que ponerle subtítulos a mis videos`],
    respuesta: `Sí, siempre. CapCut tiene “subtítulos automáticos”: le das una vez y la app escribe sola todo lo que dijiste.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Muchísima gente ve TikTok sin sonido: en el bus, en el trabajo, al lado de alguien durmiendo. Si tu video no tiene subtítulos, para esa gente tu video no dice nada. Revisa siempre lo que escribió, porque con los nombres propios se equivoca. En “Texto” están además fuentes, estilos, colores, tamaño, efectos, stickers y plantillas, para el título, el hook escrito y el llamado a la acción.`,
    fuente: `Slide 28 · LIVE room, videos y CapCut · 7.10`,
  },
  {
    id: "politicas-1-1",
    embeddingText: `¿Qué tipos de violación existen?`,
    keywords: [`Qué tipos de violación existen`],
    respuesta: `Se agrupan en tres familias: violaciones de contenido, violaciones financieras y violaciones de entrada (ingreso a la agencia).

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Las de contenido incluyen Content Safety, Begging (pedir regalos), Group LIVE Content y Static Imagery con baja calidad visual. Las financieras y las de entrada (multicuenta, región no soportada) son sobre todo responsabilidad de la agencia, pero varias terminan afectando directamente al creador.`,
    fuente: `Health Score Policy · Políticas de TikTok y sanciones · 1.1`,
  },
  {
    id: "politicas-1-2",
    embeddingText: `¿Qué me puede pasar a mí si cometo una violación?`,
    keywords: [`Qué me puede pasar a mí si cometo una violación`],
    respuesta: `Según la violación: que se te descuente el bono asociado, que te saquen de la agencia, o en el caso más grave, que quedes inhabilitado para entrar a cualquier agencia en el futuro.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Las consecuencias van dirigidas formalmente a la agencia (deducción de bonos, pérdida de health score, terminación del contrato), pero la primera medida en casi todas es remover al creador infractor de la agencia.`,
    fuente: `Varias políticas · Políticas de TikTok y sanciones · 1.2`,
  },
  {
    id: "politicas-1-3",
    embeddingText: `¿Dónde se ven las violaciones y cómo se apela?`,
    keywords: [`Dónde se ven las violaciones y cómo se apela`],
    respuesta: `Las violaciones llegan por notificación in-app y se consultan en LIVE Backstage, en Violación → Centro de Violaciones → Detalles. La apelación la presenta la agencia, no el creador.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los plazos son cortos y varían por política: la agencia tiene 7 días desde la notificación en el caso de Static Imagery, y en región no soportada la prueba debe grabarse dentro de las 72 horas siguientes al aviso. Por eso avisar el mismo día no es formalidad.`,
    fuente: `Varias políticas · Políticas de TikTok y sanciones · 1.3`,
  },
  {
    id: "politicas-2-1",
    embeddingText: `¿Qué es una violación de Content Safety?`,
    keywords: [`Qué es una violación de Content Safety`],
    respuesta: `Contenido en LIVE que viola gravemente las Normas de la Comunidad y representa un riesgo de seguridad extremadamente alto.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Cubre cuatro áreas: seguridad de menores, desnudez y actividad sexual de adultos, actividades ilegales y bienes regulados, y extremismo violento. Es la categoría más grave del sistema.`,
    fuente: `Content Safety Violation Policy · Políticas de TikTok y sanciones · 2.1`,
  },
  {
    id: "politicas-2-2",
    embeddingText: `¿Qué entra en “seguridad de menores”?`,
    keywords: [`Qué entra en “seguridad de menores”`],
    respuesta: `Explotación sexual de menores (CSAM), conductas de grooming, desnudez o actividad sexual con menores, y daño físico o psicológico a menores.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `El grooming se define como un adulto que construye una relación emocional con un menor para ganarse su confianza con fines de contacto sexual, abuso, trata u otra explotación. Incluye halagos, pedidos de contacto dentro o fuera de la plataforma, pedidos de información personal y comentarios sexuales. Daño a menores incluye abuso físico, negligencia, puesta en peligro y menosprecio psicológico.`,
    fuente: `Content Safety Violation Policy · Políticas de TikTok y sanciones · 2.2`,
  },
  {
    id: "politicas-2-3",
    embeddingText: `¿Qué entra en desnudez y actividad sexual de adultos?`,
    keywords: [`Qué entra en desnudez y actividad sexual de adultos`],
    respuesta: `Contenido sexual sin consentimiento de todos los involucrados, solicitación sexual (ofrecer o pedir parejas sexuales, chats o imágenes sexuales, servicios sexuales, contenido sexual premium), y exhibición de pechos, genitales, ano o glúteos, o actos sexuales.

¿Tienes alguna otra duda? 😊`,
    fuente: `Content Safety Violation Policy · Políticas de TikTok y sanciones · 2.3`,
  },
  {
    id: "politicas-2-4",
    embeddingText: `¿Qué entra en actividades ilegales y bienes regulados?`,
    keywords: [`Qué entra en actividades ilegales y bienes regulados`],
    respuesta: `Actividades criminales, incluida la explotación humana (trata, servidumbre doméstica). Y bienes regulados: promoción o comercio de armas de fuego, accesorios, munición, explosivos, drogas y otras sustancias controladas.

¿Tienes alguna otra duda? 😊`,
    fuente: `Content Safety Violation Policy · Políticas de TikTok y sanciones · 2.4`,
  },
  {
    id: "politicas-2-5",
    embeddingText: `¿Qué entra en extremismo violento?`,
    keywords: [`Qué entra en extremismo violento`],
    respuesta: `Declaraciones de intención de infligir daño físico o violencia a personas o grupos, y promover o participar en violencia relacionada con organizaciones terroristas, grupos de odio, organizaciones criminales u otros grupos armados que atacan a civiles.

¿Tienes alguna otra duda? 😊`,
    fuente: `Content Safety Violation Policy · Políticas de TikTok y sanciones · 2.5`,
  },
  {
    id: "politicas-3-1",
    embeddingText: `¿Qué es una violación de Begging? También preguntan: "¿puedo contar que estoy pasando por algo difícil?"`,
    keywords: [`Qué es una violación de Begging`, `puedo contar que estoy pasando por algo difícil`],
    respuesta: `Pedir regalos virtuales o apoyo monetario de formas inapropiadas o no conformes con las políticas de TikTok.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Incluye principalmente dos cosas: contenido que muestra a personas con enfermedades o discapacidades transmitiendo a cambio de likes, comentarios, compartidos o regalos; y contenido o conductas donde el creador aprovecha necesidades financieras personales o causas para conseguir regalos.`,
    fuente: `Begging Content Violation Policy · Políticas de TikTok y sanciones · 3.1`,
  },
  {
    id: "politicas-3-2",
    embeddingText: `¿Qué me pasa si cometo una violación de Begging?`,
    keywords: [`Qué me pasa si cometo una violación de Begging`],
    respuesta: `El creador infractor es removido de la agencia, y TikTok puede descontar cualquier bono de tarea asociado a ese creador.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es una consecuencia directa e inmediata, no una advertencia. Conecta con lo que ya viste en el módulo 1: pedir regalos por necesidad está en el top de motivos de bloqueo.`,
    fuente: `Begging Content Violation Policy · Políticas de TikTok y sanciones · 3.2`,
  },
  {
    id: "politicas-3-3",
    embeddingText: `¿Entonces cómo hago si quiero recaudar para una causa?`,
    keywords: [`Entonces cómo hago si quiero recaudar para una causa`],
    respuesta: `TikTok tiene herramientas oficiales de donación para recaudar fondos hacia organizaciones sin ánimo de lucro. Ese es el canal correcto, no el pedido de regalos en el live.

¿Tienes alguna otra duda? 😊`,
    fuente: `Begging Content Violation Policy · Políticas de TikTok y sanciones · 3.3`,
  },
  {
    id: "politicas-4-1",
    embeddingText: `¿Qué cuenta como LIVE de baja calidad? También preguntan: "¿puedo dejar el live puesto sin estar?"`,
    keywords: [`Qué cuenta como LIVE de baja calidad`, `puedo dejar el live puesto sin estar`],
    respuesta: `Tres escenarios: imágenes estáticas, de solo texto o sin movimiento; LIVE mal iluminado sin un sujeto u objeto visible; y toma fija filmando un sujeto, objeto o exteriores estáticos.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La política parte de que la interacción en tiempo real es parte central de la experiencia de TikTok LIVE. Según la Fee Policy, transmisión inválida es la que TikTok considere de baja calidad, difícil de ver o difícil de evaluar; incluye LIVEs sin imagen, LIVEs estáticos, LIVEs no en tiempo real, y casos donde un creador usa múltiples cuentas para transmitir.`,
    fuente: `Static Imagery Violation Policy · Políticas de TikTok y sanciones · 4.1`,
  },
  {
    id: "politicas-4-2",
    embeddingText: `¿Qué pasa con las horas de un live de baja calidad?`,
    keywords: [`Qué pasa con las horas de un live de baja calidad`],
    respuesta: `Se eliminan. La duración del LIVE infractor se resta de tu duración mensual para el cálculo del bono, y se descuenta el bono asociado a ese LIVE.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Esto confirma con la política en la mano lo que dice el módulo 1: las horas que te bloquean no cuentan. No es solo que no sumen, es que se restan del acumulado del mes.`,
    fuente: `Static Imagery Violation Policy · Políticas de TikTok y sanciones · 4.2`,
  },
  {
    id: "politicas-4-3",
    embeddingText: `¿Cuántos lives de baja calidad me sacan de la agencia?`,
    keywords: [`Cuántos lives de baja calidad me sacan de la agencia`],
    respuesta: `Seis. Con 6 o más LIVEs infractores, el creador es removido de la agencia y se descuenta el bono aportado desde el primer LIVE del mes hasta el día del último LIVE infractor.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La política define “creador infractor” precisamente así: creador con 6 o más LIVEs en infracción.`,
    fuente: `Static Imagery Violation Policy · Políticas de TikTok y sanciones · 4.3`,
  },
  {
    id: "politicas-5-1",
    embeddingText: `¿Puedo tener una cuenta de respaldo?`,
    keywords: [`Puedo tener una cuenta de respaldo`],
    respuesta: `Tener otra cuenta no es en sí la infracción. La infracción es usar una cuenta secundaria para saltarse las reglas de ingreso a una agencia o para hacer trampa en las tareas de incentivos.

¿Tienes alguna otra duda? 😊`,
    fuente: `Multi-Account Violations Policy · Políticas de TikTok y sanciones · 5.1`,
  },
  {
    id: "politicas-5-2",
    embeddingText: `¿Qué casos concretos son violación de multicuenta?`,
    keywords: [`Qué casos concretos son violación de multicuenta`],
    respuesta: `Cinco situaciones principales, todas sobre usar una segunda cuenta para esquivar un requisito.

¿Tienes alguna otra duda? 😊`,
    fuente: `Multi-Account Violations Policy · Políticas de TikTok y sanciones · 5.2`,
  },
  {
    id: "politicas-5-3",
    embeddingText: `¿Qué pasa si me detectan multicuenta?`,
    keywords: [`Qué pasa si me detectan multicuenta`],
    respuesta: `La cuenta infractora se remueve de la agencia y se descuentan los bonos asociados.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Si ambas cuentas siguen en la misma agencia durante el período de apelación, la agencia tiene una opción de “elegir una”: designa cuál de las dos cuentas recibe la sanción. Si no se elige, por defecto se remueve la cuenta secundaria infractora.`,
    fuente: `Multi-Account Violations Policy · Políticas de TikTok y sanciones · 5.3`,
  },
  {
    id: "politicas-6-1",
    embeddingText: `¿Puedo transmitir desde otro país? También preguntan: "me voy de viaje"; "me mudo de país"; "puedo transmitir desde afuera"`,
    keywords: [`Puedo transmitir desde otro país`, `me voy de viaje`, `me mudo de país`, `puedo transmitir desde afuera`],
    respuesta: `No si tu ubicación real de transmisión está en una región no soportada por la plataforma. Las agencias solo pueden reclutar creadores cuya ubicación real de transmisión sea una región soportada.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Es un tipo de violación transregional: la agencia está registrada en el exterior mientras la ubicación real de transmisión del creador está en una región no soportada.`,
    fuente: `Unsupported Region go LIVE Violation Policy · Políticas de TikTok y sanciones · 6.1`,
  },
  {
    id: "politicas-6-2",
    embeddingText: `¿Qué pasa si transmito desde una región no soportada?`,
    keywords: [`Qué pasa si transmito desde una región no soportada`],
    respuesta: `Es la sanción más grave para el creador de todo el sistema: te remueven de la agencia, se descuenta el bono asociado, y quedas restringido para unirte a cualquier agencia en el futuro.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Las otras políticas te sacan de tu agencia; esta te cierra la puerta a todas. Si un creador va a viajar o mudarse, esto se consulta antes, no después.`,
    fuente: `Unsupported Region go LIVE Violation Policy · Políticas de TikTok y sanciones · 6.2`,
  },
  {
    id: "politicas-6-3",
    embeddingText: `Me notificaron por región y creo que es un error, ¿cómo apelo?`,
    keywords: [`Me notificaron por región y creo que es un error, ¿cómo apelo`],
    respuesta: `Con una transmisión en exteriores que cumpla estándares muy específicos, grabada dentro de las 72 horas siguientes al aviso.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `Los estándares para creadores regulares: prueba únicamente en LIVE (no video subido), duración de más de 5 minutos, dentro de los 3 días (72 horas) de recibida la notificación, en exteriores dentro de la región de negocio a la que pertenece la agencia. En la transmisión el creador debe verse claramente y estar hablando con la voz reconocible; debe aparecer en el mismo cuadro que su entorno durante toda la grabación (cambiar a la cámara trasera o salirse de cuadro no se acepta); y el fondo debe mostrar múltiples elementos identificables del lugar, como calles o edificios, suficientes para que un observador razonable crea que el fondo pertenece genuinamente a esa región, y debe estar en movimiento, no ser una escena fija. Para creadores de sala de voz o con acceso a LIVE bloqueado, se acepta LIVE o video subido, con los mismos requisitos de duración, plazo y contenido.`,
    fuente: `Unsupported Region go LIVE Violation Policy · Políticas de TikTok y sanciones · 6.3`,
  },
  {
    id: "politicas-7-1",
    embeddingText: `¿Qué cuenta como spam?`,
    keywords: [`Qué cuenta como spam`],
    respuesta: `Usar programas o herramientas automatizadas para manipular cuentas en lote y enviar comentarios en LIVE, comentarios en videos cortos y mensajes privados.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `TikTok no permite el uso de cuentas para manipulación de la plataforma: automatizar el registro u operación de cuentas en masa, distribuir contenido comercial en alto volumen, inflar artificialmente señales de interacción, y evadir la aplicación de las normas.`,
    fuente: `Spam Violation Policy · Políticas de TikTok y sanciones · 7.1`,
  },
  {
    id: "politicas-7-2",
    embeddingText: `¿Puedo usar bots para subir mis números?`,
    keywords: [`Puedo usar bots para subir mis números`],
    respuesta: `No. Bots, IPs virtuales y transmisiones inválidas están explícitamente prohibidos, sea para obtener recompensas de TikTok, cumplir tareas o campañas, o cualquier otro propósito.

¿Tienes alguna otra duda? 😊`,
    respuestaAmpliada: `La política es igual de explícita con inducir a otros usuarios a realizar acciones que no habrían hecho, por medios fraudulentos, ilegales o inapropiados. Y aplica tanto al creador como a la agencia: la agencia tampoco puede alentar, tolerar o dejar de prevenir estas conductas.`,
    fuente: `Spam Violation Policy · Políticas de TikTok y sanciones · 7.2`,
  },

];

/** Largo mínimo (tras normalizar) para que una keyword pueda activar un match. */
const MIN_KEYWORD_LENGTH = 4;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, ""); // quita tildes para matching más tolerante
}

/**
 * Índice precomputado: cada keyword ya normalizada una sola vez al cargar el
 * módulo, en vez de en cada mensaje entrante.
 */
const NORMALIZED_INDEX: { entry: FaqEntry; normalizedKeywords: string[] }[] = FAQ_ENTRIES.map((entry) => ({
  entry,
  normalizedKeywords: entry.keywords.map(normalize).filter((kw) => kw.length >= MIN_KEYWORD_LENGTH),
}));

/**
 * Matcher por keywords (fase 1), ahora por puntaje en vez de "la primera que
 * calce": con cientos de entradas, "primera que calce" es demasiado frágil
 * (muchas preguntas comparten palabras sueltas como "bono" o "diamantes").
 * En vez de eso, se busca en TODAS las entradas la keyword más larga (más
 * específica) que aparezca como substring del mensaje del creador, y se
 * devuelve la entrada dueña de esa keyword. Ante empate gana la primera
 * entrada en el array. Si nada calca lo suficiente, devuelve null — el
 * motor debe escalar a un manager humano en vez de inventar una respuesta.
 */
export function matchFaq(userText: string): FaqEntry | null {
  const normalized = normalize(userText);

  let best: FaqEntry | null = null;
  let bestScore = 0;

  for (const { entry, normalizedKeywords } of NORMALIZED_INDEX) {
    for (const kw of normalizedKeywords) {
      if (kw.length > bestScore && normalized.includes(kw)) {
        bestScore = kw.length;
        best = entry;
      }
    }
  }

  return best;
}
