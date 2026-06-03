import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { PromoteButton } from "./PromoteButton";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "aniskhelifiusthb@gmail.com";

const THEME_NAMES: Record<string, string> = {
  "gold-arch": "Or & Arche", "bordeaux-oval": "Bordeaux Ovale", "ivoire-minimal": "Ivoire Minimal",
  "confettis-or": "Confettis d'Or", "anniv-neon": "Neon Burst", "baby-shower": "Baby Shower",
  "soiree-prestige": "Soirée Prestige", "conference-tech": "Conférence Tech", "inauguration": "Inauguration",
  "blouse-lys": "Blouse & Lys", "congres-medical": "Congrès Médical", "sensibilisation": "Sensibilisation",
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
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: "0.5rem" }}>
            <Link href="/themes" style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-faint)", textDecoration: "none" }}>
              ← Thèmes officiels
            </Link>
          </div>
          <h1 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem,5vw,3rem)", color: "var(--ivory)", fontWeight: 400, marginBottom: "0.5rem" }}>
            Thèmes générés par l&apos;IA ✨
          </h1>
          <p style={{ color: "var(--text-soft)", maxWidth: 560 }}>
            Chaque thème est unique — palette de couleurs et contenu générés par l&apos;IA pour un événement précis.
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {themes.map(theme => {
            const colors = JSON.parse(theme.customizations) as Record<string, string>;
            const primary = colors["--gold"] || "#B8923C";
            const bg = colors["--bg-1"] || "#14100a";
            const ivory = colors["--ivory"] || "#FCFAF5";
            const vivid = colors["--gold-bright"] || primary;

            return (
              <div key={theme.id} style={{
                border: theme.isPromoted ? "2px solid var(--gold)" : "1px solid var(--hair)",
                borderRadius: 14, overflow: "hidden",
                background: "linear-gradient(160deg, var(--bg-raise), var(--bg))",
              }}>
                {/* Aperçu couleurs */}
                <div style={{ height: 80, background: bg, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  {[primary, vivid, colors["--gold-deep"] || primary, ivory].map((c, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: "2px solid rgba(255,255,255,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }} />
                  ))}
                  {theme.isPromoted && (
                    <div style={{ position: "absolute", top: 8, right: 8, fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "#2a2008", background: "var(--gold)", borderRadius: 100, padding: "3px 8px" }}>
                      Officiel ✓
                    </div>
                  )}
                </div>

                <div style={{ padding: "1.2rem" }}>
                  <div style={{ fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 4 }}>
                    {theme.category} · Base : {THEME_NAMES[theme.baseThemeId] ?? theme.baseThemeId}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", color: "var(--ivory)", fontWeight: 400, marginBottom: "0.6rem" }}>
                    {theme.label}
                  </h3>
                  <p style={{ fontFamily: "var(--font-title)", fontSize: 10, color: "var(--text-faint)", marginBottom: "1rem" }}>
                    {new Date(theme.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link
                      href={`/create?theme=${theme.baseThemeId}&custom=${encodeURIComponent(JSON.stringify(colors))}`}
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1, justifyContent: "center", fontSize: 11 }}
                    >
                      Utiliser ce thème
                    </Link>
                    {isAdmin && (
                      <PromoteButton id={theme.id} isPromoted={theme.isPromoted} />
                    )}
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
