import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/getDbUser";

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

  const apiKey = process.env.CHARGILY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Paiement non configuré" }, { status: 503 });

  const p = PLANS[plan];
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

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
      success_url: `${baseUrl}/dashboard?plan=ok`,
      failure_url: `${baseUrl}/pricing?plan=fail`,
      webhook_endpoint: `${baseUrl}/api/subscriptions/webhook`,
      locale: "fr",
      metadata: { userId: dbUser.id, plan, months: p.months },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Chargily subscription error:", res.status, err);
    return NextResponse.json({ error: `Erreur paiement (${res.status})` }, { status: 502 });
  }

  const data = await res.json() as { checkout_url?: string };
  return NextResponse.json({ url: data.checkout_url });
}
