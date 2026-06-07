import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mentions légales & CGU",
  description: "Conditions générales d'utilisation et mentions légales d'Invytek.",
  robots: "noindex",
};

const S = {
  h2: { fontFamily: "var(--font-title)", fontWeight: 400, fontSize: "1.5rem", color: "var(--ivory)", marginTop: "2.5rem", marginBottom: "0.8rem" } as React.CSSProperties,
  h3: { fontFamily: "var(--font-title)", fontWeight: 400, fontSize: "1.1rem", color: "var(--gold-light)", marginTop: "1.5rem", marginBottom: "0.5rem" } as React.CSSProperties,
  p:  { color: "var(--text-soft)", lineHeight: 1.8, marginBottom: "0.8rem", fontSize: "1rem" } as React.CSSProperties,
  li: { color: "var(--text-soft)", lineHeight: 1.8, fontSize: "1rem" } as React.CSSProperties,
};

export default function LegalPage() {
  return (
    <div className="invytek-page" style={{ minHeight: "100dvh" }}>
      <Nav />
      <div className="wrap" style={{ paddingTop: 110, paddingBottom: "5rem", maxWidth: 760 }}>

        <div style={{ marginBottom: "3rem" }}>
          <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>
            Légal
          </div>
          <h1 style={{ fontFamily: "var(--font-title)", fontWeight: 400, fontSize: "clamp(2rem,5vw,3rem)", color: "var(--ivory)" }}>
            Mentions légales & CGU
          </h1>
          <p style={{ color: "var(--text-faint)", marginTop: 8 }}>Dernière mise à jour : juin 2026</p>
        </div>

        <div style={{ border: "1px solid var(--hair)", borderRadius: 16, padding: "2rem 2.5rem", background: "linear-gradient(160deg, var(--bg-raise), var(--bg))" }}>

          <h2 style={S.h2}>1. Éditeur du site</h2>
          <p style={S.p}>
            Le site <strong>Invytek</strong> (accessible à l'adresse invytek.vercel.app) est édité par une entité algérienne.
            Contact : <a href="mailto:contact@invytek.app" style={{ color: "var(--gold)" }}>contact@invytek.app</a>
          </p>

          <h2 style={S.h2}>2. Hébergement</h2>
          <p style={S.p}>
            Le site est hébergé par <strong>Vercel Inc.</strong> (340 Pine Street, Suite 1600, San Francisco, CA 94104, USA)
            et utilise une base de données <strong>Neon</strong> (PostgreSQL serverless, hébergée sur AWS us-east-1).
          </p>

          <h2 style={S.h2}>3. Conditions générales d'utilisation</h2>
          <h3 style={S.h3}>3.1 Accès au service</h3>
          <p style={S.p}>
            L'accès au service Invytek est réservé aux professionnels (agences événementielles, particuliers) ayant souscrit
            à l'un des plans disponibles ou disposant de crédits IA. Toute utilisation frauduleuse est interdite.
          </p>

          <h3 style={S.h3}>3.2 Compte utilisateur</h3>
          <p style={S.p}>
            Vous êtes responsable de la confidentialité de vos identifiants. Invytek ne peut être tenu responsable
            des accès non autorisés résultant d'une négligence de votre part.
          </p>

          <h3 style={S.h3}>3.3 Contenu des invitations</h3>
          <p style={S.p}>
            Vous êtes seul responsable du contenu publié via Invytek. Est strictement interdit tout contenu :
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "0.8rem" }}>
            {["Contraire aux lois algériennes en vigueur", "À caractère diffamatoire, raciste ou pornographique", "Portant atteinte aux droits de tiers"].map(item => (
              <li key={item} style={S.li}>{item}</li>
            ))}
          </ul>

          <h3 style={S.h3}>3.4 Abonnements et paiements</h3>
          <p style={S.p}>
            Les paiements sont traités par <strong>Chargily Pay</strong> (CIB / Edahabia). Invytek n'a pas accès à vos
            données bancaires. Les abonnements sont valables 30 jours sans reconduction automatique.
            Les crédits IA achetés n'ont pas de date d'expiration.
          </p>
          <p style={S.p}>
            Aucun remboursement n'est accordé pour les crédits déjà utilisés ou les plans déjà activés.
          </p>

          <h3 style={S.h3}>3.5 Disponibilité du service</h3>
          <p style={S.p}>
            Invytek s'efforce d'assurer la disponibilité du service 24h/24 et 7j/7, sans garantie de continuité.
            Des interruptions de maintenance peuvent survenir.
          </p>

          <h2 style={S.h2}>4. Protection des données personnelles</h2>
          <h3 style={S.h3}>4.1 Données collectées</h3>
          <p style={S.p}>Invytek collecte les données suivantes :</p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "0.8rem" }}>
            {[
              "Adresse email et nom (inscription)",
              "Réponses RSVP des invités (nom, statut de présence, message optionnel)",
              "Données de navigation (logs serveur, compteur de vues)",
            ].map(item => (
              <li key={item} style={S.li}>{item}</li>
            ))}
          </ul>

          <h3 style={S.h3}>4.2 Utilisation des données</h3>
          <p style={S.p}>
            Vos données sont utilisées exclusivement pour le fonctionnement du service (authentification, envoi d'emails,
            gestion des RSVP). Elles ne sont jamais vendues ni partagées avec des tiers à des fins commerciales.
          </p>

          <h3 style={S.h3}>4.3 Droit à l'effacement</h3>
          <p style={S.p}>
            Vous pouvez demander la suppression de votre compte et de toutes vos données en écrivant à{" "}
            <a href="mailto:contact@invytek.app" style={{ color: "var(--gold)" }}>contact@invytek.app</a>.
            La suppression sera effectuée dans un délai de 30 jours.
          </p>

          <h3 style={S.h3}>4.4 Cookies</h3>
          <p style={S.p}>
            Invytek utilise uniquement les cookies nécessaires au fonctionnement du service (session d'authentification).
            Aucun cookie de tracking ou publicitaire n'est utilisé.
          </p>

          <h2 style={S.h2}>5. Propriété intellectuelle</h2>
          <p style={S.p}>
            Le nom, le logo et les thèmes d'invitation Invytek sont la propriété exclusive de leurs créateurs.
            Les thèmes générés par l'IA appartiennent à l'agence qui les a commandés.
          </p>

          <h2 style={S.h2}>6. Droit applicable</h2>
          <p style={S.p}>
            Les présentes CGU sont soumises au droit algérien. En cas de litige, les parties rechercheront
            en priorité une résolution amiable avant tout recours judiciaire.
          </p>

          <h2 style={S.h2}>7. Contact</h2>
          <p style={S.p}>
            Pour toute question relative aux présentes mentions légales :{" "}
            <a href="mailto:contact@invytek.app" style={{ color: "var(--gold)" }}>contact@invytek.app</a>
          </p>

        </div>
      </div>
      <Footer />
    </div>
  );
}
