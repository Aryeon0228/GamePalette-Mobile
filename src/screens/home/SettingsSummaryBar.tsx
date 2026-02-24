import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { StyleFilter, STYLE_PRESETS } from '../../constants/stylePresets';
import { UNIFIED_EMPHASIS } from '../../constants/uiEmphasis';
import { BouncyButton } from '../../components/BouncyButton';

interface SettingsSummaryBarProps {
  theme: ThemeColors;
  styleFilter: StyleFilter;
  styleChipColor: string;
  methodChipColor: string;
  countChipColor: string;
  extractionMethodLabel: string;
  stylePresetChipLabel: string;
  colorCount: number;
  colorBlindMode: string;
  cvdChipLabel: string;
  isAdvancedMounted: boolean;
  onToggleAdvancedPanel: () => void;
}

function SettingsSummaryBar({
  theme,
  styleFilter,
  styleChipColor,
  methodChipColor,
  countChipColor,
  extractionMethodLabel,
  stylePresetChipLabel,
  colorCount,
  colorBlindMode,
  cvdChipLabel,
  isAdvancedMounted,
  onToggleAdvancedPanel,
}: SettingsSummaryBarProps) {
  return (
    <BlurView
      intensity={60}
      tint="light"
      style={[styles.summaryBar, { backgroundColor: 'rgba(255,255,255,0.50)' }]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.summaryChipsScroll}
      >
        <View style={[styles.summaryChip, { backgroundColor: styleChipColor + UNIFIED_EMPHASIS.chipBgAlpha, borderColor: styleChipColor + UNIFIED_EMPHASIS.chipBorderAlpha, borderWidth: 1 }]}>
          <Ionicons name={STYLE_PRESETS[styleFilter].icon} size={13} color={styleChipColor} />
          <Text style={[styles.summaryChipText, { color: styleChipColor }]}>{stylePresetChipLabel}</Text>
        </View>
        <View style={[styles.summaryChip, { backgroundColor: methodChipColor + UNIFIED_EMPHASIS.chipBgAlpha, borderColor: methodChipColor + UNIFIED_EMPHASIS.chipBorderAlpha, borderWidth: 1 }]}>
          <Ionicons name="flask-outline" size={13} color={methodChipColor} />
          <Text style={[styles.summaryChipText, { color: methodChipColor }]}>
            {extractionMethodLabel}
          </Text>
        </View>
        <View style={[styles.summaryChip, { backgroundColor: countChipColor + UNIFIED_EMPHASIS.chipBgAlpha, borderColor: countChipColor + UNIFIED_EMPHASIS.chipBorderAlpha, borderWidth: 1 }]}>
          <Ionicons name="color-palette-outline" size={13} color={countChipColor} />
          <Text style={[styles.summaryChipText, { color: countChipColor }]}>{colorCount}</Text>
        </View>
        {colorBlindMode !== 'none' && (
          <View style={[styles.summaryChip, { backgroundColor: UNIFIED_EMPHASIS.cvdBg, borderColor: UNIFIED_EMPHASIS.cvdBorder, borderWidth: 1 }]}>
            <Ionicons name="eye-outline" size={13} color={UNIFIED_EMPHASIS.cvdText} />
            <Text style={[styles.summaryChipText, { color: UNIFIED_EMPHASIS.cvdText }]}>{cvdChipLabel}</Text>
          </View>
        )}
      </ScrollView>
      <BouncyButton
        style={[
          styles.summaryEditButton,
          { backgroundColor: isAdvancedMounted ? theme.accent + '22' : theme.backgroundTertiary },
        ]}
        onPress={onToggleAdvancedPanel}
        pressedScale={0.9}
        hapticFeedback
      >
        <Ionicons
          name={isAdvancedMounted ? 'close-outline' : 'options-outline'}
          size={16}
          color={isAdvancedMounted ? theme.accent : theme.textSecondary}
        />
      </BouncyButton>
    </BlurView>
  );
}

export default React.memo(SettingsSummaryBar);
