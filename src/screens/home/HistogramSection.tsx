import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { LuminosityHistogram } from '../../lib/colorExtractor';
import { COLOR_TOKENS } from '../../constants/designTokens';
import { GlassPanel } from '../../components/GlassPanel';

interface HistogramSectionProps {
  theme: ThemeColors;
  histogram: LuminosityHistogram;
  histogramTitle: string;
  histogramContrastLabel: string;
  histogramDarkLabel: string;
  histogramMidLabel: string;
  histogramBrightLabel: string;
  histogramAverageLabel: string;
}

function HistogramSection({
  theme,
  histogram,
  histogramTitle,
  histogramContrastLabel,
  histogramDarkLabel,
  histogramMidLabel,
  histogramBrightLabel,
  histogramAverageLabel,
}: HistogramSectionProps) {
  return (
    <GlassPanel
      intensity={45}
      tint={theme.isDark ? 'dark' : 'light'}
      style={[styles.histogramCard, { borderColor: theme.border }]}
    >
      <View style={styles.histogramHeader}>
        <View style={styles.histogramTitleRow}>
          <Ionicons name="analytics-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.histogramTitle, { color: theme.textMuted }]}>{histogramTitle}</Text>
        </View>
        <View style={styles.histogramStats}>
          <Text style={[styles.histogramStatText, { color: theme.accent }]}>{histogram.contrast}%</Text>
          <Text style={[styles.histogramContrastLabel, { color: theme.textMuted }]}>{histogramContrastLabel}</Text>
        </View>
      </View>

      <View style={styles.histogramBars}>
        {histogram.bins.map((value, index) => (
          <View key={'bin-' + index} style={styles.histogramBarWrapper}>
            <View
              style={[
                styles.histogramBar,
                {
                  height: `${Math.max(value, 2)}%`,
                  backgroundColor: index < 11 ? COLOR_TOKENS.textMuted : index < 21 ? COLOR_TOKENS.textSubtle : COLOR_TOKENS.textFaint,
                },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.histogramScale}>
        <View style={styles.histogramGradient}>
          {Array.from({ length: 16 }).map((_, i) => (
            <View
              key={'grad-' + i}
              style={[
                styles.histogramGradientStep,
                { backgroundColor: `rgb(${i * 17}, ${i * 17}, ${i * 17})` },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.histogramStatsRow}>
        <View style={[styles.histogramStatItem, { backgroundColor: theme.backgroundTertiary, borderColor: theme.borderLight, borderWidth: 1 }]}>
          <Text style={[styles.histogramStatValue, { color: theme.textPrimary }]}>{histogram.darkPercent}%</Text>
          <Text style={[styles.histogramStatLabel, { color: theme.textSecondary }]}>{histogramDarkLabel}</Text>
        </View>
        <View style={[styles.histogramStatItem, { backgroundColor: theme.backgroundTertiary, borderColor: theme.borderLight, borderWidth: 1 }]}>
          <Text style={[styles.histogramStatValue, { color: theme.textPrimary }]}>{histogram.midPercent}%</Text>
          <Text style={[styles.histogramStatLabel, { color: theme.textSecondary }]}>{histogramMidLabel}</Text>
        </View>
        <View style={[styles.histogramStatItem, { backgroundColor: theme.backgroundTertiary, borderColor: theme.borderLight, borderWidth: 1 }]}>
          <Text style={[styles.histogramStatValue, { color: theme.textPrimary }]}>{histogram.brightPercent}%</Text>
          <Text style={[styles.histogramStatLabel, { color: theme.textSecondary }]}>{histogramBrightLabel}</Text>
        </View>
        <View
          style={[
            styles.histogramStatItem,
            styles.histogramStatItemAvg,
            { backgroundColor: theme.accent + '1a', borderColor: theme.accent + '44', borderWidth: 1 },
          ]}
        >
          <Text style={[styles.histogramStatValueAvg, { color: theme.accent }]}>{histogram.average}</Text>
          <Text style={[styles.histogramStatLabel, { color: theme.textSecondary }]}>{histogramAverageLabel}</Text>
        </View>
      </View>
    </GlassPanel>
  );
}

export default React.memo(HistogramSection);
