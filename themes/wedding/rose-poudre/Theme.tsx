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

const KS = `
@keyframes rpRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes rpDrift{0%,100%{transform:translate(0,0) rotate(0);opacity:.7}50%{transform:translate(12px,18px) rotate(40deg);opacity:1}}
@keyframes rpPulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes rpEnvIn{from{transform:translateY(20px) scale(.93)}to{transform:none}}
.rp-rev{opacity:0;animation:rpRise .85s cubic-bezier(.16,1,.3,1) forwards}
.rp-gate{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(130% 80% at 50% 30%,#FEF8F9,#FBEFF1 70%);text-align:center;padding:2rem;transition:opacity .8s ease .35s,visibility 0s 1.15s}
.rp-gate.out{opacity:0;visibility:hidden}
.rp-env{position:relative;width:248px;height:166px;cursor:pointer;perspective:900px;margin-bottom:1.6rem;animation:rpEnvIn 1s cubic-bezier(.16,1,.3,1) forwards}
.rp-flap{position:absolute;top:0;left:0;width:100%;height:62%;clip-path:polygon(0 0,100% 0,50% 100%);transform-origin:top;transition:transform .8s cubic-bezier(.6,0,.3,1);z-index:4;background:linear-gradient(150deg,#E8B6C2,#C77B8B);border-bottom:1px solid rgba(196,154,72,.25)}
.rp-env.open .rp-flap{transform:rotateX(-180deg);z-index:1}
.rp-seal{position:absolute;left:50%;top:54%;transform:translate(-50%,-50%);width:58px;height:58px;border-radius:50%;z-index:6;background:radial-gradient(circle at 38% 34%,#E0BC6A,#C49A48 62%,#9a7430 100%);box-shadow:0 6px 16px -4px rgba(0,0,0,.3),inset 0 2px 4px rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;transition:transform .4s ease,opacity .4s ease}
.rp-env.open .rp-seal{transform:translate(-50%,-50%) scale(.6);opacity:0}
`;

export default function RosePoudreTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true } = options;
  const [opened, setOpened] = useState(false);
  const [envOpen, setEnvOpen] = useState(false);
  const [cd, setCd] = useState({ j: "––", h: "––", m: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

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

  function openGate() { setEnvOpen(true); setTimeout(() => setOpened(true), 500); }

  async function submitRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!invitationId || !rsvpAttending || rsvpName.trim().length < 2) return;
    setRsvpLoading(true);
    try {
      await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId, name: rsvpName.trim(), status: rsvpAttending, partySize: rsvpSize, message: rsvpMsg || undefined, token: guestToken }) });
      setRsvpSent(true);
    } catch { /* silent */ } finally { setRsvpLoading(false); }
  }

  function saveDate() {
    const [y, mo, d] = content.date.split("-"); const [hh, mm] = content.time.split(":");
    const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Invytek//FR","CALSCALE:GREGORIAN","BEGIN:VEVENT",
      `DTSTART:${y}${mo}${d}T${hh}${mm}00`,`SUMMARY:Mariage de ${content.names[0]} avec ${content.names[1]}`,
      `LOCATION:${content.venue}${content.venueSub?"\\, "+content.venueSub:""}`,`DESCRIPTION:${content.hosts}`,
      "END:VEVENT","END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));
    a.download = `mariage-${content.names[0].toLowerCase()}-${content.names[1].toLowerCase()}.ics`; a.click();
  }

  const C = {
    paper: "#FBEFF1", paper2: "#FDF7F8", ink: "#6B4350",
    rose: "#C77B8B", roseD: "#A85A6C", blush: "#E8B6C2", blushS: "#F2D3DB",
    gold: "#C49A48", vivid: "#E0BC6A", goldS: "rgba(196,154,72,.5)",
    text: "rgba(107,67,80,.82)", soft: "rgba(107,67,80,.56)", faint: "rgba(107,67,80,.34)",
  };
  const dateObj = new Date(content.date + "T12:00:00");
  const dateStr = dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: "rgba(199,123,139,.05)", border: `1px solid rgba(199,123,139,.3)`, borderRadius: 4, color: C.ink, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", outline: "none" };
  const btnSt = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: ".9rem 1.5rem", fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `1px solid ${C.goldS}`, background: primary ? `linear-gradient(135deg,${C.rose},${C.roseD})` : "transparent", color: primary ? "#fff" : C.soft, transition: "all .25s", borderRadius: 40 });
  const initials = (content.names[0][0] ?? "N");

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(130% 80% at 50% -5%,#FEF8F9 0%,${C.paper} 64%),${C.paper}`, color: C.text, fontFamily: "'Cormorant Garamond',serif", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=swap" rel="stylesheet" />
      <style>{KS}</style>

      {/* Gate */}
      {!opened && (
        <div className={`rp-gate${envOpen ? " out" : ""}`} onClick={openGate}>
          <div className={`rp-env${envOpen ? " open" : ""}`}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg,${C.blush} 0%,${C.rose} 100%)`, border: `1px solid rgba(196,154,72,.4)` }} />
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "54%", height: "64%", background: `linear-gradient(140deg,${C.blushS},${C.blush})`, clipPath: "polygon(0 0,0 100%,100% 100%)" }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: "54%", height: "64%", background: `linear-gradient(140deg,${C.blushS},${C.blush})`, clipPath: "polygon(100% 0,0 100%,100% 100%)" }} />
            </div>
            <div className="rp-flap" />
            <div className="rp-seal"><span style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "2rem", color: "#5a4318", lineHeight: 1 }}>{initials}</span></div>
          </div>
          <div style={{ fontFamily: "'Marcellus',serif", fontSize: "1.3rem", letterSpacing: ".3em", textTransform: "uppercase", color: C.rose, textIndent: ".3em" }}>Invitation</div>
          <div style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "2.7rem", color: C.roseD, marginTop: ".3rem" }}>
            {content.names[0]} &amp; {content.names[1]}
          </div>
          <div style={{ marginTop: "1.4rem", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1rem", color: C.rose, animation: "rpPulse 2.2s ease-in-out infinite" }}>
            Touchez pour ouvrir
          </div>
        </div>
      )}

      {/* Card */}
      {opened && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "calc(2.5rem + env(safe-area-inset-top)) 1.2rem calc(2.5rem + env(safe-area-inset-bottom))" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 440, zIndex: 2 }}>
            {/* Drifting petal */}
            <div style={{ position: "absolute", top: 90, left: 30, width: 14, height: 14, zIndex: 3, animation: "rpDrift 7s ease-in-out infinite" }}>
              <svg viewBox="0 0 14 14" fill="none" width="14" height="14"><ellipse cx="7" cy="7" rx="4" ry="6.5" fill="#E8B6C2" opacity=".8" transform="rotate(-30 7 7)"/></svg>
            </div>
            <div style={{ position: "relative", width: "100%", background: `linear-gradient(168deg,${C.paper2} 0%,${C.paper} 100%)`, border: `1px solid rgba(196,154,72,.32)`, padding: "3.6rem 2.2rem 3rem", textAlign: "center", overflow: "hidden", boxShadow: `0 40px 100px -42px rgba(168,90,108,.32),inset 0 1px 0 rgba(255,255,255,.6)` }}>
              <div style={{ position: "absolute", inset: 11, border: `1px solid rgba(199,123,139,.3)`, pointerEvents: "none" }} />

              {/* Cherry blossom corners */}
              {[{ t: -8, l: -8, tf: "" }, { t: -8, r: -8, tf: "scaleX(-1)" }, { b: -8, l: -8, tf: "scaleY(-1)" }, { b: -8, r: -8, tf: "scale(-1,-1)" }].map((pos, i) => (
                <div key={i} style={{ position: "absolute", width: 130, height: 130, ...(pos.t !== undefined ? { top: pos.t } : { bottom: pos.b }), ...(pos.l !== undefined ? { left: pos.l } : { right: pos.r }), transform: pos.tf || undefined, zIndex: 1, pointerEvents: "none" }}>
                  <svg viewBox="0 0 130 130" fill="none" width="130" height="130">
                    <g stroke="#C77B8B" strokeWidth="1" opacity=".6" strokeLinecap="round">
                      <path d="M10 10 C40 22 62 50 68 88"/>
                      <path d="M26 16 C32 24 34 34 30 44"/>
                      <path d="M18 34 C26 38 34 38 40 32"/>
                    </g>
                    <g fill="#E8B6C2" opacity=".7">
                      <ellipse cx="36" cy="26" rx="5" ry="3" transform="rotate(-30 36 26)"/>
                      <ellipse cx="50" cy="50" rx="4.5" ry="2.6" transform="rotate(-25 50 50)"/>
                    </g>
                  </svg>
                </div>
              ))}

              {guestName && (
                <div className="rp-rev" style={{ marginBottom: "1rem" }}>
                  <p style={{ fontFamily: "'Marcellus',serif", fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.gold }}>À l&apos;attention de</p>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.ink }}>{guestName}</p>
                </div>
              )}

              <p className="rp-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".4em", textTransform: "uppercase", color: C.rose, textIndent: ".4em", animationDelay: ".1s" }}>
                {content.invitationLine || "Avec bonheur"}
              </p>
              <p className="rp-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.12rem", color: C.soft, lineHeight: 1.6, marginTop: "1.2rem", maxWidth: "30ch", marginInline: "auto", animationDelay: ".18s" }}>
                {content.hosts}
              </p>
              <div className="rp-rev" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(2.9rem,14vw,4.1rem)", lineHeight: .96, color: C.roseD, marginTop: ".9rem", animationDelay: ".3s" }}>
                {content.names[0]}<span style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.25rem", color: C.rose, margin: ".05rem 0" }}>&amp;</span>{content.names[1]}
              </div>

              <div className="rp-rev" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".9rem", margin: "1.6rem auto", width: "66%", animationDelay: ".42s" }}>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.goldS})` }} />
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M12 3 C10 6 6 8 5 12 A5.5 5.5 0 0 0 12 18.5 A5.5 5.5 0 0 0 19 12 C18 8 14 6 12 3Z" fill="#C49A48"/><circle cx="12" cy="10" r="2" fill="#E8B6C2"/></svg>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.goldS},transparent)` }} />
              </div>

              <p className="rp-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.text, lineHeight: 1.7, animationDelay: ".5s" }}>
                <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.02rem", letterSpacing: ".15em", textTransform: "uppercase", color: C.roseD, display: "block", marginBottom: ".2rem" }}>{dateStr}</span>
                {content.time.replace(":", "h")}<br/><span style={{ fontStyle: "italic", color: C.rose }}>{content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}</span>
              </p>

              {showCountdown && !cdDone && (
                <div className="rp-rev" style={{ display: "flex", justifyContent: "center", gap: ".9rem", margin: "2rem 0 .2rem", animationDelay: ".6s" }}>
                  {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                    <div key={lab} style={{ textAlign: "center", minWidth: 54, padding: ".7rem .4rem", border: `1px solid rgba(199,123,139,.35)`, background: "rgba(199,123,139,.07)" }}>
                      <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.55rem", color: C.roseD, display: "block", lineHeight: 1 }}>{val}</span>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".64rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".45rem" }}>{lab}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="rp-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.1rem", color: C.soft, marginTop: "1.2rem", animationDelay: ".68s" }}>{content.closing}</p>

              <div className="rp-rev" style={{ marginTop: "2rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap", animationDelay: ".7s" }}>
                <button style={btnSt(false)} onClick={saveDate}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  Enregistrer la date
                </button>
                {content.mapsUrl && (
                  <a style={{ ...btnSt(false), textDecoration: "none" }} href={content.mapsUrl} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    Itinéraire
                  </a>
                )}
                {showRsvp && invitationId && <button style={btnSt(true)} onClick={() => document.getElementById("rp-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Confirmer ma présence</button>}
              </div>

              {showRsvp && invitationId && (
                <section id="rp-rsvp" style={{ marginTop: "2.2rem", borderTop: `1px solid rgba(199,123,139,.3)`, paddingTop: "1.8rem" }}>
                  <h2 style={{ fontFamily: "'Marcellus',serif", fontSize: "1.1rem", color: C.roseD, marginBottom: "1rem" }}>Votre réponse</h2>
                  {rsvpSent || alreadyResponded ? (
                    <p style={{ color: C.soft, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", lineHeight: 1.8 }}>
                      {alreadyResponded && !rsvpSent ? "Vous avez déjà répondu — merci !" : <>Merci <strong style={{ color: C.rose }}>{rsvpName}</strong> — réponse enregistrée.</>}
                    </p>
                  ) : (
                    <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                      <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["attending", "declined"] as const).map((v, i) => (
                          <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.rose : "rgba(199,123,139,.35)"}`, background: rsvpAttending === v ? "rgba(199,123,139,.08)" : "transparent", color: rsvpAttending === v ? C.roseD : C.soft, fontFamily: "'Marcellus',serif", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 40 }}>
                            {i === 0 ? "Confirmer" : "Décliner"}
                          </button>
                        ))}
                      </div>
                      {rsvpAttending === "attending" && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".9rem", color: C.soft }}>Nombre de personnes</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button type="button" onClick={() => setRsvpSize(s => Math.max(1, s - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid rgba(199,123,139,.35)`, background: "transparent", color: C.rose, cursor: "pointer" }}>−</button>
                            <span style={{ fontFamily: "'Marcellus',serif", color: C.ink, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>
                            <button type="button" onClick={() => setRsvpSize(s => Math.min(20, s + 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid rgba(199,123,139,.35)`, background: "transparent", color: C.rose, cursor: "pointer" }}>+</button>
                          </div>
                        </div>
                      )}
                      <textarea style={{ ...inp, resize: "vertical" }} placeholder="Message (optionnel)" value={rsvpMsg} onChange={e => setRsvpMsg(e.target.value)} rows={2} />
                      <button type="submit" disabled={!rsvpAttending || rsvpName.trim().length < 2 || rsvpLoading} style={{ ...btnSt(true), alignSelf: "center" } as React.CSSProperties}>{rsvpLoading ? "Envoi…" : "Envoyer →"}</button>
                    </form>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
