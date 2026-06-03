"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  dark?: boolean;
}

export function GuestQrCode({ dark = true }: Props) {
  const [url, setUrl] = useState("");
  useEffect(() => { setUrl(window.location.href); }, []);
  if (!url) return null;

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 50,
      background: dark ? "rgba(20,16,10,0.92)" : "rgba(255,255,255,0.92)",
      border: `1px solid ${dark ? "rgba(184,146,60,0.4)" : "rgba(0,0,0,0.12)"}`,
      borderRadius: 12, padding: "0.9rem 1rem",
      backdropFilter: "blur(10px)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
      textAlign: "center",
      maxWidth: 160,
    }}>
      <p style={{
        fontFamily: "'Marcellus', serif", fontSize: 9, letterSpacing: ".18em",
        textTransform: "uppercase", color: dark ? "rgba(184,146,60,0.8)" : "#5a5a5a",
        marginBottom: 8,
      }}>
        QR Code entrée
      </p>
      <QRCodeSVG
        value={url}
        size={120}
        bgColor={dark ? "#14100a" : "#ffffff"}
        fgColor={dark ? "#D4AF61" : "#1a1a1a"}
        style={{ display: "block", margin: "0 auto" }}
      />
      <p style={{
        fontFamily: "'Marcellus', serif", fontSize: 8, letterSpacing: ".1em",
        color: dark ? "rgba(184,146,60,0.4)" : "#aaaaaa",
        marginTop: 6,
      }}>
        À présenter à l&apos;entrée
      </p>
    </div>
  );
}
