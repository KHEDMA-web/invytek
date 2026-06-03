"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        name,
        action: mode,
      });
      if (res?.error) {
        // Auth.js v5 : le code d'erreur est dans res.code ou res.error
        const code = (res as { code?: string }).code ?? res.error;
        if (code === "email_exists") setError("Cette adresse email est déjà utilisée.");
        else if (code === "no_account") setError("Aucun compte trouvé avec cet email.");
        else if (code === "bad_password") setError("Mot de passe incorrect.");
        else if (code === "invalid_input") setError("Veuillez remplir tous les champs.");
        else if (code === "CredentialsSignin") setError("Identifiants incorrects.");
        else setError("Une erreur est survenue (" + code + ").");
      } else {
        const raw = params.get("callbackUrl");
        const dest = raw?.startsWith("/") ? raw : "/dashboard";
        window.location.href = dest;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: "radial-gradient(ellipse at 50% 0%, #2a2010 0%, #14100a 60%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem 1rem",
      fontFamily: "'Cormorant Garamond', serif",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "2.5rem", textDecoration: "none" }}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <path d="M20 3C12 3 6 9 6 18v19h28V18C34 9 28 3 20 3Z" stroke="#D4AF61" strokeWidth="1.4"/>
            <circle cx="20" cy="19" r="3.4" fill="#D4AF61"/>
          </svg>
          <span style={{ fontFamily: "'Marcellus', serif", fontSize: 22, color: "#FCFAF5" }}>
            Invyt<span style={{ color: "#D4AF61" }}>ek</span>
          </span>
        </Link>

        {/* Card */}
        <div style={{
          background: "linear-gradient(160deg, #1e1810, #14100a)",
          border: "1px solid rgba(184,146,60,0.25)",
          borderRadius: 12,
          padding: "2.5rem 2rem",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        }}>
          {/* Toggle */}
          <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(184,146,60,0.08)", borderRadius: 100, marginBottom: "2rem" }}>
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); }} style={{
                flex: 1, padding: "0.7rem", borderRadius: 100, border: "none", cursor: "pointer",
                fontFamily: "'Marcellus', serif", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
                background: mode === m ? "linear-gradient(135deg, #D4AF61, #B8923C)" : "transparent",
                color: mode === m ? "#2a2008" : "rgba(243,233,210,0.55)",
                transition: "all 0.2s",
              }}>
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mode === "register" && (
              <div>
                <label style={labelStyle}>Votre nom</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Adam Benali" style={inputStyle} />
              </div>
            )}
            <div>
              <label style={labelStyle}>Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vous@exemple.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mot de passe {mode === "register" && <span style={{ color: "rgba(243,233,210,0.4)", fontStyle: "italic" }}>(min. 6 caractères)</span>}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" style={inputStyle} />
            </div>

            {error && (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "#c0504a", textAlign: "center", margin: 0 }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: "0.5rem",
              padding: "0.9rem",
              background: loading ? "rgba(184,146,60,0.4)" : "linear-gradient(135deg, #D4AF61, #B8923C 60%, #6E5618)",
              border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Marcellus', serif", fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#2a2008",
              boxShadow: loading ? "none" : "0 8px 24px rgba(184,146,60,0.4)",
              transition: "all 0.2s",
            }}>
              {loading ? "Chargement…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1.2rem 0" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(184,146,60,0.18)" }} />
            <span style={{ fontFamily: "'Marcellus', serif", fontSize: 11, letterSpacing: "0.14em", color: "rgba(243,233,210,0.3)", textTransform: "uppercase" }}>ou</span>
            <span style={{ flex: 1, height: 1, background: "rgba(184,146,60,0.18)" }} />
          </div>

          {/* Google */}
          <button
            onClick={() => {
              const raw = params.get("callbackUrl");
              const dest = raw?.startsWith("/") ? raw : "/dashboard";
              signIn("google", { callbackUrl: dest });
            }}
            style={{
              width: "100%", padding: "0.85rem",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(184,146,60,0.25)",
              borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "'Marcellus', serif", fontSize: 13, letterSpacing: "0.12em",
              color: "rgba(243,233,210,0.8)", transition: "all 0.2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "rgba(243,233,210,0.35)" }}>
          En continuant, vous acceptez nos conditions d&apos;utilisation.
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "'Marcellus', serif",
  fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
  color: "rgba(243,233,210,0.5)", marginBottom: "0.4rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.75rem 1rem",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(184,146,60,0.25)",
  borderRadius: 8, outline: "none",
  fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem",
  color: "#FCFAF5",
  boxSizing: "border-box",
};
