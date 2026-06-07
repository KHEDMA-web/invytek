import type { ThemeConfig } from "@/themes/types";

export const sceauDeRoseConfig: ThemeConfig = {
  id: "wedding-sceau-de-rose",
  category: "wedding",
  name: "Sceau de Rose",
  slug: "sceau-de-rose",
  isPremium: true,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#BF9A48",
    primaryBright: "#D9B567",
    primaryLight: "#EBD79C",
    primaryPale: "#F5EAC8",
    primaryDeep: "#8A6A28",
    primaryDarker: "#6B5020",
    bg1: "#F0E6D2",
    bg2: "#F7F0E0",
    cardBg: "#FBF6EA",
    cardBgWarm: "#F7F0E0",
    ink: "#5A4326",
    inkSoft: "rgba(90,67,38,.56)",
    inkBody: "rgba(90,67,38,.84)",
  },
  fonts: { script: "Pinyon Script", title: "Marcellus", body: "Cormorant Garamond", seal: "Pinyon Script" },
};
