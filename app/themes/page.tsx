import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Particles } from "@/components/Particles";
import { RevealObserver } from "@/components/RevealObserver";
import { ParallaxInit } from "@/components/ParallaxInit";
import { ThemeGrid } from "@/components/ThemeGrid";

export const metadata = {
  title: "Invytek — La collection de thèmes",
  description: "Mariages, business, médical, anniversaires. Chaque thème est animé, responsive et prêt à porter votre nom.",
};

export default function ThemesPage() {
  return (
    <div className="invytek-page">
      <Particles />
      <RevealObserver />
      <ParallaxInit />
      <Nav />

      {/* ── HEADER ── */}
      <section className="ik-section" style={{ paddingTop: 160, paddingBottom: 40 }}>
        <div className="glow" style={{ width: 520, height: 520, background: "var(--glow)", top: 0, left: "50%", transform: "translateX(-50%)" }} />
        <div className="wrap">
          <div className="section-head reveal" style={{ marginBottom: 0 }}>
            <div className="ornament"><span className="line" /><span className="dot" /><span className="line r" /></div>
            <span className="eyebrow center" style={{ marginTop: 18 }}>La collection</span>
            <h2>Un thème pour chaque occasion</h2>
            <p>Mariages, business, médical, anniversaires. Chaque thème est animé, responsive et prêt à porter votre nom.</p>
          </div>
        </div>
      </section>

      {/* ── GALERIE ── */}
      <section className="ik-section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <ThemeGrid />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ik-section alt cta-band">
        <div className="glow" style={{ width: 460, height: 460, background: "var(--glow)", left: "50%", top: "20%", transform: "translateX(-50%)" }} />
        <div className="wrap reveal">
          <div className="ornament"><span className="line" /><span className="dot" /><span className="line r" /></div>
          <h2 className="display" style={{ marginTop: 24, fontSize: "clamp(2rem,5vw,3.4rem)" }}>
            Un thème vous fait de l&apos;œil ?
          </h2>
          <p className="lede">Commencez avec « Or &amp; Arche » dès maintenant — les autres arrivent très vite.</p>
          <div style={{ marginTop: 36 }}>
            <Link className="btn btn-gold" href="/i/demo-mariage-2026">Voir la démo live</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
