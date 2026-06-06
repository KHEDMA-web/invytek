import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";
import { EditInvitationForm } from "@/components/EditInvitationForm";

interface Props { params: Promise<{ id: string }> }

export default async function EditPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth");

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!dbUser) redirect("/auth");

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id, userId: dbUser.id } });
  if (!invitation) notFound();

  const content = JSON.parse(invitation.content) as WeddingContent;
  const options = JSON.parse(invitation.options) as Partial<WeddingOptions>;

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh", background: "radial-gradient(120% 55% at 50% -10%, rgba(184,146,60,0.07), transparent 55%), var(--bg)" }}>
      <Nav />
      <div className="dd-shell" style={{ paddingTop: 90, maxWidth: 760 }}>

        {/* Back */}
        <Link href={`/dashboard/${id}`} className="dd-back-lnk">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Retour à la gestion
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".26em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
            Modifier
          </div>
          <h1 style={{ fontFamily: "var(--font-script)", fontSize: "clamp(2rem,5vw,2.8rem)", color: "var(--ivory)", lineHeight: 1, fontWeight: 400 }}>
            {content.names[0]} &amp; {content.names[1]}
          </h1>
          <p style={{ color: "var(--text-soft)", marginTop: 8, fontSize: "1rem" }}>
            Modifiez le contenu de votre invitation — les changements sont visibles immédiatement.
          </p>
        </div>

        {/* Form card */}
        <div style={{
          border: "1px solid var(--hair)", borderRadius: 16,
          background: "linear-gradient(160deg, var(--bg-raise), var(--bg))",
          padding: "clamp(1.4rem, 4vw, 2rem)",
        }}>
          <EditInvitationForm invitationId={id} content={content} options={options} />
        </div>
      </div>
    </div>
  );
}
