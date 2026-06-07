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
import CouronneRoyaleTheme from "@/themes/wedding/couronne-royale/Theme";
import GlycineBleueTheme from "@/themes/wedding/glycine-bleue/Theme";
import RosePoudreTheme from "@/themes/wedding/rose-poudre/Theme";
import BordeauxImperialTheme from "@/themes/business/bordeaux-imperial/Theme";
import IvoireEmbosseTheme from "@/themes/wedding/ivoire-embosse/Theme";
import SceauDeRoseTheme from "@/themes/wedding/sceau-de-rose/Theme";
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
  const logoOverlay = options.logo
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={options.logo} alt="Logo" style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", maxHeight: 54, maxWidth: 140, objectFit: "contain", zIndex: 9999, pointerEvents: "none" }} />
    : null;

  const THEME_NODE: Record<string, React.ReactNode> = {
    "gold-arch":        <GoldArchTheme {...props} />,
    "bordeaux-oval":    <BordeauxOvalTheme {...props} />,
    "ivoire-minimal":   <IvoireMinimalTheme {...props} />,
    "confettis-or":     <ConfettisOrTheme {...props} />,
    "soiree-prestige":  <SoireePrestigeTheme {...props} />,
    "blouse-lys":       <BlouseLysTheme {...props} />,
    "anniv-neon":       <AnnivNeonTheme {...props} />,
    "baby-shower":      <BabyShowerTheme {...props} />,
    "conference-tech":  <ConferenceTechTheme {...props} />,
    "congres-medical":  <CongresMedicalTheme {...props} />,
    "inauguration":     <InaugurationTheme {...props} />,
    "sensibilisation":  <SensibilisationTheme {...props} />,
    "couronne-royale":  <CouronneRoyaleTheme {...props} />,
    "glycine-bleue":    <GlycineBleueTheme {...props} />,
    "rose-poudre":      <RosePoudreTheme {...props} />,
    "bordeaux-imperial":<BordeauxImperialTheme {...props} />,
    "ivoire-embosse":   <IvoireEmbosseTheme {...props} />,
    "sceau-de-rose":    <SceauDeRoseTheme {...props} />,
  };

  const themeNode = THEME_NODE[theme.slug];
  if (!themeNode) notFound();

  return <>{styleTag}{logoOverlay}{themeNode}</>;

  notFound();
}
