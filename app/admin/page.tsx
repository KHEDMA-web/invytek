"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { TrialForm } from "./TrialForm";

type TrialUser = {
  id: string;
  email: string;
  plan: string;
  planExpiresAt: string | null;
  createdAt: string;
};

const PLAN_LABELS: Record<string, string> = {
  simple: "Simple", pro: "Pro", business: "Business",
};

const PLAN_COLORS: Record<string, string> = {
  simple: "rgba(184,146,60,0.15)",
  pro: "linear-gradient(135deg,rgba(184,146,60,0.3),rgba(184,146,60,0.1))",
  business: "linear-gradient(135deg,rgba(160,128,224,0.3),rgba(112,80,192,0.1))",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminPage() {
  const router = useRouter();
  const [trials, setTrials]     = useState<TrialUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const now = new Date();

  const fetchTrials = useCallback(async () => {
    const res = await fetch("/api/admin/trial");
    if (res.status === 403) { router.push("/auth"); return; }
    const data = await res.json();
    setTrials(data.trials ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchTrials(); }, [fetchTrials]);

  async function revoke(userId: string) {
    setRevoking(userId);
    await fetch("/api/admin/trial", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setRevoking(null);
    fetchTrials();
  }

  const active  = trials.filter(t => t.planExpiresAt && new Date(t.planExpiresAt) > now);
  const expired = trials.filter(t => !t.planExpiresAt || new Date(t.planExpiresAt) <= now);

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh", background: "radial-gradient(120% 55% at 50% -10%, rgba(184,146,60,0.07), transparent 55%), var(--bg)" }}>
      <Nav />
      <div className="dash-shell" style={{ paddingTop: 90, maxWidth: 900 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
            Administration
          </p>
          <h1 style={{ marginBottom: 6 }}>Comptes d'essai</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Créez des accès temporaires pour les prospects qui testent la plateforme.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Total", value: trials.length },
            { label: "Actifs", value: active.length, accent: true },
            { label: "Expirés", value: expired.length },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, padding: "16px 20px", borderRadius: 12,
              background: s.accent ? "rgba(184,146,60,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${s.accent ? "rgba(184,146,60,0.2)" : "var(--hair)"}`,
            }}>
              <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: s.accent ? "var(--gold-vivid)" : "var(--fg)" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ padding: "24px 28px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid var(--hair-strong)", marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Nouveau compte d'essai</h2>
          <TrialForm onCreated={fetchTrials} />
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Chargement…</p>
        ) : trials.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Aucun compte d'essai créé.</p>
        ) : (
          <div style={{ borderRadius: 16, border: "1px solid var(--hair-strong)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--hair-strong)" }}>
                  {["Email", "Plan", "Expire le", "Statut", ""].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trials.map((t, i) => {
                  const isActive = t.planExpiresAt && new Date(t.planExpiresAt) > now;
                  return (
                    <tr key={t.id} style={{ borderBottom: i < trials.length - 1 ? "1px solid var(--hair)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                      <td style={{ padding: "14px 16px", fontSize: 14 }}>{t.email}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 100, background: PLAN_COLORS[t.plan] ?? "rgba(255,255,255,0.06)", color: t.plan === "business" ? "#c8a8f0" : "var(--gold-vivid)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {PLAN_LABELS[t.plan] ?? t.plan}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--muted)" }}>
                        {t.planExpiresAt ? fmtDate(t.planExpiresAt) : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: isActive ? "rgba(82,192,122,0.12)" : "rgba(255,255,255,0.05)", color: isActive ? "#52c07a" : "var(--muted)", border: `1px solid ${isActive ? "rgba(82,192,122,0.25)" : "var(--hair)"}` }}>
                          {isActive ? "Actif" : "Expiré"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {isActive && (
                          <button
                            onClick={() => revoke(t.id)}
                            disabled={revoking === t.id}
                            style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.2)", color: "#e05252", cursor: "pointer", opacity: revoking === t.id ? 0.5 : 1 }}
                          >
                            {revoking === t.id ? "…" : "Révoquer"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
