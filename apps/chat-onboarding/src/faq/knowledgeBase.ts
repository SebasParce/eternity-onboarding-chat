/**
 * Base de conocimiento (FAQ) del modo "resolviendo_dudas".
 *
 * Fase 1: matching por palabras clave (determinístico, sin costo de LLM,
 * fácil de auditar). Cada entrada expone `keywords` para el matcher simple
 * de hoy y un `embeddingText` explícito (la pregunta canónica + variantes)
 * ya preparado para el día en que esto se mueva a búsqueda semántica/RAG
 * real — en ese momento solo se reemplaza `matchFaq()` por una búsqueda
 * vectorial sobre `embeddingText`, sin tocar el resto del motor.
 */

export interface FaqEntry {
  id: string;
  /** Pregunta canónica, se usa como texto a "embeddear" en la fase RAG. */
  embeddingText: string;
  /** Palabras/frases que activan esta entrada en el matcher de fase 1. */
  keywords: string[];
  respuesta: string;
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
];

/**
 * Matcher simple por keywords (fase 1). Devuelve la primera entrada cuyo
 * texto del creador contiene alguna de sus keywords, o null si no hay match
 * — en ese caso el motor debe escalar a un manager humano en vez de inventar
 * una respuesta.
 */
export function matchFaq(userText: string): FaqEntry | null {
  const normalized = userText
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, ""); // quita tildes para matching más tolerante

  for (const entry of FAQ_ENTRIES) {
    for (const kw of entry.keywords) {
      const kwNormalized = kw.normalize("NFD").replace(/\p{Diacritic}/gu, "");
      if (normalized.includes(kwNormalized)) return entry;
    }
  }
  return null;
}
