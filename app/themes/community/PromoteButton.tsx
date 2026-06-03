"use client";

import { useState } from "react";

export function PromoteButton({ id, isPromoted }: { id: string; isPromoted: boolean }) {
  const [promoted, setPromoted] = useState(isPromoted);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/admin/promote-theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, promote: !promoted }),
    });
    if (res.ok) setPromoted(p => !p);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase",
        background: promoted ? "rgba(184,146,60,0.15)" : "rgba(110,80,200,0.12)",
        color: promoted ? "var(--gold)" : "#a080e0",
        border: `1px solid ${promoted ? "rgba(184,146,60,0.3)" : "rgba(110,80,200,0.3)"}`,
        borderRadius: 100, padding: "5px 12px", cursor: "pointer",
      }}
    >
      {loading ? "…" : promoted ? "Officiel ✓" : "Promouvoir"}
    </button>
  );
}
