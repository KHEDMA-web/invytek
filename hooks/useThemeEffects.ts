"use client";

import { useEffect } from "react";

interface SparkleOpts {
  color?: string;
  count?: number;
}

interface PetalOpts {
  color?: string;
  count?: number;
  shape?: "ellipse" | "round";
}

export function useSparkles(ref: React.RefObject<HTMLDivElement | null>, opts: SparkleOpts = {}) {
  const { color = "#E7C76C", count = 55 } = opts;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dots: HTMLDivElement[] = [];
    for (let i = 0; i < count; i++) {
      const sp = document.createElement("div");
      const size = Math.random() * 2.5 + 1.2;
      Object.assign(sp.style, {
        position: "fixed",
        left: Math.random() * 100 + "vw",
        bottom: "-6px",
        width: size + "px",
        height: size + "px",
        borderRadius: "50%",
        background: color,
        opacity: (Math.random() * 0.45 + 0.15).toFixed(2),
        pointerEvents: "none",
        animation: `spkFloat ${Math.random() * 14 + 10}s linear ${Math.random() * 14}s infinite`,
      });
      el.appendChild(sp);
      dots.push(sp);
    }
    return () => dots.forEach(d => d.remove());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function usePetals(ref: React.RefObject<HTMLDivElement | null>, opts: PetalOpts = {}) {
  const { color = "rgba(220,160,170,0.55)", count = 16, shape = "ellipse" } = opts;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const petals: HTMLDivElement[] = [];
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      const w = Math.random() * 9 + 7;
      const h = shape === "ellipse" ? w * 1.6 : w;
      Object.assign(p.style, {
        position: "fixed",
        left: Math.random() * 110 - 5 + "%",
        top: "-20px",
        width: w + "px",
        height: h + "px",
        borderRadius: shape === "ellipse" ? "50% 50% 50% 50% / 60% 60% 40% 40%" : "50%",
        background: color,
        opacity: (Math.random() * 0.5 + 0.3).toFixed(2),
        pointerEvents: "none",
        transform: `rotate(${Math.random() * 60 - 30}deg)`,
        animation: `petalFall ${Math.random() * 7 + 8}s ease-in ${Math.random() * 10}s infinite`,
      });
      el.appendChild(p);
      petals.push(p);
    }
    return () => petals.forEach(p => p.remove());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useTilt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    let raf: number;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cx = innerWidth / 2, cy = innerHeight / 2;
        const rx = (e.clientY - cy) / cy * -2.5;
        const ry = (e.clientX - cx) / cx * 2.5;
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      card.style.transform = "rotateX(0) rotateY(0)";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
