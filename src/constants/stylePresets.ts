/**
 * Style Filter Presets for Color Adjustments
 * Used to apply different visual styles to extracted palettes
 */

export type StyleFilter = 'original' | 'hypercasual' | 'stylized' | 'realistic';
export type StylePresetIcon = 'heart' | 'sparkles-outline' | 'brush-outline' | 'eye-outline';

export interface StylePreset {
  name: string;
  saturation: number;
  brightness: number;
  icon: StylePresetIcon;
  color: string;
}

export const STYLE_PRESETS: Record<StyleFilter, StylePreset> = {
  original: {
    name: 'Original',
    saturation: 1.0,
    brightness: 1.0,
    icon: 'heart',
    color: '#8E8E93',
  },
  hypercasual: {
    name: 'Hyper',
    saturation: 1.3,
    brightness: 1.1,
    icon: 'sparkles-outline',
    color: '#F5A623',
  },
  stylized: {
    name: 'Stylized',
    saturation: 1.15,
    brightness: 1.05,
    icon: 'brush-outline',
    color: '#636366',
  },
  realistic: {
    name: 'Realistic',
    saturation: 0.9,
    brightness: 0.95,
    icon: 'eye-outline',
    color: '#34C759',
  },
};

export const STYLE_FILTER_KEYS = Object.keys(STYLE_PRESETS) as StyleFilter[];
