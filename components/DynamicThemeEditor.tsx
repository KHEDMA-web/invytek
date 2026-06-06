"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DynamicThemeSpec } from "@/lib/schemas/dynamicTheme";
import DynamicTheme from "@/themes/dynamic/DynamicTheme";

interface Props {
  invitationId: string;
  slug: string;
  spec: DynamicThemeSpec;
}

const SHAPES   = [["arch","Arche"],["oval","Ovale"],["rectangle","Rectangle"],["hexagon","Hexagone"],["diamond","Diamant"]] as const;
const ORNEMENTS= [["floral","🌸 Floral"],["arabesque","✦ Arabesque"],["geometric","◆ Géométrique"],["minimal","— Minimal"],["confetti","🎊 Confettis"],["medical","✚ Médical"]] as const;
const ANIMS    = [["envelope","✉ Enveloppe"],["doors","🚪 Portes"],["fade","◌ Fondu"],["rise","↑ Montée"],["confetti","✦ Confettis"]] as const;
const HEADLINES= [["pinyon-script","Pinyon (calligraphie)"],["marcellus","Marcellus (élégant)"],["cormorant","Cormorant (raffiné)"],["amiri","Amiri (arabe)"]] as const;

const PALETTE_LABELS: Record<keyof DynamicThemeSpec["palette"], string> = {
  bg:           "Fond principal",
  bgCard:       "Fond carte",
  primary:      "Couleur accent",
  primaryBright:"Accent vif",
  text:         "Texte principal",
  textSoft:     "Texte secondaire",
};

const lbl: React.CSSProperties = {
  fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".18em",
  textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 8,
};

export function DynamicThemeEditor({ invitationId, slug, spec: initialSpec }: Props) {
  const router = useRouter();
  const [spec, setSpec] = useState<DynamicThemeSpec>(initialSpec);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setPalette(key: keyof DynamicThemeSpec["palette"], val: string) {
    setSpec(s => ({ ...s, palette: { ...s.palette, [key]: val } }));
  }
  function setShape(v: DynamicThemeSpec["shape"]) {
    setSpec(s => ({ ...s, shape: v }));
  }
  function setOrnStyle(v: DynamicThemeSpec["ornements"]["style"]) {
    setSpec(s => ({ ...s, ornements: { ...s.ornements, style: v } }));
  }
  function setOrnAccent(v: string) {
    setSpec(s => ({ ...s, ornements: { ...s.ornements, accent: v } }));
  }
  function setAnim(v: DynamicThemeSpec["animation"]) {
    setSpec(s => ({ ...s, animation: v }));
  }
  function setHeadline(v: DynamicThemeSpec["typography"]["headline"]) {
    setSpec(s => ({ ...s, typography: { ...s.typography, headline: v } }));
  }
  function setSection(key: keyof DynamicThemeSpec["sections"], val: boolean) {
    setSpec(s => ({ ...s, sections: { ...s.sections, [key]: val } }));
  }

  async function save() {
    setLoading(true); setError(null); setSaved(false);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/options`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutSpec: spec }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur"); return; }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  const tog = (on: boolean) => ({
    width: 42, height: 24, borderRadius: 12,
    background: on ? "var(--gold)" : "rgba(255,255,255,0.1)",
    position: "relative" as const, transition: "background .2s", flexShrink: 0,
  });
  const togDot = (on: boolean) => ({
    position: "absolute" as const, top: 3, left: on ? 21 : 3,
    width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s",
  });

  return (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>

      {/* ── Panneau gauche ── */}
      <div style={{ flex: "0 1 420px", minWidth: 300, display: "flex", flexDirection: "column", gap: "1.6rem" }}>

        {/* Palette */}
        <div>
          <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>
            Palette de couleurs
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(Object.keys(PALETTE_LABELS) as (keyof DynamicThemeSpec["palette"])[]).map(key => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="color"
                  value={spec.palette[key]}
                  onChange={e => setPalette(key, e.target.value)}
                  style={{ width: 36, height: 32, borderRadius: 8, border: "1px solid var(--hair)", cursor: "pointer", background: "none", padding: 2, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--ivory)" }}>{PALETTE_LABELS[key]}</div>
                  <div style={{ fontFamily: "var(--font-title)", fontSize: 10, color: "var(--text-faint)" }}>{spec.palette[key]}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <input type="color" value={spec.ornements.accent} onChange={e => setOrnAccent(e.target.value)}
              style={{ width: 36, height: 32, borderRadius: 8, border: "1px solid var(--hair)", cursor: "pointer", background: "none", padding: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--ivory)" }}>Couleur ornements</div>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 10, color: "var(--text-faint)" }}>{spec.ornements.accent}</div>
            </div>
          </div>
        </div>

        {/* Forme */}
        <div>
          <label style={lbl}>Forme de la carte</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SHAPES.map(([val, name]) => (
              <button key={val} onClick={() => setShape(val)}
                style={{ padding: "7px 16px", borderRadius: 100, cursor: "pointer", fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".1em",
                  border: spec.shape === val ? "none" : "1px solid var(--hair)",
                  background: spec.shape === val ? "linear-gradient(135deg, var(--gold-vivid), var(--accent))" : "rgba(255,255,255,0.03)",
                  color: spec.shape === val ? "#2a2008" : "var(--text-soft)" }}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Ornements */}
        <div>
          <label style={lbl}>Style des ornements</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ORNEMENTS.map(([val, name]) => (
              <button key={val} onClick={() => setOrnStyle(val)}
                style={{ padding: "7px 16px", borderRadius: 100, cursor: "pointer", fontFamily: "var(--font-title)", fontSize: 11,
                  border: spec.ornements.style === val ? "none" : "1px solid var(--hair)",
                  background: spec.ornements.style === val ? "linear-gradient(135deg, var(--gold-vivid), var(--accent))" : "rgba(255,255,255,0.03)",
                  color: spec.ornements.style === val ? "#2a2008" : "var(--text-soft)" }}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Animation */}
        <div>
          <label style={lbl}>Animation d&apos;ouverture</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ANIMS.map(([val, name]) => (
              <button key={val} onClick={() => setAnim(val)}
                style={{ padding: "7px 16px", borderRadius: 100, cursor: "pointer", fontFamily: "var(--font-title)", fontSize: 11,
                  border: spec.animation === val ? "none" : "1px solid var(--hair)",
                  background: spec.animation === val ? "linear-gradient(135deg, var(--gold-vivid), var(--accent))" : "rgba(255,255,255,0.03)",
                  color: spec.animation === val ? "#2a2008" : "var(--text-soft)" }}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Typographie */}
        <div>
          <label style={lbl}>Police du titre</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {HEADLINES.map(([val, name]) => (
              <button key={val} onClick={() => setHeadline(val)}
                style={{ padding: "9px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                  border: spec.typography.headline === val ? "1px solid var(--gold)" : "1px solid var(--hair)",
                  background: spec.typography.headline === val ? "rgba(184,146,60,0.1)" : "rgba(255,255,255,0.02)",
                  color: spec.typography.headline === val ? "var(--ivory)" : "var(--text-soft)",
                  fontFamily: val === "pinyon-script" ? "'Pinyon Script', cursive" : val === "marcellus" ? "'Marcellus', serif" : val === "amiri" ? "'Amiri', serif" : "'Cormorant Garamond', serif",
                  fontSize: 15 }}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div>
          <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>
            Sections affichées
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {([
              ["bismillah",   "Bismillah"],
              ["arabicText",  "Texte arabe"],
              ["countdown",   "Compte à rebours"],
              ["rsvp",        "Formulaire RSVP"],
            ] as [keyof DynamicThemeSpec["sections"], string][]).map(([key, name]) => (
              <label key={key} onClick={() => setSection(key, !spec.sections[key])}
                style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", userSelect: "none" }}>
                <div style={tog(spec.sections[key])}><div style={togDot(spec.sections[key])} /></div>
                <span style={{ fontFamily: "var(--font-title)", fontSize: 13, color: "var(--text-soft)" }}>{name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save */}
        {error && <p style={{ color: "#e07070", fontFamily: "var(--font-title)", fontSize: "0.9rem" }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save} disabled={loading || saved} className="btn btn-gold" style={{ flex: 1 }}>
            {saved ? "Design sauvegardé ✓" : loading ? "Sauvegarde…" : "Sauvegarder le design"}
          </button>
          <a href={`/i/${slug}`} target="_blank" className="btn btn-ghost btn-sm" style={{ whiteSpace: "nowrap" }}>
            Voir →
          </a>
        </div>
      </div>

      {/* ── Aperçu live ── */}
      <div style={{ flex: "1 1 300px", position: "sticky", top: 90 }}>
        <p style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#a080e0", marginBottom: 12 }}>
          ✨ Aperçu en temps réel
        </p>
        <div style={{ width: 300, height: 548, overflow: "hidden", borderRadius: 16, border: "1px solid rgba(110,80,200,0.35)", background: "#0a0806", boxShadow: "0 24px 60px rgba(110,80,192,0.2)" }}>
          <div style={{ width: 375, height: 812, transform: "scale(0.8)", transformOrigin: "top left", pointerEvents: "none", overflow: "hidden" }}>
            <DynamicTheme spec={spec} invitationId="preview" />
          </div>
        </div>
        <p style={{ marginTop: 10, fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)", lineHeight: 1.6 }}>
          Les modifications s&apos;appliquent instantanément.
        </p>
      </div>
    </div>
  );
}
