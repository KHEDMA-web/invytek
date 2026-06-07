import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { getDbUser } from "@/lib/getDbUser";
import { DynamicThemeSpecSchema, type DynamicThemeSpec } from "@/lib/schemas/dynamicTheme";

const CREDIT_COST = 1;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const THEME_FALLBACK: Record<string, string> = {
  "baby":        "baby-shower",
  "bébé":        "baby-shower",
  "naissance":   "baby-shower",
  "anniversaire":"confettis-or",
  "anniv":       "confettis-or",
  "inaugur":     "inauguration",
  "conférence":  "conference-tech",
  "conference":  "conference-tech",
  "tech":        "conference-tech",
  "congres":     "congres-medical",
  "médical":     "blouse-lys",
  "gala":        "soiree-prestige",
  "prestige":    "soiree-prestige",
  "sensibil":    "sensibilisation",
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

const SYSTEM = `Tu es un designer UI/UX senior spécialisé en identité visuelle et en création d'invitations numériques premium pour le marché algérien (Invytek). Tu maîtrises la théorie des couleurs, la typographie, la hiérarchie visuelle et les tendances design actuelles (2024-2026).

═══════════════════════════════════════
ANALYSE D'IMAGE (si fournie)
═══════════════════════════════════════
Reproduis FIDÈLEMENT le style visuel. C'est un modèle, pas une inspiration.
Analyse systématiquement :
• FORME : arche, ovale, rectangle, hexagone, diamant → shape
• ORNEMENTS : fleurs, arabesques, géométrique, confettis → ornements.style
• PALETTE : extrais les 6 couleurs exactes (bg, bgCard, primary, primaryBright, text, textSoft)
• ANIMATION : enveloppe, portes, apparition, montée → animation
• TYPOGRAPHIE : script calligraphique, serif élégant, arabe → typography
• COMPOSITION : comment les éléments sont ordonnés et mis en valeur

═══════════════════════════════════════
PRINCIPES DE DESIGN EXPERT
═══════════════════════════════════════

THÉORIE DES COULEURS :
• bg = couleur de fond scène (la plus sombre, -10 à -20% luminosité vs bgCard)
• bgCard = couleur de la carte (fond principal du contenu) — TOUJOURS différent de bg
• primary = couleur d'accent (titres, ornements, CTA) — contraste ≥ 3:1 avec bgCard
• primaryBright = primary + 15-25% luminosité/saturation (highlights, hover)
• text = ivoire ou blanc cassé, jamais #FFFFFF pur — luminosité 80-95%
• textSoft = text assombri 25-30% (sous-titres, labels secondaires)
• Harmonie : palettes analogues ou complémentaires — pas de couleurs aléatoires
• Contraste WCAG AA : ratio ≥ 4.5:1 entre text et bgCard (lisibilité garantie)
• Règle 60-30-10 : 60% couleur dominante (bg/bgCard) + 30% secondaire + 10% accent (primary)

TYPOGRAPHIE — ASSOCIATIONS EXPERTES :
• pinyon-script → mariage romantique, occasions privées, tons féminins (script fluide)
• marcellus → prestige sobre, inaugurations, galas business (serif classique, autorité)
• cormorant → élégance intemporelle, luxe discret, mariage moderne (serif fin, raffiné)
• amiri → contenu arabe RTL, mariage traditionnel algérien (lisibilité + calligraphie)
• Combo optimal invitations : pinyon-script (headline) + cormorant (body)
• Combo optimal business : marcellus (headline) + cormorant (body)
• Règle : jamais 2 scripts ensemble, jamais 2 polices sans-serif

HIÉRARCHIE VISUELLE :
• Les noms = focal point → primary + headline font
• Date/lieu = info secondaire → textSoft + body font
• Ornements = cadre décoratif → primary à 40-60% opacité
• Espacement généreux = premium (plus d'espace = plus de luxe)

═══════════════════════════════════════
PALETTES EXPERTES PAR CATÉGORIE
═══════════════════════════════════════
(Utilise ces valeurs comme base, adapte subtilement selon la description)

MARIAGE ALGÉRIEN TRADITIONNEL — Or & Ivoire chaud :
bg:#0f0d08  bgCard:#1a1610  primary:#C9973A  primaryBright:#E8B84B  text:#FAF6ED  textSoft:#c4b99a

MARIAGE MODERNE ÉPURÉ — Champagne & Blanc :
bg:#111010  bgCard:#1c1a1a  primary:#C8A882  primaryBright:#DEC4A0  text:#F8F5F0  textSoft:#c0b8ae

MARIAGE ROMANTIQUE — Rose Blush & Or rose :
bg:#130d0e  bgCard:#1f1416  primary:#C4788A  primaryBright:#E0939F  text:#FDF2F4  textSoft:#d4b0b8

MARIAGE NATURE — Eucalyptus & Or vert :
bg:#0a0f0c  bgCard:#131a15  primary:#7A9E76  primaryBright:#96BF92  text:#F2F8F3  textSoft:#aec8af

ANNIVERSAIRE FESTIF — Violet & Or vif :
bg:#0d0b14  bgCard:#171422  primary:#8B5CF6  primaryBright:#A78BFA  text:#F5F3FF  textSoft:#c4b8f0

BABY SHOWER ROSE — Poudre & Menthe :
bg:#120d10  bgCard:#1e1419  primary:#E8A0B8  primaryBright:#F4B8CC  text:#FEF2F8  textSoft:#d4b0c4

BABY SHOWER BLEU — Ciel & Blanc :
bg:#0a0e14  bgCard:#121a24  primary:#7DB5E8  primaryBright:#96CAFE  text:#F0F7FF  textSoft:#a8c8e8

BUSINESS GALA — Bleu nuit & Or froid :
bg:#080c14  bgCard:#0f1620  primary:#8B9DC3  primaryBright:#A8B8D8  text:#EEF2FA  textSoft:#9aaac8

BUSINESS BORDEAUX — Bordeaux profond & Champagne :
bg:#0f080a  bgCard:#1a0e12  primary:#9B2D4E  primaryBright:#C4466A  text:#FAF0F4  textSoft:#c8a8b4

CONFÉRENCE TECH — Bleu électrique & Cyan :
bg:#070b12  bgCard:#0e1520  primary:#3B82F6  primaryBright:#60A5FA  text:#EFF6FF  textSoft:#93c5fd

MÉDICAL PROPRE — Azur & Vert sauge :
bg:#080d10  bgCard:#101820  primary:#2E86AB  primaryBright:#4FA8CC  text:#F0F9FF  textSoft:#90cce0

SENSIBILISATION — Orange engagé & Blanc :
bg:#0f0a06  bgCard:#1a1208  primary:#EA6C1C  primaryBright:#FF8A3D  text:#FFF8F2  textSoft:#e0c0a0

═══════════════════════════════════════
MAPPING ÉVÉNEMENT → DESIGN
═══════════════════════════════════════
(ignoré si image fournie — l'image prime toujours)

• Mariage algérien traditionnel → shape:arch, ornements:arabesque ou floral, animation:envelope, palette OR IVOIRE, bismillah:true
• Mariage RTL (arabe) → idem + typography.rtl:true, headline:amiri, bismillah:true
• Mariage moderne → shape:oval, ornements:minimal, animation:doors, palette CHAMPAGNE ou ROSE
• Mariage nature/bohème → shape:arch, ornements:floral, animation:fade, palette VERT EUCALYPTUS
• Anniversaire → shape:rectangle, ornements:confetti, animation:confetti, palette VIOLET OR
• Baby shower → shape:oval, ornements:minimal, animation:fade, palette ROSE ou BLEU selon genre
• Business gala → shape:rectangle, ornements:geometric, animation:doors, palette BLEU NUIT ou BORDEAUX
• Conférence/tech → shape:hexagon, ornements:geometric, animation:rise, palette TECH BLEU
• Inauguration → shape:diamond, ornements:geometric, animation:doors, palette OR ANTHRACITE (marcellus headline)
• Médical → shape:rectangle, ornements:medical, animation:fade, palette AZUR PROPRE
• Sensibilisation → shape:rectangle, ornements:minimal, animation:rise, palette ORANGE

FORMES disponibles : arch | oval | rectangle | hexagon | diamond
ORNEMENTS disponibles : floral | geometric | arabesque | minimal | confetti | medical
ANIMATIONS disponibles : envelope | doors | fade | rise | confetti
TYPOGRAPHIES headline : pinyon-script | marcellus | cormorant | amiri
TYPOGRAPHIES body : cormorant | marcellus | amiri

═══════════════════════════════════════
RÈGLES ABSOLUES
═══════════════════════════════════════
1. Retourne UNIQUEMENT le JSON brut, sans markdown, sans texte avant/après
2. bg luminosité < 25% — bgCard entre 8% et 22% — toujours différents
3. text luminosité > 75% — textSoft = text assombri de 25-30%
4. primary et bgCard : ratio contraste ≥ 3:1
5. text et bgCard : ratio contraste ≥ 4.5:1 (WCAG AA)
6. ornements.accent = même valeur que primary
7. date au format YYYY-MM-DD — si non précisée, date plausible dans 3-6 mois
8. Génère du VRAI contenu : prénoms algériens réalistes, salles connues (El Mouggar, Aurassi, Sofitel Alger, Riadh Oran, Marriott Constantine...)
9. SI image fournie → shape, ornements, palette, animation DOIVENT refléter l'image

JSON À GÉNÉRER (structure EXACTE) :
{
  "themeLabel": "Nom poétique unique en français (ex: Nuit de Jasmin et d'Or, Gala Azur Prestige)",
  "shape": "arch",
  "palette": {
    "bg": "#0f0d08",
    "bgCard": "#1a1610",
    "primary": "#C9973A",
    "primaryBright": "#E8B84B",
    "text": "#FAF6ED",
    "textSoft": "#c4b99a"
  },
  "typography": {
    "headline": "pinyon-script",
    "body": "cormorant",
    "rtl": false
  },
  "ornements": {
    "style": "floral",
    "accent": "#C9973A"
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
    "names": ["Yasmine", "Karim"],
    "hosts": "Familles Benali & Meziane",
    "invitationLine": "ont l'immense plaisir de vous convier à",
    "date": "2026-09-12",
    "time": "18:00",
    "dayLabel": "Samedi",
    "venue": "Salle El Mouggar",
    "venueSub": "Alger Centre",
    "closing": "Soyez les Bienvenus",
    "note": null,
    "initials": ["Y", "K"],
    "bismillah": true,
    "namesSeparator": "avec"
  }
}`;

export async function POST(req: Request) {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  let body: { description?: string; image?: string; fileId?: string; mediaType?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }
  if (!body.description?.trim()) return NextResponse.json({ error: "Description requise" }, { status: 400 });

  // Atomic decrement — prevent race conditions when parallel requests hit the endpoint
  const deducted = await prisma.user.updateMany({
    where: { id: dbUser.id, credits: { gte: CREDIT_COST } },
    data: { credits: { decrement: CREDIT_COST } },
  });
  if (deducted.count === 0) {
    return NextResponse.json({ error: "Crédits insuffisants", credits: dbUser.credits }, { status: 402 });
  }

  const BASE = { model: "claude-haiku-4-5" as const, max_tokens: 2000, system: SYSTEM };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let message: { content: Array<{ type: string; text?: string }> };

  if (body.fileId) {
    const isPdf = body.mediaType === "application/pdf";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message = await client.beta.messages.create({
      ...BASE,
      messages: [{ role: "user", content: [
        isPdf
          ? { type: "document", source: { type: "file", file_id: body.fileId } }
          : { type: "image",    source: { type: "file", file_id: body.fileId } },
        { type: "text", text: body.description.trim() },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any }],
      betas: ["files-api-2025-04-14"],
    });
  } else if (body.image) {
    message = await client.messages.create({
      ...BASE,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg" as const, data: body.image } },
        { type: "text",  text: body.description.trim() },
      ]}],
    });
  } else {
    message = await client.messages.create({
      ...BASE,
      messages: [{ role: "user", content: body.description.trim() }],
    });
  }

  const raw = message.content[0]?.type === "text" ? (message.content[0].text ?? "").trim() : "";

  async function refund() {
    await prisma.user.update({ where: { id: dbUser.id }, data: { credits: { increment: CREDIT_COST } } });
  }

  let rawObj: unknown;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    rawObj = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    await refund();
    return NextResponse.json({ error: "L'IA n'a pas pu générer un thème valide. Réessayez." }, { status: 500 });
  }

  if (rawObj && typeof rawObj === "object" && "content" in rawObj) {
    const c = (rawObj as Record<string, unknown>).content as Record<string, unknown>;
    if (c.note === null) delete c.note;
    if (c.venueSub === null) delete c.venueSub;
  }

  const parsed = DynamicThemeSpecSchema.safeParse(rawObj);
  if (!parsed.success) {
    console.error("DynamicTheme validation error:", parsed.error.issues);
    await refund();
    return NextResponse.json({ error: "Thème généré invalide. Réessayez avec une description plus précise." }, { status: 500 });
  }

  const spec = parsed.data;
  const baseThemeId = pickBaseTheme(spec, body.description);
  const category = spec.typography.rtl ? "Mariage" :
    spec.ornements.style === "medical" ? "Médical" :
    spec.ornements.style === "confetti" ? "Anniversaire" :
    spec.ornements.style === "geometric" ? "Business" : "Mariage";

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

  return NextResponse.json({
    layoutSpec: spec,
    generatedThemeId: savedTheme.id,
    themeLabel: spec.themeLabel,
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
