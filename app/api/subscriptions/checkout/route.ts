import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/getDbUser";
import { prisma } from "@/lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "aniskhelifiusthb@gmail.com";

const PLANS = {
  simple:   { label: "Plan Simple",   amount: 1000, months: 1 },
  pro:      { label: "Plan Pro",      amount: 3000, months: 1 },
  business: { label: "Plan Business", amount: 5000, months: 1 },
} as const;

export async function POST(req: Request) {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  let body: { plan?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const plan = body.plan as keyof typeof PLANS;
  if (!PLANS[plan]) return NextResponse.json({ error: "Plan invalide" }, { status: 400 });

  const base = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";

  if (dbUser.email === ADMIN_EMAIL) {
    const planExpiresAt = new Date();
    planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 10);
    await prisma.user.update({ where: { id: dbUser.id }, data: { plan, planExpiresAt } });
    return NextResponse.json({ url: `${base}/dashboard?plan=ok` });
  }

  const apiKey = process.env.CHARGILY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Paiement non configuré" }, { status: 503 });

  const p = PLANS[plan];
  const isTest = apiKey.startsWith("test_");
  const chargilyUrl = isTest
    ? "https://pay.chargily.net/test/api/v2/checkouts"
    : "https://pay.chargily.net/api/v2/checkouts";

  const res = await fetch(chargilyUrl, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      amount: p.amount,
      currency: "dzd",
      payment_method: "edahabia",
      description: `${p.label} Invytek — ${p.months} mois`,
      success_url: `${base}/dashboard?plan=ok`,
      failure_url: `${base}/pricing?plan=fail`,
      webhook_endpoint: `${base}/api/subscriptions/webhook`,
      locale: "fr",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Chargily subscription error:", res.status, err);
    return NextResponse.json({ error: `Erreur paiement (${res.status})` }, { status: 502 });
  }

  const data = await res.json() as { checkout_url?: string; id?: string };

  if (data.id) {
    await prisma.pendingCheckout.create({
      data: { checkoutId: data.id, userId: dbUser.id, type: "subscription", plan, months: p.months },
    });
  }

  return NextResponse.json({ url: data.checkout_url });
}
