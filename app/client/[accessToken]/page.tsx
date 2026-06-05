import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import type { WeddingContent } from "@/lib/schemas/wedding";

interface Props { params: Promise<{ accessToken: string }> }

export async function generateMetadata({ params }: Props) {
  const { accessToken } = await params;
  const inv = await prisma.invitation.findUnique({
    where: { clientAccessToken: accessToken },
    select: { content: true, clientName: true },
  });
  if (!inv) return { title: "Espace client" };
  try {
    const content = JSON.parse(inv.content) as WeddingContent;
    const title = inv.clientName ?? `${content.names[0]} & ${content.names[1]}`;
    return { title: `Espace client — ${title}`, robots: "noindex" };
  } catch {
    return { title: "Espace client", robots: "noindex" };
  }
}

export default async function ClientPortalPage({ params }: Props) {
  const { accessToken } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { clientAccessToken: accessToken },
    include: {
      guests: {
        select: { name: true, status: true, checkedInAt: true, partySize: true, respondedAt: true },
        orderBy: [{ status: "asc" }, { respondedAt: { sort: "desc", nulls: "last" } }],
      },
      _count: { select: { views: true } },
    },
  });
  if (!invitation) notFound();

  let content: WeddingContent;
  try {
    content = JSON.parse(invitation.content) as WeddingContent;
  } catch {
    notFound();
  }
  const eventTitle = invitation.clientName ?? `${content!.names[0]} & ${content!.names[1]}`;
  const eventDate  = new Date(content.date + "T12:00:00");

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const attending  = invitation.guests.filter(g => g.status === "attending").length;
  const declined   = invitation.guests.filter(g => g.status === "declined").length;
  const pending    = invitation.guests.filter(g => g.status === "pending").length;
  const checkedIn  = invitation.guests.filter(g => g.checkedInAt !== null).length;
  const total      = invitation.guests.length;
  const attendRate = total > 0 ? Math.round((attending / total) * 100) : 0;

  const stats = [
    { n: attending,            label: "Présents",   color: "#D4AF61",  bg: "rgba(212,175,97,0.08)"  },
    { n: declined,             label: "Absents",    color: "#7a6b55",  bg: "rgba(122,107,85,0.06)"  },
    { n: pending,              label: "En attente", color: "#a89880",  bg: "rgba(168,152,128,0.06)" },
    { n: checkedIn,            label: "Arrivés ✓",  color: "#6ecf8a",  bg: "rgba(110,207,138,0.07)" },
    { n: invitation._count.views, label: "Vues",   color: "#8bacc8",  bg: "rgba(139,172,200,0.07)" },
  ];

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh", paddingBottom: "5rem" }}>

      {/* Top bar */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(1rem,4vw,2.5rem)",
        height: 60,
        background: "rgba(20,16,10,0.88)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(184,146,60,0.1)",
      }}>
        <span style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".32em", textTransform: "uppercase", color: "var(--gold)" }}>
          Invytek
        </span>
        <span style={{
          fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase",
          color: "var(--text-faint)", background: "rgba(184,146,60,0.08)", border: "1px solid rgba(184,146,60,0.15)",
          padding: "4px 12px", borderRadius: 20,
        }}>
          Espace client
        </span>
      </header>

      <div style={{ paddingTop: 80, maxWidth: 780, margin: "0 auto", padding: "80px clamp(1rem,4vw,2rem) 0" }}>

        {/* Hero */}
        <div style={{ marginTop: "2rem", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-block",
            fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase",
            color: "var(--gold)", background: "rgba(184,146,60,0.08)", border: "1px solid rgba(184,146,60,0.2)",
            padding: "4px 14px", borderRadius: 20, marginBottom: "1.2rem",
          }}>
            {eventDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </div>
          <h1 style={{
            fontFamily: "var(--font-script)",
            fontSize: "clamp(2.2rem,7vw,4rem)",
            color: "var(--ivory)",
            lineHeight: 1.1,
            marginBottom: "0.6rem",
          }}>
            {eventTitle}
          </h1>
          {content.venue && (
            <p style={{ fontFamily: "var(--font-title)", fontSize: 13, color: "var(--text-faint)", letterSpacing: ".06em" }}>
              {content.venue}
            </p>
          )}
          <div style={{ marginTop: "1.2rem" }}>
            <Link
              href={`${baseUrl}/i/${invitation.slug}`}
              target="_blank"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase",
                color: "var(--gold)", textDecoration: "none", borderBottom: "1px solid rgba(184,146,60,0.3)",
                paddingBottom: 2,
              }}
            >
              Voir l&apos;invitation →
            </Link>
          </div>
        </div>

        {/* Taux de réponse */}
        {total > 0 && (
          <div style={{
            marginBottom: "2rem", padding: "1.2rem 1.4rem",
            background: "rgba(184,146,60,0.04)", border: "1px solid rgba(184,146,60,0.15)",
            borderRadius: 12, display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap",
          }}>
            <div style={{ flex: "0 0 auto" }}>
              <div style={{ fontFamily: "var(--font-title)", fontSize: "2.5rem", color: "var(--gold)", lineHeight: 1 }}>
                {attendRate}%
              </div>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-faint)", marginTop: 4 }}>
                Taux de présence
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${attendRate}%`, height: "100%", background: "linear-gradient(90deg,#B8923C,#D4AF61)", borderRadius: 3, transition: "width .6s ease" }} />
              </div>
              <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 8 }}>
                {attending} présent{attending !== 1 ? "s" : ""} sur {total} invité{total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 12, marginBottom: "2.5rem" }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: s.bg, border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 12, padding: "1.2rem 1rem", textAlign: "center",
            }}>
              <div style={{ fontFamily: "var(--font-title)", fontSize: "2rem", color: s.color, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Liste invités */}
        {total > 0 && (
          <div style={{ border: "1px solid var(--hair)", borderRadius: 12, overflow: "hidden", marginBottom: "2.5rem" }}>
            <div style={{ padding: "1rem 1.4rem", borderBottom: "1px solid var(--hair)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1rem", color: "var(--ivory)", fontWeight: 400 }}>
                Liste des invités
              </h2>
              <span style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)" }}>
                {total} personnes
              </span>
            </div>
            <div style={{ maxHeight: 480, overflowY: "auto" }}>
              {invitation.guests.map((g, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.8rem 1.4rem", borderBottom: i < invitation.guests.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  gap: 8,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: 14, color: "var(--ivory)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {g.name}
                    </div>
                    {g.partySize > 1 && (
                      <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>+{g.partySize - 1} accompagnant{g.partySize > 2 ? "s" : ""}</div>
                    )}
                    {g.checkedInAt && (
                      <div style={{ fontSize: 11, color: "#6ecf8a", marginTop: 2 }}>
                        Arrivé à {new Date(g.checkedInAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                  <GuestStatusBadge status={g.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {total === 0 && (
          <div style={{ border: "1px dashed var(--hair)", borderRadius: 12, padding: "3rem", textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ fontFamily: "var(--font-title)", fontSize: 14, color: "var(--text-faint)" }}>
              Aucun invité ajouté pour l&apos;instant.
            </p>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", paddingTop: "1rem" }}>
        <p style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--text-faint)" }}>
          Propulsé par{" "}
          <a href={baseUrl} style={{ color: "var(--gold)", textDecoration: "none" }}>Invytek</a>
        </p>
      </div>
    </div>
  );
}

function GuestStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    attending:  { label: "Présent ✓",   color: "#D4AF61" },
    declined:   { label: "Absent",      color: "#7a6b55" },
    pending:    { label: "En attente",  color: "#a89880" },
    checked_in: { label: "Arrivé ✓",   color: "#6ecf8a" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{
      fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".14em",
      textTransform: "uppercase", color: s.color, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}
