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

export default function SensibilisationTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true } = options;
  const [cd, setCd] = useState({ j: "––", h: "––", m: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // names[0] = event title, hosts = org
  const title = content.names[0];
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

  const C = { bg: "#FBF6F4", panel: "#F6EEEC", cause: "#E0518A", causeD: "#b83c6e", causeS: "rgba(224,81,138,.16)", ink: "#34282b", muted: "#7a6a6e", faint: "#b0a2a5", line: "rgba(224,81,138,.22)" };
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: C.causeS, border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", outline: "none" };
  const btnStyle = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: ".9rem 1.4rem", borderRadius: 40, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".72rem", letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `1px solid ${C.line}`, background: primary ? `linear-gradient(135deg,${C.cause},${C.causeD})` : "transparent", color: primary ? "#fff" : C.causeD, transition: "all .25s" });

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(130% 80% at 50% -8%,#fff 0%,${C.bg} 55%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(3rem + env(safe-area-inset-top)) 1.2rem calc(3rem + env(safe-area-inset-bottom))", overflow: "hidden", color: C.ink, fontFamily: "'Cormorant Garamond',serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet" />
      <style>{`@keyframes sensRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}} .sens-rev{opacity:0;animation:sensRise .8s cubic-bezier(.16,1,.3,1) forwards}`}</style>

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 450 }}>
        <div style={{ position: "relative", width: "100%", background: `linear-gradient(168deg,#fff,${C.panel})`, borderRadius: 20, padding: "2.8rem 2.2rem 2.6rem", textAlign: "center", boxShadow: `0 50px 100px -40px rgba(120,60,80,.3),0 0 0 1px ${C.line}`, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: `linear-gradient(90deg,${C.cause},${C.causeD})` }} />

          {/* Guest badge */}
          {guestName && (
            <div className="sens-rev" style={{ marginBottom: "1.2rem" }}>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.cause }}>À l&apos;attention de</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.ink }}>{guestName}</p>
            </div>
          )}

          {/* Awareness ribbon */}
          <svg className="sens-rev" style={{ width: 60, height: 68, display: "block", margin: "0 auto", animationDelay: ".05s" }} viewBox="0 0 120 140">
            <path d="M60 130 L30 60 Q22 44 40 30 Q60 14 80 30 Q98 44 90 60 L60 130 M44 70 L76 70" fill="none" stroke={C.cause} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <p className="sens-rev" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".66rem", fontWeight: 600, letterSpacing: ".26em", textTransform: "uppercase", color: C.causeD, marginTop: "1.2rem", animationDelay: ".1s" }}>
            {content.invitationLine}
          </p>
          <h1 className="sens-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: "clamp(2rem,7.5vw,2.8rem)", lineHeight: 1.08, color: C.ink, marginTop: ".7rem", animationDelay: ".2s" }}>{title}</h1>
          <p className="sens-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.3rem", color: C.muted, marginTop: ".7rem", animationDelay: ".3s" }}>{org}</p>

          {/* Sep */}
          <div className="sens-rev" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".8rem", margin: "1.7rem auto", width: "60%", animationDelay: ".38s" }}>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.line})` }} />
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.cause, flexShrink: 0 }} />
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.line},transparent)` }} />
          </div>

          <p className="sens-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.22rem", color: C.ink, lineHeight: 1.6, maxWidth: "32ch", margin: "0 auto", animationDelay: ".4s" }}>
            {content.names[1]}
          </p>
          <p className="sens-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: "1.04rem", letterSpacing: ".18em", textTransform: "uppercase", color: C.causeD, marginTop: "1.4rem", animationDelay: ".48s" }}>
            {dateStr}
          </p>
          <p className="sens-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.2rem", color: C.muted, marginTop: ".5rem", animationDelay: ".52s" }}>
            {content.time.replace(":", "h")} · {content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}
          </p>
          {content.note && <p className="sens-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.muted, marginTop: ".8rem", animationDelay: ".54s" }}>{content.note}</p>}

          {/* Countdown */}
          {showCountdown && !cdDone && (
            <div className="sens-rev" style={{ display: "flex", justifyContent: "center", gap: "1.1rem", margin: "1.9rem 0 .2rem", animationDelay: ".6s" }}>
              {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                <div key={lab} style={{ textAlign: "center", minWidth: 54, padding: ".7rem .4rem", border: `1px solid ${C.line}`, borderRadius: 10, background: C.causeS }}>
                  <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.55rem", color: C.causeD, display: "block", lineHeight: 1 }}>{val}</span>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".56rem", letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, display: "block", marginTop: ".4rem" }}>{lab}</span>
                </div>
              ))}
            </div>
          )}

          <p className="sens-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: ".88rem", color: C.muted, marginTop: "1.2rem", animationDelay: ".66s" }}>{content.closing}</p>

          {/* CTA */}
          <div className="sens-rev" style={{ marginTop: "1.9rem", display: "flex", gap: ".7rem", justifyContent: "center", flexWrap: "wrap", animationDelay: ".72s" }}>
            {showRsvp && invitationId && <button style={btnStyle(true)} onClick={() => document.getElementById("sens-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Je participe</button>}
            {content.mapsUrl && <a href={content.mapsUrl} target="_blank" rel="noopener noreferrer" style={btnStyle()}>Itinéraire</a>}
          </div>

          {/* RSVP */}
          {showRsvp && invitationId && (
            <section id="sens-rsvp" style={{ marginTop: "2rem", borderTop: `1px solid ${C.line}`, paddingTop: "1.8rem" }}>
              <h2 style={{ fontFamily: "'Marcellus',serif", fontSize: "1.1rem", color: C.ink, marginBottom: "1rem" }}>Participez à cet événement</h2>
              {rsvpSent || alreadyResponded ? (
                <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", lineHeight: 1.8 }}>
                  {alreadyResponded && !rsvpSent ? "Vous avez déjà répondu. Merci !" : <>Merci <strong style={{ color: C.cause }}>{rsvpName}</strong> — à bientôt !</>}
                </p>
              ) : (
                <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                  <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["attending", "declined"] as const).map((v, i) => (
                      <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.cause : C.line}`, background: rsvpAttending === v ? C.causeS : "transparent", color: rsvpAttending === v ? C.causeD : C.faint, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", borderRadius: 40 }}>
                        {i === 0 ? "Je participe" : "Je ne pourrai pas"}
                      </button>
                    ))}
                  </div>
                  {rsvpAttending === "attending" && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".9rem", color: C.muted }}>Nombre de personnes</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {([-1, null, 1] as const).map((d, i) => d !== null ? <button key={i} type="button" onClick={() => setRsvpSize(s => Math.max(1, Math.min(20, s + d)))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.line}`, background: "transparent", color: C.cause, cursor: "pointer" }}>{d > 0 ? "+" : "−"}</button> : <span key={i} style={{ fontFamily: "'Marcellus',serif", fontSize: "1rem", color: C.ink, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>)}
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
