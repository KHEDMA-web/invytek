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

const FLOATS = ["🍼","⭐","🌸","🍭","☁️","🎀","🌟","💛","🐣"];

export default function BabyShowerTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true } = options;
  const [cd, setCd] = useState({ j: "––", h: "––", m: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // names[0] = baby/event name, hosts = parents
  const babyName = content.names[0];
  const parents = content.hosts;

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

  const C = { bg: "#FDF6F0", bg2: "#EAF4FB", blue: "#8FCDE8", blueD: "#5fa8cc", peach: "#F8C9B0", ink: "#445660", muted: "#7d8b93", faint: "#aab6bc", line: "rgba(95,168,204,.24)", soft: "rgba(143,205,232,.18)" };
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: C.soft, border: `1px solid ${C.line}`, borderRadius: 12, color: C.ink, fontFamily: "'Quicksand',sans-serif", fontSize: ".95rem", outline: "none" };
  const btnStyle = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: ".9rem 1.5rem", borderRadius: 40, fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: ".74rem", letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `2px solid ${C.line}`, background: primary ? `linear-gradient(135deg,${C.blue},${C.blueD})` : "transparent", color: primary ? "#fff" : C.blueD, transition: "all .25s" });

  return (
    <div style={{ minHeight: "100dvh", background: `linear-gradient(180deg,${C.bg} 0%,${C.bg2} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(3rem + env(safe-area-inset-top)) 1.2rem calc(3rem + env(safe-area-inset-bottom))", overflow: "hidden", color: C.ink, fontFamily: "'Quicksand',sans-serif", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Caveat:wght@600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes babyRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes floatUp{0%{transform:translateY(0) rotate(0);opacity:0}12%{opacity:.6}100%{transform:translateY(-112vh) rotate(40deg);opacity:0}}
        .baby-rev{opacity:0;animation:babyRise .8s cubic-bezier(.16,1,.3,1) forwards}
      `}</style>

      {/* Floating elements */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {FLOATS.map((e, i) => (
          <span key={i} style={{ position: "absolute", bottom: -40, left: `${(i * 11 + 5) % 96}%`, fontSize: "1.4rem", opacity: .5, animation: `floatUp ${12 + i * 2}s ${i * 1.8}s linear infinite` }}>{e}</span>
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 440 }}>
        <div style={{ position: "relative", width: "100%", background: "linear-gradient(168deg,#fff,#fbfdff)", borderRadius: 28, padding: "3rem 2.2rem 2.6rem", textAlign: "center", boxShadow: `0 50px 100px -40px rgba(70,120,150,.3),0 0 0 1px ${C.line}`, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 5, background: `linear-gradient(90deg,${C.blue},${C.peach})` }} />

          {/* Guest badge */}
          {guestName && (
            <div className="baby-rev" style={{ marginBottom: "1.2rem" }}>
              <p style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 600, fontSize: ".65rem", letterSpacing: ".18em", textTransform: "uppercase", color: C.blueD }}>Pour</p>
              <p style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: "1.6rem", color: C.ink, lineHeight: 1.2 }}>{guestName}</p>
            </div>
          )}

          <div className="baby-rev" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: ".66rem", letterSpacing: ".2em", textTransform: "uppercase", color: C.blueD, padding: ".45rem 1rem", borderRadius: 40, background: C.soft, animationDelay: ".05s" }}>
            🍼 Baby Shower
          </div>
          <div className="baby-rev" style={{ fontSize: "2.6rem", margin: "1rem 0 0", animationDelay: ".1s" }}>👶</div>
          <p className="baby-rev" style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 600, fontSize: ".92rem", letterSpacing: ".04em", color: C.muted, marginTop: ".8rem", animationDelay: ".15s" }}>{content.invitationLine}</p>

          <h1 className="baby-rev" style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: "clamp(3.4rem,16vw,5rem)", lineHeight: .9, color: C.blueD, marginTop: ".2rem", animationDelay: ".2s" }}>{babyName}</h1>
          <p className="baby-rev" style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 600, fontSize: "1.15rem", color: C.ink, marginTop: ".5rem", animationDelay: ".25s" }}>{parents}</p>

          {/* Sep */}
          <div className="baby-rev" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".7rem", margin: "1.6rem auto", width: "60%", animationDelay: ".3s" }}>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.line})` }} />
            <span style={{ color: C.peach, fontSize: "1rem" }}>❤️</span>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.line},transparent)` }} />
          </div>

          <p className="baby-rev" style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 600, fontSize: "1rem", letterSpacing: ".04em", color: C.blueD, marginTop: "1.2rem", animationDelay: ".35s" }}>
            {dateStr}
          </p>
          <p className="baby-rev" style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 500, fontSize: "1rem", color: C.muted, marginTop: ".35rem", animationDelay: ".4s" }}>
            {content.time.replace(":", "h")} · {content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}
          </p>

          {content.note && <p className="baby-rev" style={{ fontFamily: "'Quicksand',sans-serif", fontSize: ".9rem", color: C.muted, marginTop: ".8rem", fontStyle: "italic", animationDelay: ".42s" }}>{content.note}</p>}

          {/* Countdown */}
          {showCountdown && !cdDone && (
            <div className="baby-rev" style={{ display: "flex", justifyContent: "center", gap: ".8rem", margin: "1.8rem 0 .2rem", animationDelay: ".48s" }}>
              {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                <div key={lab} style={{ textAlign: "center", minWidth: 56, padding: ".7rem .4rem", border: `1px solid ${C.line}`, borderRadius: 16, background: C.soft }}>
                  <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: "1.6rem", color: C.blueD, display: "block", lineHeight: 1 }}>{val}</span>
                  <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 600, fontSize: ".58rem", letterSpacing: ".1em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".4rem" }}>{lab}</span>
                </div>
              ))}
            </div>
          )}

          <p className="baby-rev" style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: "1.5rem", color: C.blueD, margin: "1.2rem 0 .5rem", animationDelay: ".55s" }}>{content.closing}</p>

          {/* CTA */}
          <div className="baby-rev" style={{ display: "flex", gap: ".7rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.9rem", animationDelay: ".6s" }}>
            {showRsvp && invitationId && <button style={btnStyle(true)} onClick={() => document.getElementById("baby-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Je confirme ! 🎉</button>}
            {content.mapsUrl && <a href={content.mapsUrl} target="_blank" rel="noopener noreferrer" style={btnStyle()}>Itinéraire</a>}
          </div>

          {/* RSVP */}
          {showRsvp && invitationId && (
            <section id="baby-rsvp" style={{ marginTop: "2rem", borderTop: `1px solid ${C.line}`, paddingTop: "1.8rem" }}>
              <h2 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: C.ink, marginBottom: "1rem" }}>Serez-vous là ? 💛</h2>
              {rsvpSent || alreadyResponded ? (
                <p style={{ color: C.muted, fontSize: ".95rem" }}>{alreadyResponded && !rsvpSent ? "Vous avez déjà répondu. Merci !" : <>Merci <strong style={{ color: C.blueD }}>{rsvpName}</strong> — à bientôt !</>}</p>
              ) : (
                <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                  <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["attending", "declined"] as const).map((v, i) => (
                      <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `2px solid ${rsvpAttending === v ? C.blue : C.line}`, background: rsvpAttending === v ? C.soft : "transparent", color: rsvpAttending === v ? C.blueD : C.faint, fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: ".68rem", letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer", borderRadius: 40 }}>
                        {i === 0 ? "Je serai là !" : "Je ne pourrai pas"}
                      </button>
                    ))}
                  </div>
                  {rsvpAttending === "attending" && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: ".9rem", color: C.muted }}>Nombre de personnes</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {([-1, null, 1] as const).map((d, i) => d !== null ? <button key={i} type="button" onClick={() => setRsvpSize(s => Math.max(1, Math.min(20, s + d)))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.line}`, background: "transparent", color: C.blueD, cursor: "pointer" }}>{d > 0 ? "+" : "−"}</button> : <span key={i} style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: "1rem", color: C.ink, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>)}
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
