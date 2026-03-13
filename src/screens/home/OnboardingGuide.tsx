import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';

interface OnboardingGuideProps {
  theme: ThemeColors;
  title: string;
  addImageLabel: string;
  expandSettingsLabel: string;
  tapSwatchLabel: string;
}

function OnboardingGuide({
  theme,
  title,
  addImageLabel,
  expandSettingsLabel,
  tapSwatchLabel,
}: OnboardingGuideProps) {
  return (
    <View style={styles.emptyGuideCard}>
      <Text style={[styles.emptyGuideTitle, { color: theme.textPrimary }]}>
        {title}
      </Text>
      <View style={styles.emptyGuideRows}>
        <View style={styles.emptyGuideRow}>
          <Ionicons name="image-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.emptyGuideText, { color: theme.textSecondary }]}>
            {addImageLabel}
          </Text>
        </View>
        <View style={styles.emptyGuideRow}>
          <Ionicons name="options-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.emptyGuideText, { color: theme.textSecondary }]}>
            {expandSettingsLabel}
          </Text>
        </View>
        <View style={styles.emptyGuideRow}>
          <Ionicons name="hand-left-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.emptyGuideText, { color: theme.textSecondary }]}>
            {tapSwatchLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default React.memo(OnboardingGuide);
