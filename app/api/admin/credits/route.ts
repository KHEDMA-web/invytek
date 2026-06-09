import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "aniskhelifiusthb@gmail.com";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  let body: { userId?: string; amount?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const { userId, amount } = body;
  if (!userId || typeof amount !== "number" || amount < 1 || amount > 100)
    return NextResponse.json({ error: "userId et amount (1–100) requis" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
    select: { id: true, email: true, credits: true },
  });

  return NextResponse.json({ ok: true, user });
}
