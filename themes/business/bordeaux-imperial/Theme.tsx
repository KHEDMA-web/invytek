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

function FiligraneSvg() {
  return (
    <svg viewBox="0 0 230 60" width={200} height={52} fill="none" aria-hidden style={{ display: "block", margin: "0 auto" }}>
      <g stroke="#E1C06C" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M115 8 C115 20 108 26 100 30 C112 32 116 40 115 52"/>
        <path d="M100 30 C78 24 62 36 56 20 C50 36 36 30 22 38"/>
        <path d="M130 30 C152 24 168 36 174 20 C180 36 194 30 208 38"/>
      </g>
      <circle cx="115" cy="6" r="3" fill="#E1C06C"/>
    </svg>
  );
}

function CornerBi() {
  return (
    <svg viewBox="0 0 80 80" fill="none" width="80" height="80" aria-hidden>
      <g stroke="#BE9647" strokeLinecap="round" fill="none" opacity=".55">
        <path d="M6 6 C28 16 52 44 58 68" strokeWidth="1"/>
        <path d="M20 8 C24 18 24 28 20 38" strokeWidth=".8"/>
        <path d="M8 22 C16 26 24 24 30 18" strokeWidth=".8"/>
      </g>
      <circle cx="6" cy="6" r="2" fill="#BE9647" opacity=".6"/>
    </svg>
  );
}

export default function BordeauxImperialTheme({
  content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false,
}: Props) {
  const { showCountdown = true, showRsvp = true } = options;

  const sparklesRef = useRef<HTMLDivElement>(null);
  const cardRef     = useRef<HTMLDivElement>(null);
  useSparkles(sparklesRef, { color: "#BE9647", count: 45 });
  useTilt(cardRef);

  const [opened,      setOpened]      = useState(false);
  const [toast,       setToast]       = useState<string | null>(null);
  const [cd,          setCd]          = useState({ j: "––", h: "––", m: "––" });
  const [cdDone,      setCdDone]      = useState(false);
  const [rsvpName,    setRsvpName]    = useState(guestName ?? "");
  const [rsvpStatus,  setRsvpStatus]  = useState<"attending"|"declined"|null>(null);
  const [rsvpSize,    setRsvpSize]    = useState(1);
  const [rsvpMsg,     setRsvpMsg]     = useState("");
  const [rsvpSent,    setRsvpSent]    = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

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
      `SUMMARY:${content.names[0]} — ${content.names[1]}`,
      `LOCATION:${content.venue}${content.venueSub ? "\\, "+content.venueSub : ""}`,
      `DESCRIPTION:${content.hosts}`,
      "END:VEVENT","END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `event-${content.names[0].toLowerCase().replace(/\s+/g,"-")}.ics`;
    a.click();
    setToast("Date enregistrée dans votre calendrier");
  }

  const dateObj = new Date(content.date + "T12:00:00");
  const dateStr = dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const eventTitle = content.names[0];
  const subtitle = content.names[1] && content.names[1] !== "—" ? content.names[1] : "";

  return (
    <div className={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=optional" rel="stylesheet"/>

      <div className={styles.sparkles} ref={sparklesRef} />
      <div className={styles.vignette} />

      {/* Gate */}
      <div className={`${styles.gate} ${opened ? styles.out : ""}`} onClick={() => setOpened(true)}>
        <FiligraneSvg />
        <div className={styles.gateLabel}>
          {content.invitationLine || "Invitation"}
        </div>
        <div className={styles.gateTitle}>{eventTitle}</div>
        {subtitle && <div className={styles.gateSub}>{subtitle}</div>}
        <button className={styles.gateBtn} onClick={e => { e.stopPropagation(); setOpened(true); }}>
          Révéler l&apos;invitation
        </button>
      </div>

      {/* Card */}
      <div className={styles.scene}>
        <div className={styles.cardWrap} ref={cardRef}>
          <div className={styles.card}>
            <div className={styles.innerBorder} />
            <div className={`${styles.corner} ${styles.cornerTL}`}><CornerBi /></div>
            <div className={`${styles.corner} ${styles.cornerTR}`}><CornerBi /></div>
            <div className={`${styles.corner} ${styles.cornerBL}`}><CornerBi /></div>
            <div className={`${styles.corner} ${styles.cornerBR}`}><CornerBi /></div>

            <div className={`${styles.filigrane} ${styles.rev}`} style={{ animationDelay: ".05s" }}>
              <FiligraneSvg />
            </div>

            {guestName && (
              <div className={`${styles.guestBadge} ${styles.rev}`} style={{ animationDelay: ".08s" }}>
                <span className={styles.guestPre}>À l&apos;attention de</span>
                <span className={styles.guestName}>{guestName}</span>
              </div>
            )}

            <p className={`${styles.eyebrow} ${styles.rev}`} style={{ animationDelay: ".1s" }}>
              {content.invitationLine || "Vous êtes cordialement invité(e)"}
            </p>
            <p className={`${styles.hosts} ${styles.rev}`} style={{ animationDelay: ".18s" }}>
              {content.hosts}
            </p>

            <h1 className={`${styles.title} ${styles.rev}`} style={{ animationDelay: ".28s" }}>
              {eventTitle}
            </h1>
            {subtitle && (
              <p className={`${styles.subtitle} ${styles.rev}`} style={{ animationDelay: ".34s" }}>
                {subtitle}
              </p>
            )}

            <div className={`${styles.sep} ${styles.rev}`} style={{ animationDelay: ".42s" }}>
              <span className={`${styles.sepLine} ${styles.sepLineL}`} />
              <svg viewBox="0 0 18 18" fill="none" width="18" height="18" aria-hidden>
                <rect x="2" y="2" width="14" height="14" rx="1" stroke="#BE9647" strokeWidth="1.2" transform="rotate(45 9 9)"/>
              </svg>
              <span className={`${styles.sepLine} ${styles.sepLineR}`} />
            </div>

            <div className={`${styles.dateBlock} ${styles.rev}`} style={{ animationDelay: ".5s" }}>
              <span className={styles.dateStr}>{dateStr}</span>
              <p className={styles.dateTime}>
                {content.time.replace(":"," h ")}<br/>
                <span className={styles.venue}>{content.venue}{content.venueSub ? ` · ${content.venueSub}` : ""}</span>
              </p>
            </div>

            {showCountdown && !cdDone && (
              <div className={`${styles.countdown} ${styles.rev}`} style={{ animationDelay: ".6s" }}>
                {[{ val: cd.j, lab: "Jours" }, { val: cd.h, lab: "Heures" }, { val: cd.m, lab: "Min" }].map(({ val, lab }) => (
                  <div key={lab} className={styles.cdBox}>
                    <span className={styles.cdNum}>{val}</span>
                    <span className={styles.cdLab}>{lab}</span>
                  </div>
                ))}
              </div>
            )}

            <div className={`${styles.filigraneMirror} ${styles.rev}`} style={{ animationDelay: ".65s" }}>
              <FiligraneSvg />
            </div>

            <p className={`${styles.closing} ${styles.rev}`} style={{ animationDelay: ".68s" }}>
              {content.closing}
            </p>

            <div className={`${styles.cta} ${styles.rev}`} style={{ animationDelay: ".7s" }}>
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
                  onClick={() => document.getElementById("bi-rsvp")?.scrollIntoView({ behavior: "smooth" })}>
                  Confirmer ma présence
                </button>
              )}
            </div>

            {showRsvp && invitationId && (
              <section id="bi-rsvp" className={`${styles.rsvp} ${styles.rev}`} style={{ animationDelay: ".8s" }}>
                <h2 className={styles.rsvpTitle}>Votre réponse</h2>
                {rsvpSent || alreadyResponded ? (
                  <p className={styles.rsvpDone}>
                    {alreadyResponded && !rsvpSent
                      ? "Vous avez déjà répondu — merci !"
                      : <>Merci <strong>{rsvpName}</strong> — réponse enregistrée.</>}
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
                          {i === 0 ? "Confirmer" : "Décliner"}
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
                    <textarea className={styles.inp} placeholder="Message (optionnel)"
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

      <div className={`${styles.toast} ${toast ? styles.show : ""}`}>{toast}</div>
    </div>
  );
}
