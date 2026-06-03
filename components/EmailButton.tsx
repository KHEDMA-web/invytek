"use client";

import { useState } from "react";

interface Props {
  url: string;
  guestName?: string;
  contactEmail?: string;
  small?: boolean;
}

export function EmailButton({ url, guestName, contactEmail, small }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const icon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width={small ? 13 : 15} height={small ? 13 : 15}>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M22 7l-10 7L2 7"/>
    </svg>
  );

  // Si on a un email, on envoie via l'API Resend
  if (contactEmail) {
    async function send() {
      setState("sending");
      try {
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: contactEmail, guestName, url }),
        });
        setState(res.ok ? "sent" : "error");
        if (res.ok) setTimeout(() => setState("idle"), 3000);
      } catch {
        setState("error");
      }
    }

    const label = state === "sending" ? "Envoi…" : state === "sent" ? "Envoyé ✓" : state === "error" ? "Erreur" : small ? "Email" : "Envoyer par email";
    const color = state === "sent" ? "#6ecf8a" : state === "error" ? "#c05050" : "#7EB3E8";

    return (
      <button
        onClick={send}
        disabled={state === "sending" || state === "sent"}
        className={`btn btn-ghost${small ? " btn-sm" : ""}`}
        style={{ color, borderColor: `${color}44`, gap: 6 }}
      >
        {icon}
        {label}
      </button>
    );
  }

  // Fallback mailto si pas d'email enregistré
  const subject = guestName ? `Votre invitation — ${guestName}` : "Votre invitation";
  const body = guestName
    ? `Bonjour ${guestName},\n\nVoici votre invitation personnalisée :\n\n${url}\n\nNous espérons vous voir bientôt.`
    : `Bonjour,\n\nVoici votre invitation :\n\n${url}`;

  return (
    <a
      href={`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
      className={`btn btn-ghost${small ? " btn-sm" : ""}`}
      style={{ color: "#7EB3E8", borderColor: "rgba(126,179,232,0.3)", gap: 6 }}
    >
      {icon}
      {small ? "Email" : "Envoyer par email"}
    </a>
  );
}
