/**
 * Brand colour palette as typed constants, for code that needs raw values
 * (charts, canvas/SVG drawing, <meta name="theme-color">, emails…).
 *
 * Components should NOT use these for styling — use the Tailwind token
 * classes (bg-primary, text-accent-foreground, …) defined in src/index.css,
 * which also switch automatically in dark mode.
 *
 * Keep these values in sync with the matching --color-* tokens in index.css.
 */
export const BRAND_COLORS = {
  light: {
    primary: '#7234ae',
    primaryForeground: '#ffffff',
    /** Light primary tint behind chips and hover states */
    accent: '#f4eff9',
    /** Primary-toned text on the accent tint */
    accentForeground: '#5b2a8c',
    ring: '#7234ae',
  },
  dark: {
    /** Primary lifted for dark surfaces (~5:1 with white text) */
    primary: '#8752ba',
    primaryForeground: '#ffffff',
    accent: '#251a35',
    accentForeground: '#d5c2e7',
    ring: '#8752ba',
  },
} as const;

export type ThemeColors = (typeof BRAND_COLORS)[keyof typeof BRAND_COLORS];
