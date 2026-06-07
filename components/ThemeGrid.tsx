"use client";

import { useState } from "react";

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
    href: "/themes-preview/conference-tech.html",
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
    href: "/themes-preview/inauguration.html",
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
    href: "/themes-preview/soiree-prestige.html",
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
    href: "/themes-preview/congres-medical.html",
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
    href: "/themes-preview/sensibilisation.html",
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
    href: "/themes-preview/blouse-lys.html",
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
    href: "/themes-preview/anniv-neon.html",
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
    href: "/themes-preview/baby-shower.html",
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
    href: "/themes-preview/confettis-or.html",
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

  /* ── Nouveaux thèmes mariage ── */
  {
    cat: "mariage",
    slug: "couronne-royale",
    name: "Couronne Royale",
    catLabel: "Mariage · Prestige",
    href: "/themes-preview/couronne-royale.html",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini dark" style={{ background: "radial-gradient(120% 70% at 50% 16%,#16234f,#0b1330 72%)" }}>
        <div className="eb" style={{ color: "#E7C76C" }}>Mariage · Prestige</div>
        <svg viewBox="0 0 120 92" style={{ width: 54, height: 42, margin: "8px auto 0", display: "block" }} fill="none">
          <path d="M12 78 L18 34 L40 58 L60 22 L80 58 L102 34 L108 78 Z" fill="#E7C76C" stroke="#8A6A28" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M12 78 L108 78 L106 88 L14 88 Z" fill="#C29A4B"/>
          <circle cx="60" cy="14" r="6" fill="#E7C76C"/>
        </svg>
        <div className="nm" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 30, color: "#F3E2A8", marginTop: 8, lineHeight: 1.15, marginBottom: 16 }}>Yasmine &amp; Karim</div>
        <div className="dt" style={{ color: "#E7C76C" }}>20 JUIN 2026</div>
      </div>
    ),
  },
  {
    cat: "mariage",
    slug: "glycine-bleue",
    name: "Glycine Bleue",
    catLabel: "Mariage",
    href: "/themes-preview/glycine-bleue.html",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini" style={{ background: "linear-gradient(170deg,#FBFAF5,#F3F0E8)" }}>
        <div className="eb" style={{ color: "#5C7BB8" }}>Mariage</div>
        <div style={{ position: "relative", width: 88, height: 58, margin: "12px auto 0", background: "linear-gradient(160deg,#1E3A6E,#16294E)", border: "1px solid rgba(196,154,72,.4)" }}>
          <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0,100% 0,50% 72%)", background: "#26477f", borderBottom: "1px solid rgba(196,154,72,.25)" }} />
          <div style={{ position: "absolute", left: "50%", top: "48%", transform: "translate(-50%,-50%)", width: 20, height: 20, borderRadius: "50%", background: "radial-gradient(circle at 38% 34%,#E0BC6A,#C49A48 62%,#9a7430)" }} />
        </div>
        <div className="nm" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 27, color: "#1E3A6E", marginTop: 10, lineHeight: 1.15, marginBottom: 16 }}>Lina &amp; Adam</div>
        <div className="dt" style={{ color: "#5C7BB8" }}>11 JUILLET 2026</div>
      </div>
    ),
  },
  {
    cat: "mariage",
    slug: "rose-poudre",
    name: "Rose Poudré",
    catLabel: "Mariage",
    href: "/themes-preview/rose-poudre.html",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini" style={{ background: "linear-gradient(170deg,#FEF8F9,#FBEFF1)" }}>
        <div className="eb" style={{ color: "#C77B8B" }}>Mariage</div>
        <div style={{ position: "relative", width: 88, height: 58, margin: "12px auto 0", background: "linear-gradient(160deg,#E8B6C2,#C77B8B)", border: "1px solid rgba(196,154,72,.4)" }}>
          <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0,100% 0,50% 72%)", background: "#E1A8B6", borderBottom: "1px solid rgba(196,154,72,.25)" }} />
          <div style={{ position: "absolute", left: "50%", top: "48%", transform: "translate(-50%,-50%)", width: 20, height: 20, borderRadius: "50%", background: "radial-gradient(circle at 38% 34%,#E0BC6A,#C49A48 62%,#9a7430)" }} />
        </div>
        <div className="nm" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 27, color: "#A85A6C", marginTop: 10, lineHeight: 1.15, marginBottom: 16 }}>Norah &amp; Yanis</div>
        <div className="dt" style={{ color: "#C77B8B" }}>30 AOÛT 2026</div>
      </div>
    ),
  },
  {
    cat: "mariage",
    slug: "ivoire-embosse",
    name: "Ivoire Embossé",
    catLabel: "Mariage · Minimal",
    href: "/themes-preview/ivoire-embosse.html",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini" style={{ background: "linear-gradient(170deg,#F3EEE2,#E9E2D3)" }}>
        <div className="eb" style={{ color: "#6F6048" }}>Mariage · Minimal</div>
        <div style={{ width: 42, height: 42, borderRadius: "50%", margin: "12px auto 0", background: "radial-gradient(circle at 40% 36%,#8C6440,#6B4A2E 60%,#4d3420)", boxShadow: "inset 0 2px 3px rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 24, color: "#EBDFD0" }}>B</span>
        </div>
        <div className="nm" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 27, color: "#564A35", marginTop: 10, lineHeight: 1.15, marginBottom: 16 }}>Bilel &amp; Jana</div>
        <div className="dt" style={{ color: "#6F6048" }}>5 SEPT. 2026</div>
      </div>
    ),
  },
  {
    cat: "mariage",
    slug: "sceau-de-rose",
    name: "Sceau de Rose",
    catLabel: "Mariage",
    href: "/themes-preview/sceau-de-rose.html",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini" style={{ background: "linear-gradient(170deg,#FAF3E4,#F0E6D2)" }}>
        <div className="eb" style={{ color: "#BF9A48" }}>Mariage</div>
        <div style={{ width: 44, height: 44, borderRadius: "50%", margin: "12px auto 0", background: "radial-gradient(circle at 40% 34%,#CC4A40,#A82828 55%,#7E1A1A)", boxShadow: "0 4px 8px rgba(0,0,0,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 22, color: "#E89A92" }}>M</span>
        </div>
        <div className="nm" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 27, color: "#5A4326", marginTop: 10, lineHeight: 1.15, marginBottom: 16 }}>Meriem &amp; Rayan</div>
        <div className="dt" style={{ color: "#BF9A48" }}>27 JUIN 2026</div>
      </div>
    ),
  },

  /* ── Nouveau thème business ── */
  {
    cat: "business",
    slug: "bordeaux-imperial",
    name: "Bordeaux Impérial",
    catLabel: "Business · Gala",
    href: "/themes-preview/bordeaux-imperial.html",
    badges: [{ label: "Premium", variant: "gold" }, { label: "Nouveau", variant: "" }],
    preview: (
      <div className="mini dark" style={{ background: "radial-gradient(120% 70% at 50% 30%,#4a121e,#160509 72%)" }}>
        <div className="eb" style={{ color: "#E1C06C" }}>Business · Gala</div>
        <svg viewBox="0 0 230 60" style={{ width: 96, height: 25, margin: "10px auto 2px", display: "block" }} fill="none">
          <g stroke="#E1C06C" strokeWidth="1.6" strokeLinecap="round">
            <path d="M115 8 C115 20 108 26 100 30 C112 32 116 40 115 52"/>
            <path d="M100 30 C78 24 62 36 56 20 C50 36 36 30 22 38"/>
            <path d="M130 30 C152 24 168 36 174 20 C180 36 194 30 208 38"/>
          </g>
          <circle cx="115" cy="6" r="3" fill="#E1C06C"/>
        </svg>
        <div style={{ fontFamily: "var(--font-title)", fontSize: 20, color: "#F1DDA2", letterSpacing: ".05em", marginTop: 6 }}>Soirée de Gala</div>
        <div className="dt" style={{ color: "#C76B79" }}>LES LAURÉATS 2026</div>
      </div>
    ),
  },

  /* ── Mariage existants ── */
  {
    cat: "mariage",
    slug: "bordeaux-oval",
    name: "Bordeaux & Ovale Floral",
    catLabel: "Mariage · Arabe",
    href: "/themes-preview/bordeaux-oval.html",
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
    href: "/themes-preview/ivoire-minimal.html",
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
          <a
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
          </a>
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
