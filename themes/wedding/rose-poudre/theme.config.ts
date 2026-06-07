import type { ThemeConfig } from "@/themes/types";

export const rosePoudreConfig: ThemeConfig = {
  id: "wedding-rose-poudre",
  category: "wedding",
  name: "Rose Poudré",
  slug: "rose-poudre",
  isPremium: true,
  shape: "rectangle",
  openingAnimation: "envelope",
  tokens: {
    primary: "#C49A48",
    primaryBright: "#E0BC6A",
    primaryLight: "#EDD38C",
    primaryPale: "#F5E9C4",
    primaryDeep: "#9A7430",
    primaryDarker: "#7A5A20",
    bg1: "#FBEFF1",
    bg2: "#FDF7F8",
    cardBg: "#FDF7F8",
    cardBgWarm: "#FBEFF1",
    ink: "#6B4350",
    inkSoft: "rgba(107,67,80,.56)",
    inkBody: "rgba(107,67,80,.82)",
  },
  fonts: { script: "Pinyon Script", title: "Marcellus", body: "Cormorant Garamond", seal: "Pinyon Script" },
};
