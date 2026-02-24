import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { COLOR_TOKENS, OVERLAY_TOKENS } from '../../constants/designTokens';
import { BouncyButton } from '../../components/BouncyButton';
import { GlassPanel } from '../../components/GlassPanel';
import {
  FORMAT_ACCENT_COLORS,
  VARIATION_TOGGLE_COLORS,
  UNIFIED_EMPHASIS,
} from '../../constants/uiEmphasis';
import {
  getLuminance,
  hslToRgb,
  rgbToHex,
  generateColorVariations,
  HarmonyType,
  type ColorInfo,
} from '../../lib/colorUtils';

interface ColorDetailSectionProps {
  theme: ThemeColors;
  colorInfo: ColorInfo;
  colorFormat: 'HEX' | 'RGB' | 'HSL';
  onFormatChange: (fmt: 'HEX' | 'RGB' | 'HSL') => void;
  getFormattedColor: (info: ColorInfo, format: 'HEX' | 'RGB' | 'HSL') => string;
  copyColor: (value: string, label?: string) => void;
  copyButtonLabel: string;
  variationHueShift: boolean;
  onVariationHueShiftChange: (value: boolean) => void;
  variationsLabel: string;
  lightnessLabel: string;
  hueShiftLabel: string;
  harmonyLabel: string;
  selectedHarmony: HarmonyType;
  onHarmonyChange: (type: HarmonyType) => void;
  colorHarmonies: Array<{
    type: HarmonyType;
    name: string;
    description: string;
    colors: Array<{ hex: string; name: string; angle: number }>;
  }>;
  currentHarmony: {
    type: HarmonyType;
    name: string;
    description: string;
    colors: Array<{ hex: string; name: string; angle: number }>;
  } | null;
}

function ColorDetailSection({
  theme,
  colorInfo,
  colorFormat,
  onFormatChange,
  getFormattedColor,
  copyColor,
  copyButtonLabel,
  variationHueShift,
  onVariationHueShiftChange,
  variationsLabel,
  lightnessLabel,
  hueShiftLabel,
  harmonyLabel,
  selectedHarmony,
  onHarmonyChange,
  colorHarmonies,
  currentHarmony,
}: ColorDetailSectionProps) {
  return (
    <GlassPanel
      intensity={50}
      tint="light"
      style={[styles.inlineColorDetail, { borderColor: colorInfo.hex + '60', borderWidth: 1.5 }]}
    >
      {/* Color Preview + Value + Copy + Channel Bars */}
      {(() => {
        const isLight = getLuminance(colorInfo.hex) > 140;
        const fgColor = isLight ? '#000' : '#fff';
        const fgMuted = isLight ? OVERLAY_TOKENS.darkOnColorButton : OVERLAY_TOKENS.textOnColorPrimary;
        const shadowColor = isLight ? 'rgba(255,255,255,0.5)' : OVERLAY_TOKENS.scrimDark;
        const trackBg = isLight ? OVERLAY_TOKENS.darkOnColorTrack : OVERLAY_TOKENS.darkOnColorMedium;
        const copyBg = isLight ? OVERLAY_TOKENS.darkOnColorLight : OVERLAY_TOKENS.darkOnColor;
        return (
          <View style={[styles.inlineColorPreview, { backgroundColor: colorInfo.hex }]}>
            <View style={styles.previewTopRow}>
              <Text style={[styles.inlineColorPreviewValue, { color: fgColor }]}>
                {getFormattedColor(colorInfo, colorFormat)}
              </Text>
              <BouncyButton
                style={[styles.inlineColorCopyButton, { backgroundColor: copyBg }]}
                onPress={() => copyColor(getFormattedColor(colorInfo, colorFormat), colorFormat)}
                pressedScale={0.93}
                hapticFeedback
              >
                <Ionicons name="copy-outline" size={16} color={fgColor} />
                <Text style={[styles.inlineColorCopyText, { color: fgColor }]}>{copyButtonLabel}</Text>
              </BouncyButton>
            </View>

            {/* Fixed-height channel section */}
            <View style={styles.previewChannelContainer}>
              {colorFormat === 'RGB' && (
                <View style={styles.previewChannelBars}>
                  {[
                    { label: 'R', value: colorInfo.rgb.r, max: 255, color: COLOR_TOKENS.channelRed, display: `${colorInfo.rgb.r}` },
                    { label: 'G', value: colorInfo.rgb.g, max: 255, color: COLOR_TOKENS.channelGreen, display: `${colorInfo.rgb.g}` },
                    { label: 'B', value: colorInfo.rgb.b, max: 255, color: COLOR_TOKENS.channelBlue, display: `${colorInfo.rgb.b}` },
                  ].map((ch) => (
                    <View key={ch.label} style={styles.previewChannelRow}>
                      <Text style={[styles.previewChannelLabel, { color: fgMuted, textShadowColor: shadowColor }]}>{ch.label}</Text>
                      <View style={[styles.previewChannelTrack, { backgroundColor: trackBg }]}>
                        <View style={[styles.previewChannelFill, { width: `${(ch.value / ch.max) * 100}%`, backgroundColor: ch.color }]} />
                      </View>
                      <Text style={[styles.previewChannelValue, { color: fgMuted, textShadowColor: shadowColor }]}>{ch.display}</Text>
                    </View>
                  ))}
                </View>
              )}
              {colorFormat === 'HSL' && (() => {
                const { h, s, l } = colorInfo.hsl;
                const hueRgb = hslToRgb(h, 100, 50);
                const hueHex = rgbToHex(hueRgb.r, hueRgb.g, hueRgb.b);
                const satRgb = hslToRgb(h, s, 50);
                const satHex = rgbToHex(satRgb.r, satRgb.g, satRgb.b);
                const lightnessGray = Math.round((l / 100) * 255);
                const boostedGray = lightnessGray < 128
                  ? Math.max(0, lightnessGray - 35)
                  : Math.min(255, lightnessGray + 35);
                const lightnessHex = rgbToHex(boostedGray, boostedGray, boostedGray);
                const lightnessBorder = boostedGray >= 180
                  ? 'rgba(0,0,0,0.32)'
                  : 'rgba(255,255,255,0.4)';
                const hslTrackBg = isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)';
                const hslChannels: Array<{
                  label: string;
                  value: number;
                  max: number;
                  barColor: string;
                  display: string;
                  borderColor?: string;
                }> = [
                    { label: 'H', value: h, max: 360, barColor: hueHex, display: `${h}°` },
                    { label: 'S', value: s, max: 100, barColor: satHex, display: `${s}%` },
                    { label: 'L', value: l, max: 100, barColor: lightnessHex, display: `${l}%`, borderColor: lightnessBorder },
                  ];
                return (
                  <View style={styles.previewChannelBars}>
                    {hslChannels.map((ch) => (
                      <View key={ch.label} style={styles.previewChannelRow}>
                        <Text style={[styles.previewChannelLabel, { color: fgMuted, textShadowColor: shadowColor }]}>{ch.label}</Text>
                        <View style={[styles.previewChannelTrack, { backgroundColor: hslTrackBg }]}>
                          <View
                            style={[
                              styles.previewChannelFill,
                              {
                                width: `${(ch.value / ch.max) * 100}%`,
                                minWidth: ch.value > 0 ? 6 : 0,
                                backgroundColor: ch.barColor,
                              },
                              ch.borderColor && { borderWidth: 1, borderColor: ch.borderColor },
                            ]}
                          />
                        </View>
                        <Text style={[styles.previewChannelValue, { color: fgMuted, textShadowColor: shadowColor }]}>{ch.display}</Text>
                      </View>
                    ))}
                  </View>
                );
              })()}
              {colorFormat === 'HEX' && <View style={styles.previewChannelBarsPlaceholder} />}
            </View>
          </View>
        );
      })()}

      {/* Format Segment Toggle */}
      <View style={[styles.formatSegment, { backgroundColor: theme.backgroundTertiary }]}>
        {(['HEX', 'RGB', 'HSL'] as const).map((fmt) => (
          <BouncyButton
            key={fmt}
            style={[
              styles.formatSegmentButton,
              colorFormat === fmt && { backgroundColor: FORMAT_ACCENT_COLORS[fmt] },
            ]}
            onPress={() => onFormatChange(fmt)}
            pressedScale={0.93}
            hapticFeedback
          >
            <Text style={[
              styles.formatSegmentText,
              { color: colorFormat === fmt ? '#FFFFFF' : theme.textMuted },
            ]}>
              {fmt}
            </Text>
          </BouncyButton>
        ))}
      </View>

      {/* Inline Variations */}
      <View style={[styles.inlineVariationsSection, { backgroundColor: theme.backgroundTertiary }]}>
        <View style={styles.variationsHeader}>
          <Text style={[styles.variationsSectionTitle, { color: theme.textPrimary }]}>{variationsLabel}</Text>
          <View style={[styles.hueShiftToggle, { backgroundColor: theme.backgroundSecondary }]}>
            <BouncyButton
              style={[
                styles.hueShiftOption,
                !variationHueShift && { backgroundColor: VARIATION_TOGGLE_COLORS.lightness },
              ]}
              onPress={() => onVariationHueShiftChange(false)}
              pressedScale={0.93}
              hapticFeedback
            >
              <Text
                style={[
                  styles.hueShiftOptionText,
                  { color: !variationHueShift ? '#FFFFFF' : theme.textMuted },
                ]}
              >
                {lightnessLabel}
              </Text>
            </BouncyButton>
            <BouncyButton
              style={[
                styles.hueShiftOption,
                variationHueShift && { backgroundColor: VARIATION_TOGGLE_COLORS.hueShift },
              ]}
              onPress={() => onVariationHueShiftChange(true)}
              pressedScale={0.93}
              hapticFeedback
            >
              <Text
                style={[
                  styles.hueShiftOptionText,
                  { color: variationHueShift ? '#FFFFFF' : theme.textMuted },
                ]}
              >
                {hueShiftLabel}
              </Text>
            </BouncyButton>
          </View>
        </View>

        <View style={styles.variationStrip}>
          {generateColorVariations(colorInfo.hex, variationHueShift).map(
            (v, i) => (
              <BouncyButton
                key={v.hex + '-' + i}
                style={[
                  styles.variationCell,
                  v.label === 'Base' && styles.variationCellBase,
                ]}
                onPress={() => copyColor(v.hex)}
                pressedScale={0.9}
                hapticFeedback
              >
                <View style={[styles.variationColor, { backgroundColor: v.hex }]} />
                <Text style={[styles.variationHex, { color: theme.textMuted }]}>{v.hex}</Text>
              </BouncyButton>
            )
          )}
        </View>
      </View>

      {/* Inline Harmony */}
      {currentHarmony && (
        <View
          style={[
            styles.harmonySection,
            {
              backgroundColor: theme.backgroundTertiary,
              marginTop: 10,
              marginBottom: 0,
              padding: 12,
            },
          ]}
        >
          <Text style={[styles.harmonySectionTitle, { color: theme.textPrimary }]}>{harmonyLabel}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.harmonyTypesScroll}
          >
            {colorHarmonies.map((harmony) => (
              <BouncyButton
                key={harmony.type}
                style={[
                  styles.harmonyTypeButton,
                  {
                    backgroundColor:
                      selectedHarmony === harmony.type
                        ? UNIFIED_EMPHASIS.activeButtonBg
                        : theme.backgroundSecondary,
                  },
                ]}
                onPress={() => onHarmonyChange(harmony.type)}
                pressedScale={0.93}
                hapticFeedback
              >
                <Text
                  style={[
                    styles.harmonyTypeText,
                    { color: selectedHarmony === harmony.type ? '#FFFFFF' : theme.textMuted },
                  ]}
                >
                  {harmony.name}
                </Text>
              </BouncyButton>
            ))}
          </ScrollView>

          <Text style={[styles.harmonyDesc, { color: theme.textMuted }]}>
            {currentHarmony.description}
            {currentHarmony.colors.length > 1 &&
              ` (${currentHarmony.colors.map((color) => color.angle + '°').join(', ')})`}
          </Text>

          <View style={styles.harmonyColorsRow}>
            {currentHarmony.colors.map((harmonyColor) => (
              <BouncyButton
                key={harmonyColor.hex + '-' + harmonyColor.angle}
                style={styles.harmonyColorItem}
                onPress={() => copyColor(harmonyColor.hex.toUpperCase(), harmonyColor.name)}
                pressedScale={0.9}
                hapticFeedback
              >
                <View
                  style={[
                    styles.harmonyColorSwatch,
                    { backgroundColor: harmonyColor.hex },
                    harmonyColor.angle === 0 && styles.harmonyColorSwatchBase,
                  ]}
                />
                <Text style={[styles.harmonyColorHex, { color: theme.textMuted }]}>
                  {harmonyColor.hex.toUpperCase()}
                </Text>
              </BouncyButton>
            ))}
          </View>
        </View>
      )}
    </GlassPanel>
  );
}

export default React.memo(ColorDetailSection);
