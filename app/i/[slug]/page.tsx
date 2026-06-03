import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getTheme } from "@/themes/registry";
import GoldArchTheme from "@/themes/wedding/gold-arch/Theme";
import BordeauxOvalTheme from "@/themes/wedding/bordeaux-oval/Theme";
import IvoireMinimalTheme from "@/themes/wedding/ivoire-minimal/Theme";
import ConfettisOrTheme from "@/themes/anniversary/confettis-or/Theme";
import SoireePrestigeTheme from "@/themes/business/soiree-prestige/Theme";
import BlouseLysTheme from "@/themes/medical/blouse-lys/Theme";
import AnnivNeonTheme from "@/themes/anniversary/anniv-neon/Theme";
import BabyShowerTheme from "@/themes/baby/baby-shower/Theme";
import ConferenceTechTheme from "@/themes/business/conference-tech/Theme";
import CongresMedicalTheme from "@/themes/medical/congres-medical/Theme";
import InaugurationTheme from "@/themes/business/inauguration/Theme";
import SensibilisationTheme from "@/themes/medical/sensibilisation/Theme";
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

  void prisma.invitationView.create({ data: { invitationId: invitation.id } });

  const content = JSON.parse(invitation.content) as WeddingContent;
  const options = JSON.parse(invitation.options) as Partial<WeddingOptions>;

  const props = { content, options, invitationId: invitation.id };

  if (theme.slug === "gold-arch")        return <GoldArchTheme {...props} />;
  if (theme.slug === "bordeaux-oval")    return <BordeauxOvalTheme {...props} />;
  if (theme.slug === "ivoire-minimal")   return <IvoireMinimalTheme {...props} />;
  if (theme.slug === "confettis-or")     return <ConfettisOrTheme {...props} />;
  if (theme.slug === "soiree-prestige")  return <SoireePrestigeTheme {...props} />;
  if (theme.slug === "blouse-lys")       return <BlouseLysTheme {...props} />;
  if (theme.slug === "anniv-neon")       return <AnnivNeonTheme {...props} />;
  if (theme.slug === "baby-shower")      return <BabyShowerTheme {...props} />;
  if (theme.slug === "conference-tech")  return <ConferenceTechTheme {...props} />;
  if (theme.slug === "congres-medical")  return <CongresMedicalTheme {...props} />;
  if (theme.slug === "inauguration")     return <InaugurationTheme {...props} />;
  if (theme.slug === "sensibilisation")  return <SensibilisationTheme {...props} />;

  notFound();
}
