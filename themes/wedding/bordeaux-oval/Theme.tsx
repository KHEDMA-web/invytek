"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";
import { useTilt } from "@/hooks/useThemeEffects";
import styles from "./Theme.module.css";

interface Props {
  content: WeddingContent;
  options?: Partial<WeddingOptions>;
  invitationId?: string;
  guestName?: string;
  guestToken?: string;
  alreadyResponded?: boolean;
}

export default function BordeauxOvalTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const {
    showCountdown = true,
    showArabic = true,
    showNote = true,
    showRsvp = true,
    showQrCode = false,
  } = options;

  const [opened, setOpened] = useState(false);
  const [countdown, setCountdown] = useState({ j: "––", h: "––", m: "––", s: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // RSVP
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);
  const petalRef = useRef<HTMLDivElement>(null);
  useTilt(cardRef);

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
      setCountdown({ j: String(j), h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0") });
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
    for (let i = 0; i < 55; i++) {
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

  // Petals
  useEffect(() => {
    const pf = petalRef.current;
    if (!pf) return;
    const petals: HTMLDivElement[] = [];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("div");
      p.className = styles.petal;
      p.style.left = Math.random() * 100 + "%";
      const sz = Math.random() * 7 + 7;
      p.style.width = sz + "px"; p.style.height = sz + "px";
      p.style.animationDuration = (Math.random() * 6 + 7) + "s";
      p.style.animationDelay = (Math.random() * 9) + "s";
      p.style.opacity = (Math.random() * 0.4 + 0.4).toFixed(2);
      pf.appendChild(p);
      petals.push(p);
    }
    return () => petals.forEach(p => p.remove());
  }, []);

  // Toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  async function submitRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!invitationId || !rsvpAttending || rsvpName.trim().length < 2) return;
    setRsvpLoading(true); setRsvpError(null);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, name: rsvpName.trim(), status: rsvpAttending, partySize: rsvpSize, message: rsvpMessage.trim() || undefined, token: guestToken }),
      });
      if (!res.ok) throw new Error();
      setRsvpSent(true);
    } catch { setRsvpError("Une erreur est survenue. Réessayez."); }
    finally { setRsvpLoading(false); }
  }

  function saveDate() {
    const [y, mo, d] = content.date.split("-");
    const [hh, mm] = content.time.split(":");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Invytek//FR", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `DTSTART:${y}${mo}${d}T${hh}${mm}00`,
      `SUMMARY:Mariage de ${content.names[0]} avec ${content.names[1]}`,
      `LOCATION:${content.venue}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `mariage-${content.names[0].toLowerCase()}.ics`;
    a.click();
    setToast("Date enregistrée dans votre calendrier");
  }

  const [day, month, year] = (() => {
    const d = new Date(content.date + "T12:00:00");
    return [d.getDate().toString().padStart(2, "0"), d.toLocaleDateString("fr-FR", { month: "long" }).toUpperCase(), d.getFullYear().toString()];
  })();

  const ornSvg = (
    <svg viewBox="0 0 24 24" fill="none" width={24} height={24}>
      <path d="M12 3C13 7 16 9 12 12 C8 9 11 7 12 3Z M12 21C11 17 8 15 12 12 C16 15 13 17 12 21Z M3 12C7 13 9 16 12 12 C9 8 7 11 3 12Z M21 12C17 13 15 16 12 12 C15 8 17 11 21 12Z" fill="#8A1726"/>
    </svg>
  );

  return (
    <div className={styles.root}>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Pinyon+Script&family=Marcellus&family=Amiri:wght@400;700&display=swap" rel="stylesheet" />

      {/* Envelope */}
      <div className={`${styles.envelope} ${opened ? styles.envelopeOpened : ""}`} onClick={() => setOpened(true)}>
        <div className={styles.env}>
          <div className={styles.envBody} />
          <div className={styles.envLetter}>
            {showArabic && <span className={styles.envLetterAr}>بِسْمِ اللهِ</span>}
            <span className={styles.envLetterNm}>{content.names[0]} & {content.names[1]}</span>
            <span className={styles.envLetterSm}>Cérémonie de Mariage</span>
          </div>
          <div className={styles.envPocket} />
          <div className={styles.envBottom} />
          <div className={styles.envFlap} />
          <div className={styles.seal}>
            <svg viewBox="0 0 100 100" width={28} height={28}>
              <text x="50" y="55" textAnchor="middle" dominantBaseline="central" fontFamily="Marcellus,serif" fontSize="48" fill="#FDFAF6">{content.initials[0]}</text>
            </svg>
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
          <div className={styles.ovalFrame} />
          <div className={styles.sweep} />
          <div className={styles.petalFall} ref={petalRef} />

          {/* Floral corners */}
          <svg className={`${styles.floral} ${styles.floralTl}`} viewBox="0 0 230 230" fill="none">
            <g stroke="#8A1726" strokeWidth="1">
              <circle cx="62" cy="62" r="46" fill="none"/>
              <circle cx="62" cy="62" r="30" strokeWidth="0.7"/>
              <circle cx="62" cy="62" r="15" strokeWidth="0.7"/>
              <path d="M62 16 C78 36 88 56 62 62 C36 56 46 36 62 16Z" fill="rgba(138,23,38,0.05)"/>
              <path d="M108 62 C88 78 68 88 62 62 C68 36 88 46 108 62Z" fill="rgba(138,23,38,0.05)"/>
              <path d="M62 108 C46 88 36 68 62 62 C88 68 78 88 62 108Z" fill="rgba(138,23,38,0.05)"/>
              <path d="M16 62 C36 46 56 36 62 62 C56 88 36 78 16 62Z" fill="rgba(138,23,38,0.05)"/>
              <line x1="110" y1="70" x2="175" y2="20" strokeWidth="0.6"/>
              <line x1="95" y1="58" x2="135" y2="12" strokeWidth="0.6"/>
              <line x1="125" y1="80" x2="185" y2="55" strokeWidth="0.6"/>
            </g>
          </svg>
          <svg className={`${styles.floral} ${styles.floralBr}`} viewBox="0 0 215 215" fill="none">
            <g stroke="#8A1726" strokeWidth="1">
              <circle cx="58" cy="58" r="42" fill="none"/>
              <circle cx="58" cy="58" r="27" strokeWidth="0.7"/>
              <path d="M58 18 C73 36 82 54 58 58 C34 54 43 36 58 18Z" fill="rgba(138,23,38,0.05)"/>
              <path d="M98 58 C82 73 62 82 58 58 C62 34 82 43 98 58Z" fill="rgba(138,23,38,0.05)"/>
              <path d="M58 98 C43 82 34 62 58 58 C82 62 73 82 58 98Z" fill="rgba(138,23,38,0.05)"/>
              <path d="M18 58 C34 43 54 34 58 58 C54 82 34 73 18 58Z" fill="rgba(138,23,38,0.05)"/>
              <line x1="100" y1="65" x2="165" y2="28" strokeWidth="0.6"/>
              <line x1="115" y1="80" x2="175" y2="58" strokeWidth="0.6"/>
            </g>
          </svg>

          <div className={styles.content}>
            {/* Guest badge */}
            {guestName && (
              <div className={styles.guestBadge}>
                <span className={styles.guestBadgePre}>À l&apos;attention de</span>
                <span className={styles.guestBadgeName}>{guestName}</span>
              </div>
            )}

            {/* Bismillah */}
            {showArabic && content.bismillah && (
              <div className={styles.bismillah}>بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
            )}

            {/* Prayer */}
            <p className={styles.prayer}>
              « Ô Allah, bénis-nous, accorde-nous<br/>
              <span className={styles.accent}>Ta bénédiction</span> et unis-nous dans le bien. »
            </p>

            {/* Ornement */}
            <div className={styles.orn}>
              <span className={styles.ornLine} />
              {ornSvg}
              <span className={`${styles.ornLine} ${styles.ornLineR}`} />
            </div>

            {/* Famille */}
            <div className={styles.familyName}>{content.hosts}</div>
            <p className={styles.familySub}>{content.invitationLine}</p>

            {/* Noms */}
            <div className={styles.names}>
              <span className={styles.name}>{content.names[0]}</span>
              <span className={styles.amp}>{content.namesSeparator}</span>
              <span className={styles.name}>{content.names[1]}</span>
            </div>

            {/* Émotion */}
            <p className={styles.emotion}>
              C&apos;est avec beaucoup d&apos;émotion et de gratitude que nous souhaitons
              partager avec vous <span className={styles.accent}>ce moment précieux</span> de notre vie.
            </p>

            {/* Date */}
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
                à partir de <strong style={{ color: "#6B0F1D" }}>{content.time.replace(":", "h")}</strong><br/>
                <span className={styles.venue}>{content.venue}</span>
                {content.venueSub && <><br/>{content.venueSub}</>}
              </p>
            </div>

            {/* Countdown */}
            {showCountdown && !cdDone && (
              <div className={styles.countdown}>
                {[{ val: countdown.j, lab: "Jours" }, { val: countdown.h, lab: "Heures" }, { val: countdown.m, lab: "Min" }, { val: countdown.s, lab: "Sec" }].map(({ val, lab }) => (
                  <div key={lab} className={styles.cdBox}>
                    <span className={styles.cdNum}>{val}</span>
                    <span className={styles.cdLab}>{lab}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Note */}
            {showNote && content.note && (
              <div className={styles.notice}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                </svg>
                {content.note}
              </div>
            )}

            {/* Closing */}
            <div className={styles.closing}>{content.closing}</div>

            {/* CTA */}
            <div className={styles.cta}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveDate}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width={14} height={14}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                Enregistrer la date
              </button>
              {content.mapsUrl && (
                <a className={`${styles.btn} ${styles.btnGhost}`} href={content.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width={14} height={14}>
                    <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>
                  </svg>
                  Itinéraire
                </a>
              )}
              {showRsvp && invitationId && (
                <a className={`${styles.btn} ${styles.btnGhost}`} href="#rsvp">Confirmer ma présence</a>
              )}
            </div>

            {/* QR Code */}
            {showQrCode && guestToken && (
              <div style={{ textAlign: "center", margin: "2rem 0 0", padding: "1.8rem 1rem", borderTop: "1px solid rgba(138,23,38,0.15)" }}>
                <p style={{ fontFamily: "Marcellus, serif", fontSize: "0.7rem", letterSpacing: ".25em", textTransform: "uppercase", color: "#8A1726", marginBottom: "1.2rem", opacity: 0.8 }}>
                  Votre QR code d&apos;entrée
                </p>
                <div style={{ display: "inline-block", background: "#FDFAF6", padding: "14px", borderRadius: 12, boxShadow: "0 2px 18px rgba(138,23,38,0.15)" }}>
                  <QRCodeSVG value={typeof window !== "undefined" ? window.location.href : ""} size={160} fgColor="#8A1726" bgColor="#FDFAF6" level="M" />
                </div>
                <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "0.85rem", color: "#5C2A30", marginTop: "1rem", opacity: 0.75 }}>
                  Présentez ce code à l&apos;entrée
                </p>
              </div>
            )}

            {/* RSVP */}
            {showRsvp && invitationId && (
              <section className={styles.rsvp} id="rsvp">
                <div className={styles.orn} style={{ marginTop: "2rem" }}>
                  <span className={styles.ornLine} />{ornSvg}<span className={`${styles.ornLine} ${styles.ornLineR}`} />
                </div>
                <h2 className={styles.rsvpTitle}>Confirmez votre présence</h2>

                {rsvpSent || alreadyResponded ? (
                  <div className={styles.rsvpDone}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#8A1726" strokeWidth="1.8" strokeLinecap="round" width={36} height={36}>
                      <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
                    </svg>
                    <p>
                      {alreadyResponded && !rsvpSent
                        ? <>Vous avez déjà répondu,<br/><strong>{guestName ?? rsvpName}</strong>. Merci !</>
                        : <>Merci <strong>{rsvpName}</strong> !<br/>
                          {rsvpAttending === "attending" ? "Votre présence est confirmée." : "Votre réponse a été enregistrée."}</>
                      }
                    </p>
                  </div>
                ) : (
                  <form className={styles.rsvpForm} onSubmit={submitRsvp}>
                    <input className={styles.rsvpInput} type="text" placeholder="Votre nom complet" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} maxLength={80} />
                    <div className={styles.rsvpToggle}>
                      <button type="button" className={`${styles.rsvpToggleBtn} ${rsvpAttending === "attending" ? styles.rsvpToggleActive : ""}`} onClick={() => setRsvpAttending("attending")}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width={14} height={14}><path d="M20 6L9 17l-5-5"/></svg>
                        Je serai là
                      </button>
                      <button type="button" className={`${styles.rsvpToggleBtn} ${rsvpAttending === "declined" ? styles.rsvpToggleDeclined : ""}`} onClick={() => setRsvpAttending("declined")}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width={14} height={14}><path d="M18 6L6 18M6 6l12 12"/></svg>
                        Je ne pourrai pas
                      </button>
                    </div>
                    {rsvpAttending === "attending" && (
                      <div className={styles.rsvpSizeRow}>
                        <span className={styles.rsvpSizeLabel}>Nombre de personnes</span>
                        <div className={styles.rsvpSizeCtrl}>
                          <button type="button" className={styles.rsvpSizeBtn} onClick={() => setRsvpSize(s => Math.max(1, s - 1))}>−</button>
                          <span className={styles.rsvpSizeVal}>{rsvpSize}</span>
                          <button type="button" className={styles.rsvpSizeBtn} onClick={() => setRsvpSize(s => Math.min(20, s + 1))}>+</button>
                        </div>
                      </div>
                    )}
                    <textarea className={styles.rsvpTextarea} placeholder="Un message (optionnel)" value={rsvpMessage} onChange={e => setRsvpMessage(e.target.value)} maxLength={500} rows={3} />
                    {rsvpError && <p className={styles.rsvpError}>{rsvpError}</p>}
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary} ${styles.rsvpSubmit}`} disabled={!rsvpAttending || rsvpName.trim().length < 2 || rsvpLoading}>
                      {rsvpLoading ? "Envoi…" : "Confirmer →"}
                    </button>
                  </form>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`${styles.toast} ${toast ? styles.toastVisible : ""}`}>{toast}</div>
    </div>
  );
}
