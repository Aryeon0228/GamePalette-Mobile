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

  // Channel colors (RGB bars)
  channelRed: '#ef4444',
  channelGreen: '#22c55e',
  channelBlue: '#3b82f6',

  // Functional accent colors
  pink: '#f472b6',
  amber: '#f59e0b',
  cyan: '#38bdf8',
  emerald: '#34d399',

  // iOS platform
  iosBlue: '#007AFF',
  iosBlueTint: '#E5F1FF',

  // Brand / SNS
  brandInstagram: '#c7587f',
  brandTwitter: '#1d9bf0',

  // Light mode overrides
  lightBorder: '#C6C6C8',

  // Export format colors
  exportPng: '#f472b6',
  exportJson: '#22c55e',
  exportCss: '#3b82f6',

  // Card option colors
  cardOptionHex: '#60a5fa',
  cardOptionStats: '#34d399',
  cardOptionHistogram: '#f59e0b',

  // Splash/brand decorative
  brandSparkle: '#f7d77f',
  brandTitleText: '#f8f9ff',
} as const;

export const OVERLAY_TOKENS = {
  // Scrim / backdrop
  scrimDark: 'rgba(0, 0, 0, 0.5)',
  scrimLight: 'rgba(0, 0, 0, 0.4)',
  scrimSubtle: 'rgba(0, 0, 0, 0.08)',

  // Glass surfaces
  glassWhite: 'rgba(255, 255, 255, 0.55)',
  glassWhiteBorder: 'rgba(255, 255, 255, 0.75)',
  glassWhiteThin: 'rgba(255, 255, 255, 0.35)',
  glassWhiteFaint: 'rgba(255, 255, 255, 0.45)',
  glassWhiteLoading: 'rgba(255, 255, 255, 0.7)',
  glassCaptureButton: 'rgba(255, 255, 255, 0.3)',

  // Text on color / overlay
  textOnColorPrimary: 'rgba(255, 255, 255, 0.85)',
  textOnColorMuted: 'rgba(255, 255, 255, 0.8)',
  textOnColorFaint: 'rgba(255, 255, 255, 0.6)',
  textOnColorGhost: 'rgba(255, 255, 255, 0.4)',
  textOnColorSubtle: 'rgba(255, 255, 255, 0.7)',
  textOnColorSnsRatio: 'rgba(255,255,255,0.7)',
  textOnMethodDesc: 'rgba(255,255,255,0.8)',

  // Dark overlays on color backgrounds
  darkOnColor: 'rgba(0, 0, 0, 0.3)',
  darkOnColorLight: 'rgba(0, 0, 0, 0.15)',
  darkOnColorMedium: 'rgba(0, 0, 0, 0.25)',
  darkOnColorButton: 'rgba(0, 0, 0, 0.6)',
  darkOnColorTrack: 'rgba(0, 0, 0, 0.12)',

  // SNS card specific
  snsCardScrim: 'rgba(0, 0, 0, 0.5)',
  snsCardHistogramBg: 'rgba(0, 0, 0, 0.3)',
  snsCardStatDivider: 'rgba(255, 255, 255, 0.2)',

  // Shadow tinting
  textShadowDark: 'rgba(0, 0, 0, 0.3)',
  textShadowSns: 'rgba(0, 0, 0, 0.35)',

  // Camera overlay
  cameraCloseBg: 'rgba(0,0,0,0.5)',

  // Splash decorative
  splashTint: 'rgba(0, 0, 0, 0.08)',
  splashAurora: 'rgba(255, 255, 255, 0.08)',
  splashBrandBg: 'rgba(8, 12, 28, 0.34)',
  splashBrandBorder: 'rgba(255, 255, 255, 0.18)',
  splashSubtitle: 'rgba(243, 246, 255, 0.9)',
  splashVignetteBottom: 'rgba(0, 0, 0, 0.04)',
  splashSparkleGlow: 'rgba(247, 215, 127, 0.42)',
  splashTitleShadow: 'rgba(4, 8, 22, 0.64)',

  // Gradient
  gradientWhite10: 'rgba(255,255,255,0.1)',
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
  // Use for floating elements (buttons, modals)
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  // Use for deeply elevated elements (popovers, tooltips)
  deep: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  neumorphicLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  neumorphicMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 5,
  },
  glassmorphism: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
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
