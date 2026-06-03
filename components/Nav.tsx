"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="wrap">
        <Link className="brand" href="/">
          <svg className="mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path d="M20 3C12 3 6 9 6 18v19h28V18C34 9 28 3 20 3Z" stroke="var(--accent-vivid)" strokeWidth="1.4"/>
            <path d="M20 8c-5 0-9 4-9 10v14h18V18c0-6-4-10-9-10Z" stroke="var(--accent)" strokeWidth="1" opacity="0.6"/>
            <circle cx="20" cy="19" r="3.4" fill="var(--accent-vivid)"/>
          </svg>
          <b>Invyt<span className="ek">ek</span></b>
        </Link>
        <div className="nav-links">
          <Link href="/themes" className={pathname === "/themes" ? "active" : ""}>Thèmes</Link>
          <Link href="/#how">Comment ça marche</Link>
          <Link href="/#proof">Pourquoi nous</Link>
        </div>
        <div className="nav-cta">
          {status !== "loading" && (
            isLoggedIn
              ? <Link className="btn btn-ghost btn-sm" href="/dashboard">Mon espace</Link>
              : <Link className="btn btn-ghost btn-sm" href="/auth">Se connecter</Link>
          )}
          <Link className="btn btn-gold btn-sm" href="/create">Créer mon invitation</Link>
        </div>
      </div>
    </nav>
  );
}
