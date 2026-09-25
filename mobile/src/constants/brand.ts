/**
 * CryptoCoach design tokens: blue and white, Duolingo meets Revolut.
 * Every screen takes its colors, spacing and radius from here,
 * so changing the look of the whole app happens in one place.
 */
export const Brand = {
  primary: '#2F6BFF',      // main blue: buttons, highlights
  primaryDark: '#1A45C9',  // pressed buttons
  primarySoft: '#EAF0FF',  // light blue backgrounds
  navy: '#0A1633',         // titles and main text
  textSecondary: '#5B6785',
  background: '#FFFFFF',
  surface: '#F4F7FC',      // cards
  border: '#E3E8F2',
  success: '#12B76A',      // gains
  danger: '#F04438',       // losses
  xp: '#FDB022',           // XP and streak
} as const;

export const Radius = { sm: 10, md: 16, lg: 24, full: 999 } as const;
export const Space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
