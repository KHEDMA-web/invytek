import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "aniskhelifiusthb@gmail.com";

export async function GET() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const trials = await prisma.user.findMany({
    where: { isTrial: true },
    select: { id: true, email: true, plan: true, planExpiresAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ trials });
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  let body: { email?: string; password?: string; plan?: string; days?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const { email, password, plan, days = 7 } = body;

  if (!email || !password || !plan) {
    return NextResponse.json({ error: "email, password et plan sont requis" }, { status: 400 });
  }
  if (!["simple", "pro", "business"].includes(plan)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Mot de passe trop court (min 6 caractères)" }, { status: 400 });
  }
  if (typeof days !== "number" || days < 1 || days > 365) {
    return NextResponse.json({ error: "Durée invalide (1–365 jours)" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });

  const hash = await bcrypt.hash(password, 12);
  const planExpiresAt = new Date();
  planExpiresAt.setDate(planExpiresAt.getDate() + days);

  const user = await prisma.user.create({
    data: {
      email,
      name: email.split("@")[0],
      password: hash,
      plan,
      planExpiresAt,
      isTrial: true,
      credits: 3,
    },
    select: { id: true, email: true, plan: true, planExpiresAt: true },
  });

  return NextResponse.json({ ok: true, user });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  let body: { userId?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  if (!body.userId) return NextResponse.json({ error: "userId requis" }, { status: 400 });

  await prisma.user.update({
    where: { id: body.userId },
    data: { plan: "free", planExpiresAt: null, isTrial: false, credits: 0 },
  });

  return NextResponse.json({ ok: true });
}
