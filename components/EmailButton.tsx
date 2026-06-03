"use client";

interface Props {
  url: string;
  guestName?: string;
  contactEmail?: string;
  small?: boolean;
}

export function EmailButton({ url, guestName, contactEmail, small }: Props) {
  const subject = guestName
    ? `Votre invitation — ${guestName}`
    : "Votre invitation";
  const body = guestName
    ? `Bonjour ${guestName},\n\nVeuillez trouver ci-dessous votre invitation personnalisée :\n\n${url}\n\nNous espérons vous voir bientôt.`
    : `Bonjour,\n\nVoici votre invitation :\n\n${url}`;

  const href = `mailto:${contactEmail ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <a
      href={href}
      className={`btn btn-ghost${small ? " btn-sm" : ""}`}
      style={{ color: "#7EB3E8", borderColor: "rgba(126,179,232,0.3)", gap: 6 }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width={small ? 13 : 15} height={small ? 13 : 15}>
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M22 7l-10 7L2 7"/>
      </svg>
      {small ? "Email" : "Envoyer par email"}
    </a>
  );
}
