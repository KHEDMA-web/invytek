"use client";

import { useState } from "react";
import Link from "next/link";

type Category = "tous" | "mariage" | "business" | "medical" | "anniversaire";

const THEMES = [
  {
    cat: "mariage",
    slug: "gold-arch",
    name: "Or & Arche",
    catLabel: "Mariage",
    available: true,
    badges: [{ label: "Disponible", variant: "" }],
    preview: (
      <div className="mini dark">
        <div className="eb">Mariage</div>
        <div className="arch"><span className="ar">دعوة</span></div>
        <div className="nm">Yacine &amp; Lina</div>
        <div className="dt">12 SEPTEMBRE 2026</div>
      </div>
    ),
  },
  {
    cat: "mariage",
    slug: "bordeaux-oval",
    name: "Bordeaux & Ovale Floral",
    catLabel: "Mariage · Arabe",
    available: false,
    badges: [{ label: "Premium", variant: "gold" }],
    preview: (
      <div className="mini bordeaux">
        <div className="eb">Mariage · RTL</div>
        <div className="arch" style={{ borderRadius: "50% 50% 6px 6px / 60% 60% 6px 6px" }}><span className="ar">زفاف</span></div>
        <div className="nm">سارة &amp; أمين</div>
        <div className="dt" style={{ fontFamily: "var(--font-ar)", direction: "rtl" }}>٢٠ أكتوبر ٢٠٢٦</div>
      </div>
    ),
  },
  {
    cat: "business",
    slug: "soiree-prestige",
    name: "Soirée Prestige",
    catLabel: "Business",
    available: false,
    badges: [{ label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini dark" style={{ background: "radial-gradient(120% 70% at 50% 18%,#1c1a14,#100d08 70%)" }}>
        <div className="eb">Business</div>
        <div className="arch" style={{ borderRadius: 8 }}>
          <span style={{ fontFamily: "var(--font-title)", color: "var(--gold-light)", fontSize: 24 }}>★</span>
        </div>
        <div style={{ fontFamily: "var(--font-title)", fontSize: 24, color: "var(--gold-light)", marginTop: 12, letterSpacing: ".03em" }}>Gala 2026</div>
        <div className="dt">SAVE THE DATE</div>
      </div>
    ),
  },
  {
    cat: "medical",
    slug: "blouse-lys",
    name: "Blouse & Lys",
    catLabel: "Médical",
    available: false,
    badges: [],
    preview: (
      <div className="mini dark" style={{ background: "radial-gradient(120% 70% at 50% 18%,#16170f,#0d0f08 70%)" }}>
        <div className="eb" style={{ color: "var(--gold-light)" }}>Médical</div>
        <div className="arch" style={{ borderRadius: 10 }}>
          <span style={{ fontFamily: "var(--font-title)", color: "var(--gold-light)", fontSize: 26 }}>✛</span>
        </div>
        <div style={{ fontFamily: "var(--font-title)", fontSize: 20, color: "var(--gold-light)", marginTop: 12, letterSpacing: ".02em" }}>Clinique El Nour</div>
        <div className="dt">INAUGURATION</div>
      </div>
    ),
  },
  {
    cat: "anniversaire",
    slug: "confettis-or",
    name: "Confettis d'Or",
    catLabel: "Anniversaire",
    available: false,
    badges: [],
    preview: (
      <div className="mini dark">
        <div className="eb">Anniversaire</div>
        <div className="nm" style={{ fontSize: 52, marginTop: 18 }}>40 ans</div>
        <div className="dt">SAMEDI 6 JUIN 2026</div>
      </div>
    ),
  },
  {
    cat: "mariage",
    slug: "ivoire-minimal",
    name: "Ivoire Minimal",
    catLabel: "Mariage",
    available: false,
    badges: [],
    preview: (
      <div className="mini" style={{ background: "radial-gradient(120% 70% at 50% 18%,#262015,#14100a 72%)" }}>
        <div className="eb">Mariage</div>
        <div className="arch" style={{ borderRadius: 6, width: 70, height: 130 }}><span className="ar" style={{ fontSize: 14 }}>و</span></div>
        <div className="nm" style={{ fontSize: 30 }}>Nour &amp; Adam</div>
        <div className="dt">PRINTEMPS 2027</div>
      </div>
    ),
  },
];

export function ThemeGrid() {
  const [filter, setFilter] = useState<Category>("tous");

  const visible = THEMES.filter((t) => filter === "tous" || t.cat === filter);

  return (
    <>
      <div className="filters reveal" id="filters">
        {(["tous", "mariage", "business", "medical", "anniversaire"] as Category[]).map((cat) => (
          <button
            key={cat}
            className={`chip${filter === cat ? " active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat === "tous" ? "Tous" : cat === "mariage" ? "Mariage" : cat === "business" ? "Business" : cat === "medical" ? "Médical" : "Anniversaire"}
          </button>
        ))}
      </div>

      <div className="theme-grid" id="grid">
        {visible.map((t) => (
          <article key={t.slug} className={`tcard reveal${!t.available ? " soon" : ""}`}>
            <div className="preview">
              <div className="badges">
                {t.badges.map((b) => (
                  <span key={b.label} className={`badge${b.variant ? ` ${b.variant}` : ""}`}>{b.label}</span>
                ))}
                {t.badges.length < 2 && <span />}
              </div>
              {t.preview}
              {!t.available && (
                <div className="soon-veil"><span>Bientôt</span></div>
              )}
            </div>
            <div className="meta">
              <div className="cat">{t.catLabel}</div>
              <h3>{t.name}</h3>
              {t.available ? (
                <Link className="btn btn-gold btn-sm use" href={`/i/demo-mariage-2026`}>
                  Utiliser ce thème
                </Link>
              ) : (
                <a className="btn btn-ghost btn-sm use" href="#" aria-disabled="true">
                  Me prévenir
                </a>
              )}
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <p className="center" style={{ gridColumn: "1/-1", color: "var(--text-faint)", fontSize: 18 }}>
            Aucun thème dans cette catégorie pour l&apos;instant.
          </p>
        )}
      </div>
    </>
  );
}
