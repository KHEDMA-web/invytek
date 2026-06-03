import type { ThemeConfig } from "@/themes/types";

export const babyShowerConfig: ThemeConfig = {
  id: "baby-shower",
  category: "baby",
  name: "Baby Shower",
  slug: "baby-shower",
  isPremium: false,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#8FCDE8",
    primaryBright: "#5fa8cc",
    primaryLight: "#C5E4F3",
    primaryPale: "#EAF4FB",
    primaryDeep: "#3a7ea0",
    primaryDarker: "#265a74",
    bg1: "#FDF6F0",
    bg2: "#EAF4FB",
    cardBg: "#FFFFFF",
    cardBgWarm: "#fbfdff",
    ink: "#445660",
    inkSoft: "#7d8b93",
    inkBody: "#445660",
  },
  fonts: {
    script: "Caveat",
    title: "Quicksand",
    body: "Quicksand",
    seal: "Quicksand",
  },
};
