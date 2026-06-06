import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { getDbUser } from "@/lib/getDbUser";
import { DynamicThemeSpecSchema, type DynamicThemeSpec } from "@/lib/schemas/dynamicTheme";

const CREDIT_COST = 1;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Fallback vers un thème de base pour la compatibilité pendant la transition
// (supprimé en Session 2 quand DynamicTheme.tsx sera prêt)
const THEME_FALLBACK: Record<string, string> = {
  "baby":       "baby-shower",
  "bébé":       "baby-shower",
  "naissance":  "baby-shower",
  "anniversaire":"confettis-or",
  "anniv":      "confettis-or",
  "inaugur":    "inauguration",
  "conférence": "conference-tech",
  "conference": "conference-tech",
  "tech":       "conference-tech",
  "congres":    "congres-medical",
  "médical":    "blouse-lys",
  "gala":       "soiree-prestige",
  "prestige":   "soiree-prestige",
  "sensibil":   "sensibilisation",
};

function pickBaseTheme(spec: DynamicThemeSpec, description: string): string {
  const d = description.toLowerCase();
  for (const [key, theme] of Object.entries(THEME_FALLBACK)) {
    if (d.includes(key)) return theme;
  }
  if (spec.typography.rtl) return "bordeaux-oval";
  if (spec.ornements.style === "minimal") return "ivoire-minimal";
  if (spec.animation === "confetti") return "confettis-or";
  return "gold-arch";
}

const SYSTEM = `Tu es un générateur de thèmes d'invitation numériques premium pour Invytek (Algérie).
L'utilisateur décrit son événement en quelques mots. Tu analyses le contexte et génères un JSON structurel qui définit l'APPARENCE VISUELLE UNIQUE de l'invitation.

RÈGLES ABSOLUES :
1. Retourne UNIQUEMENT le JSON brut, sans markdown, sans texte avant/après
2. bg et bgCard DOIVENT être sombres : luminosité < 30% (ex: #0a0806, #14100a, #0d1520, #0a1a0a)
3. text DOIT être clair : luminosité > 70% (ex: #FCFAF5, #E8F0FF, #F0FAF0)
4. primary et primaryBright = couleur d'accent dominante, harmonieuse avec le mood
5. date au format YYYY-MM-DD — si non précisée, utilise une date plausible dans 3–6 mois
6. Génère du VRAI contenu (noms, lieux) basé sur la description — invente si non précisé

MAPPING ÉVÉNEMENT → DESIGN :
- Mariage algérien traditionnel → shape:arch, ornements:floral ou arabesque, animation:envelope, palette:or/ivoire/bordeaux, bismillah:true
- Mariage RTL (arabe) → idem + typography.rtl:true, headline:amiri, bismillah:true
- Mariage moderne → shape:oval ou rectangle, ornements:minimal, animation:doors ou fade, palette:douce
- Anniversaire festif → shape:rectangle, ornements:confetti, animation:confetti ou rise, palette:vive
- Baby shower / naissance → shape:oval, ornements:minimal, animation:fade, palette:pastel (rose, bleu ciel, vert menthe)
- Business gala / soirée prestige → shape:rectangle, ornements:geometric, animation:doors, palette:sombre élégante (bleu nuit, bordeaux profond, or froid)
- Conférence / tech → shape:hexagon, ornements:geometric, animation:rise, palette:tech (bleu électrique, gris ardoise, cyan)
- Inauguration → shape:diamond ou rectangle, ornements:geometric, animation:doors, palette:sobre (or, gris anthracite)
- Médical / santé → shape:rectangle, ornements:medical, animation:fade, palette:propre (bleu azur, vert sauge, blanc cassé)
- Sensibilisation / cause → shape:rectangle, ornements:minimal, animation:rise, palette:engagée (orange, rouge, vert vif)

FORMES disponibles : arch | oval | rectangle | hexagon | diamond
ORNEMENTS disponibles : floral | geometric | arabesque | minimal | confetti | medical
ANIMATIONS disponibles : envelope | doors | fade | rise | confetti
TYPOGRAPHIES headline : pinyon-script | marcellus | cormorant | amiri
TYPOGRAPHIES body : cormorant | marcellus | amiri

JSON À GÉNÉRER (respecte EXACTEMENT cette structure) :
{
  "themeLabel": "Nom poétique unique du thème en français (ex: Mariage Doré sous les Étoiles, Gala Bleu Nuit Prestige)",
  "shape": "arch",
  "palette": {
    "bg": "#14100a",
    "bgCard": "#1e1810",
    "primary": "#B8923C",
    "primaryBright": "#D4AF61",
    "text": "#FCFAF5",
    "textSoft": "#c8bfa8"
  },
  "typography": {
    "headline": "pinyon-script",
    "body": "cormorant",
    "rtl": false
  },
  "ornements": {
    "style": "floral",
    "accent": "#B8923C"
  },
  "animation": "envelope",
  "sections": {
    "bismillah": true,
    "arabicText": true,
    "countdown": true,
    "rsvp": true
  },
  "mood": "Élégance orientale dorée et romantique",
  "content": {
    "names": ["Prénom1", "Prénom2"],
    "hosts": "Familles X & Y",
    "invitationLine": "ont l'immense plaisir de vous convier à",
    "date": "2026-09-12",
    "time": "18:00",
    "dayLabel": "Samedi",
    "venue": "Salle El Baraka",
    "venueSub": "Alger Centre",
    "closing": "Soyez les Bienvenus",
    "note": null,
    "initials": ["A", "S"],
    "bismillah": true,
    "namesSeparator": "avec"
  }
}`;

export async function POST(req: Request) {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  let body: { description?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }
  if (!body.description?.trim()) return NextResponse.json({ error: "Description requise" }, { status: 400 });

  if (dbUser.credits < CREDIT_COST) {
    return NextResponse.json({ error: "Crédits insuffisants", credits: dbUser.credits }, { status: 402 });
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{ role: "user", content: body.description.trim() }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";

  // Extraire le JSON de la réponse (au cas où Haiku ajoute du texte parasite)
  let rawObj: unknown;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    rawObj = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return NextResponse.json({ error: "L'IA n'a pas pu générer un thème valide. Réessayez." }, { status: 500 });
  }

  // Validation Zod — coerce note:null → undefined
  if (rawObj && typeof rawObj === "object" && "content" in rawObj) {
    const c = (rawObj as Record<string, unknown>).content as Record<string, unknown>;
    if (c.note === null) delete c.note;
    if (c.venueSub === null) delete c.venueSub;
  }

  const parsed = DynamicThemeSpecSchema.safeParse(rawObj);
  if (!parsed.success) {
    console.error("DynamicTheme validation error:", parsed.error.issues);
    return NextResponse.json({ error: "Thème généré invalide. Réessayez avec une description plus précise." }, { status: 500 });
  }

  const spec = parsed.data;
  const baseThemeId = pickBaseTheme(spec, body.description);
  const category = spec.typography.rtl ? "Mariage" :
    spec.ornements.style === "medical" ? "Médical" :
    spec.ornements.style === "confetti" ? "Anniversaire" :
    spec.ornements.style === "geometric" ? "Business" : "Mariage";

  // Persist le thème généré avec son spec complet
  const savedTheme = await prisma.generatedTheme.create({
    data: {
      baseThemeId,
      customizations: JSON.stringify({
        "--gold": spec.palette.primary,
        "--gold-bright": spec.palette.primaryBright,
        "--bg-1": spec.palette.bg,
        "--ivory": spec.palette.text,
      }),
      layoutSpec: JSON.stringify(spec),
      category,
      label: spec.themeLabel,
    },
  });

  // Décrémenter les crédits
  await prisma.user.update({
    where: { id: dbUser.id },
    data: { credits: { decrement: CREDIT_COST } },
  });

  return NextResponse.json({
    // Nouveau — spec complète pour DynamicTheme.tsx (Session 2)
    layoutSpec: spec,
    generatedThemeId: savedTheme.id,
    themeLabel: spec.themeLabel,
    // Compatibilité backward — create page continue à fonctionner
    themeId: baseThemeId,
    customizations: {
      "--gold": spec.palette.primary,
      "--gold-bright": spec.palette.primaryBright,
      "--bg-1": spec.palette.bg,
      "--ivory": spec.palette.text,
    },
    content: spec.content,
    credits: dbUser.credits - CREDIT_COST,
  });
}
