"use client";
import { useState } from "react";

const PLANS = [
  { value: "simple",   label: "Simple — 1 000 DA/mois" },
  { value: "pro",      label: "Pro — 3 000 DA/mois" },
  { value: "business", label: "Business — 5 000 DA/mois" },
];

const DURATIONS = [
  { value: 3,  label: "3 jours" },
  { value: 7,  label: "1 semaine" },
  { value: 14, label: "2 semaines" },
  { value: 30, label: "1 mois" },
];

export function TrialForm({ onCreated }: { onCreated: () => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan]         = useState("pro");
  const [days, setDays]         = useState(7);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, plan, days }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur inconnue");
      return;
    }

    setSuccess(`Compte créé : ${data.user.email} — Plan ${plan} jusqu'au ${new Date(data.user.planExpiresAt).toLocaleDateString("fr-FR")}`);
    setEmail("");
    setPassword("");
    onCreated();
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <label style={labelStyle}>
          <span style={labelText}>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="prospect@agence.dz"
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          <span style={labelText}>Mot de passe</span>
          <input
            type="text"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="min. 6 caractères"
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          <span style={labelText}>Plan</span>
          <select value={plan} onChange={e => setPlan(e.target.value)} style={inputStyle}>
            {PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </label>
        <label style={labelStyle}>
          <span style={labelText}>Durée</span>
          <select value={days} onChange={e => setDays(Number(e.target.value))} style={inputStyle}>
            {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </label>
      </div>

      {error   && <p style={{ color: "#e05252", fontSize: 13, margin: 0 }}>{error}</p>}
      {success && <p style={{ color: "#52c07a", fontSize: 13, margin: 0 }}>{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-gold btn-sm"
        style={{ alignSelf: "flex-start", opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "Création…" : "Créer le compte d'essai"}
      </button>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelText: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--muted)",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--hair-strong)",
  borderRadius: 8,
  padding: "10px 14px",
  color: "var(--fg)",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
