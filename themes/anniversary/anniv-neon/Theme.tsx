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

export default function AnnivNeonTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true } = options;
  const [cd, setCd] = useState({ j: "––", h: "––", m: "––", s: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const firstname = content.names[0];

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

  const C = { bg: "#0A0A0F", magenta: "#FF3CAC", cyan: "#2FF3FF", violet: "#9A5BFF", white: "#F2EEFF", muted: "rgba(242,238,255,.6)", faint: "rgba(242,238,255,.34)", line: "rgba(255,60,172,.3)" };
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: `rgba(255,60,172,.05)`, border: `1px solid ${C.line}`, borderRadius: 12, color: C.white, fontFamily: "'IBM Plex Sans',sans-serif", fontSize: ".95rem", outline: "none" };
  const btnStyle = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", flex: 1, minWidth: 130, alignItems: "center", justifyContent: "center", gap: 6, padding: ".9rem 1.2rem", borderRadius: 40, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".76rem", letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `1px solid ${C.line}`, background: primary ? `linear-gradient(135deg,${C.magenta},${C.violet})` : `rgba(47,243,255,.05)`, color: primary ? C.bg : C.white, transition: "all .25s" });

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(120% 80% at 80% -10%, rgba(255,60,172,.18), transparent 50%), radial-gradient(120% 80% at 0% 110%, rgba(47,243,255,.16), transparent 55%), ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(3rem + env(safe-area-inset-top)) 1.2rem calc(3rem + env(safe-area-inset-bottom))", overflow: "hidden", color: C.white, fontFamily: "'IBM Plex Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@300;400;500&family=Caveat:wght@600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes neonRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes neonShine{0%,100%{background-position:0% center}50%{background-position:100% center}}
        .neon-rev{opacity:0;animation:neonRise .8s cubic-bezier(.16,1,.3,1) forwards}
      `}</style>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 2 }}>
        <div style={{ position: "relative", width: "100%", borderRadius: 24, padding: "2.8rem 2rem 2.4rem", textAlign: "center", background: "linear-gradient(165deg,rgba(30,22,52,.8),rgba(12,10,22,.86))", border: `1px solid ${C.line}`, backdropFilter: "blur(12px)", boxShadow: `0 50px 110px -40px rgba(0,0,0,.85),0 0 60px -26px rgba(255,60,172,.6)`, overflow: "hidden" }}>

          {/* Guest badge */}
          {guestName && (
            <div className="neon-rev" style={{ marginBottom: "1.2rem" }}>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.cyan }}>À l&apos;attention de</p>
              <p style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: "1.6rem", color: C.white, lineHeight: 1.2 }}>{guestName}</p>
            </div>
          )}

          <p className="neon-rev" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".7rem", fontWeight: 600, letterSpacing: ".26em", textTransform: "uppercase", color: C.cyan, animationDelay: ".1s" }}>
            {content.hosts || "Vous êtes invité(e)"}
          </p>

          {/* Big name */}
          <div className="neon-rev" style={{ margin: ".8rem 0 .4rem", animationDelay: ".2s" }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: "clamp(3.4rem,16vw,5rem)", lineHeight: .9, background: `linear-gradient(135deg,${C.cyan},${C.violet} 45%,${C.magenta})`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", display: "inline-block", filter: `drop-shadow(0 0 20px rgba(154,91,255,.5))` }}>
              {firstname}
            </span>
          </div>

          <p className="neon-rev" style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "1.05rem", color: C.muted, fontStyle: "italic", marginBottom: "1.4rem", animationDelay: ".3s" }}>
            {content.invitationLine}
          </p>

          {/* Date/venue meta */}
          <div className="neon-rev" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem", margin: ".4rem 0", animationDelay: ".4s" }}>
            {[{ l: "Date", v: dateStr }, { l: "Lieu", v: `${content.venue}${content.venueSub ? ` · ${content.venueSub}` : ""}` }].map(({ l, v }) => (
              <div key={l} style={{ padding: ".85rem 1rem", border: `1px solid ${C.line}`, borderRadius: 14, background: `rgba(255,60,172,.06)`, textAlign: "left" }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".58rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.faint }}>{l}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: ".92rem", color: C.white, marginTop: ".25rem", lineHeight: 1.25 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Countdown */}
          {showCountdown && !cdDone && (
            <div className="neon-rev" style={{ display: "flex", justifyContent: "center", gap: ".7rem", margin: "1.6rem 0 .2rem", animationDelay: ".5s" }}>
              {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }, { val: cd.s, lab: "Sec" }].map(({ val, lab }) => (
                <div key={lab} style={{ flex: 1, textAlign: "center", padding: ".7rem .3rem", border: `1px solid ${C.line}`, borderRadius: 12, background: `rgba(47,243,255,.05)` }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.55rem", color: C.cyan, display: "block", lineHeight: 1 }}>{val}</span>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: ".56rem", letterSpacing: ".12em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".4rem" }}>{lab}</span>
                </div>
              ))}
            </div>
          )}

          {content.note && <p className="neon-rev" style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: ".9rem", color: C.muted, margin: "1rem 0 0", fontStyle: "italic", animationDelay: ".55s" }}>{content.note}</p>}

          <p className="neon-rev" style={{ fontFamily: "'Caveat',cursive", fontWeight: 600, fontSize: "1.5rem", color: C.magenta, margin: "1.2rem 0 .5rem", animationDelay: ".6s" }}>{content.closing}</p>

          {/* CTA */}
          <div className="neon-rev" style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", margin: "1.2rem 0", animationDelay: ".65s" }}>
            {showRsvp && invitationId && <button style={btnStyle(true)} onClick={() => document.getElementById("neon-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Je serai là 🎉</button>}
            {content.mapsUrl && <a href={content.mapsUrl} target="_blank" rel="noopener noreferrer" style={btnStyle()}>Itinéraire</a>}
          </div>

          {/* RSVP */}
          {showRsvp && invitationId && (
            <section id="neon-rsvp" style={{ marginTop: "2rem", borderTop: `1px solid ${C.line}`, paddingTop: "1.8rem" }}>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "1rem", color: C.white, marginBottom: "1rem" }}>Serez-vous des nôtres ?</h2>
              {rsvpSent || alreadyResponded ? (
                <p style={{ color: C.muted, fontSize: ".95rem" }}>{alreadyResponded && !rsvpSent ? "Vous avez déjà répondu. Merci !" : <>Merci <strong style={{ color: C.cyan }}>{rsvpName}</strong> !</>}</p>
              ) : (
                <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                  <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["attending", "declined"] as const).map((v, i) => (
                      <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.magenta : C.line}`, background: rsvpAttending === v ? "rgba(255,60,172,.1)" : "transparent", color: rsvpAttending === v ? C.magenta : C.faint, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", borderRadius: 12 }}>
                        {i === 0 ? "Je serai là !" : "Je ne pourrai pas"}
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
