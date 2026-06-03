"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WeddingContent, WeddingOptions } from "@/lib/schemas/wedding";

const inp: React.CSSProperties = {
  width: "100%", padding: "0.8rem 1rem",
  background: "rgba(255,255,255,0.04)", border: "1px solid var(--hair)",
  borderRadius: 8, color: "var(--ivory)", fontFamily: "var(--font-title)",
  fontSize: "0.95rem", outline: "none",
};
const label: React.CSSProperties = {
  fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".18em",
  textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 8,
};

interface Props {
  invitationId: string;
  content: WeddingContent;
  options: Partial<WeddingOptions>;
}

export function EditInvitationForm({ invitationId, content, options }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name1, setName1] = useState(content.names[0]);
  const [name2, setName2] = useState(content.names[1]);
  const [hosts, setHosts] = useState(content.hosts);
  const [invLine, setInvLine] = useState(content.invitationLine);
  const [date, setDate] = useState(content.date);
  const [time, setTime] = useState(content.time);
  const [venue, setVenue] = useState(content.venue);
  const [venueSub, setVenueSub] = useState(content.venueSub || "");
  const [note, setNote] = useState(content.note || "");
  const [closing, setClosing] = useState(content.closing);
  const [showCountdown, setShowCountdown] = useState(options.showCountdown ?? true);
  const [showRsvp, setShowRsvp] = useState(options.showRsvp ?? true);
  const [showArabic, setShowArabic] = useState(options.showArabic ?? true);
  const [webhookUrl, setWebhookUrl] = useState(options.webhookUrl ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const dateObj = new Date(date + "T12:00:00");
    const days = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

    const res = await fetch(`/api/invitations/${invitationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: {
          hosts, invitationLine: invLine,
          names: [name1, name2] as [string, string],
          namesSeparator: content.namesSeparator,
          bismillah: content.bismillah,
          date, time,
          dayLabel: days[dateObj.getDay()] || content.dayLabel,
          venue, venueSub: venueSub || undefined,
          note: note || undefined, closing,
          initials: [name1[0]?.toUpperCase() || "A", name2[0]?.toUpperCase() || "B"] as [string, string],
        },
        options: { showCountdown, showRsvp, showArabic, showNote: !!note, webhookUrl: webhookUrl || undefined },
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Erreur");
      setLoading(false);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push(`/dashboard/${invitationId}`), 900);
    router.refresh();
  }

  const tog: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" };
  const togBox = (on: boolean): React.CSSProperties => ({
    width: 42, height: 24, borderRadius: 12,
    background: on ? "var(--gold)" : "rgba(255,255,255,0.1)",
    position: "relative", transition: "background .2s", flexShrink: 0,
  });
  const togDot = (on: boolean): React.CSSProperties => ({
    position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18,
    borderRadius: "50%", background: "#fff", transition: "left .2s",
  });

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>

        <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={label}>Prénom 1</label><input style={inp} value={name1} onChange={e => setName1(e.target.value)} required /></div>
          <div><label style={label}>Prénom 2</label><input style={inp} value={name2} onChange={e => setName2(e.target.value)} required /></div>
        </div>

        <div><label style={label}>Familles / hôtes</label><input style={inp} value={hosts} onChange={e => setHosts(e.target.value)} required /></div>

        <div><label style={label}>Phrase d'invitation</label>
          <textarea style={{ ...inp, minHeight: 64, resize: "vertical" }} value={invLine} onChange={e => setInvLine(e.target.value)} />
        </div>

        <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={label}>Date</label><input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
          <div><label style={label}>Heure</label><input style={inp} type="time" value={time} onChange={e => setTime(e.target.value)} required /></div>
        </div>

        <div><label style={label}>Salle / lieu</label><input style={inp} value={venue} onChange={e => setVenue(e.target.value)} required /></div>
        <div><label style={label}>Précision lieu (optionnel)</label><input style={inp} value={venueSub} onChange={e => setVenueSub(e.target.value)} /></div>
        <div><label style={label}>Note (optionnel)</label><textarea style={{ ...inp, minHeight: 56, resize: "vertical" }} value={note} onChange={e => setNote(e.target.value)} /></div>
        <div><label style={label}>Formule de clôture</label><input style={inp} value={closing} onChange={e => setClosing(e.target.value)} /></div>

        {/* Options */}
        <div style={{ borderTop: "1px solid var(--hair)", paddingTop: "1.4rem", display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>Options</p>
          {([
            ["Compte à rebours", showCountdown, setShowCountdown],
            ["Formulaire RSVP", showRsvp, setShowRsvp],
            ["Section arabe (bismillah)", showArabic, setShowArabic],
          ] as [string, boolean, (v: boolean) => void][]).map(([lbl, val, set]) => (
            <label key={lbl} style={tog} onClick={() => set(!val)}>
              <div style={togBox(val)}><div style={togDot(val)} /></div>
              <span style={{ fontFamily: "var(--font-title)", fontSize: 13, color: "var(--text-soft)" }}>{lbl}</span>
            </label>
          ))}
        </div>

        {/* Webhook */}
        <div style={{ borderTop: "1px solid var(--hair)", paddingTop: "1.4rem" }}>
          <p style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Intégrations</p>
          <div>
            <label style={label}>URL Webhook RSVP (optionnel)</label>
            <input style={inp} value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://..." type="url" />
            <p style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>
              Reçoit un POST JSON à chaque confirmation RSVP.
            </p>
          </div>
        </div>

        {error && <p style={{ color: "#e07070", fontFamily: "var(--font-title)", fontSize: "0.9rem" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={loading || success} className="btn btn-gold" style={{ flex: 1 }}>
            {success ? "Enregistré ✓" : loading ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
          <a href={`/dashboard/${invitationId}`} className="btn btn-ghost" style={{ flex: 1, textAlign: "center" }}>
            Annuler
          </a>
        </div>
      </div>
    </form>
  );
}
