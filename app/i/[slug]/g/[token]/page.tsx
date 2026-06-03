import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
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

  const content = JSON.parse(guest.invitation.content) as WeddingContent;
  const options = JSON.parse(guest.invitation.options) as Partial<WeddingOptions>;
  const p = { content, options, invitationId: guest.invitation.id, guestName: guest.name, guestToken: token, alreadyResponded: guest.status !== "pending" };
  const id = guest.invitation.themeId;

  if (id === "gold-arch")        return <GoldArchTheme {...p} />;
  if (id === "bordeaux-oval")    return <BordeauxOvalTheme {...p} />;
  if (id === "ivoire-minimal")   return <IvoireMinimalTheme {...p} />;
  if (id === "confettis-or")     return <ConfettisOrTheme {...p} />;
  if (id === "soiree-prestige")  return <SoireePrestigeTheme {...p} />;
  if (id === "blouse-lys")       return <BlouseLysTheme {...p} />;
  if (id === "anniv-neon")       return <AnnivNeonTheme {...p} />;
  if (id === "baby-shower")      return <BabyShowerTheme {...p} />;
  if (id === "conference-tech")  return <ConferenceTechTheme {...p} />;
  if (id === "congres-medical")  return <CongresMedicalTheme {...p} />;
  if (id === "inauguration")     return <InaugurationTheme {...p} />;
  if (id === "sensibilisation")  return <SensibilisationTheme {...p} />;

  notFound();
}
