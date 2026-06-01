"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Petal {
  id: number;
  left: string;
  width: string;
  height: string;
  duration: string;
  sway: string;
  opacity: string;
}

function getCountdown(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    j: String(Math.floor(diff / 86400000)).padStart(2, "0"),
    h: String(Math.floor(diff / 3600000) % 24).padStart(2, "0"),
    m: String(Math.floor(diff / 60000) % 60).padStart(2, "0"),
  };
}

const WED_TARGET = new Date("2026-09-12T18:00:00");
const BIZ_TARGET = new Date("2026-11-20T19:00:00");

export function InviteHero() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"wed" | "biz">("wed");
  const [petals, setPetals] = useState<Petal[]>([]);
  const [wedCd, setWedCd] = useState({ j: "00", h: "00", m: "00" });
  const [bizCd, setBizCd] = useState({ j: "00", h: "00", m: "00" });
  const petalIdRef = useRef(0);
  const petalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function tick() {
      setWedCd(getCountdown(WED_TARGET));
      setBizCd(getCountdown(BIZ_TARGET));
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const spawnPetal = useCallback(() => {
    const id = ++petalIdRef.current;
    const size = 7 + Math.random() * 9;
    const petal: Petal = {
      id,
      left: Math.random() * 100 + "%",
      width: size + "px",
      height: size * 1.3 + "px",
      duration: 5 + Math.random() * 4 + "s",
      sway: Math.random() * 50 - 25 + "px",
      opacity: (0.35 + Math.random() * 0.4).toFixed(2),
    };
    setPetals((prev) => [...prev, petal]);
    setTimeout(() => setPetals((prev) => prev.filter((p) => p.id !== id)), 9500);
  }, []);

  const startPetals = useCallback(() => {
    if (petalTimerRef.current) return;
    let count = 0;
    petalTimerRef.current = setInterval(() => {
      spawnPetal();
      if (++count > 60) {
        clearInterval(petalTimerRef.current!);
        petalTimerRef.current = null;
      }
    }, 420);
  }, [spawnPetal]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) startPetals();
      return !prev;
    });
  }, [startPetals]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setOpen(true); return; }
    const id = setTimeout(() => { setOpen(true); startPetals(); }, 1400);
    return () => clearTimeout(id);
  }, [startPetals]);

  const cls = ["invite", open ? "open" : "", mode === "biz" ? "biz" : ""].filter(Boolean).join(" ");

  return (
    <div className="hero-invite" data-parallax="12">
      <div className="invite-stage">
        <div className={cls} onClick={handleToggle}>
          <div className="petals">
            {petals.map((p) => (
              <span
                key={p.id}
                className="petal"
                style={{
                  left: p.left, width: p.width, height: p.height,
                  animationDuration: p.duration, opacity: p.opacity,
                  ["--sway" as string]: p.sway,
                }}
              />
            ))}
          </div>

          <div className="card">
            <div className="wed-content">
              <div className="ar">و دعوتكم بسعادة</div>
              <div className="invited">Vous êtes conviés au mariage de</div>
              <div className="names">Yacine<span className="amp">&amp;</span>Lina</div>
              <div className="date">12 · 09 · 2026 — Alger</div>
              <div className="seal-sm">Y&amp;L</div>
              <div className="cd">
                <div><span className="n">{wedCd.j}</span><span className="l">Jours</span></div>
                <div><span className="n">{wedCd.h}</span><span className="l">Heures</span></div>
                <div><span className="n">{wedCd.m}</span><span className="l">Min</span></div>
              </div>
            </div>
            <div className="biz-content">
              <div className="biz-rule" />
              <div className="invited">Vous êtes convié à notre</div>
              <div className="biz-title">Gala Annuel</div>
              <div className="biz-org">Atlas Corp</div>
              <div className="date" style={{ marginTop: 14 }}>20 · 11 · 2026</div>
              <div className="biz-place">Hôtel El Aurassi · Alger</div>
              <div className="seal-sm">AC</div>
              <div className="cd">
                <div><span className="n">{bizCd.j}</span><span className="l">Jours</span></div>
                <div><span className="n">{bizCd.h}</span><span className="l">Heures</span></div>
                <div><span className="n">{bizCd.m}</span><span className="l">Min</span></div>
              </div>
            </div>
          </div>

          <div className="env-back" />
          <div className="env-front" />
          <div className="flap" />
          <div className="seal">Y</div>
          <div className="hint">Touchez pour ouvrir</div>
        </div>
      </div>

      <div className="invite-switch">
        <button
          className={mode === "wed" ? "active" : ""}
          onClick={(e) => { e.stopPropagation(); setMode("wed"); }}
        >
          Mariage
        </button>
        <button
          className={mode === "biz" ? "active" : ""}
          onClick={(e) => { e.stopPropagation(); setMode("biz"); }}
        >
          Entreprise
        </button>
      </div>
    </div>
  );
}
