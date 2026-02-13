import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { ExtractionMethod } from '../../lib/colorExtractor';
import { ColorBlindnessInfo, ColorBlindnessType } from '../../lib/colorUtils';
import { StyleFilter, STYLE_FILTER_KEYS, STYLE_PRESETS } from '../../constants/stylePresets';

interface InlineSettingsPanelProps {
  isMounted: boolean;
  showAdvanced: boolean;
  theme: ThemeColors;
  advancedPanelAnim: Animated.Value;
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
  onHapticLight: () => void;
  onClose: () => void;
}

export default function InlineSettingsPanel({
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
  onHapticLight,
  onClose,
}: InlineSettingsPanelProps) {
  if (!isMounted) return null;

  return (
    <Animated.View
      pointerEvents={showAdvanced ? 'auto' : 'none'}
      style={[
        styles.inlineSettingsPanel,
        {
          backgroundColor: theme.backgroundCard,
          borderColor: theme.border,
          opacity: advancedPanelAnim,
          transform: [
            {
              translateY: advancedPanelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, 0],
              }),
            },
            {
              scaleY: advancedPanelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.965, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.inlineSettingsHeaderRow}>
        <View>
          <Text style={[styles.inlineSettingsTitle, { color: theme.textPrimary }]}>{settingLabel}</Text>
        </View>
        <TouchableOpacity
          style={[styles.inlineSettingsCloseBtn, { backgroundColor: theme.backgroundTertiary }]}
          onPress={() => {
            onHapticLight();
            onClose();
          }}
        >
          <Ionicons name="close-outline" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.advancedSectionLabel, { color: theme.textMuted }]}>
        {stylePresetLabel}
      </Text>
      <View style={styles.advancedPresetRow}>
        {STYLE_FILTER_KEYS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.advancedPresetButton,
              isKorean && styles.advancedPresetButtonCompact,
              {
                backgroundColor: styleFilter === filter ? STYLE_PRESETS[filter].color : theme.backgroundTertiary,
              },
            ]}
            onPress={() => {
              onHapticLight();
              onStyleFilterChange(filter);
            }}
          >
            <View style={styles.advancedPresetInline}>
              <Ionicons
                name={STYLE_PRESETS[filter].icon}
                size={14}
                color={styleFilter === filter ? '#fff' : STYLE_PRESETS[filter].color}
              />
              <View style={[styles.advancedPresetLabelWrap, isKorean && styles.advancedPresetLabelWrapCompact]}>
                <Text
                  numberOfLines={stylePresetButtonLines[filter]}
                  style={[
                    styles.advancedPresetText,
                    isKorean && styles.advancedPresetTextCompact,
                    { color: styleFilter === filter ? '#fff' : STYLE_PRESETS[filter].color },
                  ]}
                >
                  {stylePresetButtonLabels[filter]}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.advancedSectionLabel, { color: theme.textMuted }]}>
        {extractionMethodLabel}
      </Text>
      <View style={styles.advancedMethodRow}>
        <TouchableOpacity
          style={[
            styles.advancedMethodButton,
            { backgroundColor: extractionMethod === 'histogram' ? '#38bdf8' : theme.backgroundTertiary },
          ]}
          onPress={() => {
            onHapticLight();
            onMethodChange('histogram');
          }}
        >
          <Text style={[styles.advancedMethodTitle, { color: extractionMethod === 'histogram' ? '#fff' : theme.textPrimary }]}>
            {extractionMethodLabels.histogram}
          </Text>
          <Text style={[styles.advancedMethodDesc, { color: extractionMethod === 'histogram' ? 'rgba(255,255,255,0.8)' : theme.textMuted }]}>
            {methodDescriptions.histogram}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.advancedMethodButton,
            { backgroundColor: extractionMethod === 'kmeans' ? kmeansAccentColor : theme.backgroundTertiary },
          ]}
          onPress={() => {
            onHapticLight();
            onMethodChange('kmeans');
          }}
        >
          <Text style={[styles.advancedMethodTitle, { color: extractionMethod === 'kmeans' ? '#fff' : theme.textPrimary }]}>
            {extractionMethodLabels.kmeans}
          </Text>
          <Text style={[styles.advancedMethodDesc, { color: extractionMethod === 'kmeans' ? 'rgba(255,255,255,0.8)' : theme.textMuted }]}>
            {methodDescriptions.kmeans}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.advancedSectionLabel, { color: theme.textMuted }]}>
        {colorCountLabel}
      </Text>
      <View style={[styles.advancedColorCount, { backgroundColor: theme.backgroundTertiary }]}>
        <TouchableOpacity
          style={[styles.advancedStepperBtn, { backgroundColor: theme.backgroundSecondary }]}
          onPress={() => onColorCountStep('down')}
        >
          <Ionicons name="remove" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
        <View style={[styles.advancedCountBadge, { backgroundColor: theme.accent }]}>
          <Text style={styles.advancedCountText}>{colorCount}</Text>
        </View>
        <TouchableOpacity
          style={[styles.advancedStepperBtn, { backgroundColor: theme.backgroundSecondary }]}
          onPress={() => onColorCountStep('up')}
        >
          <Ionicons name="add" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.advancedSectionLabel, { color: theme.textMuted }]}>
        {colorVisionLabel}
      </Text>
      <View style={styles.advancedCvdGrid}>
        {cvdOptions.map((cvd) => {
          const isActive = colorBlindMode === cvd.type;
          return (
            <TouchableOpacity
              key={cvd.type}
              style={[
                styles.advancedCvdCard,
                {
                  backgroundColor: isActive
                    ? (cvd.type === 'none' ? theme.accent + '20' : '#f59e0b' + '20')
                    : theme.backgroundTertiary,
                  borderWidth: isActive ? 1.5 : 1,
                  borderColor: isActive
                    ? (cvd.type === 'none' ? theme.accent : '#f59e0b')
                    : theme.backgroundTertiary,
                },
              ]}
              onPress={() => {
                onHapticLight();
                onColorBlindModeChange(cvd.type);
              }}
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
                      ? (cvd.type === 'none' ? theme.accent : '#f59e0b')
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
                  color={cvd.type === 'none' ? theme.accent : '#f59e0b'}
                  style={styles.cvdCheck}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}
