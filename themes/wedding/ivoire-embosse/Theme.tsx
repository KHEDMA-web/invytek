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
@keyframes ieRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.ie-rev{opacity:0;animation:ieRise .85s cubic-bezier(.16,1,.3,1) forwards}
.ie-gate{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(130% 80% at 50% -5%,#F3EEE2 0%,#E9E2D3 64%);text-align:center;padding:2rem;transition:opacity .9s ease,visibility 0s .9s}
.ie-gate.out{opacity:0;visibility:hidden}
`;

export default function IvoireEmbosseTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
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
    paper: "#E9E2D3", paper2: "#F1EBDD", hi: "#F7F2E8",
    taupe: "#9A8A6E", taupeD: "#6F6048", ink: "#564A35",
    sepia: "#6B4A2E", sepiaL: "#8C6440", sepiaS: "rgba(107,74,46,.4)",
    text: "rgba(86,74,53,.84)", soft: "rgba(86,74,53,.56)", faint: "rgba(86,74,53,.34)",
  };
  const dateObj = new Date(content.date + "T12:00:00");
  const dateStr = dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const monogramLetter = content.initials[0]?.toUpperCase() || content.names[0][0]?.toUpperCase() || "B";
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: "rgba(107,74,46,.04)", border: `1px solid ${C.sepiaS}`, borderRadius: 4, color: C.ink, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", outline: "none" };
  const btnSt = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: ".9rem 1.5rem", fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `1px solid ${C.sepiaS}`, background: primary ? `linear-gradient(135deg,${C.sepiaL},${C.sepia})` : "transparent", color: primary ? C.hi : C.soft, transition: "all .25s", borderRadius: 0 });

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(130% 80% at 50% -5%,#F3EEE2 0%,${C.paper} 64%),${C.paper}`, color: C.text, fontFamily: "'Cormorant Garamond',serif", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=swap" rel="stylesheet" />
      <style>{KS}</style>

      {/* Gate */}
      {!opened && (
        <div className="ie-gate" onClick={() => setOpened(true)}>
          {/* Wax seal monogram */}
          <div style={{ width: 90, height: 90, borderRadius: "50%", margin: "0 auto 1.6rem", background: `radial-gradient(circle at 40% 36%,${C.sepiaL},${C.sepia} 60%,#4d3420 100%)`, boxShadow: "0 8px 18px -6px rgba(0,0,0,.4),inset 0 2px 4px rgba(255,255,255,.18),inset 0 -3px 6px rgba(40,26,14,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "2.4rem", color: "#EBDFD0", lineHeight: 1 }}>{monogramLetter}</span>
          </div>
          <div style={{ fontFamily: "'Marcellus',serif", fontSize: "1.35rem", letterSpacing: ".32em", textTransform: "uppercase", color: C.taupeD, textIndent: ".32em" }}>Mariage</div>
          <div style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "2.9rem", color: C.ink, marginTop: ".4rem" }}>
            {content.names[0]} &amp; {content.names[1]}
          </div>
          <button onClick={() => setOpened(true)} style={{ marginTop: "2rem", fontFamily: "'Marcellus',serif", fontSize: ".74rem", letterSpacing: ".18em", textTransform: "uppercase", color: C.ink, background: "transparent", border: `1px solid ${C.sepiaS}`, padding: ".95rem 2rem", cursor: "pointer" }}>
            Ouvrir l&apos;invitation
          </button>
        </div>
      )}

      {/* Card */}
      {opened && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "calc(2.5rem + env(safe-area-inset-top)) 1.2rem calc(2.5rem + env(safe-area-inset-bottom))" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 430, zIndex: 2 }}>
            <div style={{ position: "relative", width: "100%", background: `linear-gradient(165deg,${C.hi} 0%,${C.paper2} 60%,${C.paper} 100%)`, border: `1px solid rgba(154,138,110,.4)`, padding: "3.4rem 2.2rem 3rem", textAlign: "center", overflow: "hidden", boxShadow: `0 38px 90px -42px rgba(86,74,53,.4),inset 0 1px 0 rgba(255,255,255,.7)` }}>
              <div style={{ position: "absolute", inset: 12, border: `1px solid rgba(154,138,110,.3)`, pointerEvents: "none" }} />
              {/* Center fold line */}
              <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "linear-gradient(180deg,transparent,rgba(120,104,74,.12) 20% 80%,transparent)", pointerEvents: "none" }} />

              {/* Embossed damask watermark suggestion */}
              <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", opacity: .06, backgroundImage: `radial-gradient(circle at 30% 30%,${C.sepia} 1px,transparent 1.4px),radial-gradient(circle at 70% 70%,${C.sepia} 1px,transparent 1.4px)`, backgroundSize: "32px 32px" }} />

              {/* Monogram */}
              <div className="ie-rev" style={{ width: 74, height: 74, borderRadius: "50%", margin: "0 auto 1.2rem", background: `radial-gradient(circle at 40% 36%,${C.sepiaL},${C.sepia} 60%,#4d3420 100%)`, boxShadow: "0 8px 18px -6px rgba(0,0,0,.4),inset 0 2px 4px rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2 }}>
                <span style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "2.1rem", color: "#EBDFD0", lineHeight: 1 }}>{monogramLetter}</span>
              </div>

              {guestName && (
                <div className="ie-rev" style={{ marginBottom: "1rem", animationDelay: ".05s" }}>
                  <p style={{ fontFamily: "'Marcellus',serif", fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.taupeD }}>À l&apos;attention de</p>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.ink }}>{guestName}</p>
                </div>
              )}

              <p className="ie-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".42em", textTransform: "uppercase", color: C.taupeD, animationDelay: ".1s" }}>
                {content.invitationLine || "Mariage"}
              </p>
              <p className="ie-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.12rem", color: C.soft, lineHeight: 1.6, marginTop: "1.1rem", maxWidth: "30ch", marginInline: "auto", animationDelay: ".18s" }}>
                {content.hosts}
              </p>

              <div className="ie-rev" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(2.7rem,13vw,3.8rem)", lineHeight: .96, color: C.ink, marginTop: ".9rem", animationDelay: ".3s" }}>
                {content.names[0]}<span style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.2rem", color: C.taupe, margin: ".05rem 0" }}>&amp;</span>{content.names[1]}
              </div>

              <div className="ie-rev" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".9rem", margin: "1.6rem auto", width: "66%", animationDelay: ".42s" }}>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.sepiaS})` }} />
                <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 2 C8 5 5 6 4 9 a5 5 0 0 0 6 4.8 a5 5 0 0 0 6-4.8 C15 6 12 5 10 2Z" fill={C.sepia}/></svg>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.sepiaS},transparent)` }} />
              </div>

              <p className="ie-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.text, lineHeight: 1.7, animationDelay: ".5s" }}>
                <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.02rem", letterSpacing: ".15em", textTransform: "uppercase", color: C.taupeD, display: "block", marginBottom: ".2rem" }}>{dateStr}</span>
                {content.time.replace(":", "h")}<br/><span style={{ fontStyle: "italic", color: C.taupe }}>{content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}</span>
              </p>

              {showCountdown && !cdDone && (
                <div className="ie-rev" style={{ display: "flex", justifyContent: "center", gap: ".9rem", margin: "2rem 0 .2rem", animationDelay: ".6s" }}>
                  {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                    <div key={lab} style={{ textAlign: "center", minWidth: 54, padding: ".7rem .4rem", border: `1px solid ${C.sepiaS}`, background: "rgba(107,74,46,.04)" }}>
                      <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.55rem", color: C.ink, display: "block", lineHeight: 1 }}>{val}</span>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".64rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".45rem" }}>{lab}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="ie-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.1rem", color: C.soft, marginTop: "1.2rem", animationDelay: ".68s" }}>{content.closing}</p>

              <div className="ie-rev" style={{ marginTop: "2rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap", animationDelay: ".7s" }}>
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
                {showRsvp && invitationId && <button style={btnSt(true)} onClick={() => document.getElementById("ie-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Confirmer ma présence</button>}
              </div>

              {showRsvp && invitationId && (
                <section id="ie-rsvp" style={{ marginTop: "2.2rem", borderTop: `1px solid ${C.sepiaS}`, paddingTop: "1.8rem" }}>
                  <h2 style={{ fontFamily: "'Marcellus',serif", fontSize: "1.1rem", color: C.ink, marginBottom: "1rem" }}>Votre réponse</h2>
                  {rsvpSent || alreadyResponded ? (
                    <p style={{ color: C.soft, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", lineHeight: 1.8 }}>
                      {alreadyResponded && !rsvpSent ? "Vous avez déjà répondu — merci !" : <>Merci <strong style={{ color: C.sepia }}>{rsvpName}</strong> — réponse enregistrée.</>}
                    </p>
                  ) : (
                    <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                      <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["attending", "declined"] as const).map((v, i) => (
                          <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.sepia : C.sepiaS}`, background: rsvpAttending === v ? "rgba(107,74,46,.08)" : "transparent", color: rsvpAttending === v ? C.ink : C.soft, fontFamily: "'Marcellus',serif", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>
                            {i === 0 ? "Confirmer" : "Décliner"}
                          </button>
                        ))}
                      </div>
                      {rsvpAttending === "attending" && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".9rem", color: C.soft }}>Nombre de personnes</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button type="button" onClick={() => setRsvpSize(s => Math.max(1, s - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.sepiaS}`, background: "transparent", color: C.sepia, cursor: "pointer" }}>−</button>
                            <span style={{ fontFamily: "'Marcellus',serif", color: C.ink, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>
                            <button type="button" onClick={() => setRsvpSize(s => Math.min(20, s + 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.sepiaS}`, background: "transparent", color: C.sepia, cursor: "pointer" }}>+</button>
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
