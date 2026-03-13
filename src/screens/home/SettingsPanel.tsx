import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { StyleFilter, STYLE_FILTER_KEYS, STYLE_PRESETS } from '../../constants/stylePresets';
import { COLOR_TOKENS, OVERLAY_TOKENS, BLUR_INTENSITY } from '../../constants/designTokens';
import { ExtractionMethod } from '../../lib/colorExtractor';
import { ColorBlindnessInfo, ColorBlindnessType } from '../../lib/colorUtils';
import { BouncyButton } from '../../components/BouncyButton';
import type { SettingChipId } from './SettingsSummaryBar';

interface SettingsPanelProps {
  theme: ThemeColors;
  activeDropdown: SettingChipId | null;
  isKorean: boolean;
  isInline?: boolean;
  // Style
  styleFilter: StyleFilter;
  stylePresetButtonLabels: Record<StyleFilter, string>;
  stylePresetButtonLines: Record<StyleFilter, number>;
  onStyleFilterChange: (filter: StyleFilter) => void;
  // Method
  extractionMethod: ExtractionMethod;
  extractionMethodLabels: Record<ExtractionMethod, string>;
  methodDescriptions: Record<ExtractionMethod, string>;
  onMethodChange: (method: ExtractionMethod) => void;
  // CVD
  colorBlindMode: ColorBlindnessType;
  cvdOptions: ColorBlindnessInfo[];
  onColorBlindModeChange: (value: ColorBlindnessType) => void;
}

function SettingsPanel({
  theme,
  activeDropdown,
  isKorean,
  isInline,
  styleFilter,
  stylePresetButtonLabels,
  stylePresetButtonLines,
  onStyleFilterChange,
  extractionMethod,
  extractionMethodLabels,
  methodDescriptions,
  onMethodChange,
  colorBlindMode,
  cvdOptions,
  onColorBlindModeChange,
}: SettingsPanelProps) {
  if (!activeDropdown || activeDropdown === 'bw') return null;

  const content = (
    <View style={[
      isInline ? panelStyles.inlineContainer : undefined,
      isInline && { borderTopColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
    ]}>
      {activeDropdown === 'style' && (
        <View style={isInline ? panelStyles.inlineContent : panelStyles.content}>
          <View style={[styles.advancedPresetRow, isInline && { marginBottom: 0 }]}>
            {STYLE_FILTER_KEYS.map((filter) => (
              <BouncyButton
                key={filter}
                style={[
                  styles.advancedPresetButton,
                  isKorean && styles.advancedPresetButtonCompact,
                  {
                    backgroundColor: styleFilter === filter
                      ? theme.accent
                      : theme.accent + (theme.isDark ? '25' : '18'),
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
                    color={styleFilter === filter ? '#FFFFFF' : theme.accent}
                  />
                  <View style={[styles.advancedPresetLabelWrap, isKorean && styles.advancedPresetLabelWrapCompact]}>
                    <Text
                      numberOfLines={stylePresetButtonLines[filter]}
                      style={[
                        styles.advancedPresetText,
                        isKorean && styles.advancedPresetTextCompact,
                        { color: styleFilter === filter ? '#FFFFFF' : theme.accent },
                      ]}
                    >
                      {stylePresetButtonLabels[filter]}
                    </Text>
                  </View>
                </View>
              </BouncyButton>
            ))}
          </View>
        </View>
      )}

      {activeDropdown === 'method' && (
        <View style={isInline ? panelStyles.inlineContent : panelStyles.content}>
          <View style={[styles.advancedMethodRow, isInline && { marginBottom: 0, paddingVertical: 10 }]}>
            {(['histogram', 'kmeans'] as const).map((method) => {
              const isActive = extractionMethod === method;
              return (
                <View key={method} style={{ flex: 1 }}>
                  <BouncyButton
                    style={[
                      styles.advancedMethodButton,
                      { overflow: 'hidden' },
                      isActive
                        ? {
                            backgroundColor: theme.isDark ? theme.backgroundTertiary : 'rgb(250, 252, 255)',
                            borderWidth: 1.5,
                            borderColor: theme.isDark ? 'rgba(93, 184, 232, 0.3)' : 'rgba(255,255,255,0.8)',
                          }
                        : { backgroundColor: theme.isDark ? theme.backgroundDepressed : 'rgb(218, 218, 222)' },
                    ]}
                    onPress={() => onMethodChange(method)}
                    pressedScale={0.95}
                    hapticFeedback
                  >
                    {!isActive && (
                      <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <LinearGradient
                          colors={theme.isDark
                            ? ['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.0)']
                            : ['rgba(0,0,0,0.18)', 'rgba(0,0,0,0.03)', 'rgba(0,0,0,0.0)']}
                          locations={[0, 0.5, 1]}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10 }}
                        />
                        <LinearGradient
                          colors={theme.isDark
                            ? ['rgba(0,0,0,0.20)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.0)']
                            : ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.03)', 'rgba(0,0,0,0.0)']}
                          locations={[0, 0.5, 1]}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 10 }}
                        />
                        <LinearGradient
                          colors={theme.isDark
                            ? ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)']
                            : ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.5)']}
                          locations={[0, 0.5, 1]}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10 }}
                        />
                        <LinearGradient
                          colors={theme.isDark
                            ? ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)']
                            : ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.5)']}
                          locations={[0, 0.5, 1]}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 10 }}
                        />
                      </View>
                    )}
                    <Text style={[styles.advancedMethodTitle, { color: isActive ? (theme.isDark ? '#5db8e8' : '#1976a8') : theme.textMuted }]}>
                      {extractionMethodLabels[method]}
                    </Text>
                    <Text style={[styles.advancedMethodDesc, { color: isActive ? (theme.isDark ? '#8ec8e8' : '#4a9aba') : theme.textMuted }]}>
                      {methodDescriptions[method]}
                    </Text>
                  </BouncyButton>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {activeDropdown === 'cvd' && (
        <View style={isInline ? panelStyles.inlineContent : panelStyles.content}>
          <View style={[panelStyles.cvdRow]}>
            {cvdOptions.map((cvd) => {
              const isActive = colorBlindMode === cvd.type;
              const activeColor = theme.accent;
              return (
                <BouncyButton
                  key={cvd.type}
                  style={[
                    panelStyles.cvdChip,
                    isInline && { paddingVertical: 8 },
                    {
                      backgroundColor: isActive ? activeColor + (theme.isDark ? '30' : '20') : theme.backgroundTertiary,
                      borderWidth: isActive ? 1.5 : 1,
                      borderColor: isActive ? activeColor : theme.backgroundTertiary,
                    },
                  ]}
                  onPress={() => onColorBlindModeChange(cvd.type)}
                  pressedScale={0.95}
                  hapticFeedback
                >
                  <View style={panelStyles.cvdBarPair}>
                    <View style={[panelStyles.cvdBar, { backgroundColor: cvd.confusedPair[0] }]} />
                    <View style={[panelStyles.cvdBar, { backgroundColor: cvd.confusedPair[1] }]} />
                  </View>
                  <Text
                    style={[
                      panelStyles.cvdLabel,
                      {
                        color: isActive ? activeColor : theme.textPrimary,
                        fontWeight: isActive ? '700' : '600',
                      },
                    ]}
                  >
                    {cvd.label}
                  </Text>
                </BouncyButton>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );

  if (isInline) return content;

  return (
    <View style={[styles.sectorNeumorphLight,
      theme.isDark && { shadowColor: '#2a2d45', shadowOpacity: 0.5 }
    ]}>
      <View style={[styles.imageGroupOuter, styles.paletteGroupOuter,
        theme.isDark && { shadowColor: '#000', shadowOpacity: 0.4 }
      ]}>
        <View style={[styles.imageGroupInner, { overflow: 'hidden' },
          theme.isDark && { backgroundColor: theme.backgroundSecondary }
        ]}>
          <BlurView intensity={25} tint={theme.isDark ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
          {content}
        </View>
      </View>
    </View>
  );
}

const panelStyles = StyleSheet.create({
  inlineContainer: {
    borderTopWidth: 1,
  },
  inlineContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  content: {
    padding: 10,
  },
  cvdRow: {
    flexDirection: 'row',
    gap: 6,
  },
  cvdChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cvdBarPair: {
    flexDirection: 'row',
    gap: 2,
  },
  cvdBar: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cvdLabel: {
    fontSize: 11,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
  },
});

export default React.memo(SettingsPanel);
