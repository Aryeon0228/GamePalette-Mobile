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

  buttonBg: string;
  modalOverlay: string;
}

export const getThemeColors = (isDark: boolean): ThemeColors => {
  return isDark
    ? {
      isDark,
      background: COLOR_TOKENS.backgroundApp,
      backgroundSecondary: COLOR_TOKENS.backgroundSurface,
      backgroundTertiary: COLOR_TOKENS.backgroundSurfaceAlt,
      backgroundCard: COLOR_TOKENS.backgroundSurface,
      textPrimary: COLOR_TOKENS.textPrimary,
      textSecondary: COLOR_TOKENS.textSecondary,
      textMuted: COLOR_TOKENS.textMuted,
      border: COLOR_TOKENS.borderDefault,
      borderLight: COLOR_TOKENS.borderSoft,
      accent: COLOR_TOKENS.accentPrimary,
      accentLight: COLOR_TOKENS.accentLight,
      buttonBg: COLOR_TOKENS.borderDefault,
      modalOverlay: 'rgba(120, 120, 128, 0.2)',
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
      buttonBg: COLOR_TOKENS.backgroundSurface,
      modalOverlay: OVERLAY_TOKENS.scrimLight,
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
