/**
 * Central design tokens
 * Keep reusable design values here and progressively replace hardcoded values.
 */

export const COLOR_TOKENS = {
  // Brand / Accent — clean charcoal
  accentPrimary: '#2C2C2E',
  accentLight: '#48484A',
  accentInteractive: '#3A3A3C',
  accentMuted: '#636366',
  accentVariationLightness: '#636366',
  accentVariationHueShift: '#48484A',

  // Semantic
  warning: '#F5A623',
  success: '#34C759',
  danger: '#FF3B30',
  info: '#5AC8FA',

  // Text — dark on light
  textPrimary: '#1C1C1E',
  textSecondary: '#636366',
  textMuted: '#8E8E93',
  textSubtle: '#AEAEB2',
  textFaint: '#C7C7CC',
  textDim: '#8E8E93',
  textDisabled: '#AEAEB2',
  textGhost: '#D1D1D6',

  // Backgrounds — neumorphic light grays
  backgroundApp: '#ECECF0',
  backgroundSurface: '#F2F2F7',
  backgroundSurfaceAlt: '#E8E8ED',
  backgroundControl: '#DCDCE2',
  backgroundElevated: '#FFFFFF',
  backgroundLayer: '#E8E8ED',
  backgroundActionBar: '#F2F2F7',
  backgroundCardAlt: '#E8E8ED',
  backgroundInput: '#FFFFFF',

  // Borders — subtle
  borderDefault: '#D1D1D6',
  borderSoft: '#E5E5EA',
  borderStrong: '#C7C7CC',
  borderSubtle: '#E5E5EA',
  borderNeutral: '#D1D1D6',
  borderHandle: '#C7C7CC',
} as const;

export const SPACING_TOKENS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS_TOKENS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

export const FONT_SIZE_TOKENS = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  title: 23,
} as const;

export const SHADOW_TOKENS = {
  accentGlow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  neumorphicLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  neumorphicMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

export const ALPHA_TOKENS = {
  chipBg: '14',
  chipBorder: '2e',
} as const;

export type ColorToken = keyof typeof COLOR_TOKENS;
export type SpacingToken = keyof typeof SPACING_TOKENS;
export type RadiusToken = keyof typeof RADIUS_TOKENS;
export type FontSizeToken = keyof typeof FONT_SIZE_TOKENS;
