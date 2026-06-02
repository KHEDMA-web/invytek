"use client";
import { useEffect, useRef, useState } from "react";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";

interface Props {
  content: WeddingContent;
  options?: Partial<WeddingOptions>;
  invitationId?: string;
  guestName?: string;
  guestToken?: string;
  alreadyResponded?: boolean;
}

const CONF_COLORS = ["#D4AF61","#E8A080","#F0D080","#B8923C","#8B2F3F","#F5F0E8","#6E5618"];

export default function ConfettisOrTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true, showNote = true } = options;
  const [countdown, setCountdown] = useState({ j: "––", h: "––", m: "––", s: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const rainRef = useRef<HTMLDivElement>(null);

  // Pour ce thème : names[0] = prénom, invitationLine = "fête ses X ans"
  const firstname = content.names[0];

  useEffect(() => {
    if (!showCountdown) return;
    const target = new Date(`${content.date}T${content.time}:00`);
    function tick() {
      let diff = target.getTime() - Date.now();
      if (diff < 0) { setCdDone(true); return; }
      const j = Math.floor(diff / 86400000); diff %= 86400000;
      const h = Math.floor(diff / 3600000);  diff %= 3600000;
      const m = Math.floor(diff / 60000);    diff %= 60000;
      const s = Math.floor(diff / 1000);
      setCountdown({ j: String(j), h: String(h).padStart(2,"0"), m: String(m).padStart(2,"0"), s: String(s).padStart(2,"0") });
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [content.date, content.time, showCountdown]);

  // Confetti rain
  useEffect(() => {
    const rain = rainRef.current; if (!rain) return;
    const items: HTMLDivElement[] = [];
    for (let i = 0; i < 55; i++) {
      const c = document.createElement("div");
      c.style.cssText = `position:absolute;width:9px;height:14px;border-radius:2px;opacity:0;
        left:${Math.random()*100}%;
        background:${CONF_COLORS[Math.floor(Math.random()*CONF_COLORS.length)]};
        animation:confRain ${(Math.random()*8+6).toFixed(1)}s ${(Math.random()*10).toFixed(1)}s linear infinite;`;
      rain.appendChild(c); items.push(c);
    }
    return () => items.forEach(c => c.remove());
  }, []);

  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2600); return () => clearTimeout(id); }, [toast]);

  async function submitRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!invitationId || !rsvpAttending || rsvpName.trim().length < 2) return;
    setRsvpLoading(true);
    try {
      const res = await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId, name: rsvpName.trim(), status: rsvpAttending, partySize: rsvpSize, message: rsvpMessage.trim() || undefined, token: guestToken }) });
      if (!res.ok) throw new Error();
      setRsvpSent(true);
    } catch { /* silent */ } finally { setRsvpLoading(false); }
  }

  const [day, month, year] = (() => { const d = new Date(content.date + "T12:00:00"); return [d.getDate().toString().padStart(2,"0"), d.toLocaleDateString("fr-FR",{month:"long"}).toUpperCase(), d.getFullYear().toString()]; })();

  const card: React.CSSProperties = {
    position: "relative", width: "100%", maxWidth: 460, margin: "0 auto",
    background: "linear-gradient(170deg, #221b11 0%, #1b1610 100%)",
    border: "1px solid rgba(184,146,60,0.32)",
    padding: "3.4rem 2.4rem 3.2rem", textAlign: "center", overflow: "hidden",
    boxShadow: "0 50px 110px -40px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.04)",
    fontFamily: "'Cormorant Garamond', serif", color: "rgba(245,240,232,0.84)",
  };

  const inp2: React.CSSProperties = { width:"100%", padding:".7rem .9rem", background:"rgba(184,146,60,0.05)", border:"1px solid rgba(184,146,60,0.22)", borderRadius:6, color:"rgba(245,240,232,0.9)", fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", outline:"none" };
  const btn2 = (gold?: boolean): React.CSSProperties => ({ display:"inline-flex", alignItems:"center", gap:6, padding:".6rem 1.2rem", borderRadius:100, fontFamily:"'Marcellus',serif", fontSize:".72rem", letterSpacing:".14em", textTransform:"uppercase", cursor:"pointer", border:"none", textDecoration:"none", background: gold ? "linear-gradient(135deg,#D4AF61,#B8923C)" : "transparent", color: gold ? "#1c1408" : "#B8923C", borderWidth: gold ? 0 : 1, borderStyle:"solid", borderColor:"rgba(184,146,60,0.35)" });

  return (
    <div style={{ minHeight:"100dvh", background:"radial-gradient(130% 80% at 50% -5%, #251c10 0%, #14100a 60%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"calc(2.5rem + env(safe-area-inset-top)) 1.2rem calc(2.5rem + env(safe-area-inset-bottom))", overflow:"hidden", position:"relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Marcellus&family=Cormorant+Garamond:wght@400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes confRain { 0%{transform:translateY(-10vh) rotate(0);opacity:0;} 12%{opacity:.8;} 88%{opacity:.5;} 100%{transform:translateY(110vh) rotate(680deg);opacity:0;} }
        @keyframes rise2 { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes shine2 { 0%,100%{background-position:0% center;} 50%{background-position:100% center;} }
        .anniv-rev { opacity:0; animation:rise2 .8s cubic-bezier(.16,1,.3,1) forwards; }
      `}</style>

      {/* Confetti rain */}
      <div ref={rainRef} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }} />

      <div style={{ position:"relative", zIndex:2, width:"100%" }}>
        <div style={card}>
          <div style={{ position:"absolute", inset:12, border:"1px solid rgba(184,146,60,0.16)", pointerEvents:"none" }} />

          {/* Guest badge */}
          {guestName && (
            <div className="anniv-rev" style={{ marginBottom:"1rem" }}>
              <p style={{ fontFamily:"'Marcellus',serif", fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"#B8923C" }}>À l&apos;attention de</p>
              <p style={{ fontFamily:"'Pinyon Script',cursive", fontSize:"1.6rem", color:"rgba(245,240,232,0.9)", lineHeight:1.2 }}>{guestName}</p>
            </div>
          )}

          <p className="anniv-rev" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:".92rem", letterSpacing:".36em", textTransform:"uppercase", color:"#B8923C", textIndent:".36em", animationDelay:".1s" }}>
            {content.hosts || "Vous êtes invités à fêter"}
          </p>

          {/* Grand prénom */}
          <div className="anniv-rev" style={{ margin:"0.8rem 0 .4rem", animationDelay:".2s" }}>
            <span style={{
              fontFamily:"'Pinyon Script',cursive",
              fontSize:"clamp(3.6rem, 18vw, 5.6rem)", lineHeight:.9,
              background:"linear-gradient(110deg, #B8923C 0%, #D4AF61 35%, #F0D080 50%, #D4AF61 65%, #B8923C 100%)",
              backgroundSize:"250% auto", WebkitBackgroundClip:"text", backgroundClip:"text",
              WebkitTextFillColor:"transparent", color:"transparent",
              display:"inline-block", animation:"rise2 .8s cubic-bezier(.16,1,.3,1) .2s both, shine2 5s ease-in-out 1.4s infinite",
            }}>{firstname}</span>
          </div>

          <p className="anniv-rev" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", color:"rgba(245,240,232,0.6)", marginBottom:"1.4rem", fontStyle:"italic", animationDelay:".3s" }}>
            {content.invitationLine}
          </p>

          {/* Date */}
          <div className="anniv-rev" style={{ position:"relative", padding:"1.1rem .5rem", animationDelay:".4s" }}>
            <div style={{ position:"absolute", left:"15%", right:"15%", top:0, height:1, background:"linear-gradient(90deg,transparent,rgba(184,146,60,0.4),transparent)" }} />
            <div style={{ position:"absolute", left:"15%", right:"15%", bottom:0, height:1, background:"linear-gradient(90deg,transparent,rgba(184,146,60,0.4),transparent)" }} />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:".9rem" }}>
              {[day, month.slice(0,3), year].map((v, i) => (
                <span key={i} style={{ fontFamily:"'Marcellus',serif", fontSize:"1.9rem", color:"#D4AF61", lineHeight:1 }}>{v}{i < 2 && <span style={{ display:"inline-block", width:4, height:4, borderRadius:"50%", background:"#B8923C", margin:"0 .6rem .15rem" }} />}</span>
              ))}
            </div>
            <div style={{ fontFamily:"'Marcellus',serif", fontSize:".82rem", letterSpacing:".36em", textTransform:"uppercase", color:"#B8923C", textIndent:".36em", marginTop:".5rem" }}>{content.dayLabel} · {month}</div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", color:"rgba(245,240,232,0.55)", marginTop:".7rem", lineHeight:1.9 }}>
              à <strong style={{ color:"#D4AF61" }}>{content.time.replace(":","h")}</strong><br/>
              <span style={{ color:"rgba(245,240,232,0.75)" }}>{content.venue}</span>
              {content.venueSub && <><br/>{content.venueSub}</>}
            </p>
          </div>

          {/* Countdown */}
          {showCountdown && !cdDone && (
            <div className="anniv-rev" style={{ display:"flex", justifyContent:"center", gap:"1.2rem", margin:"1.2rem 0", flexWrap:"wrap", animationDelay:".5s" }}>
              {[{ val:countdown.j, lab:"Jours" },{ val:countdown.h, lab:"Heures" },{ val:countdown.m, lab:"Min" },{ val:countdown.s, lab:"Sec" }].map(({ val, lab }) => (
                <div key={lab} style={{ textAlign:"center", minWidth:48 }}>
                  <span style={{ fontFamily:"'Marcellus',serif", fontSize:"1.8rem", color:"#D4AF61", display:"block", lineHeight:1 }}>{val}</span>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"rgba(184,146,60,0.6)", display:"block", marginTop:3 }}>{lab}</span>
                </div>
              ))}
            </div>
          )}

          {/* Note */}
          {showNote && content.note && (
            <div className="anniv-rev" style={{ display:"flex", alignItems:"flex-start", gap:".7rem", textAlign:"left", margin:"1.2rem auto 0", maxWidth:"92%", padding:".85rem .9rem", background:"rgba(184,146,60,0.05)", border:"1px solid rgba(184,146,60,0.15)", borderRadius:6, fontSize:".9rem", color:"rgba(245,240,232,0.5)", lineHeight:1.65, animationDelay:".55s" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#B8923C" strokeWidth="1.6" strokeLinecap="round" style={{ flexShrink:0, marginTop:2, width:14, height:14 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              {content.note}
            </div>
          )}

          <p className="anniv-rev" style={{ fontFamily:"'Pinyon Script',cursive", fontSize:"clamp(1.4rem,5vw,1.9rem)", color:"#B8923C", margin:"1.4rem 0 .5rem", animationDelay:".6s" }}>{content.closing || "Soyez les Bienvenus !"}</p>

          {/* CTA */}
          <div className="anniv-rev" style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", margin:"1.2rem 0", animationDelay:".65s" }}>
            {showRsvp && invitationId && <a style={btn2(true) as React.CSSProperties} href="#rsvp">Confirmer ma présence</a>}
            {content.mapsUrl && <a style={btn2() as React.CSSProperties} href={content.mapsUrl} target="_blank" rel="noopener noreferrer">Itinéraire</a>}
          </div>

          {/* RSVP */}
          {showRsvp && invitationId && (
            <section id="rsvp" style={{ marginTop:"2rem" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:".8rem", margin:"1.2rem auto", color:"#B8923C", width:"65%" }}>
                <span style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(184,146,60,0.5))" }} />
                <svg viewBox="0 0 24 24" fill="none" width={18} height={18}><path d="M12 3C13 7 16 9 12 12 C8 9 11 7 12 3Z M12 21C11 17 8 15 12 12 C16 15 13 17 12 21Z M3 12C7 13 9 16 12 12 C9 8 7 11 3 12Z M21 12C17 13 15 16 12 12 C15 8 17 11 21 12Z" fill="#D4AF61"/></svg>
                <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(184,146,60,0.5),transparent)" }} />
              </div>
              <h2 style={{ fontFamily:"'Marcellus',serif", fontSize:"1.1rem", color:"rgba(245,240,232,0.9)", margin:"1rem 0", letterSpacing:".04em" }}>Serez-vous des nôtres ?</h2>
              {rsvpSent || alreadyResponded ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:".8rem", padding:"1.8rem 1rem" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF61" strokeWidth="1.8" strokeLinecap="round" width={32} height={32}><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", color:"rgba(245,240,232,0.6)", lineHeight:1.8, textAlign:"center" }}>
                    {alreadyResponded && !rsvpSent ? <>Vous avez déjà répondu. Merci !</> : <>Merci <strong style={{ color:"#D4AF61" }}>{rsvpName}</strong> !</>}
                  </p>
                </div>
              ) : (
                <form style={{ display:"flex", flexDirection:"column", gap:10 }} onSubmit={submitRsvp}>
                  <input style={inp2} type="text" placeholder="Votre nom complet" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} maxLength={80} />
                  <div style={{ display:"flex", gap:8 }}>
                    {[["attending","Je serai là 🎉"],["declined","Je ne pourrai pas"]] .map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setRsvpAttending(v as "attending"|"declined")} style={{ flex:1, padding:".65rem", border:`1.5px solid ${rsvpAttending===v?"#D4AF61":"rgba(184,146,60,0.2)"}`, borderRadius:6, background: rsvpAttending===v?"rgba(184,146,60,0.12)":"transparent", color: rsvpAttending===v?"#D4AF61":"rgba(245,240,232,0.45)", fontFamily:"'Marcellus',serif", fontSize:".68rem", letterSpacing:".1em", textTransform:"uppercase", cursor:"pointer" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                  {rsvpAttending === "attending" && (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:".9rem", color:"rgba(245,240,232,0.55)" }}>Nombre de personnes</span>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        {[-1,null,1].map((delta, i) => delta !== null
                          ? <button key={i} type="button" onClick={() => setRsvpSize(s => Math.max(1, Math.min(20, s + delta)))} style={{ width:30, height:30, borderRadius:"50%", border:"1px solid rgba(184,146,60,0.3)", background:"transparent", color:"#B8923C", cursor:"pointer" }}>{delta > 0 ? "+" : "−"}</button>
                          : <span key={i} style={{ fontFamily:"'Marcellus',serif", fontSize:"1rem", color:"rgba(245,240,232,0.9)", minWidth:20, textAlign:"center" }}>{rsvpSize}</span>
                        )}
                      </div>
                    </div>
                  )}
                  <textarea style={{ ...inp2, resize:"vertical" }} placeholder="Un message (optionnel)" value={rsvpMessage} onChange={e => setRsvpMessage(e.target.value)} maxLength={500} rows={2} />
                  <button type="submit" disabled={!rsvpAttending || rsvpName.trim().length < 2 || rsvpLoading} style={{ ...btn2(true), alignSelf:"center", padding:".7rem 2rem" } as React.CSSProperties}>
                    {rsvpLoading ? "Envoi…" : "Confirmer →"}
                  </button>
                </form>
              )}
            </section>
          )}
        </div>
      </div>

      {toast && <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:"#B8923C", color:"#1c1408", fontFamily:"'Marcellus',serif", fontSize:".75rem", letterSpacing:".12em", textTransform:"uppercase", padding:".65rem 1.6rem", borderRadius:100, zIndex:200 }}>{toast}</div>}
    </div>
  );
}
