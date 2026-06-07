import type { ThemeConfig } from "@/themes/types";

export const couronneRoyaleConfig: ThemeConfig = {
  id: "wedding-couronne-royale",
  category: "wedding",
  name: "Couronne Royale",
  slug: "couronne-royale",
  isPremium: true,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#C29A4B",
    primaryBright: "#E7C76C",
    primaryLight: "#F3E2A8",
    primaryPale: "#F8F0D5",
    primaryDeep: "#8A6A28",
    primaryDarker: "#6B5020",
    bg1: "#0b1330",
    bg2: "#101b42",
    cardBg: "#0e1738",
    cardBgWarm: "#13204c",
    ink: "#F6F1E4",
    inkSoft: "rgba(246,241,228,.52)",
    inkBody: "rgba(246,241,228,.84)",
  },
  fonts: { script: "Pinyon Script", title: "Marcellus", body: "Cormorant Garamond", seal: "Marcellus" },
};
