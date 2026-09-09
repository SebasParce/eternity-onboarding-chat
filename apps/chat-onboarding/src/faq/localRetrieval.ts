/**
 * Retrieval local para el fallback de RAG — la "R" de RAG.
 *
 * Es TF-IDF + similitud coseno sobre `embeddingText` de cada `FaqEntry`, sin
 * llamar a ninguna API externa: cero costo, cero latencia de red. Se calcula
 * una sola vez al cargar el módulo (no en cada mensaje).
 *
 * Deliberadamente NO usa embeddings reales (Voyage AI u otro proveedor) para
 * mantener esto en el nivel más barato posible: con cientos de preguntas
 * cortas en español y bastante solape de palabras entre la pregunta y sus
 * variantes, TF-IDF ya captura la mayoría de las paráfrasis reales de un
 * creador. Si algún día la calidad de retrieval no basta, el upgrade natural
 * es reemplazar este archivo por una búsqueda vectorial sobre `embeddingText`
 * (Anthropic no ofrece API de embeddings propia; recomienda Voyage AI) sin
 * tocar `ragMatch.ts` ni el resto del motor.
 */

import { FAQ_ENTRIES, type FaqEntry } from "./knowledgeBase.js";

// Stopwords en español: palabras muy frecuentes sin valor para distinguir
// una pregunta de otra. No pretende ser exhaustiva, solo cubrir lo común.
const STOPWORDS = new Set([
  "a", "al", "algo", "alguna", "algunas", "alguno", "algunos", "ante", "antes",
  "como", "con", "contra", "cual", "cuales", "cuando", "de", "del", "desde",
  "donde", "durante", "e", "el", "ella", "ellas", "ellos", "en", "entre",
  "era", "eres", "es", "esa", "esas", "ese", "eso", "esos", "esta", "estan",
  "estas", "este", "esto", "estos", "fue", "fueron", "ha", "hace", "hacen",
  "hacia", "hay", "he", "la", "las", "le", "les", "lo", "los", "mas", "me",
  "mi", "mis", "mucho", "muy", "nada", "ni", "no", "nos", "nosotros", "o",
  "os", "otra", "otras", "otro", "otros", "para", "pero", "poco", "por",
  "porque", "que", "quien", "quienes", "se", "si", "sin", "sobre", "solo",
  "son", "su", "sus", "te", "tener", "tengo", "ti", "tiene", "tienen", "tu",
  "tus", "un", "una", "unas", "uno", "unos", "y", "ya", "yo",
]);

function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ");
  return normalized.split(/\s+/).filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function termFrequencies(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

// --- Índice precomputado al cargar el módulo ---

const documentsTokens = FAQ_ENTRIES.map((entry) => tokenize(entry.embeddingText));

const documentFrequency = new Map<string, number>();
for (const tokens of documentsTokens) {
  for (const term of new Set(tokens)) {
    documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
  }
}

const N = documentsTokens.length;

function idfOf(term: string): number {
  const df = documentFrequency.get(term) ?? 0;
  // idf suavizado (+1 en numerador y denominador, +1 al final) — nunca da 0
  // ni negativo, y un término ausente del vocabulario no rompe el cálculo.
  return Math.log((N + 1) / (df + 1)) + 1;
}

function tfidfVector(tokens: string[]): Map<string, number> {
  const tf = termFrequencies(tokens);
  const vec = new Map<string, number>();
  for (const [term, freq] of tf) {
    vec.set(term, freq * idfOf(term));
  }
  return vec;
}

function vectorNorm(vec: Map<string, number>): number {
  let sumSquares = 0;
  for (const weight of vec.values()) sumSquares += weight * weight;
  return Math.sqrt(sumSquares);
}

interface IndexedEntry {
  entry: FaqEntry;
  vector: Map<string, number>;
  norm: number;
}

const INDEX: IndexedEntry[] = FAQ_ENTRIES.map((entry, i) => {
  const vector = tfidfVector(documentsTokens[i]);
  return { entry, vector, norm: vectorNorm(vector) };
});

function cosineSimilarity(
  queryVec: Map<string, number>,
  queryNorm: number,
  docVec: Map<string, number>,
  docNorm: number
): number {
  if (queryNorm === 0 || docNorm === 0) return 0;
  let dot = 0;
  // Iterar sobre el vector más chico de los dos es más rápido; en la
  // práctica la query siempre es más corta que embeddingText, así que basta
  // iterar sobre queryVec.
  for (const [term, weight] of queryVec) {
    const other = docVec.get(term);
    if (other !== undefined) dot += weight * other;
  }
  return dot / (queryNorm * docNorm);
}

export interface RetrievalHit {
  entry: FaqEntry;
  score: number;
}

/**
 * Devuelve hasta `k` entradas cuyo `embeddingText` es más similar (coseno
 * sobre TF-IDF) al mensaje del creador, filtrando las que no llegan a
 * `minScore`. Un mensaje sin ningún solape de vocabulario con el banco de
 * preguntas devuelve `[]` — es la señal que usa `ragMatch.ts` para NO
 * llamar al modelo (y no gastar nada) cuando el mensaje claramente no tiene
 * que ver con ninguna FAQ.
 */
export function retrieveCandidates(userText: string, k = 5, minScore = 0.12): RetrievalHit[] {
  const queryVec = tfidfVector(tokenize(userText));
  const queryNorm = vectorNorm(queryVec);
  if (queryNorm === 0) return [];

  const scored: RetrievalHit[] = INDEX.map(({ entry, vector, norm }) => ({
    entry,
    score: cosineSimilarity(queryVec, queryNorm, vector, norm),
  }));

  return scored
    .filter((hit) => hit.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
