import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";
import { EditInvitationForm } from "@/components/EditInvitationForm";

interface Props { params: Promise<{ id: string }> }

export default async function EditPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id, userId: session.user.id } });
  if (!invitation) notFound();

  const content = JSON.parse(invitation.content) as WeddingContent;
  const options = JSON.parse(invitation.options) as Partial<WeddingOptions>;

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh", paddingBottom: "4rem" }}>
      <Nav />
      <div className="wrap" style={{ paddingTop: 120, maxWidth: 720 }}>
        <a href={`/dashboard/${id}`} style={{ fontFamily: "var(--font-title)", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", textDecoration: "none" }}>
          ← Retour
        </a>
        <h1 style={{ fontFamily: "var(--font-script)", fontSize: "clamp(2rem,6vw,3rem)", color: "var(--ivory)", lineHeight: 1, margin: "1rem 0 2rem" }}>
          Modifier l&apos;invitation
        </h1>
        <EditInvitationForm invitationId={id} content={content} options={options} />
      </div>
    </div>
  );
}
