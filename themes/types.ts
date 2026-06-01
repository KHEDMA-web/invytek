export interface ThemeTokens {
  primary: string;
  primaryBright: string;
  primaryLight: string;
  primaryPale: string;
  primaryDeep: string;
  primaryDarker: string;
  bg1: string;
  bg2: string;
  cardBg: string;
  cardBgWarm: string;
  ink: string;
  inkSoft: string;
  inkBody: string;
}

export interface ThemeConfig {
  id: string;
  category: string;
  name: string;
  slug: string;
  isPremium: boolean;
  shape: "arch" | "oval" | "rectangle";
  openingAnimation: "envelope" | "floral-doors" | "fade";
  tokens: ThemeTokens;
  fonts: {
    script: string;
    title: string;
    body: string;
    seal: string;
    arabic?: string;
  };
}

export interface ThemeProps<T = Record<string, unknown>> {
  content: T;
  options?: {
    showCountdown?: boolean;
    showRsvp?: boolean;
    showArabic?: boolean;
    showNote?: boolean;
  };
  invitationId?: string;
}
