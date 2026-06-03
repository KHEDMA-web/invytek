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

const SYSTEM = `Tu es un générateur d'invitations pour Invytek, plateforme premium en Algérie.
L'utilisateur décrit son événement en texte libre (français ou arabe).
Tu dois retourner un objet JSON avec deux champs : "themeId" et "content".

Thèmes disponibles (choisis le plus adapté) :
${THEMES_LIST.map(t => `- "${t.id}" : ${t.label}`).join("\n")}

Schéma du champ "content" :
- names: [string, string] — pour mariage : les deux prénoms ; pour autres : [titre événement, sous-titre]
- hosts: string — famille organisatrice ou institution
- invitationLine: string — phrase d'invitation élégante et complète
- date: string — format YYYY-MM-DD (si non précisé, dans 3 mois)
- time: string — format HH:MM
- dayLabel: string — jour en français
- venue: string — lieu de l'événement
- venueSub: string (optionnel) — adresse ou ville
- closing: string — formule de clôture élégante
- note: string (optionnel) — dress code, info pratique
- initials: [string, string] — 1-2 caractères chacun
- bismillah: boolean — true seulement pour mariage musulman
- namesSeparator: string — "avec" pour mariage, "·" sinon

Retourne UNIQUEMENT le JSON brut, sans markdown ni commentaires.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  let body: { description?: string; themeId?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  if (!body.description?.trim()) return NextResponse.json({ error: "Description requise" }, { status: 400 });

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });
  if (dbUser.credits < CREDIT_COST) return NextResponse.json({ error: "Crédits insuffisants", credits: dbUser.credits }, { status: 402 });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM,
    messages: [{ role: "user", content: body.description.trim() }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  let parsed: { themeId?: string; content?: Record<string, unknown> };
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return NextResponse.json({ error: "L'IA n'a pas pu générer un contenu valide. Réessayez." }, { status: 500 });
  }

  const validThemes = ["gold-arch","bordeaux-oval","ivoire-minimal","confettis-or","anniv-neon","baby-shower","soiree-prestige","conference-tech","inauguration","blouse-lys","congres-medical","sensibilisation"];
  const themeId = validThemes.includes(parsed.themeId ?? "") ? parsed.themeId! : "gold-arch";
  const content = parsed.content ?? parsed;

  await prisma.user.update({ where: { id: session.user.id }, data: { credits: { decrement: CREDIT_COST } } });

  return NextResponse.json({ themeId, content, credits: dbUser.credits - CREDIT_COST });
}
