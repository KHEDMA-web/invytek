"use client";

import { useEffect, useRef, useState } from "react";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";
import { useSparkles, useTilt } from "@/hooks/useThemeEffects";
import styles from "./Theme.module.css";

interface Props {
  content: WeddingContent;
  options?: Partial<WeddingOptions>;
  invitationId?: string;
  guestName?: string;
  guestToken?: string;
  alreadyResponded?: boolean;
}

function CornerGold() {
  return (
    <svg viewBox="0 0 70 70" fill="none" width="66" height="66" aria-hidden>
      <g stroke="#D4AF61" strokeWidth="1" strokeLinecap="round" fill="none" opacity=".4">
        <path d="M8 8 C22 16 36 34 42 62"/>
        <path d="M18 10 C22 18 22 28 18 38"/>
        <path d="M10 24 C16 28 22 26 28 20"/>
      </g>
      <circle cx="8" cy="8" r="2" fill="#D4AF61" opacity=".45"/>
    </svg>
  );
}

export default function ConfettisOrTheme({
  content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false,
}: Props) {
  const { showCountdown = true, showRsvp = true } = options;

  const sparklesRef  = useRef<HTMLDivElement>(null);
  const confettiRef  = useRef<HTMLDivElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);
  useSparkles(sparklesRef, { color: "#D4AF61", count: 40 });
  useTilt(cardRef);

  const [opened,      setOpened]      = useState(false);
  const [toast,       setToast]       = useState<string | null>(null);
  const [cd,          setCd]          = useState({ j: "––", h: "––", m: "––" });
  const [cdDone,      setCdDone]      = useState(false);
  const [rsvpName,    setRsvpName]    = useState(guestName ?? "");
  const [rsvpStatus,  setRsvpStatus]  = useState<"attending" | "declined" | null>(null);
  const [rsvpSize,    setRsvpSize]    = useState(1);
  const [rsvpMsg,     setRsvpMsg]     = useState("");
  const [rsvpSent,    setRsvpSent]    = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    const el = confettiRef.current;
    if (!el) return;
    const COLORS = ["#D4AF61","#E8C84A","#F0D080","#B8923C","#FFAAB0","#A0C4FF","#F5F0E8"];
    const pieces: HTMLDivElement[] = [];
    for (let i = 0; i < 30; i++) {
      const c = document.createElement("div");
      const sz = Math.random() * 6 + 5;
      c.style.cssText = `position:fixed;left:${Math.random()*110-5}%;top:-10px;width:${sz}px;height:${sz*(Math.random()>.5?1.5:1)}px;background:${COLORS[Math.floor(Math.random()*COLORS.length)]};border-radius:${Math.random()>.5?"50%":"2px"};opacity:${(Math.random()*.5+.4).toFixed(2)};pointer-events:none;animation:confRain ${Math.random()*5+7}s linear ${Math.random()*8}s infinite`;
      c.style.setProperty("--r", Math.random()*360 + "deg");
      el.appendChild(c);
      pieces.push(c);
    }
    return () => pieces.forEach(p => p.remove());
  }, []);

  useEffect(() => {
    if (!showCountdown) return;
    const target = new Date(`${content.date}T${content.time}:00`);
    function tick() {
      let diff = target.getTime() - Date.now();
      if (diff < 0) { setCdDone(true); return; }
      const j = Math.floor(diff / 86400000); diff %= 86400000;
      const h = Math.floor(diff / 3600000);  diff %= 3600000;
      const m = Math.floor(diff / 60000);
      setCd({ j: String(j), h: String(h).padStart(2,"0"), m: String(m).padStart(2,"0") });
    }
    tick(); const id = setInterval(tick, 30000); return () => clearInterval(id);
  }, [content.date, content.time, showCountdown]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  async function submitRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!invitationId || !rsvpStatus || rsvpName.trim().length < 2) return;
    setRsvpLoading(true);
    try {
      await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, name: rsvpName.trim(), status: rsvpStatus, partySize: rsvpSize, message: rsvpMsg || undefined, token: guestToken }) });
      setRsvpSent(true);
    } catch { /* silent */ } finally { setRsvpLoading(false); }
  }

  function saveDate() {
    const [y, mo, d] = content.date.split("-"); const [hh, mm] = content.time.split(":");
    const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Invytek//FR","CALSCALE:GREGORIAN","BEGIN:VEVENT",
      `DTSTART:${y}${mo}${d}T${hh}${mm}00`,
      `SUMMARY:${content.invitationLine || "Anniversaire de "+content.names[0]}`,
      `LOCATION:${content.venue}${content.venueSub?"\\, "+content.venueSub:""}`,
      `DESCRIPTION:${content.hosts}`,
      "END:VEVENT","END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `anniversaire-${content.names[0].toLowerCase()}.ics`;
    a.click(); setToast("Date enregistrée dans votre calendrier");
  }

  const dateObj = new Date(content.date + "T12:00:00");
  const dateStr = dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Marcellus&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&display=swap" rel="stylesheet"/>
      <div className={styles.sparkles} ref={sparklesRef} />
      <div className={styles.confetti} ref={confettiRef} />

      <div className={`${styles.gate} ${opened ? styles.out : ""}`} onClick={() => setOpened(true)}>
        <div className={styles.gateName}>{content.names[0]}</div>
        <div className={styles.gateTag}>{content.invitationLine || "fête son anniversaire"}</div>
        <div className={styles.gateLabel}>Invitation d&apos;honneur</div>
        <button className={styles.gateBtn} onClick={e => { e.stopPropagation(); setOpened(true); }}>
          Découvrir l&apos;invitation
        </button>
      </div>

      <div className={styles.scene}>
        <div className={styles.cardWrap} ref={cardRef}>
          <div className={styles.card}>
            <div className={styles.innerBorder} />
            <div className={styles.innerBorder2} />
            <div className={styles.shine} />
            <div className={`${styles.corner} ${styles.cornerTL}`}><CornerGold /></div>
            <div className={`${styles.corner} ${styles.cornerTR}`}><CornerGold /></div>
            <div className={`${styles.corner} ${styles.cornerBL}`}><CornerGold /></div>
            <div className={`${styles.corner} ${styles.cornerBR}`}><CornerGold /></div>

            {guestName && (
              <div className={`${styles.guestBadge} ${styles.rev}`}>
                <span className={styles.guestPre}>À l&apos;attention de</span>
                <span className={styles.guestName}>{guestName}</span>
              </div>
            )}

            <p className={`${styles.eyebrow} ${styles.rev}`} style={{ animationDelay: ".05s" }}>
              {content.hosts || "Vous êtes cordialement invité(e)"}
            </p>
            <div className={`${styles.bigName} ${styles.rev}`} style={{ animationDelay: ".15s" }}>
              {content.names[0]}
            </div>
            <p className={`${styles.tagline} ${styles.rev}`} style={{ animationDelay: ".22s" }}>
              {content.invitationLine || "fête son anniversaire"}
            </p>

            <div className={`${styles.sep} ${styles.rev}`} style={{ animationDelay: ".3s" }}>
              <span className={styles.sepLine} />
              <svg viewBox="0 0 28 28" fill="none" width="20" height="20" aria-hidden>
                <path d="M14 2 L15.8 9.8 L23 9.8 L17.2 14.4 L19.4 22 L14 17.8 L8.6 22 L10.8 14.4 L5 9.8 L12.2 9.8Z" fill="#D4AF61" opacity=".75"/>
              </svg>
              <span className={styles.sepLine} />
            </div>

            <div className={`${styles.dateBlock} ${styles.rev}`} style={{ animationDelay: ".4s" }}>
              <span className={styles.dateStr}>{dateStr}</span>
              <p className={styles.dateTime}>
                {content.time.replace(":"," h ")}<br/>
                <span className={styles.venue}>{content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}</span>
              </p>
            </div>

            {showCountdown && !cdDone && (
              <div className={`${styles.countdown} ${styles.rev}`} style={{ animationDelay: ".5s" }}>
                {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                  <div key={lab} className={styles.cdBox}>
                    <span className={styles.cdNum}>{val}</span>
                    <span className={styles.cdLab}>{lab}</span>
                  </div>
                ))}
              </div>
            )}

            <p className={`${styles.closing} ${styles.rev}`} style={{ animationDelay: ".6s" }}>
              {content.closing}
            </p>

            <div className={`${styles.cta} ${styles.rev}`} style={{ animationDelay: ".65s" }}>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={saveDate}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width={14} height={14}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                Enregistrer la date
              </button>
              {content.mapsUrl && (
                <a className={`${styles.btn} ${styles.btnGhost}`} href={content.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                  Itinéraire
                </a>
              )}
              {showRsvp && invitationId && (
                <button className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => document.getElementById("co-rsvp")?.scrollIntoView({ behavior: "smooth" })}>
                  Confirmer ma présence
                </button>
              )}
            </div>

            {showRsvp && invitationId && (
              <section id="co-rsvp" className={`${styles.rsvp} ${styles.rev}`} style={{ animationDelay: ".75s" }}>
                <h2 className={styles.rsvpTitle}>Votre réponse</h2>
                {rsvpSent || alreadyResponded ? (
                  <p className={styles.rsvpDone}>
                    {alreadyResponded && !rsvpSent ? "Vous avez déjà répondu — merci !"
                      : <>Merci <strong>{rsvpName}</strong> — réponse enregistrée.</>}
                  </p>
                ) : (
                  <form className={styles.rsvpForm} onSubmit={submitRsvp}>
                    <input className={styles.inp} type="text" placeholder="Votre nom complet"
                      value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} maxLength={80}/>
                    <div className={styles.toggle}>
                      {(["attending","declined"] as const).map((v, i) => (
                        <button key={v} type="button"
                          className={`${styles.toggleBtn} ${rsvpStatus===v?(i===0?styles.active:styles.declined):""}`}
                          onClick={() => setRsvpStatus(v)}>{i===0?"Confirmer":"Décliner"}</button>
                      ))}
                    </div>
                    {rsvpStatus === "attending" && (
                      <div className={styles.sizeRow}>
                        <span className={styles.sizeLabel}>Nombre de personnes</span>
                        <div className={styles.sizeCtrl}>
                          <button type="button" className={styles.sizeBtn} onClick={() => setRsvpSize(s=>Math.max(1,s-1))}>−</button>
                          <span className={styles.sizeVal}>{rsvpSize}</span>
                          <button type="button" className={styles.sizeBtn} onClick={() => setRsvpSize(s=>Math.min(20,s+1))}>+</button>
                        </div>
                      </div>
                    )}
                    <textarea className={styles.inp} placeholder="Message (optionnel)"
                      value={rsvpMsg} onChange={e=>setRsvpMsg(e.target.value)} rows={2} style={{resize:"vertical"}}/>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{alignSelf:"center"}}
                      disabled={!rsvpStatus||rsvpName.trim().length<2||rsvpLoading}>
                      {rsvpLoading?"Envoi…":"Envoyer →"}
                    </button>
                  </form>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
      <div className={`${styles.toast} ${toast ? styles.show : ""}`}>{toast}</div>
    </div>
  );
}
