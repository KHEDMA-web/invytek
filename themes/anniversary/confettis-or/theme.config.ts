import type { ThemeConfig } from "@/themes/types";

export const confettisOrConfig: ThemeConfig = {
  id: "confettis-or",
  category: "birthday",
  name: "Confettis d'Or",
  slug: "confettis-or",
  isPremium: false,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#B8923C",
    primaryBright: "#D4AF61",
    primaryLight: "#F0D080",
    primaryPale: "#F5F0E8",
    primaryDeep: "#6E5618",
    primaryDarker: "#4A3810",
    bg1: "#14100a",
    bg2: "#1c1710",
    cardBg: "#1b1610",
    cardBgWarm: "#221b11",
    ink: "rgba(245,240,232,0.84)",
    inkSoft: "rgba(245,240,232,0.52)",
    inkBody: "rgba(245,240,232,0.84)",
  },
  fonts: {
    script: "Pinyon Script",
    title: "Marcellus",
    body: "Cormorant Garamond",
    seal: "Marcellus",
  },
};
