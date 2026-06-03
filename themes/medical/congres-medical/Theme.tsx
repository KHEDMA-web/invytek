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

export default function CongresMedicalTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true } = options;
  const [cd, setCd] = useState({ j: "––", h: "––", m: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // names[0] = congress title, names[1] = edition, hosts = org
  const title = content.names[0];
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
      const m = Math.floor(diff / 60000);
      setCd({ j: String(j), h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0") });
    }
    tick(); const id = setInterval(tick, 30000); return () => clearInterval(id);
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

  const C = { bg: "#F4F8FA", teal: "#128C7E", tealD: "#0c5f55", mint: "#3FC6A8", blue: "#3FA9D6", ink: "#16323B", muted: "#5a7079", faint: "#93a5ab", line: "rgba(18,140,126,.18)", panel: "#EEF5F6" };
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: "rgba(18,140,126,.04)", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, fontFamily: "'IBM Plex Sans',sans-serif", fontSize: ".95rem", outline: "none" };
  const btnStyle = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", flex: 1, minWidth: 130, alignItems: "center", justifyContent: "center", gap: 6, padding: ".9rem 1.1rem", borderRadius: 12, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".74rem", letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `1px solid ${C.line}`, background: primary ? `linear-gradient(135deg,${C.teal},${C.tealD})` : `rgba(18,140,126,.04)`, color: primary ? "#fff" : C.tealD, transition: "all .25s" });

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(130% 80% at 80% -10%,rgba(63,198,168,.14),transparent 50%),radial-gradient(120% 70% at 0% 110%,rgba(63,169,214,.12),transparent 55%),${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(3rem + env(safe-area-inset-top)) 1.2rem calc(3rem + env(safe-area-inset-bottom))", overflow: "hidden", color: C.ink, fontFamily: "'IBM Plex Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
      <style>{`@keyframes medRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}} .med-rev{opacity:0;animation:medRise .8s cubic-bezier(.16,1,.3,1) forwards}`}</style>

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 460 }}>
        <div style={{ position: "relative", width: "100%", background: `linear-gradient(168deg,#fff,${C.panel})`, borderRadius: 20, padding: "2.6rem 2rem 2.4rem", boxShadow: `0 50px 100px -40px rgba(18,80,72,.32),0 0 0 1px ${C.line}`, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: `linear-gradient(90deg,${C.teal},${C.mint},${C.blue})` }} />

          {/* Guest badge */}
          {guestName && (
            <div className="med-rev" style={{ marginBottom: "1.2rem" }}>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".65rem", letterSpacing: ".18em", textTransform: "uppercase", color: C.teal }}>À l&apos;attention de</p>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "1.2rem", color: C.ink }}>{guestName}</p>
            </div>
          )}

          {/* Top row */}
          <div className="med-rev" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", animationDelay: ".05s" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: ".45rem", fontFamily: "'Space Grotesk',sans-serif", fontSize: ".62rem", fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: C.tealD, padding: ".4rem .8rem", border: `1px solid ${C.line}`, borderRadius: 40, background: `rgba(18,140,126,.06)` }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal, display: "block" }} />
              {content.invitationLine}
            </span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".68rem", letterSpacing: ".14em", color: C.faint }}>{edition}</span>
          </div>

          <p className="med-rev" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".7rem", fontWeight: 500, letterSpacing: ".26em", textTransform: "uppercase", color: C.blue, marginTop: "1.5rem", animationDelay: ".1s" }}>{org}</p>
          <h1 className="med-rev" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "clamp(2rem,7.5vw,2.9rem)", lineHeight: 1.05, color: C.ink, marginTop: ".6rem", animationDelay: ".2s" }}>{title}</h1>

          {/* Tags from note */}
          {content.note && (
            <div className="med-rev" style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: "1.3rem", animationDelay: ".3s" }}>
              {content.note.split(",").map(tag => (
                <span key={tag} style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".66rem", fontWeight: 500, color: C.tealD, padding: ".35rem .75rem", borderRadius: 40, background: `rgba(63,198,168,.14)`, border: `1px solid ${C.line}` }}>{tag.trim()}</span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="med-rev" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem", marginTop: "1.4rem", animationDelay: ".38s" }}>
            {[{ l: "Date", v: `${dateStr} · ${content.time.replace(":", "h")}` }, { l: "Lieu", v: `${content.venue}${content.venueSub ? ` · ${content.venueSub}` : ""}` }].map(({ l, v }) => (
              <div key={l} style={{ textAlign: "left", padding: ".85rem 1rem", border: `1px solid ${C.line}`, borderRadius: 12, background: "rgba(255,255,255,.5)" }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".58rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.faint }}>{l}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: ".95rem", color: C.ink, marginTop: ".25rem", lineHeight: 1.25 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Countdown */}
          {showCountdown && !cdDone && (
            <div className="med-rev" style={{ display: "flex", justifyContent: "center", gap: ".7rem", margin: "1.8rem 0 .2rem", animationDelay: ".48s" }}>
              {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                <div key={lab} style={{ flex: 1, textAlign: "center", padding: ".7rem .3rem", border: `1px solid ${C.line}`, borderRadius: 12, background: `rgba(18,140,126,.05)` }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.55rem", color: C.tealD, display: "block", lineHeight: 1 }}>{val}</span>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".56rem", letterSpacing: ".12em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".4rem" }}>{lab}</span>
                </div>
              ))}
            </div>
          )}

          <p className="med-rev" style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: ".85rem", color: C.muted, margin: "1.2rem 0 0", animationDelay: ".55s" }}>{content.closing}</p>

          {/* CTA */}
          <div className="med-rev" style={{ marginTop: "1.7rem", display: "flex", gap: ".7rem", flexWrap: "wrap", animationDelay: ".6s" }}>
            {showRsvp && invitationId && <button style={btnStyle(true)} onClick={() => document.getElementById("cmed-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Confirmer ma présence</button>}
            {content.mapsUrl && <a href={content.mapsUrl} target="_blank" rel="noopener noreferrer" style={btnStyle()}>Itinéraire</a>}
          </div>

          {/* RSVP */}
          {showRsvp && invitationId && (
            <section id="cmed-rsvp" style={{ marginTop: "2rem", borderTop: `1px solid ${C.line}`, paddingTop: "1.8rem" }}>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "1rem", color: C.ink, marginBottom: "1rem" }}>Confirmez votre participation</h2>
              {rsvpSent || alreadyResponded ? (
                <p style={{ color: C.muted, fontSize: ".95rem" }}>{alreadyResponded && !rsvpSent ? "Vous avez déjà répondu. Merci !" : <>Merci <strong style={{ color: C.teal }}>{rsvpName}</strong> — inscription confirmée.</>}</p>
              ) : (
                <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                  <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["attending", "declined"] as const).map((v, i) => (
                      <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.teal : C.line}`, background: rsvpAttending === v ? `rgba(18,140,126,.1)` : "transparent", color: rsvpAttending === v ? C.tealD : C.faint, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", borderRadius: 8 }}>
                        {i === 0 ? "Je participe" : "Je décline"}
                      </button>
                    ))}
                  </div>
                  {rsvpAttending === "attending" && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: ".9rem", color: C.muted }}>Nombre de personnes</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {([-1, null, 1] as const).map((d, i) => d !== null ? <button key={i} type="button" onClick={() => setRsvpSize(s => Math.max(1, Math.min(20, s + d)))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.line}`, background: "transparent", color: C.teal, cursor: "pointer" }}>{d > 0 ? "+" : "−"}</button> : <span key={i} style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "1rem", color: C.ink, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>)}
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
