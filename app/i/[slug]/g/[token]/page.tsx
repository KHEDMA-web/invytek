import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import GoldArchTheme from "@/themes/wedding/gold-arch/Theme";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";

interface Props {
  params: Promise<{ slug: string; token: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug, token } = await params;
  const guest = await prisma.guest.findUnique({
    where: { token },
    include: { invitation: true },
  });
  if (!guest || guest.invitation.slug !== slug) return { title: "Invitation" };
  const content = JSON.parse(guest.invitation.content) as WeddingContent;
  return {
    title: `${content.names[0]} & ${content.names[1]} — Invitation de ${guest.name}`,
  };
}

export default async function GuestInvitationPage({ params }: Props) {
  const { slug, token } = await params;

  const guest = await prisma.guest.findUnique({
    where: { token },
    include: { invitation: true },
  });

  if (
    !guest ||
    guest.invitation.slug !== slug ||
    guest.invitation.status !== "published"
  ) {
    notFound();
  }

  const content = JSON.parse(guest.invitation.content) as WeddingContent;
  const options = JSON.parse(guest.invitation.options) as Partial<WeddingOptions>;

  if (guest.invitation.themeId === "gold-arch") {
    return (
      <GoldArchTheme
        content={content}
        options={options}
        invitationId={guest.invitation.id}
        guestName={guest.name}
        guestToken={token}
        alreadyResponded={guest.status !== "pending"}
      />
    );
  }

  notFound();
}
