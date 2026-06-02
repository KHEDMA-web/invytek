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
    showQrCode: false,
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

  // Demo guests with unique tokens
  const demoGuests = [
    { name: "Ahmed Benali",    contact: "ahmed@example.com",  token: "demo-tk-ahmed"   },
    { name: "Fatima Cherif",   contact: "fatima@example.com", token: "demo-tk-fatima"  },
    { name: "Karim Meziane",   contact: "karim@example.com",  token: "demo-tk-karim"   },
  ];

  const inv = await prisma.invitation.findUnique({ where: { slug: "demo-mariage-2026" } });
  if (inv) {
    for (const g of demoGuests) {
      await prisma.guest.upsert({
        where: { token: g.token },
        update: { name: g.name, contact: g.contact },
        create: { invitationId: inv.id, name: g.name, contact: g.contact, token: g.token },
      });
    }
  }

  console.log("Seed done — invitation: /i/demo-mariage-2026");
  console.log("Demo guest links:");
  demoGuests.forEach(g =>
    console.log(`  /i/demo-mariage-2026/g/${g.token}  — ${g.name}`)
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
