import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { PromoteButton } from "./PromoteButton";
import { DynamicThemePreview } from "@/components/DynamicThemePreview";
import type { DynamicThemeSpec } from "@/lib/schemas/dynamicTheme";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "aniskhelifiusthb@gmail.com";

const SHAPE_LABELS: Record<string, string> = {
  arch: "Arche", oval: "Ovale", rectangle: "Rectangle", hexagon: "Hexagone", diamond: "Diamant",
};
const ANIM_LABELS: Record<string, string> = {
  envelope: "Enveloppe", doors: "Portes", fade: "Fondu", rise: "Montée", confetti: "Confettis",
};
const ORN_LABELS: Record<string, string> = {
  floral: "Floral", geometric: "Géométrique", arabesque: "Arabesque",
  minimal: "Minimal", confetti: "Confettis", medical: "Médical",
};

export default async function CommunityThemesPage() {
  const [session, themes] = await Promise.all([
    auth(),
    prisma.generatedTheme.findMany({
      where: { isPublic: true },
      orderBy: [{ isPromoted: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh" }}>
      <Nav />
      <div className="wrap" style={{ paddingTop: 120, paddingBottom: "4rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <Link href="/themes" className="dd-back-lnk">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><polyline points="15 18 9 12 15 6"/></svg>
            Thèmes officiels
          </Link>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginTop: "1rem" }}>
            <div>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: "#a080e0", marginBottom: 10 }}>
                ✨ Galerie IA
              </div>
              <h1 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem,5vw,3rem)", color: "var(--ivory)", fontWeight: 400, marginBottom: "0.5rem" }}>
                Thèmes générés par l&apos;IA
              </h1>
              <p style={{ color: "var(--text-soft)", maxWidth: 560 }}>
                Chaque thème est unique — design, palette et mise en page générés par l&apos;IA pour un événement précis.
                {isAdmin && <span style={{ color: "var(--gold)", marginLeft: 8 }}>Mode admin actif.</span>}
              </p>
            </div>
            <Link href="/create" className="btn btn-ghost btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
              <span>✨</span> Créer avec l&apos;IA
            </Link>
          </div>
        </div>

        {themes.length === 0 && (
          <div className="dash-empty-v2">
            <div className="ee-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={38} height={38}><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18"/></svg>
            </div>
            <h2>Aucun thème IA pour l&apos;instant</h2>
            <p>Créez votre première invitation par IA pour l&apos;ajouter à la galerie.</p>
            <Link href="/create" className="btn btn-gold btn-sm">Créer avec l&apos;IA →</Link>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
          {themes.map(theme => {
            const spec: DynamicThemeSpec | null = theme.layoutSpec
              ? (() => { try { return JSON.parse(theme.layoutSpec) as DynamicThemeSpec; } catch { return null; } })()
              : null;

            const colors = JSON.parse(theme.customizations) as Record<string, string>;
            const primary = spec?.palette.primary ?? colors["--gold"] ?? "#B8923C";
            const bg      = spec?.palette.bg      ?? colors["--bg-1"] ?? "#14100a";

            return (
              <div key={theme.id} style={{
                border: theme.isPromoted ? `2px solid ${primary}` : "1px solid var(--hair)",
                borderRadius: 16, overflow: "hidden",
                background: "linear-gradient(160deg, var(--bg-raise), var(--bg))",
                display: "flex", flexDirection: "column",
                transition: "transform .4s cubic-bezier(.16,1,.3,1), border-color .35s, box-shadow .4s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 36px 64px -38px rgba(0,0,0,.85)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>

                {/* Aperçu — DynamicTheme ou palette swatches */}
                <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                  {spec ? (
                    <DynamicThemePreview spec={spec} />
                  ) : (
                    <div style={{ height: "100%", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        {[primary, primary, colors["--ivory"] ?? "#FCFAF5"].map((c, i) => (
                          <div key={i} style={{ width: i === 0 ? 36 : 26, height: i === 0 ? 36 : 26, borderRadius: "50%", background: c, border: `2px solid rgba(255,255,255,.15)`, boxShadow: "0 2px 8px rgba(0,0,0,.5)" }} />
                        ))}
                      </div>
                      <span style={{ fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.3)" }}>
                        Ancien format
                      </span>
                    </div>
                  )}

                  {/* Badges overlay */}
                  <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 4 }}>
                    {spec && (
                      <span style={{ fontFamily: "var(--font-title)", fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: "#a080e0", background: "rgba(10,8,4,.75)", borderRadius: 100, padding: "3px 8px", border: "1px solid rgba(110,80,200,.4)", backdropFilter: "blur(4px)" }}>
                        ✨ IA unique
                      </span>
                    )}
                    {theme.isPromoted && (
                      <span style={{ fontFamily: "var(--font-title)", fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: "#2a2008", background: primary, borderRadius: 100, padding: "3px 8px" }}>
                        Officiel ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Infos */}
                <div style={{ padding: "1.2rem", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)" }}>
                    {theme.category}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", color: "var(--ivory)", fontWeight: 400 }}>
                    {theme.label}
                  </h3>

                  {spec && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {[SHAPE_LABELS[spec.shape], ORN_LABELS[spec.ornements.style], ANIM_LABELS[spec.animation], spec.typography.rtl ? "RTL" : null]
                        .filter(Boolean).map(lbl => (
                          <span key={lbl} style={{ fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".1em", color: "var(--text-faint)", background: "rgba(184,146,60,0.07)", border: "1px solid var(--hair)", borderRadius: 100, padding: "2px 8px" }}>
                            {lbl}
                          </span>
                        ))}
                    </div>
                  )}

                  <p style={{ fontFamily: "var(--font-title)", fontSize: 10, color: "var(--text-faint)", marginTop: "auto", paddingTop: 4 }}>
                    {new Date(theme.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>

                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <Link href="/create" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center", fontSize: 11 }}>
                      Créer avec l&apos;IA →
                    </Link>
                    {isAdmin && <PromoteButton id={theme.id} isPromoted={theme.isPromoted} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
