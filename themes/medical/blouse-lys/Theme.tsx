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

export default function BlouseLysTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true } = options;
  const [cd, setCd] = useState({ j: "––", h: "––", m: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // names[0] = event type, names[1] = subtitle, hosts = institution
  const evType = content.names[0];
  const evSub = content.names[1];
  const institution = content.hosts;

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

  const C = { bg: "#0F1210", card: "#161d17", sage: "#4A6B52", sageL: "#7AA882", gold: "#B8923C", vivid: "#D4AF61", ivory: "#FCFAF5", text: "rgba(240,238,230,.82)", soft: "rgba(240,238,230,.5)", faint: "rgba(240,238,230,.32)" };
  const inp: React.CSSProperties = { width: "100%", padding: ".7rem .9rem", background: "rgba(74,107,82,.05)", border: "1px solid rgba(74,107,82,.3)", borderRadius: 4, color: C.text, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", outline: "none" };
  const btnStyle = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: ".85rem 1.5rem", border: primary ? "none" : "1px solid rgba(184,146,60,.4)", borderRadius: 4, fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer", background: primary ? `linear-gradient(135deg,${C.sageL},${C.sage})` : "transparent", color: primary ? "#0c120d" : C.soft, transition: "all .3s" });

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(120% 70% at 50% -5%, #18211a 0%, ${C.bg} 62%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(2.5rem + env(safe-area-inset-top)) 1.2rem calc(2.5rem + env(safe-area-inset-bottom))", overflow: "hidden", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes lysRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes lilySway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
        .lys-rev{opacity:0;animation:lysRise .8s cubic-bezier(.16,1,.3,1) forwards}
      `}</style>

      {/* Filigree bg */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: .05, backgroundImage: "repeating-linear-gradient(0deg,transparent 0 38px,rgba(122,168,130,.4) 38px 40px,transparent 40px 78px),repeating-linear-gradient(90deg,transparent 0 38px,rgba(122,168,130,.4) 38px 40px,transparent 40px 78px)", backgroundSize: "78px 78px", maskImage: "radial-gradient(circle at 50% 50%,#000 0%,transparent 75%)" }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 480 }}>
        <div style={{ background: `linear-gradient(172deg,#1a221b,${C.card})`, border: "1px solid rgba(74,107,82,.4)", padding: "3rem 2.4rem 3.2rem", textAlign: "center", overflow: "hidden", boxShadow: "0 50px 110px -40px rgba(0,0,0,.8)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 12, border: "1px solid rgba(74,107,82,.22)", pointerEvents: "none" }} />

          {/* Guest badge */}
          {guestName && (
            <div className="lys-rev" style={{ marginBottom: "1.2rem" }}>
              <p style={{ fontFamily: "'Marcellus',serif", fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.gold }}>À l&apos;attention de</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.text }}>{guestName}</p>
            </div>
          )}

          {/* Lily SVG */}
          <svg className="lys-rev" style={{ width: 88, height: 88, display: "block", margin: "0 auto", animation: "lilySway 6s ease-in-out infinite", animationDelay: ".05s" }} viewBox="0 0 100 100">
            {[0, 60, 120, 180, 240, 300].map(r => (
              <path key={r} d="M50 52 C40 34 42 14 50 4 C58 14 60 34 50 52 Z" transform={`rotate(${r} 50 52)`} style={{ fill: "rgba(252,250,245,.92)", stroke: C.gold, strokeWidth: 1.1 }} />
            ))}
            <line x1="50" y1="52" x2="50" y2="34" style={{ stroke: C.vivid, strokeWidth: 1.4, strokeLinecap: "round" }} />
            <line x1="50" y1="52" x2="42" y2="38" style={{ stroke: C.vivid, strokeWidth: 1.4, strokeLinecap: "round" }} />
            <line x1="50" y1="52" x2="58" y2="38" style={{ stroke: C.vivid, strokeWidth: 1.4, strokeLinecap: "round" }} />
            {[[50, 33], [42, 37], [58, 37]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.4" fill={C.vivid} />)}
          </svg>

          <p className="lys-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.16rem", color: C.soft, lineHeight: 1.6, margin: "1.4rem auto 0", maxWidth: "30ch", animationDelay: ".1s" }}>
            {content.invitationLine}
          </p>

          <h1 className="lys-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: "clamp(1.7rem,7vw,2.4rem)", letterSpacing: ".16em", textTransform: "uppercase", color: C.ivory, lineHeight: 1.1, margin: "1.5rem 0 0", animationDelay: ".2s" }}>{evType}</h1>
          <p className="lys-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".96rem", letterSpacing: ".34em", textTransform: "uppercase", color: C.sageL, marginTop: ".7rem", animationDelay: ".28s" }}>{evSub}</p>

          <p className="lys-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: "1.7rem", color: C.vivid, marginTop: "1.8rem", lineHeight: 1.2, animationDelay: ".4s" }}>{institution}</p>
          {content.note && <p className="lys-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.22rem", color: C.sageL, marginTop: ".4rem", animationDelay: ".46s" }}>{content.note}</p>}

          {/* Sep */}
          <div className="lys-rev" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".9rem", margin: "1.9rem auto", width: "66%", animationDelay: ".55s" }}>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,rgba(184,146,60,.45))` }} />
            <svg viewBox="0 0 24 24" fill="none" width={18} height={18}><path d="M12 3 C10 8 11 12 12 13 C13 12 14 8 12 3Z M12 13 C9 11 6 12 4 14 C7 15 10 15 12 13Z M12 13 C15 11 18 12 20 14 C17 15 14 15 12 13Z" fill={C.gold} /></svg>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,rgba(184,146,60,.45),transparent)` }} />
          </div>

          <p className="lys-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.text, lineHeight: 1.7, animationDelay: ".62s" }}>
            {dateStr} — {content.time.replace(":", "h")}<br />
            <span style={{ fontStyle: "italic", color: C.sageL }}>{content.venue}{content.venueSub ? `, ${content.venueSub}` : ""}</span>
          </p>

          {/* Countdown */}
          {showCountdown && !cdDone && (
            <div className="lys-rev" style={{ display: "flex", justifyContent: "center", gap: "1.3rem", margin: "2.2rem 0 .2rem", animationDelay: ".72s" }}>
              {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                <div key={lab} style={{ textAlign: "center", minWidth: 54, padding: ".7rem .4rem", border: "1px solid rgba(74,107,82,.3)", background: "rgba(74,107,82,.06)" }}>
                  <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.6rem", color: C.ivory, display: "block", lineHeight: 1 }}>{val}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".66rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".4rem" }}>{lab}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="lys-rev" style={{ marginTop: "2.4rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap", animationDelay: ".8s" }}>
            {showRsvp && invitationId && <button style={btnStyle(true)} onClick={() => document.getElementById("lys-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Confirmer ma présence</button>}
            {content.mapsUrl && <a href={content.mapsUrl} target="_blank" rel="noopener noreferrer" style={btnStyle()}>Itinéraire</a>}
          </div>

          <p className="lys-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: ".65rem", letterSpacing: ".2em", textTransform: "uppercase", color: C.faint, marginTop: "1.6rem", animationDelay: ".88s" }}>{content.closing}</p>

          {/* RSVP */}
          {showRsvp && invitationId && (
            <section id="lys-rsvp" style={{ marginTop: "2.4rem", borderTop: "1px solid rgba(74,107,82,.3)", paddingTop: "2rem" }}>
              <h2 style={{ fontFamily: "'Marcellus',serif", fontSize: "1.1rem", color: C.text, marginBottom: "1.2rem" }}>Serez-vous présent(e) ?</h2>
              {rsvpSent || alreadyResponded ? (
                <p style={{ color: C.soft, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", lineHeight: 1.8 }}>
                  {alreadyResponded && !rsvpSent ? "Vous avez déjà répondu. Merci !" : <>Merci <strong style={{ color: C.sageL }}>{rsvpName}</strong> — réponse enregistrée.</>}
                </p>
              ) : (
                <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                  <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["attending", "declined"] as const).map((v, i) => (
                      <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.sageL : "rgba(74,107,82,.25)"}`, background: rsvpAttending === v ? "rgba(74,107,82,.12)" : "transparent", color: rsvpAttending === v ? C.sageL : C.faint, fontFamily: "'Marcellus',serif", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 4 }}>
                        {i === 0 ? "Confirmer" : "Décliner"}
                      </button>
                    ))}
                  </div>
                  {rsvpAttending === "attending" && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".9rem", color: C.soft }}>Nombre de personnes</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {([-1, null, 1] as const).map((d, i) => d !== null ? <button key={i} type="button" onClick={() => setRsvpSize(s => Math.max(1, Math.min(20, s + d)))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(74,107,82,.3)", background: "transparent", color: C.sage, cursor: "pointer" }}>{d > 0 ? "+" : "−"}</button> : <span key={i} style={{ fontFamily: "'Marcellus',serif", fontSize: "1rem", color: C.text, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>)}
                      </div>
                    </div>
                  )}
                  <textarea style={{ ...inp, resize: "vertical" }} placeholder="Message (optionnel)" value={rsvpMsg} onChange={e => setRsvpMsg(e.target.value)} rows={2} />
                  <button type="submit" disabled={!rsvpAttending || rsvpName.trim().length < 2 || rsvpLoading} style={{ ...btnStyle(true), alignSelf: "center", padding: ".7rem 2rem" } as React.CSSProperties}>{rsvpLoading ? "Envoi…" : "Envoyer →"}</button>
                </form>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
