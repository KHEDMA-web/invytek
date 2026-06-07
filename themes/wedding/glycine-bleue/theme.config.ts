import type { ThemeConfig } from "@/themes/types";

export const glycineBleuConfig: ThemeConfig = {
  id: "wedding-glycine-bleue",
  category: "wedding",
  name: "Glycine Bleue",
  slug: "glycine-bleue",
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
    bg1: "#F3F0E8",
    bg2: "#FAF8F2",
    cardBg: "#FAF8F2",
    cardBgWarm: "#F3F0E8",
    ink: "#22304F",
    inkSoft: "rgba(34,48,79,.56)",
    inkBody: "rgba(34,48,79,.82)",
  },
  fonts: { script: "Pinyon Script", title: "Marcellus", body: "Cormorant Garamond", seal: "Pinyon Script" },
};
