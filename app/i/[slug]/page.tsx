import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const revalidate = 60;
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
import DynamicTheme from "@/themes/dynamic/DynamicTheme";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";
import type { DynamicThemeSpec } from "@/lib/schemas/dynamicTheme";
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

  void prisma.invitationView.create({ data: { invitationId: invitation.id } });

  const options = JSON.parse(invitation.options) as Partial<WeddingOptions> & { layoutSpec?: DynamicThemeSpec };

  // Thème dynamique IA — vérifier avant getTheme (pas dans le registry)
  if (invitation.themeId === "dynamic") {
    if (!options.layoutSpec) notFound();
    return <DynamicTheme spec={options.layoutSpec as DynamicThemeSpec} invitationId={invitation.id} />;
  }

  const theme = getTheme(invitation.themeId);
  if (!theme) notFound();

  const content = JSON.parse(invitation.content) as WeddingContent;
  const props = { content, options, invitationId: invitation.id };
  const custom = options.customizations;
  const styleTag = custom && Object.keys(custom).length > 0
    ? <style>{`:root{${Object.entries(custom).map(([k, v]) => `${k}:${v}!important`).join(';')}}`}</style>
    : null;

  if (theme.slug === "gold-arch")        return <>{styleTag}<GoldArchTheme {...props} /></>;
  if (theme.slug === "bordeaux-oval")    return <>{styleTag}<BordeauxOvalTheme {...props} /></>;
  if (theme.slug === "ivoire-minimal")   return <>{styleTag}<IvoireMinimalTheme {...props} /></>;
  if (theme.slug === "confettis-or")     return <>{styleTag}<ConfettisOrTheme {...props} /></>;
  if (theme.slug === "soiree-prestige")  return <>{styleTag}<SoireePrestigeTheme {...props} /></>;
  if (theme.slug === "blouse-lys")       return <>{styleTag}<BlouseLysTheme {...props} /></>;
  if (theme.slug === "anniv-neon")       return <>{styleTag}<AnnivNeonTheme {...props} /></>;
  if (theme.slug === "baby-shower")      return <>{styleTag}<BabyShowerTheme {...props} /></>;
  if (theme.slug === "conference-tech")  return <>{styleTag}<ConferenceTechTheme {...props} /></>;
  if (theme.slug === "congres-medical")  return <>{styleTag}<CongresMedicalTheme {...props} /></>;
  if (theme.slug === "inauguration")     return <>{styleTag}<InaugurationTheme {...props} /></>;
  if (theme.slug === "sensibilisation")  return <>{styleTag}<SensibilisationTheme {...props} /></>;

  notFound();
}
