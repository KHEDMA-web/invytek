"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";

interface CheckinResult {
  name: string;
  status: string;
  partySize: number;
  message: string | null;
  checkedInAt: string;
}

export default function CheckinPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setResult(data);
      setToken("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh" }}>
      <Nav />
      <div className="wrap" style={{ paddingTop: 120, paddingBottom: "4rem", maxWidth: 520 }}>

        <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
          Entrée événement
        </p>
        <h1 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "var(--ivory)", fontWeight: 400, marginBottom: "2rem" }}>
          Check-in invités
        </h1>

        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 8 }}>
              Token ou lien nominatif
            </label>
            <input
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Collez le token de l'invité…"
              required
              style={{
                width: "100%", padding: "0.85rem 1rem",
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--hair)",
                borderRadius: 8, color: "var(--ivory)", fontFamily: "var(--font-title)",
                fontSize: "0.9rem", outline: "none",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="btn btn-gold"
            style={{ width: "100%" }}
          >
            {loading ? "Vérification…" : "Valider l'entrée →"}
          </button>
        </form>

        {error && (
          <div style={{ background: "rgba(180,30,30,0.1)", border: "1px solid rgba(200,60,60,0.3)", borderRadius: 10, padding: "1.2rem", marginBottom: "1.5rem" }}>
            <p style={{ color: "#e07070", fontFamily: "var(--font-title)", fontSize: "0.9rem" }}>
              {error}
            </p>
          </div>
        )}

        {result && (
          <div style={{ background: "rgba(184,146,60,0.07)", border: "1px solid rgba(184,146,60,0.35)", borderRadius: 12, padding: "1.8rem", textAlign: "center" }}>
            <div style={{ marginBottom: "1rem" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={48} height={48} style={{ margin: "0 auto 1rem", display: "block" }}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12l3 3 5-5"/>
              </svg>
            </div>
            <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
              Check-in validé
            </p>
            <h2 style={{ fontFamily: "var(--font-script)", fontSize: "2.4rem", color: "var(--ivory)", lineHeight: 1, marginBottom: "0.8rem" }}>
              {result.name}
            </h2>
            <p style={{ fontFamily: "var(--font-title)", fontSize: "1rem", color: "var(--text-soft)", marginBottom: 6 }}>
              {result.partySize} personne{result.partySize > 1 ? "s" : ""}
            </p>
            {result.message && (
              <p style={{ fontFamily: "var(--font-title)", fontSize: "0.85rem", color: "var(--text-faint)", marginTop: 8, fontStyle: "italic" }}>
                « {result.message} »
              </p>
            )}
            <p style={{ fontFamily: "var(--font-title)", fontSize: "0.75rem", color: "var(--text-faint)", marginTop: 12, letterSpacing: ".1em" }}>
              Arrivé à {new Date(result.checkedInAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}

        <p style={{ marginTop: "3rem", fontSize: "0.8rem", color: "var(--text-faint)", fontFamily: "var(--font-title)", textAlign: "center", lineHeight: 1.8 }}>
          Scannez le QR code de l'invitation nominative ou collez le token (dernière partie du lien <code style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 4 }}>/g/…</code>)
        </p>
      </div>
    </div>
  );
}
