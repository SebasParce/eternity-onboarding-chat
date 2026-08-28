import { MODULE_ORDER, type ModuleKey } from "@eternity/shared-types";

export interface QuizOption {
  text: string;
  correct: boolean;
}

export interface LessonContent {
  title: string;
  desc: string;
  /**
   * Contenido real, verbatim, entregado por el equipo. `null` significa que
   * todavía no lo tenemos — NUNCA se inventa contenido de curso, se muestra
   * un aviso pidiéndolo en vez de texto de relleno.
   */
  body: string | null;
  videoUrl: string | null;
  quiz: { question: string; options: QuizOption[] } | null;
}

/**
 * Contenido de cada módulo. Solo `setup_espacio` tiene texto real (el que
 * Eternity ya entregó, verbatim). El resto queda con body/quiz en null hasta
 * que el equipo lo mande — ver claude/fase1-chat-onboarding.md.
 */
export const LESSON_CONTENT: Partial<Record<ModuleKey, LessonContent>> = {
  bienvenida: {
    title: "Bienvenida a la agencia",
    desc: "Qué somos y qué esperamos de ti",
    body: null,
    videoUrl: null,
    quiz: null,
  },
  monetizacion: {
    title: "Cómo funciona la monetización",
    desc: "Diamantes, pagos y tiempos",
    body: null,
    videoUrl: null,
    quiz: null,
  },
  setup_espacio: {
    title: "Set-up de tu espacio",
    desc: "Recomendaciones para tu primer LIVE",
    body:
      "💚 ¡Empecemos con tu primer LIVE!\n\n" +
      "Antes de comenzar, quiero dejarte algunas recomendaciones que vamos a " +
      "trabajar durante tu proceso. No necesitas ser experto ni tener miles de " +
      "seguidores; queremos que aprendas haciendo LIVE y que poco a poco " +
      "encuentres lo que mejor funciona para ti.\n\n" +
      "👤 Antes de comenzar\n" +
      "✨ Prepara tu espacio: busca un lugar con buena iluminación, poco ruido " +
      "y un fondo que no distraiga.\n" +
      "🎙️ Cuida el audio: asegúrate de que se escuche bien tu voz o tu " +
      "contenido. Si el audio falla, las personas suelen irse rápidamente.\n" +
      "📱 Cuida el encuadre: coloca el celular de manera estable y procura que " +
      "tu rostro o lo que estés mostrando se vea claramente.\n" +
      "🎯 Ten claro qué vas a hacer: antes de iniciar, piensa en el tema, " +
      "actividad o dinámica que vas a desarrollar.",
    videoUrl: null,
    quiz: null,
  },
  reglas: {
    title: "Reglas de transmisión",
    desc: "Interacción, retención y buenas prácticas",
    body: null,
    videoUrl: null,
    quiz: null,
  },
};

export const MODULE_TITLES: Record<ModuleKey, string> = {
  perfil: "Mi Perfil",
  bienvenida: "Bienvenida a la agencia",
  monetizacion: "Cómo funciona la monetización",
  setup_espacio: "Set-up de tu espacio",
  reglas: "Reglas de transmisión",
  validacion_setup: "Validación de tu Setup",
  graduacion: "Graduación",
};

export function nextModuleKey(current: ModuleKey): ModuleKey | null {
  const idx = MODULE_ORDER.indexOf(current);
  if (idx === -1 || idx === MODULE_ORDER.length - 1) return null;
  return MODULE_ORDER[idx + 1];
}
