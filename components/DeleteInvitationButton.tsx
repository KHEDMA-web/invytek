"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteInvitationButton({ invitationId }: { invitationId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/invitations/${invitationId}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-title)", fontSize: 12, color: "var(--text-soft)" }}>
          Confirmer la suppression ?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="btn btn-sm"
          style={{ background: "#7a1a1a", color: "#ffd", border: "none" }}
        >
          {loading ? "…" : "Oui, supprimer"}
        </button>
        <button onClick={() => setConfirming(false)} className="btn btn-ghost btn-sm">
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="btn btn-ghost btn-sm"
      style={{ color: "var(--text-faint)", borderColor: "rgba(180,50,50,0.3)" }}
    >
      Supprimer
    </button>
  );
}
