"use client";

import { useState } from "react";

interface Props { url: string; label?: string; small?: boolean; }

export function CopyLinkButton({ url, label = "Copier le lien", small }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={copy} className={`btn btn-ghost${small ? " btn-sm" : ""}`} style={{ whiteSpace: "nowrap" }}>
      {copied ? "Copié ✓" : label}
    </button>
  );
}
