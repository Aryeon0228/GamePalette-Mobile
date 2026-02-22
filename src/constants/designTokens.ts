/**
 * Central design tokens
 * Keep reusable design values here and progressively replace hardcoded values.
 */

export const COLOR_TOKENS = {
  // Brand / Accent — deeper charcoal for a premium feel
  accentPrimary: '#1C1C1E',
  accentLight: '#2C2C2E',
  accentInteractive: '#3A3A3C',
  accentMuted: '#48484A',
  accentVariationLightness: '#636366',
  accentVariationHueShift: '#48484A',

  // Semantic
  warning: '#FF9500',
  success: '#34C759',
  danger: '#FF3B30',
  info: '#32ADE6',

  // Text
  textPrimary: '#000000',
  textSecondary: '#3A3A3C',
  textMuted: '#8E8E93',
  textSubtle: '#AEAEB2',
  textFaint: '#C7C7CC',
  textDim: '#8E8E93',
  textDisabled: '#AEAEB2',
  textGhost: '#D1D1D6',

  // Backgrounds — cleaner canvas
  backgroundApp: '#F5F5F7',
  backgroundSurface: '#FFFFFF',
  backgroundSurfaceAlt: '#F2F2F7',
  backgroundControl: '#E5E5EA',
  backgroundElevated: '#FFFFFF',
  backgroundLayer: '#F2F2F7',
  backgroundActionBar: '#FFFFFF',
  backgroundCardAlt: '#F2F2F7',
  backgroundInput: '#F2F2F7',

  // Borders — subtle glass
  borderDefault: '#E5E5EA',
  borderSoft: '#F2F2F7',
  borderStrong: '#D1D1D6',
  borderSubtle: '#F2F2F7',
  borderNeutral: '#E5E5EA',
  borderHandle: '#D1D1D6',
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
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const FONT_SIZE_TOKENS = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  title: 24,
} as const;

export const SHADOW_TOKENS = {
  accentGlow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  neumorphicLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  neumorphicMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  glassmorphism: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 8,
  },
} as const;

export const ALPHA_TOKENS = {
  chipBg: '1A', // A bit more opaque
  chipBorder: '33', // Stronger border
} as const;

export type ColorToken = keyof typeof COLOR_TOKENS;
export type SpacingToken = keyof typeof SPACING_TOKENS;
export type RadiusToken = keyof typeof RADIUS_TOKENS;
export type FontSizeToken = keyof typeof FONT_SIZE_TOKENS;
