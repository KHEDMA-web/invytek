"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PACKS = [
  { index: 0, credits: 5,  amount: "500 DA",  label: "Starter" },
  { index: 1, credits: 15, amount: "1 500 DA", label: "Pro" },
  { index: 2, credits: 40, amount: "3 500 DA", label: "Studio" },
];

function CreditsWidget() {
  const [credits, setCredits] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [buying, setBuying] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/credits").then(r => r.json()).then((d: { credits: number }) => setCredits(d.credits));
  }, []);

  if (credits === null) return null;

  async function buy(packIndex: number) {
    setBuying(packIndex);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: packIndex }),
      });
      const d = await res.json() as { url?: string; error?: string; detail?: string };
      if (d.url) window.location.href = d.url;
      else alert(d.error || "Erreur paiement");
    } finally {
      setBuying(null);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Crédits IA"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: credits === 0 ? "rgba(200,60,60,0.15)" : credits <= 2 ? "rgba(220,140,40,0.15)" : "rgba(110,80,200,0.15)",
          border: `1px solid ${credits === 0 ? "rgba(200,60,60,0.4)" : credits <= 2 ? "rgba(220,140,40,0.4)" : "rgba(110,80,200,0.35)"}`,
          borderRadius: 100, padding: "5px 12px 5px 8px", cursor: "pointer",
          fontFamily: "var(--font-title)", fontSize: 12, letterSpacing: ".1em",
          color: credits === 0 ? "#e07070" : credits <= 2 ? "#e0a040" : "#c0a0f0",
          transition: "all 0.2s",
        }}
      >
        <span style={{ fontSize: 14 }}>✨</span>
        <span>{credits}</span>
      </button>

      {open && (
        <div
          onClick={e => e.target === e.currentTarget && setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            background: "rgba(10,8,4,0.85)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          }}
        >
          <div style={{
            width: "100%", maxWidth: 400,
            background: "linear-gradient(160deg, #1e1810, #14100a)",
            border: "1px solid rgba(110,80,200,0.3)", borderRadius: 16,
            padding: "2rem", boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#a080e0" }}>
                Crédits IA
              </p>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.2rem" }}>
              <span style={{ fontSize: 28 }}>✨</span>
              <div>
                <div style={{ fontFamily: "var(--font-title)", fontSize: 20, color: "#c0a0f0" }}>{credits} crédit{credits !== 1 ? "s" : ""}</div>
                <div style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)" }}>1 crédit = 1 invitation générée</div>
              </div>
            </div>

            {credits === 0 && (
              <p style={{ fontFamily: "var(--font-title)", fontSize: 12, color: "#e07070", marginBottom: "1.2rem" }}>
                Aucun crédit — rechargez pour utiliser la génération IA.
              </p>
            )}
            {credits > 0 && credits <= 2 && (
              <p style={{ fontFamily: "var(--font-title)", fontSize: 12, color: "#e0a040", marginBottom: "1.2rem" }}>
                Crédits faibles — pensez à recharger.
              </p>
            )}

            <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1.2rem" }}>
              Paiement sécurisé via Chargily (CIB / Edahabia).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PACKS.map(p => (
                <button
                  key={p.index}
                  disabled={buying !== null}
                  onClick={() => buy(p.index)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.9rem 1.1rem", borderRadius: 10, cursor: "pointer",
                    border: "1px solid rgba(110,80,200,0.25)",
                    background: buying === p.index ? "rgba(110,80,200,0.25)" : "rgba(110,80,200,0.08)",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: 13, color: "var(--ivory)" }}>
                      {p.credits} crédits — Pack {p.label}
                    </div>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{p.amount}</div>
                  </div>
                  <span style={{ fontFamily: "var(--font-title)", fontSize: 12, color: "#a080e0" }}>
                    {buying === p.index ? "…" : "Payer →"}
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

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="wrap">
        <Link className="brand" href="/">
          <svg className="mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path d="M20 3C12 3 6 9 6 18v19h28V18C34 9 28 3 20 3Z" stroke="var(--accent-vivid)" strokeWidth="1.4"/>
            <path d="M20 8c-5 0-9 4-9 10v14h18V18c0-6-4-10-9-10Z" stroke="var(--accent)" strokeWidth="1" opacity="0.6"/>
            <circle cx="20" cy="19" r="3.4" fill="var(--accent-vivid)"/>
          </svg>
          <b>Invyt<span className="ek">ek</span></b>
        </Link>
        <div className="nav-links">
          <Link href="/themes" className={pathname === "/themes" ? "active" : ""}>Thèmes</Link>
          <Link href="/#how">Comment ça marche</Link>
          <Link href="/#proof">Pourquoi nous</Link>
          <Link href="/pricing" className={pathname === "/pricing" ? "active" : ""}>Tarifs</Link>
        </div>
        <div className="nav-cta">
          {isLoggedIn && <CreditsWidget />}
          {status !== "loading" && (
            isLoggedIn
              ? <Link className="btn btn-ghost btn-sm" href="/dashboard">Mon espace</Link>
              : <Link className="btn btn-ghost btn-sm" href="/auth">Se connecter</Link>
          )}
          <Link className="btn btn-gold btn-sm" href="/create">Créer mon invitation</Link>
        </div>
      </div>
    </nav>
  );
}
