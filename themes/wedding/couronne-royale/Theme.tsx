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
@keyframes crRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes crTwinkle{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes crCrownIn{from{transform:translateY(-18px) scale(.88)}to{transform:none}}
.cr-rev{opacity:0;animation:crRise .85s cubic-bezier(.16,1,.3,1) forwards}
.cr-gate{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;transition:opacity .9s ease,visibility 0s .9s;background:radial-gradient(120% 80% at 50% 35%,#16234f,#0b1330 72%)}
.cr-gate.out{opacity:0;visibility:hidden}
.cr-twinkle{animation:crTwinkle 2.6s ease-in-out infinite}
.cr-twinkle:nth-child(2){animation-delay:.5s}.cr-twinkle:nth-child(3){animation-delay:1s}.cr-twinkle:nth-child(4){animation-delay:1.5s}
`;

function CrownSvg({ size = 108 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.77)} viewBox="0 0 120 92" fill="none" aria-hidden>
      <defs>
        <linearGradient id="cr-cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F3E2A8"/><stop offset="1" stopColor="#B88A38"/></linearGradient>
        <linearGradient id="cr-cg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E7C76C"/><stop offset="1" stopColor="#9C742E"/></linearGradient>
      </defs>
      <path d="M12 78 L18 34 L40 58 L60 22 L80 58 L102 34 L108 78 Z" fill="url(#cr-cg)" stroke="#8A6A28" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M12 78 L108 78 L106 88 L14 88 Z" fill="url(#cr-cg2)" stroke="#8A6A28" strokeWidth="1"/>
      <circle className="cr-twinkle" cx="60" cy="14" r="5.5" fill="#E7C76C"/>
      <circle className="cr-twinkle" cx="18" cy="30" r="4" fill="#F3E2A8"/>
      <circle className="cr-twinkle" cx="102" cy="30" r="4" fill="#F3E2A8"/>
      <circle className="cr-twinkle" cx="60" cy="83" r="3.4" fill="#B23A4A"/>
      <circle cx="40" cy="83" r="2.6" fill="#7BA8D8"/><circle cx="80" cy="83" r="2.6" fill="#7BA8D8"/>
      <path d="M60 4 L60 14 M55 8 L65 8" stroke="#E7C76C" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function CornerSvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" width="88" height="88" style={{ position: "absolute" }} aria-hidden>
      <g stroke="#C29A4B" strokeWidth="1.1" strokeLinecap="round" fill="none">
        <path d="M6 6 C40 10 70 30 78 70"/>
        <path d="M6 6 C10 40 30 70 70 78"/>
        <path d="M20 10 C36 16 44 30 40 46 C30 38 22 26 20 10Z" fill="rgba(194,154,75,.14)"/>
        <path d="M10 20 C16 36 30 44 46 40 C38 30 26 22 10 20Z" fill="rgba(194,154,75,.14)"/>
        <circle cx="6" cy="6" r="3" fill="#E7C76C"/>
      </g>
    </svg>
  );
}

export default function CouronneRoyaleTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true } = options;
  const [opened, setOpened] = useState(false);
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
    navy: "#0b1330", navy2: "#101b42", card: "#0e1738", card2: "#13204c",
    gold: "#C29A4B", vivid: "#E7C76C", light: "#F3E2A8", soft: "rgba(194,154,75,.45)",
    ivory: "#F6F1E4", text: "rgba(246,241,228,.84)", soft2: "rgba(246,241,228,.52)", faint: "rgba(246,241,228,.32)",
  };
  const dateObj = new Date(content.date + "T12:00:00");
  const dateStr = dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: "rgba(194,154,75,.06)", border: `1px solid ${C.soft}`, borderRadius: 4, color: C.ivory, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", outline: "none" };
  const btnSt = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: ".9rem 1.5rem", fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `1px solid ${C.soft}`, background: primary ? `linear-gradient(135deg,${C.vivid},${C.gold})` : "transparent", color: primary ? "#10183a" : C.soft2, transition: "all .25s", borderRadius: 0 });

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(120% 75% at 50% -8%,#16234f 0%,${C.navy} 60%),${C.navy}`, color: C.text, fontFamily: "'Cormorant Garamond',serif", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=swap" rel="stylesheet" />
      <style>{KS}</style>

      {/* Damask texture */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: .05, backgroundImage: "radial-gradient(circle at 25% 25%,#E7C76C 1.2px,transparent 1.6px),radial-gradient(circle at 75% 75%,#E7C76C 1.2px,transparent 1.6px)", backgroundSize: "46px 46px", maskImage: "radial-gradient(circle at 50% 45%,#000 0%,transparent 78%)" }} />

      {/* Gate */}
      {!opened && (
        <div className="cr-gate" onClick={() => setOpened(true)}>
          <div style={{ animation: "crCrownIn 1.1s cubic-bezier(.16,1,.3,1) forwards", marginBottom: "1.4rem" }}>
            <CrownSvg size={150} />
          </div>
          <div style={{ fontFamily: "'Marcellus',serif", fontSize: "1.4rem", letterSpacing: ".32em", textTransform: "uppercase", color: C.vivid, textIndent: ".32em" }}>Invitation</div>
          <div style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "3rem", color: C.ivory, marginTop: ".4rem", background: `linear-gradient(180deg,${C.light},${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {content.names[0]} &amp; {content.names[1]}
          </div>
          <button onClick={() => setOpened(true)} style={{ marginTop: "2rem", fontFamily: "'Marcellus',serif", fontSize: ".74rem", letterSpacing: ".18em", textTransform: "uppercase", color: C.ivory, background: "transparent", border: `1px solid ${C.gold}`, padding: ".95rem 2rem", cursor: "pointer" }}>
            Ouvrir l&apos;invitation
          </button>
        </div>
      )}

      {/* Card */}
      {opened && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "calc(2.5rem + env(safe-area-inset-top)) 1.2rem calc(2.5rem + env(safe-area-inset-bottom))" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 460, zIndex: 2 }}>
            <div style={{ position: "relative", width: "100%", background: `linear-gradient(172deg,${C.card2} 0%,${C.card} 100%)`, border: `1px solid ${C.soft}`, padding: "3.4rem 2.4rem 3.2rem", textAlign: "center", overflow: "hidden", boxShadow: "0 50px 120px -40px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,255,255,.04)" }}>
              {/* Double border */}
              <div style={{ position: "absolute", inset: 13, border: `1px solid ${C.soft}`, pointerEvents: "none" }} />
              <div style={{ position: "absolute", inset: 18, border: `1px solid rgba(194,154,75,.18)`, pointerEvents: "none" }} />

              {/* Corner filigrees */}
              <CornerSvg className="" /><div style={{ position: "absolute", top: 6, left: 6 }}><CornerSvg className="" /></div>
              <div style={{ position: "absolute", top: 6, right: 6, transform: "scaleX(-1)" }}><CornerSvg className="" /></div>
              <div style={{ position: "absolute", bottom: 6, left: 6, transform: "scaleY(-1)" }}><CornerSvg className="" /></div>
              <div style={{ position: "absolute", bottom: 6, right: 6, transform: "scale(-1,-1)" }}><CornerSvg className="" /></div>

              {/* Crown */}
              <div className="cr-rev" style={{ display: "flex", justifyContent: "center", marginBottom: ".4rem", filter: "drop-shadow(0 6px 18px rgba(231,199,108,.3))" }}>
                <CrownSvg size={108} />
              </div>

              {guestName && (
                <div className="cr-rev" style={{ marginBottom: "1rem", animationDelay: ".05s" }}>
                  <p style={{ fontFamily: "'Marcellus',serif", fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.vivid }}>À l&apos;attention de</p>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.ivory }}>{guestName}</p>
                </div>
              )}

              <p className="cr-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: ".74rem", letterSpacing: ".4em", textTransform: "uppercase", color: C.vivid, textIndent: ".4em", animationDelay: ".1s" }}>
                {content.invitationLine || "Avec la bénédiction de Dieu"}
              </p>
              <p className="cr-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.14rem", color: C.soft2, lineHeight: 1.6, marginTop: "1.3rem", maxWidth: "32ch", marginInline: "auto", animationDelay: ".18s" }}>
                {content.hosts}
              </p>

              <div className="cr-rev" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(3rem,15vw,4.4rem)", lineHeight: .92, color: C.ivory, marginTop: "1rem", background: `linear-gradient(180deg,${C.light},${C.gold} 90%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", animationDelay: ".3s" }}>
                {content.names[0]}<span style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.3rem", WebkitTextFillColor: C.soft2, margin: ".1rem 0" }}>&amp;</span>{content.names[1]}
              </div>

              {/* Sep */}
              <div className="cr-rev" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".9rem", margin: "1.7rem auto", width: "70%", animationDelay: ".42s" }}>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.soft})` }} />
                <svg viewBox="0 0 24 32" fill="none" width="16" height="22"><path d="M12 1 L15 9 L12 13 L9 9 Z M12 13 C9 20 9 26 12 31 C15 26 15 20 12 13Z" fill={C.gold}/></svg>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.soft},transparent)` }} />
              </div>

              <p className="cr-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.22rem", color: C.text, lineHeight: 1.7, animationDelay: ".5s" }}>
                <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.05rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.vivid, textIndent: ".16em", display: "block", marginBottom: ".2rem" }}>{dateStr}</span>
                {content.time.replace(":", "h")}<br/>
                <span style={{ fontStyle: "italic", color: C.light }}>{content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}</span>
              </p>

              {showCountdown && !cdDone && (
                <div className="cr-rev" style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "2.1rem 0 .2rem", animationDelay: ".6s" }}>
                  {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                    <div key={lab} style={{ textAlign: "center", minWidth: 56, padding: ".75rem .4rem", border: `1px solid ${C.soft}`, background: "rgba(194,154,75,.06)" }}>
                      <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.6rem", color: C.ivory, display: "block", lineHeight: 1 }}>{val}</span>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".66rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".45rem" }}>{lab}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="cr-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.1rem", color: C.soft2, marginTop: "1.2rem", animationDelay: ".68s" }}>{content.closing}</p>

              <div className="cr-rev" style={{ marginTop: "2rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap", animationDelay: ".7s" }}>
                {showRsvp && invitationId && <button style={btnSt(true)} onClick={() => document.getElementById("cr-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Confirmer ma présence</button>}
              </div>

              {showRsvp && invitationId && (
                <section id="cr-rsvp" style={{ marginTop: "2.2rem", borderTop: `1px solid ${C.soft}`, paddingTop: "1.8rem" }}>
                  <h2 style={{ fontFamily: "'Marcellus',serif", fontSize: "1.1rem", color: C.ivory, marginBottom: "1rem" }}>Votre réponse</h2>
                  {rsvpSent || alreadyResponded ? (
                    <p style={{ color: C.soft2, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", lineHeight: 1.8 }}>
                      {alreadyResponded && !rsvpSent ? "Vous avez déjà répondu — merci !" : <>Merci <strong style={{ color: C.vivid }}>{rsvpName}</strong> — réponse enregistrée.</>}
                    </p>
                  ) : (
                    <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                      <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["attending", "declined"] as const).map((v, i) => (
                          <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.vivid : C.soft}`, background: rsvpAttending === v ? "rgba(231,199,108,.08)" : "transparent", color: rsvpAttending === v ? C.vivid : C.soft2, fontFamily: "'Marcellus',serif", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>
                            {i === 0 ? "Confirmer" : "Décliner"}
                          </button>
                        ))}
                      </div>
                      {rsvpAttending === "attending" && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".9rem", color: C.soft2 }}>Nombre de personnes</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button type="button" onClick={() => setRsvpSize(s => Math.max(1, s - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.soft}`, background: "transparent", color: C.gold, cursor: "pointer" }}>−</button>
                            <span style={{ fontFamily: "'Marcellus',serif", color: C.ivory, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>
                            <button type="button" onClick={() => setRsvpSize(s => Math.min(20, s + 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.soft}`, background: "transparent", color: C.gold, cursor: "pointer" }}>+</button>
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
