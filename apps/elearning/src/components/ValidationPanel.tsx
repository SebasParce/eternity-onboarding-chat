"use client";

import { useRef, useState } from "react";
import type { ModuleProgress, SetupValidation } from "@eternity/shared-types";

interface Props {
  estado: ModuleProgress["estado"];
  validations: SetupValidation[];
  onSubmit: (file: File, brightnessScore: number) => Promise<void>;
}

const BRIGHTNESS_THRESHOLD = 70; // sobre 255 — mismo umbral que el prototipo de referencia.

/**
 * Analiza el brillo promedio de una imagen 100% en el navegador (canvas +
 * getImageData) — el archivo original nunca se manda a ningún servidor para
 * este cálculo. Es un pre-filtro objetivo y nada más: nunca aprueba ni
 * rechaza por sí solo, solo orienta al creador antes de enviar, y queda
 * guardado como referencia para el mentor que revisa manualmente.
 */
function getAverageBrightness(img: HTMLImageElement): number {
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 40);
  const h = (canvas.height = 40);
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  let total = 0;
  let count = 0;
  for (let p = 0; p < data.length; p += 4) {
    total += 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
    count++;
  }
  return total / count;
}

export default function ValidationPanel({ estado, validations, onSubmit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [brightness, setBrightness] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (estado === "completado") {
    return <div className="doneNote">✓ Tu setup fue aprobado por el equipo</div>;
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      if (file.type.startsWith("video")) {
        // El análisis de brillo por canvas aplica a imágenes; para video se
        // omite y queda solo a criterio de la revisión humana.
        setBrightness(null);
        setAnalyzing(false);
        return;
      }
      const img = new Image();
      img.onload = () => {
        setBrightness(getAverageBrightness(img));
        setAnalyzing(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!selectedFile) return;
    setSubmitting(true);
    await onSubmit(selectedFile, brightness ?? -1);
    setSubmitting(false);
    setSelectedFile(null);
    setPreview(null);
    setBrightness(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const lowLight = brightness !== null && brightness < BRIGHTNESS_THRESHOLD;

  return (
    <div>
      {estado === "en_progreso" && (
        <div className="pendingNote" style={{ marginBottom: 12 }}>
          ⏳ Ya enviaste tu setup — está en revisión por el equipo. Puedes mandar uno nuevo si quieres reemplazarlo.
        </div>
      )}

      <div className="uploadZone">
        <label className="uploadLabel">
          📷 Subir foto o video de mi espacio
          <input ref={inputRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={handleFile} />
        </label>

        {preview && (
          <div className="preview">
            {selectedFile?.type.startsWith("video") ? (
              <video src={preview} style={{ width: 76, height: 76, objectFit: "cover", borderRadius: 10 }} muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Vista previa" />
            )}
            <div>
              {analyzing && <div className="analysisLine">Analizando brillo e iluminación…</div>}
              {!analyzing && brightness !== null && (
                <>
                  <div className="analysisLine">Brillo promedio detectado: {Math.round(brightness)}/255</div>
                  <div className={`result ${lowLight ? "resultBad" : "resultPending"}`}>
                    {lowLight
                      ? "⚠️ Pre-filtro: iluminación insuficiente. Puedes enviarlo igual, pero te recomendamos más luz."
                      : "✅ Pre-filtro superado — al enviar pasa a revisión humana."}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="localNote">Análisis de brillo 100% local en tu navegador — la imagen no se envía a ningún servidor para eso.</div>

      <button className="primaryBtn" disabled={!selectedFile || analyzing || submitting} onClick={handleSubmit}>
        {submitting ? "Enviando…" : "Enviar para revisión"}
      </button>

      {validations.length > 0 && (
        <div className="validationHistory">
          <div className="quizLabel">Envíos anteriores</div>
          {validations.map((v) => (
            <div className="validationRow" key={v.id}>
              <span>{new Date(v.creado_at).toLocaleString("es-CO")}</span>
              <span>
                {v.estado === "pendiente" && "⏳ Pendiente"}
                {v.estado === "aprobado" && "✅ Aprobado"}
                {v.estado === "rechazado" && "❌ Rechazado"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
