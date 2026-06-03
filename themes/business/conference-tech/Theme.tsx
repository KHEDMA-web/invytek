"use client";
import { useEffect, useState } from "react";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";

interface Props {
  content: WeddingContent;
  options?: Partial<WeddingOptions>;
  invitationId?: string;
  guestName?: string;
  guestToken?: string;
  alreadyResponded?: boolean;
}

export default function ConferenceTechTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true } = options;
  const [cd, setCd] = useState({ j: "––", h: "––", m: "––", s: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // names[0] = conf title, names[1] = edition, hosts = org/speaker
  const confTitle = content.names[0];
  const edition = content.names[1];
  const org = content.hosts;

  useEffect(() => {
    if (!showCountdown) return;
    const target = new Date(`${content.date}T${content.time}:00`);
    function tick() {
      let diff = target.getTime() - Date.now();
      if (diff < 0) { setCdDone(true); return; }
      const j = Math.floor(diff / 86400000); diff %= 86400000;
      const h = Math.floor(diff / 3600000); diff %= 3600000;
      const m = Math.floor(diff / 60000); diff %= 60000;
      const s = Math.floor(diff / 1000);
      setCd({ j: String(j), h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0") });
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [content.date, content.time, showCountdown]);

  async function submitRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!invitationId || !rsvpAttending || rsvpName.trim().length < 2) return;
    setRsvpLoading(true);
    try {
      await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId, name: rsvpName.trim(), status: rsvpAttending, partySize: rsvpSize, message: rsvpMsg.trim() || undefined, token: guestToken }) });
      setRsvpSent(true);
    } catch { /* silent */ } finally { setRsvpLoading(false); }
  }

  const eventDate = new Date(content.date + "T12:00:00");
  const dateStr = eventDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const C = { bg: "#0B1020", cyan: "#38E1FF", blue: "#5B8CFF", violet: "#9A7BFF", white: "#EAF0FF", muted: "rgba(234,240,255,.6)", faint: "rgba(234,240,255,.34)", line: "rgba(91,140,255,.28)", lineS: "rgba(56,225,255,.5)" };
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: `rgba(56,225,255,.04)`, border: `1px solid ${C.line}`, borderRadius: 8, color: C.white, fontFamily: "'IBM Plex Sans',sans-serif", fontSize: ".95rem", outline: "none" };
  const btnStyle = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", flex: 1, minWidth: 140, alignItems: "center", justifyContent: "center", gap: 6, padding: ".95rem 1.2rem", borderRadius: 12, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".78rem", letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `1px solid ${C.lineS}`, background: primary ? `linear-gradient(135deg,${C.cyan},${C.blue})` : `rgba(56,225,255,.05)`, color: primary ? "#06101f" : C.white, transition: "all .25s" });

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(120% 80% at 80% -10%,rgba(56,225,255,.12),transparent 50%),radial-gradient(120% 80% at 0% 110%,rgba(154,123,255,.14),transparent 55%),${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(3rem + env(safe-area-inset-top)) 1.2rem calc(3rem + env(safe-area-inset-bottom))", overflow: "hidden", color: C.white, fontFamily: "'IBM Plex Sans',sans-serif", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes techRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes techPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
        .tech-rev{opacity:0;animation:techRise .8s cubic-bezier(.16,1,.3,1) forwards}
      `}</style>

      {/* Grid bg */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: .5, backgroundImage: `linear-gradient(rgba(91,140,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(91,140,255,.06) 1px,transparent 1px)`, backgroundSize: "46px 46px", maskImage: "radial-gradient(circle at 50% 40%,#000,transparent 78%)" }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 460 }}>
        <div style={{ position: "relative", width: "100%", borderRadius: 22, padding: "2.6rem 2rem 2.4rem", background: "linear-gradient(165deg,rgba(22,32,66,.82),rgba(12,18,40,.86))", border: `1px solid ${C.line}`, backdropFilter: "blur(14px)", boxShadow: `0 50px 110px -40px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.06),0 0 60px -28px rgba(56,225,255,.5)`, overflow: "hidden" }}>

          {/* Guest badge */}
          {guestName && (
            <div className="tech-rev" style={{ marginBottom: "1.2rem" }}>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.cyan }}>À l&apos;attention de</p>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "1.2rem", color: C.white, lineHeight: 1.2 }}>{guestName}</p>
            </div>
          )}

          {/* Top row */}
          <div className="tech-rev" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.8rem", animationDelay: ".05s" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", fontFamily: "'Space Grotesk',sans-serif", fontSize: ".66rem", fontWeight: 600, letterSpacing: ".22em", textTransform: "uppercase", color: C.cyan, padding: ".4rem .8rem", border: `1px solid ${C.lineS}`, borderRadius: 40, background: `rgba(56,225,255,.06)` }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 10px ${C.cyan}`, animation: "techPulse 1.6s ease-in-out infinite", display: "block" }} />
              {content.invitationLine}
            </span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".72rem", letterSpacing: ".16em", color: C.faint }}>{edition}</span>
          </div>

          <p className="tech-rev" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".74rem", fontWeight: 500, letterSpacing: ".3em", textTransform: "uppercase", color: C.blue, textIndent: ".3em", animationDelay: ".1s" }}>
            {org}
          </p>
          <h1 className="tech-rev" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "clamp(2.4rem,9vw,3.4rem)", lineHeight: 1.02, letterSpacing: "-.02em", marginTop: ".7rem", background: `linear-gradient(120deg,${C.white},${C.cyan} 60%,${C.blue})`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", animationDelay: ".2s" }}>
            {confTitle}
          </h1>

          {/* Date/venue */}
          <div className="tech-rev" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem", marginTop: "1.4rem", animationDelay: ".35s" }}>
            {[{ l: "Date", v: `${dateStr} · ${content.time.replace(":", "h")}` }, { l: "Lieu", v: `${content.venue}${content.venueSub ? ` · ${content.venueSub}` : ""}` }].map(({ l, v }) => (
              <div key={l} style={{ textAlign: "left", padding: ".85rem 1rem", border: `1px solid ${C.line}`, borderRadius: 14, background: "rgba(12,18,40,.4)" }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".6rem", letterSpacing: ".18em", textTransform: "uppercase", color: C.faint }}>{l}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: ".95rem", color: C.white, marginTop: ".25rem", lineHeight: 1.25 }}>{v}</div>
              </div>
            ))}
          </div>

          {content.note && <p className="tech-rev" style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: ".9rem", color: C.muted, marginTop: "1rem", fontStyle: "italic", animationDelay: ".42s" }}>{content.note}</p>}

          {/* Countdown */}
          {showCountdown && !cdDone && (
            <div className="tech-rev" style={{ display: "flex", justifyContent: "center", gap: ".7rem", margin: "1.8rem 0 .2rem", animationDelay: ".48s" }}>
              {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }, { val: cd.s, lab: "Sec" }].map(({ val, lab }) => (
                <div key={lab} style={{ flex: 1, textAlign: "center", padding: ".7rem .3rem", border: `1px solid ${C.line}`, borderRadius: 12, background: `rgba(56,225,255,.05)` }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.6rem", color: C.cyan, display: "block", lineHeight: 1 }}>{val}</span>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".58rem", letterSpacing: ".14em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".4rem" }}>{lab}</span>
                </div>
              ))}
            </div>
          )}

          <p className="tech-rev" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: ".85rem", color: C.muted, margin: "1.2rem 0 0", animationDelay: ".56s" }}>{content.closing}</p>

          {/* CTA */}
          <div className="tech-rev" style={{ marginTop: "1.8rem", display: "flex", gap: ".7rem", flexWrap: "wrap", animationDelay: ".62s" }}>
            {showRsvp && invitationId && <button style={btnStyle(true)} onClick={() => document.getElementById("tech-rsvp")?.scrollIntoView({ behavior: "smooth" })}>S&apos;inscrire</button>}
            {content.mapsUrl && <a href={content.mapsUrl} target="_blank" rel="noopener noreferrer" style={btnStyle()}>Itinéraire</a>}
          </div>

          {/* RSVP */}
          {showRsvp && invitationId && (
            <section id="tech-rsvp" style={{ marginTop: "2rem", borderTop: `1px solid ${C.line}`, paddingTop: "1.8rem" }}>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "1rem", color: C.white, marginBottom: "1rem" }}>Confirmez votre présence</h2>
              {rsvpSent || alreadyResponded ? (
                <p style={{ color: C.muted, fontSize: ".95rem" }}>{alreadyResponded && !rsvpSent ? "Vous avez déjà répondu. Merci !" : <>Merci <strong style={{ color: C.cyan }}>{rsvpName}</strong> — inscription confirmée.</>}</p>
              ) : (
                <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                  <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["attending", "declined"] as const).map((v, i) => (
                      <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.cyan : C.line}`, background: rsvpAttending === v ? `rgba(56,225,255,.1)` : "transparent", color: rsvpAttending === v ? C.cyan : C.faint, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", borderRadius: 8 }}>
                        {i === 0 ? "Je participe" : "Je décline"}
                      </button>
                    ))}
                  </div>
                  {rsvpAttending === "attending" && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: ".9rem", color: C.muted }}>Nombre de personnes</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {([-1, null, 1] as const).map((d, i) => d !== null ? <button key={i} type="button" onClick={() => setRsvpSize(s => Math.max(1, Math.min(20, s + d)))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.line}`, background: "transparent", color: C.cyan, cursor: "pointer" }}>{d > 0 ? "+" : "−"}</button> : <span key={i} style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "1rem", color: C.white, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>)}
                      </div>
                    </div>
                  )}
                  <textarea style={{ ...inp, resize: "vertical" }} placeholder="Message (optionnel)" value={rsvpMsg} onChange={e => setRsvpMsg(e.target.value)} rows={2} />
                  <button type="submit" disabled={!rsvpAttending || rsvpName.trim().length < 2 || rsvpLoading} style={{ ...btnStyle(true), alignSelf: "center" } as React.CSSProperties}>{rsvpLoading ? "Envoi…" : "Confirmer →"}</button>
                </form>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
