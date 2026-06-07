import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import type { WeddingContent } from "@/lib/schemas/wedding";

const CAT_MAP: Record<string, string> = {
  "gold-arch": "Mariage", "bordeaux-oval": "Mariage · RTL", "ivoire-minimal": "Mariage",
  "couronne-royale": "Mariage", "glycine-bleue": "Mariage", "rose-poudre": "Mariage",
  "ivoire-embosse": "Mariage", "sceau-de-rose": "Mariage",
  "confettis-or": "Anniversaire", "anniv-neon": "Anniversaire",
  "baby-shower": "Bébé",
  "soiree-prestige": "Business", "conference-tech": "Business", "inauguration": "Business",
  "bordeaux-imperial": "Business",
  "blouse-lys": "Médical", "congres-medical": "Médical", "sensibilisation": "Médical",
  "dynamic": "IA",
};

const THEME_NAMES: Record<string, string> = {
  "gold-arch": "Or & Arche", "bordeaux-oval": "Bordeaux & Ovale", "ivoire-minimal": "Ivoire Minimal",
  "couronne-royale": "Couronne Royale", "glycine-bleue": "Glycine Bleue", "rose-poudre": "Rose Poudré",
  "ivoire-embosse": "Ivoire Embossé", "sceau-de-rose": "Sceau de Rose",
  "confettis-or": "Confettis d'Or", "anniv-neon": "Neon Burst",
  "baby-shower": "Baby Shower",
  "soiree-prestige": "Soirée Prestige", "conference-tech": "Conférence Tech", "inauguration": "Inauguration",
  "bordeaux-imperial": "Bordeaux Impérial",
  "blouse-lys": "Blouse & Lys", "congres-medical": "Congrès Médical", "sensibilisation": "Sensibilisation",
  "dynamic": "Thème IA",
};

const STATUS_LABELS: Record<string, string> = {
  published: "Publié", draft: "Brouillon", archived: "Archivé",
};

function fmtDate(d: string) {
  const mo = ["jan.","fév.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
  const dt = new Date(d + "T12:00:00");
  return `${dt.getDate()} ${mo[dt.getMonth()]} ${dt.getFullYear()}`;
}

function ThemeMini({ themeId, n1, n2, date }: { themeId: string; n1: string; n2: string; date: string }) {
  const d = new Date(date + "T12:00:00");
  const dt = `${String(d.getDate()).padStart(2,"0")} · ${String(d.getMonth()+1).padStart(2,"0")} · ${d.getFullYear()}`;

  if (themeId === "gold-arch") return (
    <div className="tm tm--gold-arch">
      <div className="tm-eb">Vous êtes invités</div>
      <div className="tm-arch">
        <div className="nm">{n1.split(" ")[0]}</div>
        <div className="amp">&amp;</div>
        <div className="nm">{n2.split(" ")[0]}</div>
        <div className="dt">{dt}</div>
      </div>
    </div>
  );

  if (themeId === "bordeaux-oval") return (
    <div className="tm tm--bordeaux-oval">
      <div className="tm-eb">دعوة زواج</div>
      <div className="tm-oval">
        <div className="bism">بسم الله</div>
        <div className="ar">{n1.split(" ")[0]}</div>
        <div className="flo">✿</div>
        <div className="ar">{n2.split(" ")[0]}</div>
      </div>
    </div>
  );

  if (themeId === "ivoire-minimal") return (
    <div className="tm tm--ivoire-minimal">
      <div className="ln" />
      <div className="mar">Mariage de</div>
      <div className="nm">{n1.split(" ")[0]}</div>
      <div className="et">et</div>
      <div className="nm">{n2.split(" ")[0]}</div>
      <div className="dia" />
      <div className="dt">{dt}</div>
    </div>
  );

  if (themeId === "confettis-or") return (
    <div className="tm tm--confettis-or">
      <div className="nm">{n1.split(" ")[0]}</div>
      <div className="age">★</div>
      <div className="ans">Anniversaire</div>
    </div>
  );

  if (themeId === "anniv-neon") return (
    <div className="tm tm--anniv-neon">
      <div className="ring" />
      <div className="age">✦</div>
      <div className="nm">{n1.split(" ")[0]}</div>
      <div className="ans">Fête</div>
    </div>
  );

  if (themeId === "baby-shower") return (
    <div className="tm tm--baby-shower">
      <div className="cloud" />
      <div className="nm">{n1}</div>
      <div className="sub">Bienvenue !</div>
      <div className="dots">
        <span style={{ background: "#9fc6d8" }} />
        <span style={{ background: "#e8b6c8" }} />
        <span style={{ background: "#cfe1ea" }} />
      </div>
    </div>
  );

  if (themeId === "soiree-prestige") return (
    <div className="tm tm--soiree-prestige">
      <div className="sp-frame" />
      <div className="beb">Vous êtes convié</div>
      <div className="ttl">{n1}</div>
      <div className="org">{n2}</div>
      <div className="dia" />
      <div className="sdt">{dt}</div>
    </div>
  );

  if (themeId === "conference-tech") return (
    <div className="tm tm--conference-tech">
      <div className="ctag">conf://2026</div>
      <div className="ttl">{n1}</div>
      <div className="org">{n2}</div>
      <div className="cdt">{dt}</div>
    </div>
  );

  if (themeId === "inauguration") return (
    <div className="tm tm--inauguration">
      <div className="ribbon"><div className="band" /><div className="cut" /></div>
      <div className="ieb">Inauguration</div>
      <div className="ttl">{n1}</div>
      <div className="org">{n2}</div>
      <div className="idt">{dt}</div>
    </div>
  );

  if (themeId === "blouse-lys") return (
    <div className="tm tm--blouse-lys">
      <div className="cross" />
      <div className="lys">🌿</div>
      <div className="beb">Invitation</div>
      <div className="nm">{n1}</div>
      <div className="spec">{n2}</div>
      <div className="ldt">{dt}</div>
    </div>
  );

  if (themeId === "congres-medical") return (
    <div className="tm tm--congres-medical">
      <div className="badge2"><div className="hole" /><div className="cx">✦</div></div>
      <div className="meb">Congrès</div>
      <div className="ttl">{n1}</div>
      <div className="org">{n2}</div>
      <div className="mdt">{dt}</div>
    </div>
  );

  if (themeId === "sensibilisation") return (
    <div className="tm tm--sensibilisation">
      <div className="aw" />
      <div className="seb">Campagne</div>
      <div className="ttl">{n1}</div>
      <div className="org">{n2}</div>
      <div className="sdt">{dt}</div>
    </div>
  );

  if (themeId === "couronne-royale") return (
    <div className="tm tm--couronne-royale" style={{ background: "radial-gradient(120% 70% at 50% 16%,#16234f,#0b1330 72%)", color: "#F6F1E4" }}>
      <div className="tm-eb" style={{ color: "#E7C76C" }}>Mariage · Prestige</div>
      <svg viewBox="0 0 120 92" style={{ width: 44, height: 34, margin: "8px auto 0", display: "block" }} fill="none">
        <path d="M12 78 L18 34 L40 58 L60 22 L80 58 L102 34 L108 78 Z" fill="#E7C76C" stroke="#8A6A28" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M12 78 L108 78 L106 88 L14 88 Z" fill="#C29A4B"/>
        <circle cx="60" cy="14" r="5" fill="#E7C76C"/>
      </svg>
      <div className="nm" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 28, color: "#F3E2A8", marginTop: 6, marginBottom: 14 }}>{n1.split(" ")[0]}</div>
      <div className="dt" style={{ color: "#E7C76C" }}>{dt}</div>
    </div>
  );

  if (themeId === "glycine-bleue") return (
    <div className="tm tm--glycine-bleue" style={{ background: "linear-gradient(170deg,#FBFAF5,#F3F0E8)", color: "#22304F" }}>
      <div className="tm-eb" style={{ color: "#5C7BB8" }}>Mariage</div>
      <div style={{ position: "relative", width: 80, height: 52, margin: "10px auto 0", background: "linear-gradient(160deg,#1E3A6E,#16294E)", border: "1px solid rgba(196,154,72,.4)" }}>
        <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0,100% 0,50% 72%)", background: "#26477f" }} />
        <div style={{ position: "absolute", left: "50%", top: "48%", transform: "translate(-50%,-50%)", width: 18, height: 18, borderRadius: "50%", background: "radial-gradient(circle at 38% 34%,#E0BC6A,#C49A48 62%,#9a7430)" }} />
      </div>
      <div className="nm" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 26, color: "#1E3A6E", marginTop: 8, marginBottom: 14 }}>{n1.split(" ")[0]}</div>
      <div className="dt" style={{ color: "#5C7BB8" }}>{dt}</div>
    </div>
  );

  if (themeId === "rose-poudre") return (
    <div className="tm tm--rose-poudre" style={{ background: "linear-gradient(170deg,#FEF8F9,#FBEFF1)", color: "#A85A6C" }}>
      <div className="tm-eb" style={{ color: "#C77B8B" }}>Mariage</div>
      <div style={{ position: "relative", width: 80, height: 52, margin: "10px auto 0", background: "linear-gradient(160deg,#E8B6C2,#C77B8B)", border: "1px solid rgba(196,154,72,.35)" }}>
        <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0,100% 0,50% 72%)", background: "#E1A8B6" }} />
        <div style={{ position: "absolute", left: "50%", top: "48%", transform: "translate(-50%,-50%)", width: 18, height: 18, borderRadius: "50%", background: "radial-gradient(circle at 38% 34%,#E0BC6A,#C49A48 62%,#9a7430)" }} />
      </div>
      <div className="nm" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 26, color: "#A85A6C", marginTop: 8, marginBottom: 14 }}>{n1.split(" ")[0]}</div>
      <div className="dt" style={{ color: "#C77B8B" }}>{dt}</div>
    </div>
  );

  if (themeId === "ivoire-embosse") return (
    <div className="tm tm--ivoire-embosse" style={{ background: "linear-gradient(170deg,#F3EEE2,#E9E2D3)", color: "#564A35" }}>
      <div className="tm-eb" style={{ color: "#6F6048" }}>Mariage · Minimal</div>
      <div style={{ width: 40, height: 40, borderRadius: "50%", margin: "10px auto 0", background: "radial-gradient(circle at 40% 36%,#8C6440,#6B4A2E 60%,#4d3420)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 22, color: "#EBDFD0" }}>{n1[0]?.toUpperCase() || "B"}</span>
      </div>
      <div className="nm" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 26, color: "#564A35", marginTop: 8, marginBottom: 14 }}>{n1.split(" ")[0]}</div>
      <div className="dt" style={{ color: "#6F6048" }}>{dt}</div>
    </div>
  );

  if (themeId === "sceau-de-rose") return (
    <div className="tm tm--sceau-de-rose" style={{ background: "linear-gradient(170deg,#FAF3E4,#F0E6D2)", color: "#5A4326" }}>
      <div className="tm-eb" style={{ color: "#BF9A48" }}>Mariage</div>
      <div style={{ width: 40, height: 40, borderRadius: "50%", margin: "10px auto 0", background: "radial-gradient(circle at 40% 34%,#CC4A40,#A82828 55%,#7E1A1A)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 6px rgba(0,0,0,.2)" }}>
        <span style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 20, color: "#E89A92" }}>{n1[0]?.toUpperCase() || "M"}</span>
      </div>
      <div className="nm" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: 26, color: "#5A4326", marginTop: 8, marginBottom: 14 }}>{n1.split(" ")[0]}</div>
      <div className="dt" style={{ color: "#BF9A48" }}>{dt}</div>
    </div>
  );

  if (themeId === "bordeaux-imperial") return (
    <div className="tm tm--bordeaux-imperial" style={{ background: "radial-gradient(120% 70% at 50% 30%,#4a121e,#160509 72%)", color: "#F5ECDC" }}>
      <div className="tm-eb" style={{ color: "#E1C06C" }}>Business · Gala</div>
      <svg viewBox="0 0 230 60" style={{ width: 90, height: 24, margin: "10px auto 2px", display: "block" }} fill="none">
        <g stroke="#E1C06C" strokeWidth="1.6" strokeLinecap="round">
          <path d="M115 8 C115 20 108 26 100 30 C112 32 116 40 115 52"/>
          <path d="M100 30 C78 24 62 36 56 20 C50 36 36 30 22 38"/>
          <path d="M130 30 C152 24 168 36 174 20 C180 36 194 30 208 38"/>
        </g>
        <circle cx="115" cy="6" r="3" fill="#E1C06C"/>
      </svg>
      <div className="nm" style={{ fontFamily: "var(--font-title)", fontSize: 18, color: "#F1DDA2", letterSpacing: ".05em", marginTop: 4, marginBottom: 14 }}>{n1}</div>
      <div className="dt" style={{ color: "#C76B79" }}>{n2}</div>
    </div>
  );

  return (
    <div className="tm tm--dynamic">
      <div className="ai-glow">✨</div>
      <div className="ai-lbl">Thème IA</div>
      <div className="ai-nm">{n1}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth");

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, credits: true, plan: true, planExpiresAt: true },
  });
  if (!dbUser) redirect("/auth");

  const planActive = dbUser.plan !== "free" && dbUser.planExpiresAt && dbUser.planExpiresAt > new Date();
  const currentPlan = planActive ? dbUser.plan : "free";

  const invitations = await prisma.invitation.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      guests: { select: { status: true, checkedInAt: true } },
      _count: { select: { views: true } },
    },
  });

  const credits = dbUser.credits;

  const totalGuests = invitations.reduce((s, i) => s + i.guests.length, 0);
  const totalConfirmed = invitations.reduce((s, i) => s + i.guests.filter(g => g.status === "attending").length, 0);

  return (
    <div className="invytek-page" style={{ minHeight: "100dvh", background: "radial-gradient(120% 55% at 50% -10%, rgba(184,146,60,0.07), transparent 55%), var(--bg)" }}>
      <Nav />
      <div className="dash-shell" style={{ paddingTop: 90 }}>

        {/* Header */}
        <div className="dash-head">
          <div>
            <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
              Tableau de bord
            </p>
            <h1>Mes invitations</h1>
            <p>Créez, partagez et suivez vos invitations en temps réel.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {currentPlan !== "free" && (
              <span style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase",
                padding: "5px 12px", borderRadius: 100,
                background: currentPlan === "business" ? "linear-gradient(135deg,#a080e0,#7050c0)" : currentPlan === "pro" ? "linear-gradient(135deg,var(--gold-vivid),var(--accent))" : "rgba(184,146,60,0.15)",
                color: currentPlan === "business" ? "#fff" : currentPlan === "pro" ? "#2a2008" : "var(--gold-vivid)",
                border: currentPlan === "simple" ? "1px solid var(--hair-strong)" : "none" }}>
                {currentPlan === "business" ? "Business" : currentPlan === "pro" ? "Pro" : "Simple"} ✓
              </span>
            )}
            <Link href="/create" className="btn btn-gold btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Créer une invitation
            </Link>
          </div>
        </div>

        {/* Stats */}
        {invitations.length > 0 && (
          <div className="dash-stats-row">
            <div className="stat-card-d">
              <div className="sc-k">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                Invitations
              </div>
              <div className="sc-v">{invitations.length}</div>
            </div>
            <div className="stat-card-d">
              <div className="sc-k">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-3.3 3-5 6-5s6 1.7 6 5"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6"/><path d="M18 15c2.3.5 4 2.2 4 5"/></svg>
                Invités
              </div>
              <div className="sc-v">{totalGuests}</div>
            </div>
            <div className="stat-card-d violet">
              <div className="sc-k">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                Confirmés
              </div>
              <div className="sc-v">{totalConfirmed}<small>/ {totalGuests}</small></div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {invitations.length === 0 && (
          <div className="dash-empty-v2">
            <div className="ee-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18"/></svg>
            </div>
            <h2>Votre première invitation vous attend</h2>
            <p>Choisissez un thème, personnalisez le texte et partagez un lien — vos confirmations arrivent ici en temps réel.</p>
            <Link href="/create" className="btn btn-gold btn-sm">
              + Créer mon invitation
            </Link>
          </div>
        )}

        {/* Invitation grid */}
        {invitations.length > 0 && (
          <div className="inv-grid">
            {invitations.map(inv => {
              const content = JSON.parse(inv.content) as WeddingContent;
              const attending = inv.guests.filter(g => g.status === "attending").length;
              const declined  = inv.guests.filter(g => g.status === "declined").length;
              const pending   = inv.guests.filter(g => g.status === "pending").length;
              const total = inv.guests.length;
              const cat = CAT_MAP[inv.themeId] ?? "Invitation";
              const themeName = THEME_NAMES[inv.themeId] ?? inv.themeId;
              const isWedding = cat === "Mariage" || cat === "Mariage · RTL";
              const n1 = content.names[0] ?? "";
              const n2 = content.names[1] ?? "";
              const displayName = isWedding ? `${n1} & ${n2}` : (n2 && n2 !== "—" ? `${n1} — ${n2}` : n1);

              const attPct = total > 0 ? (attending / total * 100).toFixed(1) + "%" : "0%";
              const waitPct = total > 0 ? (pending / total * 100).toFixed(1) + "%" : "0%";
              const noPct = total > 0 ? (declined / total * 100).toFixed(1) + "%" : "0%";

              return (
                <Link key={inv.id} href={`/dashboard/${inv.id}`} className={`inv-card${inv.status === "draft" ? " is-draft" : ""}`}>
                  {/* Thumbnail */}
                  <div className="inv-thumb">
                    <ThemeMini themeId={inv.themeId} n1={n1} n2={isWedding ? n2 : content.hosts ?? ""} date={content.date} />
                    <span className={`inv-status-badge ${inv.status}`}>
                      {STATUS_LABELS[inv.status] ?? inv.status}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="inv-body">
                    <div className="inv-cat">{cat} · {themeName}</div>
                    <div className="inv-name">{displayName}</div>
                    <div className="inv-meta-row">
                      <span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
                        {fmtDate(content.date)}
                      </span>
                      <span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>
                        {content.venue}
                      </span>
                    </div>

                    {/* RSVP bar */}
                    <div className="inv-rsvp-wrap">
                      {total > 0 ? (
                        <>
                          <div className="inv-rsvp-bar">
                            <i className="b-ok" style={{ width: attPct }} />
                            <i className="b-wait" style={{ width: waitPct }} />
                            <i className="b-no" style={{ width: noPct }} />
                          </div>
                          <div className="inv-rsvp-counts">
                            <span><span className="rdot ok" /><b>{attending}</b> présents</span>
                            <span><span className="rdot wait" /><b>{pending}</b> attente</span>
                            <span><span className="rdot no" /><b>{declined}</b> absents</span>
                          </div>
                        </>
                      ) : (
                        <div className="inv-rsvp-bar" />
                      )}
                    </div>

                    {/* Footer */}
                    <div className="inv-foot">
                      <span className="inv-views-c">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                        {inv._count.views} vue{inv._count.views !== 1 ? "s" : ""}
                      </span>
                      <span className="inv-go-c">
                        Gérer
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Plan + crédits widget */}
        <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {/* Plan actuel */}
          {currentPlan === "free" && (
            <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
              background: "rgba(200,60,60,0.07)", border: "1px solid rgba(200,60,60,0.25)", borderRadius: 12, padding: "1rem 1.4rem" }}>
              <div>
                <div style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "#e07070", marginBottom: 4 }}>Aucun abonnement</div>
                <div style={{ fontFamily: "var(--font-title)", fontSize: 13, color: "var(--text-soft)" }}>Souscrivez pour créer des invitations</div>
              </div>
              <Link href="/pricing" className="btn btn-gold btn-sm">Voir les plans →</Link>
            </div>
          )}
          {currentPlan !== "free" && dbUser.planExpiresAt && (
            <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
              background: currentPlan === "business" ? "rgba(110,80,200,0.07)" : "rgba(184,146,60,0.06)",
              border: `1px solid ${currentPlan === "business" ? "rgba(110,80,200,0.25)" : "rgba(184,146,60,0.3)"}`,
              borderRadius: 12, padding: "1rem 1.4rem" }}>
              <div>
                <div style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: currentPlan === "business" ? "#a080e0" : "var(--gold)", marginBottom: 4 }}>
                  Plan {currentPlan === "business" ? "Business" : currentPlan === "simple" ? "Simple" : "Pro"} ✓
                </div>
                <div style={{ fontFamily: "var(--font-title)", fontSize: 13, color: "var(--text-soft)" }}>
                  Expire le {new Date(dbUser.planExpiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
              <Link href="/pricing" className="btn btn-ghost btn-sm">Renouveler</Link>
            </div>
          )}

          {/* Crédits IA */}
          {credits <= 2 && (
            <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
              background: credits === 0 ? "rgba(200,60,60,0.07)" : "rgba(220,140,40,0.08)",
              border: `1px solid ${credits === 0 ? "rgba(200,60,60,0.3)" : "rgba(220,140,40,0.3)"}`,
              borderRadius: 12, padding: "1rem 1.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>✨</span>
                <div>
                  <div style={{ fontFamily: "var(--font-title)", fontSize: 13, color: "var(--ivory)" }}>
                    {credits} crédit{credits !== 1 ? "s" : ""} IA
                  </div>
                  <div style={{ fontFamily: "var(--font-title)", fontSize: 11, color: credits === 0 ? "#e07070" : "#e0a040", marginTop: 2 }}>
                    {credits === 0 ? "Rechargez pour utiliser l'IA" : "Crédits faibles"}
                  </div>
                </div>
              </div>
              <Link href="/pricing?tab=credits" className="btn btn-ghost btn-sm">Recharger</Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
