"use client";

import { useState } from "react";

interface Props {
  contentTab: React.ReactNode;
  designTab: React.ReactNode;
}

export function EditTabs({ contentTab, designTab }: Props) {
  const [tab, setTab] = useState<"content" | "design">("content");

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(184,146,60,0.06)", border: "1px solid var(--hair)", borderRadius: 100, marginBottom: "2rem", width: "fit-content" }}>
        <button
          onClick={() => setTab("content")}
          style={{
            padding: "10px 24px", borderRadius: 100, border: "none", cursor: "pointer",
            fontFamily: "var(--font-title)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase",
            background: tab === "content" ? "linear-gradient(135deg, var(--gold-vivid), var(--accent))" : "transparent",
            color: tab === "content" ? "#2a2008" : "var(--text-soft)",
            transition: "all .25s",
          }}
        >
          Contenu
        </button>
        <button
          onClick={() => setTab("design")}
          style={{
            padding: "10px 24px", borderRadius: 100, border: "none", cursor: "pointer",
            fontFamily: "var(--font-title)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase",
            background: tab === "design" ? "linear-gradient(135deg, #a080e0, #7050c0)" : "transparent",
            color: tab === "design" ? "#fff" : "var(--text-soft)",
            transition: "all .25s",
          }}
        >
          ✨ Design IA
        </button>
      </div>

      {/* Tab content */}
      {tab === "content" ? contentTab : designTab}
    </div>
  );
}
