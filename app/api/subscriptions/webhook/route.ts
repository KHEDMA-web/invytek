import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { sendPlanActivatedEmail } from "@/lib/emails";

export async function POST(req: Request) {
  const secret = process.env.CHARGILY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Non configuré" }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get("signature") ?? "";

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  let event: { type?: string; data?: { id?: string; status?: string } };
  try { event = JSON.parse(body); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }

  if (event.type === "checkout.paid" && event.data?.status === "paid") {
    const checkoutId = event.data.id;
    if (!checkoutId) return NextResponse.json({ ok: true });

    const intent = await prisma.pendingCheckout.findUnique({ where: { checkoutId } });
    if (!intent || intent.type !== "subscription") return NextResponse.json({ ok: true });

    const { userId, plan, months } = intent;
    if (!plan || !["simple", "pro", "business"].includes(plan)) return NextResponse.json({ ok: true });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true, email: true, name: true },
    });
    if (!user) return NextResponse.json({ ok: true });

    const base = user.plan !== "free" && user.planExpiresAt && user.planExpiresAt > new Date()
      ? user.planExpiresAt
      : new Date();
    const planExpiresAt = new Date(base);
    planExpiresAt.setMonth(planExpiresAt.getMonth() + months);

    try {
      await prisma.$transaction([
        prisma.processedWebhook.create({ data: { checkoutId } }),
        prisma.pendingCheckout.delete({ where: { checkoutId } }),
        prisma.user.update({ where: { id: userId }, data: { plan, planExpiresAt } }),
      ]);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json({ ok: true });
      }
      throw e;
    }

    void sendPlanActivatedEmail(user.email, user.name, plan, planExpiresAt);
  }

  return NextResponse.json({ ok: true });
}
