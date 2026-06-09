import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "aniskhelifiusthb@gmail.com";

export async function GET() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      planExpiresAt: true,
      isTrial: true,
      credits: true,
      createdAt: true,
      _count: { select: { invitations: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  let body: { userId?: string; plan?: string; days?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const { userId, plan, days } = body;
  if (!userId || !plan || !["free", "simple", "pro", "business"].includes(plan))
    return NextResponse.json({ error: "userId et plan valide requis" }, { status: 400 });

  const expiry = plan === "free" ? null : (() => {
    const d = new Date();
    d.setDate(d.getDate() + (typeof days === "number" && days > 0 ? days : 30));
    return d;
  })();

  await prisma.user.update({
    where: { id: userId },
    data: { plan, planExpiresAt: expiry },
  });

  return NextResponse.json({ ok: true });
}
