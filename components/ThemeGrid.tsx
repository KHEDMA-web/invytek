"use client";

import { useState } from "react";
import Link from "next/link";

type Category = "tous" | "mariage" | "business" | "medical" | "anniversaire";

const THEMES: {
  cat: Exclude<Category, "tous">;
  slug: string;
  name: string;
  catLabel: string;
  href: string;
  badges: { label: string; variant: string }[];
  preview: React.ReactNode;
}[] = [
  /* ── Business ── */
  {
    cat: "business",
    slug: "conference-tech",
    name: "Conférence Tech",
    catLabel: "Business",
    href: "#",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini dark" style={{ background: "radial-gradient(120% 70% at 50% 18%,#162042,#0b1020 72%)" }}>
        <div className="eb" style={{ color: "#38E1FF" }}>Conférence</div>
        <div className="arch" style={{ borderRadius: 14, borderColor: "rgba(56,225,255,.5)", width: 64, height: 84 }}>
          <span style={{ fontFamily: "var(--font-title)", color: "#EAF0FF", fontSize: 18 }}>DC</span>
        </div>
        <div style={{ fontFamily: "var(--font-title)", fontSize: 21, color: "#EAF0FF", marginTop: 12 }}>DevConf</div>
        <div className="dt" style={{ color: "#38E1FF" }}>05 MARS 2026</div>
      </div>
    ),
  },
  {
    cat: "business",
    slug: "inauguration",
    name: "Inauguration",
    catLabel: "Business",
    href: "#",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini" style={{ background: "linear-gradient(170deg,#fff,#f3eee2)" }}>
        <div className="eb" style={{ color: "#C19A4B" }}>Inauguration</div>
        <div style={{ width: "80%", height: 14, margin: "14px auto 0", background: "linear-gradient(180deg,#D9B567,#a07e36)", borderRadius: 3 }} />
        <div style={{ fontFamily: "var(--font-title)", fontSize: 20, color: "#143b2c", marginTop: 14, letterSpacing: ".04em" }}>ATLAS TOWER</div>
        <div className="dt" style={{ color: "#1F5B43" }}>14 AVRIL 2026</div>
      </div>
    ),
  },
  {
    cat: "business",
    slug: "soiree-prestige",
    name: "Soirée Prestige",
    catLabel: "Business",
    href: "#",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Disponible", variant: "" }],
    preview: (
      <div className="mini dark" style={{ background: "radial-gradient(120% 70% at 50% 18%,#14141f,#0a0a0f 70%)" }}>
        <div className="eb">Business</div>
        <div className="arch" style={{ borderRadius: 8, transform: "rotate(45deg)", width: 64, height: 64 }}>
          <span style={{ fontFamily: "var(--font-title)", color: "var(--gold-light)", fontSize: 18, transform: "rotate(-45deg)", display: "block" }}>AC</span>
        </div>
        <div style={{ fontFamily: "var(--font-title)", fontSize: 21, color: "var(--gold-light)", marginTop: 14, letterSpacing: ".06em" }}>GALA 2026</div>
        <div className="dt">ATLAS CORP</div>
      </div>
    ),
  },

  /* ── Médical ── */
  {
    cat: "medical",
    slug: "congres-medical",
    name: "Congrès Médical",
    catLabel: "Médical",
    href: "#",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini" style={{ background: "linear-gradient(170deg,#fff,#eef5f6)" }}>
        <div className="eb" style={{ color: "#128C7E" }}>Congrès</div>
        <svg viewBox="0 0 120 30" style={{ width: "80%", height: 24, margin: "12px auto 0", display: "block" }}>
          <path d="M0 15 H40 L48 15 L52 5 L58 26 L64 4 L70 15 H120" fill="none" stroke="#128C7E" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: "var(--font-title)", fontSize: 17, color: "#16323B", marginTop: 10 }}>Cardiologie</div>
        <div className="dt" style={{ color: "#128C7E" }}>14–16 MAI 2026</div>
      </div>
    ),
  },
  {
    cat: "medical",
    slug: "sensibilisation",
    name: "Sensibilisation",
    catLabel: "Médical",
    href: "#",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini" style={{ background: "linear-gradient(170deg,#fff,#f6eeec)" }}>
        <div className="eb" style={{ color: "#b83c6e" }}>Sensibilisation</div>
        <svg viewBox="0 0 120 140" style={{ width: 46, height: 54, margin: "8px auto 0", display: "block" }}>
          <path d="M60 130 L30 60 Q22 44 40 30 Q60 14 80 30 Q98 44 90 60 L60 130 M44 70 L76 70" fill="none" stroke="#E0518A" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ fontFamily: "var(--font-title)", fontSize: 19, color: "#34282b", marginTop: 8 }}>Octobre Rose</div>
        <div className="dt" style={{ color: "#b83c6e" }}>17 OCT. 2026</div>
      </div>
    ),
  },
  {
    cat: "medical",
    slug: "blouse-lys",
    name: "Blouse & Lys",
    catLabel: "Médical",
    href: "#",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini dark" style={{ background: "radial-gradient(120% 70% at 50% 18%,#18211a,#0f1210 70%)" }}>
        <div className="eb" style={{ color: "#7AA882" }}>Médical</div>
        <div className="arch" style={{ borderRadius: "50% 50% 6px 6px", borderColor: "rgba(122,168,130,.5)" }}>
          <span style={{ color: "#FCFAF5", fontSize: 26 }}>⚜</span>
        </div>
        <div style={{ fontFamily: "var(--font-title)", fontSize: 19, color: "var(--gold-light)", marginTop: 12, letterSpacing: ".04em" }}>Clinique El Nour</div>
        <div className="dt">INAUGURATION</div>
      </div>
    ),
  },

  /* ── Anniversaire ── */
  {
    cat: "anniversaire",
    slug: "anniv-neon",
    name: "18 / 20 ans — Néon",
    catLabel: "Anniversaire",
    href: "#",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini dark" style={{ background: "radial-gradient(120% 70% at 50% 18%,#1a1430,#0a0a0f 72%)" }}>
        <div className="eb" style={{ color: "#2FF3FF" }}>Anniversaire</div>
        <div style={{ fontFamily: "var(--font-title)", fontWeight: 700, fontSize: 52, lineHeight: 1, marginTop: 6, background: "linear-gradient(135deg,#2FF3FF,#9A5BFF 45%,#FF3CAC)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>18</div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 26, color: "#FF3CAC", marginTop: 2 }}>Sami</div>
        <div className="dt" style={{ color: "#2FF3FF" }}>18 JUIL. 2026</div>
      </div>
    ),
  },
  {
    cat: "anniversaire",
    slug: "baby-shower",
    name: "Baby Shower",
    catLabel: "Anniversaire",
    href: "#",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini" style={{ background: "linear-gradient(180deg,#fdf6f0,#eaf4fb)" }}>
        <div className="eb" style={{ color: "#5fa8cc" }}>Baby Shower</div>
        <div style={{ fontSize: 32, marginTop: 8 }}>🍼</div>
        <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 34, color: "#5fa8cc", marginTop: 2, lineHeight: 0.9 }}>Bébé Selma</div>
        <div className="dt" style={{ color: "#5fa8cc" }}>24 MAI 2026</div>
      </div>
    ),
  },
  {
    cat: "anniversaire",
    slug: "confettis-or",
    name: "Confettis d'Or",
    catLabel: "Anniversaire",
    href: "#",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Disponible", variant: "" }],
    preview: (
      <div className="mini dark" style={{ background: "radial-gradient(120% 70% at 50% 18%,#251c10,#14100a 70%)" }}>
        <div className="eb">Anniversaire</div>
        <div className="nm" style={{ fontSize: 26, marginTop: 6 }}>Lina</div>
        <div style={{ fontFamily: "var(--font-title)", fontSize: 54, marginTop: 2, color: "var(--gold-vivid)", lineHeight: 1 }}>40</div>
        <div className="dt">6 JUIN 2026</div>
      </div>
    ),
  },

  /* ── Mariage ── */
  {
    cat: "mariage",
    slug: "bordeaux-oval",
    name: "Bordeaux & Ovale Floral",
    catLabel: "Mariage · Arabe",
    href: "#",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Disponible", variant: "" }],
    preview: (
      <div className="mini bordeaux">
        <div className="eb">Mariage · RTL</div>
        <div className="arch" style={{ borderRadius: "50% 50% 6px 6px / 60% 60% 6px 6px" }}><span className="ar">زفاف</span></div>
        <div className="nm">Amira &amp; Sofiane</div>
        <div className="dt">13 JUIN 2026</div>
      </div>
    ),
  },
  {
    cat: "mariage",
    slug: "gold-arch",
    name: "Or & Arche",
    catLabel: "Mariage",
    href: "/i/demo-mariage-2026",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Disponible", variant: "" }],
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
    slug: "ivoire-minimal",
    name: "Ivoire Minimal",
    catLabel: "Mariage",
    href: "#",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini" style={{ background: "radial-gradient(120% 70% at 50% 18%,#262015,#14100a 72%)" }}>
        <div className="eb">Mariage</div>
        <div className="arch" style={{ borderRadius: 6, width: 70, height: 130 }}>
          <span className="nm" style={{ fontSize: 22 }}>N&amp;A</span>
        </div>
        <div className="nm" style={{ fontSize: 30 }}>Nour &amp; Adam</div>
        <div className="dt">12 SEPTEMBRE 2026</div>
      </div>
    ),
  },
];

export function ThemeGrid() {
  const [filter, setFilter] = useState<Category>("tous");

  const visible = new Set(
    filter === "tous" ? THEMES.map((t) => t.slug) : THEMES.filter((t) => t.cat === filter).map((t) => t.slug)
  );

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
        {THEMES.map((t, i) => (
          <Link
            key={t.slug}
            href={t.href}
            className={`tcard reveal${i % 3 === 1 ? " d1" : i % 3 === 2 ? " d2" : ""}${!visible.has(t.slug) ? " hide" : ""}`}
          >
            <div className="preview">
              <div className="badges">
                {t.badges.map((b) => (
                  <span key={b.label} className={`badge${b.variant ? ` ${b.variant}` : ""}`}>{b.label}</span>
                ))}
              </div>
              {t.preview}
            </div>
            <div className="meta">
              <div className="cat">{t.catLabel}</div>
              <h3>{t.name}</h3>
              <span className="btn btn-gold btn-sm use">Aperçu du thème</span>
            </div>
          </Link>
        ))}

        {visible.size === 0 && (
          <p className="center" style={{ gridColumn: "1/-1", color: "var(--text-faint)", fontSize: 18 }}>
            Aucun thème dans cette catégorie pour l&apos;instant.
          </p>
        )}
      </div>
    </>
  );
}
