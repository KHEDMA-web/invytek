import type { ThemeConfig } from "@/themes/types";

export const inauguralionConfig: ThemeConfig = {
  id: "inauguration",
  category: "business",
  name: "Inauguration",
  slug: "inauguration",
  isPremium: false,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#1F5B43",
    primaryBright: "#2E8060",
    primaryLight: "#7ABFA0",
    primaryPale: "#D8EFE6",
    primaryDeep: "#143b2c",
    primaryDarker: "#0b2419",
    bg1: "#FBF8F2",
    bg2: "#F3EEE2",
    cardBg: "#FFFFFF",
    cardBgWarm: "#FBF8F2",
    ink: "#26302A",
    inkSoft: "#5d685f",
    inkBody: "#26302A",
  },
  fonts: {
    script: "Pinyon Script",
    title: "Marcellus",
    body: "Cormorant Garamond",
    seal: "Space Grotesk",
  },
};
