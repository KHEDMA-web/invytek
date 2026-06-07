import type { ThemeConfig } from "@/themes/types";

export const bordeauxImperialConfig: ThemeConfig = {
  id: "business-bordeaux-imperial",
  category: "business",
  name: "Bordeaux Impérial",
  slug: "bordeaux-imperial",
  isPremium: true,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#BE9647",
    primaryBright: "#E1C06C",
    primaryLight: "#F1DDA2",
    primaryPale: "#F8EDD0",
    primaryDeep: "#8A6A28",
    primaryDarker: "#6B5020",
    bg1: "#160509",
    bg2: "#1f070d",
    cardBg: "#2a0a12",
    cardBgWarm: "#3a0e18",
    ink: "#F5ECDC",
    inkSoft: "rgba(245,236,220,.52)",
    inkBody: "rgba(245,236,220,.82)",
  },
  fonts: { script: "Pinyon Script", title: "Marcellus", body: "Cormorant Garamond", seal: "Marcellus" },
};
