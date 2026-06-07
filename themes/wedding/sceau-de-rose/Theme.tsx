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
@keyframes srRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes srSway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
.sr-rev{opacity:0;animation:srRise .85s cubic-bezier(.16,1,.3,1) forwards}
.sr-gate{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(130% 80% at 50% -5%,#FAF3E4 0%,#F0E6D2 64%);text-align:center;padding:2rem;transition:opacity .9s ease,visibility 0s .9s}
.sr-gate.out{opacity:0;visibility:hidden}
.sr-branch{animation:srSway 5s ease-in-out infinite}
`;

function WaxSeal({ size = 64, letter = "M" }: { size?: number; letter?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none">
      <defs>
        <radialGradient id="sr-wax" cx="38%" cy="34%" r="60%">
          <stop offset="0" stopColor="#CC4A40"/>
          <stop offset="55%" stopColor="#A82828"/>
          <stop offset="100%" stopColor="#7E1A1A"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="url(#sr-wax)" filter="drop-shadow(0 4px 8px rgba(0,0,0,.25))"/>
      <circle cx="32" cy="32" r="24" stroke="rgba(255,255,255,.15)" strokeWidth="1" fill="none"/>
      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontFamily="'Pinyon Script',cursive" fontSize="26" fill="#E89A92">{letter}</text>
    </svg>
  );
}

function BranchSvg() {
  return (
    <svg viewBox="0 0 150 150" width="150" height="150" fill="none">
      <g stroke="#BF9A48" strokeWidth="1.3" strokeLinecap="round" opacity=".7">
        <path d="M12 12 C44 28 68 58 76 96"/>
        <path d="M28 18 C34 28 36 38 32 50"/><path d="M20 38 C28 42 36 42 44 36"/>
        <path d="M54 54 C60 64 62 74 58 84"/><path d="M44 72 C52 76 60 76 68 70"/>
      </g>
      <g fill="#D9B567" opacity=".65">
        <ellipse cx="38" cy="26" rx="5.5" ry="3.2" transform="rotate(-30 38 26)"/>
        <ellipse cx="58" cy="52" rx="5" ry="2.8" transform="rotate(-25 58 52)"/>
        <ellipse cx="64" cy="78" rx="4.5" ry="2.5" transform="rotate(-20 64 78)"/>
      </g>
    </svg>
  );
}

export default function SceauDeRoseTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
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
    paper: "#F0E6D2", paper2: "#F7F0E0", hi: "#FBF6EA",
    gold: "#BF9A48", vivid: "#D9B567", light: "#EBD79C", soft: "rgba(191,154,72,.5)",
    wax: "#A82828", waxD: "#7E1A1A", waxH: "#CC4A40",
    ink: "#5A4326",
    text: "rgba(90,67,38,.84)", textS: "rgba(90,67,38,.56)", faint: "rgba(90,67,38,.34)",
  };
  const dateObj = new Date(content.date + "T12:00:00");
  const dateStr = dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const sealLetter = content.initials[0]?.toUpperCase() || content.names[0][0]?.toUpperCase() || "M";
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: "rgba(191,154,72,.04)", border: `1px solid ${C.soft}`, borderRadius: 4, color: C.ink, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", outline: "none" };
  const btnSt = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: ".9rem 1.5rem", fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `1px solid ${C.soft}`, background: primary ? `linear-gradient(135deg,${C.gold},#8a6828)` : "transparent", color: primary ? C.hi : C.textS, transition: "all .25s", borderRadius: 0 });

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(130% 80% at 50% -5%,#FAF3E4 0%,${C.paper} 64%),${C.paper}`, color: C.text, fontFamily: "'Cormorant Garamond',serif", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=swap" rel="stylesheet" />
      <style>{KS}</style>

      {/* Gate */}
      {!opened && (
        <div className="sr-gate" onClick={() => setOpened(true)}>
          <div className="sr-branch" style={{ marginBottom: "1.4rem" }}>
            <BranchSvg />
          </div>
          <div style={{ fontFamily: "'Marcellus',serif", fontSize: "1.35rem", letterSpacing: ".3em", textTransform: "uppercase", color: C.gold, textIndent: ".3em" }}>Invitation</div>
          <div style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "2.9rem", color: C.ink, marginTop: ".4rem" }}>
            {content.names[0]} &amp; {content.names[1]}
          </div>
          <div style={{ marginTop: "1.6rem" }}>
            <WaxSeal size={72} letter={sealLetter} />
          </div>
          <button onClick={() => setOpened(true)} style={{ marginTop: "1.4rem", fontFamily: "'Marcellus',serif", fontSize: ".74rem", letterSpacing: ".18em", textTransform: "uppercase", color: C.ink, background: "transparent", border: `1px solid ${C.soft}`, padding: ".95rem 2rem", cursor: "pointer" }}>
            Briser le sceau
          </button>
        </div>
      )}

      {/* Card */}
      {opened && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "calc(2.5rem + env(safe-area-inset-top)) 1.2rem calc(2.5rem + env(safe-area-inset-bottom))" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 430, zIndex: 2 }}>
            <div style={{ position: "relative", width: "100%", background: `linear-gradient(165deg,${C.hi} 0%,${C.paper2} 60%,${C.paper} 100%)`, border: `1px solid rgba(191,154,72,.4)`, padding: "3.4rem 2.2rem 3rem", textAlign: "center", overflow: "hidden", boxShadow: `0 38px 90px -42px rgba(90,67,38,.4),inset 0 1px 0 rgba(255,255,255,.7)` }}>
              <div style={{ position: "absolute", inset: 12, border: `1px solid rgba(191,154,72,.3)`, pointerEvents: "none" }} />

              {/* Branch corners */}
              {[{ t: -6, l: -6, tf: "" }, { t: -6, r: -6, tf: "scaleX(-1)" }, { b: -6, l: -6, tf: "scaleY(-1)" }, { b: -6, r: -6, tf: "scale(-1,-1)" }].map((pos, i) => (
                <div key={i} style={{ position: "absolute", width: 148, height: 148, ...(pos.t !== undefined ? { top: pos.t } : { bottom: pos.b }), ...(pos.l !== undefined ? { left: pos.l } : { right: pos.r }), transform: pos.tf || undefined, zIndex: 1, pointerEvents: "none" }}>
                  <BranchSvg />
                </div>
              ))}

              {/* Wax seal top */}
              <div className="sr-rev" style={{ display: "flex", justifyContent: "center", marginBottom: "1.1rem", position: "relative", zIndex: 2 }}>
                <WaxSeal size={64} letter={sealLetter} />
              </div>

              {guestName && (
                <div className="sr-rev" style={{ marginBottom: "1rem", animationDelay: ".05s" }}>
                  <p style={{ fontFamily: "'Marcellus',serif", fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.gold }}>À l&apos;attention de</p>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.ink }}>{guestName}</p>
                </div>
              )}

              <p className="sr-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".42em", textTransform: "uppercase", color: C.gold, animationDelay: ".1s" }}>
                {content.invitationLine || "Mariage"}
              </p>
              <p className="sr-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.12rem", color: C.textS, lineHeight: 1.6, marginTop: "1.1rem", maxWidth: "30ch", marginInline: "auto", animationDelay: ".18s" }}>
                {content.hosts}
              </p>

              <div className="sr-rev" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(2.8rem,13vw,4rem)", lineHeight: .96, color: C.ink, marginTop: ".8rem", animationDelay: ".3s" }}>
                {content.names[0]}<span style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.25rem", color: C.gold, margin: ".05rem 0" }}>&amp;</span>{content.names[1]}
              </div>

              <div className="sr-rev" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".9rem", margin: "1.6rem auto", width: "64%", animationDelay: ".42s" }}>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.soft})` }} />
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><circle cx="12" cy="12" r="3" stroke="#CC4A40" strokeWidth="1.2"/><path d="M9 11 C7 5 13 3 16 6 C20 4 22 9 18 12" stroke="#CC4A40" strokeWidth="1.2"/></svg>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.soft},transparent)` }} />
              </div>

              <p className="sr-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.text, lineHeight: 1.7, animationDelay: ".5s" }}>
                <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.02rem", letterSpacing: ".15em", textTransform: "uppercase", color: C.ink, display: "block", marginBottom: ".2rem" }}>{dateStr}</span>
                {content.time.replace(":", "h")}<br/><span style={{ fontStyle: "italic", color: C.gold }}>{content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}</span>
              </p>

              {showCountdown && !cdDone && (
                <div className="sr-rev" style={{ display: "flex", justifyContent: "center", gap: ".9rem", margin: "2rem 0 .2rem", animationDelay: ".6s" }}>
                  {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                    <div key={lab} style={{ textAlign: "center", minWidth: 54, padding: ".7rem .4rem", border: `1px solid ${C.soft}`, background: "rgba(191,154,72,.05)" }}>
                      <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.55rem", color: C.ink, display: "block", lineHeight: 1 }}>{val}</span>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".64rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".45rem" }}>{lab}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="sr-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.1rem", color: C.textS, marginTop: "1.2rem", animationDelay: ".68s" }}>{content.closing}</p>

              <div className="sr-rev" style={{ marginTop: "2rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap", animationDelay: ".7s" }}>
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
                {showRsvp && invitationId && <button style={btnSt(true)} onClick={() => document.getElementById("sr-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Confirmer ma présence</button>}
              </div>

              {showRsvp && invitationId && (
                <section id="sr-rsvp" style={{ marginTop: "2.2rem", borderTop: `1px solid ${C.soft}`, paddingTop: "1.8rem" }}>
                  <h2 style={{ fontFamily: "'Marcellus',serif", fontSize: "1.1rem", color: C.ink, marginBottom: "1rem" }}>Votre réponse</h2>
                  {rsvpSent || alreadyResponded ? (
                    <p style={{ color: C.textS, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", lineHeight: 1.8 }}>
                      {alreadyResponded && !rsvpSent ? "Vous avez déjà répondu — merci !" : <>Merci <strong style={{ color: C.gold }}>{rsvpName}</strong> — réponse enregistrée.</>}
                    </p>
                  ) : (
                    <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                      <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["attending", "declined"] as const).map((v, i) => (
                          <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.gold : C.soft}`, background: rsvpAttending === v ? "rgba(191,154,72,.08)" : "transparent", color: rsvpAttending === v ? C.ink : C.textS, fontFamily: "'Marcellus',serif", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>
                            {i === 0 ? "Confirmer" : "Décliner"}
                          </button>
                        ))}
                      </div>
                      {rsvpAttending === "attending" && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".9rem", color: C.textS }}>Nombre de personnes</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button type="button" onClick={() => setRsvpSize(s => Math.max(1, s - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.soft}`, background: "transparent", color: C.gold, cursor: "pointer" }}>−</button>
                            <span style={{ fontFamily: "'Marcellus',serif", color: C.ink, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>
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
