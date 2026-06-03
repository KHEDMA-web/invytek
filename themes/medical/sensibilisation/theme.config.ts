import type { ThemeConfig } from "@/themes/types";

export const sensibilisationConfig: ThemeConfig = {
  id: "sensibilisation",
  category: "medical",
  name: "Journée de Sensibilisation",
  slug: "sensibilisation",
  isPremium: false,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#E0518A",
    primaryBright: "#F07AAE",
    primaryLight: "#F8B0CC",
    primaryPale: "#FDE0EC",
    primaryDeep: "#b83c6e",
    primaryDarker: "#8a2a52",
    bg1: "#FBF6F4",
    bg2: "#F6EEEC",
    cardBg: "#FFFFFF",
    cardBgWarm: "#FBF6F4",
    ink: "#34282b",
    inkSoft: "#7a6a6e",
    inkBody: "#34282b",
  },
  fonts: {
    script: "Marcellus",
    title: "Marcellus",
    body: "Cormorant Garamond",
    seal: "Space Grotesk",
  },
};
