"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";
import { QrScanner } from "@/components/QrScanner";

interface CheckinResult {
  name: string;
  status: string;
  partySize: number;
  message: string | null;
  checkedInAt: string;
  alreadyCheckedIn?: boolean;
}

const RECENT_MAX = 5;

export default function CheckinPage() {
  const [token, setToken]     = useState("");
  const [result, setResult]   = useState<CheckinResult | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent]   = useState<{ name: string; time: string; party: number }[]>([]);
  const [scanning, setScanning] = useState(false);

  async function checkin(rawToken: string) {
    const t = rawToken.includes("/g/") ? rawToken.split("/g/").pop()! : rawToken;
    if (!t.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: t.trim() }),
      });
      const data = await res.json() as CheckinResult & { error?: string };
      if (!res.ok) throw new Error(data.error || "Token invalide");
      setResult(data);
      setToken("");
      setScanning(false);
      if (!data.alreadyCheckedIn) {
        const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        setRecent(prev => [{ name: data.name, time, party: data.partySize }, ...prev].slice(0, RECENT_MAX));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await checkin(token);
  }

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh",
      background: "radial-gradient(120% 55% at 50% -10%, rgba(184,146,60,0.07), transparent 55%), var(--bg)" }}>
      <Nav />
      <div className="wrap" style={{ paddingTop: 110, paddingBottom: "4rem", maxWidth: 600 }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
            Entrée événement
          </div>
          <h1 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "var(--ivory)", fontWeight: 400 }}>
            Check-in invités
          </h1>
          <p style={{ color: "var(--text-soft)", marginTop: 8 }}>
            Scannez le QR code de l&apos;invité ou collez son lien nominatif.
          </p>
        </div>

        {/* Scanner caméra */}
        <div style={{ marginBottom: "1.5rem" }}>
          {!scanning ? (
            <button
              onClick={() => { setScanning(true); setResult(null); setError(null); }}
              className="btn btn-gold"
              style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 10, fontSize: "1rem", padding: "1rem" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
                <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
                <rect x="7" y="7" width="10" height="10" rx="1"/>
              </svg>
              Scanner avec la caméra
            </button>
          ) : (
            <div>
              <QrScanner active={scanning} onScan={checkin} />
              <button
                onClick={() => setScanning(false)}
                style={{ marginTop: 10, width: "100%", padding: "0.7rem", background: "transparent",
                  border: "1px solid var(--hair)", borderRadius: 10, color: "var(--text-soft)",
                  fontFamily: "var(--font-title)", fontSize: 12, cursor: "pointer", letterSpacing: ".12em" }}
              >
                Annuler le scan
              </button>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
          <div style={{ flex: 1, height: 1, background: "var(--hair)" }} />
          <span style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-faint)" }}>ou</span>
          <div style={{ flex: 1, height: 1, background: "var(--hair)" }} />
        </div>

        {/* Saisie manuelle */}
        <div style={{ border: "1px solid var(--hair)", borderRadius: 16, padding: "1.5rem",
          background: "linear-gradient(160deg, var(--bg-raise), var(--bg))", marginBottom: "1.5rem" }}>
          <form onSubmit={handleSubmit}>
            <label style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 8 }}>
              Lien ou token invité
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Collez le lien /i/…/g/… ou le token"
                style={{ flex: 1, padding: "0.9rem 1rem",
                  background: "rgba(255,255,255,0.04)", border: "1px solid var(--hair-strong)",
                  borderRadius: 10, color: "var(--ivory)", fontFamily: "var(--font-body)",
                  fontSize: "1rem", outline: "none" }}
              />
              <button type="submit" disabled={loading || !token.trim()} className="btn btn-gold btn-sm"
                style={{ whiteSpace: "nowrap" }}>
                {loading ? "…" : "Valider →"}
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div style={{ border: "1px solid rgba(200,60,60,0.35)", borderRadius: 12, padding: "1.2rem 1.4rem", marginBottom: "1.5rem",
            background: "rgba(200,60,60,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#e07070" strokeWidth="2" strokeLinecap="round" width={20} height={20} style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            <p style={{ color: "#e07070", fontFamily: "var(--font-title)", fontSize: "0.9rem", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Success */}
        {result && (
          <div style={{ border: `1px solid ${result.alreadyCheckedIn ? "var(--hair-strong)" : "rgba(110,207,138,0.5)"}`,
            borderRadius: 16, padding: "2rem", marginBottom: "1.5rem", textAlign: "center",
            background: result.alreadyCheckedIn ? "rgba(184,146,60,0.05)" : "rgba(110,207,138,0.07)" }}>
            {result.alreadyCheckedIn ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={52} height={52} style={{ margin: "0 auto 1rem", display: "block" }}>
                <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="#6ecf8a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={52} height={52} style={{ margin: "0 auto 1rem", display: "block" }}>
                <circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>
              </svg>
            )}
            <p style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase",
              color: result.alreadyCheckedIn ? "var(--gold)" : "#6ecf8a", marginBottom: 8 }}>
              {result.alreadyCheckedIn ? "Déjà enregistré" : "Check-in validé ✓"}
            </p>
            <h2 style={{ fontFamily: "var(--font-script)", fontSize: "2.6rem", color: "var(--ivory)", lineHeight: 1, marginBottom: "0.6rem" }}>
              {result.name}
            </h2>
            <p style={{ fontFamily: "var(--font-title)", fontSize: "1rem", color: "var(--text-soft)" }}>
              {result.partySize} personne{result.partySize > 1 ? "s" : ""}
            </p>
            {result.message && (
              <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "1rem", color: "var(--text-faint)", marginTop: 10 }}>
                « {result.message} »
              </p>
            )}
            <p style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".1em", color: "var(--text-faint)", marginTop: 12 }}>
              Arrivé à {new Date(result.checkedInAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}

        {/* Dernières entrées */}
        {recent.length > 0 && (
          <div style={{ border: "1px solid var(--hair)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--hair)", background: "rgba(0,0,0,.18)" }}>
              <span style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-light)" }}>
                Dernières entrées
              </span>
            </div>
            {recent.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 18px", borderBottom: i < recent.length - 1 ? "1px solid var(--hair)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#6ecf8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M20 6L9 17l-5-5"/></svg>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--ivory)" }}>{r.name}</span>
                  {r.party > 1 && <span style={{ fontFamily: "var(--font-title)", fontSize: 10, color: "var(--text-faint)" }}>+{r.party-1}</span>}
                </div>
                <span style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)" }}>{r.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
