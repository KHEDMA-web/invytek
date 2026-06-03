import type { ThemeConfig } from "./types";
import { goldArchConfig } from "./wedding/gold-arch/theme.config";
import { bordeauxOvalConfig } from "./wedding/bordeaux-oval/theme.config";
import { ivoireMinimalConfig } from "./wedding/ivoire-minimal/theme.config";
import { confettisOrConfig } from "./anniversary/confettis-or/theme.config";
import { soireePrestigeConfig } from "./business/soiree-prestige/theme.config";
import { blouseLysConfig } from "./medical/blouse-lys/theme.config";
import { annivNeonConfig } from "./anniversary/anniv-neon/theme.config";
import { babyShowerConfig } from "./baby/baby-shower/theme.config";
import { conferenceTechConfig } from "./business/conference-tech/theme.config";
import { congresMedicalConfig } from "./medical/congres-medical/theme.config";
import { inauguralionConfig } from "./business/inauguration/theme.config";
import { sensibilisationConfig } from "./medical/sensibilisation/theme.config";

export const themeRegistry: ThemeConfig[] = [
  goldArchConfig,
  bordeauxOvalConfig,
  ivoireMinimalConfig,
  confettisOrConfig,
  soireePrestigeConfig,
  blouseLysConfig,
  annivNeonConfig,
  babyShowerConfig,
  conferenceTechConfig,
  congresMedicalConfig,
  inauguralionConfig,
  sensibilisationConfig,
];

export function getTheme(slug: string): ThemeConfig | undefined {
  return themeRegistry.find((t) => t.slug === slug);
}

export function getThemesByCategory(category: string): ThemeConfig[] {
  return themeRegistry.filter((t) => t.category === category);
}
