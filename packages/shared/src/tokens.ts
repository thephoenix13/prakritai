export const colors = {
  bg: '#FAFAFA',
  surface: '#F4F4F5',
  border: '#E4E4E7',
  text: '#09090B',
  textSecondary: '#71717A',
  textTertiary: '#A1A1AA',
  teal: '#00B894',
  tealLight: '#CCFBF1',
  tealLighter: '#E8FDF8',
  yellow: '#D4A017',
  yellowLight: '#FEF3C7',
  rose: '#F472B6',
  roseLight: '#FCE7F3',
  red: '#EF4444',
  redLight: '#FEE2E2',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  screenH: 24,
  card: 16,
  section: 20,
  gap: 8,
  gapMd: 12,
} as const;

export const radius = {
  card: 14,
  button: 13,
  chip: 50,
  avatar: 999,
} as const;

export const gradeConfig = {
  A: { min: 80, max: 100, bg: '#CCFBF1', text: '#00725E', border: '#00B894' },
  B: { min: 60, max: 79,  bg: '#FEF3C7', text: '#8a5e0a', border: '#D4A017' },
  C: { min: 40, max: 59,  bg: '#FCE7F3', text: '#be185d', border: '#F472B6' },
  D: { min: 0,  max: 39,  bg: '#FEE2E2', text: '#b91c1c', border: '#EF4444' },
} as const;

export type Grade = keyof typeof gradeConfig;
