import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BouncyButton } from '../../../components/BouncyButton';

import { styles } from '../HomeScreen.styles';
import { ThemeColors } from '../../../store/themeStore';
import { COLOR_TOKENS, OVERLAY_TOKENS, BLUR_INTENSITY } from '../../../constants/designTokens';
import {
  FORMAT_ACCENT_COLORS,
  VARIATION_TOGGLE_COLORS,
  UNIFIED_EMPHASIS,
} from '../../../constants/uiEmphasis';
import {
  generateColorVariations,
  generateColorHarmonies,
  getLuminance,
  type AppLanguage,
  type ColorInfo,
  type HarmonyType,
} from '../../../lib/colorUtils';

interface ColorDetailModalProps {
  visible: boolean;
  theme: ThemeColors;
  colorInfo: ColorInfo | null;
  colorFormat: 'HEX' | 'RGB' | 'HSL' | 'OKLCH';
  onFormatChange: (format: 'HEX' | 'RGB' | 'HSL' | 'OKLCH') => void;
  onClose: () => void;
  getFormattedColor: (info: ColorInfo, format: 'HEX' | 'RGB' | 'HSL' | 'OKLCH') => string;
  copyColor: (value: string, label?: string) => void;
  variationHueShift: boolean;
  onVariationHueShiftChange: (value: boolean) => void;
  selectedHarmony: HarmonyType;
  onHarmonyChange: (value: HarmonyType) => void;
  language: AppLanguage;
  onHapticLight: () => void;
}

export default function ColorDetailModal({
  visible,
  theme,
  colorInfo,
  colorFormat,
  onFormatChange,
  onClose,
  getFormattedColor,
  copyColor,
  variationHueShift,
  onVariationHueShiftChange,
  selectedHarmony,
  onHarmonyChange,
  language,
  onHapticLight,
}: ColorDetailModalProps) {
  const isKorean = language === 'ko';
  const copyLabel = isKorean ? '복사' : 'Copy';
  const variationsLabel = isKorean ? '색상 변형' : 'Variations';
  const lightnessLabel = isKorean ? '명도' : 'Lightness';
  const hueShiftLabel = isKorean ? '색상 이동' : 'Hue Shift';
  const harmonyLabel = isKorean ? '조화' : 'Harmony';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.colorDetailOverlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity
          style={styles.colorDetailBackground}
          onPress={onClose}
        />
        <View style={styles.colorDetailContentOuter}>
          <BlurView
            intensity={50}
            tint="light"
            style={[styles.colorDetailContent, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}
          >
            {/* 선택 컬러가 은은하게 번지는 배경 (BlurView 안쪽) */}
            {colorInfo && (
              <LinearGradient
                colors={[colorInfo.hex + '44', colorInfo.hex + '12', 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
            )}
            {/* 글라스 상단 하이라이트 */}
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.05)', 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.35 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={[styles.colorDetailHandle, { backgroundColor: 'rgba(255,255,255,0.6)' }]} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {colorInfo && (
                <>
                  {/* Color Preview + Copy */}
                  <View style={[styles.modalColorPreview, { backgroundColor: colorInfo.hex }]}
                >
                  <Text
                    style={[
                      styles.modalColorPreviewValue,
                      { color: getLuminance(colorInfo.hex) > 140 ? COLOR_TOKENS.textPrimary : '#FFFFFF' },
                    ]}
                  >
                    {getFormattedColor(colorInfo, colorFormat)}
                  </Text>
                  <BouncyButton
                    pressedScale={0.93}
                    hapticFeedback
                    style={styles.modalColorCopyButton}
                    onPress={() => copyColor(getFormattedColor(colorInfo, colorFormat), colorFormat)}
                  >
                    <Ionicons name="copy-outline" size={18} color={theme.textOnAccent} />
                    <Text style={styles.modalColorCopyText}>{copyLabel}</Text>
                  </BouncyButton>
                </View>

                {/* Format Segment Toggle */}
                <View style={[styles.modalFormatSegment, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
                >
                  {(['HEX', 'RGB', 'HSL', 'OKLCH'] as const).map((fmt) => (
                    <BouncyButton
                      key={fmt}
                      pressedScale={0.93}
                      hapticFeedback
                      style={[
                        styles.modalFormatSegmentButton,
                        colorFormat === fmt && { backgroundColor: FORMAT_ACCENT_COLORS[fmt] },
                      ]}
                      onPress={() => onFormatChange(fmt)}
                    >
                      <Text
                        style={[
                          styles.modalFormatSegmentText,
                          { color: colorFormat === fmt ? theme.textOnAccent : theme.textMuted },
                        ]}
                      >
                        {fmt}
                      </Text>
                    </BouncyButton>
                  ))}
                </View>

                {/* Variations */}
                <View style={styles.variationsSection}>
                  <View style={styles.variationsHeader}>
                    <Text style={[styles.variationsSectionTitle, { color: theme.textPrimary }]}>{variationsLabel}</Text>
                    <View style={[styles.hueShiftToggle, { backgroundColor: 'rgba(0, 0, 0, 0.08)' }]}
                    >
                      <BouncyButton
                        pressedScale={0.93}
                        hapticFeedback
                        style={[
                          styles.hueShiftOption,
                          !variationHueShift && { backgroundColor: VARIATION_TOGGLE_COLORS.lightness },
                        ]}
                        onPress={() => onVariationHueShiftChange(false)}
                      >
                        <Text
                          style={[
                            styles.hueShiftOptionText,
                            { color: !variationHueShift ? theme.textOnAccent : theme.textMuted },
                          ]}
                        >
                          {lightnessLabel}
                        </Text>
                      </BouncyButton>
                      <BouncyButton
                        pressedScale={0.93}
                        hapticFeedback
                        style={[
                          styles.hueShiftOption,
                          variationHueShift && { backgroundColor: VARIATION_TOGGLE_COLORS.hueShift },
                        ]}
                        onPress={() => onVariationHueShiftChange(true)}
                      >
                        <Text
                          style={[
                            styles.hueShiftOptionText,
                            { color: variationHueShift ? theme.textOnAccent : theme.textMuted },
                          ]}
                        >
                          {hueShiftLabel}
                        </Text>
                      </BouncyButton>
                    </View>
                  </View>

                  <View style={styles.variationStrip}>
                    {generateColorVariations(colorInfo.hex, variationHueShift).map((v, i) => (
                      <BouncyButton
                        key={i}
                        pressedScale={0.93}
                        hapticFeedback
                        style={[
                          styles.variationCell,
                          v.label === 'Base' && styles.variationCellBase,
                        ]}
                        onPress={() => copyColor(v.hex)}
                      >
                        <View style={[styles.variationColor, { backgroundColor: v.hex }]} />
                        <Text style={[styles.variationHex, { color: theme.textMuted }]}>{v.hex}</Text>
                      </BouncyButton>
                    ))}
                  </View>
                </View>

                {/* Color Harmony */}
                <View style={styles.harmonySection}>
                  <Text style={[styles.harmonySectionTitle, { color: theme.textPrimary }]}>{harmonyLabel}</Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.harmonyTypesScroll}
                  >
                    {generateColorHarmonies(colorInfo.hex, language).map((harmony) => (
                      <BouncyButton
                        key={harmony.type}
                        pressedScale={0.93}
                        hapticFeedback
                        style={[
                          styles.harmonyTypeButton,
                          {
                            backgroundColor:
                              selectedHarmony === harmony.type
                                ? UNIFIED_EMPHASIS.activeButtonBg
                                : theme.backgroundTertiary,
                          },
                        ]}
                        onPress={() => {
                          onHapticLight();
                          onHarmonyChange(harmony.type);
                        }}
                      >
                        <Text
                          style={[
                            styles.harmonyTypeText,
                            { color: selectedHarmony === harmony.type ? theme.textOnAccent : theme.textMuted },
                          ]}
                        >
                          {harmony.name}
                        </Text>
                      </BouncyButton>
                    ))}
                  </ScrollView>

                  {(() => {
                    const harmonies = generateColorHarmonies(colorInfo.hex, language);
                    const currentHarmony = harmonies.find((h) => h.type === selectedHarmony);
                    if (!currentHarmony) return null;

                    return (
                      <>
                        <Text style={[styles.harmonyDesc, { color: theme.textMuted }]}>
                          {currentHarmony.description}
                          {currentHarmony.colors.length > 1 &&
                            ` (${currentHarmony.colors.map((c) => c.angle + '°').join(', ')})`}
                        </Text>
                        <View style={styles.harmonyColorsRow}>
                          {currentHarmony.colors.map((color, i) => (
                            <BouncyButton
                              key={i}
                              pressedScale={0.93}
                              hapticFeedback
                              style={styles.harmonyColorItem}
                              onPress={() => copyColor(color.hex)}
                            >
                              <View
                                style={[
                                  styles.harmonyColorSwatch,
                                  { backgroundColor: color.hex },
                                  color.angle === 0 && styles.harmonyColorSwatchBase,
                                ]}
                              />
                              <Text style={[styles.harmonyColorHex, { color: theme.textMuted }]}>{color.hex}</Text>
                            </BouncyButton>
                          ))}
                        </View>
                      </>
                    );
                  })()}
                </View>

                  <View style={{ height: 20 }} />
                </>
              )}
            </ScrollView>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
}
