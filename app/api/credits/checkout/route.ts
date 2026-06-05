import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const PACKS = [
  { credits: 5,  amount: 500,  label: "Pack Starter" },
  { credits: 15, amount: 1500, label: "Pack Pro" },
  { credits: 40, amount: 3500, label: "Pack Studio" },
];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  let body: { pack?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const pack = PACKS[body.pack ?? 0];
  if (!pack) return NextResponse.json({ error: "Pack invalide" }, { status: 400 });

  const apiKey = process.env.CHARGILY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Paiement non configuré" }, { status: 503 });

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

  // URL test si clé test, prod sinon
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
      success_url: `${baseUrl}/dashboard?credits=ok`,
      failure_url: `${baseUrl}/dashboard?credits=fail`,
      webhook_endpoint: `${baseUrl}/api/credits/webhook`,
      locale: "fr",
      metadata: { userId: dbUser.id, credits: pack.credits },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Chargily error:", res.status, err);
    return NextResponse.json({ error: `Erreur paiement (${res.status})`, detail: err }, { status: 502 });
  }

  const data = await res.json() as { checkout_url?: string };
  return NextResponse.json({ url: data.checkout_url });
}
