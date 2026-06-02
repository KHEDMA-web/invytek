"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { WeddingOptions } from "@/lib/schemas/wedding";

interface Props {
  invitationId: string;
  currentOptions: Partial<WeddingOptions>;
}

export function QrCodeToggle({ invitationId, currentOptions }: Props) {
  const [enabled, setEnabled] = useState(currentOptions.showQrCode ?? false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    const res = await fetch(`/api/invitations/${invitationId}/options`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showQrCode: next }),
    });
    if (!res.ok) {
      setEnabled(!next);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`btn btn-sm ${enabled ? "btn-gold" : "btn-ghost"}`}
      style={{ display: "flex", alignItems: "center", gap: 6 }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width={14} height={14}>
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        <path d="M14 14h.01M17 14h.01M20 14h.01M14 17h.01M17 17h.01M20 17h.01M14 20h.01M17 20h.01M20 20h.01"/>
      </svg>
      QR Code {enabled ? "activé" : "désactivé"}
    </button>
  );
}
