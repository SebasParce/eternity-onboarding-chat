"use client";

import { useState } from "react";
import type { Creator } from "@eternity/shared-types";

interface Props {
  creator: Creator;
  completed: boolean;
  onSave: (data: { nombre: string; tiktok_handle: string; ciudad: string; whatsapp_number: string }) => Promise<void>;
}

export default function ProfileForm({ creator, completed, onSave }: Props) {
  const [nombre, setNombre] = useState(creator.nombre ?? "");
  const [tiktok, setTiktok] = useState(creator.tiktok_handle ?? "");
  const [ciudad, setCiudad] = useState(creator.ciudad ?? "");
  const [saving, setSaving] = useState(false);

  if (completed) {
    return (
      <div>
        <div>Perfil guardado.</div>
        <div className="doneNote">
          ✓ {creator.nombre} · @{(creator.tiktok_handle ?? "").replace("@", "")} · {creator.ciudad}
        </div>
      </div>
    );
  }

  const allFilled = nombre.trim() && tiktok.trim() && ciudad.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({ nombre, tiktok_handle: tiktok, ciudad, whatsapp_number: creator.whatsapp_number });
    setSaving(false);
  }

  return (
    <form className="profileForm" onSubmit={handleSubmit}>
      <label>Nombre completo</label>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Camila Torres" required />
      <label>Usuario de TikTok</label>
      <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="@usuario" required />
      <label>Ciudad</label>
      <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ej. Bogotá" required />
      <label>WhatsApp</label>
      <input value={creator.whatsapp_number} disabled />
      <button className="primaryBtn" type="submit" disabled={!allFilled || saving}>
        {saving ? "Guardando…" : "Guardar mi perfil"}
      </button>
    </form>
  );
}
