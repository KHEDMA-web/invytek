import type { ThemeConfig } from "@/themes/types";

export const goldArchConfig: ThemeConfig = {
  id: "wedding-gold-arch",
  category: "wedding",
  name: "Or & Arche",
  slug: "gold-arch",
  isPremium: false,
  shape: "arch",
  openingAnimation: "envelope",
  tokens: {
    primary: "#B8923C",
    primaryBright: "#D4AF61",
    primaryLight: "#E8D8B0",
    primaryPale: "#F3E9D2",
    primaryDeep: "#6E5618",
    primaryDarker: "#5A4612",
    bg1: "#14100a",
    bg2: "#221a0e",
    cardBg: "#FCFAF5",
    cardBgWarm: "#F7F1E6",
    ink: "#3A3220",
    inkSoft: "#6B5C3E",
    inkBody: "#463A1E",
  },
  fonts: {
    script: "Pinyon Script",
    title: "Marcellus",
    body: "Cormorant Garamond",
    seal: "Bolina",
    arabic: "Amiri",
  },
};
