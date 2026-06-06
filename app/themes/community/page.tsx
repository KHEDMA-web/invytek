import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { PromoteButton } from "./PromoteButton";
import type { DynamicThemeSpec } from "@/lib/schemas/dynamicTheme";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "aniskhelifiusthb@gmail.com";

const THEME_NAMES: Record<string, string> = {
  "gold-arch": "Or & Arche", "bordeaux-oval": "Bordeaux Ovale", "ivoire-minimal": "Ivoire Minimal",
  "confettis-or": "Confettis d'Or", "anniv-neon": "Neon Burst", "baby-shower": "Baby Shower",
  "soiree-prestige": "Soirée Prestige", "conference-tech": "Conférence Tech", "inauguration": "Inauguration",
  "blouse-lys": "Blouse & Lys", "congres-medical": "Congrès Médical", "sensibilisation": "Sensibilisation",
};

const SHAPE_LABELS: Record<string, string> = {
  arch: "Arche", oval: "Ovale", rectangle: "Rectangulaire",
  hexagon: "Hexagone", diamond: "Diamant",
};
const ANIM_LABELS: Record<string, string> = {
  envelope: "Enveloppe", doors: "Portes", fade: "Fondu",
  rise: "Montée", confetti: "Confettis",
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
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh" }}>
      <Nav />
      <div className="wrap" style={{ paddingTop: 120, paddingBottom: "4rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <Link href="/themes" style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-faint)", textDecoration: "none" }}>
            ← Thèmes officiels
          </Link>
          <h1 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem,5vw,3rem)", color: "var(--ivory)", fontWeight: 400, marginBottom: "0.5rem", marginTop: "0.8rem" }}>
            Thèmes générés par l&apos;IA ✨
          </h1>
          <p style={{ color: "var(--text-soft)", maxWidth: 560 }}>
            Chaque thème est unique — design, palette et contenu générés par l&apos;IA pour un événement précis.
            {isAdmin && <span style={{ color: "var(--gold)", marginLeft: 8 }}>Mode admin actif.</span>}
          </p>
        </div>

        {themes.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed var(--hair)", borderRadius: 12 }}>
            <p style={{ color: "var(--text-faint)", fontFamily: "var(--font-title)" }}>
              Aucun thème généré pour l&apos;instant.<br />
              <Link href="/create" style={{ color: "var(--gold)" }}>Créer avec l&apos;IA →</Link>
            </p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
          {themes.map(theme => {
            const spec: DynamicThemeSpec | null = theme.layoutSpec
              ? (() => { try { return JSON.parse(theme.layoutSpec) as DynamicThemeSpec; } catch { return null; } })()
              : null;

            const colors = JSON.parse(theme.customizations) as Record<string, string>;
            const primary  = spec?.palette.primary       ?? colors["--gold"]        ?? "#B8923C";
            const bright   = spec?.palette.primaryBright ?? colors["--gold-bright"] ?? primary;
            const bg       = spec?.palette.bg            ?? colors["--bg-1"]        ?? "#14100a";
            const bgCard   = spec?.palette.bgCard        ?? "#1e1810";
            const text     = spec?.palette.text          ?? colors["--ivory"]       ?? "#FCFAF5";
            const textSoft = spec?.palette.textSoft      ?? "#c8bfa8";

            const isDynamic = !!spec;

            return (
              <div key={theme.id} style={{
                border: theme.isPromoted ? `2px solid ${primary}` : "1px solid var(--hair)",
                borderRadius: 14, overflow: "hidden",
                background: "linear-gradient(160deg, var(--bg-raise, #1e1810), var(--bg, #14100a))",
                display: "flex", flexDirection: "column",
              }}>

                {/* Preview visuelle */}
                <div style={{ height: 110, background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "0.8rem" }}>

                  {/* Palette swatches */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {[primary, bright, text, textSoft].map((c, i) => (
                      <div key={i} style={{ width: i === 0 ? 32 : 24, height: i === 0 ? 32 : 24, borderRadius: "50%", background: c, border: `2px solid ${primary}44`, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", flexShrink: 0 }} />
                    ))}
                  </div>

                  {/* Mini card preview pour thèmes dynamiques */}
                  {isDynamic && (
                    <div style={{ width: "80%", height: 28, borderRadius: spec.shape === "arch" ? "50% 50% 3px 3px / 40% 40% 3px 3px" : spec.shape === "oval" ? "50%" : 4, background: bgCard, border: `1px solid ${primary}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 40, height: 2, background: `linear-gradient(90deg, transparent, ${primary}, transparent)`, borderRadius: 1 }} />
                    </div>
                  )}

                  {/* Badges */}
                  <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4 }}>
                    {isDynamic && (
                      <span style={{ fontFamily: "var(--font-title)", fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: "#a080e0", background: "rgba(110,80,200,0.25)", borderRadius: 100, padding: "2px 7px", border: "1px solid rgba(110,80,200,0.35)" }}>
                        IA unique
                      </span>
                    )}
                    {theme.isPromoted && (
                      <span style={{ fontFamily: "var(--font-title)", fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: "#2a2008", background: primary, borderRadius: 100, padding: "2px 7px" }}>
                        Officiel ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Infos */}
                <div style={{ padding: "1.1rem", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)" }}>
                    {theme.category}
                    {!isDynamic && ` · Base : ${THEME_NAMES[theme.baseThemeId] ?? theme.baseThemeId}`}
                  </div>

                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.05rem", color: "var(--ivory)", fontWeight: 400 }}>
                    {theme.label}
                  </h3>

                  {/* Badges design pour thèmes dynamiques */}
                  {isDynamic && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "2px 0" }}>
                      {[
                        SHAPE_LABELS[spec.shape],
                        ORN_LABELS[spec.ornements.style],
                        ANIM_LABELS[spec.animation],
                        spec.typography.rtl ? "RTL" : null,
                      ].filter(Boolean).map(label => (
                        <span key={label} style={{ fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".1em", color: "var(--text-faint)", background: "rgba(184,146,60,0.08)", border: "1px solid var(--hair)", borderRadius: 100, padding: "2px 8px" }}>
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  <p style={{ fontFamily: "var(--font-title)", fontSize: 10, color: "var(--text-faint)", marginTop: "auto", paddingTop: 4 }}>
                    {new Date(theme.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                    {isDynamic ? (
                      <Link
                        href="/create"
                        className="btn btn-ghost btn-sm"
                        style={{ flex: 1, justifyContent: "center", fontSize: 11 }}
                      >
                        Créer avec l&apos;IA →
                      </Link>
                    ) : (
                      <Link
                        href={`/create?theme=${theme.baseThemeId}&custom=${encodeURIComponent(JSON.stringify(colors))}`}
                        className="btn btn-ghost btn-sm"
                        style={{ flex: 1, justifyContent: "center", fontSize: 11 }}
                      >
                        Utiliser ce thème
                      </Link>
                    )}
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
