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
@keyframes gbRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes gbFlutter{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-10px) rotate(4deg)}}
@keyframes gbPulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes gbEnvIn{from{transform:translateY(20px) scale(.93)}to{transform:none}}
.gb-rev{opacity:0;animation:gbRise .85s cubic-bezier(.16,1,.3,1) forwards}
.gb-gate{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(130% 80% at 50% 30%,#FBFAF5,#F3F0E8 70%);text-align:center;padding:2rem;transition:opacity .8s ease .35s,visibility 0s 1.15s}
.gb-gate.out{opacity:0;visibility:hidden}
.gb-env{position:relative;width:248px;height:166px;cursor:pointer;perspective:900px;margin-bottom:1.6rem;animation:gbEnvIn 1s cubic-bezier(.16,1,.3,1) forwards}
.gb-flap{position:absolute;top:0;left:0;width:100%;height:62%;clip-path:polygon(0 0,100% 0,50% 100%);transform-origin:top;transform:rotateX(0deg);transition:transform .8s cubic-bezier(.6,0,.3,1);z-index:4;background:linear-gradient(150deg,#26477f,#1b3461);border-bottom:1px solid rgba(196,154,72,.25)}
.gb-env.open .gb-flap{transform:rotateX(-180deg);z-index:1}
.gb-seal{position:absolute;left:50%;top:54%;transform:translate(-50%,-50%);width:58px;height:58px;border-radius:50%;z-index:6;background:radial-gradient(circle at 38% 34%,#E0BC6A,#C49A48 62%,#9a7430 100%);box-shadow:0 6px 16px -4px rgba(0,0,0,.5),inset 0 2px 4px rgba(255,255,255,.4),inset 0 -3px 6px rgba(120,90,30,.5);display:flex;align-items:center;justify-content:center;transition:transform .4s ease,opacity .4s ease}
.gb-env.open .gb-seal{transform:translate(-50%,-50%) scale(.6);opacity:0}
`;

export default function GlycineBleueTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
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

  function openGate() {
    setEnvOpen(true);
    setTimeout(() => setOpened(true), 500);
  }

  async function submitRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!invitationId || !rsvpAttending || rsvpName.trim().length < 2) return;
    setRsvpLoading(true);
    try {
      await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId, name: rsvpName.trim(), status: rsvpAttending, partySize: rsvpSize, message: rsvpMsg || undefined, token: guestToken }) });
      setRsvpSent(true);
    } catch { /* silent */ } finally { setRsvpLoading(false); }
  }

  const C = {
    paper: "#F3F0E8", paper2: "#FAF8F2", ink: "#22304F",
    navy: "#1E3A6E", navyD: "#16294E", blue: "#5C7BB8", blueS: "#9BB4DC", blueW: "rgba(120,150,200,.22)",
    gold: "#C49A48", vivid: "#E0BC6A", goldS: "rgba(196,154,72,.5)",
    text: "rgba(34,48,79,.82)", soft: "rgba(34,48,79,.56)", faint: "rgba(34,48,79,.34)",
  };
  const dateObj = new Date(content.date + "T12:00:00");
  const dateStr = dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: "rgba(120,150,200,.05)", border: `1px solid rgba(120,150,200,.3)`, borderRadius: 4, color: C.ink, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", outline: "none" };
  const btnSt = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: ".9rem 1.5rem", fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `1px solid ${C.goldS}`, background: primary ? `linear-gradient(135deg,${C.navy},${C.navyD})` : "transparent", color: primary ? C.paper2 : C.soft, transition: "all .25s", borderRadius: 40 });

  const initials = (content.names[0][0] ?? "L") + (content.names[1][0] ?? "A");

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(130% 80% at 50% -5%,#FBFAF5 0%,${C.paper} 64%),${C.paper}`, color: C.text, fontFamily: "'Cormorant Garamond',serif", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=swap" rel="stylesheet" />
      <style>{KS}</style>

      {/* Gate */}
      {!opened && (
        <div className={`gb-gate${envOpen ? " out" : ""}`} onClick={openGate}>
          <div className={`gb-env${envOpen ? " open" : ""}`}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg,${C.navy} 0%,${C.navyD} 100%)`, border: `1px solid rgba(196,154,72,.4)`, boxShadow: "0 24px 50px -22px rgba(20,34,70,.6)" }} />
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "54%", height: "64%", background: `linear-gradient(140deg,#22427e,#182f5a)`, clipPath: "polygon(0 0,0 100%,100% 100%)", borderRight: "1px solid rgba(196,154,72,.2)" }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: "54%", height: "64%", background: `linear-gradient(140deg,#22427e,#182f5a)`, clipPath: "polygon(100% 0,0 100%,100% 100%)" }} />
            </div>
            <div className="gb-flap" />
            <div className="gb-seal"><span style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "2rem", color: "#5a4318", lineHeight: 1 }}>{initials[0]}</span></div>
          </div>
          <div style={{ fontFamily: "'Marcellus',serif", fontSize: "1.3rem", letterSpacing: ".3em", textTransform: "uppercase", color: C.navy, textIndent: ".3em" }}>Save the Date</div>
          <div style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "2.7rem", color: C.navy, marginTop: ".3rem" }}>
            {content.names[0]} &amp; {content.names[1]}
          </div>
          <div style={{ marginTop: "1.4rem", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1rem", color: C.blue, animation: "gbPulse 2.2s ease-in-out infinite" }}>
            Touchez le sceau pour ouvrir
          </div>
        </div>
      )}

      {/* Card */}
      {opened && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "calc(2.5rem + env(safe-area-inset-top)) 1.2rem calc(2.5rem + env(safe-area-inset-bottom))" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 440, zIndex: 2 }}>
            <div style={{ position: "relative", width: "100%", background: `linear-gradient(168deg,${C.paper2} 0%,${C.paper} 100%)`, border: `1px solid rgba(196,154,72,.35)`, padding: "3.6rem 2.2rem 3rem", textAlign: "center", overflow: "hidden", boxShadow: `0 40px 100px -42px rgba(30,40,70,.4),inset 0 1px 0 rgba(255,255,255,.6)` }}>
              <div style={{ position: "absolute", inset: 11, border: `1px solid rgba(120,150,200,.28)`, pointerEvents: "none" }} />

              {/* Butterfly */}
              <div style={{ position: "absolute", width: 48, height: 48, right: 18, top: 120, zIndex: 3, animation: "gbFlutter 5s ease-in-out infinite" }}>
                <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
                  <g fill="#5C7BB8" opacity=".85">
                    <path d="M24 24 C16 8 4 10 6 22 C7 30 18 28 24 24Z"/>
                    <path d="M24 24 C32 8 44 10 42 22 C41 30 30 28 24 24Z"/>
                    <path d="M24 24 C18 32 8 34 10 42 C16 42 22 32 24 24Z" fill="#9BB4DC"/>
                    <path d="M24 24 C30 32 40 34 38 42 C32 42 26 32 24 24Z" fill="#9BB4DC"/>
                  </g>
                  <path d="M24 14 L24 36" stroke="#2C447A" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Floral corners (simplified) */}
              {[["top: -10px; left: -10px", ""], ["top: -10px; right: -10px", "scaleX(-1)"], ["bottom: -10px; left: -10px", "scaleY(-1)"], ["bottom: -10px; right: -10px", "scale(-1,-1)"]].map(([pos, tf], i) => (
                <div key={i} style={{ position: "absolute", width: 120, height: 120, ...(pos.includes("top") && pos.includes("left") ? { top: -10, left: -10 } : pos.includes("top") ? { top: -10, right: -10 } : pos.includes("left") ? { bottom: -10, left: -10 } : { bottom: -10, right: -10 }), transform: tf || undefined, zIndex: 1, pointerEvents: "none", opacity: .6 }}>
                  <svg viewBox="0 0 150 150" fill="none" width="120" height="120">
                    <g fill="#6E8CC4" opacity=".5">
                      <ellipse cx="40" cy="30" rx="6" ry="3.4" transform="rotate(-30 40 30)"/>
                      <ellipse cx="58" cy="56" rx="5.4" ry="3" transform="rotate(-30 58 56)"/>
                    </g>
                    <g stroke="#3E5C96" strokeWidth="1.2" strokeLinecap="round" opacity=".55">
                      <path d="M14 14 C46 30 70 60 78 96"/>
                      <path d="M30 22 C36 30 38 38 36 48"/><path d="M22 40 C30 44 38 44 46 40"/>
                    </g>
                  </svg>
                </div>
              ))}

              {guestName && (
                <div className="gb-rev" style={{ marginBottom: "1rem" }}>
                  <p style={{ fontFamily: "'Marcellus',serif", fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.gold }}>À l&apos;attention de</p>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.ink }}>{guestName}</p>
                </div>
              )}

              <p className="gb-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".4em", textTransform: "uppercase", color: C.blue, textIndent: ".4em", animationDelay: ".1s" }}>
                {content.invitationLine || "Avec joie, nous célébrons"}
              </p>
              <p className="gb-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.12rem", color: C.soft, lineHeight: 1.6, marginTop: "1.2rem", maxWidth: "30ch", marginInline: "auto", animationDelay: ".18s" }}>
                {content.hosts}
              </p>
              <div className="gb-rev" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(2.9rem,14vw,4.1rem)", lineHeight: .96, color: C.navy, marginTop: ".9rem", animationDelay: ".3s" }}>
                {content.names[0]}<span style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.25rem", color: C.blue, margin: ".05rem 0" }}>&amp;</span>{content.names[1]}
              </div>

              <div className="gb-rev" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".9rem", margin: "1.6rem auto", width: "66%", animationDelay: ".42s" }}>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.goldS})` }} />
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M12 3 C9 9 5 10 5 14 a4 4 0 0 0 7 2.6 a4 4 0 0 0 7-2.6 C19 10 15 9 12 3Z" fill={C.gold}/></svg>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.goldS},transparent)` }} />
              </div>

              <p className="gb-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.text, lineHeight: 1.7, animationDelay: ".5s" }}>
                <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.02rem", letterSpacing: ".15em", textTransform: "uppercase", color: C.navy, display: "block", marginBottom: ".2rem" }}>{dateStr}</span>
                {content.time.replace(":", "h")}<br/><span style={{ fontStyle: "italic", color: C.blue }}>{content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}</span>
              </p>

              {showCountdown && !cdDone && (
                <div className="gb-rev" style={{ display: "flex", justifyContent: "center", gap: ".9rem", margin: "2rem 0 .2rem", animationDelay: ".6s" }}>
                  {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                    <div key={lab} style={{ textAlign: "center", minWidth: 54, padding: ".7rem .4rem", border: `1px solid rgba(120,150,200,.35)`, background: "rgba(120,150,200,.07)" }}>
                      <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.55rem", color: C.navy, display: "block", lineHeight: 1 }}>{val}</span>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".64rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".45rem" }}>{lab}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="gb-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.1rem", color: C.soft, marginTop: "1.2rem", animationDelay: ".68s" }}>{content.closing}</p>

              <div className="gb-rev" style={{ marginTop: "2rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap", animationDelay: ".7s" }}>
                {showRsvp && invitationId && <button style={btnSt(true)} onClick={() => document.getElementById("gb-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Confirmer ma présence</button>}
              </div>

              {showRsvp && invitationId && (
                <section id="gb-rsvp" style={{ marginTop: "2.2rem", borderTop: `1px solid rgba(120,150,200,.3)`, paddingTop: "1.8rem" }}>
                  <h2 style={{ fontFamily: "'Marcellus',serif", fontSize: "1.1rem", color: C.navy, marginBottom: "1rem" }}>Votre réponse</h2>
                  {rsvpSent || alreadyResponded ? (
                    <p style={{ color: C.soft, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", lineHeight: 1.8 }}>
                      {alreadyResponded && !rsvpSent ? "Vous avez déjà répondu — merci !" : <>Merci <strong style={{ color: C.navy }}>{rsvpName}</strong> — réponse enregistrée.</>}
                    </p>
                  ) : (
                    <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                      <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["attending", "declined"] as const).map((v, i) => (
                          <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.navy : "rgba(120,150,200,.35)"}`, background: rsvpAttending === v ? "rgba(30,58,110,.08)" : "transparent", color: rsvpAttending === v ? C.navy : C.soft, fontFamily: "'Marcellus',serif", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 40 }}>
                            {i === 0 ? "Confirmer" : "Décliner"}
                          </button>
                        ))}
                      </div>
                      {rsvpAttending === "attending" && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".9rem", color: C.soft }}>Nombre de personnes</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button type="button" onClick={() => setRsvpSize(s => Math.max(1, s - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid rgba(120,150,200,.35)`, background: "transparent", color: C.navy, cursor: "pointer" }}>−</button>
                            <span style={{ fontFamily: "'Marcellus',serif", color: C.ink, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>
                            <button type="button" onClick={() => setRsvpSize(s => Math.min(20, s + 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid rgba(120,150,200,.35)`, background: "transparent", color: C.navy, cursor: "pointer" }}>+</button>
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
