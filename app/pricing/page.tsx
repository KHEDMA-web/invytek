"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const PLANS = [
  {
    name: "Simple",
    planKey: "simple",
    price: "1 000",
    period: "DA / mois",
    desc: "Idéal pour les agences qui démarrent.",
    pop: false,
    cta: "Choisir Simple",
    features: [
      { text: "5 invitations actives", ok: true },
      { text: "Tous les thèmes (18+)", ok: true },
      { text: "Invités illimités", ok: true },
      { text: "RSVP en ligne", ok: true },
      { text: "Lien public partageable", ok: true },
      { text: "Liens nominatifs + WhatsApp", ok: true },
      { text: "QR Code check-in", ok: false },
      { text: "Export CSV & stats", ok: false },
    ],
  },
  {
    name: "Pro",
    planKey: "pro",
    price: "3 000",
    period: "DA / mois",
    desc: "Pour des événements mémorables, sans limite.",
    pop: true,
    badge: "Populaire",
    cta: "Choisir Pro",
    features: [
      { text: "Invitations illimitées", ok: true },
      { text: "Tous les thèmes (18+)", ok: true },
      { text: "Invités illimités", ok: true },
      { text: "RSVP en ligne", ok: true },
      { text: "Liens nominatifs + email/WhatsApp", ok: true },
      { text: "QR Code check-in à l'entrée", ok: true },
      { text: "Stats & export CSV", ok: true },
      { text: "Support prioritaire", ok: true },
    ],
  },
  {
    name: "Business",
    planKey: "business",
    price: "5 000",
    period: "DA / mois",
    desc: "Entreprises, cliniques, organisateurs d'événements.",
    pop: false,
    cta: "Choisir Business",
    features: [
      { text: "Tout le plan Pro", ok: true },
      { text: "Multi-utilisateurs", ok: true },
      { text: "Marque personnalisée (logo)", ok: true },
      { text: "Domaine personnalisé", ok: true },
      { text: "Portail client B2B", ok: true },
      { text: "API webhooks RSVP", ok: true },
      { text: "Support dédié", ok: true },
      { text: "Onboarding personnalisé", ok: true },
    ],
  },
];

const PACKS = [
  { credits: 5,  label: "Pack Starter", price: "500 DA",   unit: "100 DA / crédit",  pop: false },
  { credits: 15, label: "Pack Pro",     price: "1 500 DA", unit: "100 DA / crédit",  pop: true,  badge: "Meilleur prix" },
  { credits: 40, label: "Pack Studio",  price: "3 500 DA", unit: "≈ 88 DA / crédit", pop: false },
];

const FAQ = [
  { q: "Puis-je changer de plan à tout moment ?", a: "Oui. Vous pouvez upgrader ou downgrader votre abonnement à tout moment depuis votre tableau de bord." },
  { q: "Quelle différence entre abonnement et crédits ?", a: "L'abonnement débloque les thèmes et fonctionnalités (publication illimitée, check-in, stats). Les crédits servent uniquement à la génération par l'IA — utiles ponctuellement, même sur le plan Gratuit." },
  { q: "Quels modes de paiement acceptez-vous ?", a: "CIB, Edahabia (Dahabia) et virement bancaire. Le paiement par carte internationale (Visa/Mastercard) arrive prochainement." },
  { q: "Les crédits IA expirent-ils ?", a: "Non. Vos crédits restent disponibles sans limite de durée et se cumulent avec les 3 crédits offerts à l'inscription." },
  { q: "Mes invitations restent-elles actives si j'arrête mon abonnement ?", a: "Vos invitations passées restent visibles. Vous perdez l'accès aux fonctionnalités Pro mais vos données sont conservées." },
];

const IC_OK = (
  <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="var(--gold)" strokeWidth="1.2"/>
    <path d="M5 8l2 2 4-4" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IC_NO = (
  <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="rgba(184,146,60,0.2)" strokeWidth="1.2"/>
    <path d="M5.5 10.5l5-5M10.5 10.5l-5-5" stroke="rgba(184,146,60,0.25)" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

function PlanCta({ planKey, label, className }: { planKey: string; label: string; className: string }) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  if (status !== "authenticated") {
    return <Link href="/auth" className={className} style={{ width: "100%", justifyContent: "center", marginBottom: "1.5rem", display: "inline-flex", alignItems: "center" }}>{label}</Link>;
  }

  async function subscribe() {
    setLoading(true);
    const res = await fetch("/api/subscriptions/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey }),
    });
    const d = await res.json() as { url?: string; error?: string };
    if (d.url) window.location.href = d.url;
    else { alert(d.error || "Erreur"); setLoading(false); }
  }

  return (
    <button onClick={subscribe} disabled={loading} className={className}
      style={{ width: "100%", justifyContent: "center", marginBottom: "1.5rem", cursor: loading ? "wait" : "pointer" }}>
      {loading ? "Redirection…" : label}
    </button>
  );
}

export default function PricingPage() {
  const [pane, setPane] = useState<"abos" | "credits">("abos");

  return (
    <div className="invytek-page">
      <Nav />

      {/* Hero */}
      <section className="ik-section center" style={{ paddingTop: "clamp(100px,16vw,160px)", paddingBottom: 30 }}>
        <div className="wrap">
          <div className="ornament" style={{ justifyContent: "center" }}>
            <span className="line" />
            <span className="dot" />
            <span className="line r" />
          </div>
          <span className="eyebrow center" style={{ marginTop: 18 }}>Tarifs</span>
          <h1 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2.4rem,6vw,4rem)", color: "var(--ivory)", marginTop: 24, fontWeight: 400 }}>
            Simple, transparent,<br />sans surprise
          </h1>
          <p className="lede center" style={{ margin: "20px auto 0", maxWidth: "48ch" }}>
            Un abonnement pour publier sans limite, des crédits IA à la demande. Payez en Dinars, sans engagement.
          </p>

          {/* Toggle */}
          <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
            <div className="price-toggle">
              <button
                className={pane === "abos" ? "active" : ""}
                onClick={() => setPane("abos")}
              >
                Abonnements
              </button>
              <button
                className={pane === "credits" ? "active violet" : ""}
                onClick={() => setPane("credits")}
              >
                Crédits IA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Panes */}
      <section className="ik-section" style={{ paddingTop: 30, paddingBottom: "clamp(80px,12vw,140px)" }}>
        <div className="wrap">

          {/* Abonnements */}
          <div className={`price-pane${pane === "abos" ? " show" : ""}`}>
            <div className="plans">
              {PLANS.map(plan => (
                <div key={plan.name} className={`plan${plan.pop ? " pop" : ""}`}>
                  {plan.badge && <span className="badge-pop">{plan.badge}</span>}
                  <div className="p-name">{plan.name}</div>
                  <div style={{ fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "#a080e0", marginBottom: 6 }}>Prix de lancement</div>
                  <div className="p-price">
                    <span className="v">{plan.price}</span>
                    <span className="per">{plan.period}</span>
                  </div>
                  <p className="p-desc">{plan.desc}</p>
                  <PlanCta planKey={plan.planKey} label={plan.cta} className={`btn ${plan.pop ? "btn-gold" : "btn-ghost"} btn-sm`} />
                  <div className="p-sep" />
                  <ul className="feats">
                    {plan.features.map(f => (
                      <li key={f.text} className={`feat${f.ok ? "" : " no"}`}>
                        {f.ok ? IC_OK : IC_NO}
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Crédits IA */}
          <div className={`price-pane${pane === "credits" ? " show" : ""}`}>
            <div className="credits-band">
              <div className="credits-head">
                <div className="ci">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2z"/>
                    <path d="M19 14l.9 2.4L22 17l-2.1.6L19 20l-.9-2.4L16 17l2.1-.6z"/>
                  </svg>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--violet)" }}>Crédits IA</div>
                  <div style={{ fontFamily: "var(--font-title)", color: "var(--ivory)", fontSize: "1.25rem" }}>1 crédit = 1 invitation générée par l&apos;IA</div>
                </div>
              </div>
              <p style={{ color: "var(--text-soft)", maxWidth: "48ch", margin: "0 auto" }}>
                Sans abonnement. Les crédits ne périment pas — utilisez-les quand vous voulez. Paiement par Edahabia / CIB.
              </p>

              <div className="packs">
                {PACKS.map(pack => (
                  <div key={pack.label} className={`pack${pack.pop ? " pop" : ""}`}>
                    {pack.badge && <span className="badge-pop">{pack.badge}</span>}
                    <div className="pk-credits">
                      {pack.credits}
                      <small>crédits</small>
                    </div>
                    <div className="pk-label">{pack.label}</div>
                    <div className="pk-price">{pack.price}</div>
                    <div className="pk-unit">{pack.unit}</div>
                    <Link href="/auth" className={`btn ${pack.pop ? "btn-violet" : "btn-ghost"} btn-sm pk-cta`}>
                      Acheter
                    </Link>
                  </div>
                ))}
              </div>

              <p className="tarifs-note">
                Inclus gratuitement : <span className="v">3 crédits offerts</span> à l&apos;inscription.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="ik-section alt">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className="section-head">
            <span className="eyebrow center">FAQ</span>
            <h2>Questions fréquentes</h2>
          </div>
          <div className="faq">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="faq-item">
                <p className="q">{q}</p>
                <p className="a">{a}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <p style={{ color: "var(--text-soft)", marginBottom: "1.2rem" }}>Une question ? Une demande spécifique ?</p>
            <a href="mailto:contact@invytek.app" className="btn btn-ghost btn-sm">Contactez-nous</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
