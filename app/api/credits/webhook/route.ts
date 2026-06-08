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

  let event: { type?: string; data?: { id?: string; status?: string; metadata?: { userId?: string; credits?: number } } };
  try { event = JSON.parse(body); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }

  if (event.type === "checkout.paid" && event.data?.status === "paid") {
    const checkoutId = event.data.id;
    const { userId, credits } = event.data.metadata ?? {};
    if (userId && credits && credits > 0) {
      try {
        const ops: Prisma.PrismaPromise<unknown>[] = [];
        if (checkoutId) ops.push(prisma.processedWebhook.create({ data: { checkoutId } }));
        ops.push(prisma.user.update({ where: { id: userId }, data: { credits: { increment: credits } } }));
        await prisma.$transaction(ops);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          return NextResponse.json({ ok: true });
        }
        throw e;
      }
    }
  }

  return NextResponse.json({ ok: true });
}
