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

export default function InaugurationTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true } = options;
  const [cd, setCd] = useState({ j: "––", h: "––", m: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // names[0] = event type, names[1] = subtitle, hosts = org
  const evType = content.names[0];
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

  const C = { bg: "#FBF8F2", cream: "#F3EEE2", green: "#1F5B43", greenD: "#143b2c", ink: "#26302A", muted: "#5d685f", gold: "#C19A4B", vivid: "#D9B567", goldS: "rgba(193,154,75,.4)", line: "rgba(31,91,67,.18)" };
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: `rgba(31,91,67,.04)`, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ink, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", outline: "none" };
  const btnStyle = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: ".9rem 1.5rem", borderRadius: 40, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `1px solid ${C.goldS}`, background: primary ? `linear-gradient(135deg,${C.green},${C.greenD})` : "transparent", color: primary ? C.bg : C.greenD, transition: "all .25s" });

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(130% 80% at 50% -8%,#fff 0%,${C.bg} 55%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(3rem + env(safe-area-inset-top)) 1.2rem calc(3rem + env(safe-area-inset-bottom))", overflow: "hidden", color: C.ink, fontFamily: "'Cormorant Garamond',serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet" />
      <style>{`@keyframes inaugRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}} .inaug-rev{opacity:0;animation:inaugRise .8s cubic-bezier(.16,1,.3,1) forwards}`}</style>

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 450 }}>
        <div style={{ position: "relative", width: "100%", background: `linear-gradient(168deg,#fff,${C.cream})`, borderRadius: 6, padding: "3rem 2.4rem 2.8rem", textAlign: "center", boxShadow: `0 50px 100px -40px rgba(20,40,30,.4),0 0 0 1px ${C.line}`, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 12, border: `1px solid ${C.line}`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: `linear-gradient(90deg,${C.gold},${C.vivid},${C.gold})` }} />

          {/* Guest badge */}
          {guestName && (
            <div className="inaug-rev" style={{ marginBottom: "1.2rem" }}>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.gold }}>À l&apos;attention de</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.ink }}>{guestName}</p>
            </div>
          )}

          {/* Crest */}
          <div className="inaug-rev" style={{ width: 58, height: 58, margin: ".4rem auto 0", border: `1px solid ${C.goldS}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", animationDelay: ".05s" }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "1.1rem", color: C.green }}>{(content.initials[0] + content.initials[1]).toUpperCase()}</span>
          </div>

          <p className="inaug-rev" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".66rem", fontWeight: 600, letterSpacing: ".28em", textTransform: "uppercase", color: C.gold, marginTop: "1.3rem", animationDelay: ".1s" }}>
            {content.invitationLine}
          </p>
          <h1 className="inaug-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: "clamp(2.1rem,8vw,3rem)", letterSpacing: ".04em", textTransform: "uppercase", color: C.greenD, marginTop: ".8rem", lineHeight: 1.05, animationDelay: ".2s" }}>{evType}</h1>
          <p className="inaug-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.muted, marginTop: ".7rem", animationDelay: ".3s" }}>{org}</p>

          {/* Sep */}
          <div className="inaug-rev" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".8rem", margin: "1.8rem auto", width: "64%", animationDelay: ".4s" }}>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.goldS})` }} />
            <span style={{ width: 8, height: 8, transform: "rotate(45deg)", background: C.gold, flexShrink: 0 }} />
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.goldS},transparent)` }} />
          </div>

          <p className="inaug-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.ink, lineHeight: 1.6, maxWidth: "30ch", margin: "0 auto", animationDelay: ".42s" }}>
            {content.names[1]}
          </p>
          <p className="inaug-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: "1.04rem", letterSpacing: ".2em", textTransform: "uppercase", color: C.greenD, marginTop: "1.4rem", animationDelay: ".5s" }}>
            {dateStr}
          </p>
          <p className="inaug-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.22rem", color: C.muted, marginTop: ".5rem", animationDelay: ".54s" }}>
            {content.time.replace(":", "h")} · {content.venue}{content.venueSub ? `, ${content.venueSub}` : ""}
          </p>
          {content.note && <p className="inaug-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.muted, marginTop: ".8rem", animationDelay: ".56s" }}>{content.note}</p>}

          {/* Countdown */}
          {showCountdown && !cdDone && (
            <div className="inaug-rev" style={{ display: "flex", justifyContent: "center", gap: "1.1rem", margin: "2rem 0 .2rem", animationDelay: ".62s" }}>
              {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                <div key={lab} style={{ textAlign: "center", minWidth: 54, padding: ".7rem .4rem", border: `1px solid ${C.line}`, borderRadius: 8, background: `rgba(31,91,67,.04)` }}>
                  <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.6rem", color: C.greenD, display: "block", lineHeight: 1 }}>{val}</span>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".58rem", letterSpacing: ".14em", textTransform: "uppercase", color: C.muted, display: "block", marginTop: ".4rem" }}>{lab}</span>
                </div>
              ))}
            </div>
          )}

          <p className="inaug-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.1rem", color: C.muted, marginTop: "1.2rem", animationDelay: ".68s" }}>{content.closing}</p>

          {/* CTA */}
          <div className="inaug-rev" style={{ marginTop: "2rem", display: "flex", gap: ".7rem", justifyContent: "center", flexWrap: "wrap", animationDelay: ".74s" }}>
            {showRsvp && invitationId && <button style={btnStyle(true)} onClick={() => document.getElementById("inaug-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Confirmer ma présence</button>}
            {content.mapsUrl && <a href={content.mapsUrl} target="_blank" rel="noopener noreferrer" style={btnStyle()}>Itinéraire</a>}
          </div>

          {/* RSVP */}
          {showRsvp && invitationId && (
            <section id="inaug-rsvp" style={{ marginTop: "2rem", borderTop: `1px solid ${C.line}`, paddingTop: "1.8rem" }}>
              <h2 style={{ fontFamily: "'Marcellus',serif", fontSize: "1.1rem", color: C.ink, marginBottom: "1rem" }}>Confirmez votre présence</h2>
              {rsvpSent || alreadyResponded ? (
                <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", lineHeight: 1.8 }}>
                  {alreadyResponded && !rsvpSent ? "Vous avez déjà répondu. Merci !" : <>Merci <strong style={{ color: C.green }}>{rsvpName}</strong> — réponse enregistrée.</>}
                </p>
              ) : (
                <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                  <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["attending", "declined"] as const).map((v, i) => (
                      <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.green : C.line}`, background: rsvpAttending === v ? `rgba(31,91,67,.08)` : "transparent", color: rsvpAttending === v ? C.greenD : C.muted, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", borderRadius: 40 }}>
                        {i === 0 ? "Confirmer" : "Décliner"}
                      </button>
                    ))}
                  </div>
                  {rsvpAttending === "attending" && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".9rem", color: C.muted }}>Nombre de personnes</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {([-1, null, 1] as const).map((d, i) => d !== null ? <button key={i} type="button" onClick={() => setRsvpSize(s => Math.max(1, Math.min(20, s + d)))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.line}`, background: "transparent", color: C.green, cursor: "pointer" }}>{d > 0 ? "+" : "−"}</button> : <span key={i} style={{ fontFamily: "'Marcellus',serif", fontSize: "1rem", color: C.ink, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>)}
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
