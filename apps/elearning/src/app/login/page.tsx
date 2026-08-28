"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

/**
 * Login por teléfono + OTP (Supabase Auth). Requiere que el equipo habilite
 * el proveedor de Phone Auth en el dashboard de Supabase (Authentication >
 * Providers > Phone, con Twilio Verify u otro proveedor SMS) — no hay una
 * herramienta para configurar eso desde acá, es un paso manual del equipo.
 */
export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const normalized = phone.trim().startsWith("+") ? phone.trim() : `+${phone.trim()}`;
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: normalized });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setPhone(normalized);
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
    if (verifyError) {
      setLoading(false);
      setError(verifyError.message);
      return;
    }

    const res = await fetch("/api/auth/link-account", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? "No pudimos vincular tu cuenta. Escríbenos por WhatsApp.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 380, margin: "80px auto", padding: "0 20px" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--gold)",
          margin: "0 0 6px",
        }}
      >
        Academia de Creadores
      </p>
      <h1 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 800 }}>Ingresa con tu WhatsApp</h1>

      {step === "phone" ? (
        <form onSubmit={sendCode}>
          <label style={fieldLabelStyle}>Número de WhatsApp</label>
          <input
            style={fieldInputStyle}
            type="tel"
            placeholder="+57 300 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button style={primaryButtonStyle} type="submit" disabled={loading}>
            {loading ? "Enviando…" : "Enviar código"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode}>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Te enviamos un código a {phone}.</p>
          <label style={fieldLabelStyle}>Código de verificación</label>
          <input
            style={fieldInputStyle}
            inputMode="numeric"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button style={primaryButtonStyle} type="submit" disabled={loading}>
            {loading ? "Verificando…" : "Ingresar"}
          </button>
        </form>
      )}

      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>{error}</p>}
    </main>
  );
}

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "var(--muted)",
  margin: "16px 0 5px",
};

const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--panel-2)",
  border: "1px solid var(--line)",
  color: "var(--text)",
  borderRadius: 9,
  padding: "10px 12px",
  fontSize: 13.5,
};

const primaryButtonStyle: React.CSSProperties = {
  marginTop: 18,
  width: "100%",
  background: "var(--gold)",
  color: "#241a00",
  border: "none",
  padding: "10px 16px",
  borderRadius: 9,
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};
