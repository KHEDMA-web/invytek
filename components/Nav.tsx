"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ─── packs ──────────────────────────────────────────── */
const PACKS = [
  { index: 0, credits: 5,  amount: "500 DA",  label: "Starter" },
  { index: 1, credits: 15, amount: "1 500 DA", label: "Pro" },
  { index: 2, credits: 40, amount: "3 500 DA", label: "Studio" },
];

/* ─── buy modal (inchangé fonctionnellement) ──────────── */
function BuyModal({
  credits, buying, onClose, onBuy,
}: {
  credits: number | null;
  buying: number | null;
  onClose: () => void;
  onBuy: (i: number) => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(10,8,4,0.88)", backdropFilter: "blur(8px)",
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
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.2rem" }}>
          <span style={{ fontSize: 28 }}>✨</span>
          <div>
            <div style={{ fontFamily: "var(--font-title)", fontSize: 20, color: "#c0a0f0" }}>
              {credits ?? "…"} crédit{credits !== 1 ? "s" : ""}
            </div>
            <div style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)" }}>
              1 crédit = 1 invitation générée par l&apos;IA
            </div>
          </div>
        </div>

        {credits === 0 && (
          <p style={{ fontFamily: "var(--font-title)", fontSize: 12, color: "#e07070", marginBottom: "1.2rem" }}>
            Aucun crédit — rechargez pour utiliser la génération IA.
          </p>
        )}
        {credits !== null && credits > 0 && credits <= 2 && (
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
              onClick={() => onBuy(p.index)}
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
  );
}

/* ─── nav principal ───────────────────────────────────── */
export function Nav() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [buyOpen,    setBuyOpen]    = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [credits,    setCredits]    = useState<number | null>(null);
  const [buying,     setBuying]     = useState<number | null>(null);

  const menuRef   = useRef<HTMLDivElement>(null);
  const pathname  = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session;

  /* scroll blur */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* fetch credits */
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/credits").then(r => r.json()).then((d: { credits: number }) => setCredits(d.credits));
  }, [isLoggedIn]);

  /* close dropdown on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [menuOpen]);

  /* close mobile on route change */
  useEffect(() => { setMobileOpen(false); setMenuOpen(false); }, [pathname]);

  async function buy(packIndex: number) {
    setBuying(packIndex);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: packIndex }),
      });
      const d = await res.json() as { url?: string; error?: string };
      if (d.url) window.location.href = d.url;
      else alert(d.error ?? "Erreur paiement");
    } finally {
      setBuying(null);
    }
  }

  const userName = session?.user?.name?.split(" ")[0]
    ?? session?.user?.email?.split("@")[0]
    ?? "Mon espace";
  const initials = userName.slice(0, 2).toUpperCase();

  const creditColor = credits === 0
    ? "#e07070"
    : credits !== null && credits <= 2
    ? "#e0a040"
    : "#c0a0f0";

  const NAV_LINKS = [
    { href: "/",                 label: "Accueil" },
    { href: "/themes",           label: "Thèmes" },
    { href: "/themes/community", label: "Galerie IA" },
    { href: "/#how",             label: "Comment ça marche" },
    { href: "/pricing",          label: "Tarifs" },
  ];

  return (
    <>
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="wrap">

          {/* Logo */}
          <Link className="brand" href="/">
            <svg className="mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path d="M20 3C12 3 6 9 6 18v19h28V18C34 9 28 3 20 3Z" stroke="var(--accent-vivid)" strokeWidth="1.4"/>
              <path d="M20 8c-5 0-9 4-9 10v14h18V18c0-6-4-10-9-10Z" stroke="var(--accent)" strokeWidth="1" opacity="0.6"/>
              <circle cx="20" cy="19" r="3.4" fill="var(--accent-vivid)"/>
            </svg>
            <b>Invyt<span className="ek">ek</span></b>
          </Link>

          {/* Desktop nav-links */}
          <div className="nav-links">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA zone */}
          <div className="nav-cta">
            {status === "loading" ? null : isLoggedIn ? (
              <>
                {/* Créer */}
                <Link className="btn btn-gold btn-sm" href="/create" style={{ whiteSpace: "nowrap" }}>
                  + Créer
                </Link>

                {/* User dropdown trigger */}
                <div ref={menuRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setMenuOpen(o => !o)}
                    aria-expanded={menuOpen}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: menuOpen ? "rgba(184,146,60,0.12)" : "rgba(184,146,60,0.06)",
                      border: "1px solid rgba(184,146,60,0.22)",
                      borderRadius: 100, padding: "5px 12px 5px 6px",
                      cursor: "pointer", transition: "background 0.18s",
                    }}
                  >
                    {/* Avatar initiales */}
                    <span style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(184,146,60,0.18)", border: "1px solid rgba(184,146,60,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-title)", fontSize: 10,
                      letterSpacing: ".06em", color: "var(--gold)",
                    }}>
                      {initials}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-title)", fontSize: 12,
                      letterSpacing: ".08em", color: "var(--ivory)",
                      maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {userName}
                    </span>
                    <span style={{
                      fontSize: 8, color: "var(--text-faint)",
                      transform: menuOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                      display: "inline-block",
                    }}>▾</span>
                  </button>

                  {/* Dropdown panel */}
                  {menuOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 10px)", right: 0,
                      width: 230,
                      background: "linear-gradient(160deg, #201a0f, #14100a)",
                      border: "1px solid rgba(184,146,60,0.2)",
                      borderRadius: 14,
                      boxShadow: "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4)",
                      zIndex: 1000, overflow: "hidden",
                    }}>
                      {/* Credits row */}
                      <button
                        onClick={() => { setBuyOpen(true); setMenuOpen(false); }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 14px", background: "none", border: "none",
                          borderBottom: "1px solid rgba(184,146,60,0.1)",
                          cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: 14 }}>✨</span>
                          <span style={{ fontFamily: "var(--font-title)", fontSize: 12, color: creditColor }}>
                            {credits ?? "…"} crédit{credits !== 1 ? "s" : ""}
                          </span>
                        </span>
                        <span style={{
                          fontFamily: "var(--font-title)", fontSize: 10,
                          letterSpacing: ".14em", textTransform: "uppercase",
                          color: "var(--gold)", opacity: .8,
                        }}>
                          Recharger →
                        </span>
                      </button>

                      {/* Links */}
                      {[
                        { href: "/dashboard", label: "Mon dashboard" },
                        { href: "/create",    label: "Créer une invitation" },
                      ].map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          style={{
                            display: "block", padding: "10px 14px",
                            fontFamily: "var(--font-title)", fontSize: 13,
                            color: pathname === item.href ? "var(--gold)" : "var(--text-soft)",
                            textDecoration: "none",
                            borderBottom: "1px solid rgba(184,146,60,0.06)",
                            transition: "color 0.15s, background 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(184,146,60,0.06)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        >
                          {item.label}
                        </Link>
                      ))}

                      {/* Sign out */}
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        style={{
                          width: "100%", display: "block", padding: "10px 14px",
                          background: "none", border: "none", textAlign: "left",
                          fontFamily: "var(--font-title)", fontSize: 13,
                          color: "var(--text-faint)", cursor: "pointer",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#e07070")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}
                      >
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost btn-sm" href="/auth">Se connecter</Link>
                <Link className="btn btn-gold btn-sm" href="/create">Créer mon invitation</Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="nav-hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu"
              style={{
                display: "none", background: "none", border: "none",
                cursor: "pointer", padding: 4, color: "var(--ivory)",
                flexDirection: "column", gap: 5, alignItems: "center", justifyContent: "center",
              }}
            >
              <span style={{ width: 20, height: 1.5, background: "currentColor", display: "block", transition: "all .2s", transform: mobileOpen ? "translateY(3.25px) rotate(45deg)" : "none" }} />
              <span style={{ width: 20, height: 1.5, background: "currentColor", display: "block", opacity: mobileOpen ? 0 : 1, transition: "opacity .2s" }} />
              <span style={{ width: 20, height: 1.5, background: "currentColor", display: "block", transition: "all .2s", transform: mobileOpen ? "translateY(-3.25px) rotate(-45deg)" : "none" }} />
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "linear-gradient(180deg, #1a1508, #14100a)",
            borderBottom: "1px solid rgba(184,146,60,0.15)",
            padding: "1rem 1.5rem 1.5rem",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                fontFamily: "var(--font-title)", fontSize: 14,
                color: pathname === l.href ? "var(--gold)" : "var(--text-soft)",
                textDecoration: "none", padding: "8px 0",
                borderBottom: "1px solid rgba(184,146,60,0.06)",
              }}>
                {l.label}
              </Link>
            ))}
            <div style={{ height: 8 }} />
            {isLoggedIn ? (
              <>
                {credits !== null && (
                  <button onClick={() => { setBuyOpen(true); setMobileOpen(false); }} style={{
                    background: "none", border: "1px solid rgba(110,80,200,0.25)",
                    borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 4,
                  }}>
                    <span style={{ fontSize: 14 }}>✨</span>
                    <span style={{ fontFamily: "var(--font-title)", fontSize: 12, color: creditColor }}>
                      {credits} crédit{credits !== 1 ? "s" : ""} — Recharger
                    </span>
                  </button>
                )}
                <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ textAlign: "center" }}>Mon dashboard</Link>
                <Link href="/create" className="btn btn-gold btn-sm" style={{ textAlign: "center" }}>+ Créer</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "var(--font-title)", fontSize: 12,
                  color: "var(--text-faint)", textAlign: "center", padding: "8px 0",
                }}>
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="btn btn-ghost btn-sm" style={{ textAlign: "center" }}>Se connecter</Link>
                <Link href="/create" className="btn btn-gold btn-sm" style={{ textAlign: "center" }}>Créer mon invitation</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Modal achat crédits */}
      {buyOpen && (
        <BuyModal
          credits={credits}
          buying={buying}
          onClose={() => setBuyOpen(false)}
          onBuy={buy}
        />
      )}
    </>
  );
}
