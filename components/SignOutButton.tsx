"use client";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-ghost btn-sm">
      Déconnexion
    </button>
  );
}
