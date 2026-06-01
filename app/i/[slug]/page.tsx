import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getTheme } from "@/themes/registry";
import GoldArchTheme from "@/themes/wedding/gold-arch/Theme";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug, status: "published" },
  });
  if (!invitation) return { title: "Invitation" };
  const content = JSON.parse(invitation.content) as WeddingContent;
  return {
    title: `${content.names[0]} & ${content.names[1]} — ${new Date(content.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`,
    description: content.invitationLine,
  };
}

export default async function InvitationPage({ params }: Props) {
  const { slug } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { slug, status: "published" },
  });

  if (!invitation) notFound();

  const theme = getTheme(invitation.themeId);
  if (!theme) notFound();

  const content = JSON.parse(invitation.content);
  const options = JSON.parse(invitation.options);

  if (theme.slug === "gold-arch") {
    return (
      <GoldArchTheme
        content={content as WeddingContent}
        options={options as Partial<WeddingOptions>}
        invitationId={invitation.id}
      />
    );
  }

  notFound();
}
