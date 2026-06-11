"use client";

import { useState, useEffect, useCallback } from "react";
import type { DynamicThemeSpec } from "@/lib/schemas/dynamicTheme";
import { PublicRsvpForm } from "@/components/PublicRsvpForm";
import s from "./DynamicTheme.module.css";

/* ── Font mappings ─────────────────────────────────── */
const HEADLINE_FONTS: Record<string, string> = {
  "pinyon-script": "'Pinyon Script', cursive",
  "marcellus":     "'Marcellus', serif",
  "cormorant":     "'Cormorant Garamond', serif",
  "amiri":         "'Amiri', serif",
};
const BODY_FONTS: Record<string, string> = {
  "cormorant": "'Cormorant Garamond', serif",
  "marcellus": "'Marcellus', serif",
  "amiri":     "'Amiri', serif",
};

/* ── Ornement SVGs ─────────────────────────────────── */
function OrnFloral({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 360 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%" }}>
      <path d="M180 12 Q168 6 158 12 Q168 0 180 6 Q192 0 202 12 Q192 6 180 12Z" fill={color} opacity=".9"/>
      <circle cx="180" cy="20" r="6" fill={color} opacity=".8"/>
      <path d="M174 20 Q148 14 120 22 Q140 8 174 20Z" fill={color} opacity=".65"/>
      <path d="M186 20 Q212 14 240 22 Q220 8 186 20Z" fill={color} opacity=".65"/>
      <path d="M120 22 Q88 18 60 28 Q80 14 120 22Z" fill={color} opacity=".4"/>
      <path d="M240 22 Q272 18 300 28 Q280 14 240 22Z" fill={color} opacity=".4"/>
      <circle cx="60" cy="28" r="4" fill={color} opacity=".5"/>
      <circle cx="300" cy="28" r="4" fill={color} opacity=".5"/>
      <circle cx="120" cy="22" r="3" fill={color} opacity=".6"/>
      <circle cx="240" cy="22" r="3" fill={color} opacity=".6"/>
      <path d="M60 30 Q30 26 10 38" stroke={color} strokeWidth=".8" opacity=".3" fill="none"/>
      <path d="M300 30 Q330 26 350 38" stroke={color} strokeWidth=".8" opacity=".3" fill="none"/>
    </svg>
  );
}

function OrnGeometric({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 360 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%" }}>
      <line x1="10" y1="20" x2="145" y2="20" stroke={color} strokeWidth=".8" opacity=".5"/>
      <polygon points="165,10 180,20 165,30 175,20" fill={color} opacity=".7"/>
      <polygon points="195,10 180,20 195,30 185,20" fill={color} opacity=".7"/>
      <line x1="215" y1="20" x2="350" y2="20" stroke={color} strokeWidth=".8" opacity=".5"/>
      <rect x="172" y="13" width="16" height="14" stroke={color} strokeWidth=".7" fill="none" opacity=".4" transform="rotate(45 180 20)"/>
      <circle cx="10" cy="20" r="2.5" fill={color} opacity=".4"/>
      <circle cx="350" cy="20" r="2.5" fill={color} opacity=".4"/>
    </svg>
  );
}

function OrnArabesque({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 360 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%" }}>
      <path d="M180 8 Q170 20 160 16 Q170 28 180 20 Q190 28 200 16 Q190 20 180 8Z" fill={color} opacity=".8"/>
      <path d="M160 16 Q148 22 140 18 Q148 30 160 28 Q152 34 148 28" stroke={color} strokeWidth="1.2" fill="none" opacity=".6"/>
      <path d="M200 16 Q212 22 220 18 Q212 30 200 28 Q208 34 212 28" stroke={color} strokeWidth="1.2" fill="none" opacity=".6"/>
      <path d="M140 18 Q120 22 100 30 Q110 20 130 18 Q120 12 100 14" stroke={color} strokeWidth=".9" fill="none" opacity=".4"/>
      <path d="M220 18 Q240 22 260 30 Q250 20 230 18 Q240 12 260 14" stroke={color} strokeWidth=".9" fill="none" opacity=".4"/>
      <path d="M100 30 Q70 34 40 28" stroke={color} strokeWidth=".7" fill="none" opacity=".3"/>
      <path d="M260 30 Q290 34 320 28" stroke={color} strokeWidth=".7" fill="none" opacity=".3"/>
      <circle cx="180" cy="30" r="3" fill={color} opacity=".5"/>
    </svg>
  );
}

function OrnMinimal({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 360 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%" }}>
      <line x1="40" y1="12" x2="162" y2="12" stroke={color} strokeWidth=".6" opacity=".4"/>
      <line x1="198" y1="12" x2="320" y2="12" stroke={color} strokeWidth=".6" opacity=".4"/>
      <circle cx="180" cy="12" r="3.5" fill={color} opacity=".6"/>
      <circle cx="166" cy="12" r="1.5" fill={color} opacity=".35"/>
      <circle cx="194" cy="12" r="1.5" fill={color} opacity=".35"/>
    </svg>
  );
}

function OrnConfetti({ color }: { color: string }) {
  const pieces = [
    { x: 40, y: 18, r: 4, o: 0.6 }, { x: 90, y: 8, r: 3, o: 0.5 },
    { x: 140, y: 20, r: 5, o: 0.4 }, { x: 180, y: 6, r: 3.5, o: 0.7 },
    { x: 220, y: 20, r: 4, o: 0.5 }, { x: 270, y: 10, r: 3, o: 0.6 },
    { x: 320, y: 18, r: 4.5, o: 0.4 },
  ];
  return (
    <svg viewBox="0 0 360 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%" }}>
      {pieces.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={color} opacity={p.o}/>)}
      <line x1="60" y1="14" x2="300" y2="14" stroke={color} strokeWidth=".5" opacity=".25"/>
    </svg>
  );
}

function OrnMedical({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 360 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%" }}>
      <line x1="20" y1="20" x2="154" y2="20" stroke={color} strokeWidth=".8" opacity=".4"/>
      <line x1="206" y1="20" x2="340" y2="20" stroke={color} strokeWidth=".8" opacity=".4"/>
      <rect x="173" y="8" width="14" height="24" rx="2" fill={color} opacity=".7"/>
      <rect x="166" y="15" width="28" height="10" rx="2" fill={color} opacity=".7"/>
      <circle cx="180" cy="20" r="16" stroke={color} strokeWidth=".8" fill="none" opacity=".25"/>
    </svg>
  );
}

const ORNS: Record<string, React.ComponentType<{ color: string }>> = {
  floral:    OrnFloral,
  geometric: OrnGeometric,
  arabesque: OrnArabesque,
  minimal:   OrnMinimal,
  confetti:  OrnConfetti,
  medical:   OrnMedical,
};

/* ── Countdown ─────────────────────────────────────── */
function Countdown({ date, color, textColor }: { date: string; color: string; textColor: string }) {
  const target = new Date(date + "T00:00:00").getTime();
  const calc = () => {
    const diff = target - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 60000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={s.countdown}>
      {([["jours", t.d], ["heures", t.h], ["min", t.m]] as [string, number][]).map(([label, val]) => (
        <div key={label} className={s.countUnit}>
          <span className={s.countNum} style={{ color, fontFamily: "'Cormorant Garamond', serif" }}>
            {String(val).padStart(2, "0")}
          </span>
          <span className={s.countLabel} style={{ color: textColor }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Opening animations ────────────────────────────── */
function AnimFade({ bg, onDone }: { bg: string; onDone: () => void }) {
  return (
    <div
      className={`${s.overlay} ${s.animFade}`}
      style={{ background: bg }}
      onAnimationEnd={onDone}
    />
  );
}

function AnimRise({ onDone }: { onDone: () => void }) {
  // No overlay — content itself rises
  useEffect(() => { const id = setTimeout(onDone, 900); return () => clearTimeout(id); }, [onDone]);
  return null;
}

function AnimDoors({ bg, primary, onDone }: { bg: string; primary: string; onDone: () => void }) {
  return (
    <div className={s.doorsWrap}>
      <div className={s.doorL} style={{ background: `linear-gradient(135deg, ${bg}, color-mix(in srgb, ${primary} 15%, ${bg}))` }} onAnimationEnd={onDone}/>
      <div className={s.doorR} style={{ background: `linear-gradient(225deg, ${bg}, color-mix(in srgb, ${primary} 15%, ${bg}))` }}/>
    </div>
  );
}

function AnimEnvelope({ bg, primary, initials, onDone }: { bg: string; primary: string; initials: [string, string]; onDone: () => void }) {
  return (
    <div className={s.envWrap} style={{ background: bg }} onAnimationEnd={onDone}>
      <div className={s.envBody}>
        <div className={s.envBack} style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${primary} 20%, ${bg}), ${bg})`, border: `1px solid ${primary}44` }}/>
        <div className={s.envFlap} style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${primary} 25%, ${bg}), ${bg})`, border: `1px solid ${primary}33` }}/>
        <div className={s.envSeal} style={{ background: primary, color: bg, fontSize: 11 }}>
          {initials[0]}{initials[1]}
        </div>
      </div>
    </div>
  );
}

const CONFETTI_COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B","#CC5DE8","#F06595"];
function AnimConfetti({ bg, onDone }: { bg: string; onDone: () => void }) {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i, color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.4}s`,
    duration: `${1.2 + Math.random() * 1}s`,
    size: 6 + Math.floor(Math.random() * 6),
  }));
  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className={s.confettiPiece}
          style={{ left: p.left, background: p.color, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}
      <div className={`${s.overlay} ${s.animConfetti}`} style={{ background: bg }} onAnimationEnd={onDone}/>
    </>
  );
}

/* ── Main component ────────────────────────────────── */
interface Props {
  spec: DynamicThemeSpec;
  invitationId: string;
  guestName?: string;
  guestToken?: string;
  alreadyResponded?: boolean;
}

export default function DynamicTheme({ spec, invitationId, guestName, guestToken, alreadyResponded }: Props) {
  const [revealed, setRevealed] = useState(false);
  const onDone = useCallback(() => setRevealed(true), []);

  const { palette, typography, ornements, animation, sections, content, shape } = spec;
  const headlineFont = HEADLINE_FONTS[typography.headline] ?? "'Cormorant Garamond', serif";
  const bodyFont = BODY_FONTS[typography.body] ?? "'Cormorant Garamond', serif";
  const OrnComp = ORNS[ornements.style] ?? OrnMinimal;

  const shapeClass = {
    arch: s.shapeArch, oval: s.shapeOval, rectangle: "",
    hexagon: s.shapeHexagon, diamond: s.shapeDiamond,
  }[shape] ?? "";

  // stagger helper
  const appear = (delay: number): React.CSSProperties => ({
    animationDelay: `${delay}s`,
    animationPlayState: revealed ? "running" : "paused",
  });

  return (
    <div
      className={s.root}
      style={{ background: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, ${palette.primary} 12%, ${palette.bg}), ${palette.bg} 60%)`, fontFamily: bodyFont, color: palette.text, direction: typography.rtl ? "rtl" : "ltr" }}
    >
      {/* Ambient glows */}
      <div className={s.ambience}>
        <div className={s.glow} style={{ background: `radial-gradient(circle, ${palette.primary}, transparent 70%)` }} />
        <div className={s.glow} style={{ background: `radial-gradient(circle, ${palette.primaryBright}, transparent 70%)`, bottom: -120, right: -80, top: "auto", left: "auto" }} />
      </div>

      {/* Opening animation */}
      {!revealed && animation === "fade"      && <AnimFade     bg={palette.bg} onDone={onDone} />}
      {!revealed && animation === "rise"      && <AnimRise     onDone={onDone} />}
      {!revealed && animation === "doors"     && <AnimDoors    bg={palette.bg} primary={palette.primary} onDone={onDone} />}
      {!revealed && animation === "envelope"  && <AnimEnvelope bg={palette.bg} primary={palette.primary} initials={content.initials} onDone={onDone} />}
      {!revealed && animation === "confetti"  && <AnimConfetti bg={palette.bg} onDone={onDone} />}

      {/* Invitation card */}
      <div
        className={`${s.card} ${shapeClass} ${(animation === "rise" && !revealed) ? s.animRise : ""}`}
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${palette.primary} 8%, ${palette.bgCard}), ${palette.bgCard})`,
          opacity: revealed || animation === "rise" ? 1 : 0,
          transition: "opacity 0.5s ease 0.1s",
          marginTop: shape === "arch" ? "3rem" : "2rem",
          marginBottom: "3rem",
        }}
      >
        {/* Frame borders (not on hexagon/diamond) */}
        {shape !== "hexagon" && shape !== "diamond" && (
          <>
            <div className={s.frame} style={{ borderColor: palette.primary }}/>
            <div className={s.frameInner} style={{ borderColor: palette.primary }}/>
          </>
        )}

        {/* Top ornement */}
        <div className={`${s.ornTop} ${s.appear}`} style={appear(0.1)}>
          <OrnComp color={ornements.accent} />
        </div>

        {/* Bismillah */}
        {sections.bismillah && content.bismillah && (
          <div className={`${s.bismillah} ${s.appear}`} style={{ ...appear(0.25), fontFamily: "'Amiri', serif", color: palette.primary }}>
            بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيم
          </div>
        )}

        {/* Guest badge */}
        {guestName && (
          <div className={`${s.guestBadge} ${s.appear}`} style={{ ...appear(0.2), borderColor: `${palette.primary}66`, color: palette.textSoft }}>
            Invitation de {guestName}
          </div>
        )}

        {/* Hosts */}
        <div className={`${s.hosts} ${s.appear}`} style={{ ...appear(0.3), fontFamily: headlineFont, color: palette.textSoft, letterSpacing: typography.rtl ? "0.04em" : "0.26em" }}>
          {content.hosts}
        </div>

        {/* Invitation line */}
        <div className={`${s.invLine} ${s.appear}`} style={{ ...appear(0.38), color: palette.textSoft }}>
          {content.invitationLine}
        </div>

        {/* Names */}
        <div className={`${s.names} ${s.appear}`} style={{ ...appear(0.45), fontFamily: headlineFont, color: palette.primaryBright }}>
          {content.names[0]}
        </div>
        <div className={`${s.separator} ${s.appear}`} style={{ ...appear(0.52), color: palette.textSoft }}>
          — {content.namesSeparator} —
        </div>
        <div className={`${s.names} ${s.appear}`} style={{ ...appear(0.58), fontFamily: headlineFont, color: palette.primaryBright }}>
          {content.names[1]}
        </div>

        {/* Initials */}
        <div className={`${s.initials} ${s.appear}`} style={{ ...appear(0.64), color: palette.primary }}>
          {content.initials[0]} &amp; {content.initials[1]}
        </div>

        {/* Divider */}
        <div className={`${s.divider} ${s.appear}`} style={{ ...appear(0.68), background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)` }}/>

        {/* Details grid */}
        <div className={`${s.detailsGrid} ${s.appear}`} style={appear(0.72)}>
          {[
            { label: "Date", value: new Date(content.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
            { label: "Heure", value: content.time },
          ].map(({ label, value }) => (
            <div key={label} className={s.detailBox} style={{ background: `color-mix(in srgb, ${palette.primary} 8%, ${palette.bgCard})`, border: `1px solid ${palette.primary}33` }}>
              <div className={s.detailLabel} style={{ color: palette.textSoft }}>{label}</div>
              <div className={s.detailValue} style={{ color: palette.text }}>{value}</div>
            </div>
          ))}
          <div className={`${s.detailBox} ${s.venueFull}`} style={{ background: `color-mix(in srgb, ${palette.primary} 8%, ${palette.bgCard})`, border: `1px solid ${palette.primary}33` }}>
            <div className={s.detailLabel} style={{ color: palette.textSoft }}>Lieu</div>
            <div className={s.detailValue} style={{ color: palette.text }}>{content.venue}</div>
            {content.venueSub && <div style={{ color: palette.textSoft, fontSize: "0.8rem", marginTop: 2 }}>{content.venueSub}</div>}
          </div>
        </div>

        {/* Countdown */}
        {sections.countdown && (
          <div className={s.appear} style={appear(0.78)}>
            <Countdown date={content.date} color={palette.primary} textColor={palette.textSoft} />
          </div>
        )}

        {/* Divider */}
        <div className={`${s.divider} ${s.appear}`} style={{ ...appear(0.82), background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)` }}/>

        {/* Closing */}
        <div className={`${s.closing} ${s.appear}`} style={{ ...appear(0.86), fontFamily: headlineFont, color: palette.primary }}>
          {content.closing}
        </div>

        {/* Note */}
        {content.note && (
          <div className={`${s.note} ${s.appear}`} style={{ ...appear(0.9), color: palette.textSoft }}>
            {content.note}
          </div>
        )}

        {/* Bottom ornement */}
        <div className={`${s.ornBottom} ${s.appear}`} style={{ ...appear(0.94), transform: "scaleY(-1)", marginTop: "1.6rem" }}>
          <OrnComp color={ornements.accent} />
        </div>
      </div>

      {/* RSVP */}
      {sections.rsvp && (
        <div style={{ width: "100%", maxWidth: 520, margin: "0 auto 3rem", padding: "0 1rem", opacity: revealed ? 1 : 0, transition: "opacity 0.5s ease 0.8s" }}>
          {alreadyResponded
        ? <p style={{ textAlign: "center", color: palette.primary, fontFamily: bodyFont, fontSize: "0.9rem", padding: "1.2rem", opacity: 0.8 }}>Vous avez déjà répondu à cette invitation. Merci !</p>
        : <PublicRsvpForm invitationId={invitationId} />
      }
        </div>
      )}
    </div>
  );
}
