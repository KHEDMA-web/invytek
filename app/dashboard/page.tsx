import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import type { WeddingContent } from "@/lib/schemas/wedding";
import { SignOutButton } from "@/components/SignOutButton";
import { CopyLinkButton } from "@/components/CopyLinkButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const invitations = await prisma.invitation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { guests: { select: { status: true, checkedInAt: true } } },
  });

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh" }}>
      <Nav />
      <div className="wrap" style={{ paddingTop: 120, paddingBottom: "4rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: "2.5rem" }}>
          <div>
            <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>Tableau de bord</p>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "var(--ivory)", fontWeight: 400 }}>
              Bonjour, {session.user.name?.split(" ")[0]} 👋
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <SignOutButton />
            <Link href="/create" className="btn btn-gold btn-sm">+ Nouvelle invitation</Link>
          </div>
        </div>

        {/* Empty state */}
        {invitations.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed var(--hair)", borderRadius: 12 }}>
            <p style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: "var(--ivory)", marginBottom: "1rem" }}>
              Aucune invitation pour l&apos;instant
            </p>
            <p style={{ color: "var(--text-soft)", marginBottom: "2rem" }}>Créez votre première invitation en quelques minutes.</p>
            <Link href="/create" className="btn btn-gold">Créer mon invitation</Link>
          </div>
        )}

        {/* Grid */}
        {invitations.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {invitations.map(inv => {
              const content = JSON.parse(inv.content) as WeddingContent;
              const attending  = inv.guests.filter(g => g.status === "attending").length;
              const declined   = inv.guests.filter(g => g.status === "declined").length;
              const pending    = inv.guests.filter(g => g.status === "pending").length;
              const checkedIn  = inv.guests.filter(g => g.checkedInAt !== null).length;
              const total = inv.guests.length;
              const eventDate = new Date(content.date + "T12:00:00");
              const invUrl = `${baseUrl}/i/${inv.slug}`;

              return (
                <div key={inv.id} style={{
                  background: "linear-gradient(160deg, var(--bg-raise), var(--bg))",
                  border: "1px solid var(--hair)", borderRadius: 12, overflow: "hidden",
                }}>
                  <div style={{ padding: "1.4rem 1.4rem 1rem" }}>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
                      {inv.themeId === "gold-arch" ? "Or & Arche" : inv.themeId === "bordeaux-oval" ? "Bordeaux Ovale" : inv.themeId}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-script)", fontSize: "1.8rem", color: "var(--ivory)", lineHeight: 1, marginBottom: 6 }}>
                      {content.names[0]} & {content.names[1]}
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-soft)" }}>
                      {eventDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-faint)", marginTop: 4 }}>{content.venue}</p>
                  </div>

                  {/* Stats */}
                  {total > 0 && (
                    <div style={{ display: "flex", borderTop: "1px solid var(--hair)", padding: "0.8rem 1.4rem", gap: 0 }}>
                      {[
                        { n: attending,  label: "Présents",  color: "var(--gold)" },
                        { n: declined,   label: "Absents",   color: "var(--text-faint)" },
                        { n: pending,    label: "Attente",   color: "var(--text-soft)" },
                        { n: checkedIn,  label: "Arrivés",   color: "#6ecf8a" },
                      ].map(s => (
                        <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--font-title)", fontSize: "1.3rem", color: s.color }}>{s.n}</div>
                          <div style={{ fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-faint)", marginTop: 2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, padding: "0.8rem 1.4rem 1.2rem", borderTop: "1px solid var(--hair)", flexWrap: "wrap" }}>
                    <Link href={`/i/${inv.slug}`} target="_blank" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                      Voir
                    </Link>
                    <CopyLinkButton url={invUrl} label="Copier" small />
                    <Link href={`/dashboard/${inv.id}`} className="btn btn-gold btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                      Gérer
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
