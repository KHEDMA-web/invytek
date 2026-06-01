"use client";

import { useEffect, useRef, useState } from "react";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";
import styles from "./Theme.module.css";

interface Props {
  content: WeddingContent;
  options?: Partial<WeddingOptions>;
  invitationId?: string;
}

export default function GoldArchTheme({ content, options = {}, invitationId }: Props) {
  const {
    showCountdown = true,
    showArabic = true,
    showNote = true,
    showRsvp = true,
  } = options;

  const [opened, setOpened] = useState(false);
  const [countdown, setCountdown] = useState({ j: "––", h: "––", m: "––", s: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);
  const petalRef = useRef<HTMLDivElement>(null);

  // Countdown
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
      setCountdown({
        j: String(j),
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [content.date, content.time, showCountdown]);

  // Sparkles
  useEffect(() => {
    const sc = sparklesRef.current;
    if (!sc) return;
    const dots: HTMLDivElement[] = [];
    for (let i = 0; i < 60; i++) {
      const sp = document.createElement("div");
      sp.className = styles.sp;
      sp.style.left = Math.random() * 100 + "vw";
      const size = Math.random() * 3 + 1.5;
      sp.style.width = sp.style.height = size + "px";
      sp.style.animationDuration = (Math.random() * 13 + 9) + "s";
      sp.style.animationDelay = (Math.random() * 12) + "s";
      sc.appendChild(sp);
      dots.push(sp);
    }
    return () => dots.forEach(d => d.remove());
  }, []);

  // Falling petals
  useEffect(() => {
    const pf = petalRef.current;
    if (!pf) return;
    const petals: HTMLDivElement[] = [];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("div");
      p.className = styles.petal;
      p.style.left = Math.random() * 100 + "%";
      const sz = Math.random() * 7 + 7;
      p.style.width = sz + "px";
      p.style.height = sz + "px";
      p.style.animationDuration = (Math.random() * 6 + 7) + "s";
      p.style.animationDelay = (Math.random() * 9) + "s";
      p.style.opacity = (Math.random() * 0.4 + 0.4).toFixed(2);
      pf.appendChild(p);
      petals.push(p);
    }
    return () => petals.forEach(p => p.remove());
  }, []);

  // Parallax tilt on desktop
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    let raf: number;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cx = innerWidth / 2, cy = innerHeight / 2;
        const rx = (e.clientY - cy) / cy * -3;
        const ry = (e.clientX - cx) / cx * 3;
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    };
    const onLeave = () => { card.style.transform = "rotateX(0) rotateY(0)"; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  function showToast(msg: string) { setToast(msg); }

  function saveDate() {
    const [y, mo, d] = content.date.split("-");
    const [hh, mm] = content.time.split(":");
    const dtStart = `${y}${mo}${d}T${hh}${mm}00`;
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Invytek//FR", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `DTSTART:${dtStart}`,
      `SUMMARY:Mariage de ${content.names[0]} avec ${content.names[1]}`,
      `LOCATION:${content.venue}${content.venueSub ? "\\, " + content.venueSub : ""}`,
      `DESCRIPTION:Cérémonie de mariage — ${content.hosts}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mariage-${content.names[0].toLowerCase()}-${content.names[1].toLowerCase()}.ics`;
    a.click();
    showToast("Date enregistrée dans votre calendrier");
  }

  const [day, month, year] = (() => {
    const d = new Date(content.date + "T12:00:00");
    return [
      d.getDate().toString().padStart(2, "0"),
      d.toLocaleDateString("fr-FR", { month: "long" }).toUpperCase(),
      d.getFullYear().toString(),
    ];
  })();

  return (
    <div className={styles.root}>
      {/* Envelope intro */}
      <div
        className={`${styles.envelope} ${opened ? styles.envelopeOpened : ""}`}
        onClick={() => setOpened(true)}
      >
        <div className={styles.env}>
          <div className={styles.envBody} />
          <div className={styles.envLetter}>
            {showArabic && <span className={styles.envLetterAr}>بِسْمِ اللهِ</span>}
            <span className={styles.envLetterNm}>
              {content.names[0]} {content.namesSeparator} {content.names[1]}
            </span>
            <span className={styles.envLetterSm}>Cérémonie de Mariage</span>
          </div>
          <div className={styles.envPocket} />
          <div className={styles.envBottom} />
          <div className={styles.envFlap} />
          <div className={styles.seal}>
            <div className={styles.sealFace}>
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <text x="44" y="51" textAnchor="middle" dominantBaseline="central"
                  fontFamily="'Marcellus', serif" fontSize="50" fontWeight="400" fill="#fff7e6"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}>
                  {content.initials[0]}
                </text>
              </svg>
            </div>
            <div className={`${styles.sealFace} ${styles.sealBack}`}>
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <text x="44" y="51" textAnchor="middle" dominantBaseline="central"
                  fontFamily="'Marcellus', serif" fontSize="50" fontWeight="400" fill="#fff7e6"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}>
                  {content.initials[1]}
                </text>
              </svg>
            </div>
          </div>
          <div className={styles.envHint}>Touchez pour ouvrir</div>
        </div>
      </div>

      {/* Ambience */}
      <div className={styles.ambience}>
        <div className={`${styles.glow} ${styles.glow1}`} />
        <div className={`${styles.glow} ${styles.glow2}`} />
      </div>
      <div className={styles.sparkles} ref={sparklesRef} />

      {/* Card */}
      <div className={styles.scene}>
        <div className={styles.card} ref={cardRef}>
          <div className={styles.sweep} />
          <div className={styles.petalFall} ref={petalRef} />

          {/* Floral corners */}
          <svg className={`${styles.floral} ${styles.floralTl}`} viewBox="0 0 230 230" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#B8923C" strokeWidth="1">
              <circle cx="62" cy="62" r="46" fill="none"/>
              <circle cx="62" cy="62" r="30" strokeWidth="0.7"/>
              <circle cx="62" cy="62" r="15" strokeWidth="0.7"/>
              <path d="M62 16 C78 36 88 56 62 62 C36 56 46 36 62 16Z" fill="rgba(184,146,60,0.05)"/>
              <path d="M108 62 C88 78 68 88 62 62 C68 36 88 46 108 62Z" fill="rgba(184,146,60,0.05)"/>
              <path d="M62 108 C46 88 36 68 62 62 C88 68 78 88 62 108Z" fill="rgba(184,146,60,0.05)"/>
              <path d="M16 62 C36 46 56 36 62 62 C56 88 36 78 16 62Z" fill="rgba(184,146,60,0.05)"/>
              <path d="M150 20 Q172 36 168 62 Q150 50 145 26 Z" strokeWidth="0.8" fill="rgba(184,146,60,0.04)"/>
              <path d="M170 50 Q190 64 182 88 Q166 74 164 52 Z" strokeWidth="0.8" fill="rgba(184,146,60,0.04)"/>
              <path d="M120 12 Q140 22 138 44 Q124 36 118 16 Z" strokeWidth="0.8" fill="rgba(184,146,60,0.04)"/>
              <line x1="110" y1="70" x2="175" y2="20" strokeWidth="0.6"/>
              <line x1="95"  y1="58" x2="135" y2="12" strokeWidth="0.6"/>
              <line x1="125" y1="80" x2="185" y2="55" strokeWidth="0.6"/>
            </g>
          </svg>
          <svg className={`${styles.floral} ${styles.floralBr}`} viewBox="0 0 215 215" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#B8923C" strokeWidth="1">
              <circle cx="58" cy="58" r="42" fill="none"/>
              <circle cx="58" cy="58" r="27" strokeWidth="0.7"/>
              <path d="M58 18 C73 36 82 54 58 58 C34 54 43 36 58 18Z" fill="rgba(184,146,60,0.05)"/>
              <path d="M98 58 C82 73 62 82 58 58 C62 34 82 43 98 58Z" fill="rgba(184,146,60,0.05)"/>
              <path d="M58 98 C43 82 34 62 58 58 C82 62 73 82 58 98Z" fill="rgba(184,146,60,0.05)"/>
              <path d="M18 58 C34 43 54 34 58 58 C54 82 34 73 18 58Z" fill="rgba(184,146,60,0.05)"/>
              <path d="M140 30 Q162 44 156 70 Q140 56 136 34 Z" strokeWidth="0.8" fill="rgba(184,146,60,0.04)"/>
              <line x1="100" y1="65" x2="165" y2="28" strokeWidth="0.6"/>
              <line x1="115" y1="80" x2="175" y2="58" strokeWidth="0.6"/>
            </g>
          </svg>

          <div className={styles.content}>
            {/* Bismillah */}
            {showArabic && content.bismillah && (
              <div className={styles.bismillah}>بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
            )}
            {showArabic && content.verse && (
              <p style={{ direction: "rtl", fontFamily: "Amiri, serif", fontSize: "1rem", color: "var(--gold-deep)", margin: "0.5rem 0", opacity: 0.9 }}>
                {content.verse}
              </p>
            )}

            {/* Prayer */}
            <p className={styles.prayer}>
              « Ô Allah, bénis-nous, accorde-nous<br/>
              <span className={styles.accent}>Ta bénédiction</span> et unis-nous dans le bien. »
            </p>

            {/* Ornament */}
            <div className={styles.orn}>
              <span className={styles.ornLine} />
              <svg viewBox="0 0 24 24" fill="none" width={26} height={26}>
                <path d="M12 2 C14 7 17 9 12 12 C7 9 10 7 12 2Z M12 22 C10 17 7 15 12 12 C17 15 14 17 12 22Z M2 12 C7 14 9 17 12 12 C9 7 7 10 2 12Z M22 12 C17 14 15 17 12 12 C15 7 17 10 22 12Z" fill="#B8923C"/>
              </svg>
              <span className={`${styles.ornLine} ${styles.ornLineR}`} />
            </div>

            {/* Family */}
            <div className={styles.familyName}>{content.hosts}</div>
            <p className={styles.familySub}>
              {content.invitationLine}
            </p>

            {/* Names */}
            <div className={styles.names}>
              <span className={styles.name}>{content.names[0]}</span>
              <span className={styles.amp}>{content.namesSeparator}</span>
              <span className={styles.name}>{content.names[1]}</span>
            </div>

            {/* Emotion */}
            <p className={styles.emotion}>
              C&apos;est avec beaucoup d&apos;émotion et de gratitude que nous souhaitons
              partager avec vous <span className={styles.accent}>ce moment précieux</span> de notre vie.
              Votre présence rendra cette célébration encore plus belle et inoubliable.
            </p>

            {/* Date plaque */}
            <div className={styles.plaque}>
              <div className={styles.dateRow}>
                <span className={styles.dateNum}>{day}</span>
                <span className={styles.dateSep} />
                <span className={styles.dateNum}>{month.slice(0, 3)}</span>
                <span className={styles.dateSep} />
                <span className={styles.dateNum}>{year}</span>
              </div>
              <div className={styles.month}>{content.dayLabel} · {month}</div>
              <p className={styles.timeVenue}>
                à partir de{" "}
                <strong style={{ color: "var(--gold-deep)", fontWeight: 500 }}>
                  {content.time.replace(":", "h")}
                </strong>
                <br/>
                <span className={styles.venue}>{content.venue}</span>
                {content.venueSub && <><br/>{content.venueSub}</>}
              </p>
            </div>

            {/* Countdown */}
            {showCountdown && !cdDone && (
              <div className={styles.countdown}>
                {[
                  { val: countdown.j, lab: "Jours" },
                  { val: countdown.h, lab: "Heures" },
                  { val: countdown.m, lab: "Min" },
                  { val: countdown.s, lab: "Sec" },
                ].map(({ val, lab }) => (
                  <div key={lab} className={styles.cdBox}>
                    <span className={styles.cdNum}>{val}</span>
                    <span className={styles.cdLab}>{lab}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Notice */}
            {showNote && content.note && (
              <div className={styles.notice}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M3 3l18 18M10.5 5.6A2 2 0 0114 7v0M21 16V8a2 2 0 00-2-2h-3.2M16 12a4 4 0 01-4 4M8 8l-3 0a2 2 0 00-2 2v8a2 2 0 002 2h13"/>
                </svg>
                {content.note}
              </div>
            )}

            {/* Closing */}
            <div className={styles.closing}>{content.closing}</div>

            {/* CTA */}
            <div className={styles.cta}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveDate}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                Enregistrer la date
              </button>
              {content.mapsUrl && (
                <a className={`${styles.btn} ${styles.btnGhost}`} href={content.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z"/>
                    <circle cx="12" cy="10" r="2.5"/>
                  </svg>
                  Itinéraire
                </a>
              )}
              {showRsvp && invitationId && (
                <a className={`${styles.btn} ${styles.btnGhost}`} href={`#rsvp`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
                  </svg>
                  Confirmer ma présence
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`${styles.toast} ${toast ? styles.toastVisible : ""}`}>
        {toast}
      </div>
    </div>
  );
}
