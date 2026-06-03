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

  const attending  = invitation.guests.filter(g => g.status === "attending").length;
  const declined   = invitation.guests.filter(g => g.status === "declined").length;
  const pending    = invitation.guests.filter(g => g.status === "pending").length;
  const checkedIn  = invitation.guests.filter(g => g.checkedInAt !== null).length;

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh", paddingBottom: "4rem" }}>
      <Nav />
      <div className="wrap" style={{ paddingTop: 120, maxWidth: 900 }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <Link href="/dashboard" style={{ fontFamily: "var(--font-title)", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", textDecoration: "none" }}>
              ← Tableau de bord
            </Link>
            <h1 style={{ fontFamily: "var(--font-script)", fontSize: "clamp(2rem,6vw,3.5rem)", color: "var(--ivory)", lineHeight: 1, marginTop: "1rem" }}>
              {content.names[0]} &amp; {content.names[1]}
            </h1>
            <p style={{ color: "var(--text-soft)", marginTop: 6 }}>
              {new Date(content.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {content.venue}
            </p>
          </div>
          <DeleteInvitationButton invitationId={invitation.id} />
        </div>

        {/* Lien public */}
        <div style={{ background: "rgba(184,146,60,0.06)", border: "1px solid var(--hair)", borderRadius: 10, padding: "1.2rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 4 }}>Lien public</div>
            <a href={invUrl} target="_blank" style={{ fontFamily: "var(--font-title)", fontSize: 14, color: "var(--gold)", textDecoration: "none" }}>{invUrl}</a>
          </div>
          <CopyLinkButton url={invUrl} />
        </div>

        {/* Stats */}
        <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12, marginBottom: "2rem" }}>
          {[
            { n: attending, label: "Présents",    color: "var(--gold)" },
            { n: declined,  label: "Absents",     color: "var(--text-faint)" },
            { n: pending,   label: "En attente",  color: "var(--text-soft)" },
            { n: checkedIn, label: "Arrivés ✓",   color: "#6ecf8a" },
          ].map(s => (
            <div key={s.label} style={{ border: "1px solid var(--hair)", borderRadius: 10, padding: "1.2rem", textAlign: "center", background: "rgba(184,146,60,0.03)" }}>
              <div style={{ fontFamily: "var(--font-title)", fontSize: "2.2rem", color: s.color, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-faint)", marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Options & actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "2rem", alignItems: "center" }}>
          <Link href={`/i/${invitation.slug}`} target="_blank" className="btn btn-ghost btn-sm">
            Voir l&apos;invitation
          </Link>
          <Link href={`/dashboard/${invitation.id}/edit`} className="btn btn-ghost btn-sm">
            Modifier
          </Link>
          <Link href="/checkin" className="btn btn-ghost btn-sm">
            Scanner les entrées →
          </Link>
          <QrCodeToggle invitationId={invitation.id} currentOptions={options} />
        </div>

        <div className="dash-manage-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24, alignItems: "start" }}>

          {/* Ajouter un invité */}
          <div style={{ border: "1px solid var(--hair)", borderRadius: 12, padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", color: "var(--ivory)", fontWeight: 400, marginBottom: "1.2rem" }}>
              Ajouter un invité
            </h2>
            <AddGuestForm invitationId={invitation.id} />
          </div>

          {/* Liste invités */}
          <div style={{ border: "1px solid var(--hair)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "1.2rem 1.4rem", borderBottom: "1px solid var(--hair)" }}>
              <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", color: "var(--ivory)", fontWeight: 400 }}>
                Invités ({invitation.guests.length})
              </h2>
            </div>
            {invitation.guests.length === 0 ? (
              <p style={{ padding: "2rem", color: "var(--text-faint)", textAlign: "center", fontSize: "0.9rem" }}>
                Aucun invité ajouté. Ajoutez-en pour envoyer des liens personnalisés.
              </p>
            ) : (
              <div style={{ maxHeight: 500, overflowY: "auto" }}>
                {invitation.guests.map(g => (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.9rem 1.4rem", borderBottom: "1px solid var(--hair)", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-title)", fontSize: 15, color: "var(--ivory)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</div>
                      {g.contact && <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>{g.contact}</div>}
                      {g.checkedInAt && <div style={{ fontSize: 11, color: "#6ecf8a", marginTop: 2 }}>Arrivé {new Date(g.checkedInAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>}
                    </div>
                    <StatusBadge status={g.status} />
                    <CopyLinkButton url={`${baseUrl}/i/${invitation.slug}/g/${g.token}`} label="Copier" small />
                    <WhatsAppButton url={`${baseUrl}/i/${invitation.slug}/g/${g.token}`} guestName={g.name} small />
                    <EmailButton url={`${baseUrl}/i/${invitation.slug}/g/${g.token}`} guestName={g.name} contactEmail={g.contact?.includes("@") ? g.contact : undefined} small />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    attending:   { label: "Présent ✓",   color: "var(--gold)" },
    declined:    { label: "Absent",       color: "var(--text-faint)" },
    pending:     { label: "En attente",   color: "var(--text-soft)" },
    checked_in:  { label: "Arrivé ✓",    color: "#6ecf8a" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: s.color, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}
