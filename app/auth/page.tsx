"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  return <Suspense><AuthForm /></Suspense>;
}

function AuthForm() {
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false, email, password, name, action: mode,
      });
      if (res?.error) {
        const code = (res as { code?: string }).code ?? res.error;
        if (code === "email_exists")     setError("Cette adresse email est déjà utilisée.");
        else if (code === "no_account")  setError("Aucun compte trouvé avec cet email.");
        else if (code === "bad_password")setError("Mot de passe incorrect.");
        else if (code === "invalid_input")setError("Veuillez remplir tous les champs.");
        else if (code === "CredentialsSignin") setError("Identifiants incorrects.");
        else setError("Une erreur est survenue (" + code + ").");
      } else {
        const raw = params.get("callbackUrl");
        if (raw?.startsWith("/")) {
          window.location.href = raw;
        } else {
          const planRes = await fetch("/api/credits");
          const planData = await planRes.json() as { plan?: string };
          window.location.href = planData.plan && planData.plan !== "free" ? "/dashboard" : "/pricing";
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <div style={{
      minHeight: "100dvh",
      background: "radial-gradient(ellipse 90% 60% at 50% -5%, #2a2010 0%, var(--bg) 58%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem 1rem", fontFamily: "var(--font-body)",
    }}>
      <div style={{ width: "100%", maxWidth: 430, position: "relative", zIndex: 2 }}>

        {/* Back */}
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase",
          color: "var(--text-faint)", marginBottom: "1.6rem", textDecoration: "none",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Accueil
        </Link>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 11, marginBottom: "2.4rem" }}>
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
            <path d="M20 3C12 3 6 9 6 18v19h28V18C34 9 28 3 20 3Z" stroke="var(--accent-vivid)" strokeWidth="1.4"/>
            <circle cx="20" cy="19" r="3.4" fill="var(--accent-vivid)"/>
          </svg>
          <b style={{ fontFamily: "var(--font-title)", fontWeight: 400, fontSize: 24, color: "var(--ivory)" }}>
            Invyt<span style={{ color: "var(--accent-vivid)" }}>ek</span>
          </b>
        </div>

        {/* Card */}
        <div style={{
          position: "relative", borderRadius: 18, padding: "2.6rem 2.1rem 2.2rem",
          background: "linear-gradient(160deg, rgba(40,32,18,0.72), rgba(20,16,10,0.62))",
          border: "1px solid rgba(184,146,60,0.28)",
          backdropFilter: "blur(22px) saturate(140%)",
          WebkitBackdropFilter: "blur(22px) saturate(140%)",
          boxShadow: "0 50px 100px -40px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
            <h1 style={{ fontFamily: "var(--font-title)", fontWeight: 400, fontSize: "1.7rem", color: "var(--ivory)" }}>
              {isRegister ? "Créer un compte" : "Bon retour"}
            </h1>
            <p style={{ color: "var(--text-soft)", fontSize: "1.02rem", marginTop: 6 }}>
              {isRegister ? "Quelques secondes, et c'est parti." : "Connectez-vous pour gérer vos invitations."}
            </p>
          </div>

          {/* Segment toggle with sliding pill */}
          <div style={{
            position: "relative", display: "flex", gap: 4, padding: 4,
            background: "rgba(184,146,60,0.08)", border: "1px solid var(--hair)",
            borderRadius: 100, marginBottom: "1.8rem",
          }}>
            <div style={{
              position: "absolute", top: 4, bottom: 4, width: "calc(50% - 4px)", left: 4,
              borderRadius: 100,
              background: "linear-gradient(135deg, var(--gold-vivid), var(--accent))",
              transition: "transform .4s cubic-bezier(.16,1,.3,1)",
              transform: isRegister ? "translateX(100%)" : "none",
              zIndex: 0,
            }} />
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                style={{
                  flex: 1, padding: "0.72rem", borderRadius: 100, border: "none", cursor: "pointer",
                  fontFamily: "var(--font-title)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase",
                  background: "transparent", color: mode === m ? "#2a2008" : "var(--text-soft)",
                  position: "relative", zIndex: 1, transition: "color .3s",
                }}
              >
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Name — animate in/out */}
            <div style={{
              maxHeight: isRegister ? 90 : 0,
              opacity: isRegister ? 1 : 0,
              overflow: "hidden",
              transition: "max-height .45s cubic-bezier(.16,1,.3,1), opacity .35s",
            }}>
              <label style={lbl}>Votre nom</label>
              <input
                className={isRegister ? undefined : undefined}
                value={name}
                onChange={e => setName(e.target.value)}
                required={isRegister}
                placeholder="Adam Benali"
                style={inp}
              />
            </div>

            <div>
              <label style={lbl}>Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vous@exemple.com" style={inp} />
            </div>

            <div>
              <label style={lbl}>
                Mot de passe{" "}
                {isRegister && <span style={{ fontStyle: "italic", letterSpacing: 0, textTransform: "none", color: "var(--text-faint)" }}>(min. 6 caractères)</span>}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required minLength={6}
                  placeholder="••••••••"
                  style={{ ...inp, paddingRight: 46 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                    width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", transition: "color .25s",
                  }}
                  aria-label={showPw ? "Masquer" : "Afficher"}
                >
                  {showPw ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/>
                    </svg>
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: ".95rem", color: "#c0504a", textAlign: "center", margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.4rem", padding: "0.95rem", border: "none", borderRadius: 10, cursor: loading ? "default" : "pointer",
                fontFamily: "var(--font-title)", fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "#2a2008",
                background: loading
                  ? "rgba(184,146,60,0.4)"
                  : "linear-gradient(135deg, var(--gold-vivid), var(--accent) 60%, var(--gold-deep))",
                boxShadow: loading ? "none" : "0 16px 40px -14px rgba(184,146,60,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
                transition: "transform .25s, box-shadow .3s, opacity .3s",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Chargement…" : isRegister ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>

          {/* Separator */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1.3rem 0" }}>
            <span style={{ flex: 1, height: 1, background: "var(--hair)" }} />
            <span style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-faint)" }}>ou</span>
            <span style={{ flex: 1, height: 1, background: "var(--hair)" }} />
          </div>

          {/* Google */}
          <button
            onClick={() => {
              const raw = params.get("callbackUrl");
              signIn("google", { callbackUrl: raw?.startsWith("/") ? raw : "/dashboard" });
            }}
            style={{
              width: "100%", padding: "0.85rem",
              background: "rgba(255,255,255,0.06)", border: "1px solid var(--hair)", borderRadius: 10,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "var(--font-title)", fontSize: 13, letterSpacing: ".08em", color: "var(--text-soft)",
              transition: "border-color .25s, background .25s, color .25s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--hair-strong)"; (e.currentTarget as HTMLElement).style.color = "var(--ivory)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--hair)"; (e.currentTarget as HTMLElement).style.color = "var(--text-soft)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: ".92rem", color: "var(--text-faint)" }}>
          En continuant, vous acceptez nos <a href="#" style={{ color: "var(--text-soft)" }}>conditions d&apos;utilisation</a>.
        </p>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-title)",
  fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase",
  color: "var(--text-faint)", marginBottom: ".45rem",
};

const inp: React.CSSProperties = {
  width: "100%", padding: ".85rem 1rem",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--hair)", borderRadius: 10,
  outline: "none", fontFamily: "var(--font-body)",
  fontSize: "1.08rem", color: "var(--ivory)",
  transition: "border-color .25s, box-shadow .25s, background .25s",
  boxSizing: "border-box",
};
