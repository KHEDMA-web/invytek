import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const secret = process.env.CHARGILY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Non configuré" }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get("signature") ?? "";

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const sigOk = sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!sigOk) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  let event: { type?: string; data?: { id?: string; status?: string } };
  try { event = JSON.parse(body); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }

  if (event.type === "checkout.paid" && event.data?.status === "paid") {
    const checkoutId = event.data.id;
    if (!checkoutId) return NextResponse.json({ ok: true });

    const intent = await prisma.pendingCheckout.findUnique({ where: { checkoutId } });
    if (!intent || intent.type !== "credits" || intent.credits <= 0) return NextResponse.json({ ok: true });

    try {
      await prisma.$transaction([
        prisma.processedWebhook.create({ data: { checkoutId } }),
        prisma.pendingCheckout.delete({ where: { checkoutId } }),
        prisma.user.update({ where: { id: intent.userId }, data: { credits: { increment: intent.credits } } }),
      ]);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json({ ok: true });
      }
      throw e;
    }
  }

  return NextResponse.json({ ok: true });
}
