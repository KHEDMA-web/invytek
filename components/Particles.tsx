"use client";

import { useEffect, useRef } from "react";

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let W = 0, H = 0, dpr = 1;
    let rafId: number;
    type Dot = { x: number; y: number; r: number; vy: number; vx: number; a: number; tw: number };
    let dots: Dot[] = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function build() {
      const n = Math.round(Math.min(70, (W * H) / 26000));
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.7 + 0.4,
        vy: -(Math.random() * 0.28 + 0.06),
        vx: (Math.random() - 0.5) * 0.18,
        a: Math.random() * Math.PI * 2,
        tw: Math.random() * 0.04 + 0.01,
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const d of dots) {
        d.y += d.vy; d.x += d.vx; d.a += d.tw;
        if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
        if (d.x < -10) d.x = W + 10;
        if (d.x > W + 10) d.x = -10;
        const op = (Math.sin(d.a) * 0.5 + 0.5) * 0.55 + 0.08;
        ctx.beginPath();
        ctx.arc(d.x, d.y, Math.max(0.2, d.r), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,97,${op.toFixed(3)})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(212,175,97,0.6)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      rafId = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particles"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}
    />
  );
}
