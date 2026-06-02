import type { ThemeConfig } from "@/themes/types";

export const bordeauxOvalConfig: ThemeConfig = {
  id: "bordeaux-oval",
  category: "wedding",
  name: "Bordeaux & Ovale Floral",
  slug: "bordeaux-oval",
  isPremium: false,
  shape: "oval",
  openingAnimation: "envelope",
  tokens: {
    primary: "#8A1726",
    primaryBright: "#A82236",
    primaryLight: "#E8C4C0",
    primaryPale: "#F5E3DF",
    primaryDeep: "#6B0F1D",
    primaryDarker: "#540B16",
    bg1: "#2A0A10",
    bg2: "#3E1018",
    cardBg: "#FDFAF6",
    cardBgWarm: "#FBF3ED",
    ink: "#4A2328",
    inkSoft: "#7A4A4E",
    inkBody: "#5C2A30",
  },
  fonts: {
    script: "Pinyon Script",
    title: "Marcellus",
    body: "Cormorant Garamond",
    seal: "Marcellus",
    arabic: "Amiri",
  },
};
