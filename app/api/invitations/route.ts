import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { WeddingContentSchema, WeddingOptionsSchema } from "@/lib/schemas/wedding";
import { getTheme } from "@/themes/registry";

const createSchema = z.object({
  themeId: z.string().min(1),
  slug: z.string().min(3).max(60).regex(/^[a-z0-9-]+$/, "Slug invalide (lettres minuscules, chiffres, tirets)"),
  content: WeddingContentSchema,
  options: WeddingOptionsSchema.partial(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  // Résoudre l'utilisateur par email — plus fiable que session.user.id après rotation de secret
  const dbUser = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name ?? session.user.email.split("@")[0],
      image: session.user.image ?? undefined,
    },
  });

  // Vérifier la limite du plan gratuit
  const planActive = dbUser.plan !== "free" && dbUser.planExpiresAt && dbUser.planExpiresAt > new Date();
  if (!planActive) {
    const invCount = await prisma.invitation.count({ where: { userId: dbUser.id } });
    if (invCount >= 1) {
      return NextResponse.json({
        error: "Limite du plan Gratuit atteinte (1 invitation max). Passez au plan Pro pour créer des invitations illimitées.",
        upgrade: true,
      }, { status: 403 });
    }
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide" }, { status: 400 }); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { themeId, slug, content, options } = parsed.data;

  const exists = await prisma.invitation.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "Ce lien est déjà utilisé." }, { status: 409 });

  let invitation;
  try {
    invitation = await prisma.invitation.create({
      data: {
        userId: dbUser.id,
        slug,
        themeId,
        category: getTheme(themeId)?.category ?? "wedding",
        status: "published",
        content: JSON.stringify(content),
        options: JSON.stringify(options),
        publishedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Prisma create error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug: invitation.slug });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return NextResponse.json([], { status: 200 });

  const invitations = await prisma.invitation.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      guests: { select: { status: true } },
    },
  });

  return NextResponse.json(invitations.map(inv => ({
    id: inv.id,
    slug: inv.slug,
    themeId: inv.themeId,
    status: inv.status,
    createdAt: inv.createdAt,
    content: JSON.parse(inv.content),
    attending: inv.guests.filter(g => g.status === "attending").length,
    declined: inv.guests.filter(g => g.status === "declined").length,
    pending: inv.guests.filter(g => g.status === "pending").length,
  })));
}
