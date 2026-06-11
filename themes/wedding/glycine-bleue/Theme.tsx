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

function FloralCorner() {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="112" height="112" aria-hidden>
      <g stroke="#3E5C96" strokeLinecap="round" fill="none" opacity=".55">
        <path d="M12 12 C44 28 68 58 76 96" strokeWidth="1.2"/>
        <path d="M28 18 C34 28 36 38 32 50" strokeWidth="1"/>
        <path d="M18 38 C26 42 38 40 44 34" strokeWidth="1"/>
        <path d="M54 54 C58 64 60 74 56 84" strokeWidth="1"/>
      </g>
      <g fill="#6E8CC4" opacity=".55">
        <ellipse cx="38" cy="26" rx="5.5" ry="3.2" transform="rotate(-30 38 26)"/>
        <ellipse cx="58" cy="52" rx="5" ry="2.8" transform="rotate(-25 58 52)"/>
        <ellipse cx="62" cy="76" rx="4.5" ry="2.5" transform="rotate(-20 62 76)"/>
      </g>
    </svg>
  );
}

export default function GlycineBleueTheme({
  content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false,
}: Props) {
  const { showCountdown = true, showRsvp = true } = options;

  const petalsRef = useRef<HTMLDivElement>(null);
  const cardRef   = useRef<HTMLDivElement>(null);
  usePetals(petalsRef, { color: "rgba(108,140,196,.45)", count: 14 });
  useTilt(cardRef);

  const [opened,      setOpened]      = useState(false);
  const [envOpen,     setEnvOpen]     = useState(false);
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

  function openGate() { setEnvOpen(true); setTimeout(() => setOpened(true), 500); }

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
  const initials = (content.names[0][0] ?? "L");

  return (
    <div className={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=optional" rel="stylesheet"/>

      <div className={styles.petals} ref={petalsRef} />

      {/* Gate */}
      <div className={`${styles.gate} ${envOpen ? styles.out : ""}`} onClick={openGate}>
        <div className={styles.envWrap}>
          <div className={styles.envBody} />
          <div className={styles.envBL} />
          <div className={styles.envBR} />
          <div className={`${styles.envFlap} ${envOpen ? styles.open : ""}`} />
          <div className={`${styles.envSeal} ${envOpen ? styles.open : ""}`}>
            <span style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "2rem", color: "#5a4318", lineHeight: 1 }}>{initials}</span>
          </div>
        </div>
        <div className={styles.gateLabel}>Save the Date</div>
        <div className={styles.gateNames}>{content.names[0]} &amp; {content.names[1]}</div>
        <p className={styles.gatePulse}>Touchez le sceau pour ouvrir</p>
      </div>

      {/* Card */}
      {opened && (
        <div className={styles.scene}>
          <div className={styles.cardWrap} ref={cardRef}>
            <div className={styles.card}>
              <div className={styles.innerBorder} />
              <div className={`${styles.corner} ${styles.cornerTL}`}><FloralCorner /></div>
              <div className={`${styles.corner} ${styles.cornerTR}`}><FloralCorner /></div>
              <div className={`${styles.corner} ${styles.cornerBL}`}><FloralCorner /></div>
              <div className={`${styles.corner} ${styles.cornerBR}`}><FloralCorner /></div>

              {/* Butterfly */}
              <div className={styles.butterfly}>
                <svg viewBox="0 0 48 48" fill="none" width="48" height="48" aria-hidden>
                  <g fill="#5C7BB8" opacity=".85">
                    <path d="M24 24 C16 8 4 10 6 22 C7 30 18 28 24 24Z"/>
                    <path d="M24 24 C32 8 44 10 42 22 C41 30 30 28 24 24Z"/>
                    <path d="M24 24 C18 32 8 34 10 42 C16 42 22 32 24 24Z" fill="#9BB4DC"/>
                    <path d="M24 24 C30 32 40 34 38 42 C32 42 26 32 24 24Z" fill="#9BB4DC"/>
                  </g>
                  <path d="M24 14 L24 36" stroke="#2C447A" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>

              {guestName && (
                <div className={`${styles.guestBadge} ${styles.rev}`}>
                  <span className={styles.guestPre}>À l&apos;attention de</span>
                  <span className={styles.guestName}>{guestName}</span>
                </div>
              )}

              <p className={`${styles.eyebrow} ${styles.rev}`} style={{ animationDelay: ".1s" }}>
                {content.invitationLine || "Avec joie, nous célébrons"}
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
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden>
                  <path d="M12 3 C9 9 5 10 5 14 a4 4 0 0 0 7 2.6 a4 4 0 0 0 7-2.6 C19 10 15 9 12 3Z" fill="#C49A48"/>
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
                    onClick={() => document.getElementById("gb-rsvp")?.scrollIntoView({ behavior: "smooth" })}>
                    Confirmer ma présence
                  </button>
                )}
              </div>

              {showRsvp && invitationId && (
                <section id="gb-rsvp" className={`${styles.rsvp} ${styles.rev}`} style={{ animationDelay: ".8s" }}>
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
      )}

      <div className={`${styles.toast} ${toast ? styles.show : ""}`}>{toast}</div>
    </div>
  );
}
