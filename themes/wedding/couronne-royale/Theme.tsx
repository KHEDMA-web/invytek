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

function CrownSvg({ size = 110 }: { size?: number }) {
  const h = Math.round(size * 0.76);
  return (
    <svg width={size} height={h} viewBox="0 0 120 92" fill="none" aria-hidden>
      <defs>
        <linearGradient id="cr-g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"   stopColor="#F3E2A8"/>
          <stop offset="1"   stopColor="#B88A38"/>
        </linearGradient>
        <linearGradient id="cr-g2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"   stopColor="#E7C76C"/>
          <stop offset="1"   stopColor="#9C742E"/>
        </linearGradient>
        <filter id="cr-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Base band */}
      <path d="M10 76 L110 76 L107 88 L13 88 Z" fill="url(#cr-g2)" stroke="#8A6A28" strokeWidth=".9"/>
      {/* Crown body */}
      <path d="M10 76 L18 32 L42 56 L60 18 L78 56 L102 32 L110 76 Z" fill="url(#cr-g1)" stroke="#8A6A28" strokeWidth="1.1" strokeLinejoin="round" filter="url(#cr-glow)"/>
      {/* Inner shadow line */}
      <path d="M18 32 L42 56 L60 18 L78 56 L102 32" stroke="rgba(255,240,180,.25)" strokeWidth=".8" fill="none"/>
      {/* Gems */}
      <circle cx="60"  cy="11"  r="5.5"  fill="#E7C76C" filter="url(#cr-glow)"/>
      <circle cx="60"  cy="82"  r="3.2"  fill="#C0304A"/>
      <circle cx="40"  cy="82"  r="2.4"  fill="#7BA8D8"/>
      <circle cx="80"  cy="82"  r="2.4"  fill="#7BA8D8"/>
      <circle cx="18"  cy="29"  r="3.6"  fill="#F3E2A8" opacity=".9"/>
      <circle cx="102" cy="29"  r="3.6"  fill="#F3E2A8" opacity=".9"/>
      {/* Top finial */}
      <path d="M60 3 L60 11 M56 6 L64 6" stroke="#E7C76C" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function CornerSvg() {
  return (
    <svg viewBox="0 0 90 90" fill="none" width="78" height="78" aria-hidden>
      <g stroke="#C29A4B" strokeLinecap="round" fill="none">
        <path d="M6 6 C38 10 68 28 74 68" strokeWidth="1"/>
        <path d="M6 6 C10 38 28 68 68 74" strokeWidth="1"/>
        <path d="M18 9 C34 14 42 28 38 44 C28 36 20 24 18 9Z" fill="rgba(194,154,75,.1)" strokeWidth=".7"/>
        <path d="M9 18 C14 34 28 42 44 38 C36 28 24 20 9 18Z" fill="rgba(194,154,75,.1)" strokeWidth=".7"/>
        <circle cx="6" cy="6" r="2.8" fill="#C29A4B"/>
      </g>
    </svg>
  );
}

export default function CouronneRoyaleTheme({
  content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false,
}: Props) {
  const { showCountdown = true, showRsvp = true } = options;

  const sparklesRef = useRef<HTMLDivElement>(null);
  const cardRef     = useRef<HTMLDivElement>(null);
  useSparkles(sparklesRef, { color: "#E7C76C", count: 55 });
  useTilt(cardRef);

  const [opened,       setOpened]       = useState(false);
  const [toast,        setToast]        = useState<string | null>(null);
  const [cd,           setCd]           = useState({ j: "––", h: "––", m: "––" });
  const [cdDone,       setCdDone]       = useState(false);
  const [rsvpName,     setRsvpName]     = useState(guestName ?? "");
  const [rsvpStatus,   setRsvpStatus]   = useState<"attending"|"declined"|null>(null);
  const [rsvpSize,     setRsvpSize]     = useState(1);
  const [rsvpMsg,      setRsvpMsg]      = useState("");
  const [rsvpSent,     setRsvpSent]     = useState(false);
  const [rsvpLoading,  setRsvpLoading]  = useState(false);

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
      `SUMMARY:Mariage de ${content.names[0]} & ${content.names[1]}`,
      `LOCATION:${content.venue}${content.venueSub ? "\\, "+content.venueSub : ""}`,
      `DESCRIPTION:${content.hosts}`,
      "END:VEVENT","END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `mariage-${content.names[0].toLowerCase()}-${content.names[1].toLowerCase()}.ics`;
    a.click();
    setToast("Date enregistrée dans votre calendrier");
  }

  const dateObj = new Date(content.date + "T12:00:00");
  const day     = dateObj.getDate().toString().padStart(2,"0");
  const month   = dateObj.toLocaleDateString("fr-FR", { month: "long" }).toUpperCase();
  const year    = dateObj.getFullYear().toString();
  const dayFull = dateObj.toLocaleDateString("fr-FR", { weekday: "long" });

  return (
    <div className={styles.root}>

      <div className={styles.sparkles} ref={sparklesRef} />
      <div className={styles.texture} />
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      {/* Gate */}
      <div className={`${styles.gate} ${opened ? styles.out : ""}`} onClick={() => setOpened(true)}>
        <div className={styles.gateCrown}><CrownSvg size={152} /></div>
        <div className={styles.gateEyebrow}>Invitation au Mariage</div>
        <div className={styles.gateNames}>{content.names[0]} &amp; {content.names[1]}</div>
        <button className={styles.gateBtn} onClick={e => { e.stopPropagation(); setOpened(true); }}>
          Ouvrir l&apos;invitation
        </button>
      </div>

      {/* Card */}
      <div className={styles.scene}>
        <div className={styles.cardWrap} ref={cardRef}>
          <div className={styles.card}>
            <div className={styles.innerBorder} />
            <div className={styles.innerBorder2} />
            <div className={`${styles.corner} ${styles.cornerTL}`}><CornerSvg /></div>
            <div className={`${styles.corner} ${styles.cornerTR}`}><CornerSvg /></div>
            <div className={`${styles.corner} ${styles.cornerBL}`}><CornerSvg /></div>
            <div className={`${styles.corner} ${styles.cornerBR}`}><CornerSvg /></div>

            <div className={`${styles.crown} ${styles.rev}`}>
              <CrownSvg size={104} />
            </div>

            {guestName && (
              <div className={`${styles.guestBadge} ${styles.rev}`} style={{ animationDelay: ".05s" }}>
                <span className={styles.guestPre}>À l&apos;attention de</span>
                <span className={styles.guestName}>{guestName}</span>
              </div>
            )}

            <p className={`${styles.eyebrow} ${styles.rev}`} style={{ animationDelay: ".1s" }}>
              {content.invitationLine || "Avec la grâce de Dieu"}
            </p>
            <p className={`${styles.hosts} ${styles.rev}`} style={{ animationDelay: ".18s" }}>
              {content.hosts}
            </p>

            {/* Sep */}
            <div className={`${styles.sep} ${styles.rev}`} style={{ animationDelay: ".26s" }}>
              <span className={`${styles.sepLine} ${styles.sepLineL}`} />
              <svg viewBox="0 0 22 30" fill="none" width="14" height="20" aria-hidden>
                <path d="M11 1 L14 8 L11 12 L8 8 Z M11 12 C8.5 18 8.5 24 11 29 C13.5 24 13.5 18 11 12Z" fill="#C29A4B"/>
              </svg>
              <span className={`${styles.sepLine} ${styles.sepLineR}`} />
            </div>

            <div className={`${styles.names} ${styles.rev}`} style={{ animationDelay: ".34s" }}>
              {content.names[0]}
              <span className={styles.amp}>&amp;</span>
              {content.names[1]}
            </div>

            {/* Date */}
            <div className={`${styles.dateBlock} ${styles.rev}`} style={{ animationDelay: ".48s" }}>
              <div className={styles.dateDay}>{dayFull}</div>
              <div className={styles.dateNum}>{day} {month.slice(0,3)} {year}</div>
              <div className={styles.dateFull}>{month}</div>
              <div className={styles.dateTime}>{content.time.replace(":"," h ")}</div>
              <span className={styles.venue}>
                {content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}
              </span>
            </div>

            {/* Countdown */}
            {showCountdown && !cdDone && (
              <div className={`${styles.countdown} ${styles.rev}`} style={{ animationDelay: ".58s" }}>
                {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                  <div key={lab} className={styles.cdBox}>
                    <span className={styles.cdNum}>{val}</span>
                    <span className={styles.cdLab}>{lab}</span>
                  </div>
                ))}
              </div>
            )}

            <p className={`${styles.closing} ${styles.rev}`} style={{ animationDelay: ".66s" }}>
              {content.closing}
            </p>

            {/* CTA */}
            <div className={`${styles.cta} ${styles.rev}`} style={{ animationDelay: ".72s" }}>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={saveDate}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width={15} height={15}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                Enregistrer la date
              </button>
              {content.mapsUrl && (
                <a className={`${styles.btn} ${styles.btnGhost}`} href={content.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                  Itinéraire
                </a>
              )}
              {showRsvp && invitationId && (
                <button className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => document.getElementById("cr-rsvp")?.scrollIntoView({ behavior: "smooth" })}>
                  Confirmer ma présence
                </button>
              )}
            </div>

            {/* RSVP */}
            {showRsvp && invitationId && (
              <section id="cr-rsvp" className={`${styles.rsvp} ${styles.rev}`} style={{ animationDelay: ".8s" }}>
                <h2 className={styles.rsvpTitle}>Votre réponse</h2>
                {rsvpSent || alreadyResponded ? (
                  <p className={styles.rsvpDone}>
                    {alreadyResponded && !rsvpSent
                      ? <>Vous avez déjà répondu — merci, <strong>{guestName ?? rsvpName}</strong>&nbsp;!</>
                      : <>Merci <strong>{rsvpName}</strong> — votre réponse a bien été enregistrée.</>}
                  </p>
                ) : (
                  <form className={styles.rsvpForm} onSubmit={submitRsvp}>
                    <input className={styles.inp} type="text" placeholder="Votre nom complet"
                      value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} maxLength={80}/>
                    <div className={styles.toggle}>
                      {(["attending","declined"] as const).map((v, i) => (
                        <button key={v} type="button"
                          className={`${styles.toggleBtn} ${rsvpStatus === v ? (i === 0 ? styles.active : styles.declined) : ""}`}
                          onClick={() => setRsvpStatus(v)}>
                          {i === 0 ? "Je serai là" : "Je ne pourrai pas"}
                        </button>
                      ))}
                    </div>
                    {rsvpStatus === "attending" && (
                      <div className={styles.sizeRow}>
                        <span className={styles.sizeLabel}>Nombre de personnes</span>
                        <div className={styles.sizeCtrl}>
                          <button type="button" className={styles.sizeBtn} onClick={() => setRsvpSize(s => Math.max(1,s-1))}>−</button>
                          <span className={styles.sizeVal}>{rsvpSize}</span>
                          <button type="button" className={styles.sizeBtn} onClick={() => setRsvpSize(s => Math.min(20,s+1))}>+</button>
                        </div>
                      </div>
                    )}
                    <textarea className={styles.inp} placeholder="Un message (optionnel)"
                      value={rsvpMsg} onChange={e => setRsvpMsg(e.target.value)} rows={2}
                      style={{ resize: "vertical" }}/>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}
                      style={{ alignSelf: "center" }}
                      disabled={!rsvpStatus || rsvpName.trim().length < 2 || rsvpLoading}>
                      {rsvpLoading ? "Envoi…" : "Envoyer →"}
                    </button>
                  </form>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`${styles.toast} ${toast ? styles.show : ""}`}>{toast}</div>
    </div>
  );
}
