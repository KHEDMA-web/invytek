import Link from "next/link";

export function Footer() {
  return (
    <footer className="ik-footer">
      <div className="wrap">
        <div className="brand-col">
          <Link className="brand" href="/">
            <svg className="mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path d="M20 3C12 3 6 9 6 18v19h28V18C34 9 28 3 20 3Z" stroke="var(--accent-vivid)" strokeWidth="1.4"/>
              <circle cx="20" cy="19" r="3.4" fill="var(--accent-vivid)"/>
            </svg>
            <b>Invyt<span className="ek">ek</span></b>
          </Link>
          <p>L&apos;invitation numérique qui laisse une vraie première impression. Conçue pour les mariages et les événements qui comptent.</p>
        </div>
        <div>
          <h4>Produit</h4>
          <ul>
            <li><Link href="/themes">Thèmes</Link></li>
            <li><Link href="/#how">Comment ça marche</Link></li>
            <li><Link href="#">Tarifs</Link></li>
          </ul>
        </div>
        <div>
          <h4>Invytek</h4>
          <ul>
            <li><Link href="#">À propos</Link></li>
            <li><Link href="#">Contact</Link></li>
            <li><Link href="#">Confidentialité</Link></li>
          </ul>
        </div>
        <div className="copy">
          <span>© 2026 Invytek. Tous droits réservés.</span>
          <span>Fait avec soin à Alger.</span>
        </div>
      </div>
    </footer>
  );
}
