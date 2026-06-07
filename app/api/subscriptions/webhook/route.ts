import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  const secret = process.env.CHARGILY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Non configuré" }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get("signature") ?? "";

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  let event: { type?: string; data?: { status?: string; metadata?: { userId?: string; plan?: string; months?: number } } };
  try { event = JSON.parse(body); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }

  if (event.type === "checkout.paid" && event.data?.status === "paid") {
    const { userId, plan, months = 1 } = event.data.metadata ?? {};
    if (!userId || !plan || !["pro", "business"].includes(plan)) {
      return NextResponse.json({ ok: true });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true, planExpiresAt: true } });
    if (!user) return NextResponse.json({ ok: true });

    // Prolonger si plan actif, sinon partir de maintenant
    const base = user.plan !== "free" && user.planExpiresAt && user.planExpiresAt > new Date()
      ? user.planExpiresAt
      : new Date();

    const planExpiresAt = new Date(base);
    planExpiresAt.setDate(planExpiresAt.getDate() + months * 30);

    await prisma.user.update({
      where: { id: userId },
      data: { plan, planExpiresAt },
    });
  }

  return NextResponse.json({ ok: true });
}
