"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  invitationId: string;
  initialToken: string | null;
  initialClientName: string | null;
  initialClientEmail: string | null;
  baseUrl: string;
  eventTitle: string;
}

export function ShareWithClientButton({
  invitationId,
  initialToken,
  initialClientName,
  initialClientEmail,
  baseUrl,
  eventTitle,
}: Props) {
  const [open, setOpen]               = useState(false);
  const [token, setToken]             = useState(initialToken);
  const [clientName, setClientName]   = useState(initialClientName ?? "");
  const [clientEmail, setClientEmail] = useState(initialClientEmail ?? "");
  const [loading, setLoading]         = useState(false);
  const [copied, setCopied]           = useState(false);
  const [emailSent, setEmailSent]     = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const clientUrl = token ? `${baseUrl}/client/${token}` : null;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => nameRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function generate(regenerate = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/client-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: clientName || undefined, clientEmail: clientEmail || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setToken(data.clientAccessToken);
      if (regenerate) setCopied(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function saveInfo() {
    if (!token) return;
    try {
      await fetch(`/api/invitations/${invitationId}/client-token`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: clientName || undefined, clientEmail: clientEmail || undefined }),
      });
    } catch { /* silent — non-blocking */ }
  }

  async function copy() {
    if (!clientUrl) return;
    await navigator.clipboard.writeText(clientUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function sendEmail() {
    if (!clientUrl || !clientEmail) return;
    setEmailLoading(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: clientEmail,
          url: clientUrl,
          type: "client-portal",
          clientName: clientName || undefined,
          eventTitle,
        }),
      });
      if (!res.ok) throw new Error("Erreur d'envoi");
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch {
      setError("Email non envoyé. Vérifiez la configuration Resend.");
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-ghost btn-sm"
        style={{ borderColor: "rgba(184,146,60,0.4)", color: "var(--gold)" }}
      >
        Espace client →
      </button>

      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(10,8,4,0.82)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div style={{
            background: "linear-gradient(160deg, #1e1809, #14100a)",
            border: "1px solid rgba(184,146,60,0.25)",
            borderRadius: 16,
            padding: "2rem",
            width: "100%",
            maxWidth: 480,
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.6rem" }}>
              <div>
                <p style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
                  Portail client
                </p>
                <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.4rem", color: "var(--ivory)", fontWeight: 400 }}>
                  Partager avec le client
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 4, lineHeight: 1.5 }}>
                  Le client accède à ses stats RSVP sans login.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 20, padding: "0 0 0 12px", lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1.4rem" }}>
              <div>
                <label style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 6 }}>
                  Nom du client
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  onBlur={token ? saveInfo : undefined}
                  placeholder="Sara & Adam"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid var(--hair)",
                    borderRadius: 8, padding: "0.7rem 1rem", color: "var(--ivory)",
                    fontFamily: "var(--font-title)", fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 6 }}>
                  Email du client <span style={{ opacity: .5 }}>(optionnel)</span>
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  onBlur={token ? saveInfo : undefined}
                  placeholder="sara@example.com"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid var(--hair)",
                    borderRadius: 8, padding: "0.7rem 1rem", color: "var(--ivory)",
                    fontFamily: "var(--font-title)", fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* URL box */}
            {clientUrl ? (
              <div style={{
                background: "rgba(184,146,60,0.06)", border: "1px solid rgba(184,146,60,0.2)",
                borderRadius: 10, padding: "1rem", marginBottom: "1.2rem",
              }}>
                <p style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 6 }}>
                  Lien espace client
                </p>
                <p style={{
                  fontFamily: "var(--font-title)", fontSize: 12, color: "var(--gold)",
                  wordBreak: "break-all", lineHeight: 1.5, marginBottom: "0.8rem",
                }}>
                  {clientUrl}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={copy} className="btn btn-gold btn-sm" style={{ flex: 1 }}>
                    {copied ? "Copié ✓" : "Copier le lien"}
                  </button>
                  {clientEmail && (
                    <button onClick={sendEmail} disabled={emailLoading} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                      {emailLoading ? "Envoi…" : emailSent ? "Envoyé ✓" : "Envoyer par email"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                border: "1px dashed var(--hair)", borderRadius: 10, padding: "1rem",
                marginBottom: "1.2rem", textAlign: "center",
              }}>
                <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: "0.8rem" }}>
                  Aucun lien généré pour l&apos;instant.
                </p>
                <button
                  onClick={() => generate(false)}
                  disabled={loading}
                  className="btn btn-gold btn-sm"
                >
                  {loading ? "Génération…" : "Générer le lien client"}
                </button>
              </div>
            )}

            {/* Regenerate */}
            {clientUrl && (
              <div style={{ borderTop: "1px solid var(--hair)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 12, color: "var(--text-faint)" }}>
                  Regénérer invalide l&apos;ancien lien.
                </p>
                <button
                  onClick={() => generate(true)}
                  disabled={loading}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-faint)" }}
                >
                  {loading ? "…" : "Regénérer"}
                </button>
              </div>
            )}

            {error && (
              <p style={{ marginTop: "0.8rem", fontSize: 12, color: "#e07070", textAlign: "center" }}>{error}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
