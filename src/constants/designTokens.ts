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
  accentVariationHueShift: '#6366A0',

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
  backgroundApp: '#D1D1D6', // Noticeably darker so frames and white glows stand out
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

  // Extraction method accent colors
  methodHistogramLight: '#3478F6',
  methodHistogramDark: '#60A5FA',
  methodKmeansLight: '#D64080',
  methodKmeansDark: '#FF80B0',
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

  // Blur surfaces (aggressive translucency)
  blurSurfaceHeavy: 'rgba(255, 255, 255, 0.25)',
  blurSurfaceMedium: '#F2F2F2',
  blurSurfaceLight: 'rgba(255, 255, 255, 0.45)',
  blurBorder: 'rgba(255, 255, 255, 0.20)',
  blurBorderStrong: 'rgba(255, 255, 255, 0.35)',

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

  // Dark blur surface (dark mode only, light value unused)
  darkBlurSurface: 'rgba(255, 255, 255, 0.9)',

  // Action bar background
  actionBarBg: 'rgba(255, 255, 255, 0.1)',

  // Glass section background
  glassSectionBg: 'rgba(255, 255, 255, 0.12)',

  // Gradient
  gradientWhite10: 'rgba(255,255,255,0.1)',

  // Glass gradient (top-to-bottom specular)
  glassGradientTop: 'rgba(255,255,255,0.30)',
  glassGradientMid: 'rgba(255,255,255,0.0)',
  glassGradientBottom: 'rgba(0,0,0,0)',

  // Glass border highlight
  glassBorderHighlight: 'rgba(255,255,255,0.50)',

  // Neumorphic Inset — pressed / concave swatch effect
  neumorphInsetTop: 'rgba(0,0,0,0.55)',
  neumorphInsetMid: 'rgba(0,0,0,0.18)',
  neumorphInsetLight: 'rgba(255,255,255,0.0)',
  neumorphInsetBottom: 'rgba(255,255,255,0.50)',
  neumorphInsetBorderTop: 'rgba(0,0,0,0.30)',
  neumorphInsetBorderBottom: 'rgba(255,255,255,0.45)',
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

export const FONT_FAMILY = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semiBold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  mono: 'monospace',
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
  // Material Flat — minimal subtle shadow
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  // Material Flat — medium elevation
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  // Material Flat — elevated surface
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Legacy aliases (kept for backward compatibility)
  neumorphicLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  neumorphicMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  glassmorphism: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  // Liquid Glass — deep soft shadow for glass surfaces
  glass: {
    shadowColor: '#fff',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 3,
    elevation: 8,
  },
  // Neumorphic Inset — soft top shadow simulating pressed look (Used as outer dark drop shadow)
  neumorphInset: {
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.60, // Increased from 0.40 for darker shadow
    shadowRadius: 5,
    elevation: 4,
  },
  // Neumorphic Outer Light — bright top-left glow to complement the dark shadow
  neumorphOuterLight: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
} as const;

export const BLUR_INTENSITY = {
  heavy: 80,
  medium: 60,
  light: 40,
  actionBar: 90,
  glass: 5,
} as const;

export const ALPHA_TOKENS = {
  chipBg: '1A', // A bit more opaque
  chipBorder: '33', // Stronger border
} as const;

export function getOverlayTokens(isDark: boolean) {
  if (!isDark) return OVERLAY_TOKENS;
  return {
    ...OVERLAY_TOKENS,
    // Glass surfaces — dark translucent
    glassWhite: 'rgba(255, 255, 255, 0.06)',
    glassWhiteBorder: 'rgba(255, 255, 255, 0.12)',
    glassWhiteThin: 'rgba(255, 255, 255, 0.04)',
    glassWhiteLoading: 'rgba(0, 0, 0, 0.6)',
    // Blur surfaces
    blurSurfaceHeavy: 'rgba(30, 33, 48, 0.85)',
    blurSurfaceMedium: 'rgba(38, 41, 64, 0.9)',
    darkBlurSurface: 'rgba(38, 41, 64, 0.9)',
    blurSurfaceLight: 'rgba(30, 33, 48, 0.7)',
    blurBorder: 'rgba(255, 255, 255, 0.08)',
    blurBorderStrong: 'rgba(255, 255, 255, 0.12)',
    // Action bar background
    actionBarBg: 'rgba(30, 33, 48, 0.8)',
    // Glass gradient
    glassGradientTop: 'rgba(255,255,255,0.08)',
    glassGradientMid: 'rgba(255,255,255,0.0)',
    glassGradientBottom: 'rgba(0,0,0,0)',
    glassBorderHighlight: 'rgba(255,255,255,0.12)',
    // Neumorphic Inset — dark surface
    neumorphInsetTop: 'rgba(0,0,0,0.6)',
    neumorphInsetMid: 'rgba(0,0,0,0.25)',
    neumorphInsetLight: 'rgba(255,255,255,0.0)',
    neumorphInsetBottom: 'rgba(255,255,255,0.08)',
    neumorphInsetBorderTop: 'rgba(0,0,0,0.4)',
    neumorphInsetBorderBottom: 'rgba(255,255,255,0.06)',
  };
}

export function getChipThemes(isDark: boolean) {
  if (!isDark) return null;
  const accent = {
    bg: 'rgba(93, 184, 232, 0.10)',
    activeBg: 'rgba(93, 184, 232, 0.20)',
    activeBorder: 'rgba(93, 184, 232, 0.35)',
    border: 'rgba(93, 184, 232, 0.08)',
    text: '#5db8e8',
    glow: 'rgb(50, 130, 180)',
    activeGlow: 'rgb(93, 184, 232)',
  };
  return {
    red: accent,
    gold: accent,
    purple: accent,
    green: accent,
    gray: accent,
  };
}

/** CVD (Color Vision Deficiency) confused-pair colors for text and glow effects */
export const CVD_COLORS: {
  textLight: Record<string, string | undefined>;
  textDark: Record<string, string | undefined>;
  glow: Record<string, string[] | undefined>;
} = {
  textLight: {
    none: 'rgba(60, 60, 67, 0.3)',
    protanopia: '#D64040',
    deuteranopia: '#22944E',
    tritanopia: '#3478F6',
  },
  textDark: {
    none: 'rgba(210, 215, 230, 0.35)',
    protanopia: '#FF6B6B',
    deuteranopia: '#4ADE80',
    tritanopia: '#60A5FA',
  },
  glow: {
    none: undefined,
    protanopia: ['#ef4444', '#22c55e'],
    deuteranopia: ['#22c55e', '#ef4444'],
    tritanopia: ['#3b82f6', '#eab308'],
  },
};

export type ColorToken = keyof typeof COLOR_TOKENS;
export type SpacingToken = keyof typeof SPACING_TOKENS;
export type RadiusToken = keyof typeof RADIUS_TOKENS;
export type FontSizeToken = keyof typeof FONT_SIZE_TOKENS;
