import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const CREDIT_COST = 1;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const THEMES_LIST = [
  { id: "gold-arch",       label: "Mariage doré (arche)" },
  { id: "bordeaux-oval",   label: "Mariage bordeaux RTL (arabe)" },
  { id: "ivoire-minimal",  label: "Mariage ivoire minimal" },
  { id: "confettis-or",    label: "Anniversaire confettis dorés" },
  { id: "anniv-neon",      label: "Anniversaire néon/fête" },
  { id: "baby-shower",     label: "Baby shower / naissance" },
  { id: "soiree-prestige", label: "Business gala / soirée prestige" },
  { id: "conference-tech", label: "Business conférence tech" },
  { id: "inauguration",    label: "Business inauguration" },
  { id: "blouse-lys",      label: "Médical / santé élégant" },
  { id: "congres-medical", label: "Congrès médical" },
  { id: "sensibilisation", label: "Campagne sensibilisation" },
];

const VALID_THEMES = THEMES_LIST.map(t => t.id);

const SYSTEM = `Tu es un générateur d'invitations premium pour Invytek (Algérie).
L'utilisateur décrit son événement. Tu génères un JSON complet avec 4 champs.

Thèmes disponibles (choisis le plus adapté) :
${THEMES_LIST.map(t => `- "${t.id}" : ${t.label}`).join("\n")}

Retourne ce JSON exact (sans markdown) :
{
  "themeId": "slug-du-theme",
  "themeLabel": "Nom poétique du thème unique en français (ex: Mariage Bordeaux & Lune, Gala Bleu Nuit Prestige)",
  "customizations": {
    "--gold": "#hex",
    "--gold-bright": "#hex",
    "--gold-deep": "#hex",
    "--bg-1": "#hex",
    "--bg-2": "#hex",
    "--ivory": "#hex"
  },
  "content": {
    "names": ["string", "string"],
    "hosts": "string",
    "invitationLine": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "dayLabel": "string",
    "venue": "string",
    "venueSub": "string ou omis",
    "closing": "string",
    "note": "string ou omis",
    "initials": ["X", "Y"],
    "bismillah": false,
    "namesSeparator": "avec"
  }
}

Règles palette :
- Les couleurs doivent être harmonieuses et adaptées au type d'événement
- Mariage : tons chaleureux (bordeaux, rose poudré, crème, or rose, violet...)
- Business : tons sobres (bleu nuit, gris ardoise, vert forêt...)
- Médical : tons frais (bleu azur, vert sauge, blanc cassé...)
- Anniversaire / Bébé : tons festifs ou pastel
- "--ivory" doit être clair (> #D0...) car c'est la couleur du texte
- "--bg-1" et "--bg-2" doivent être sombres (< #30...) pour garder le contraste`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  let body: { description?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }
  if (!body.description?.trim()) return NextResponse.json({ error: "Description requise" }, { status: 400 });

  const dbUser = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name ?? session.user.email.split("@")[0],
      image: session.user.image ?? undefined,
    },
  });
  if (dbUser.credits < CREDIT_COST) return NextResponse.json({ error: "Crédits insuffisants", credits: dbUser.credits }, { status: 402 });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1200,
    system: SYSTEM,
    messages: [{ role: "user", content: body.description.trim() }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";

  let parsed: {
    themeId?: string;
    themeLabel?: string;
    customizations?: Record<string, string>;
    content?: Record<string, unknown>;
  };
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return NextResponse.json({ error: "L'IA n'a pas pu générer un contenu valide. Réessayez." }, { status: 500 });
  }

  const themeId = VALID_THEMES.includes(parsed.themeId ?? "") ? parsed.themeId! : "gold-arch";
  const themeLabel = parsed.themeLabel || "Invitation personnalisée";
  const customizations = parsed.customizations ?? {};
  const content = parsed.content ?? {};
  const category = THEMES_LIST.find(t => t.id === themeId)?.label.split(" ")[0] ?? "Mariage";

  // Sauvegarder le thème généré
  const savedTheme = await prisma.generatedTheme.create({
    data: {
      baseThemeId: themeId,
      customizations: JSON.stringify(customizations),
      category,
      label: themeLabel,
    },
  });

  await prisma.user.update({ where: { id: session.user.id }, data: { credits: { decrement: CREDIT_COST } } });

  return NextResponse.json({
    themeId,
    themeLabel,
    customizations,
    content,
    generatedThemeId: savedTheme.id,
    credits: dbUser.credits - CREDIT_COST,
  });
}
