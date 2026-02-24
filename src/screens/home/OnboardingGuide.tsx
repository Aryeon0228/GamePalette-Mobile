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
    <View style={[styles.emptyGuideCard, { backgroundColor: theme.backgroundCard, borderColor: theme.borderLight }]}>
      <Text style={[styles.emptyGuideTitle, { color: theme.textPrimary }]}>
        {title}
      </Text>
      <View style={styles.emptyGuideRows}>
        <View style={styles.emptyGuideRow}>
          <Ionicons name="image-outline" size={14} color={theme.accent} />
          <Text style={[styles.emptyGuideText, { color: theme.textMuted }]}>
            {addImageLabel}
          </Text>
        </View>
        <View style={styles.emptyGuideRow}>
          <Ionicons name="options-outline" size={14} color={theme.accent} />
          <Text style={[styles.emptyGuideText, { color: theme.textMuted }]}>
            {expandSettingsLabel}
          </Text>
        </View>
        <View style={styles.emptyGuideRow}>
          <Ionicons name="hand-left-outline" size={14} color={theme.accent} />
          <Text style={[styles.emptyGuideText, { color: theme.textMuted }]}>
            {tapSwatchLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default React.memo(OnboardingGuide);
