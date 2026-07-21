// ─── Colors ──────────────────────────────────────────────────────────────────
// Source: PrakritAI Screen Inventory v1.1 + CLAUDE.md design system
export const colors = {
  // Backgrounds
  bg: '#FAFAFA',           // App background (light warm white)
  bgWarm: '#F8F4EE',       // Warmer bg variant (used in screen inventory)
  surface: '#F4F4F5',      // Card surface / input backgrounds
  white: '#FFFFFF',
  black: '#000000',

  // Borders
  border: '#E4E4E7',

  // Text
  text: '#09090B',          // ink — primary text
  textSecondary: '#71717A', // muted
  textTertiary: '#A1A1AA',  // faint

  // Teal (primary brand color)
  teal: '#00B894',
  tealLight: '#CCFBF1',
  tealLighter: '#E8FDF8',
  tealDark: '#007A64',      // used for grade A text, dark teal accents

  // Forest (deep green — hero sections, dark surfaces)
  forest: '#1B4332',
  forestLight: '#E8F5EE',

  // Sage (mid-green — secondary accents)
  sage: '#74B49B',

  // Orange (warm accent — doctor cards, CTAs, premium features)
  orange: '#C4521A',
  orangeLight: '#FEF3EE',

  // Yellow (grade B, medication reminders)
  yellow: '#D4A017',
  yellowLight: '#FEF3C7',

  // Rose (grade C, secondary alerts)
  rose: '#F472B6',
  roseLight: '#FCE7F3',

  // Red (grade D, critical alerts)
  red: '#EF4444',
  redLight: '#FEE2E2',

  // Blue (family circle, auth screens)
  blue: '#1D4ED8',
  blueLight: '#DBEAFE',

  // Purple (onboarding, modals)
  purple: '#6D28D9',
  purpleLight: '#EDE9FE',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
// Fonts loaded via expo-font (assets/fonts/)
export const fonts = {
  // Space Grotesk — headings, wordmarks, buttons, scores, badges
  spaceGrotesk: 'SpaceGrotesk-Regular',
  spaceGroteskMedium: 'SpaceGrotesk-Medium',
  spaceGroteskSemiBold: 'SpaceGrotesk-SemiBold',
  spaceGroteskBold: 'SpaceGrotesk-Bold',

  // Inter — body copy, labels, descriptions, secondary text
  inter: 'Inter-Regular',
  interMedium: 'Inter-Medium',
  interSemiBold: 'Inter-SemiBold',
} as const;

export const fontSizes = {
  xs: 11,
  sm: 12,
  base: 13,
  md: 14,
  lg: 15,
  xl: 16,
  '2xl': 17,
  '3xl': 20,
  '4xl': 22,
  '5xl': 24,
  '6xl': 28,
  '7xl': 32,
  '8xl': 36,
  hero: 42,
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  screenH: 24,   // horizontal screen padding
  card: 16,      // card inner padding
  section: 20,   // section vertical gap
  gap: 8,        // small gap between elements
  gapMd: 12,     // medium gap
  gapLg: 16,     // large gap
  gapXl: 24,     // extra large gap
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────
export const radius = {
  sm: 6,
  md: 10,
  card: 14,
  button: 13,
  chip: 50,
  avatar: 999,
} as const;

// ─── Grade system (health scores A/B/C/D) ────────────────────────────────────
export const gradeConfig = {
  A: { min: 80, max: 100, bg: '#CCFBF1', text: '#00725E', border: '#00B894' },
  B: { min: 60, max: 79,  bg: '#FEF3C7', text: '#8a5e0a', border: '#D4A017' },
  C: { min: 40, max: 59,  bg: '#FCE7F3', text: '#be185d', border: '#F472B6' },
  D: { min: 0,  max: 39,  bg: '#FEE2E2', text: '#b91c1c', border: '#EF4444' },
} as const;

export type Grade = keyof typeof gradeConfig;

