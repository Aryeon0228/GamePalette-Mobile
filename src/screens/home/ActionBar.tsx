import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { type AppLanguage } from '../../lib/colorUtils';

interface ActionBarProps {
  theme: ThemeColors;
  language: AppLanguage;
  onNavigateToLibrary: () => void;
  onSave: () => void;
  onExport: () => void;
  onHapticLight: () => void;
}

function ActionBar({
  theme,
  language,
  onNavigateToLibrary,
  onSave,
  onExport,
  onHapticLight,
}: ActionBarProps) {
  const isKorean = language === 'ko';
  const neutralButtonStyle = {
    backgroundColor: theme.backgroundTertiary,
    borderColor: theme.borderLight,
  };

  return (
    <BlurView
      intensity={70}
      tint={theme.background === '#000000' || theme.background === '#1C1C1E' ? 'dark' : 'light'}
      style={[styles.actionBar, { backgroundColor: theme.backgroundSecondary + '88', borderTopColor: theme.border }]}
    >
      <TouchableOpacity
        style={[styles.actionButton, neutralButtonStyle]}
        onPress={() => {
          onHapticLight();
          onNavigateToLibrary();
        }}
      >
        <Ionicons name="library-outline" size={22} color={theme.textSecondary} />
        <Text style={[styles.actionButtonText, { color: theme.textSecondary }]}>
          {isKorean ? '보관함' : 'Library'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          onHapticLight();
          onSave();
        }}
      >
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text style={styles.saveButtonText}>{isKorean ? '저장' : 'Save'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.exportButton, neutralButtonStyle]}
        onPress={() => {
          onHapticLight();
          onExport();
        }}
      >
        <Ionicons name="share-outline" size={22} color={theme.accent} />
        <Text style={[styles.exportButtonText, { color: theme.accent }]}>
          {isKorean ? '내보내기' : 'Export'}
        </Text>
      </TouchableOpacity>
    </BlurView>
  );
}

export default React.memo(ActionBar);
