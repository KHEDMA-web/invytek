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
@keyframes biRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.bi-rev{opacity:0;animation:biRise .85s cubic-bezier(.16,1,.3,1) forwards}
.bi-gate{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(120% 70% at 50% 30%,#4a121e,#160509 72%);text-align:center;padding:2rem;transition:opacity .9s ease,visibility 0s .9s}
.bi-gate.out{opacity:0;visibility:hidden}
`;

function FiligraneSvg() {
  return (
    <svg viewBox="0 0 230 60" style={{ width: 200, height: 52, display: "block", margin: "0 auto" }} fill="none">
      <g stroke="#E1C06C" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M115 8 C115 20 108 26 100 30 C112 32 116 40 115 52"/>
        <path d="M100 30 C78 24 62 36 56 20 C50 36 36 30 22 38"/>
        <path d="M130 30 C152 24 168 36 174 20 C180 36 194 30 208 38"/>
      </g>
      <circle cx="115" cy="6" r="3" fill="#E1C06C"/>
    </svg>
  );
}

export default function BordeauxImperialTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
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
      `DTSTART:${y}${mo}${d}T${hh}${mm}00`,`SUMMARY:${content.names[0]} — ${content.names[1]}`,
      `LOCATION:${content.venue}${content.venueSub?"\\, "+content.venueSub:""}`,`DESCRIPTION:${content.hosts}`,
      "END:VEVENT","END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));
    a.download = `event-${content.names[0].toLowerCase().replace(/\s+/g,"-")}.ics`; a.click();
  }

  const C = {
    bg: "#160509", bg2: "#1f070d", card: "#2a0a12", card2: "#3a0e18",
    wine: "#6B1622", wineL: "#8B2533",
    gold: "#BE9647", vivid: "#E1C06C", light: "#F1DDA2", soft: "rgba(190,150,71,.5)",
    ivory: "#F5ECDC", text: "rgba(245,236,220,.82)", textS: "rgba(245,236,220,.52)", faint: "rgba(245,236,220,.32)",
  };
  const dateObj = new Date(content.date + "T12:00:00");
  const dateStr = dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const eventTitle = content.names[0];
  const subtitle = content.names[1] && content.names[1] !== "—" ? content.names[1] : "";
  const inp: React.CSSProperties = { width: "100%", padding: ".75rem .9rem", background: "rgba(190,150,71,.06)", border: `1px solid ${C.soft}`, borderRadius: 4, color: C.ivory, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", outline: "none" };
  const btnSt = (primary?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: ".9rem 1.6rem", fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer", border: primary ? "none" : `1px solid ${C.soft}`, background: primary ? `linear-gradient(135deg,${C.vivid},${C.gold})` : "transparent", color: primary ? "#2a0a12" : C.textS, transition: "all .25s", borderRadius: 0 });

  return (
    <div style={{ minHeight: "100dvh", background: `radial-gradient(120% 70% at 50% 30%,#4a121e 0%,${C.bg} 64%),${C.bg}`, color: C.text, fontFamily: "'Cormorant Garamond',serif", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=swap" rel="stylesheet" />
      <style>{KS}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle at 50% 45%,transparent 40%,rgba(0,0,0,.55) 100%)" }} />

      {/* Gate */}
      {!opened && (
        <div className="bi-gate" onClick={() => setOpened(true)}>
          <FiligraneSvg />
          <div style={{ fontFamily: "'Marcellus',serif", fontSize: "1.4rem", letterSpacing: ".32em", textTransform: "uppercase", color: C.vivid, marginTop: "1.8rem", textIndent: ".32em" }}>
            {content.invitationLine || "Invitation"}
          </div>
          <div style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "3rem", color: C.ivory, marginTop: ".5rem", background: `linear-gradient(180deg,${C.light},${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {eventTitle}
          </div>
          {subtitle && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.3rem", color: "#C76B79", marginTop: ".3rem" }}>{subtitle}</div>}
          <button onClick={() => setOpened(true)} style={{ marginTop: "2rem", fontFamily: "'Marcellus',serif", fontSize: ".74rem", letterSpacing: ".18em", textTransform: "uppercase", color: C.ivory, background: "transparent", border: `1px solid ${C.gold}`, padding: ".95rem 2rem", cursor: "pointer" }}>
            Révéler l&apos;invitation
          </button>
        </div>
      )}

      {/* Card */}
      {opened && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "calc(2.5rem + env(safe-area-inset-top)) 1.2rem calc(2.5rem + env(safe-area-inset-bottom))", position: "relative", zIndex: 2 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 460 }}>
            <div style={{ position: "relative", width: "100%", background: `radial-gradient(120% 80% at 50% 0%,${C.card2} 0%,${C.card} 55%,#220810 100%)`, border: `1px solid ${C.soft}`, padding: "2.4rem 2.4rem 2.6rem", textAlign: "center", overflow: "hidden", boxShadow: "0 50px 120px -40px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,255,255,.04)" }}>
              <div style={{ position: "absolute", inset: 7, border: `1px solid rgba(190,150,71,.28)`, pointerEvents: "none" }} />

              {/* Top filigrane */}
              <div className="bi-rev" style={{ animationDelay: ".05s" }}><FiligraneSvg /></div>

              {guestName && (
                <div className="bi-rev" style={{ marginTop: "1.4rem", marginBottom: "0", animationDelay: ".08s" }}>
                  <p style={{ fontFamily: "'Marcellus',serif", fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: C.vivid }}>À l&apos;attention de</p>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.4rem", color: C.ivory }}>{guestName}</p>
                </div>
              )}

              <p className="bi-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: ".72rem", letterSpacing: ".42em", textTransform: "uppercase", color: C.vivid, marginTop: "1.4rem", animationDelay: ".1s" }}>
                {content.invitationLine || "Vous êtes cordialement invité(e)"}
              </p>
              <p className="bi-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.12rem", color: C.textS, lineHeight: 1.6, marginTop: "1rem", maxWidth: "32ch", marginInline: "auto", animationDelay: ".18s" }}>
                {content.hosts}
              </p>

              <h1 className="bi-rev" style={{ fontFamily: "'Marcellus',serif", fontSize: "clamp(1.9rem,8vw,2.7rem)", letterSpacing: ".05em", color: C.ivory, marginTop: "1.1rem", lineHeight: 1.12, background: `linear-gradient(180deg,${C.light},${C.gold} 92%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", animationDelay: ".28s" }}>
                {eventTitle}
              </h1>
              {subtitle && <p className="bi-rev" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "2.3rem", color: "#C76B79", marginTop: ".2rem", animationDelay: ".34s" }}>{subtitle}</p>}

              <div className="bi-rev" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".9rem", margin: "1.5rem auto", width: "64%", animationDelay: ".42s" }}>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.soft})` }} />
                <svg viewBox="0 0 18 18" fill="none" width="18" height="18"><rect x="2" y="2" width="14" height="14" rx="1" stroke={C.gold} strokeWidth="1.2" transform="rotate(45 9 9)"/></svg>
                <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.soft},transparent)` }} />
              </div>

              <p className="bi-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.text, lineHeight: 1.7, animationDelay: ".5s" }}>
                <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.04rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.vivid, display: "block", marginBottom: ".2rem" }}>{dateStr}</span>
                {content.time.replace(":", "h")}<br/><span style={{ fontStyle: "italic", color: C.light }}>{content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}</span>
              </p>

              {showCountdown && !cdDone && (
                <div className="bi-rev" style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "1.9rem 0 .2rem", animationDelay: ".6s" }}>
                  {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                    <div key={lab} style={{ textAlign: "center", minWidth: 56, padding: ".75rem .4rem", border: `1px solid ${C.soft}`, background: "rgba(190,150,71,.06)" }}>
                      <span style={{ fontFamily: "'Marcellus',serif", fontSize: "1.6rem", color: C.ivory, display: "block", lineHeight: 1 }}>{val}</span>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".66rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.faint, display: "block", marginTop: ".45rem" }}>{lab}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom filigrane */}
              <div className="bi-rev" style={{ marginTop: "1.6rem", animationDelay: ".65s", transform: "scaleY(-1)" }}><FiligraneSvg /></div>

              <p className="bi-rev" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.1rem", color: C.textS, marginTop: ".8rem", animationDelay: ".68s" }}>{content.closing}</p>

              <div className="bi-rev" style={{ marginTop: "2rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap", animationDelay: ".7s" }}>
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
                {showRsvp && invitationId && <button style={btnSt(true)} onClick={() => document.getElementById("bi-rsvp")?.scrollIntoView({ behavior: "smooth" })}>Confirmer ma présence</button>}
              </div>

              {showRsvp && invitationId && (
                <section id="bi-rsvp" style={{ marginTop: "2.2rem", borderTop: `1px solid ${C.soft}`, paddingTop: "1.8rem" }}>
                  <h2 style={{ fontFamily: "'Marcellus',serif", fontSize: "1.1rem", color: C.ivory, marginBottom: "1rem" }}>Votre réponse</h2>
                  {rsvpSent || alreadyResponded ? (
                    <p style={{ color: C.textS, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", lineHeight: 1.8 }}>
                      {alreadyResponded && !rsvpSent ? "Vous avez déjà répondu — merci !" : <>Merci <strong style={{ color: C.vivid }}>{rsvpName}</strong> — réponse enregistrée.</>}
                    </p>
                  ) : (
                    <form style={{ display: "flex", flexDirection: "column", gap: 10 }} onSubmit={submitRsvp}>
                      <input style={inp} type="text" placeholder="Votre nom" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} />
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["attending", "declined"] as const).map((v, i) => (
                          <button key={v} type="button" onClick={() => setRsvpAttending(v)} style={{ flex: 1, padding: ".65rem", border: `1.5px solid ${rsvpAttending === v ? C.vivid : C.soft}`, background: rsvpAttending === v ? "rgba(225,192,108,.08)" : "transparent", color: rsvpAttending === v ? C.vivid : C.textS, fontFamily: "'Marcellus',serif", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>
                            {i === 0 ? "Confirmer" : "Décliner"}
                          </button>
                        ))}
                      </div>
                      {rsvpAttending === "attending" && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".9rem", color: C.textS }}>Nombre de personnes</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button type="button" onClick={() => setRsvpSize(s => Math.max(1, s - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.soft}`, background: "transparent", color: C.vivid, cursor: "pointer" }}>−</button>
                            <span style={{ fontFamily: "'Marcellus',serif", color: C.ivory, minWidth: 20, textAlign: "center" }}>{rsvpSize}</span>
                            <button type="button" onClick={() => setRsvpSize(s => Math.min(20, s + 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.soft}`, background: "transparent", color: C.vivid, cursor: "pointer" }}>+</button>
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
