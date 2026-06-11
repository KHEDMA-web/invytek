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

function BranchSvg({ size = 148 }: { size?: number }) {
  return (
    <svg viewBox="0 0 150 150" width={size} height={size} fill="none" aria-hidden>
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

function WaxSeal({ size = 64, letter = "M" }: { size?: number; letter?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden>
      <defs>
        <radialGradient id="sr-wax2" cx="38%" cy="34%" r="60%">
          <stop offset="0" stopColor="#CC4A40"/>
          <stop offset="55%" stopColor="#A82828"/>
          <stop offset="100%" stopColor="#7E1A1A"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="url(#sr-wax2)" filter="drop-shadow(0 4px 8px rgba(0,0,0,.25))"/>
      <circle cx="32" cy="32" r="24" stroke="rgba(255,255,255,.15)" strokeWidth="1" fill="none"/>
      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontFamily="'Pinyon Script',cursive" fontSize="26" fill="#E89A92">{letter}</text>
    </svg>
  );
}

export default function SceauDeRoseTheme({
  content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false,
}: Props) {
  const { showCountdown = true, showRsvp = true } = options;

  const petalsRef = useRef<HTMLDivElement>(null);
  const cardRef   = useRef<HTMLDivElement>(null);
  usePetals(petalsRef, { color: "rgba(217,181,103,.5)", count: 14 });
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
  const sealLetter = (content.initials?.[0] ?? content.names[0][0] ?? "M").toUpperCase();

  return (
    <div className={styles.root}>

      <div className={styles.petals} ref={petalsRef} />

      {/* Gate */}
      <div className={`${styles.gate} ${opened ? styles.out : ""}`} onClick={() => setOpened(true)}>
        <div className={styles.gateBranch}><BranchSvg size={150} /></div>
        <div className={styles.gateLabel}>Invitation</div>
        <div className={styles.gateNames}>{content.names[0]} &amp; {content.names[1]}</div>
        <div className={styles.gateSealWrap}><WaxSeal size={72} letter={sealLetter} /></div>
        <button className={styles.gateBtn} onClick={e => { e.stopPropagation(); setOpened(true); }}>
          Briser le sceau
        </button>
      </div>

      {/* Card */}
      <div className={styles.scene}>
        <div className={styles.cardWrap} ref={cardRef}>
          <div className={styles.card}>
            <div className={styles.innerBorder} />
            <div className={`${styles.corner} ${styles.cornerTL}`}><BranchSvg /></div>
            <div className={`${styles.corner} ${styles.cornerTR}`}><BranchSvg /></div>
            <div className={`${styles.corner} ${styles.cornerBL}`}><BranchSvg /></div>
            <div className={`${styles.corner} ${styles.cornerBR}`}><BranchSvg /></div>

            {/* Wax seal top */}
            <div className={`${styles.sealTop} ${styles.rev}`}>
              <WaxSeal size={64} letter={sealLetter} />
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
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden>
                <circle cx="12" cy="12" r="3" stroke="#CC4A40" strokeWidth="1.2"/>
                <path d="M9 11 C7 5 13 3 16 6 C20 4 22 9 18 12" stroke="#CC4A40" strokeWidth="1.2"/>
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
                  onClick={() => document.getElementById("sr-rsvp")?.scrollIntoView({ behavior: "smooth" })}>
                  Confirmer ma présence
                </button>
              )}
            </div>

            {showRsvp && invitationId && (
              <section id="sr-rsvp" className={`${styles.rsvp} ${styles.rev}`} style={{ animationDelay: ".8s" }}>
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
