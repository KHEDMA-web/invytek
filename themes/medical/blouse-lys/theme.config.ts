import type { ThemeConfig } from "@/themes/types";

export const blouseLysConfig: ThemeConfig = {
  id: "blouse-lys",
  category: "medical",
  name: "Blouse & Lys",
  slug: "blouse-lys",
  isPremium: false,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#4A6B52",
    primaryBright: "#7AA882",
    primaryLight: "#B0CEB5",
    primaryPale: "#E0EEE2",
    primaryDeep: "#2E4A34",
    primaryDarker: "#1A2E1E",
    bg1: "#0F1210",
    bg2: "#141A15",
    cardBg: "#161d17",
    cardBgWarm: "#1a2219",
    ink: "rgba(240,238,230,0.82)",
    inkSoft: "rgba(240,238,230,0.5)",
    inkBody: "rgba(240,238,230,0.82)",
  },
  fonts: {
    script: "Pinyon Script",
    title: "Marcellus",
    body: "Cormorant Garamond",
    seal: "Marcellus",
  },
};
