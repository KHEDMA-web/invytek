import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Mapping fields → WeddingContent / generic content per theme
function mapFields(theme: string, fields: Record<string, string>) {
  const slugBase = (() => {
    const n1 = fields.name1 || fields.firstname || fields.title || fields.org || "invitation";
    const n2 = fields.name2 || "";
    const year = (fields.date || fields.iso || "").slice(0, 4) || new Date().getFullYear().toString();
    return [n1, n2, year].filter(Boolean).join("-")
      .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      .slice(0, 50);
  })();

  // Parse date from various formats
  const rawDate = fields.date || fields.when || fields.when1 || fields.iso || "";
  const isoDate = (() => {
    if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) return rawDate.slice(0, 10);
    // Try dd/mm/yyyy
    const m = rawDate.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    return new Date().toISOString().slice(0, 10);
  })();

  const time = (() => {
    const t = fields.time || fields.when2 || "";
    const m = t.match(/(\d{1,2})[hH:](\d{2})/);
    if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;
    return "15:00";
  })();

  const dayLabel = (() => {
    try {
      const d = new Date(isoDate + "T12:00:00");
      return ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][d.getDay()];
    } catch { return "Samedi"; }
  })();

  // Wedding themes
  if (theme === "bordeaux-oval" || theme === "ivoire-minimal" || theme === "or-arche") {
    return {
      category: "wedding",
      content: {
        hosts: fields.parents || fields.kicker || "",
        invitationLine: fields.intro || "ont l'immense plaisir de vous convier à la cérémonie de mariage de",
        names: [fields.name1 || "Prénom 1", fields.name2 || "Prénom 2"] as [string, string],
        namesSeparator: "avec",
        bismillah: true,
        date: isoDate,
        time,
        dayLabel,
        venue: fields.venue || "",
        venueSub: fields.city || undefined,
        closing: "Soyez les Bienvenus",
        initials: [
          (fields.name1 || "A")[0]?.toUpperCase() || "A",
          (fields.name2 || "B")[0]?.toUpperCase() || "B",
        ] as [string, string],
      },
      options: { showCountdown: true, showRsvp: true, showArabic: theme !== "ivoire-minimal" },
    };
  }

  // Business themes — store as generic JSON
  if (["soiree-prestige", "conference-tech", "inauguration"].includes(theme)) {
    return {
      category: "business",
      content: {
        hosts: fields.company || fields.org || "",
        invitationLine: fields.eyebrow || fields.kicker || "vous invite à",
        names: [fields.evtitle || fields.title || "Événement", ""] as [string, string],
        namesSeparator: "·",
        bismillah: false,
        date: isoDate,
        time,
        dayLabel,
        venue: fields.venue || fields.where || "",
        venueSub: fields.address || undefined,
        closing: "",
        initials: ["I", "E"] as [string, string],
      },
      options: { showCountdown: true, showRsvp: true, showArabic: false },
    };
  }

  // Medical themes
  if (["blouse-lys", "congres-medical", "sensibilisation"].includes(theme)) {
    return {
      category: "medical",
      content: {
        hosts: fields.org || fields.honor || "",
        invitationLine: fields.kicker || fields.lead || "vous invite à",
        names: [fields.doctor || fields.title || "Dr.", fields.speciality || ""] as [string, string],
        namesSeparator: "·",
        bismillah: false,
        date: isoDate,
        time,
        dayLabel,
        venue: fields.place || fields.venue || fields.where || "",
        venueSub: undefined,
        closing: "",
        initials: ["M", "D"] as [string, string],
      },
      options: { showCountdown: true, showRsvp: true, showArabic: false },
    };
  }

  // Anniversary themes
  if (["confettis-or", "anniv-neon", "baby-shower"].includes(theme)) {
    return {
      category: "birthday",
      content: {
        hosts: fields.parents || "",
        invitationLine: fields.eyebrow || `fête ses ${fields.age || ""} ans`,
        names: [fields.firstname || fields.babyname || "Prénom", fields.age || ""] as [string, string],
        namesSeparator: "·",
        bismillah: false,
        date: isoDate,
        time,
        dayLabel,
        venue: fields.venue || fields.place || fields.where || "",
        venueSub: undefined,
        note: fields.message || undefined,
        closing: "",
        initials: [
          (fields.firstname || fields.babyname || "P")[0]?.toUpperCase() || "P",
          (fields.age || "0")[0] || "0",
        ] as [string, string],
      },
      options: { showCountdown: true, showRsvp: true, showArabic: false },
    };
  }

  // Fallback
  return {
    category: "other",
    content: {
      hosts: "",
      invitationLine: "",
      names: ["", ""] as [string, string],
      namesSeparator: "·",
      bismillah: false,
      date: isoDate,
      time,
      dayLabel,
      venue: fields.venue || "",
      closing: "",
      initials: ["A", "B"] as [string, string],
    },
    options: {},
  };
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 0;
  while (await prisma.invitation.findUnique({ where: { slug } })) {
    slug = `${base}-${++i}`;
  }
  return slug;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: { theme: string; fields: Record<string, string> };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { theme, fields } = body;
  if (!theme || typeof fields !== "object") {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const mapped = mapFields(theme, fields);
  const slugBase = (() => {
    const c = mapped.content;
    const n1 = c.names[0] || "invitation";
    const n2 = c.names[1] || "";
    const year = c.date?.slice(0, 4) || new Date().getFullYear().toString();
    return [n1, n2, year].filter(Boolean).join("-")
      .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      .slice(0, 50);
  })();

  const slug = await uniqueSlug(slugBase || "invitation");

  const invitation = await prisma.invitation.create({
    data: {
      userId: session.user.id,
      slug,
      themeId: theme,
      category: mapped.category,
      status: "published",
      content: JSON.stringify(mapped.content),
      options: JSON.stringify(mapped.options),
      publishedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, slug: invitation.slug });
}
