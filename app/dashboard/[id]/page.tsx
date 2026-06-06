import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";
import { AddGuestForm } from "@/components/AddGuestForm";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { QrCodeToggle } from "@/components/QrCodeToggle";
import { DeleteInvitationButton } from "@/components/DeleteInvitationButton";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { EmailButton } from "@/components/EmailButton";
import { ShareWithClientButton } from "@/components/ShareWithClientButton";

const CAT_MAP: Record<string, string> = {
  "gold-arch": "Mariage", "bordeaux-oval": "Mariage · RTL", "ivoire-minimal": "Mariage",
  "confettis-or": "Anniversaire", "anniv-neon": "Anniversaire", "baby-shower": "Bébé",
  "soiree-prestige": "Business", "conference-tech": "Business", "inauguration": "Business",
  "blouse-lys": "Médical", "congres-medical": "Médical", "sensibilisation": "Médical",
  "dynamic": "IA",
};
const THEME_NAMES: Record<string, string> = {
  "gold-arch": "Or & Arche", "bordeaux-oval": "Bordeaux & Ovale", "ivoire-minimal": "Ivoire Minimal",
  "confettis-or": "Confettis d'Or", "anniv-neon": "Neon Burst", "baby-shower": "Baby Shower",
  "soiree-prestige": "Soirée Prestige", "conference-tech": "Conférence Tech", "inauguration": "Inauguration",
  "blouse-lys": "Blouse & Lys", "congres-medical": "Congrès Médical", "sensibilisation": "Sensibilisation",
  "dynamic": "Thème IA",
};
const STATUS_LABELS: Record<string, string> = {
  published: "Publié", draft: "Brouillon", archived: "Archivé",
};
const GUEST_LABELS: Record<string, string> = {
  attending: "Présent", declined: "Absent", pending: "En attente",
};

interface Props { params: Promise<{ id: string }> }

export default async function ManagePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { id, userId: session.user.id },
    include: { guests: { orderBy: { respondedAt: { sort: "desc", nulls: "last" } } } },
  });
  if (!invitation) notFound();

  const content = JSON.parse(invitation.content) as WeddingContent;
  const options = JSON.parse(invitation.options) as Partial<WeddingOptions>;

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const invUrl = `${baseUrl}/i/${invitation.slug}`;

  const attending = invitation.guests.filter(g => g.status === "attending").length;
  const declined  = invitation.guests.filter(g => g.status === "declined").length;
  const pending   = invitation.guests.filter(g => g.status === "pending").length;
  const checkedIn = invitation.guests.filter(g => g.checkedInAt !== null).length;
  const total = invitation.guests.length;

  const attDeg = total > 0 ? (attending / total * 360).toFixed(1) : "0";
  const penDeg = total > 0 ? ((attending + pending) / total * 360).toFixed(1) : "0";
  const responseRate = total > 0 ? Math.round((attending + declined) / total * 100) : 0;

  const cat = CAT_MAP[invitation.themeId] ?? "Invitation";
  const themeName = THEME_NAMES[invitation.themeId] ?? invitation.themeId;
  const isWedding = cat === "Mariage" || cat === "Mariage · RTL";
  const eventTitle = isWedding
    ? `${content.names[0]} & ${content.names[1]}`
    : content.names[0];

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh", background: "radial-gradient(120% 55% at 50% -10%, rgba(184,146,60,0.07), transparent 55%), var(--bg)" }}>
      <Nav />
      <div className="dd-shell" style={{ paddingTop: 90 }}>

        {/* Back */}
        <Link href="/dashboard" className="dd-back-lnk">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Tableau de bord
        </Link>

        {/* Head */}
        <div className="dd-head-v2">
          <div>
            <div className="h-cat">{cat} · {themeName}</div>
            <h1>
              {eventTitle}
              <span className={`dd-status-v2 ${invitation.status}`}>
                {STATUS_LABELS[invitation.status] ?? invitation.status}
              </span>
            </h1>
            <div className="dd-slug-v2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>
              <a href={invUrl} target="_blank" rel="noreferrer">invytek.app/i/{invitation.slug}</a>
            </div>
          </div>
          <DeleteInvitationButton invitationId={invitation.id} />
        </div>

        {/* Action pills */}
        <div className="dd-actions-row">
          <Link href={`/i/${invitation.slug}`} target="_blank" className="pill-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
            Voir l&apos;invitation
          </Link>
          <Link href={`/dashboard/${invitation.id}/edit`} className="pill-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
            Modifier
          </Link>
          <ShareWithClientButton
            invitationId={invitation.id}
            initialToken={invitation.clientAccessToken ?? null}
            initialClientName={invitation.clientName ?? null}
            initialClientEmail={invitation.clientEmail ?? null}
            baseUrl={baseUrl}
            eventTitle={eventTitle}
          />
          <Link href="/checkin" className="pill-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2"/><path d="M4 12h16"/></svg>
            Scanner les entrées
          </Link>
          <a href={`/api/invitations/${invitation.id}/export`} download className="pill-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 11l5 4 5-4M4 21h16"/></svg>
            Export CSV
          </a>
          <QrCodeToggle invitationId={invitation.id} currentOptions={options} />
        </div>

        {/* Top grid: RSVP donut + client portal */}
        <div className="dd-top-grid">

          {/* RSVP donut */}
          <div className="panel-v2">
            <div className="p-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3v9l6 3" strokeLinecap="round"/><circle cx="12" cy="12" r="9"/></svg>
              Réponses (RSVP)
            </div>
            <div className="rsvp-overview-wrap">
              <div
                className="donut-chart"
                style={{ "--att": `${attDeg}deg`, "--pen": `${penDeg}deg` } as React.CSSProperties}
              >
                <div className="d-center">
                  <span className="dn">{total}</span>
                  <span className="dl">Invités</span>
                </div>
              </div>
              <div className="rsvp-lgnd">
                <div className="leg-r">
                  <span className="dot-sq" style={{ background: "var(--accent)" }} />
                  <span className="lbl">Présents</span>
                  <span className="val">{attending}</span>
                  <span className="pct">{total > 0 ? Math.round(attending/total*100) : 0}%</span>
                </div>
                <div className="leg-r">
                  <span className="dot-sq" style={{ background: "var(--text-soft)" }} />
                  <span className="lbl">En attente</span>
                  <span className="val">{pending}</span>
                  <span className="pct">{total > 0 ? Math.round(pending/total*100) : 0}%</span>
                </div>
                <div className="leg-r">
                  <span className="dot-sq" style={{ background: "var(--text-faint)" }} />
                  <span className="lbl">Absents</span>
                  <span className="val">{declined}</span>
                  <span className="pct">{total > 0 ? Math.round(declined/total*100) : 0}%</span>
                </div>
              </div>
            </div>
            <div className="rsvp-foot-row">
              <span className="arr-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                <b>{checkedIn}</b>&nbsp;arrivés à l&apos;entrée
              </span>
              <span className="rate-txt">Taux de réponse {responseRate}%</span>
            </div>
          </div>

          {/* Client portal */}
          <div className="panel-v2 client-card">
            <div className="p-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-3.3 3-5 6-5s6 1.7 6 5"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6"/></svg>
              Espace client
            </div>
            <p className="cc-desc">Partagez un portail privé (sans connexion) où votre client suit les confirmations en temps réel.</p>
            {invitation.clientName && (
              <div className="cc-row">
                <div className="av">{(invitation.clientName[0] ?? "C").toUpperCase()}</div>
                <div className="who">
                  <div className="nm-cc">{invitation.clientName}</div>
                  {invitation.clientEmail && <div className="em-cc">{invitation.clientEmail}</div>}
                </div>
              </div>
            )}
            {invitation.clientAccessToken && (
              <div className="cc-link">
                <span className="u-cc">{baseUrl}/client/{invitation.clientAccessToken}</span>
                <CopyLinkButton url={`${baseUrl}/client/${invitation.clientAccessToken}`} label="Copier" small />
              </div>
            )}
            <ShareWithClientButton
              invitationId={invitation.id}
              initialToken={invitation.clientAccessToken ?? null}
              initialClientName={invitation.clientName ?? null}
              initialClientEmail={invitation.clientEmail ?? null}
              baseUrl={baseUrl}
              eventTitle={eventTitle}
            />
          </div>
        </div>

        {/* Guests panel */}
        <div className="guests-panel-v2">
          <div className="gp-head">
            <span className="gp-t">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-3.3 3-5 6-5s6 1.7 6 5"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6"/><path d="M18 15c2.3.5 4 2.2 4 5"/></svg>
              Invités <span className="gcount">· {invitation.guests.length}</span>
            </span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <AddGuestForm invitationId={invitation.id} />
            </div>
          </div>

          {invitation.guests.length === 0 ? (
            <p style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-faint)", fontFamily: "var(--font-body)", fontSize: "1rem" }}>
              Aucun invité ajouté — utilisez le formulaire ci-dessus pour envoyer des liens personnalisés.
            </p>
          ) : (
            <div className="gtable-v2">
              <div className="grow-v2 ghead">
                <span>Invité</span>
                <span>Statut</span>
                <span>Nb.</span>
                <span>Message</span>
                <span>Arrivée</span>
                <span></span>
              </div>
              {invitation.guests.map(g => (
                <div key={g.id} className="grow-v2">
                  <div className="g-nm">
                    <div className="g-n">{g.name}</div>
                    {g.contact && <div className="g-c">{g.contact}</div>}
                  </div>
                  <div>
                    <span className={`gbadge-v2 ${g.status}`}>
                      <span className="gbd" />
                      {GUEST_LABELS[g.status] ?? g.status}
                    </span>
                  </div>
                  <div style={{ fontFamily: "var(--font-title)", fontSize: "1.05rem", color: "var(--text-soft)" }}>
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
                  <div className="g-acts-v2">
                    <CopyLinkButton url={`${baseUrl}/i/${invitation.slug}/g/${g.token}`} label="" small />
                    <WhatsAppButton url={`${baseUrl}/i/${invitation.slug}/g/${g.token}`} guestName={g.name} small />
                    <EmailButton url={`${baseUrl}/i/${invitation.slug}/g/${g.token}`} guestName={g.name} contactEmail={g.contact?.includes("@") ? g.contact : undefined} small />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
