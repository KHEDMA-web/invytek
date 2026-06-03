"use client";

import { useState } from "react";

interface Props {
  invitationId: string;
}

export function PublicRsvpForm({ invitationId }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"attending" | "declined">("attending");
  const [partySize, setPartySize] = useState(1);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, name, status, partySize, message: message || undefined }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(184,146,60,0.25)",
    borderRadius: 8, outline: "none", color: "#FCFAF5",
    fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", boxSizing: "border-box",
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 900, padding: "14px 32px",
          background: "linear-gradient(135deg, #D4AF61, #B8923C)",
          border: "none", borderRadius: 100, cursor: "pointer",
          fontFamily: "'Marcellus', serif", fontSize: 13, letterSpacing: ".16em",
          textTransform: "uppercase", color: "#2a2008",
          boxShadow: "0 8px 32px rgba(184,146,60,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        Confirmer ma présence
      </button>

      {/* Overlay + Modal */}
      {open && (
        <div
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(10,8,4,0.85)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          }}
        >
          <div style={{
            width: "100%", maxWidth: 440,
            background: "linear-gradient(160deg, #1e1810, #14100a)",
            border: "1px solid rgba(184,146,60,0.25)", borderRadius: 16,
            padding: "2rem", boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          }}>

            {state === "done" ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: 48, marginBottom: "1rem" }}>✨</div>
                <p style={{ fontFamily: "'Marcellus', serif", fontSize: "1.4rem", color: "#FCFAF5", marginBottom: "0.5rem" }}>
                  Merci {name} !
                </p>
                <p style={{ color: "rgba(243,233,210,0.5)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                  {status === "attending" ? "Votre présence a bien été confirmée." : "Votre réponse a bien été enregistrée."}
                </p>
                <button onClick={() => setOpen(false)} className="btn btn-gold btn-sm">Fermer</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <p style={{ fontFamily: "'Marcellus', serif", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#B8923C" }}>
                    RSVP
                  </p>
                  <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(243,233,210,0.4)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
                </div>

                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "'Marcellus', serif", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(243,233,210,0.5)", marginBottom: 8 }}>
                      Votre nom
                    </label>
                    <input value={name} onChange={e => setName(e.target.value)} required minLength={2} placeholder="Prénom Nom" style={inp} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: "'Marcellus', serif", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(243,233,210,0.5)", marginBottom: 10 }}>
                      Votre réponse
                    </label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {(["attending", "declined"] as const).map(s => (
                        <button key={s} type="button" onClick={() => setStatus(s)} style={{
                          flex: 1, padding: "0.75rem",
                          borderRadius: 8, cursor: "pointer",
                          fontFamily: "'Marcellus', serif", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase",
                          background: status === s
                            ? s === "attending" ? "linear-gradient(135deg, #D4AF61, #B8923C)" : "rgba(200,80,80,0.2)"
                            : "rgba(255,255,255,0.04)",
                          color: status === s
                            ? s === "attending" ? "#2a2008" : "#e07070"
                            : "rgba(243,233,210,0.5)",
                          border: status === s
                            ? s === "attending" ? "none" : "1px solid rgba(200,80,80,0.4)"
                            : "1px solid rgba(184,146,60,0.15)",
                        }}>
                          {s === "attending" ? "Je serai présent(e)" : "Je ne pourrai pas"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {status === "attending" && (
                    <div>
                      <label style={{ display: "block", fontFamily: "'Marcellus', serif", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(243,233,210,0.5)", marginBottom: 8 }}>
                        Nombre de personnes
                      </label>
                      <input type="number" min={1} max={10} value={partySize} onChange={e => setPartySize(Number(e.target.value))} style={{ ...inp, width: 100 }} />
                    </div>
                  )}

                  <div>
                    <label style={{ display: "block", fontFamily: "'Marcellus', serif", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(243,233,210,0.5)", marginBottom: 8 }}>
                      Message (optionnel)
                    </label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} placeholder="Un mot pour les mariés…" style={{ ...inp, resize: "vertical" }} />
                  </div>

                  {state === "error" && (
                    <p style={{ color: "#e07070", fontSize: "0.9rem", fontFamily: "'Marcellus', serif" }}>Une erreur est survenue — réessayez.</p>
                  )}

                  <button type="submit" disabled={state === "loading"} className="btn btn-gold" style={{ width: "100%" }}>
                    {state === "loading" ? "Envoi…" : "Confirmer"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
