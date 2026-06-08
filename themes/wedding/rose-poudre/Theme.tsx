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

function BlossomCorner() {
  return (
    <svg viewBox="0 0 130 130" fill="none" width="122" height="122" aria-hidden>
      <g stroke="#C77B8B" strokeWidth="1" opacity=".6" strokeLinecap="round">
        <path d="M10 10 C40 22 62 50 68 88"/>
        <path d="M26 16 C32 24 34 34 30 44"/>
        <path d="M18 34 C26 38 34 38 40 32"/>
        <path d="M50 52 C54 62 56 72 52 82"/>
      </g>
      <g fill="#E8B6C2" opacity=".75">
        <ellipse cx="36" cy="26" rx="5" ry="3" transform="rotate(-30 36 26)"/>
        <ellipse cx="50" cy="50" rx="4.5" ry="2.6" transform="rotate(-25 50 50)"/>
        <ellipse cx="56" cy="74" rx="4" ry="2.4" transform="rotate(-20 56 74)"/>
      </g>
    </svg>
  );
}

export default function RosePoudreTheme({
  content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false,
}: Props) {
  const { showCountdown = true, showRsvp = true } = options;

  const petalsRef = useRef<HTMLDivElement>(null);
  const cardRef   = useRef<HTMLDivElement>(null);
  usePetals(petalsRef, { color: "rgba(232,182,194,.6)", count: 16 });
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
  const initials = content.names[0][0] ?? "N";

  return (
    <div className={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=swap" rel="stylesheet"/>

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
        <div className={styles.gateLabel}>Invitation</div>
        <div className={styles.gateNames}>{content.names[0]} &amp; {content.names[1]}</div>
        <p className={styles.gatePulse}>Touchez pour ouvrir</p>
      </div>

      {/* Card */}
      {opened && (
        <div className={styles.scene}>
          <div className={styles.cardWrap} ref={cardRef}>
            <div className={styles.card}>
              <div className={styles.innerBorder} />
              <div className={`${styles.corner} ${styles.cornerTL}`}><BlossomCorner /></div>
              <div className={`${styles.corner} ${styles.cornerTR}`}><BlossomCorner /></div>
              <div className={`${styles.corner} ${styles.cornerBL}`}><BlossomCorner /></div>
              <div className={`${styles.corner} ${styles.cornerBR}`}><BlossomCorner /></div>

              {/* Drifting petal */}
              <div className={styles.petalDrift}>
                <svg viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden>
                  <ellipse cx="7" cy="7" rx="4" ry="6.5" fill="#E8B6C2" opacity=".8" transform="rotate(-30 7 7)"/>
                </svg>
              </div>

              {guestName && (
                <div className={`${styles.guestBadge} ${styles.rev}`}>
                  <span className={styles.guestPre}>À l&apos;attention de</span>
                  <span className={styles.guestName}>{guestName}</span>
                </div>
              )}

              <p className={`${styles.eyebrow} ${styles.rev}`} style={{ animationDelay: ".1s" }}>
                {content.invitationLine || "Avec bonheur"}
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
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden>
                  <path d="M12 3 C10 6 6 8 5 12 A5.5 5.5 0 0 0 12 18.5 A5.5 5.5 0 0 0 19 12 C18 8 14 6 12 3Z" fill="#C49A48"/>
                  <circle cx="12" cy="10" r="2" fill="#E8B6C2"/>
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
                    onClick={() => document.getElementById("rp-rsvp")?.scrollIntoView({ behavior: "smooth" })}>
                    Confirmer ma présence
                  </button>
                )}
              </div>

              {showRsvp && invitationId && (
                <section id="rp-rsvp" className={`${styles.rsvp} ${styles.rev}`} style={{ animationDelay: ".8s" }}>
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
