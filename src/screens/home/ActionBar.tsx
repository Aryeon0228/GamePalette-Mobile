import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BouncyButton } from '../../components/BouncyButton';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { type AppLanguage } from '../../lib/colorUtils';
import { OVERLAY_TOKENS } from '../../constants/designTokens';

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
  const neutralButtonStyle = {
    backgroundColor: theme.backgroundTertiary,
    borderColor: theme.borderLight,
  };

  return (
    <BlurView
      intensity={70}
      tint="light"
      style={[styles.actionBar, { backgroundColor: 'rgba(255,255,255,0.65)', borderTopColor: theme.border }]}
    >
      <LinearGradient
        colors={[OVERLAY_TOKENS.gradientWhite10, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
      />

      <BouncyButton
        style={[styles.actionButton, neutralButtonStyle]}
        onPress={onNavigateToLibrary}
        pressedScale={0.93}
        hapticFeedback
      >
        <Ionicons name="library-outline" size={22} color={theme.textSecondary} />
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
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text style={styles.saveButtonText}>{isKorean ? '저장' : 'Save'}</Text>
      </BouncyButton>

      <BouncyButton
        style={[styles.exportButton, neutralButtonStyle]}
        onPress={onExport}
        pressedScale={0.93}
        hapticFeedback
      >
        <Ionicons name="share-outline" size={22} color={theme.accent} />
        <Text style={[styles.exportButtonText, { color: theme.accent }]}>
          {isKorean ? '내보내기' : 'Export'}
        </Text>
      </BouncyButton>
    </BlurView>
  );
}

export default React.memo(ActionBar);
