"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface Props {
  onScan: (token: string) => void;
  active: boolean;
}

export function QrScanner({ onScan, active }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const rafRef     = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);
  const lastScan   = useRef<string>("");

  useEffect(() => {
    if (!active) { stop(); return; }
    start();
    return stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function stop() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scan();
      }
    } catch {
      setError("Caméra inaccessible — autorisez l'accès dans les paramètres du navigateur.");
    }
  }

  function scan() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scan);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });

    if (code?.data && code.data !== lastScan.current) {
      lastScan.current = code.data;
      // extract token from URL or use raw value
      const raw = code.data;
      const t = raw.includes("/g/") ? raw.split("/g/").pop()! : raw;
      onScan(t);
      // reset after 2s to allow re-scan
      setTimeout(() => { lastScan.current = ""; }, 2000);
    }

    rafRef.current = requestAnimationFrame(scan);
  }

  if (error) {
    return (
      <div style={{ background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.3)",
        borderRadius: 12, padding: "1rem 1.2rem", color: "#e05252",
        fontFamily: "var(--font-title)", fontSize: 13 }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden",
      border: "1px solid rgba(184,146,60,0.3)", background: "#0a0805" }}>
      <video
        ref={videoRef}
        muted
        playsInline
        style={{ width: "100%", display: "block", maxHeight: 320, objectFit: "cover" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {/* Viewfinder overlay */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: 180, height: 180, border: "2px solid rgba(184,146,60,0.7)", borderRadius: 12, boxShadow: "0 0 0 2000px rgba(0,0,0,0.35)" }} />
      </div>
      <p style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center",
        fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase",
        color: "rgba(184,146,60,0.8)" }}>
        Pointez sur le QR code de l&apos;invité
      </p>
    </div>
  );
}
