import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const revalidate = 60;
import { GuestQrCode } from "@/components/GuestQrCode";
import GoldArchTheme from "@/themes/wedding/gold-arch/Theme";
import BordeauxOvalTheme from "@/themes/wedding/bordeaux-oval/Theme";
import IvoireMinimalTheme from "@/themes/wedding/ivoire-minimal/Theme";
import CouronneRoyaleTheme from "@/themes/wedding/couronne-royale/Theme";
import GlycineBleueTheme from "@/themes/wedding/glycine-bleue/Theme";
import RosePoudreTheme from "@/themes/wedding/rose-poudre/Theme";
import IvoireEmbosseTheme from "@/themes/wedding/ivoire-embosse/Theme";
import SceauDeRoseTheme from "@/themes/wedding/sceau-de-rose/Theme";
import ConfettisOrTheme from "@/themes/anniversary/confettis-or/Theme";
import SoireePrestigeTheme from "@/themes/business/soiree-prestige/Theme";
import BordeauxImperialTheme from "@/themes/business/bordeaux-imperial/Theme";
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

interface Props { params: Promise<{ slug: string; token: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug, token } = await params;
  const guest = await prisma.guest.findUnique({ where: { token }, include: { invitation: true } });
  if (!guest || guest.invitation.slug !== slug) return { title: "Invitation" };
  const content = JSON.parse(guest.invitation.content) as WeddingContent;
  return { title: `${content.names[0]} — Invitation de ${guest.name}` };
}

export default async function GuestInvitationPage({ params }: Props) {
  const { slug, token } = await params;
  const guest = await prisma.guest.findUnique({ where: { token }, include: { invitation: true } });

  if (!guest || guest.invitation.slug !== slug || guest.invitation.status !== "published") notFound();

  const options = JSON.parse(guest.invitation.options) as Partial<WeddingOptions> & { layoutSpec?: DynamicThemeSpec };
  const id = guest.invitation.themeId;

  // Thème dynamique IA
  if (id === "dynamic" && options.layoutSpec) {
    return <DynamicTheme spec={options.layoutSpec} invitationId={guest.invitation.id} guestName={guest.name} guestToken={token} alreadyResponded={guest.status !== "pending"} />;
  }

  const content = JSON.parse(guest.invitation.content) as WeddingContent;
  const p = { content, options, invitationId: guest.invitation.id, guestName: guest.name, guestToken: token, alreadyResponded: guest.status !== "pending" };

  const showQr = (p.options as { showQrCode?: boolean })?.showQrCode !== false;
  const lightThemes = new Set(["baby-shower", "congres-medical", "inauguration", "sensibilisation", "glycine-bleue", "rose-poudre", "ivoire-embosse"]);
  const qr = showQr ? <GuestQrCode dark={!lightThemes.has(id)} /> : null;
  const custom = options.customizations;
  const styleTag = custom && Object.keys(custom).length > 0
    ? <style>{`:root{${Object.entries(custom).map(([k, v]) => `${k}:${v}!important`).join(';')}}`}</style>
    : null;

  if (id === "gold-arch")          return <>{styleTag}{<GoldArchTheme {...p} />}{qr}</>;
  if (id === "bordeaux-oval")      return <>{styleTag}{<BordeauxOvalTheme {...p} />}{qr}</>;
  if (id === "ivoire-minimal")     return <>{styleTag}{<IvoireMinimalTheme {...p} />}{qr}</>;
  if (id === "couronne-royale")    return <>{styleTag}{<CouronneRoyaleTheme {...p} />}{qr}</>;
  if (id === "glycine-bleue")      return <>{styleTag}{<GlycineBleueTheme {...p} />}{qr}</>;
  if (id === "rose-poudre")        return <>{styleTag}{<RosePoudreTheme {...p} />}{qr}</>;
  if (id === "ivoire-embosse")     return <>{styleTag}{<IvoireEmbosseTheme {...p} />}{qr}</>;
  if (id === "sceau-de-rose")      return <>{styleTag}{<SceauDeRoseTheme {...p} />}{qr}</>;
  if (id === "confettis-or")       return <>{styleTag}{<ConfettisOrTheme {...p} />}{qr}</>;
  if (id === "soiree-prestige")    return <>{styleTag}{<SoireePrestigeTheme {...p} />}{qr}</>;
  if (id === "bordeaux-imperial")  return <>{styleTag}{<BordeauxImperialTheme {...p} />}{qr}</>;
  if (id === "blouse-lys")         return <>{styleTag}{<BlouseLysTheme {...p} />}{qr}</>;
  if (id === "anniv-neon")         return <>{styleTag}{<AnnivNeonTheme {...p} />}{qr}</>;
  if (id === "baby-shower")        return <>{styleTag}{<BabyShowerTheme {...p} />}{qr}</>;
  if (id === "conference-tech")    return <>{styleTag}{<ConferenceTechTheme {...p} />}{qr}</>;
  if (id === "congres-medical")    return <>{styleTag}{<CongresMedicalTheme {...p} />}{qr}</>;
  if (id === "inauguration")       return <>{styleTag}{<InaugurationTheme {...p} />}{qr}</>;
  if (id === "sensibilisation")    return <>{styleTag}{<SensibilisationTheme {...p} />}{qr}</>;

  notFound();
}
