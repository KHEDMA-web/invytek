import type { ThemeConfig } from "@/themes/types";

export const soireePrestigeConfig: ThemeConfig = {
  id: "soiree-prestige",
  category: "business",
  name: "Soirée Prestige",
  slug: "soiree-prestige",
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
    bg1: "#0A0A0F",
    bg2: "#12121A",
    cardBg: "#14141f",
    cardBgWarm: "#1a1a28",
    ink: "rgba(240,238,232,0.84)",
    inkSoft: "rgba(240,238,232,0.52)",
    inkBody: "rgba(240,238,232,0.84)",
  },
  fonts: {
    script: "Pinyon Script",
    title: "Marcellus",
    body: "Cormorant Garamond",
    seal: "Marcellus",
  },
};
