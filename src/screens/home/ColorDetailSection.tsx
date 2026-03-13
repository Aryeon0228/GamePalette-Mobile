import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Defs, LinearGradient as SvgLinearGradient, RadialGradient as SvgRadialGradient, Stop, Path, Rect } from 'react-native-svg';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { COLOR_TOKENS, OVERLAY_TOKENS } from '../../constants/designTokens';
import { BouncyButton } from '../../components/BouncyButton';
import {
  FORMAT_ACCENT_COLORS,
  VARIATION_TOGGLE_COLORS,
  UNIFIED_EMPHASIS,
} from '../../constants/uiEmphasis';
import {
  getLuminance,
  hslToRgb,
  rgbToHex,
  oklchToRgb,
  generateColorVariations,
  HarmonyType,
  type ColorInfo,
  type ColorFormat,
} from '../../lib/colorUtils';

interface ColorDetailSectionProps {
  theme: ThemeColors;
  colorInfo: ColorInfo;
  colorFormat: ColorFormat;
  onFormatChange: (fmt: ColorFormat) => void;
  getFormattedColor: (info: ColorInfo, format: ColorFormat) => string;
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

/* ─── Harmony Color Wheel ─── */
const WHEEL_SIZE = 80;
const WHEEL_CENTER = WHEEL_SIZE / 2;
const WHEEL_OUTER_R = 34;
const WHEEL_INNER_R = 24;
const DOT_R = 4.5;
const HUE_SEGMENTS = 36; // 10° per segment
const FORMAT_OPTIONS = ['HEX', 'RGB', 'HSL', 'OKLCH'] as const;
const HARMONY_RING_SEGMENTS = Array.from({ length: HUE_SEGMENTS }, (_, index) => {
  const startAngle = (index * 360) / HUE_SEGMENTS - 90;
  const endAngle = ((index + 1) * 360) / HUE_SEGMENTS - 90;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1o = WHEEL_CENTER + WHEEL_OUTER_R * Math.cos(startRad);
  const y1o = WHEEL_CENTER + WHEEL_OUTER_R * Math.sin(startRad);
  const x2o = WHEEL_CENTER + WHEEL_OUTER_R * Math.cos(endRad);
  const y2o = WHEEL_CENTER + WHEEL_OUTER_R * Math.sin(endRad);
  const x2i = WHEEL_CENTER + WHEEL_INNER_R * Math.cos(endRad);
  const y2i = WHEEL_CENTER + WHEEL_INNER_R * Math.sin(endRad);
  const x1i = WHEEL_CENTER + WHEEL_INNER_R * Math.cos(startRad);
  const y1i = WHEEL_CENTER + WHEEL_INNER_R * Math.sin(startRad);

  return {
    key: index,
    fill: `hsl(${(index * 360) / HUE_SEGMENTS}, 75%, 55%)`,
    d: `M${x1o},${y1o} A${WHEEL_OUTER_R},${WHEEL_OUTER_R} 0 0,1 ${x2o},${y2o} L${x2i},${y2i} A${WHEEL_INNER_R},${WHEEL_INNER_R} 0 0,0 ${x1i},${y1i} Z`,
  };
});

const HarmonyWheel = React.memo(function HarmonyWheel({
  baseHue,
  colors,
  isDark,
}: {
  baseHue: number;
  colors: Array<{ hex: string; angle: number }>;
  isDark: boolean;
}) {
  const ringOpacity = isDark ? 0.6 : 0.45;
  const lineStroke = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)';
  const dots = useMemo(() => {
    const midRadius = (WHEEL_OUTER_R + WHEEL_INNER_R) / 2;
    return colors.map((color, index) => {
      const angle = ((baseHue + color.angle - 90) * Math.PI) / 180;
      return {
        cx: WHEEL_CENTER + midRadius * Math.cos(angle),
        cy: WHEEL_CENTER + midRadius * Math.sin(angle),
        hex: color.hex,
        angle: color.angle,
        idx: index,
      };
    });
  }, [baseHue, colors]);

  return (
    <View style={wheelStyles.container}>
      <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
        {HARMONY_RING_SEGMENTS.map((segment) => (
          <Path key={segment.key} d={segment.d} fill={segment.fill} opacity={ringOpacity} />
        ))}
        {dots.length >= 2 && dots.map((dot, index) => {
          const next = dots[(index + 1) % dots.length];
          return (
            <Line
              key={`line-${index}`}
              x1={dot.cx}
              y1={dot.cy}
              x2={next.cx}
              y2={next.cy}
              stroke={lineStroke}
              strokeWidth={1.5}
            />
          );
        })}
        {dots.map((d) => (
          <React.Fragment key={d.idx}>
            <Circle
              cx={d.cx}
              cy={d.cy}
              r={DOT_R + 1.5}
              fill={isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)'}
            />
            <Circle cx={d.cx} cy={d.cy} r={DOT_R} fill={d.hex} />
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
});

const wheelStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
  const previewTone = useMemo(() => {
    const isLight = getLuminance(colorInfo.hex) > 140;
    return {
      isLight,
      fgColor: isLight ? '#000' : '#fff',
      fgMuted: isLight ? OVERLAY_TOKENS.darkOnColorButton : OVERLAY_TOKENS.textOnColorPrimary,
      shadowColor: isLight ? 'rgba(255,255,255,0.5)' : OVERLAY_TOKENS.scrimDark,
      trackBg: isLight ? OVERLAY_TOKENS.darkOnColorTrack : OVERLAY_TOKENS.darkOnColorMedium,
      copyBg: isLight ? OVERLAY_TOKENS.darkOnColorLight : OVERLAY_TOKENS.darkOnColor,
    };
  }, [colorInfo.hex]);
  const variations = useMemo(
    () => generateColorVariations(colorInfo.hex, variationHueShift),
    [colorInfo.hex, variationHueShift]
  );

  return (
    <View style={styles.inlineColorDetailOuter}>
    <BlurView
      intensity={theme.isDark ? 10 : 15}
      tint={theme.isDark ? 'dark' : 'light'}
      style={[styles.inlineColorDetail, { backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.02)', overflow: 'hidden' }]}
    >
      {/* 선택 컬러 번짐 */}
      <LinearGradient
        colors={theme.isDark
          ? [colorInfo.hex + '55', colorInfo.hex + '25', colorInfo.hex + '08', 'transparent']
          : [colorInfo.hex + '88', colorInfo.hex + '40', colorInfo.hex + '10', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* 글라스 상단 하이라이트 */}
      <LinearGradient
        colors={theme.isDark
          ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.01)', 'transparent']
          : ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.05)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.35 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Color Preview + Value + Copy + Channel Bars */}
      <View style={[styles.inlineColorPreview, { backgroundColor: colorInfo.hex }]}>
            <View style={styles.previewTopRow}>
              <View style={{ flex: 1 }}>
                {colorFormat !== 'HEX' && (
                  <Text style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: '600', color: previewTone.fgMuted, marginBottom: 1 }}>
                    {colorFormat}
                  </Text>
                )}
                <Text style={[styles.inlineColorPreviewValue, { color: previewTone.fgColor }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {getFormattedColor(colorInfo, colorFormat)}
                </Text>
              </View>
              <BouncyButton
                style={[styles.inlineColorCopyButton, { backgroundColor: previewTone.copyBg }]}
                onPress={() => copyColor(getFormattedColor(colorInfo, colorFormat), colorFormat)}
                pressedScale={0.93}
                hapticFeedback
              >
                <Ionicons name="copy-outline" size={16} color={previewTone.fgColor} />
                <Text style={[styles.inlineColorCopyText, { color: previewTone.fgColor }]}>{copyButtonLabel}</Text>
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
                      <Text style={[styles.previewChannelLabel, { color: previewTone.fgMuted, textShadowColor: previewTone.shadowColor }]}>{ch.label}</Text>
                      <View style={[styles.previewChannelTrack, { backgroundColor: previewTone.trackBg }]}>
                        <View style={[styles.previewChannelFill, { width: `${(ch.value / ch.max) * 100}%`, backgroundColor: ch.color }]} />
                      </View>
                      <Text style={[styles.previewChannelValue, { color: previewTone.fgMuted, textShadowColor: previewTone.shadowColor }]}>{ch.display}</Text>
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
                const hslTrackBg = previewTone.isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)';
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
                        <Text style={[styles.previewChannelLabel, { color: previewTone.fgMuted, textShadowColor: previewTone.shadowColor }]}>{ch.label}</Text>
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
                        <Text style={[styles.previewChannelValue, { color: previewTone.fgMuted, textShadowColor: previewTone.shadowColor }]}>{ch.display}</Text>
                      </View>
                    ))}
                  </View>
                );
              })()}
              {colorFormat === 'OKLCH' && (() => {
                const { l, c, h } = colorInfo.oklch;
                // Chroma bar color: use the hue at full chroma
                const chromaRgb = oklchToRgb(65, Math.max(c, 0.15), h);
                const chromaHex = rgbToHex(chromaRgb.r, chromaRgb.g, chromaRgb.b);
                // Hue bar color
                const hueRgb = oklchToRgb(65, 0.25, h);
                const hueHex = rgbToHex(hueRgb.r, hueRgb.g, hueRgb.b);
                // Lightness bar
                const lGray = Math.round((l / 100) * 255);
                const boostedGray = lGray < 128 ? Math.max(0, lGray - 35) : Math.min(255, lGray + 35);
                const lightnessHex = rgbToHex(boostedGray, boostedGray, boostedGray);
                const lightnessBorder = boostedGray >= 180 ? 'rgba(0,0,0,0.32)' : 'rgba(255,255,255,0.4)';
                const oklchTrackBg = previewTone.isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)';
                const oklchChannels: Array<{
                  label: string; value: number; max: number; barColor: string; display: string; borderColor?: string;
                }> = [
                  { label: 'L', value: l, max: 100, barColor: lightnessHex, display: `${l}%`, borderColor: lightnessBorder },
                  { label: 'C', value: c, max: 0.4, barColor: chromaHex, display: `${c}` },
                  { label: 'H', value: h, max: 360, barColor: hueHex, display: `${h}°` },
                ];
                return (
                  <View style={styles.previewChannelBars}>
                    {oklchChannels.map((ch) => (
                      <View key={ch.label} style={styles.previewChannelRow}>
                        <Text style={[styles.previewChannelLabel, { color: previewTone.fgMuted, textShadowColor: previewTone.shadowColor }]}>{ch.label}</Text>
                        <View style={[styles.previewChannelTrack, { backgroundColor: oklchTrackBg }]}>
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
                        <Text style={[styles.previewChannelValue, { color: previewTone.fgMuted, textShadowColor: previewTone.shadowColor }]}>{ch.display}</Text>
                      </View>
                    ))}
                  </View>
                );
              })()}
              {colorFormat === 'HEX' && <View style={styles.previewChannelBarsPlaceholder} />}
            </View>
          </View>

      {/* Format Segment Toggle */}
      <View style={[styles.formatSegment, { backgroundColor: theme.backgroundTertiary }]}>
        {FORMAT_OPTIONS.map((fmt) => (
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
          {variations.map((variation, index) => (
            <BouncyButton
              key={variation.hex + '-' + index}
              style={[
                styles.variationCell,
                variation.label === 'Base' && styles.variationCellBase,
              ]}
              onPress={() => copyColor(variation.hex)}
              pressedScale={0.9}
              hapticFeedback
            >
              <View style={[
                styles.variationColor,
                { backgroundColor: variation.hex },
                index === 0 && { borderBottomLeftRadius: 6 },
                index === variations.length - 1 && { borderBottomRightRadius: 6 },
                variation.label === 'Base' && { borderWidth: 2, borderColor: COLOR_TOKENS.accentPrimary },
              ]} />
            </BouncyButton>
          ))}
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

          <View style={{ position: 'relative' }}>
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
            {/* Right fade hint — more content indicator */}
            <LinearGradient
              colors={[theme.backgroundTertiary + '00', theme.backgroundTertiary + 'CC', theme.backgroundTertiary]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32 }}
              pointerEvents="none"
            />
          </View>

          <View style={styles.harmonyContentRow}>
            <HarmonyWheel
              baseHue={colorInfo.hsl.h}
              colors={currentHarmony.colors}
              isDark={theme.isDark}
            />
            <View style={styles.harmonyRightColumn}>
              <Text style={[styles.harmonyDesc, { color: theme.textSubtle }]} numberOfLines={1}>
                {currentHarmony.description}
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
                    <Text style={[styles.harmonyColorAngle, { color: theme.textSubtle }]}>
                      {harmonyColor.angle}°
                    </Text>
                  </BouncyButton>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}
    </BlurView>
    </View>
  );
}

export default React.memo(ColorDetailSection);
