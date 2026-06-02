"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddGuestForm({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId, name: name.trim(), contact: contact.trim() || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erreur"); setLoading(false); return; }
    setName("");
    setContact("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="Nom complet *" required
        style={inp}
      />
      <input
        value={contact} onChange={e => setContact(e.target.value)}
        placeholder="Tél / Email (optionnel)"
        style={inp}
      />
      {error && <p style={{ color: "#c05050", fontSize: 13, margin: 0 }}>{error}</p>}
      <button type="submit" disabled={loading || !name.trim()} className="btn btn-gold btn-sm">
        {loading ? "Ajout…" : "Ajouter l'invité"}
      </button>
    </form>
  );
}

const inp: React.CSSProperties = {
  width: "100%", padding: "0.7rem 0.9rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(184,146,60,0.2)",
  borderRadius: 8, outline: "none",
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "1rem", color: "#FCFAF5",
  boxSizing: "border-box",
};
