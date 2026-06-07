import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Particles } from "@/components/Particles";
import { RevealObserver } from "@/components/RevealObserver";
import { ParallaxInit } from "@/components/ParallaxInit";
import { InviteHero } from "@/components/InviteHero";
import { themeRegistry } from "@/themes/registry";

export const metadata = {
  title: "Invytek — Invitations numériques d'exception",
  description: "Créez des invitations interactives et animées, partagez un simple lien, et recevez les confirmations en temps réel.",
};

export default function HomePage() {
  return (
    <div className="invytek-page">
      <Particles />
      <RevealObserver />
      <ParallaxInit />
      <Nav />

      {/* ── HERO ── */}
      <header className="hero">
        <div className="glow hero-bg-glow-1" data-parallax="-18" />
        <div className="glow hero-bg-glow-2" data-parallax="22" />
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow reveal">L&apos;invitation numérique · version haute couture</span>
              <h1 className="display reveal d1">
                <span className="lead">Vos invitations</span> méritent mieux qu&apos;un fichier PDF.
              </h1>
              <p className="lede reveal d2">
                Créez des invitations interactives et animées, partagez un simple lien, et recevez les confirmations en temps réel.
              </p>
              <div className="hero-actions reveal d3">
                <Link className="btn btn-gold" href="/auth">Créer mon invitation</Link>
                <Link className="btn btn-ghost" href="/themes">Découvrir les thèmes</Link>
              </div>
              <div className="hero-meta reveal d4">
                <span className="av">
                  <span>A</span><span>Y</span><span>L</span><span>M</span>
                </span>
                <span>
                  Déjà <b style={{ color: "var(--gold-light)", fontFamily: "var(--font-title)" }}>3 200+</b> invitations envoyées
                </span>
              </div>
            </div>
            <InviteHero />
          </div>
        </div>
      </header>

      {/* ── APERÇU THÈMES ── */}
      <section className="ik-section alt" id="themes-preview">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="ornament"><span className="line" /><span className="dot" /><span className="line r" /></div>
            <span className="eyebrow center" style={{ marginTop: 18 }}>Une collection signée</span>
            <h2>Choisissez votre style</h2>
            <p>Des thèmes pensés au pixel près pour les mariages, le médical et les événements business. Chacun avec ses animations.</p>
          </div>

          <div style={{ display: "flex", gap: "clamp(20px,5vw,64px)", justifyContent: "center", alignItems: "flex-end", flexWrap: "wrap" }}>
            {/* Or & Arche */}
            <Link href="/i/demo-mariage-2026" className="reveal d1" style={{ textAlign: "center", display: "block", textDecoration: "none" }}>
              <div className="phone" data-parallax="6">
                <div className="notch" />
                <div className="screen">
                  <div className="mini dark">
                    <div className="eb">Mariage</div>
                    <div className="arch"><span className="ar">دعوة</span></div>
                    <div className="nm">Yacine &amp; Lina</div>
                    <div className="dt">12 SEPTEMBRE 2026</div>
                  </div>
                </div>
              </div>
              <p style={{ marginTop: 18, fontFamily: "var(--font-title)", letterSpacing: ".16em", fontSize: 13, color: "var(--gold-light)" }}>
                OR &amp; ARCHE
              </p>
            </Link>

            {/* Bordeaux & Ovale */}
            <a href="/themes-preview/bordeaux-oval.html" className="reveal d2" style={{ textAlign: "center", display: "block", textDecoration: "none" }}>
              <div className="phone" data-parallax="10" style={{ width: 250 }}>
                <div className="notch" />
                <div className="screen">
                  <div className="mini bordeaux">
                    <div className="eb">Mariage · RTL</div>
                    <div className="arch" style={{ borderRadius: "43px 43px 43px 43px / 60px 60px 6px 6px" }}>
                      <span className="ar">حفل زفاف</span>
                    </div>
                    <div className="nm">سارة &amp; أمين</div>
                    <div className="dt" style={{ fontFamily: "var(--font-ar)", direction: "rtl" }}>٢٠ أكتوبر ٢٠٢٦</div>
                  </div>
                </div>
              </div>
              <p style={{ marginTop: 18, fontFamily: "var(--font-title)", letterSpacing: ".16em", fontSize: 13, color: "var(--gold-light)" }}>
                BORDEAUX &amp; OVALE
              </p>
            </a>

            {/* Business */}
            <a href="/themes-preview/soiree-prestige.html" className="reveal d3" style={{ textAlign: "center", display: "block", textDecoration: "none" }}>
              <div className="phone" data-parallax="6">
                <div className="notch" />
                <div className="screen">
                  <div className="mini dark" style={{ background: "radial-gradient(120% 70% at 50% 18%,#1c1a14,#100d08 70%)" }}>
                    <div className="eb">Business</div>
                    <div className="arch" style={{ borderRadius: 10 }}>
                      <span style={{ fontFamily: "var(--font-title)", color: "var(--gold-light)", fontSize: 22 }}>★</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: 22, color: "var(--gold-light)", marginTop: 10, letterSpacing: ".04em" }}>Gala 2026</div>
                    <div className="dt">SAVE THE DATE</div>
                  </div>
                </div>
              </div>
              <p style={{ marginTop: 18, fontFamily: "var(--font-title)", letterSpacing: ".16em", fontSize: 13, color: "var(--gold-light)" }}>
                SOIRÉE PRESTIGE
              </p>
            </a>
          </div>

          <div className="center reveal" style={{ marginTop: 54 }}>
            <Link className="btn btn-ghost" href="/themes">Voir tous les thèmes →</Link>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="ik-section" id="how">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow center">En trois gestes</span>
            <h2>Comment ça marche</h2>
            <p>De l&apos;idée au lien partagé en quelques minutes. Aucune compétence technique requise.</p>
          </div>
          <div className="steps">
            <div className="step reveal d1">
              <div className="num">1</div>
              <div className="ic">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 14h5"/>
                </svg>
              </div>
              <h3>Choisissez</h3>
              <p>Parcourez la collection et sélectionnez le thème qui vous ressemble.</p>
            </div>
            <div className="step reveal d2">
              <div className="num">2</div>
              <div className="ic">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
              </div>
              <h3>Personnalisez</h3>
              <p>Noms, date, lieu, couleurs, musique. Tout se modifie en direct.</p>
            </div>
            <div className="step reveal d3">
              <div className="num">3</div>
              <div className="ic">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/>
                  <path d="M8.2 10.8 15.8 6.4M8.2 13.2l7.6 4.4"/>
                </svg>
              </div>
              <h3>Partagez</h3>
              <p>Un lien unique à envoyer. Les confirmations arrivent automatiquement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="ik-section alt" id="proof">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow center">La différence Invytek</span>
            <h2>Le haut de gamme, par défaut</h2>
            <p>Là où les générateurs habituels s&apos;arrêtent, nous commençons : animation, RTL arabe, et un rendu digne de l&apos;événement.</p>
          </div>
          <div className="stats">
            <div className="stat reveal d1"><div className="v">3 200<small>+</small></div><div className="k">Invitations envoyées</div></div>
            <div className="stat reveal d2"><div className="v">{themeRegistry.length}</div><div className="k">Thèmes signés</div></div>
            <div className="stat reveal d3"><div className="v">94<small>%</small></div><div className="k">De confirmations reçues</div></div>
            <div className="stat reveal d4"><div className="v">4<small>min</small></div><div className="k">Pour créer la vôtre</div></div>
          </div>
        </div>
      </section>

      {/* ── TARIFS RÉSUMÉ ── */}
      <section className="ik-section" id="pricing">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow center">Tarifs</span>
            <h2>Des tarifs simples et transparents</h2>
            <p>Passez au plan Pro quand vous en avez besoin.</p>
          </div>
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, maxWidth: 860, margin: "0 auto 2.5rem" }}>
            {[
              { name: "Pro", price: "3 000 DA/mois", desc: "Illimité · Tous les thèmes · QR Code · Stats", highlight: true },
              { name: "Business", price: "5 000 DA/mois", desc: "Multi-users · Marque perso · Domaine · Support dédié", highlight: false },
            ].map(p => (
              <div key={p.name} style={{ border: p.highlight ? "1px solid rgba(184,146,60,0.6)" : "1px solid var(--hair)", borderRadius: 10, padding: "1.4rem", background: p.highlight ? "linear-gradient(160deg,#2a2010,#1e1808)" : "linear-gradient(160deg,var(--bg-raise),var(--bg))", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>{p.name}</p>
                <p style={{ fontFamily: "var(--font-title)", fontSize: "1.6rem", color: "var(--ivory)", lineHeight: 1, marginBottom: 8 }}>{p.price}</p>
                <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: "center" }}>
            <Link href="/pricing" className="btn btn-ghost btn-sm">Voir les détails →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="ik-section cta-band">
        <div className="glow" style={{ width: 480, height: 480, background: "var(--glow)", left: "50%", top: "30%", transform: "translateX(-50%)" }} />
        <div className="wrap reveal">
          <div className="ornament"><span className="line" /><span className="dot" /><span className="line r" /></div>
          <h2 className="display" style={{ marginTop: 24 }}>
            Offrez une <span className="script" style={{ fontSize: "1.25em" }}>première émotion</span><br />
            à la hauteur de l&apos;événement.
          </h2>
          <p className="lede">Choisissez votre plan, créez votre première invitation en quelques minutes.</p>
          <div style={{ marginTop: 38, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn btn-gold" href="/auth">Créer mon invitation</Link>
            <Link className="btn btn-ghost" href="/pricing">Voir les tarifs</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
