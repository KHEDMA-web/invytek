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
import { PublicRsvpForm } from "@/components/PublicRsvpForm";

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
  const rsvp = options.showRsvp !== false && <PublicRsvpForm invitationId={invitation.id} />;
  const custom = options.customizations;
  const styleTag = custom && Object.keys(custom).length > 0
    ? <style>{`:root{${Object.entries(custom).map(([k, v]) => `${k}:${v}!important`).join(';')}}`}</style>
    : null;

  if (theme.slug === "gold-arch")        return <>{styleTag}{<GoldArchTheme {...props} />}{rsvp}</>;
  if (theme.slug === "bordeaux-oval")    return <>{styleTag}{<BordeauxOvalTheme {...props} />}{rsvp}</>;
  if (theme.slug === "ivoire-minimal")   return <>{styleTag}{<IvoireMinimalTheme {...props} />}{rsvp}</>;
  if (theme.slug === "confettis-or")     return <>{styleTag}{<ConfettisOrTheme {...props} />}{rsvp}</>;
  if (theme.slug === "soiree-prestige")  return <>{styleTag}{<SoireePrestigeTheme {...props} />}{rsvp}</>;
  if (theme.slug === "blouse-lys")       return <>{styleTag}{<BlouseLysTheme {...props} />}{rsvp}</>;
  if (theme.slug === "anniv-neon")       return <>{styleTag}{<AnnivNeonTheme {...props} />}{rsvp}</>;
  if (theme.slug === "baby-shower")      return <>{styleTag}{<BabyShowerTheme {...props} />}{rsvp}</>;
  if (theme.slug === "conference-tech")  return <>{styleTag}{<ConferenceTechTheme {...props} />}{rsvp}</>;
  if (theme.slug === "congres-medical")  return <>{styleTag}{<CongresMedicalTheme {...props} />}{rsvp}</>;
  if (theme.slug === "inauguration")     return <>{styleTag}{<InaugurationTheme {...props} />}{rsvp}</>;
  if (theme.slug === "sensibilisation")  return <>{styleTag}{<SensibilisationTheme {...props} />}{rsvp}</>;

  notFound();
}
