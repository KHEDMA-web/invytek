"use client";

import { useEffect, useRef, useState } from "react";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";
import { usePetals, useTilt } from "@/hooks/useThemeEffects";
import styles from "./Theme.module.css";

interface Props {
  content: WeddingContent;
  options?: Partial<WeddingOptions>;
  invitationId?: string;
  guestName?: string;
  guestToken?: string;
  alreadyResponded?: boolean;
}

function CornerOrnament() {
  return (
    <svg viewBox="0 0 100 100" fill="none" width="100" height="100" aria-hidden>
      <g stroke="#9A8A6E" strokeLinecap="round" fill="none" opacity=".6">
        <path d="M10 10 C30 20 52 44 60 80" strokeWidth="1.1"/>
        <path d="M24 14 C30 22 32 32 28 44" strokeWidth=".9"/>
        <path d="M14 34 C22 38 30 36 36 30" strokeWidth=".9"/>
      </g>
      <g fill="#9A8A6E" opacity=".45">
        <ellipse cx="32" cy="22" rx="4.5" ry="2.6" transform="rotate(-30 32 22)"/>
        <ellipse cx="50" cy="48" rx="4" ry="2.3" transform="rotate(-25 50 48)"/>
      </g>
      <circle cx="10" cy="10" r="2" fill="#9A8A6E" opacity=".5"/>
    </svg>
  );
}

export default function IvoireEmbosseTheme({
  content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false,
}: Props) {
  const { showCountdown = true, showRsvp = true } = options;

  const petalsRef = useRef<HTMLDivElement>(null);
  const cardRef   = useRef<HTMLDivElement>(null);
  usePetals(petalsRef, { color: "rgba(154,138,110,.35)", count: 12 });
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
  const dateStr = dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const monogram = (content.initials?.[0] ?? content.names[0][0] ?? "B").toUpperCase();

  return (
    <div className={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=optional" rel="stylesheet"/>

      <div className={styles.petals} ref={petalsRef} />

      {/* Gate */}
      <div className={`${styles.gate} ${opened ? styles.out : ""}`} onClick={() => setOpened(true)}>
        <div className={styles.gateSeal}>
          <span className={styles.gateSealLetter}>{monogram}</span>
        </div>
        <div className={styles.gateLabel}>Mariage</div>
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
            <div className={styles.foldLine} />
            <div className={styles.damask} />
            <div className={`${styles.corner} ${styles.cornerTL}`}><CornerOrnament /></div>
            <div className={`${styles.corner} ${styles.cornerTR}`}><CornerOrnament /></div>
            <div className={`${styles.corner} ${styles.cornerBL}`}><CornerOrnament /></div>
            <div className={`${styles.corner} ${styles.cornerBR}`}><CornerOrnament /></div>

            {/* Monogram seal */}
            <div className={`${styles.sealCard} ${styles.rev}`}>
              <span className={styles.sealLetter}>{monogram}</span>
            </div>

            {guestName && (
              <div className={`${styles.guestBadge} ${styles.rev}`} style={{ animationDelay: ".05s" }}>
                <span className={styles.guestPre}>À l&apos;attention de</span>
                <span className={styles.guestName}>{guestName}</span>
              </div>
            )}

            <p className={`${styles.eyebrow} ${styles.rev}`} style={{ animationDelay: ".1s" }}>
              {content.invitationLine || "Mariage"}
            </p>
            <p className={`${styles.hosts} ${styles.rev}`} style={{ animationDelay: ".18s" }}>
              {content.hosts}
            </p>

            <div className={`${styles.names} ${styles.rev}`} style={{ animationDelay: ".3s" }}>
              {content.names[0]}
              <span className={styles.amp}>&amp;</span>
              {content.names[1]}
            </div>

            <div className={`${styles.sep} ${styles.rev}`} style={{ animationDelay: ".42s" }}>
              <span className={`${styles.sepLine} ${styles.sepLineL}`} />
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18" aria-hidden>
                <path d="M10 2 C8 5 5 6 4 9 a5 5 0 0 0 6 4.8 a5 5 0 0 0 6-4.8 C15 6 12 5 10 2Z" fill="#6B4A2E"/>
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
                  onClick={() => document.getElementById("ie-rsvp")?.scrollIntoView({ behavior: "smooth" })}>
                  Confirmer ma présence
                </button>
              )}
            </div>

            {showRsvp && invitationId && (
              <section id="ie-rsvp" className={`${styles.rsvp} ${styles.rev}`} style={{ animationDelay: ".8s" }}>
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
