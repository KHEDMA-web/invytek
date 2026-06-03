import type { ThemeConfig } from "@/themes/types";

export const conferenceTechConfig: ThemeConfig = {
  id: "conference-tech",
  category: "business",
  name: "Conférence Tech",
  slug: "conference-tech",
  isPremium: false,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#38E1FF",
    primaryBright: "#7AEEFF",
    primaryLight: "#B0F0FF",
    primaryPale: "#E0F9FF",
    primaryDeep: "#1AB0CC",
    primaryDarker: "#0E7A90",
    bg1: "#0B1020",
    bg2: "#0E1530",
    cardBg: "#16204266",
    cardBgWarm: "#1a2650",
    ink: "rgba(234,240,255,0.9)",
    inkSoft: "rgba(234,240,255,0.6)",
    inkBody: "rgba(234,240,255,0.84)",
  },
  fonts: {
    script: "Space Grotesk",
    title: "Space Grotesk",
    body: "IBM Plex Sans",
    seal: "Space Grotesk",
  },
};
