import Link from "next/link";

export default function NotFound() {
  return (
    <div className="invytek-page" style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      padding: "2rem",
    }}>
      {/* Sceau animé */}
      <div style={{
        width: 90, height: 90, borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, #D4AF61, #6E5618)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 0 8px rgba(184,146,60,0.1), 0 0 0 16px rgba(184,146,60,0.05)",
        marginBottom: "2rem",
        animation: "sealFloat 4s ease-in-out infinite",
      }}>
        <svg viewBox="0 0 100 100" width={52} height={52}>
          <text x="50" y="57" textAnchor="middle" dominantBaseline="central"
            fontFamily="Marcellus, serif" fontSize="52" fill="#fff7e6">?</text>
        </svg>
      </div>

      <style>{`@keyframes sealFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }`}</style>

      <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>
        Invitation introuvable
      </p>

      <h1 style={{ fontFamily: "var(--font-script)", fontSize: "clamp(2.5rem,8vw,4.5rem)", color: "var(--ivory)", lineHeight: 1, marginBottom: "1.2rem" }}>
        Cette enveloppe est vide
      </h1>

      <p style={{ color: "var(--text-soft)", fontFamily: "var(--font-title)", fontSize: "0.95rem", maxWidth: "36ch", lineHeight: 1.8, marginBottom: "2.5rem" }}>
        Le lien que vous suivez n&apos;existe pas ou l&apos;invitation a été retirée par son créateur.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/themes" className="btn btn-gold">
          Voir les thèmes
        </Link>
        <Link href="/" className="btn btn-ghost">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
