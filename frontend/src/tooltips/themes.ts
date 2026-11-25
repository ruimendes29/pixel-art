// Tooltip themes. Add an entry to add a theme: the name is then available in
// <Tooltip theme="…">. Colours are the app's CSS variables (index.css), so they
// follow the light and dark maps like the rest of the interface.
export interface TooltipThemeColors {
  background: string;
  color: string;
}

export const TOOLTIP_THEMES = {
  default: { background: "var(--tooltip-surface)", color: "var(--tooltip-text)" },
  accent: { background: "var(--primary-color)", color: "var(--on-primary)" },
  danger: { background: "var(--error-color)", color: "var(--on-primary)" },
};

export type TooltipTheme = keyof typeof TOOLTIP_THEMES;

// Compile-time check that every theme has both colours (TypeScript 4.6 has no `satisfies`)
const checkThemes: Record<TooltipTheme, TooltipThemeColors> = TOOLTIP_THEMES;
void checkThemes;
