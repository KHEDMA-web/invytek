import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/auth";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function safeHref(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return "#";
    return esc(url);
  } catch { return "#"; }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Email non configuré" }, { status: 503 });
  const resend = new Resend(apiKey);

  let body: { to?: string; guestName?: string; url?: string; type?: string; clientName?: string; eventTitle?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide" }, { status: 400 }); }

  const { to, guestName, url, type, clientName, eventTitle } = body;
  if (!to || !url) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const safeUrl    = safeHref(url);
  const safeName   = clientName  ? esc(clientName)  : null;
  const safeGuest  = guestName   ? esc(guestName)   : null;
  const safeTitle  = eventTitle  ? esc(eventTitle)  : null;

  const isClientPortal = type === "client-portal";
  const subject = isClientPortal
    ? `Votre espace événement${safeTitle ? ` — ${eventTitle}` : ""}`
    : safeGuest ? `Votre invitation — ${guestName}` : "Votre invitation";

  const html = isClientPortal ? `
    <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background: #14100a; color: #FCFAF5; padding: 40px 32px; border-radius: 12px;">
      <p style="font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: #B8923C; margin-bottom: 8px;">Invytek</p>
      <h1 style="font-size: 28px; font-weight: 400; color: #FCFAF5; margin-bottom: 24px;">
        ${safeName ? `Bonjour ${safeName},` : "Bonjour,"}
      </h1>
      <p style="font-size: 16px; color: #c8bfa8; line-height: 1.7; margin-bottom: 16px;">
        Votre espace de suivi d&rsquo;événement est prêt. Suivez les confirmations de présence de vos invités en temps réel.
      </p>
      ${safeTitle ? `<p style="font-size: 14px; color: #D4AF61; margin-bottom: 32px; font-style: italic;">${safeTitle}</p>` : ""}
      <a href="${safeUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #D4AF61, #B8923C); color: #2a2008; text-decoration: none; border-radius: 8px; font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase;">
        Accéder à mon espace
      </a>
      <p style="margin-top: 32px; font-size: 13px; color: #6b5e45;">
        Ou copiez ce lien : <a href="${safeUrl}" style="color: #B8923C;">${safeUrl}</a>
      </p>
    </div>
  ` : `
    <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background: #14100a; color: #FCFAF5; padding: 40px 32px; border-radius: 12px;">
      <p style="font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: #B8923C; margin-bottom: 8px;">Invytek</p>
      <h1 style="font-size: 28px; font-weight: 400; color: #FCFAF5; margin-bottom: 24px;">
        ${safeGuest ? `Bonjour ${safeGuest},` : "Bonjour,"}
      </h1>
      <p style="font-size: 16px; color: #c8bfa8; line-height: 1.7; margin-bottom: 32px;">
        Vous avez été invité(e) à un événement. Consultez votre invitation personnalisée en cliquant sur le bouton ci-dessous.
      </p>
      <a href="${safeUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #D4AF61, #B8923C); color: #2a2008; text-decoration: none; border-radius: 8px; font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase;">
        Voir mon invitation
      </a>
      <p style="margin-top: 32px; font-size: 13px; color: #6b5e45;">
        Ou copiez ce lien : <a href="${safeUrl}" style="color: #B8923C;">${safeUrl}</a>
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Invytek <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Email non envoyé" }, { status: 500 });
  }
}
