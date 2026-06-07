"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import DynamicTheme from "@/themes/dynamic/DynamicTheme";
import type { DynamicThemeSpec } from "@/lib/schemas/dynamicTheme";

const PREVIEW_MAP: Record<string, string> = { "gold-arch": "or-arche" };

const THEMES = [
  { id: "gold-arch",        name: "Or & Arche",              cat: "Mariage",       available: true },
  { id: "bordeaux-oval",    name: "Bordeaux & Ovale Floral", cat: "Mariage · RTL", available: true },
  { id: "ivoire-minimal",   name: "Ivoire Minimal",          cat: "Mariage",       available: true },
  { id: "confettis-or",     name: "Confettis d'Or",          cat: "Anniversaire",  available: true },
  { id: "anniv-neon",       name: "Neon Burst",              cat: "Anniversaire",  available: true },
  { id: "baby-shower",      name: "Baby Shower",             cat: "Bébé",          available: true },
  { id: "soiree-prestige",  name: "Soirée Prestige",         cat: "Business",      available: true },
  { id: "conference-tech",  name: "Conférence Tech",         cat: "Business",      available: true },
  { id: "inauguration",     name: "Inauguration",            cat: "Business",      available: true },
  { id: "blouse-lys",       name: "Blouse & Lys",            cat: "Médical",       available: true },
  { id: "congres-medical",  name: "Congrès Médical",         cat: "Médical",       available: true },
  { id: "sensibilisation",  name: "Sensibilisation",         cat: "Médical",       available: true },
];

const CATS = ["Tous", "Mariage", "Anniversaire", "Bébé", "Business", "Médical"];

const DEFAULTS: Record<string, { invLine: string; closing: string; name1Ph: string; name2Ph: string; hostsPh: string; notePh: string; name1Label: string; name2Label: string; hostsLabel: string; noteLabel: string; }> = {
  Mariage: {
    invLine: "ont l'immense plaisir de vous convier à la cérémonie de mariage de",
    closing: "Soyez les Bienvenus",
    name1Label: "Prénom marié(e) 1", name1Ph: "Adam",
    name2Label: "Prénom marié(e) 2", name2Ph: "Sara",
    hostsLabel: "Familles (ex: M. & Mme Benali)", hostsPh: "M. & Mme Benali",
    noteLabel: "Note (optionnel)", notePh: "Merci d'éviter les photos…",
  },
  "Mariage · RTL": {
    invLine: "يسرّهم دعوتكم لحضور حفل زفاف",
    closing: "أهلاً وسهلاً بكم",
    name1Label: "Prénom marié(e) 1", name1Ph: "أمين",
    name2Label: "Prénom marié(e) 2", name2Ph: "أميرة",
    hostsLabel: "Familles", hostsPh: "عائلة بن علي",
    noteLabel: "Note (optionnel)", notePh: "",
  },
  Anniversaire: {
    invLine: "fête ses 30 ans",
    closing: "Soyez les Bienvenus !",
    name1Label: "Prénom", name1Ph: "Sami",
    name2Label: "Texte fête (affiché sous le prénom)", name2Ph: "fête ses 30 ans",
    hostsLabel: "Organisé par", hostsPh: "La famille de Sami",
    noteLabel: "Note (optionnel)", notePh: "Merci d'apporter votre bonne humeur !",
  },
  Bébé: {
    invLine: "est heureuse de vous inviter à fêter",
    closing: "À très bientôt !",
    name1Label: "Prénom / nom du bébé", name1Ph: "Bébé Selma",
    name2Label: "Sous-titre (affiché sous le prénom)", name2Ph: "Bienvenue parmi nous !",
    hostsLabel: "Parents", hostsPh: "M. & Mme Martin",
    noteLabel: "Note (optionnel)", notePh: "Un petit cadeau suffit 🎀",
  },
  Business: {
    invLine: "Vous êtes cordialement invité(e) à",
    closing: "Nous vous attendons",
    name1Label: "Titre de l'événement", name1Ph: "Gala Annuel",
    name2Label: "Édition / Sous-titre", name2Ph: "Édition 2026",
    hostsLabel: "Organisation / Entreprise", hostsPh: "Atlas Corporation",
    noteLabel: "Code d'accès / Dress code (optionnel)", notePh: "Tenue de soirée requise",
  },
  Médical: {
    invLine: "a l'honneur de vous convier à",
    closing: "Nous comptons sur votre présence",
    name1Label: "Type d'événement", name1Ph: "Inauguration",
    name2Label: "Sous-titre / Service", name2Ph: "Pôle de Chirurgie Cardiaque",
    hostsLabel: "Institution / Dr.", hostsPh: "Clinique El Nour",
    noteLabel: "Tags / thèmes (séparés par virgule)", notePh: "Cardiologie, Chirurgie",
  },
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CreatePage() {
  return <Suspense><CreateForm /></Suspense>;
}

type Mode = null | "themes" | "custom" | "ai";

const CUSTOM_VARS = [
  { key: "--gold",         label: "Couleur principale", default: "#B8923C" },
  { key: "--gold-bright",  label: "Couleur vive",       default: "#D4AF61" },
  { key: "--bg-1",         label: "Fond",               default: "#14100a" },
  { key: "--ivory",        label: "Texte / Carte",      default: "#FCFAF5" },
] as const;

function CreateForm() {
  const router = useRouter();
  const params = useSearchParams();

  // Si on arrive depuis la galerie avec ?theme=X&custom={...}
  const customParam = params.get("custom");
  const initialCustom = customParam ? (JSON.parse(decodeURIComponent(customParam)) as Record<string, string>) : null;

  const [mode, setMode] = useState<Mode>(params.get("theme") ? (initialCustom ? "custom" : "themes") : null);
  const [step, setStep] = useState(initialCustom ? 2 : 1);
  const [catFilter, setCatFilter] = useState("Tous");
  const [themeId, setThemeId] = useState(params.get("theme") || "gold-arch");

  // Custom mode — color customizations
  const [customColors, setCustomColors] = useState<Record<string, string>>(
    () => initialCustom ?? Object.fromEntries(CUSTOM_VARS.map(v => [v.key, v.default]))
  );

  // AI mode
  const [aiDesc, setAiDesc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [aiLayoutSpec, setAiLayoutSpec] = useState<Record<string, unknown> | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiImagePreview, setAiImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "ai") return;
    fetch("/api/credits").then(r => r.json()).then((d: { credits: number }) => setUserCredits(d.credits));
  }, [mode]);

  async function handleImageFile(file: File) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });
    URL.revokeObjectURL(url);
    const maxDim = 800;
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
      else { width = Math.round(width * maxDim / height); height = maxDim; }
    }
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
    setAiImagePreview(dataUrl);
    setAiImage(dataUrl.split(",")[1]);
  }

  const theme = THEMES.find(t => t.id === themeId)!;
  const cat = theme?.cat || "Mariage";
  const d = DEFAULTS[cat] || DEFAULTS["Mariage"];
  const isWedding = cat === "Mariage" || cat === "Mariage · RTL";
  const isEvent = cat === "Business" || cat === "Médical";

  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [hosts, setHosts] = useState("");
  const [invLine, setInvLine] = useState(d.invLine);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("15:00");
  const [dayLabel, setDayLabel] = useState("Samedi");
  const [venue, setVenue] = useState("");
  const [venueSub, setVenueSub] = useState("");
  const [closing, setClosing] = useState(d.closing);
  const [note, setNote] = useState("");
  const [bismillah, setBismillah] = useState(true);
  const [showArabic, setShowArabic] = useState(true);
  const [showCountdown, setShowCountdown] = useState(true);
  const [showRsvp, setShowRsvp] = useState(true);

  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nd = DEFAULTS[cat] || DEFAULTS["Mariage"];
    setInvLine(nd.invLine);
    setClosing(nd.closing);
    setBismillah(isWedding);
    setShowArabic(isWedding);
    setName1(""); setName2(""); setHosts("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat]);

  useEffect(() => {
    if (!name1) return;
    const year = date ? new Date(date).getFullYear() : new Date().getFullYear();
    if (isWedding && name2) {
      setSlug(slugify(`${name1}-${name2}-${year}`));
    } else {
      setSlug(slugify(`${name1}-${year}`));
    }
  }, [name1, name2, date, isWedding]);

  useEffect(() => {
    if (!slug || slug.length < 3) { setSlugAvailable(null); return; }
    setSlugChecking(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/invitations/check-slug?slug=${slug}`);
      const { available } = await res.json();
      setSlugAvailable(available);
      setSlugChecking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [slug]);

  async function publish() {
    setLoading(true);
    setError(null);
    try {
      const dateObj = new Date(date + "T12:00:00");
      const dayLabels = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
      const n2 = isWedding ? name2 : (name2 || "—");
      const content = {
        hosts, invitationLine: invLine,
        names: [name1, n2] as [string, string],
        namesSeparator: isWedding ? "avec" : "·",
        bismillah: isWedding ? bismillah : false,
        date, time,
        dayLabel: dayLabels[dateObj.getDay()] || dayLabel,
        venue, venueSub: venueSub || undefined,
        note: note || undefined, closing,
        initials: [name1[0]?.toUpperCase() || "A", n2[0]?.toUpperCase() || "B"] as [string, string],
      };
      const hasCustom = (mode === "custom") && Object.keys(customColors).length > 0;
      const isDynamic = mode === "ai" && aiLayoutSpec !== null;
      const options = {
        showCountdown, showRsvp, showArabic: isWedding ? showArabic : false, showNote: !!note,
        ...(hasCustom ? { customizations: customColors } : {}),
        ...(isDynamic ? { layoutSpec: aiLayoutSpec } : {}),
      };
      const publishThemeId = isDynamic ? "dynamic" : themeId;
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId: publishThemeId, slug, content, options }),
      });
      let data: { error?: string; upgrade?: boolean } = {};
      try { data = await res.json(); } catch { /* non-JSON */ }
      if (!res.ok) {
        if (data.upgrade) {
          setError(data.error || "Limite atteinte");
          setTimeout(() => router.push("/pricing"), 2000);
          return;
        }
        setError(data.error || `Erreur ${res.status}`);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError("Erreur : " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  const canContinue = !!name1 && !!date && !!venue && !!hosts && (isWedding ? !!name2 : true);
  const filteredThemes = catFilter === "Tous" ? THEMES : THEMES.filter(t => t.cat.startsWith(catFilter));

  // ── Landing ──────────────────────────────────────────────────────────────
  if (mode === null) {
    return (
      <div className="invytek-page" style={{ minHeight: "100dvh", paddingBottom: "4rem" }}>
        <Nav />
        <div className="wrap" style={{ paddingTop: 120, maxWidth: 820 }}>
          <Link href="/dashboard" style={{ fontFamily: "var(--font-title)", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", textDecoration: "none" }}>
            ← Tableau de bord
          </Link>
          <h1 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "var(--ivory)", fontWeight: 400, marginTop: "1.2rem", marginBottom: "0.6rem" }}>
            Créer une invitation
          </h1>
          <p style={{ color: "var(--text-soft)", marginBottom: "3rem" }}>
            Choisissez comment vous souhaitez créer votre invitation.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>

            {/* Card 1 — Thèmes disponibles */}
            <button
              onClick={() => { setMode("themes"); setStep(1); }}
              style={{
                background: "linear-gradient(160deg, rgba(184,146,60,0.08), rgba(184,146,60,0.03))",
                border: "1px solid rgba(184,146,60,0.4)",
                borderRadius: 16, padding: "2rem", cursor: "pointer",
                textAlign: "left", transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(184,146,60,0.4)"; }}
            >
              <div style={{ fontSize: 32, marginBottom: "1rem" }}>🎨</div>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
                Gratuit
              </div>
              <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.35rem", color: "var(--ivory)", fontWeight: 400, marginBottom: "0.7rem" }}>
                Thèmes disponibles
              </h2>
              <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Choisissez parmi 12 thèmes prêts à l&apos;emploi — mariage, anniversaire, business et médical.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Mariage", "Anniversaire", "Bébé", "Business", "Médical"].map(c => (
                  <span key={c} style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-faint)", background: "rgba(184,146,60,0.07)", borderRadius: 100, padding: "3px 10px", border: "1px solid var(--hair)" }}>
                    {c}
                  </span>
                ))}
              </div>
            </button>

            {/* Card 2 — Thème personnalisé */}
            <button
              onClick={() => { setMode("custom"); setStep(1); }}
              style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid var(--hair)",
                borderRadius: 16, padding: "2rem", cursor: "pointer", textAlign: "left",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(184,146,60,0.5)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--hair)"; }}
            >
              <div style={{ fontSize: 32, marginBottom: "1rem" }}>✏️</div>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
                Personnalisation
              </div>
              <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.35rem", color: "var(--ivory)", fontWeight: 400, marginBottom: "0.7rem" }}>
                Thème personnalisé
              </h2>
              <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Choisissez un thème et adaptez les couleurs à votre identité. Aucune compétence requise.
              </p>
            </button>

            {/* Card 3 — Créer avec l'IA */}
            <button
              onClick={() => { setMode("ai"); setStep(1); }}
              style={{
                background: "linear-gradient(160deg, rgba(110,80,200,0.08), rgba(184,146,60,0.04))",
                border: "1px solid rgba(110,80,200,0.3)",
                borderRadius: 16, padding: "2rem", cursor: "pointer", textAlign: "left",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(110,80,200,0.6)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(110,80,200,0.3)"; }}
            >
              <div style={{ fontSize: 32, marginBottom: "1rem" }}>✨</div>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#a080e0", marginBottom: 8 }}>
                1 crédit / invitation
              </div>
              <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.35rem", color: "var(--ivory)", fontWeight: 400, marginBottom: "0.7rem" }}>
                Créer avec l&apos;IA
              </h2>
              <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Décrivez votre événement en quelques mots — l&apos;IA génère tout le contenu en secondes.
              </p>
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ── Custom wizard ────────────────────────────────────────────────────────
  if (mode === "custom") {
    return (
      <div className="invytek-page" style={{ minHeight: "100dvh", paddingBottom: "4rem" }}>
        <Nav />
        <div className="wrap" style={{ paddingTop: 120, maxWidth: step === 1 ? 1080 : 720 }}>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: 8, marginBottom: "2.5rem", alignItems: "center" }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: step >= s ? "linear-gradient(135deg, var(--gold-vivid), var(--accent))" : "rgba(184,146,60,0.1)",
                  border: step >= s ? "none" : "1px solid var(--hair)",
                  fontFamily: "var(--font-title)", fontSize: 13,
                  color: step >= s ? "#2a2008" : "var(--text-faint)",
                  cursor: step > s ? "pointer" : "default",
                }} onClick={() => step > s && setStep(s)}>{s}</div>
                {s < 3 && <div style={{ width: 40, height: 1, background: step > s ? "var(--gold)" : "var(--hair)" }} />}
              </div>
            ))}
            <span style={{ marginLeft: 8, fontFamily: "var(--font-title)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-soft)" }}>
              {step === 1 ? "Thème & couleurs" : step === 2 ? "Votre événement" : "Lien & publication"}
            </span>
          </div>

          {/* Step 1 — Thème + couleurs */}
          {step === 1 && (
            <div style={{ display: "flex", gap: 32, alignItems: "start", flexWrap: "wrap" }}>
              <div style={{ flex: "0 1 400px", minWidth: 280 }}>
                <h2 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "var(--ivory)", marginBottom: "0.5rem" }}>
                  Thème & couleurs
                </h2>
                <p style={{ color: "var(--text-soft)", marginBottom: "1.5rem" }}>
                  Choisissez un thème de base puis adaptez les couleurs.
                </p>

                {/* Theme selector */}
                <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>Thème de base</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1.8rem" }}>
                  {THEMES.filter(t => t.cat.startsWith("Mariage")).map(t => (
                    <button key={t.id} onClick={() => setThemeId(t.id)} style={{
                      padding: "0.75rem", borderRadius: 8, textAlign: "left", cursor: "pointer",
                      border: themeId === t.id ? "2px solid var(--gold)" : "1px solid var(--hair)",
                      background: themeId === t.id ? "rgba(184,146,60,0.1)" : "rgba(255,255,255,0.02)",
                    }}>
                      <div style={{ fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 3 }}>{t.cat}</div>
                      <div style={{ fontFamily: "var(--font-title)", fontSize: 14, color: "var(--ivory)" }}>{t.name}</div>
                    </button>
                  ))}
                </div>

                {/* Color pickers */}
                <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 12 }}>Couleurs</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1.8rem" }}>
                  {CUSTOM_VARS.map(v => (
                    <div key={v.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <input type="color" value={customColors[v.key]} onChange={e => setCustomColors(p => ({ ...p, [v.key]: e.target.value }))}
                        style={{ width: 40, height: 36, borderRadius: 8, border: "1px solid var(--hair)", cursor: "pointer", background: "none", padding: 2 }} />
                      <div>
                        <div style={{ fontFamily: "var(--font-title)", fontSize: 12, color: "var(--ivory)" }}>{v.label}</div>
                        <div style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)" }}>{customColors[v.key]}</div>
                      </div>
                      {customColors[v.key] !== v.default && (
                        <button onClick={() => setCustomColors(p => ({ ...p, [v.key]: v.default }))}
                          style={{ marginLeft: "auto", fontFamily: "var(--font-title)", fontSize: 10, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", letterSpacing: ".1em" }}>
                          Reset
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setMode(null)} className="btn btn-ghost">← Retour</button>
                  <button onClick={() => setStep(2)} className="btn btn-gold">Continuer →</button>
                </div>
              </div>

              {/* Preview */}
              <div className="create-preview" style={{ flex: "1 1 340px", position: "sticky", top: 100 }}>
                <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>
                  Aperçu — {THEMES.find(t => t.id === themeId)?.name}
                </div>
                <div style={{ width: 340, height: 620, overflow: "hidden", borderRadius: 16, border: "1px solid var(--hair)", background: "#0a0806", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
                  <iframe key={themeId} src={`/themes-preview/${PREVIEW_MAP[themeId] ?? themeId}.html`}
                    style={{ width: 375, height: 850, border: "none", transform: `scale(${340 / 375})`, transformOrigin: "top left", pointerEvents: "none" }}
                    title="Aperçu" />
                </div>
                <p style={{ marginTop: 10, fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)", lineHeight: 1.6 }}>
                  Les couleurs s&apos;appliqueront sur l&apos;invitation finale.
                </p>
              </div>
            </div>
          )}

          {step === 2 && <ContentStep {...{ theme: THEMES.find(t => t.id === themeId)!, d: DEFAULTS[THEMES.find(t => t.id === themeId)!.cat] || DEFAULTS["Mariage"], isWedding: ["Mariage","Mariage · RTL"].includes(THEMES.find(t => t.id === themeId)!.cat), isEvent: ["Business","Médical"].includes(THEMES.find(t => t.id === themeId)!.cat), name1, setName1, name2, setName2, hosts, setHosts, invLine, setInvLine, date, setDate, time, setTime, venue, setVenue, venueSub, setVenueSub, closing, setClosing, note, setNote, bismillah, setBismillah, showArabic, setShowArabic, showCountdown, setShowCountdown, showRsvp, setShowRsvp, onBack: () => setStep(1), onNext: () => setStep(3), canContinue: !!name1 && !!date && !!venue && !!hosts }} />}

          {step === 3 && <SlugStep {...{ slug, setSlug, slugAvailable, slugChecking, isWedding: ["Mariage","Mariage · RTL"].includes(THEMES.find(t => t.id === themeId)!.cat), name1, name2, hosts, date, venue, venueSub, themeName: THEMES.find(t => t.id === themeId)!.name, error, loading, onBack: () => setStep(2), onPublish: publish }} />}
        </div>
      </div>
    );
  }

  // ── AI wizard ─────────────────────────────────────────────────────────────
  if (mode === "ai") {
    const aiTheme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

    async function generateAi() {
      setAiLoading(true); setAiError(null);
      try {
        const res = await fetch("/api/ai-create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: aiDesc, ...(aiImage ? { image: aiImage } : {}) }),
        });
        const d = await res.json() as { themeId?: string; layoutSpec?: Record<string, unknown>; customizations?: Record<string, string>; content?: Record<string, unknown>; credits?: number; error?: string };
        if (!res.ok) { setAiError(d.error || "Erreur IA"); return; }
        if (d.credits !== undefined) setUserCredits(d.credits);
        if (d.themeId) setThemeId(d.themeId);
        if (d.layoutSpec) setAiLayoutSpec(d.layoutSpec);
        if (d.customizations) setCustomColors(d.customizations as Record<string, string>);
        const c = d.content as { names?: [string,string]; hosts?: string; invitationLine?: string; date?: string; time?: string; dayLabel?: string; venue?: string; venueSub?: string; closing?: string; note?: string; bismillah?: boolean } | undefined;
        if (c) {
          if (c.names?.[0]) setName1(c.names[0]);
          if (c.names?.[1]) setName2(c.names[1]);
          if (c.hosts) setHosts(c.hosts);
          if (c.invitationLine) setInvLine(c.invitationLine);
          if (c.date) setDate(c.date);
          if (c.time) setTime(c.time);
          if (c.venue) setVenue(c.venue);
          if (c.venueSub) setVenueSub(c.venueSub);
          if (c.closing) setClosing(c.closing);
          if (c.note) setNote(c.note);
          if (c.bismillah !== undefined) setBismillah(c.bismillah);
        }
        setStep(2);
      } catch { setAiError("Erreur réseau — réessayez."); }
      finally { setAiLoading(false); }
    }

    return (
      <div className="invytek-page" style={{ minHeight: "100dvh", paddingBottom: "4rem" }}>
        <Nav />
        <div className="wrap" style={{ paddingTop: 120, maxWidth: step === 1 ? 680 : 1080 }}>

          {/* Step 1 — Description */}
          {step === 1 && (
            <div>
              <button onClick={() => setMode(null)} style={{ fontFamily: "var(--font-title)", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", marginBottom: "1.5rem", padding: 0 }}>
                ← Retour
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.6rem" }}>
                <span style={{ fontSize: 24 }}>✨</span>
                <h1 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "var(--ivory)", fontWeight: 400 }}>
                  Créer avec l&apos;IA
                </h1>
              </div>
              <p style={{ color: "var(--text-soft)", marginBottom: "2rem", maxWidth: 520 }}>
                Décrivez votre événement en une ou deux phrases. L&apos;IA choisit le thème, rédige le contenu et génère votre invitation en quelques secondes.
              </p>

              {/* Crédits */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(110,80,200,0.08)", border: "1px solid rgba(110,80,200,0.22)", borderRadius: 10, padding: "0.8rem 1.2rem", marginBottom: "1.5rem", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontFamily: "var(--font-title)", fontSize: 13, color: "var(--text-soft)" }}>
                  ✨ <strong style={{ color: "#a080e0" }}>{userCredits ?? "…"}</strong> crédit{(userCredits ?? 0) !== 1 ? "s" : ""} disponible{(userCredits ?? 0) !== 1 ? "s" : ""}
                </span>
                {userCredits === 0 && (
                  <button disabled={buyLoading} onClick={async () => {
                    setBuyLoading(true);
                    const res = await fetch("/api/credits/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pack: 0 }) });
                    const d = await res.json() as { url?: string };
                    if (d.url) window.location.href = d.url;
                    setBuyLoading(false);
                  }} style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", background: "linear-gradient(135deg, #a080e0, #7050c0)", color: "#fff", border: "none", borderRadius: 100, padding: "6px 16px", cursor: "pointer" }}>
                    {buyLoading ? "…" : "Acheter"}
                  </button>
                )}
              </div>

              {/* Image upload */}
              {!aiImagePreview ? (
                <label style={{ display: "flex", alignItems: "center", gap: 12, border: "1px dashed rgba(110,80,200,0.35)", borderRadius: 10, padding: "0.9rem 1.2rem", cursor: "pointer", marginBottom: "1.2rem", background: "rgba(110,80,200,0.04)", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(110,80,200,0.7)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(110,80,200,0.35)")}>
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} style={{ display: "none" }} />
                  <span style={{ fontSize: 22 }}>🎨</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: 13, color: "var(--text-soft)" }}>Ajouter un modèle de référence</div>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)" }}>Invitation, flyer, décor… l&apos;IA reproduit ce style pour votre client — optionnel</div>
                  </div>
                </label>
              ) : (
                <div style={{ position: "relative", marginBottom: "1.2rem" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={aiImagePreview} alt="Aperçu" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(110,80,200,0.3)" }} />
                  <button onClick={() => { setAiImage(null); setAiImagePreview(null); }}
                    style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "none", color: "#fff", fontSize: 18, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    ×
                  </button>
                  <div style={{ position: "absolute", bottom: 8, left: 10, fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#a080e0", background: "rgba(0,0,0,0.55)", borderRadius: 100, padding: "3px 10px" }}>
                    Modèle ajouté ✓
                  </div>
                </div>
              )}

              <textarea
                value={aiDesc}
                onChange={e => setAiDesc(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && aiDesc.trim() && !aiLoading) generateAi(); }}
                placeholder="Mariage de Karim Benali et Sara Morsli, le 15 août 2026 à 18h, Salle El Djazair, Alger. Familles Benali et Morsli."
                rows={4}
                style={{ ...inp, height: "auto", resize: "vertical", marginBottom: "0.6rem", fontSize: "1rem" }}
              />
              <p style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)", marginBottom: "1.4rem" }}>
                Astuce : précisez noms, date, heure, lieu et type d&apos;événement. Ctrl+Entrée pour générer.
              </p>

              {aiError && <p style={{ color: "#e07070", fontSize: "0.9rem", marginBottom: "1rem" }}>{aiError}</p>}

              <button
                disabled={aiLoading || !aiDesc.trim() || userCredits === 0}
                onClick={generateAi}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: aiLoading || !aiDesc.trim() || userCredits === 0 ? "rgba(110,80,200,0.3)" : "linear-gradient(135deg, #a080e0, #7050c0)",
                  border: "none", borderRadius: 100, padding: "0.95rem 2.2rem",
                  color: "#fff", fontFamily: "var(--font-title)", fontSize: 13,
                  letterSpacing: ".16em", textTransform: "uppercase",
                  cursor: aiLoading || !aiDesc.trim() || userCredits === 0 ? "not-allowed" : "pointer",
                  boxShadow: aiLoading || !aiDesc.trim() ? "none" : "0 8px 24px rgba(110,80,200,0.4)",
                }}
              >
                {aiLoading ? (
                  <>
                    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Génération en cours…
                  </>
                ) : "✨ Générer mon invitation →"}
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* Step 2 — Aperçu + publication directe */}
          {step === 2 && (
            <div style={{ display: "flex", gap: 40, alignItems: "start", flexWrap: "wrap" }}>

              {/* Gauche — résumé + slug + publie */}
              <div style={{ flex: "0 1 360px", minWidth: 280 }}>
                <div style={{ background: "rgba(110,80,200,0.08)", border: "1px solid rgba(110,80,200,0.25)", borderRadius: 10, padding: "1rem 1.2rem", marginBottom: "1.8rem" }}>
                  <p style={{ fontFamily: "var(--font-title)", fontSize: 11, color: "#a080e0", letterSpacing: ".14em", textTransform: "uppercase" }}>
                    ✨ Invitation générée par l&apos;IA
                  </p>
                </div>

                {/* Résumé */}
                <div style={{ background: "rgba(184,146,60,0.04)", border: "1px solid var(--hair)", borderRadius: 10, padding: "1.2rem", marginBottom: "1.5rem" }}>
                  <div style={{ display: "grid", gap: 8 }}>
                    {[
                      ["Thème", aiTheme.name],
                      [["Mariage","Mariage · RTL"].includes(aiTheme.cat) ? "Mariés" : "Événement",
                        name2 ? `${name1} & ${name2}` : name1],
                      ["Organisé par", hosts],
                      ["Date", date ? new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"],
                      ["Lieu", `${venue}${venueSub ? `, ${venueSub}` : ""}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", gap: 10, fontSize: "0.9rem" }}>
                        <span style={{ color: "var(--text-faint)", minWidth: 80, flexShrink: 0 }}>{k}</span>
                        <span style={{ color: "var(--text-soft)" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slug */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>Votre lien</div>
                  <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.2)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--hair)" }}>
                    <span style={{ padding: "0.65rem 0.8rem", color: "var(--text-faint)", fontFamily: "var(--font-title)", fontSize: 12, whiteSpace: "nowrap" }}>invytek.app/i/</span>
                    <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--ivory)", fontFamily: "var(--font-title)", fontSize: 12, padding: "0.65rem 0.6rem 0.65rem 0" }} />
                    <span style={{ padding: "0.65rem 0.8rem", fontSize: 12 }}>
                      {slugChecking ? "⏳" : slugAvailable === true ? "✓" : slugAvailable === false ? "✗" : ""}
                    </span>
                  </div>
                  {slugAvailable === false && <p style={{ color: "#c05050", fontSize: 12, marginTop: 4, fontFamily: "var(--font-title)" }}>Ce lien est pris.</p>}
                  {slugAvailable === true && <p style={{ color: "var(--gold)", fontSize: 12, marginTop: 4, fontFamily: "var(--font-title)" }}>Disponible ✓</p>}
                </div>

                {error && <p style={{ color: "#c05050", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</p>}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => setStep(1)} style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    ← Régénérer
                  </button>
                  <button onClick={publish} disabled={loading || !slug || slugAvailable === false || slugChecking}
                    style={{ flex: 1, background: loading ? "rgba(110,80,200,0.4)" : "linear-gradient(135deg, #a080e0, #7050c0)", border: "none", borderRadius: 100, padding: "0.9rem 1.5rem", color: "#fff", fontFamily: "var(--font-title)", fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", cursor: loading || !slug || slugAvailable === false || slugChecking ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 8px 24px rgba(110,80,200,0.35)" }}>
                    {loading ? "Publication…" : "Publier →"}
                  </button>
                </div>
              </div>

              {/* Droite — aperçu DynamicTheme réel */}
              <div style={{ flex: "1 1 340px", position: "sticky", top: 100 }}>
                <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#a080e0", marginBottom: 12 }}>
                  ✨ {(aiLayoutSpec as DynamicThemeSpec | null)?.themeLabel ?? "Thème généré par l'IA"}
                </div>
                <div style={{ width: 340, height: 620, overflow: "hidden", borderRadius: 16, border: "1px solid rgba(110,80,200,0.35)", background: "#0a0806", boxShadow: "0 24px 60px rgba(110,80,192,0.25)" }}>
                  <div style={{ width: 375, height: 812, transform: `scale(${340 / 375})`, transformOrigin: "top left", pointerEvents: "none", overflow: "hidden" }}>
                    {aiLayoutSpec && (
                      <DynamicTheme spec={aiLayoutSpec as DynamicThemeSpec} invitationId="preview" />
                    )}
                  </div>
                </div>
                <p style={{ marginTop: 10, fontFamily: "var(--font-title)", fontSize: 11, color: "var(--text-faint)", lineHeight: 1.6 }}>
                  Aperçu exact de votre invitation finale
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Themes wizard ─────────────────────────────────────────────────────────
  return (
    <div className="invytek-page" style={{ minHeight: "100dvh", paddingBottom: "4rem" }}>
      <Nav />
      <div className="wrap" style={{ paddingTop: 120, maxWidth: step === 1 ? 1080 : 720 }}>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: "2.5rem", alignItems: "center" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: step >= s ? "linear-gradient(135deg, var(--gold-vivid), var(--accent))" : "rgba(184,146,60,0.1)",
                border: step >= s ? "none" : "1px solid var(--hair)",
                fontFamily: "var(--font-title)", fontSize: 13,
                color: step >= s ? "#2a2008" : "var(--text-faint)",
                cursor: step > s ? "pointer" : "default",
              }} onClick={() => step > s && setStep(s)}>
                {s}
              </div>
              {s < 3 && <div style={{ width: 40, height: 1, background: step > s ? "var(--gold)" : "var(--hair)" }} />}
            </div>
          ))}
          <span style={{ marginLeft: 8, fontFamily: "var(--font-title)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-soft)" }}>
            {step === 1 ? "Thème" : step === 2 ? "Votre événement" : "Lien & publication"}
          </span>
        </div>

        {/* Step 1 — Choix du thème */}
        {step === 1 && (
          <div style={{ display: "flex", gap: 32, alignItems: "start", flexWrap: "wrap" }}>

            <div style={{ flex: "0 1 380px", minWidth: 260 }}>
              <h2 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "var(--ivory)", marginBottom: "0.5rem" }}>
                Choisissez votre thème
              </h2>
              <p style={{ color: "var(--text-soft)", marginBottom: "1.5rem" }}>
                Sélectionnez le thème qui correspond à votre événement.
              </p>

              {/* Category filter */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "1.2rem" }}>
                {CATS.map(c => (
                  <button key={c} onClick={() => setCatFilter(c)} style={{
                    padding: "5px 14px", borderRadius: 100, cursor: "pointer",
                    fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase",
                    background: catFilter === c ? "linear-gradient(135deg, var(--gold-vivid), var(--accent))" : "rgba(184,146,60,0.07)",
                    color: catFilter === c ? "#2a2008" : "var(--text-soft)",
                    border: catFilter === c ? "none" : "1px solid var(--hair)",
                  }}>
                    {c}
                  </button>
                ))}
              </div>

              {/* Theme grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.5rem" }}>
                {filteredThemes.map(t => (
                  <button key={t.id} onClick={() => t.available && setThemeId(t.id)} style={{
                    padding: "1rem", borderRadius: 10,
                    border: themeId === t.id ? "2px solid var(--gold)" : "1px solid var(--hair)",
                    background: themeId === t.id ? "rgba(184,146,60,0.1)" : "rgba(255,255,255,0.02)",
                    cursor: t.available ? "pointer" : "not-allowed",
                    opacity: t.available ? 1 : 0.45,
                    textAlign: "left",
                  }}>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>{t.cat}</div>
                    <div style={{ fontFamily: "var(--font-title)", fontSize: 15, color: "var(--ivory)" }}>{t.name}</div>
                    {!t.available && <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 3 }}>Bientôt</div>}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setMode(null)} className="btn btn-ghost">← Retour</button>
                <button onClick={() => setStep(2)} className="btn btn-gold">Continuer →</button>
              </div>
            </div>

            {/* Preview */}
            <div className="create-preview" style={{ flex: "1 1 340px", position: "sticky", top: 100 }}>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>
                Aperçu — {theme.name}
              </div>
              <div style={{ width: 340, height: 620, overflow: "hidden", borderRadius: 16, border: "1px solid var(--hair)", background: "#0a0806", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
                <iframe
                  key={themeId}
                  src={`/themes-preview/${PREVIEW_MAP[themeId] ?? themeId}.html`}
                  style={{ width: 375, height: 850, border: "none", transform: `scale(${340 / 375})`, transformOrigin: "top left", pointerEvents: "none" }}
                  title={`Aperçu ${theme.name}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Contenu */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "var(--ivory)", marginBottom: "0.5rem" }}>
              Votre événement
            </h2>
            <p style={{ color: "var(--text-soft)", marginBottom: "2rem" }}>
              Thème : <strong style={{ color: "var(--gold)" }}>{theme.name}</strong>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>

              <Row label={d.name1Label}>
                {isWedding ? (
                  <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input value={name1} onChange={e => setName1(e.target.value)} placeholder={d.name1Ph} style={inp} />
                    <input value={name2} onChange={e => setName2(e.target.value)} placeholder={d.name2Ph} style={inp} />
                  </div>
                ) : (
                  <input value={name1} onChange={e => setName1(e.target.value)} placeholder={d.name1Ph} style={inp} />
                )}
              </Row>

              {!isWedding && (
                <Row label={d.name2Label}>
                  <input value={name2} onChange={e => setName2(e.target.value)} placeholder={d.name2Ph} style={inp} />
                </Row>
              )}

              <Row label={d.hostsLabel}>
                <input value={hosts} onChange={e => setHosts(e.target.value)} placeholder={d.hostsPh} style={inp} />
              </Row>

              <Row label="Phrase d'invitation">
                <textarea value={invLine} onChange={e => setInvLine(e.target.value)} rows={2} style={{ ...inp, height: "auto", resize: "vertical" }} />
              </Row>

              <Row label="Date & heure">
                <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp} />
                </div>
              </Row>

              <Row label="Lieu">
                <input value={venue} onChange={e => setVenue(e.target.value)} placeholder={isEvent ? "Hôtel El Aurassi" : "Salle Al Baraka"} style={inp} />
                <input value={venueSub} onChange={e => setVenueSub(e.target.value)} placeholder="Adresse, Ville (optionnel)" style={{ ...inp, marginTop: 8 }} />
              </Row>

              <Row label="Mot de clôture">
                <input value={closing} onChange={e => setClosing(e.target.value)} placeholder={d.closing} style={inp} />
              </Row>

              <Row label={d.noteLabel}>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder={d.notePh} style={inp} />
              </Row>

              <Row label="Options">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {isWedding && [
                    { label: "Bismillah", val: bismillah, set: setBismillah },
                    { label: "Texte arabe", val: showArabic, set: setShowArabic },
                  ].map(o => (
                    <label key={o.label} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-soft)", fontSize: "0.95rem" }}>
                      <input type="checkbox" checked={o.val} onChange={e => o.set(e.target.checked)} style={{ accentColor: "var(--gold)", width: 15, height: 15 }} />
                      {o.label}
                    </label>
                  ))}
                  {[
                    { label: "Compte à rebours", val: showCountdown, set: setShowCountdown },
                    { label: "RSVP", val: showRsvp, set: setShowRsvp },
                  ].map(o => (
                    <label key={o.label} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-soft)", fontSize: "0.95rem" }}>
                      <input type="checkbox" checked={o.val} onChange={e => o.set(e.target.checked)} style={{ accentColor: "var(--gold)", width: 15, height: 15 }} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </Row>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: "2rem" }}>
              <button onClick={() => setStep(1)} className="btn btn-ghost">← Retour</button>
              <button onClick={() => setStep(3)} disabled={!canContinue} className="btn btn-gold">Continuer →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Slug & Publication */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "var(--ivory)", marginBottom: "0.5rem" }}>
              Lien de votre invitation
            </h2>
            <p style={{ color: "var(--text-soft)", marginBottom: "2rem" }}>
              C&apos;est le lien que vous enverrez à vos invités.
            </p>

            <div style={{ background: "rgba(184,146,60,0.06)", border: "1px solid var(--hair)", borderRadius: 10, padding: "1.2rem", marginBottom: "1.5rem" }}>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>
                Votre lien
              </div>
              <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.2)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--hair)" }}>
                <span style={{ padding: "0.7rem 0.8rem", color: "var(--text-faint)", fontFamily: "var(--font-title)", fontSize: 13, whiteSpace: "nowrap" }}>
                  invytek.app/i/
                </span>
                <input
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--ivory)", fontFamily: "var(--font-title)", fontSize: 13, padding: "0.7rem 0.8rem 0.7rem 0" }}
                />
                <span style={{ padding: "0.7rem 0.8rem", fontSize: 13 }}>
                  {slugChecking ? "⏳" : slugAvailable === true ? "✓" : slugAvailable === false ? "✗" : ""}
                </span>
              </div>
              {slugAvailable === false && <p style={{ color: "#c05050", fontSize: 13, marginTop: 6, fontFamily: "var(--font-title)" }}>Ce lien est déjà pris. Modifiez-le.</p>}
              {slugAvailable === true && <p style={{ color: "var(--gold)", fontSize: 13, marginTop: 6, fontFamily: "var(--font-title)" }}>Disponible ✓</p>}
            </div>

            <div style={{ background: "rgba(184,146,60,0.04)", border: "1px solid var(--hair)", borderRadius: 10, padding: "1.2rem", marginBottom: "2rem" }}>
              <div style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 12 }}>Récapitulatif</div>
              <div style={{ display: "grid", gap: 6 }}>
                {[
                  [isWedding ? "Mariés" : "Événement", isWedding ? `${name1} & ${name2}` : name2 ? `${name1} — ${name2}` : name1],
                  ["Organisé par", hosts],
                  ["Date", date ? new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"],
                  ["Lieu", `${venue}${venueSub ? `, ${venueSub}` : ""}`],
                  ["Thème", theme.name],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 12, fontSize: "0.95rem" }}>
                    <span style={{ color: "var(--text-faint)", minWidth: 90 }}>{k}</span>
                    <span style={{ color: "var(--text-soft)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && <p style={{ color: "#c05050", marginBottom: "1rem", fontSize: "0.95rem" }}>{error}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(2)} className="btn btn-ghost">← Retour</button>
              <button onClick={publish} disabled={loading || !slug || slugAvailable === false || slugChecking} className="btn btn-gold">
                {loading ? "Publication…" : "Publier mon invitation →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared sub-steps ─────────────────────────────────────────────────────

interface ContentStepProps {
  theme: typeof THEMES[number]; d: typeof DEFAULTS[string];
  isWedding: boolean; isEvent: boolean;
  name1: string; setName1: (v: string) => void;
  name2: string; setName2: (v: string) => void;
  hosts: string; setHosts: (v: string) => void;
  invLine: string; setInvLine: (v: string) => void;
  date: string; setDate: (v: string) => void;
  time: string; setTime: (v: string) => void;
  venue: string; setVenue: (v: string) => void;
  venueSub: string; setVenueSub: (v: string) => void;
  closing: string; setClosing: (v: string) => void;
  note: string; setNote: (v: string) => void;
  bismillah: boolean; setBismillah: (v: boolean) => void;
  showArabic: boolean; setShowArabic: (v: boolean) => void;
  showCountdown: boolean; setShowCountdown: (v: boolean) => void;
  showRsvp: boolean; setShowRsvp: (v: boolean) => void;
  onBack: () => void; onNext: () => void; canContinue: boolean;
  extraTop?: React.ReactNode;
}

function ContentStep({ theme, d, isWedding, isEvent, name1, setName1, name2, setName2, hosts, setHosts, invLine, setInvLine, date, setDate, time, setTime, venue, setVenue, venueSub, setVenueSub, closing, setClosing, note, setNote, bismillah, setBismillah, showArabic, setShowArabic, showCountdown, setShowCountdown, showRsvp, setShowRsvp, onBack, onNext, canContinue, extraTop }: ContentStepProps) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "var(--ivory)", marginBottom: "0.5rem" }}>Votre événement</h2>
      <p style={{ color: "var(--text-soft)", marginBottom: "1.5rem" }}>Thème : <strong style={{ color: "var(--gold)" }}>{theme.name}</strong></p>
      {extraTop}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        <Row label={d.name1Label}>
          {isWedding ? (
            <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input value={name1} onChange={e => setName1(e.target.value)} placeholder={d.name1Ph} style={inp} />
              <input value={name2} onChange={e => setName2(e.target.value)} placeholder={d.name2Ph} style={inp} />
            </div>
          ) : <input value={name1} onChange={e => setName1(e.target.value)} placeholder={d.name1Ph} style={inp} />}
        </Row>
        {!isWedding && <Row label={d.name2Label}><input value={name2} onChange={e => setName2(e.target.value)} placeholder={d.name2Ph} style={inp} /></Row>}
        <Row label={d.hostsLabel}><input value={hosts} onChange={e => setHosts(e.target.value)} placeholder={d.hostsPh} style={inp} /></Row>
        <Row label="Phrase d'invitation"><textarea value={invLine} onChange={e => setInvLine(e.target.value)} rows={2} style={{ ...inp, height: "auto", resize: "vertical" }} /></Row>
        <Row label="Date & heure">
          <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp} />
          </div>
        </Row>
        <Row label="Lieu">
          <input value={venue} onChange={e => setVenue(e.target.value)} placeholder={isEvent ? "Hôtel El Aurassi" : "Salle Al Baraka"} style={inp} />
          <input value={venueSub} onChange={e => setVenueSub(e.target.value)} placeholder="Adresse, Ville (optionnel)" style={{ ...inp, marginTop: 8 }} />
        </Row>
        <Row label="Mot de clôture"><input value={closing} onChange={e => setClosing(e.target.value)} placeholder={d.closing} style={inp} /></Row>
        <Row label={d.noteLabel}><input value={note} onChange={e => setNote(e.target.value)} placeholder={d.notePh} style={inp} /></Row>
        <Row label="Options">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {isWedding && [{ label: "Bismillah", val: bismillah, set: setBismillah }, { label: "Texte arabe", val: showArabic, set: setShowArabic }].map(o => (
              <label key={o.label} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-soft)", fontSize: "0.95rem" }}>
                <input type="checkbox" checked={o.val} onChange={e => o.set(e.target.checked)} style={{ accentColor: "var(--gold)", width: 15, height: 15 }} />{o.label}
              </label>
            ))}
            {[{ label: "Compte à rebours", val: showCountdown, set: setShowCountdown }, { label: "RSVP", val: showRsvp, set: setShowRsvp }].map(o => (
              <label key={o.label} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-soft)", fontSize: "0.95rem" }}>
                <input type="checkbox" checked={o.val} onChange={e => o.set(e.target.checked)} style={{ accentColor: "var(--gold)", width: 15, height: 15 }} />{o.label}
              </label>
            ))}
          </div>
        </Row>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: "2rem" }}>
        <button onClick={onBack} className="btn btn-ghost">← Retour</button>
        <button onClick={onNext} disabled={!canContinue} className="btn btn-gold">Continuer →</button>
      </div>
    </div>
  );
}

interface SlugStepProps {
  slug: string; setSlug: (v: string) => void;
  slugAvailable: boolean | null; slugChecking: boolean;
  isWedding: boolean;
  name1: string; name2: string; hosts: string; date: string;
  venue: string; venueSub: string; themeName: string;
  error: string | null; loading: boolean;
  onBack: () => void; onPublish: () => void;
}

function SlugStep({ slug, setSlug, slugAvailable, slugChecking, isWedding, name1, name2, hosts, date, venue, venueSub, themeName, error, loading, onBack, onPublish }: SlugStepProps) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "var(--ivory)", marginBottom: "0.5rem" }}>Lien de votre invitation</h2>
      <p style={{ color: "var(--text-soft)", marginBottom: "2rem" }}>C&apos;est le lien que vous enverrez à vos invités.</p>
      <div style={{ background: "rgba(184,146,60,0.06)", border: "1px solid var(--hair)", borderRadius: 10, padding: "1.2rem", marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>Votre lien</div>
        <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.2)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--hair)" }}>
          <span style={{ padding: "0.7rem 0.8rem", color: "var(--text-faint)", fontFamily: "var(--font-title)", fontSize: 13, whiteSpace: "nowrap" }}>invytek.app/i/</span>
          <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--ivory)", fontFamily: "var(--font-title)", fontSize: 13, padding: "0.7rem 0.8rem 0.7rem 0" }} />
          <span style={{ padding: "0.7rem 0.8rem", fontSize: 13 }}>{slugChecking ? "⏳" : slugAvailable === true ? "✓" : slugAvailable === false ? "✗" : ""}</span>
        </div>
        {slugAvailable === false && <p style={{ color: "#c05050", fontSize: 13, marginTop: 6, fontFamily: "var(--font-title)" }}>Ce lien est déjà pris.</p>}
        {slugAvailable === true && <p style={{ color: "var(--gold)", fontSize: 13, marginTop: 6, fontFamily: "var(--font-title)" }}>Disponible ✓</p>}
      </div>
      <div style={{ background: "rgba(184,146,60,0.04)", border: "1px solid var(--hair)", borderRadius: 10, padding: "1.2rem", marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 12 }}>Récapitulatif</div>
        <div style={{ display: "grid", gap: 6 }}>
          {[
            [isWedding ? "Mariés" : "Événement", isWedding ? `${name1} & ${name2}` : name2 ? `${name1} — ${name2}` : name1],
            ["Organisé par", hosts],
            ["Date", date ? new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"],
            ["Lieu", `${venue}${venueSub ? `, ${venueSub}` : ""}`],
            ["Thème", themeName],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 12, fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-faint)", minWidth: 90 }}>{k}</span>
              <span style={{ color: "var(--text-soft)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      {error && <p style={{ color: "#c05050", marginBottom: "1rem", fontSize: "0.95rem" }}>{error}</p>}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onBack} className="btn btn-ghost">← Retour</button>
        <button onClick={onPublish} disabled={loading || !slug || slugAvailable === false || slugChecking} className="btn btn-gold">
          {loading ? "Publication…" : "Publier mon invitation →"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  width: "100%", padding: "0.75rem 1rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(184,146,60,0.2)",
  borderRadius: 8, outline: "none",
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "1.05rem", color: "#FCFAF5",
  boxSizing: "border-box",
};
