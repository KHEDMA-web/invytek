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

export default function SoireePrestigeTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true, showNote = true } = options;
  const [cd, setCd] = useState({ j: "––", h: "––", m: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // names[0] = event title, names[1] = edition, hosts = company
  const title = content.names[0];
  const edition = content.names[1];
  const company = content.hosts;

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

  const C = { night: "#0A0A0F", card: "#101019", gold: "#B8923C", vivid: "#D4AF61", light: "#E8D8B0", text: "rgba(240,238,232,.84)", soft: "rgba(240,238,232,.52)", faint: "rgba(240,238,232,.32)" };
  const inp: React.CSSProperties = { width: "100%", padding: ".7rem .9rem", background: "rgba(184,146,60,.05)", border: "1px solid rgba(184,146,60,.22)", borderRadius: 4, color: C.text, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", outline: "none" };
  const btn = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: ".85rem 1.5rem", border: primary ? "none" : "1px solid rgba(184,146,60,.4)", borderRadius: 2, fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer", background: primary ? `linear-gradient(135deg,${C.vivid},${C.gold})` : "transparent", color: primary ? "#1a1408" : C.soft, transition: "all .3s" });

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(130% 80% at 50% -10%, #16161f 0%, ${C.night} 60%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(2.5rem + env(safe-area-inset-top)) 1.2rem calc(2.5rem + env(safe-area-inset-bottom))", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
      <style>{`@keyframes presRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}} .pres-rev{opacity:0;animation:presRise .7s cubic-bezier(.16,1,.3,1) forwards}`}</style>

      <div style={{ width: "100%", maxWidth: 470, position: "relative" }}>
        <div style={{ background: `linear-gradient(168deg,#14141f,${C.card})`, border: "1px solid rgba(184,146,60,.4)", boxShadow: "0 50px 120px -40px rgba(0,0,0,.85)", position: "relative", padding: "3rem 2.4rem 3.2rem", textAlign: "center" }}>
          {/* Corner ornaments */}
          {[["tl","top:16px;left:16px"],["tr","top:16px;right:16px"],["bl","bottom:16px;left:16px"],["br","bottom:16px;right:16px"]].map(([k, pos]) => (
            <div key={k} style={{ position: "absolute", width: 46, height: 46, ...(Object.fromEntries(pos.split(";").map(p => { const [kk, v] = p.split(":"); return [kk.trim(), v.trim()]; }))) as React.CSSProperties }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 1, background: C.gold }} />
              <div style={{ position: "absolute", top: 0, left: 0, width: 1, height: "100%", background: C.gold }} />
            </div>
          ))}

          {/* Guest badge */}
          {guestName && (
            <div className="pres-rev" style={{ marginBottom: "1.2rem" }}>
              <p style={{ fontFamily: "'Marcellus',serif", fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.gold }}>À l&apos;attention de</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.text, lineHeight: 1.2 }}>{guestName}</p>
            </div>
          )}

          {/* Monogram */}
          <div className="pres-rev" style={{ width: 84, height: 84, border: `1px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(45deg)", margin: "0 auto 2rem", animationDelay: ".05s" }}>
            <span style={{ transform: "rotate(-45deg)", fontFamily: "'Marcellus',serif", fontSize: "1.9rem", color: C.vivid, letterSpacing: ".04em" }}>
              {(content.initials[0] + content.initials[1]).toUpperCase()}
            </span>
          </div>

          <p className="pres-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.14rem", color: C.soft, animationDelay: ".1s" }}>
            {content.invitationLine}
          </p>
          <h1 className="pres-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: "clamp(2rem,8vw,2.9rem)", letterSpacing: ".1em", textTransform: "uppercase", color: "#F0EEE8", lineHeight: 1.08, margin: "1rem 0 0", animationDelay: ".2s" }}>
            {title}<span style={{ display: "block", fontSize: ".5em", color: C.vivid, letterSpacing: ".3em", marginTop: ".5rem" }}>{edition}</span>
          </h1>
          <p className="pres-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.light, marginTop: ".8rem", animationDelay: ".3s" }}>{company}</p>

          {/* Diamond sep */}
          <div className="pres-rev" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", margin: "1.9rem auto", width: "60%", animationDelay: ".4s" }}>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,rgba(184,146,60,.5))` }} />
            <span style={{ width: 8, height: 8, transform: "rotate(45deg)", background: C.gold, flexShrink: 0 }} />
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,rgba(184,146,60,.5),transparent)` }} />
          </div>

          <p className="pres-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.04rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#F0EEE8", lineHeight: 1.9, animationDelay: ".48s" }}>
            {dateStr}<br />{content.dayLabel} · {content.time.replace(":", "h")} · {content.venue}
          </p>
          {content.venueSub && <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.18rem", color: C.soft, marginTop: ".5rem" }}>{content.venueSub}</p>}

          {/* Access code (note field) */}
          {showNote && content.note && (
            <div className="pres-rev" style={{ margin: "1.8rem auto 0", padding: ".7rem 1.4rem", border: "1px solid rgba(184,146,60,.4)", display: "inline-flex", gap: ".7rem", alignItems: "center", animationDelay: ".56s" }}>
              <span style={{ fontFamily: "'Marcellus',serif", fontSize: ".6rem", letterSpacing: ".2em", textTransform: "uppercase", color: C.faint }}>Note</span>
              <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.05rem", letterSpacing: ".34em", color: C.vivid }}>{content.note}</span>
            </div>
          )}

          {/* Countdown */}
          {showCountdown && !cdDone && (
            <div className="pres-rev" style={{ display: "flex", justifyContent: "center", gap: "1.4rem", margin: "2rem 0 .2rem", animationDelay: ".64s" }}>
              {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                <div key={lab} style={{ textAlign: "center" }}>
                  <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.8rem", color: "#F0EEE8", display: "block", lineHeight: 1 }}>{val}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".68rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".4rem" }}>{lab}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="pres-rev" style={{ marginTop: "2.2rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap", animationDelay: ".72s" }}>
            {showRsvp && invitationId && <button style={btn(true)} onClick={() => document.getElementById("pres-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Confirmer ma présence</button>}
            {content.mapsUrl && <a href={content.mapsUrl} target="_blank" rel="noopener noreferrer" style={btn()}>Itinéraire</a>}
          </div>

          <p className="pres-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: ".6rem", letterSpacing: ".2em", textTransform: "uppercase", color: C.faint, marginTop: "1.8rem", animationDelay: ".8s" }}>
            {content.closing}
          </p>

          {/* RSVP */}
          {showRsvp && invitationId && (
            <section id="pres-rsvp" style={{ marginTop: "2.4rem", borderTop: "1px solid rgba(184,146,60,.18)", paddingTop: "2rem" }}>
              <h2 style={{ fontFamily: "'Marcellus',serif", fontSize: "1.1rem", color: C.text, letterSpacing: ".04em", marginBottom: "1.2rem" }}>Serez-vous des nôtres ?</h2>
              {rsvpSent || alreadyResponded ? (
                <p style={{ color: C.soft, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", lineHeight: 1.8 }}>
                  {alreadyResponded && !rsvpSent ? "Vous avez déjà répondu. Merci !" : <>Merci <strong style={{ color: C.vivid }}>{rsvpName}</strong> — votre réponse a été enregistrée.</>}
                </p>
              ) : (
                <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                  <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["attending", "declined"] as const).map((v, i) => (
                      <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.vivid : "rgba(184,146,60,.2)"}`, background: rsvpAttending === v ? "rgba(184,146,60,.1)" : "transparent", color: rsvpAttending === v ? C.vivid : C.faint, fontFamily: "'Marcellus',serif", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 2 }}>
                        {i === 0 ? "Confirmer" : "Décliner"}
                      </button>
                    ))}
                  </div>
                  {rsvpAttending === "attending" && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".9rem", color: C.soft }}>Nombre de personnes</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {([-1, null, 1] as const).map((d, i) => d !== null ? <button key={i} type="button" onClick={() => setRsvpSize(s => Math.max(1, Math.min(20, s + d)))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(184,146,60,.3)", background: "transparent", color: C.gold, cursor: "pointer" }}>{d > 0 ? "+" : "−"}</button> : <span key={i} style={{ fontFamily: "'Marcellus',serif", fontSize: "1rem", color: C.text, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>)}
                      </div>
                    </div>
                  )}
                  <textarea style={{ ...inp, resize: "vertical" }} placeholder="Message (optionnel)" value={rsvpMsg} onChange={e => setRsvpMsg(e.target.value)} rows={2} />
                  <button type="submit" disabled={!rsvpAttending || rsvpName.trim().length < 2 || rsvpLoading} style={{ ...btn(true), alignSelf: "center", padding: ".7rem 2rem" } as React.CSSProperties}>{rsvpLoading ? "Envoi…" : "Envoyer →"}</button>
                </form>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
