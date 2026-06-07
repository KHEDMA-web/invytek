import type { ThemeConfig } from "@/themes/types";

export const ivoireEmbosseConfig: ThemeConfig = {
  id: "wedding-ivoire-embosse",
  category: "wedding",
  name: "Ivoire Embossé",
  slug: "ivoire-embosse",
  isPremium: true,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#6B4A2E",
    primaryBright: "#8C6440",
    primaryLight: "#A8825C",
    primaryPale: "#C4A87E",
    primaryDeep: "#4d3420",
    primaryDarker: "#3A2818",
    bg1: "#E9E2D3",
    bg2: "#F1EBDD",
    cardBg: "#F7F2E8",
    cardBgWarm: "#F1EBDD",
    ink: "#564A35",
    inkSoft: "rgba(86,74,53,.56)",
    inkBody: "rgba(86,74,53,.84)",
  },
  fonts: { script: "Pinyon Script", title: "Marcellus", body: "Cormorant Garamond", seal: "Pinyon Script" },
};
