import type { ThemeConfig } from "@/themes/types";

export const congresMedicalConfig: ThemeConfig = {
  id: "congres-medical",
  category: "medical",
  name: "Congrès Médical",
  slug: "congres-medical",
  isPremium: false,
  shape: "rectangle",
  openingAnimation: "fade",
  tokens: {
    primary: "#128C7E",
    primaryBright: "#3FC6A8",
    primaryLight: "#8ADFD0",
    primaryPale: "#E0F5F1",
    primaryDeep: "#0c5f55",
    primaryDarker: "#083d37",
    bg1: "#F4F8FA",
    bg2: "#EEF5F6",
    cardBg: "#FFFFFF",
    cardBgWarm: "#F8FCFC",
    ink: "#16323B",
    inkSoft: "#5a7079",
    inkBody: "#16323B",
  },
  fonts: {
    script: "Space Grotesk",
    title: "Space Grotesk",
    body: "IBM Plex Sans",
    seal: "Space Grotesk",
  },
};
