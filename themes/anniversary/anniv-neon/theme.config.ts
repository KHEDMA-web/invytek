import type { ThemeConfig } from "@/themes/types";

export const annivNeonConfig: ThemeConfig = {
  id: "anniv-neon",
  category: "birthday",
  name: "Neon Burst",
  slug: "anniv-neon",
  isPremium: false,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#FF3CAC",
    primaryBright: "#FF6CC4",
    primaryLight: "#FFB0DC",
    primaryPale: "#FFE0F0",
    primaryDeep: "#C41A7A",
    primaryDarker: "#8A1050",
    bg1: "#0A0A0F",
    bg2: "#12101c",
    cardBg: "#1e1634",
    cardBgWarm: "#221a3a",
    ink: "rgba(242,238,255,0.9)",
    inkSoft: "rgba(242,238,255,0.6)",
    inkBody: "rgba(242,238,255,0.84)",
  },
  fonts: {
    script: "Caveat",
    title: "Space Grotesk",
    body: "IBM Plex Sans",
    seal: "Space Grotesk",
  },
};
