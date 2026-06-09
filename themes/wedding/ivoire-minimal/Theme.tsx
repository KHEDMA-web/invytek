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

export default function IvoireMinimalTheme({ content, options = {}, invitationId, guestName, guestToken, alreadyResponded = false }: Props) {
  const { showCountdown = true, showRsvp = true, showArabic = false, showNote = true, showQrCode = false } = options;

  const [countdown, setCountdown] = useState({ j: "––", h: "––", m: "––", s: "––" });
  const [cdDone, setCdDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [rsvpName, setRsvpName] = useState(guestName ?? "");
  const [rsvpAttending, setRsvpAttending] = useState<"attending" | "declined" | null>(null);
  const [rsvpSize, setRsvpSize] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  useTilt(cardRef);

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
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [content.date, content.time, showCountdown]);

  useEffect(() => {
    const sc = sparklesRef.current; if (!sc) return;
    const dots: HTMLDivElement[] = [];
    for (let i = 0; i < 35; i++) {
      const sp = document.createElement("div"); sp.className = styles.sp;
      sp.style.left = Math.random() * 100 + "vw";
      const s = Math.random() * 2 + 1; sp.style.width = sp.style.height = s + "px";
      sp.style.animationDuration = (Math.random() * 15 + 10) + "s";
      sp.style.animationDelay = (Math.random() * 14) + "s";
      sc.appendChild(sp); dots.push(sp);
    }
    return () => dots.forEach(d => d.remove());
  }, []);

  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2600); return () => clearTimeout(id); }, [toast]);

  async function submitRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!invitationId || !rsvpAttending || rsvpName.trim().length < 2) return;
    setRsvpLoading(true); setRsvpError(null);
    try {
      const res = await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId, name: rsvpName.trim(), status: rsvpAttending, partySize: rsvpSize, message: rsvpMessage.trim() || undefined, token: guestToken }) });
      if (!res.ok) throw new Error();
      setRsvpSent(true);
    } catch { setRsvpError("Une erreur est survenue. Réessayez."); }
    finally { setRsvpLoading(false); }
  }

  function saveDate() {
    const [y, mo, d] = content.date.split("-"); const [hh, mm] = content.time.split(":");
    const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Invytek//FR","BEGIN:VEVENT",`DTSTART:${y}${mo}${d}T${hh}${mm}00`,`SUMMARY:Mariage de ${content.names[0]} & ${content.names[1]}`,`LOCATION:${content.venue}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "mariage.ics"; a.click();
    setToast("Date enregistrée");
  }

  const [day, month, year] = (() => { const d = new Date(content.date + "T12:00:00"); return [d.getDate().toString().padStart(2, "0"), d.toLocaleDateString("fr-FR", { month: "long" }).toUpperCase(), d.getFullYear().toString()]; })();
  const monogram = `${content.initials[0]} · ${content.initials[1]}`;
  const orn = <><span className={styles.ornLine} /><svg viewBox="0 0 24 24" fill="none" width={20} height={20}><path d="M12 3C13 7 16 9 12 12 C8 9 11 7 12 3Z M12 21C11 17 8 15 12 12 C16 15 13 17 12 21Z M3 12C7 13 9 16 12 12 C9 8 7 11 3 12Z M21 12C17 13 15 16 12 12 C15 8 17 11 21 12Z" fill="#B8923C"/></svg><span className={`${styles.ornLine} ${styles.ornLineR}`} /></>;

  return (
    <div className={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Marcellus&family=Cormorant+Garamond:wght@400;500&family=Amiri:wght@400&display=swap" rel="stylesheet" />
      <div className={`${styles.glow} ${styles.glowTop}`} />
      <div className={`${styles.glow} ${styles.glowBot}`} />
      <div className={styles.sparkles} ref={sparklesRef} />

      <div className={styles.scene}>
        <div className={styles.card} ref={cardRef}>
          {/* Medallion */}
          <div className={styles.medallion}>
            <div className={`${styles.medallionRing}`} />
            <div className={`${styles.medallionRing} ${styles.medallionRingInner}`} />
            <span className={styles.medallionMg}>{monogram}</span>
            <div className={styles.medallionDot} />
          </div>

          {/* Guest badge */}
          {guestName && (
            <div className={styles.rev0} style={{ marginBottom: "0.8rem" }}>
              <p style={{ fontFamily: "Marcellus, serif", fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#B8923C" }}>À l&apos;attention de</p>
              <p style={{ fontFamily: "Pinyon Script, cursive", fontSize: "1.6rem", color: "rgba(247,241,230,0.9)", lineHeight: 1.2 }}>{guestName}</p>
            </div>
          )}

          {showArabic && content.bismillah && <div className={`${styles.bismillah} ${styles.rev0}`}>بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>}

          <p className={`${styles.kicker} ${styles.rev0}`}>Cérémonie de Mariage</p>

          <div className={`${styles.orn} ${styles.rev1}`}>{orn}</div>

          <div className={`${styles.familyName} ${styles.rev1}`}>{content.hosts}</div>
          <p className={`${styles.familySub} ${styles.rev1}`}>{content.invitationLine}</p>

          <div className={`${styles.names} ${styles.rev2}`}>
            <span className={styles.name}>{content.names[0]}</span>
            <span className={styles.amp}>{content.namesSeparator}</span>
            <span className={styles.name}>{content.names[1]}</span>
          </div>

          <div className={`${styles.orn} ${styles.rev3}`}>{orn}</div>

          <div className={`${styles.plaque} ${styles.rev3}`}>
            <div className={styles.dateRow}>
              <span className={styles.dateNum}>{day}</span>
              <span className={styles.dateSep} />
              <span className={styles.dateNum}>{month.slice(0, 3)}</span>
              <span className={styles.dateSep} />
              <span className={styles.dateNum}>{year}</span>
            </div>
            <div className={styles.dateMonth}>{content.dayLabel} · {month}</div>
            <p className={styles.timeVenue}>
              à partir de <strong style={{ color: "#D4AF61" }}>{content.time.replace(":", "h")}</strong><br/>
              <span className={styles.venueName}>{content.venue}</span>
              {content.venueSub && <><br/>{content.venueSub}</>}
            </p>
          </div>

          {showCountdown && !cdDone && (
            <div className={`${styles.countdown} ${styles.rev4}`}>
              {[{ val: countdown.j, lab: "Jours" },{ val: countdown.h, lab: "Heures" },{ val: countdown.m, lab: "Min" },{ val: countdown.s, lab: "Sec" }].map(({ val, lab }) => (
                <div key={lab} className={styles.cdBox}><span className={styles.cdNum}>{val}</span><span className={styles.cdLab}>{lab}</span></div>
              ))}
            </div>
          )}

          {showNote && content.note && (
            <div className={`${styles.notice} ${styles.rev5}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              {content.note}
            </div>
          )}

          <div className={`${styles.closing} ${styles.rev5}`}>{content.closing}</div>

          <div className={`${styles.cta} ${styles.rev6}`}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveDate}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width={13} height={13}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              Enregistrer la date
            </button>
            {content.mapsUrl && (
              <a className={`${styles.btn} ${styles.btnGhost}`} href={content.mapsUrl} target="_blank" rel="noopener noreferrer">Itinéraire</a>
            )}
            {showRsvp && invitationId && <a className={`${styles.btn} ${styles.btnGhost}`} href="#rsvp">Confirmer ma présence</a>}
          </div>

          {showQrCode && guestToken && (
            <div style={{ textAlign: "center", margin: "1.8rem 0 0", padding: "1.5rem 1rem", borderTop: "1px solid rgba(184,146,60,0.15)" }}>
              <p style={{ fontFamily: "Marcellus, serif", fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#B8923C", marginBottom: "1rem", opacity: .8 }}>QR code d&apos;entrée</p>
              <div style={{ display: "inline-block", background: "#F7F1E6", padding: 12, borderRadius: 10 }}>
                <QRCodeSVG value={typeof window !== "undefined" ? window.location.href : ""} size={148} fgColor="#B8923C" bgColor="#F7F1E6" level="M" />
              </div>
            </div>
          )}

          {showRsvp && invitationId && (
            <section className={styles.rsvp} id="rsvp">
              <div className={styles.orn} style={{ marginTop: "1.6rem" }}>{orn}</div>
              <h2 className={styles.rsvpTitle}>Confirmez votre présence</h2>
              {rsvpSent || alreadyResponded ? (
                <div className={styles.rsvpDone}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#B8923C" strokeWidth="1.8" strokeLinecap="round" width={32} height={32}><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
                  <p>{alreadyResponded && !rsvpSent ? <>Vous avez déjà répondu, <strong>{guestName}</strong>. Merci !</> : <>Merci <strong>{rsvpName}</strong> ! Votre réponse a été enregistrée.</>}</p>
                </div>
              ) : (
                <form className={styles.rsvpForm} onSubmit={submitRsvp}>
                  <input className={styles.rsvpInput} type="text" placeholder="Votre nom complet" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required minLength={2} maxLength={80} />
                  <div className={styles.rsvpToggle}>
                    <button type="button" className={`${styles.rsvpToggleBtn} ${rsvpAttending === "attending" ? styles.rsvpToggleActive : ""}`} onClick={() => setRsvpAttending("attending")}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width={13} height={13}><path d="M20 6L9 17l-5-5"/></svg> Je serai là
                    </button>
                    <button type="button" className={`${styles.rsvpToggleBtn} ${rsvpAttending === "declined" ? styles.rsvpToggleDeclined : ""}`} onClick={() => setRsvpAttending("declined")}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width={13} height={13}><path d="M18 6L6 18M6 6l12 12"/></svg> Je ne pourrai pas
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

      <div className={`${styles.toast} ${toast ? styles.toastVisible : ""}`}>{toast}</div>
    </div>
  );
}
