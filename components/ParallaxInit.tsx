"use client";

import { useEffect } from "react";

export function ParallaxInit() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const layers = document.querySelectorAll<HTMLElement>("[data-parallax]");
    if (!layers.length) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;
    let rafId: number;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    (function loop() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      layers.forEach((l) => {
        const d = parseFloat(l.getAttribute("data-parallax") || "10");
        l.style.transform = `translate3d(${cx * d}px,${cy * d}px,0)`;
      });
      rafId = requestAnimationFrame(loop);
    })();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return null;
}
