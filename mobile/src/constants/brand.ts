/**
 * CryptoCoach design tokens: indigo + metallic gray, with the fox's orange as accent.
 * Half Revolut (clean, metallic), half Duolingo (a mascot, playful rewards).
 * Every screen takes its colors from here, so the whole look changes in one place.
 */
export const Brand = {
  primary: '#1E28B8',      // indigo from the logo: buttons, highlights, celebrations
  primaryDark: '#141C8C',  // pressed buttons, wallet leather
  primarySoft: '#DADDF5',  // light indigo backgrounds
  fox: '#F57C1F',          // the fox's orange: accents, XP
  navy: '#0B1033',         // titles and main text
  textSecondary: '#565D72',
  background: '#DCDFE5',   // metallic gray page background (no pure white)
  surface: '#ECEEF2',      // cards
  card: '#F4F5F8',         // raised elements (choices, inputs, active tabs)
  border: '#C3C8D1',
  success: '#0E9F5B',      // gains
  danger: '#E03A31',       // losses
  xp: '#E58A12',           // XP and streak
} as const;

export const Radius = { sm: 10, md: 16, lg: 24, full: 999 } as const;
export const Space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

/**
 * Typography: Inter, a clean font used by many fintech apps.
 * With a custom font, each weight is its own file, so we pick the family
 * (Font.bold…) instead of using fontWeight.
 */
export const Font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
} as const;
