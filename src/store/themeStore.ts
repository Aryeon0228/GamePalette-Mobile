import { create } from 'zustand';
import { COLOR_TOKENS, OVERLAY_TOKENS } from '../constants/designTokens';

export interface ThemeColors {
  isDark: boolean;
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundCard: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  border: string;
  borderLight: string;

  accent: string;
  accentLight: string;

  backgroundDepressed: string;

  buttonBg: string;
  modalOverlay: string;

  textOnAccent: string;
  shadowGlow: string;
  shadowDrop: string;
  gradientStart: string;
  gradientEnd: string;
}

export const getThemeColors = (isDark: boolean): ThemeColors => {
  return isDark
    ? {
      isDark,
      background:          '#1e2130',
      backgroundSecondary: '#262940',
      backgroundTertiary:  '#303348',
      backgroundCard:      '#262940',
      textPrimary:         '#E8EAF0',
      textSecondary:       '#B0B4C0',
      textMuted:           '#6B7080',
      border:              '#3A3D50',
      borderLight:         '#2E3145',
      accent:              '#5db8e8',
      accentLight:         '#8ec8e8',
      backgroundDepressed: '#222538',
      buttonBg:            '#303348',
      modalOverlay:        'rgba(0, 0, 0, 0.6)',
      textOnAccent:        '#FFFFFF',
      shadowGlow:          '#5a68a0',
      shadowDrop:          '#000000',
      gradientStart:       '#1e2130',
      gradientEnd:         '#1a1d2e',
    }
    : {
      isDark,
      background: COLOR_TOKENS.backgroundSurfaceAlt,
      backgroundSecondary: COLOR_TOKENS.backgroundSurface,
      backgroundTertiary: COLOR_TOKENS.backgroundControl,
      backgroundCard: COLOR_TOKENS.backgroundSurface,
      textPrimary: COLOR_TOKENS.accentPrimary,
      textSecondary: COLOR_TOKENS.accentInteractive,
      textMuted: COLOR_TOKENS.textMuted,
      border: COLOR_TOKENS.lightBorder,
      borderLight: COLOR_TOKENS.borderDefault,
      accent: COLOR_TOKENS.iosBlue,
      accentLight: COLOR_TOKENS.iosBlueTint,
      backgroundDepressed: COLOR_TOKENS.backgroundControl,
      buttonBg: COLOR_TOKENS.backgroundSurface,
      modalOverlay: OVERLAY_TOKENS.scrimLight,
      textOnAccent: '#FFFFFF',
      shadowGlow: '#FFFFFF',
      shadowDrop: '#000000',
      gradientStart: 'rgb(210, 210, 212)',
      gradientEnd: 'rgb(200, 200, 198)',
    };
};

interface ThemeState {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: true, // Defaulting to dark as per original app style
  colors: getThemeColors(true),
  toggleTheme: () =>
    set((state) => {
      const nextIsDark = !state.isDark;
      return {
        isDark: nextIsDark,
        colors: getThemeColors(nextIsDark),
      };
    }),
}));
