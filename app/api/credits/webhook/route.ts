import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  const secret = process.env.CHARGILY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Non configuré" }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get("signature") ?? "";

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  let event: { type?: string; data?: { status?: string; metadata?: { userId?: string; credits?: number } } };
  try { event = JSON.parse(body); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }

  if (event.type === "checkout.paid" && event.data?.status === "paid") {
    const { userId, credits } = event.data.metadata ?? {};
    if (userId && credits && credits > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: credits } },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
