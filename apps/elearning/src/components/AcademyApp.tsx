"use client";

import { useMemo, useState } from "react";
import { MODULE_ORDER, isProfileComplete, type Creator, type ModuleKey, type ModuleProgress, type SetupValidation } from "@eternity/shared-types";
import { LESSON_CONTENT, MODULE_TITLES } from "@/lib/moduleContent";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import ProfileForm from "./ProfileForm";
import ValidationPanel from "./ValidationPanel";

interface Props {
  creator: Creator;
  modules: ModuleProgress[];
  validations: SetupValidation[];
}

function badgeContentFor(key: ModuleKey, estado: ModuleProgress["estado"], index: number): string {
  if (estado === "completado") return "✓";
  if (estado === "bloqueado") return "🔒";
  if (estado === "vencido_esperando_extension") return "!";
  if (key === "perfil") return "👤";
  return String(index + 1);
}

export default function AcademyApp({ creator: initialCreator, modules: initialModules, validations: initialValidations }: Props) {
  const [creator, setCreator] = useState(initialCreator);
  const [modules, setModules] = useState(initialModules);
  const [validations, setValidations] = useState(initialValidations);
  const [openKey, setOpenKey] = useState<ModuleKey | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function findRow(key: ModuleKey): ModuleProgress | undefined {
    return modules.find((m) => m.module_key === key);
  }

  const done = modules.filter((m) => m.estado === "completado").length;
  const pct = Math.round((done / MODULE_ORDER.length) * 100);

  async function completeModule(key: ModuleKey) {
    const res = await fetch("/api/modules/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleKey: key }),
    });
    const body = await res.json();
    if (!res.ok) {
      showToast(body.message ?? "No se pudo completar el módulo todavía.");
      return;
    }
    setModules((prev) =>
      prev.map((m) => {
        if (body.completed && m.id === body.completed.id) return body.completed;
        if (body.unlocked && m.id === body.unlocked.id) return body.unlocked;
        return m;
      })
    );
    setOpenKey(null);
    showToast("Módulo completado ✓");
  }

  async function saveProfile(data: { nombre: string; tiktok_handle: string; ciudad: string; whatsapp_number: string }) {
    const { data: updated, error } = await supabase
      .from("creators")
      .update({ nombre: data.nombre, tiktok_handle: data.tiktok_handle, ciudad: data.ciudad })
      .eq("id", creator.id)
      .select("*")
      .single();
    if (error) {
      showToast("No se pudo guardar tu perfil: " + error.message);
      return;
    }
    setCreator(updated as Creator);
    if (isProfileComplete(updated as Creator)) {
      await completeModule("perfil");
    }
  }

  async function submitValidation(file: File, brightnessScore: number) {
    const path = `${creator.auth_user_id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("setup-validation").upload(path, file);
    if (uploadError) {
      showToast("No se pudo subir el archivo: " + uploadError.message);
      return;
    }
    const mediaType = file.type.startsWith("video") ? "video" : "imagen";
    const { data: row, error: insertError } = await supabase
      .from("setup_validation")
      .insert({
        creator_id: creator.id,
        media_url: path,
        media_type: mediaType,
        brightness_score: brightnessScore,
        estado: "pendiente",
      })
      .select("*")
      .single();
    if (insertError) {
      showToast("No se pudo registrar la validación: " + insertError.message);
      return;
    }
    setValidations((prev) => [row as SetupValidation, ...prev]);
    // El módulo pasa a "en_progreso" (envío recibido, pendiente de revisión) —
    // solo un mentor desde el dashboard lo marca completado.
    setModules((prev) =>
      prev.map((m) => (m.module_key === "validacion_setup" ? { ...m, estado: "en_progreso" } : m))
    );
    showToast("Enviado — un mentor va a revisarlo ✓");
  }

  return (
    <main className="wrap">
      <p className="eyebrow">Academia de Creadores</p>
      <h1>Tu ruta de capacitación</h1>
      <p className="subtitle">Completa cada módulo en orden. Los que tienen ventana de tiempo se marcan cuando venzan — tu mentor te da una extensión si lo necesitas.</p>
      {creator.nombre && (
        <p className="greeting">
          Hola, {creator.nombre} 👋 {creator.tiktok_handle ? `· @${creator.tiktok_handle.replace("@", "")}` : ""}
        </p>
      )}

      <div className="summary">
        <div className="ring" style={{ background: `conic-gradient(var(--gold) ${pct}%, var(--panel-2) 0)` }}>
          <div className="ringInner">{pct}%</div>
        </div>
        <div>
          <div className="summaryLabel">Progreso</div>
          <div className="summaryValue">
            {done} de {MODULE_ORDER.length} completados
          </div>
        </div>
      </div>

      <div className="path">
        {MODULE_ORDER.map((key, index) => {
          const row = findRow(key);
          const estado = row?.estado ?? "bloqueado";
          const isOpen = openKey === key;
          return (
            <div
              key={key}
              className={`card ${estado === "bloqueado" ? "cardBloqueado" : ""}`}
              onClick={() => {
                if (estado === "bloqueado") {
                  showToast("🔒 Se desbloquea al completar el módulo anterior");
                  return;
                }
                if (estado === "vencido_esperando_extension") {
                  showToast("⏱️ Tu ventana venció — pídele a tu mentor una extensión desde WhatsApp o el equipo.");
                  return;
                }
                setOpenKey(isOpen ? null : key);
              }}
            >
              <div
                className={`badge ${
                  estado === "completado"
                    ? "badgeCompletado"
                    : estado === "bloqueado"
                      ? "badgeBloqueado"
                      : estado === "vencido_esperando_extension"
                        ? "badgeExpirado"
                        : "badgeActivo"
                }`}
              >
                {badgeContentFor(key, estado, index)}
              </div>
              <h3 className="cardH3">{MODULE_TITLES[key]}</h3>
              <p className="cardDesc">{LESSON_CONTENT[key]?.desc ?? ""}</p>
              {estado === "completado" && <span className="statusTag statusTagCompletado">Completado</span>}
              {(estado === "disponible" || estado === "en_progreso") && (
                <span className="statusTag statusTagActivo">{estado === "en_progreso" ? "En revisión" : "Disponible ahora"}</span>
              )}
              {estado === "vencido_esperando_extension" && <span className="statusTag statusTagExpirado">Ventana vencida</span>}
              {row?.expires_at && (estado === "disponible" || estado === "en_progreso") && (
                <div className="timerCaption">acceso hasta {new Date(row.expires_at).toLocaleString("es-CO")}</div>
              )}

              {isOpen && (
                <div className="panel" onClick={(e) => e.stopPropagation()}>
                  {key === "perfil" && <ProfileForm creator={creator} completed={estado === "completado"} onSave={saveProfile} />}
                  {key !== "perfil" && key !== "validacion_setup" && key !== "graduacion" && (
                    <LessonBody moduleKey={key} completed={estado === "completado"} onComplete={() => completeModule(key)} />
                  )}
                  {key === "validacion_setup" && (
                    <ValidationPanel
                      estado={estado}
                      validations={validations}
                      onSubmit={submitValidation}
                    />
                  )}
                  {key === "graduacion" && (
                    <div className="grad">
                      <div className="big">🎉</div>
                      <h4>¡Completaste tu capacitación!</h4>
                      <p>Tu mentor te contactará para agendar tu primer Live oficial.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--panel-2)",
            border: "1px solid var(--line)",
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 12.5,
          }}
        >
          {toast}
        </div>
      )}
    </main>
  );
}

function LessonBody({
  moduleKey,
  completed,
  onComplete,
}: {
  moduleKey: ModuleKey;
  completed: boolean;
  onComplete: () => void;
}) {
  const content = LESSON_CONTENT[moduleKey];
  const [confirmed, setConfirmed] = useState(false);

  if (completed) {
    return <div className="doneNote">✓ Completado</div>;
  }

  const hasContent = Boolean(content?.body || content?.videoUrl);

  return (
    <div>
      {content?.videoUrl && (
        <div
          style={{
            position: "relative",
            width: content.videoAspect === "horizontal" ? "100%" : "min(100%, 360px)",
            paddingTop: content.videoAspect === "horizontal" ? "56.25%" : "177.78%", // 16:9 vs 9:16
            margin: content.videoAspect === "horizontal" ? "0 0 16px" : "0 auto 16px",
          }}
        >
          <iframe
            src={content.videoUrl}
            title={content.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, borderRadius: 8 }}
          />
        </div>
      )}

      {content?.body && <div>{content.body}</div>}

      {!hasContent && (
        <div className="pendingNote">
          📋 Contenido pendiente del equipo — este módulo todavía no tiene el material final cargado. En cuanto lo
          entreguen, se reemplaza este aviso por la lección real (video + confirmación).
        </div>
      )}

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 13 }}>
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
        Confirmo que {content?.videoUrl ? "vi" : "leí"} y entendí este módulo.
      </label>
      <button className="primaryBtn" disabled={!confirmed} onClick={onComplete}>
        Marcar como completado
      </button>
    </div>
  );
}
