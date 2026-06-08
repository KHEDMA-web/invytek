import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "aniskhelifiusthb@gmail.com";

const PACKS = [
  { credits: 5,  amount: 500,  label: "Pack Starter" },
  { credits: 15, amount: 1500, label: "Pack Pro" },
  { credits: 40, amount: 3500, label: "Pack Studio" },
];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  let body: { pack?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const pack = PACKS[body.pack ?? 0];
  if (!pack) return NextResponse.json({ error: "Pack invalide" }, { status: 400 });

  const apiKey = process.env.CHARGILY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Paiement non configuré" }, { status: 503 });

  const dbUser = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name ?? session.user.email.split("@")[0],
      image: session.user.image ?? undefined,
    },
  });

  const base = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

  if (dbUser.email === ADMIN_EMAIL) {
    await prisma.user.update({ where: { id: dbUser.id }, data: { credits: { increment: pack.credits } } });
    return NextResponse.json({ url: `${base}/dashboard?credits=ok` });
  }

  const isTest = apiKey.startsWith("test_");
  const chargilyUrl = isTest
    ? "https://pay.chargily.net/test/api/v2/checkouts"
    : "https://pay.chargily.net/api/v2/checkouts";

  const res = await fetch(chargilyUrl, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      amount: pack.amount,
      currency: "dzd",
      payment_method: "edahabia",
      description: `${pack.label} — ${pack.credits} crédits Invytek`,
      success_url: `${base}/dashboard?credits=ok`,
      failure_url: `${base}/dashboard?credits=fail`,
      webhook_endpoint: `${base}/api/credits/webhook`,
      locale: "fr",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Chargily error:", res.status, err);
    return NextResponse.json({ error: `Erreur paiement (${res.status})`, detail: err }, { status: 502 });
  }

  const data = await res.json() as { checkout_url?: string; id?: string };

  if (data.id) {
    await prisma.pendingCheckout.create({
      data: { checkoutId: data.id, userId: dbUser.id, type: "credits", credits: pack.credits },
    });
  }

  return NextResponse.json({ url: data.checkout_url });
}
