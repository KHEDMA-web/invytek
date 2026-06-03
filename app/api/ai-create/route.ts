import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const CREDIT_COST = 1;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `Tu es un générateur de contenu d'invitation pour Invytek, une plateforme d'invitations numériques premium en Algérie.
L'utilisateur décrit son événement en texte libre (français ou arabe).
Tu dois retourner un objet JSON correspondant exactement au schéma WeddingContent.

Règles :
- names[0] et names[1] : prénoms/titres (pour mariage : les deux époux ; pour business/médical : nom de l'événement et sous-titre)
- hosts : famille organisatrice ou institution
- invitationLine : phrase d'invitation complète et élégante
- date : format YYYY-MM-DD (si non précisé, prends une date dans 3 mois)
- time : format HH:MM
- dayLabel : jour en français (Lundi, Mardi, etc.)
- venue : lieu de l'événement
- closing : formule de clôture élégante
- initials : initiales des noms (1-2 caractères)
- bismillah : true seulement pour mariage musulman
- namesSeparator : "avec" pour mariage, "·" sinon

Retourne UNIQUEMENT le JSON, sans markdown, sans commentaires.`;

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
  let content: Record<string, unknown>;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    content = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return NextResponse.json({ error: "L'IA n'a pas pu générer un contenu valide. Réessayez." }, { status: 500 });
  }

  // Déduire les crédits
  await prisma.user.update({ where: { id: session.user.id }, data: { credits: { decrement: CREDIT_COST } } });

  return NextResponse.json({ content, credits: dbUser.credits - CREDIT_COST });
}
