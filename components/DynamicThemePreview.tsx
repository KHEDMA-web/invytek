"use client";

import DynamicTheme from "@/themes/dynamic/DynamicTheme";
import type { DynamicThemeSpec } from "@/lib/schemas/dynamicTheme";

export function DynamicThemePreview({ spec }: { spec: DynamicThemeSpec }) {
  const scale = 290 / 375;
  return (
    <div style={{ width: "100%", height: 200, overflow: "hidden", position: "relative", background: spec.palette.bg }}>
      <div style={{ width: 375, height: 812, transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}>
        <DynamicTheme spec={spec} invitationId="gallery" />
      </div>
    </div>
  );
}
