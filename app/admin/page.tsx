"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { TrialForm } from "./TrialForm";

/* ─── Types ─── */
type GlobalStats = {
  totalUsers: number;
  paidActive: number;
  trialsActive: number;
  freeUsers: number;
  totalInvitations: number;
  publishedInvitations: number;
  totalCredits: number;
};

type TrialUser = {
  id: string;
  email: string;
  plan: string;
  planExpiresAt: string | null;
  createdAt: string;
};

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  planExpiresAt: string | null;
  isTrial: boolean;
  credits: number;
  createdAt: string;
  _count: { invitations: number };
};

/* ─── Helpers ─── */
const PLAN_LABEL: Record<string, string> = { free: "Free", simple: "Simple", pro: "Pro", business: "Business" };
const PLAN_COLOR: Record<string, string> = {
  free:     "rgba(255,255,255,0.08)",
  simple:   "rgba(184,146,60,0.18)",
  pro:      "rgba(184,146,60,0.32)",
  business: "rgba(160,128,224,0.28)",
};
const PLAN_TEXT: Record<string, string> = {
  free: "var(--muted)", simple: "var(--gold-vivid)", pro: "var(--gold-vivid)", business: "#c8a8f0",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function isActive(planExpiresAt: string | null) {
  return planExpiresAt ? new Date(planExpiresAt) > new Date() : false;
}

/* ─── Sub-components ─── */
function StatCard({ label, value, accent, sub }: { label: string; value: number | string; accent?: boolean; sub?: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 120, padding: "18px 20px", borderRadius: 12,
      background: accent ? "rgba(184,146,60,0.08)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${accent ? "rgba(184,146,60,0.22)" : "var(--hair)"}`,
    }}>
      <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: accent ? "var(--gold-vivid)" : "var(--fg)", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span style={{
      fontSize: 11, padding: "3px 10px", borderRadius: 100,
      background: PLAN_COLOR[plan] ?? "rgba(255,255,255,0.06)",
      color: PLAN_TEXT[plan] ?? "var(--muted)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      {PLAN_LABEL[plan] ?? plan}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      fontSize: 11, padding: "3px 10px", borderRadius: 100,
      background: active ? "rgba(82,192,122,0.12)" : "rgba(255,255,255,0.05)",
      color: active ? "#52c07a" : "var(--muted)",
      border: `1px solid ${active ? "rgba(82,192,122,0.25)" : "var(--hair)"}`,
    }}>
      {active ? "Actif" : "Expiré"}
    </span>
  );
}

const th: React.CSSProperties = {
  padding: "12px 14px", textAlign: "left", fontSize: 11,
  letterSpacing: ".12em", textTransform: "uppercase",
  color: "var(--muted)", fontWeight: 500,
};
const td: React.CSSProperties = { padding: "13px 14px", fontSize: 13 };

/* ─── Page ─── */
export default function AdminPage() {
  const router = useRouter();

  const [stats,   setStats]   = useState<GlobalStats | null>(null);
  const [trials,  setTrials]  = useState<TrialUser[]>([]);
  const [users,   setUsers]   = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [revoking,  setRevoking]  = useState<string | null>(null);
  const [extending, setExtending] = useState<Record<string, number>>({});
  const [extLoading, setExtLoading] = useState<string | null>(null);

  const [creditsOpen,  setCreditsOpen]  = useState<string | null>(null);
  const [creditsAmt,   setCreditsAmt]   = useState(3);
  const [creditsLoading, setCreditsLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    const [sRes, tRes, uRes] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/trial"),
      fetch("/api/admin/users"),
    ]);
    if (sRes.status === 403) { router.push("/auth"); return; }
    const [s, t, u] = await Promise.all([sRes.json(), tRes.json(), uRes.json()]);
    setStats(s);
    setTrials(t.trials ?? []);
    setUsers(u.users ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function revoke(userId: string) {
    setRevoking(userId);
    await fetch("/api/admin/trial", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    setRevoking(null);
    fetchAll();
  }

  async function extend(userId: string) {
    const days = extending[userId] ?? 7;
    setExtLoading(userId);
    await fetch("/api/admin/trial", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, days }) });
    setExtLoading(null);
    fetchAll();
  }

  async function addCredits(userId: string) {
    setCreditsLoading(true);
    await fetch("/api/admin/credits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, amount: creditsAmt }) });
    setCreditsLoading(false);
    setCreditsOpen(null);
    setCreditsAmt(3);
    fetchAll();
  }

  const activeTrials  = trials.filter(t => isActive(t.planExpiresAt));
  const expiredTrials = trials.filter(t => !isActive(t.planExpiresAt));

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh", background: "radial-gradient(120% 55% at 50% -10%, rgba(184,146,60,0.07), transparent 55%), var(--bg)" }}>
      <Nav />
      <div className="dash-shell" style={{ paddingTop: 90, maxWidth: 1000 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>Administration</p>
          <h1 style={{ marginBottom: 4 }}>Tableau de bord admin</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Vue globale de la plateforme Invytek.</p>
        </div>

        {/* ── Stats globales ── */}
        {stats && (
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Vue globale</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <StatCard label="Utilisateurs" value={stats.totalUsers} />
              <StatCard label="Payants actifs" value={stats.paidActive} accent />
              <StatCard label="Trials actifs" value={stats.trialsActive} />
              <StatCard label="Comptes free" value={stats.freeUsers} />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <StatCard label="Invitations créées" value={stats.totalInvitations} />
              <StatCard label="Publiées" value={stats.publishedInvitations} accent sub={stats.totalInvitations > 0 ? `${Math.round(stats.publishedInvitations / stats.totalInvitations * 100)}% du total` : undefined} />
              <StatCard label="Crédits IA en circulation" value={stats.totalCredits} />
            </div>
          </div>
        )}

        {/* ── Comptes d'essai ── */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Comptes d'essai</p>

          {/* Form */}
          <div style={{ padding: "22px 26px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid var(--hair-strong)", marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Nouveau compte d'essai</h2>
            <TrialForm onCreated={fetchAll} />
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <StatCard label="Total" value={trials.length} />
            <StatCard label="Actifs" value={activeTrials.length} accent />
            <StatCard label="Expirés" value={expiredTrials.length} />
          </div>

          {/* Table */}
          {loading ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Chargement…</p>
          ) : trials.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Aucun compte d'essai.</p>
          ) : (
            <div style={{ borderRadius: 14, border: "1px solid var(--hair-strong)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hair-strong)" }}>
                    {["Email", "Plan", "Expire le", "Statut", "Actions"].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trials.map((t, i) => {
                    const active = isActive(t.planExpiresAt);
                    const extDays = extending[t.id] ?? 7;
                    return (
                      <tr key={t.id} style={{ borderBottom: i < trials.length - 1 ? "1px solid var(--hair)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                        <td style={td}>{t.email}</td>
                        <td style={td}><PlanBadge plan={t.plan} /></td>
                        <td style={{ ...td, color: "var(--muted)" }}>{t.planExpiresAt ? fmtDate(t.planExpiresAt) : "—"}</td>
                        <td style={td}><StatusBadge active={active} /></td>
                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                          {active && (
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                              {/* Extend */}
                              <select
                                value={extDays}
                                onChange={e => setExtending(prev => ({ ...prev, [t.id]: Number(e.target.value) }))}
                                style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "#1e1812", border: "1px solid rgba(184,146,60,0.25)", color: "#e8d5a8", colorScheme: "dark" }}
                              >
                                {[3, 7, 14, 30].map(d => <option key={d} value={d}>+{d}j</option>)}
                              </select>
                              <button
                                onClick={() => extend(t.id)}
                                disabled={extLoading === t.id}
                                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(184,146,60,0.12)", border: "1px solid rgba(184,146,60,0.3)", color: "var(--gold-vivid)", cursor: "pointer", opacity: extLoading === t.id ? 0.5 : 1 }}
                              >
                                {extLoading === t.id ? "…" : "Étendre"}
                              </button>
                              {/* Revoke */}
                              <button
                                onClick={() => revoke(t.id)}
                                disabled={revoking === t.id}
                                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.22)", color: "#e05252", cursor: "pointer", opacity: revoking === t.id ? 0.5 : 1 }}
                              >
                                {revoking === t.id ? "…" : "Révoquer"}
                              </button>
                            </div>
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

        {/* ── Tous les utilisateurs ── */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>
            Tous les utilisateurs <span style={{ opacity: .5 }}>({users.length})</span>
          </p>

          {loading ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Chargement…</p>
          ) : users.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Aucun utilisateur.</p>
          ) : (
            <div style={{ borderRadius: 14, border: "1px solid var(--hair-strong)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hair-strong)" }}>
                    {["Email", "Plan", "Invitations", "Crédits IA", "Inscrit le", ""].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid var(--hair)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                      <td style={td}>
                        <div>{u.email}</div>
                        {u.isTrial && <div style={{ fontSize: 10, color: "var(--gold)", opacity: .7, marginTop: 1 }}>essai</div>}
                      </td>
                      <td style={td}>
                        <PlanBadge plan={u.plan} />
                        {u.planExpiresAt && (
                          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>
                            {isActive(u.planExpiresAt) ? `→ ${fmtDate(u.planExpiresAt)}` : "expiré"}
                          </div>
                        )}
                      </td>
                      <td style={{ ...td, color: "var(--fg)" }}>{u._count.invitations}</td>
                      <td style={td}>
                        <span style={{ color: u.credits > 0 ? "var(--gold-vivid)" : "var(--muted)" }}>{u.credits}</span>
                      </td>
                      <td style={{ ...td, color: "var(--muted)" }}>{fmtDate(u.createdAt)}</td>
                      <td style={{ ...td, whiteSpace: "nowrap" }}>
                        {creditsOpen === u.id ? (
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={creditsAmt}
                              onChange={e => setCreditsAmt(Math.max(1, Math.min(100, Number(e.target.value))))}
                              style={{ width: 52, fontSize: 12, padding: "4px 8px", borderRadius: 6, background: "#1e1812", border: "1px solid rgba(184,146,60,0.25)", color: "#e8d5a8", colorScheme: "dark" }}
                            />
                            <button
                              onClick={() => addCredits(u.id)}
                              disabled={creditsLoading}
                              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(184,146,60,0.15)", border: "1px solid rgba(184,146,60,0.3)", color: "var(--gold-vivid)", cursor: "pointer" }}
                            >
                              {creditsLoading ? "…" : "OK"}
                            </button>
                            <button
                              onClick={() => setCreditsOpen(null)}
                              style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "transparent", border: "1px solid var(--hair)", color: "var(--muted)", cursor: "pointer" }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setCreditsOpen(u.id); setCreditsAmt(3); }}
                            style={{ fontSize: 11, padding: "4px 11px", borderRadius: 6, background: "rgba(63,169,214,0.08)", border: "1px solid rgba(63,169,214,0.2)", color: "#3FA9D6", cursor: "pointer" }}
                          >
                            + Crédits
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
