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
    return { title: `Espace client — ${inv.clientName ?? content.names[0]}`, robots: "noindex" };
  } catch { return { title: "Espace client", robots: "noindex" }; }
}

export default async function ClientPortalPage({ params }: Props) {
  const { accessToken } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { clientAccessToken: accessToken },
    include: {
      guests: {
        select: { name: true, status: true, checkedInAt: true, partySize: true, respondedAt: true, message: true },
        orderBy: [{ status: "asc" }, { respondedAt: { sort: "desc", nulls: "last" } }],
      },
      _count: { select: { views: true } },
    },
  });
  if (!invitation) notFound();

  let content: WeddingContent;
  try { content = JSON.parse(invitation.content) as WeddingContent; } catch { notFound(); }

  const eventTitle  = invitation.clientName ?? `${content!.names[0]} & ${content!.names[1]}`;
  const eventDate   = new Date(content.date + "T12:00:00");
  const baseUrl     = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

  const attending = invitation.guests.filter(g => g.status === "attending").length;
  const declined  = invitation.guests.filter(g => g.status === "declined").length;
  const pending   = invitation.guests.filter(g => g.status === "pending").length;
  const checkedIn = invitation.guests.filter(g => g.checkedInAt !== null).length;
  const total     = invitation.guests.length;

  const attDeg = total > 0 ? (attending / total * 360).toFixed(1) : "0";
  const penDeg = total > 0 ? ((attending + pending) / total * 360).toFixed(1) : "0";
  const attendRate = total > 0 ? Math.round(attending / total * 100) : 0;
  const responseRate = total > 0 ? Math.round((attending + declined) / total * 100) : 0;

  const BADGE_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
    attending: { label: "Présent", color: "var(--gold-vivid)", bg: "rgba(184,146,60,.08)", border: "var(--hair-strong)" },
    declined:  { label: "Absent",  color: "#c98a82", bg: "rgba(201,138,130,.07)", border: "rgba(201,138,130,.3)" },
    pending:   { label: "Attente", color: "var(--text-soft)", bg: "rgba(255,255,255,.03)", border: "var(--hair)" },
  };

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh", paddingBottom: "5rem",
      background: "radial-gradient(120% 55% at 50% -10%, rgba(184,146,60,0.07), transparent 55%), var(--bg)" }}>

      {/* Top bar */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(1rem,4vw,2.5rem)", height: 60,
        background: "rgba(15,12,7,.88)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--hair)" }}>
        <span style={{ fontFamily: "var(--font-title)", fontSize: 18, color: "var(--ivory)" }}>
          Invyt<span style={{ color: "var(--accent-vivid)" }}>ek</span>
        </span>
        <span style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase",
          color: "var(--gold)", background: "rgba(184,146,60,0.08)", border: "1px solid var(--hair)",
          padding: "4px 14px", borderRadius: 100 }}>
          Espace client
        </span>
      </header>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "80px clamp(1rem,4vw,2rem) 0" }}>

        {/* Hero */}
        <div style={{ marginTop: "2.5rem", marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase",
            color: "var(--gold)", marginBottom: 8 }}>
            {eventDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <h1 style={{ fontFamily: "var(--font-script)", fontSize: "clamp(2.2rem,7vw,3.8rem)", color: "var(--ivory)", lineHeight: 1.1, marginBottom: "0.5rem" }}>
            {eventTitle}
          </h1>
          {content.venue && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "1.05rem", color: "var(--text-soft)" }}>
              {content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}
            </p>
          )}
          <a href={`${baseUrl}/i/${invitation.slug}`} target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: "1rem",
              fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase",
              color: "var(--gold-vivid)", textDecoration: "none" }}>
            Voir l&apos;invitation
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>

        {/* RSVP donut + stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 26 }}>

          {/* Donut */}
          <div className="panel-v2">
            <div className="p-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3v9l6 3" strokeLinecap="round"/><circle cx="12" cy="12" r="9"/></svg>
              Réponses (RSVP)
            </div>
            <div className="rsvp-overview-wrap">
              <div className="donut-chart"
                style={{ "--att": `${attDeg}deg`, "--pen": `${penDeg}deg` } as React.CSSProperties}>
                <div className="d-center">
                  <span className="dn">{total}</span>
                  <span className="dl">Invités</span>
                </div>
              </div>
              <div className="rsvp-lgnd">
                {[
                  { label: "Présents", n: attending, color: "var(--accent)" },
                  { label: "En attente", n: pending, color: "var(--text-soft)" },
                  { label: "Absents", n: declined, color: "var(--text-faint)" },
                ].map(r => (
                  <div key={r.label} className="leg-r">
                    <span className="dot-sq" style={{ background: r.color }} />
                    <span className="lbl">{r.label}</span>
                    <span className="val">{r.n}</span>
                    <span className="pct">{total > 0 ? Math.round(r.n/total*100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rsvp-foot-row">
              <span className="arr-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                <b>{checkedIn}</b>&nbsp;arrivés
              </span>
              <span className="rate-txt">Taux de réponse {responseRate}%</span>
            </div>
          </div>

          {/* Stats cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { n: attendRate + "%", label: "Taux de présence", color: "var(--gold-vivid)" },
              { n: attending, label: "Présents confirmés", color: "var(--gold)" },
              { n: invitation._count.views, label: "Vues de l'invitation", color: "var(--text-soft)" },
            ].map(s => (
              <div key={s.label} style={{ border: "1px solid var(--hair)", borderRadius: 12, padding: "1rem 1.2rem",
                background: "linear-gradient(160deg, var(--bg-raise), var(--bg))",
                display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-faint)" }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "var(--font-title)", fontSize: "1.6rem", color: s.color, lineHeight: 1 }}>
                  {s.n}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guest table */}
        {total > 0 && (
          <div className="guests-panel-v2">
            <div className="gp-head">
              <span className="gp-t">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-3.3 3-5 6-5s6 1.7 6 5"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6"/><path d="M18 15c2.3.5 4 2.2 4 5"/></svg>
                Invités <span className="gcount">· {total}</span>
              </span>
            </div>
            <div className="gtable-v2">
              <div className="grow-v2 ghead">
                <span>Invité</span><span>Statut</span><span>Nb.</span><span>Message</span><span>Arrivée</span><span></span>
              </div>
              {invitation.guests.map((g, i) => {
                const b = BADGE_MAP[g.status] ?? BADGE_MAP.pending;
                return (
                  <div key={i} className="grow-v2">
                    <div className="g-nm">
                      <div className="g-n">{g.name}</div>
                    </div>
                    <div>
                      <span className={`gbadge-v2 ${g.status}`}>
                        <span className="gbd" />
                        {b.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: "1rem", color: "var(--text-soft)" }}>
                      {g.status === "attending" ? g.partySize : "—"}
                    </div>
                    <div className={`g-msg-v2${g.message ? "" : " empty"}`}>
                      {g.message || "—"}
                    </div>
                    <div className={`g-arr-v2${g.checkedInAt ? "" : " no"}`}>
                      {g.checkedInAt ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                          {new Date(g.checkedInAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </>
                      ) : "—"}
                    </div>
                    <div />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {total === 0 && (
          <div style={{ border: "1px dashed var(--hair-strong)", borderRadius: 16, padding: "3rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-title)", fontSize: 14, color: "var(--text-faint)" }}>
              Aucun invité pour l&apos;instant — les confirmations apparaîtront ici.
            </p>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", paddingTop: "3rem" }}>
        <p style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--text-faint)" }}>
          Propulsé par <a href={baseUrl} style={{ color: "var(--gold)", textDecoration: "none" }}>Invytek</a>
        </p>
      </div>
    </div>
  );
}
