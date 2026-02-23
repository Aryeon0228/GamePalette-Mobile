import { create } from 'zustand';
import { COLOR_TOKENS } from '../constants/designTokens';

export interface ThemeColors {
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
      background: '#F2F2F7',
      backgroundSecondary: '#FFFFFF',
      backgroundTertiary: '#E5E5EA',
      backgroundCard: '#FFFFFF',
      textPrimary: '#1C1C1E',
      textSecondary: '#3A3A3C',
      textMuted: '#8E8E93',
      border: '#C6C6C8',
      borderLight: '#E5E5EA',
      accent: '#007AFF', // Standard iOS blue or custom primary
      accentLight: '#E5F1FF',
      buttonBg: '#FFFFFF',
      modalOverlay: 'rgba(0, 0, 0, 0.4)',
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
