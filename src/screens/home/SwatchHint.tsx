import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { GlassPanel } from '../../components/GlassPanel';

interface SwatchHintProps {
  theme: ThemeColors;
  title: string;
  subtitle: string;
}

function SwatchHint({ theme, title, subtitle }: SwatchHintProps) {
  return (
    <GlassPanel
      intensity={40}
      tint={theme.isDark ? 'dark' : 'light'}
      style={[styles.swatchHintCard, { borderColor: theme.borderLight }]}
    >
      <View style={[styles.swatchHintIcon, { backgroundColor: theme.accent + '22' }]}>
        <Ionicons name="hand-left-outline" size={15} color={theme.accent} />
      </View>
      <View style={styles.swatchHintTextWrap}>
        <Text style={[styles.swatchHintTitle, { color: theme.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.swatchHintSubtitle, { color: theme.textMuted }]}>
          {subtitle}
        </Text>
      </View>
    </GlassPanel>
  );
}

export default React.memo(SwatchHint);
