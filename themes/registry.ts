import type { ThemeConfig } from "./types";
import { goldArchConfig } from "./wedding/gold-arch/theme.config";

export const themeRegistry: ThemeConfig[] = [goldArchConfig];

export function getTheme(slug: string): ThemeConfig | undefined {
  return themeRegistry.find((t) => t.slug === slug);
}

export function getThemesByCategory(category: string): ThemeConfig[] {
  return themeRegistry.filter((t) => t.category === category);
}
