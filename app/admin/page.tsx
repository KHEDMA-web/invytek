"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { TrialForm } from "./TrialForm";

/* ─── Types ─── */
type GlobalStats = {
  totalUsers: number; paidActive: number; trialsActive: number;
  freeUsers: number; totalInvitations: number; publishedInvitations: number; totalCredits: number;
};
type TrialUser = { id: string; email: string; plan: string; planExpiresAt: string | null; createdAt: string };
type UserRow   = { id: string; email: string; name: string | null; plan: string; planExpiresAt: string | null; isTrial: boolean; credits: number; createdAt: string; _count: { invitations: number } };
type ActionMode = "credits" | "plan";

/* ─── Helpers ─── */
const PLAN_LABEL: Record<string, string> = { free: "Free", simple: "Simple", pro: "Pro", business: "Business" };
const PLAN_COLOR: Record<string, string> = {
  free: "rgba(255,255,255,0.08)", simple: "rgba(184,146,60,0.18)",
  pro:  "rgba(184,146,60,0.32)",  business: "rgba(160,128,224,0.28)",
};
const PLAN_TEXT: Record<string, string> = {
  free: "var(--muted)", simple: "var(--gold-vivid)", pro: "var(--gold-vivid)", business: "#c8a8f0",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function isActive(exp: string | null) { return exp ? new Date(exp) > new Date() : false; }
function hoursLeft(exp: string | null) {
  if (!exp) return Infinity;
  return (new Date(exp).getTime() - Date.now()) / 3_600_000;
}

/* ─── Shared styles ─── */
const th: React.CSSProperties = { padding: "12px 14px", textAlign: "left", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 500 };
const td: React.CSSProperties = { padding: "13px 14px", fontSize: 13 };
const selStyle: React.CSSProperties = { fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "#1e1812", border: "1px solid rgba(184,146,60,0.25)", color: "#e8d5a8", colorScheme: "dark" };

/* ─── Sub-components ─── */
function StatCard({ label, value, accent, sub }: { label: string; value: number | string; accent?: boolean; sub?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 120, padding: "18px 20px", borderRadius: 12, background: accent ? "rgba(184,146,60,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${accent ? "rgba(184,146,60,0.22)" : "var(--hair)"}` }}>
      <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: accent ? "var(--gold-vivid)" : "var(--fg)", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
function PlanBadge({ plan }: { plan: string }) {
  return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: PLAN_COLOR[plan] ?? "rgba(255,255,255,0.06)", color: PLAN_TEXT[plan] ?? "var(--muted)", border: "1px solid rgba(255,255,255,0.08)" }}>{PLAN_LABEL[plan] ?? plan}</span>;
}
function StatusBadge({ active }: { active: boolean }) {
  return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: active ? "rgba(82,192,122,0.12)" : "rgba(255,255,255,0.05)", color: active ? "#52c07a" : "var(--muted)", border: `1px solid ${active ? "rgba(82,192,122,0.25)" : "var(--hair)"}` }}>{active ? "Actif" : "Expiré"}</span>;
}

/* ─── Page ─── */
export default function AdminPage() {
  const router = useRouter();

  const [stats,   setStats]   = useState<GlobalStats | null>(null);
  const [trials,  setTrials]  = useState<TrialUser[]>([]);
  const [users,   setUsers]   = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Trial actions
  const [revoking,   setRevoking]   = useState<string | null>(null);
  const [extending,  setExtending]  = useState<Record<string, number>>({});
  const [extLoading, setExtLoading] = useState<string | null>(null);

  // User actions (credits / plan)
  const [actionOpen,  setActionOpen]  = useState<{ id: string; mode: ActionMode } | null>(null);
  const [creditsAmt,  setCreditsAmt]  = useState(3);
  const [newPlan,     setNewPlan]     = useState("pro");
  const [newPlanDays, setNewPlanDays] = useState(30);
  const [actionLoading, setActionLoading] = useState(false);

  // Search
  const [search, setSearch] = useState("");

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
    setExtLoading(userId);
    await fetch("/api/admin/trial", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, days: extending[userId] ?? 7 }) });
    setExtLoading(null);
    fetchAll();
  }

  async function addCredits(userId: string) {
    setActionLoading(true);
    await fetch("/api/admin/credits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, amount: creditsAmt }) });
    setActionLoading(false);
    setActionOpen(null);
    fetchAll();
  }

  async function changePlan(userId: string) {
    setActionLoading(true);
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, plan: newPlan, days: newPlanDays }) });
    setActionLoading(false);
    setActionOpen(null);
    fetchAll();
  }

  function openAction(id: string, mode: ActionMode) {
    setActionOpen({ id, mode });
    setCreditsAmt(3);
    setNewPlan("pro");
    setNewPlanDays(30);
  }

  // Derived
  const activeTrials   = trials.filter(t => isActive(t.planExpiresAt));
  const expiredTrials  = trials.filter(t => !isActive(t.planExpiresAt));
  const expiringSoon   = activeTrials.filter(t => hoursLeft(t.planExpiresAt) < 48);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(u => u.email.toLowerCase().includes(q) || (u.name ?? "").toLowerCase().includes(q));
  }, [users, search]);

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh", background: "radial-gradient(120% 55% at 50% -10%, rgba(184,146,60,0.07), transparent 55%), var(--bg)" }}>
      <Nav />
      <div className="dash-shell" style={{ paddingTop: 90, maxWidth: 1000 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>Administration</p>
          <h1 style={{ marginBottom: 4 }}>Tableau de bord admin</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Vue globale de la plateforme Invytek.</p>
        </div>

        {/* Stats globales */}
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

          {/* Alerte expiration < 48h */}
          {expiringSoon.length > 0 && (
            <div style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 12, background: "rgba(220,140,30,0.08)", border: "1px solid rgba(220,140,30,0.3)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e8a030", marginBottom: 8 }}>
                ⚠ {expiringSoon.length} essai{expiringSoon.length > 1 ? "s" : ""} expire{expiringSoon.length > 1 ? "nt" : ""} dans moins de 48h
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {expiringSoon.map(t => {
                  const h = hoursLeft(t.planExpiresAt);
                  return (
                    <div key={t.id} style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: "var(--fg)" }}>{t.email}</span>
                      <span>—</span>
                      <span style={{ color: h < 12 ? "#e05252" : "#e8a030" }}>
                        {h < 1 ? "< 1h" : `${Math.round(h)}h restantes`}
                      </span>
                      <PlanBadge plan={t.plan} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <StatCard label="Total" value={trials.length} />
            <StatCard label="Actifs" value={activeTrials.length} accent />
            <StatCard label="Expirés" value={expiredTrials.length} />
          </div>

          {/* Trials table */}
          {loading ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Chargement…</p>
          ) : trials.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Aucun compte d'essai.</p>
          ) : (
            <div style={{ borderRadius: 14, border: "1px solid var(--hair-strong)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hair-strong)" }}>
                    {["Email", "Plan", "Expire le", "Statut", "Actions"].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {trials.map((t, i) => {
                    const active = isActive(t.planExpiresAt);
                    return (
                      <tr key={t.id} style={{ borderBottom: i < trials.length - 1 ? "1px solid var(--hair)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                        <td style={td}>{t.email}</td>
                        <td style={td}><PlanBadge plan={t.plan} /></td>
                        <td style={{ ...td, color: "var(--muted)" }}>{t.planExpiresAt ? fmtDate(t.planExpiresAt) : "—"}</td>
                        <td style={td}><StatusBadge active={active} /></td>
                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                          {active && (
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                              <select value={extending[t.id] ?? 7} onChange={e => setExtending(p => ({ ...p, [t.id]: Number(e.target.value) }))} style={selStyle}>
                                {[3, 7, 14, 30].map(d => <option key={d} value={d}>+{d}j</option>)}
                              </select>
                              <button onClick={() => extend(t.id)} disabled={extLoading === t.id} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(184,146,60,0.12)", border: "1px solid rgba(184,146,60,0.3)", color: "var(--gold-vivid)", cursor: "pointer", opacity: extLoading === t.id ? 0.5 : 1 }}>
                                {extLoading === t.id ? "…" : "Étendre"}
                              </button>
                              <button onClick={() => revoke(t.id)} disabled={revoking === t.id} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.22)", color: "#e05252", cursor: "pointer", opacity: revoking === t.id ? 0.5 : 1 }}>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <p style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", margin: 0 }}>
              Tous les utilisateurs <span style={{ opacity: .5 }}>({filteredUsers.length}{search ? `/${users.length}` : ""})</span>
            </p>
            <input
              type="search"
              placeholder="Filtrer par email ou nom…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--hair-strong)", color: "var(--fg)", outline: "none", width: 240 }}
            />
          </div>

          {loading ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Chargement…</p>
          ) : filteredUsers.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>{search ? "Aucun résultat." : "Aucun utilisateur."}</p>
          ) : (
            <div style={{ borderRadius: 14, border: "1px solid var(--hair-strong)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hair-strong)" }}>
                    {["Email", "Plan", "Invitations", "Crédits IA", "Inscrit le", "Actions"].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => {
                    const isOpen = actionOpen?.id === u.id;
                    const mode   = actionOpen?.mode;
                    return (
                      <tr key={u.id} style={{ borderBottom: i < filteredUsers.length - 1 ? "1px solid var(--hair)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
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
                        <td style={td}><span style={{ color: u.credits > 0 ? "var(--gold-vivid)" : "var(--muted)" }}>{u.credits}</span></td>
                        <td style={{ ...td, color: "var(--muted)" }}>{fmtDate(u.createdAt)}</td>
                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                          {isOpen && mode === "credits" ? (
                            /* ── Crédits form ── */
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <input type="number" min={1} max={100} value={creditsAmt} onChange={e => setCreditsAmt(Math.max(1, Math.min(100, Number(e.target.value))))}
                                style={{ width: 52, fontSize: 12, padding: "4px 8px", borderRadius: 6, background: "#1e1812", border: "1px solid rgba(184,146,60,0.25)", color: "#e8d5a8", colorScheme: "dark" }} />
                              <button onClick={() => addCredits(u.id)} disabled={actionLoading}
                                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(184,146,60,0.15)", border: "1px solid rgba(184,146,60,0.3)", color: "var(--gold-vivid)", cursor: "pointer" }}>
                                {actionLoading ? "…" : "OK"}
                              </button>
                              <button onClick={() => setActionOpen(null)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "transparent", border: "1px solid var(--hair)", color: "var(--muted)", cursor: "pointer" }}>✕</button>
                            </div>
                          ) : isOpen && mode === "plan" ? (
                            /* ── Plan form ── */
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                              <select value={newPlan} onChange={e => setNewPlan(e.target.value)} style={selStyle}>
                                {["free", "simple", "pro", "business"].map(p => <option key={p} value={p} style={{ background: "#1a1508" }}>{PLAN_LABEL[p]}</option>)}
                              </select>
                              {newPlan !== "free" && (
                                <select value={newPlanDays} onChange={e => setNewPlanDays(Number(e.target.value))} style={selStyle}>
                                  {[7, 30, 90, 365].map(d => <option key={d} value={d} style={{ background: "#1a1508" }}>{d}j</option>)}
                                </select>
                              )}
                              <button onClick={() => changePlan(u.id)} disabled={actionLoading}
                                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(160,128,224,0.15)", border: "1px solid rgba(160,128,224,0.35)", color: "#c8a8f0", cursor: "pointer" }}>
                                {actionLoading ? "…" : "OK"}
                              </button>
                              <button onClick={() => setActionOpen(null)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "transparent", border: "1px solid var(--hair)", color: "var(--muted)", cursor: "pointer" }}>✕</button>
                            </div>
                          ) : (
                            /* ── Default buttons ── */
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => openAction(u.id, "credits")}
                                style={{ fontSize: 11, padding: "4px 11px", borderRadius: 6, background: "rgba(63,169,214,0.08)", border: "1px solid rgba(63,169,214,0.2)", color: "#3FA9D6", cursor: "pointer" }}>
                                + Crédits
                              </button>
                              <button onClick={() => openAction(u.id, "plan")}
                                style={{ fontSize: 11, padding: "4px 11px", borderRadius: 6, background: "rgba(160,128,224,0.08)", border: "1px solid rgba(160,128,224,0.22)", color: "#c8a8f0", cursor: "pointer" }}>
                                Plan
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

      </div>
    </div>
  );
}
