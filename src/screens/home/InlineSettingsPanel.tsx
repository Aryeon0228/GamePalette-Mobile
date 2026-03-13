import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { ExtractionMethod } from '../../lib/colorExtractor';
import { ColorBlindnessInfo, ColorBlindnessType } from '../../lib/colorUtils';
import { StyleFilter, STYLE_FILTER_KEYS, STYLE_PRESETS } from '../../constants/stylePresets';
import { COLOR_TOKENS, OVERLAY_TOKENS, BLUR_INTENSITY } from '../../constants/designTokens';
import { BouncyButton } from '../../components/BouncyButton';

interface InlineSettingsPanelProps {
  isMounted: boolean;
  showAdvanced: boolean;
  theme: ThemeColors;
  advancedPanelAnim: SharedValue<number>;
  isKorean: boolean;
  settingLabel: string;
  stylePresetLabel: string;
  styleFilter: StyleFilter;
  stylePresetButtonLabels: Record<StyleFilter, string>;
  stylePresetButtonLines: Record<StyleFilter, number>;
  onStyleFilterChange: (filter: StyleFilter) => void;
  extractionMethodLabel: string;
  extractionMethod: ExtractionMethod;
  extractionMethodLabels: Record<ExtractionMethod, string>;
  methodDescriptions: Record<ExtractionMethod, string>;
  kmeansAccentColor: string;
  onMethodChange: (method: ExtractionMethod) => void;
  colorCountLabel: string;
  colorCount: number;
  onColorCountStep: (direction: 'down' | 'up') => void;
  colorVisionLabel: string;
  cvdOptions: ColorBlindnessInfo[];
  colorBlindMode: ColorBlindnessType;
  onColorBlindModeChange: (value: ColorBlindnessType) => void;
  onClose: () => void;
}

function InlineSettingsPanel({
  isMounted,
  showAdvanced,
  theme,
  advancedPanelAnim,
  isKorean,
  settingLabel,
  stylePresetLabel,
  styleFilter,
  stylePresetButtonLabels,
  stylePresetButtonLines,
  onStyleFilterChange,
  extractionMethodLabel,
  extractionMethod,
  extractionMethodLabels,
  methodDescriptions,
  kmeansAccentColor,
  onMethodChange,
  colorCountLabel,
  colorCount,
  onColorCountStep,
  colorVisionLabel,
  cvdOptions,
  colorBlindMode,
  onColorBlindModeChange,
  onClose,
}: InlineSettingsPanelProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: advancedPanelAnim.value,
    transform: [
      { translateY: interpolate(advancedPanelAnim.value, [0, 1], [-10, 0]) },
      { scaleY: interpolate(advancedPanelAnim.value, [0, 1], [0.965, 1]) },
    ],
  }));

  if (!isMounted) return null;

  return (
    <Animated.View
      pointerEvents={showAdvanced ? 'auto' : 'none'}
      style={[
        styles.inlineSettingsPanel,
        {
          borderColor: theme.border,
          overflow: 'hidden',
        },
        animatedStyle,
      ]}
    >
      <BlurView
        intensity={BLUR_INTENSITY.medium}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.inlineSettingsHeaderRow}>
        <View>
          <Text style={[styles.inlineSettingsTitle, { color: theme.textPrimary }]}>{settingLabel}</Text>
        </View>
        <BouncyButton
          style={[styles.inlineSettingsCloseBtn, { backgroundColor: theme.backgroundTertiary }]}
          onPress={onClose}
          pressedScale={0.9}
          hapticFeedback
        >
          <Ionicons name="close-outline" size={18} color={theme.textSecondary} />
        </BouncyButton>
      </View>

      <Text style={[styles.advancedSectionLabel, { color: theme.textMuted }]}>
        {stylePresetLabel}
      </Text>
      <View style={styles.advancedPresetRow}>
        {STYLE_FILTER_KEYS.map((filter) => (
          <BouncyButton
            key={filter}
            style={[
              styles.advancedPresetButton,
              isKorean && styles.advancedPresetButtonCompact,
              {
                backgroundColor: styleFilter === filter ? STYLE_PRESETS[filter].color : STYLE_PRESETS[filter].color + '18',
              },
            ]}
            onPress={() => onStyleFilterChange(filter)}
            pressedScale={0.93}
            hapticFeedback
          >
            <View style={styles.advancedPresetInline}>
              <Ionicons
                name={STYLE_PRESETS[filter].icon}
                size={14}
                color={styleFilter === filter ? '#FFFFFF' : STYLE_PRESETS[filter].color}
              />
              <View style={[styles.advancedPresetLabelWrap, isKorean && styles.advancedPresetLabelWrapCompact]}>
                <Text
                  numberOfLines={stylePresetButtonLines[filter]}
                  style={[
                    styles.advancedPresetText,
                    isKorean && styles.advancedPresetTextCompact,
                    { color: styleFilter === filter ? '#FFFFFF' : STYLE_PRESETS[filter].color },
                  ]}
                >
                  {stylePresetButtonLabels[filter]}
                </Text>
              </View>
            </View>
          </BouncyButton>
        ))}
      </View>

      <Text style={[styles.advancedSectionLabel, { color: theme.textMuted }]}>
        {extractionMethodLabel}
      </Text>
      <View style={styles.advancedMethodRow}>
        <BouncyButton
          style={[
            styles.advancedMethodButton,
            { backgroundColor: extractionMethod === 'histogram' ? COLOR_TOKENS.cyan : COLOR_TOKENS.cyan + '18' },
          ]}
          onPress={() => onMethodChange('histogram')}
          pressedScale={0.95}
          hapticFeedback
        >
          <Text style={[styles.advancedMethodTitle, { color: extractionMethod === 'histogram' ? '#FFFFFF' : theme.textPrimary }]}>
            {extractionMethodLabels.histogram}
          </Text>
          <Text style={[styles.advancedMethodDesc, { color: extractionMethod === 'histogram' ? OVERLAY_TOKENS.textOnMethodDesc : theme.textMuted }]}>
            {methodDescriptions.histogram}
          </Text>
        </BouncyButton>
        <BouncyButton
          style={[
            styles.advancedMethodButton,
            { backgroundColor: extractionMethod === 'kmeans' ? kmeansAccentColor : kmeansAccentColor + '18' },
          ]}
          onPress={() => onMethodChange('kmeans')}
          pressedScale={0.95}
          hapticFeedback
        >
          <Text style={[styles.advancedMethodTitle, { color: extractionMethod === 'kmeans' ? '#FFFFFF' : theme.textPrimary }]}>
            {extractionMethodLabels.kmeans}
          </Text>
          <Text style={[styles.advancedMethodDesc, { color: extractionMethod === 'kmeans' ? OVERLAY_TOKENS.textOnMethodDesc : theme.textMuted }]}>
            {methodDescriptions.kmeans}
          </Text>
        </BouncyButton>
      </View>

      <Text style={[styles.advancedSectionLabel, { color: theme.textMuted }]}>
        {colorCountLabel}
      </Text>
      <View style={[styles.advancedColorCount, { backgroundColor: theme.backgroundTertiary }]}>
        <BouncyButton
          style={[styles.advancedStepperBtn, { backgroundColor: theme.backgroundSecondary }]}
          onPress={() => onColorCountStep('down')}
          pressedScale={0.9}
          hapticFeedback
        >
          <Ionicons name="remove" size={18} color={theme.textSecondary} />
        </BouncyButton>
        <View style={[styles.advancedCountBadge, { backgroundColor: theme.accent }]}>
          <Text style={styles.advancedCountText}>{colorCount}</Text>
        </View>
        <BouncyButton
          style={[styles.advancedStepperBtn, { backgroundColor: theme.backgroundSecondary }]}
          onPress={() => onColorCountStep('up')}
          pressedScale={0.9}
          hapticFeedback
        >
          <Ionicons name="add" size={18} color={theme.textSecondary} />
        </BouncyButton>
      </View>

      <Text style={[styles.advancedSectionLabel, { color: theme.textMuted }]}>
        {colorVisionLabel}
      </Text>
      <View style={styles.advancedCvdGrid}>
        {cvdOptions.map((cvd) => {
          const isActive = colorBlindMode === cvd.type;
          return (
            <BouncyButton
              key={cvd.type}
              style={[
                styles.advancedCvdCard,
                {
                  backgroundColor: isActive
                    ? (cvd.type === 'none' ? theme.accent + '20' : COLOR_TOKENS.amber + '20')
                    : theme.backgroundTertiary,
                  borderWidth: isActive ? 1.5 : 1,
                  borderColor: isActive
                    ? (cvd.type === 'none' ? theme.accent : COLOR_TOKENS.amber)
                    : theme.backgroundTertiary,
                },
              ]}
              onPress={() => onColorBlindModeChange(cvd.type)}
              pressedScale={0.95}
              hapticFeedback
            >
              <View style={styles.cvdBarPair}>
                <View style={[styles.cvdBar, { backgroundColor: cvd.confusedPair[0] }]} />
                <View style={[styles.cvdBarSlash, { backgroundColor: theme.textMuted }]} />
                <View style={[styles.cvdBar, { backgroundColor: cvd.confusedPair[1] }]} />
              </View>
              <Text
                style={[
                  styles.advancedCvdLabel,
                  {
                    color: isActive
                      ? (cvd.type === 'none' ? theme.accent : COLOR_TOKENS.amber)
                      : theme.textPrimary,
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}
              >
                {cvd.label}
              </Text>
              <Text style={[styles.advancedCvdDesc, { color: theme.textMuted }]}>
                {cvd.description}
              </Text>
              {isActive && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={cvd.type === 'none' ? theme.accent : COLOR_TOKENS.amber}
                  style={styles.cvdCheck}
                />
              )}
            </BouncyButton>
          );
        })}
      </View>
    </Animated.View>
  );
}

export default React.memo(InlineSettingsPanel);
