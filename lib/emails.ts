import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "Invytek <onboarding@resend.dev>";

function esc(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

const BASE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://invytek.vercel.app";

function wrapper(content: string) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background:#0f0c07;">
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#14100a;color:#FCFAF5;border-radius:12px;overflow:hidden;">
    <div style="padding:28px 32px;border-bottom:1px solid rgba(184,146,60,0.15);">
      <span style="font-family:Helvetica,sans-serif;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#B8923C;">Invytek</span>
    </div>
    <div style="padding:36px 32px;">
      ${content}
    </div>
    <div style="padding:20px 32px;border-top:1px solid rgba(184,146,60,0.1);text-align:center;">
      <p style="font-family:Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(252,250,245,0.3);">
        © 2026 Invytek · <a href="${BASE_URL}" style="color:#B8923C;text-decoration:none;">invytek.app</a>
      </p>
    </div>
  </div>
  </body></html>`;
}

function btn(href: string, label: string, violet = false) {
  const bg = violet ? "linear-gradient(135deg,#a080e0,#7050c0)" : "linear-gradient(135deg,#D4AF61,#B8923C)";
  const color = violet ? "#fff" : "#2a2008";
  return `<a href="${href}" style="display:inline-block;padding:14px 32px;background:${bg};color:${color};text-decoration:none;border-radius:8px;font-family:Helvetica,sans-serif;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;margin-top:8px;">${label}</a>`;
}

function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendWelcomeEmail(email: string, name: string | null) {
  const r = resend(); if (!r) return;
  const n = esc(name ?? email.split("@")[0]);
  await r.emails.send({
    from: FROM, to: email,
    subject: "Bienvenue sur Invytek ✨",
    html: wrapper(`
      <h1 style="font-size:28px;font-weight:400;color:#FCFAF5;margin:0 0 20px;">Bienvenue, ${n} !</h1>
      <p style="font-size:16px;color:#c8bfa8;line-height:1.7;margin-bottom:20px;">
        Votre compte Invytek est prêt. Créez votre première invitation numérique premium en quelques minutes.
      </p>
      <p style="font-size:14px;color:#c8bfa8;line-height:1.7;margin-bottom:28px;">
        Choisissez parmi 12 thèmes prêts à l'emploi, personnalisez les couleurs, ou laissez notre IA créer un design unique pour vous.
      </p>
      ${btn(`${BASE_URL}/pricing`, "Choisir mon plan →")}
      <p style="margin-top:24px;font-size:13px;color:rgba(252,250,245,0.4);">
        Des questions ? Répondez simplement à cet email.
      </p>
    `),
  }).catch(console.error);
}

export async function sendPlanActivatedEmail(email: string, name: string | null, plan: string, expiresAt: Date) {
  const r = resend(); if (!r) return;
  const n = esc(name ?? email.split("@")[0]);
  const planLabel = plan === "business" ? "Business" : plan === "pro" ? "Pro" : "Simple";
  const expStr = expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  await r.emails.send({
    from: FROM, to: email,
    subject: `Votre plan ${planLabel} Invytek est activé ✓`,
    html: wrapper(`
      <h1 style="font-size:28px;font-weight:400;color:#FCFAF5;margin:0 0 20px;">Plan ${planLabel} activé ✓</h1>
      <p style="font-size:16px;color:#c8bfa8;line-height:1.7;margin-bottom:16px;">
        Bonjour ${n},
      </p>
      <p style="font-size:16px;color:#c8bfa8;line-height:1.7;margin-bottom:16px;">
        Votre paiement a bien été reçu. Votre plan <strong style="color:#D4AF61;">${planLabel}</strong> est maintenant actif jusqu'au <strong style="color:#D4AF61;">${expStr}</strong>.
      </p>
      <p style="font-size:14px;color:#c8bfa8;line-height:1.7;margin-bottom:28px;">
        Vous pouvez maintenant créer des invitations${plan !== "simple" ? " illimitées" : ""} et accéder à toutes les fonctionnalités de votre plan.
      </p>
      ${btn(`${BASE_URL}/dashboard`, "Accéder au tableau de bord →")}
      <p style="margin-top:24px;font-size:12px;color:rgba(252,250,245,0.35);">
        Votre plan sera renouvelable à partir du ${expStr}. Aucun prélèvement automatique.
      </p>
    `),
  }).catch(console.error);
}

export async function sendPlanExpiryReminderEmail(email: string, name: string | null, plan: string, expiresAt: Date) {
  const r = resend(); if (!r) return;
  const n = esc(name ?? email.split("@")[0]);
  const planLabel = plan === "business" ? "Business" : plan === "pro" ? "Pro" : "Simple";
  const expStr = expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  await r.emails.send({
    from: FROM, to: email,
    subject: `Votre plan ${planLabel} expire le ${expStr}`,
    html: wrapper(`
      <h1 style="font-size:26px;font-weight:400;color:#FCFAF5;margin:0 0 20px;">Votre plan expire bientôt</h1>
      <p style="font-size:16px;color:#c8bfa8;line-height:1.7;margin-bottom:16px;">Bonjour ${n},</p>
      <p style="font-size:16px;color:#c8bfa8;line-height:1.7;margin-bottom:28px;">
        Votre plan <strong style="color:#D4AF61;">${planLabel}</strong> expire le <strong style="color:#e07070;">${expStr}</strong>.
        Renouvelez-le dès maintenant pour continuer à créer des invitations sans interruption.
      </p>
      ${btn(`${BASE_URL}/pricing`, "Renouveler mon plan →")}
    `),
  }).catch(console.error);
}
