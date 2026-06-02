import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { config } from "dotenv";
import type { WeddingContent, WeddingOptions } from "../lib/schemas/wedding";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@invytek.com" },
    update: {},
    create: { email: "demo@invytek.com", name: "Demo User" },
  });

  await prisma.theme.upsert({
    where: { slug: "gold-arch" },
    update: {},
    create: {
      category: "wedding",
      name: "Or & Arche",
      slug: "gold-arch",
      isPremium: false,
      config: JSON.stringify({ shape: "arch", opening: "envelope" }),
    },
  });

  const content: WeddingContent = {
    hosts: "M. & Mme DUPONT",
    invitationLine: "ont l'immense plaisir de vous convier à la cérémonie de mariage de leur fils",
    names: ["Adam", "Sara"],
    namesSeparator: "avec",
    bismillah: true,
    verse: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجاً لِتَسْكُنُوا إِلَيْهَا",
    date: "2026-09-05",
    time: "15:00",
    dayLabel: "Samedi",
    venue: "Salle de réception Al Baraka",
    venueSub: "Alger Centre",
    mapsUrl: undefined,
    note: "Merci d'éviter les prises de photo des mariés.",
    closing: "Soyez les Bienvenus",
    initials: ["A", "S"],
  };

  const options: WeddingOptions = {
    showCountdown: true,
    showRsvp: true,
    showArabic: true,
    showNote: true,
  };

  await prisma.invitation.upsert({
    where: { slug: "demo-mariage-2026" },
    update: { content: JSON.stringify(content), options: JSON.stringify(options) },
    create: {
      userId: user.id,
      slug: "demo-mariage-2026",
      category: "wedding",
      themeId: "gold-arch",
      status: "published",
      content: JSON.stringify(content),
      options: JSON.stringify(options),
      publishedAt: new Date(),
    },
  });

  console.log("Seed done — invitation: /i/demo-mariage-2026");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
