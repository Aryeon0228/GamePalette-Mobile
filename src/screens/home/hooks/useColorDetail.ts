import { useMemo } from 'react';
import {
  hexToRgb,
  rgbToHsl,
  rgbToOklch,
  generateColorHarmonies,
  type AppLanguage,
  type ColorInfo,
  HarmonyType,
} from '../../../lib/colorUtils';

export function useColorDetail(
  processedColors: string[],
  selectedColorIndex: number | null,
  appLanguage: AppLanguage,
  selectedHarmony: HarmonyType
) {
  const colorInfo = useMemo((): ColorInfo | null => {
    if (selectedColorIndex === null || !processedColors[selectedColorIndex]) {
      return null;
    }
    const hex = processedColors[selectedColorIndex];
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl, oklch };
  }, [processedColors, selectedColorIndex]);

  const colorHarmonies = useMemo(
    () => (colorInfo ? generateColorHarmonies(colorInfo.hex, appLanguage) : []),
    [appLanguage, colorInfo]
  );

  const currentHarmony = useMemo(
    () =>
      colorHarmonies.find((harmony) => harmony.type === selectedHarmony) ??
      colorHarmonies[0] ??
      null,
    [colorHarmonies, selectedHarmony]
  );

  return { colorInfo, colorHarmonies, currentHarmony };
}
