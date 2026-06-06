"use client";

import { useState } from "react";

const SPARKS = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const r = 60 + (i % 3) * 28;
  return { sx: Math.round(Math.cos(angle) * r), sy: Math.round(Math.sin(angle) * r) };
});

interface Props {
  invitationId: string;
  token?: string;
}

export function PublicRsvpForm({ invitationId, token }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"attending" | "declined" | null>(null);
  const [partySize, setPartySize] = useState(1);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  function resetForm() {
    setName(""); setStatus(null); setPartySize(1); setMessage(""); setState("idle");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!status) return;
    setState("loading");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId, name, status,
          partySize: status === "attending" ? partySize : undefined,
          message: message || undefined,
          ...(token ? { token } : {}),
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  const firstName = name.split(" ")[0] || name;
  const doneMsg = status === "attending"
    ? `${firstName}, votre présence a bien été confirmée. À très bientôt !`
    : `${firstName}, votre réponse a bien été enregistrée. Vous nous manquerez.`;

  return (
    <>
      {/* Floating CTA */}
      <button
        onClick={() => { resetForm(); setOpen(true); }}
        style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 900, padding: "14px 32px",
          background: "linear-gradient(135deg, var(--gold-vivid), var(--accent))",
          border: "none", borderRadius: 100, cursor: "pointer",
          fontFamily: "var(--font-title)", fontSize: 13, letterSpacing: ".16em",
          textTransform: "uppercase", color: "#2a2008",
          boxShadow: "0 8px 32px rgba(184,146,60,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        Confirmer ma présence
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={e => e.target === e.currentTarget && setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(10,8,4,0.85)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem", overflowY: "auto",
          }}
        >
          <div style={{ width: "100%", maxWidth: 440 }}>
            <div className="rsvp-card2">

              {state === "done" ? (
                /* ── Done state ── */
                <div className="rsvp-done2">
                  {/* Sparks */}
                  {SPARKS.map((s, i) => (
                    <span
                      key={i}
                      className="done-spark2"
                      style={{
                        background: i % 2 ? "var(--gold-vivid)" : "var(--gold-light)",
                        "--sx": `${s.sx}px`,
                        "--sy": `${s.sy}px`,
                      } as React.CSSProperties}
                    />
                  ))}
                  <div className="done-check2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3>Merci !</h3>
                  <p>{doneMsg}</p>
                  <button className="btn btn-ghost btn-sm close2" onClick={() => setOpen(false)}>
                    Fermer
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <>
                  <div className="rsvp-eb2">RSVP</div>
                  <div className="rsvp-title2">Confirmez votre présence</div>
                  <div className="rsvp-sub2">Merci de nous faire part de votre réponse.</div>

                  <form onSubmit={submit}>
                    <div className="rsvp-fld">
                      <label>Votre nom</label>
                      <input
                        className="rsvp-inp"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required minLength={2} maxLength={80}
                        placeholder="Prénom et nom"
                      />
                    </div>

                    <div className="rsvp-fld">
                      <label>Serez-vous présent·e ?</label>
                      <div className="rsvp-choice2">
                        <button
                          type="button"
                          onClick={() => setStatus("attending")}
                          className={`rsvp-opt2 yes${status === "attending" ? " sel" : ""}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                          Je serai présent·e
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus("declined")}
                          className={`rsvp-opt2 no${status === "declined" ? " sel" : ""}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                          Je ne pourrai pas
                        </button>
                      </div>
                    </div>

                    {/* Party size — shown only when attending */}
                    <div className={`rsvp-party2${status === "attending" ? " show" : ""}`}>
                      <div className="stepper-row2">
                        <span className="sl">Nombre d&apos;invités</span>
                        <div className="stepper-ctl2">
                          <button type="button" onClick={() => setPartySize(p => Math.max(1, p - 1))}>−</button>
                          <span className="nb">{partySize}</span>
                          <button type="button" onClick={() => setPartySize(p => Math.min(20, p + 1))}>+</button>
                        </div>
                      </div>
                    </div>

                    <div className="rsvp-fld" style={{ marginTop: 16 }}>
                      <label>Un mot (optionnel)</label>
                      <textarea
                        className="rsvp-ta2"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        maxLength={500}
                        placeholder="Tous mes vœux de bonheur…"
                      />
                    </div>

                    {state === "error" && (
                      <p style={{ color: "#e07070", fontSize: ".9rem", fontFamily: "var(--font-title)", marginBottom: "0.5rem" }}>
                        Une erreur est survenue — réessayez.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={state === "loading" || !status}
                      className={`btn btn-gold rsvp-sub-btn${state === "loading" ? " loading" : ""}`}
                    >
                      <span className="slbl">
                        Envoyer ma réponse
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                      </span>
                      <span className="sspin"><i /></span>
                    </button>

                    <div className="rsvp-foot2">Vos coordonnées restent privées</div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
