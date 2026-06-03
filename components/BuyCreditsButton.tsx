"use client";

import { useState } from "react";

const PACKS = [
  { index: 0, credits: 5,  amount: "500 DA",  label: "Starter" },
  { index: 1, credits: 15, amount: "1 500 DA", label: "Pro" },
  { index: 2, credits: 40, amount: "3 500 DA", label: "Studio" },
];

export function BuyCreditsButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<number | null>(null);

  async function buy(packIndex: number) {
    setLoading(packIndex);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: packIndex }),
      });
      const d = await res.json() as { url?: string; error?: string };
      if (d.url) window.location.href = d.url;
      else alert(d.error || "Erreur paiement");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".14em",
          textTransform: "uppercase", background: "linear-gradient(135deg, #a080e0, #7050c0)",
          color: "#fff", border: "none", borderRadius: 100, padding: "6px 16px", cursor: "pointer",
        }}
      >
        Acheter des crédits
      </button>

      {open && (
        <div
          onClick={e => e.target === e.currentTarget && setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(10,8,4,0.85)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          }}
        >
          <div style={{
            width: "100%", maxWidth: 420,
            background: "linear-gradient(160deg, #1e1810, #14100a)",
            border: "1px solid rgba(110,80,200,0.3)", borderRadius: 16,
            padding: "2rem", boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#a080e0" }}>
                Crédits IA
              </p>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>

            <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              1 crédit = 1 invitation générée par l&apos;IA. Paiement sécurisé via Chargily (CIB / Edahabia).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PACKS.map(p => (
                <button
                  key={p.index}
                  disabled={loading !== null}
                  onClick={() => buy(p.index)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "1rem 1.2rem", borderRadius: 10, cursor: "pointer",
                    border: "1px solid rgba(110,80,200,0.25)",
                    background: loading === p.index ? "rgba(110,80,200,0.2)" : "rgba(110,80,200,0.07)",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: 14, color: "var(--ivory)", marginBottom: 2 }}>
                      {p.credits} crédits — Pack {p.label}
                    </div>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)" }}>
                      {p.amount}
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--font-title)", fontSize: 12, color: "#a080e0" }}>
                    {loading === p.index ? "…" : "Payer →"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
