import type { ThemeConfig } from "@/themes/types";

export const ivoireMinimalConfig: ThemeConfig = {
  id: "ivoire-minimal",
  category: "wedding",
  name: "Ivoire Minimal",
  slug: "ivoire-minimal",
  isPremium: false,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#B8923C",
    primaryBright: "#D4AF61",
    primaryLight: "#E8D8B0",
    primaryPale: "#F3E9D2",
    primaryDeep: "#6E5618",
    primaryDarker: "#4A3810",
    bg1: "#14100a",
    bg2: "#1a160f",
    cardBg: "#221b12",
    cardBgWarm: "#191409",
    ink: "#F7F1E6",
    inkSoft: "rgba(247,241,230,0.5)",
    inkBody: "rgba(247,241,230,0.86)",
  },
  fonts: {
    script: "Pinyon Script",
    title: "Marcellus",
    body: "Cormorant Garamond",
    seal: "Marcellus",
  },
};
