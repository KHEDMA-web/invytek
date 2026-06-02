import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getTheme } from "@/themes/registry";
import GoldArchTheme from "@/themes/wedding/gold-arch/Theme";
import BordeauxOvalTheme from "@/themes/wedding/bordeaux-oval/Theme";
import IvoireMinimalTheme from "@/themes/wedding/ivoire-minimal/Theme";
import ConfettisOrTheme from "@/themes/anniversary/confettis-or/Theme";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { slug, status: "published" } });
  if (!invitation) return { title: "Invitation" };
  const content = JSON.parse(invitation.content) as WeddingContent;
  return {
    title: `${content.names[0]} & ${content.names[1]} — ${new Date(content.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`,
    description: content.invitationLine,
  };
}

export default async function InvitationPage({ params }: Props) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { slug, status: "published" } });
  if (!invitation) notFound();

  const theme = getTheme(invitation.themeId);
  if (!theme) notFound();

  const content = JSON.parse(invitation.content) as WeddingContent;
  const options = JSON.parse(invitation.options) as Partial<WeddingOptions>;

  const props = { content, options, invitationId: invitation.id };

  if (theme.slug === "gold-arch")      return <GoldArchTheme {...props} />;
  if (theme.slug === "bordeaux-oval")  return <BordeauxOvalTheme {...props} />;
  if (theme.slug === "ivoire-minimal") return <IvoireMinimalTheme {...props} />;
  if (theme.slug === "confettis-or")   return <ConfettisOrTheme {...props} />;

  notFound();
}
