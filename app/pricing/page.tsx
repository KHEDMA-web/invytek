import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs — Invytek",
  description: "Créez des invitations digitales premium pour vos événements. Gratuit pour commencer.",
};

const PLANS = [
  {
    name: "Gratuit",
    price: "0",
    period: "pour toujours",
    description: "Parfait pour découvrir Invytek.",
    highlight: false,
    cta: "Commencer gratuitement",
    ctaHref: "/auth",
    features: [
      { text: "1 invitation active", ok: true },
      { text: "3 thèmes disponibles", ok: true },
      { text: "10 invités nominatifs", ok: true },
      { text: "RSVP en ligne", ok: true },
      { text: "Lien public partageable", ok: true },
      { text: "Thèmes Business & Médical", ok: false },
      { text: "QR Code check-in", ok: false },
      { text: "Stats & exports", ok: false },
    ],
  },
  {
    name: "Pro",
    price: "990",
    period: "DA / mois",
    description: "Pour des événements mémorables, sans limite.",
    highlight: true,
    cta: "Choisir Pro",
    ctaHref: "/auth",
    badge: "Populaire",
    features: [
      { text: "Invitations illimitées", ok: true },
      { text: "Tous les thèmes (12+)", ok: true },
      { text: "Invités illimités", ok: true },
      { text: "RSVP en ligne", ok: true },
      { text: "Liens nominatifs + email/WhatsApp", ok: true },
      { text: "QR Code check-in à l'entrée", ok: true },
      { text: "Stats en temps réel", ok: true },
      { text: "Support prioritaire", ok: false },
    ],
  },
  {
    name: "Business",
    price: "2 900",
    period: "DA / mois",
    description: "Entreprises, cliniques, organisateurs d'événements.",
    highlight: false,
    cta: "Contacter l'équipe",
    ctaHref: "mailto:contact@invytek.app",
    features: [
      { text: "Tout le plan Pro", ok: true },
      { text: "Multi-utilisateurs", ok: true },
      { text: "Marque personnalisée (logo)", ok: true },
      { text: "Domaine personnalisé", ok: true },
      { text: "Export CSV invités & RSVP", ok: true },
      { text: "API webhooks RSVP", ok: true },
      { text: "Support dédié", ok: true },
      { text: "Onboarding personnalisé", ok: true },
    ],
  },
];

const FAQ = [
  { q: "Puis-je changer de plan à tout moment ?", a: "Oui. Vous pouvez upgrader ou downgrader votre abonnement à tout moment depuis votre tableau de bord." },
  { q: "Comment fonctionne le plan Gratuit ?", a: "Le plan Gratuit est permanent. Vous pouvez créer une invitation et jusqu'à 10 invités nominatifs sans jamais payer." },
  { q: "Quels modes de paiement acceptez-vous ?", a: "CIB, Dahabia, virement bancaire. Le paiement par carte internationale (Visa/Mastercard) arrive prochainement." },
  { q: "Mes invitations restent-elles actives si j'arrête mon abonnement ?", a: "Vos invitations passées restent visibles. Vous perdez l'accès aux fonctionnalités Pro mais vos données sont conservées." },
];

export default function PricingPage() {
  return (
    <div className="invytek-page">
      <Nav />

      {/* Hero */}
      <section className="ik-section center" style={{ paddingTop: "clamp(100px,16vw,160px)", paddingBottom: "clamp(60px,10vw,100px)" }}>
        <div className="wrap">
          <span className="eyebrow center">Tarifs</span>
          <h1 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2.4rem,6vw,4rem)", color: "var(--ivory)", marginTop: 24, fontWeight: 400 }}>
            Simple, transparent,<br />sans surprise
          </h1>
          <p className="lede center" style={{ margin: "20px auto 0", maxWidth: "42ch" }}>
            Commencez gratuitement. Passez au plan Pro quand vous en avez besoin.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="ik-section" style={{ paddingTop: 0, paddingBottom: "clamp(80px,12vw,140px)" }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{
                position: "relative",
                background: plan.highlight
                  ? "linear-gradient(160deg, #2a2010, #1e1808)"
                  : "linear-gradient(160deg, var(--bg-raise), var(--bg))",
                border: plan.highlight ? "1px solid rgba(184,146,60,0.6)" : "1px solid var(--hair)",
                borderRadius: 12,
                padding: "2rem",
                boxShadow: plan.highlight ? "0 30px 80px -30px rgba(184,146,60,0.25)" : "none",
              }}>
                {plan.badge && (
                  <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, var(--gold-vivid), var(--accent))", color: "#2a2008", fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", padding: "4px 14px", borderRadius: 100 }}>
                    {plan.badge}
                  </span>
                )}

                {/* Header */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>{plan.name}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2.2rem,5vw,2.8rem)", color: "var(--ivory)", lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontFamily: "var(--font-title)", fontSize: 13, color: "var(--text-faint)" }}>{plan.period}</span>
                  </div>
                  <p style={{ color: "var(--text-soft)", fontSize: "0.95rem", marginTop: 8, lineHeight: 1.5 }}>{plan.description}</p>
                </div>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={`btn ${plan.highlight ? "btn-gold" : "btn-ghost"} btn-sm`}
                  style={{ width: "100%", justifyContent: "center", marginBottom: "1.5rem" }}
                >
                  {plan.cta}
                </Link>

                {/* Separator */}
                <div style={{ height: 1, background: "var(--hair)", marginBottom: "1.4rem" }} />

                {/* Features */}
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f.text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", color: f.ok ? "var(--text-soft)" : "var(--text-faint)", opacity: f.ok ? 1 : 0.5 }}>
                      {f.ok ? (
                        <svg viewBox="0 0 16 16" fill="none" width={16} height={16} style={{ flexShrink: 0 }}>
                          <circle cx="8" cy="8" r="7" stroke="var(--gold)" strokeWidth="1.2"/>
                          <path d="M5 8l2 2 4-4" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 16 16" fill="none" width={16} height={16} style={{ flexShrink: 0 }}>
                          <circle cx="8" cy="8" r="7" stroke="rgba(184,146,60,0.2)" strokeWidth="1.2"/>
                          <path d="M5.5 10.5l5-5M10.5 10.5l-5-5" stroke="rgba(184,146,60,0.25)" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      )}
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ik-section alt">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <div className="section-head">
            <span className="eyebrow center">FAQ</span>
            <h2>Questions fréquentes</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FAQ.map(({ q, a }) => (
              <div key={q} style={{ border: "1px solid var(--hair)", borderRadius: 10, padding: "1.2rem 1.4rem", background: "rgba(184,146,60,0.03)" }}>
                <p style={{ fontFamily: "var(--font-title)", fontSize: "1rem", color: "var(--ivory)", marginBottom: 8 }}>{q}</p>
                <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>

          {/* CTA final */}
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
