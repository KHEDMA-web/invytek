import type { ThemeConfig } from "@/themes/types";

export const slateGoldConfig: ThemeConfig = {
  id: "slate-gold",
  category: "business",
  name: "Slate & Or",
  slug: "slate-gold",
  isPremium: false,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#C9A84C",
    primaryBright: "#E8C96A",
    primaryLight: "#F0D98A",
    primaryPale: "#FAF3DC",
    primaryDeep: "#A07830",
    primaryDarker: "#7A5A20",
    bg1: "#0D1117",
    bg2: "#161B22",
    cardBg: "#1C2333",
    cardBgWarm: "#21293D",
    ink: "#F0F6FC",
    inkSoft: "#8B949E",
    inkBody: "#C9D1D9",
  },
  fonts: {
    script: "Playfair Display",
    title: "Montserrat",
    body: "Inter",
    seal: "Montserrat",
  },
};
