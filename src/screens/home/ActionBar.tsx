import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BouncyButton } from '../../components/BouncyButton';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { type AppLanguage } from '../../lib/colorUtils';
import { BLUR_INTENSITY, getOverlayTokens } from '../../constants/designTokens';

interface ActionBarProps {
  theme: ThemeColors;
  language: AppLanguage;
  onNavigateToLibrary: () => void;
  onSave: () => void;
  onExport: () => void;
}

function ActionBar({
  theme,
  language,
  onNavigateToLibrary,
  onSave,
  onExport,
}: ActionBarProps) {
  const isKorean = language === 'ko';
  const overlayTokens = getOverlayTokens(theme.isDark);
  return (
    <BlurView
      intensity={40}
      tint={theme.isDark ? "dark" : "light"}
      style={[styles.actionBar, { backgroundColor: overlayTokens.actionBarBg }]}
    >
      {/* 상단 하이라이트 */}
      <LinearGradient
        colors={theme.isDark
          ? ['rgba(255,255,255,0.06)', 'transparent']
          : ['rgba(255,255,255,0.25)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <BouncyButton
        style={styles.actionButton}
        onPress={onNavigateToLibrary}
        pressedScale={0.93}
        hapticFeedback
      >
        <Ionicons name="library-outline" size={20} color={theme.textSecondary} />
        <Text style={[styles.actionButtonText, { color: theme.textSecondary }]}>
          {isKorean ? '보관함' : 'Library'}
        </Text>
      </BouncyButton>

      <BouncyButton
        style={styles.saveButton}
        onPress={onSave}
        pressedScale={0.93}
        hapticFeedback
      >
        <Ionicons name="download-outline" size={20} color={theme.textOnAccent} />
        <Text style={styles.saveButtonText}>{isKorean ? '저장' : 'Save'}</Text>
      </BouncyButton>

      <BouncyButton
        style={styles.actionButton}
        onPress={onExport}
        pressedScale={0.93}
        hapticFeedback
      >
        <Ionicons name="share-outline" size={20} color={theme.accent} />
        <Text style={[styles.exportButtonText, { color: theme.accent }]}>
          {isKorean ? '내보내기' : 'Export'}
        </Text>
      </BouncyButton>
    </BlurView>
  );
}

export default React.memo(ActionBar);
