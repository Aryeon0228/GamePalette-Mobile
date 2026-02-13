import React from 'react';
import { View, Text, TouchableOpacity, Modal, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { styles } from '../HomeScreen.styles';
import { ThemeColors } from '../../../store/themeStore';
import { type AppLanguage } from '../../../lib/colorUtils';
import { buildRuntimeErrorReport } from '../../../lib/runtimeErrorLogger';

interface InfoModalProps {
  visible: boolean;
  theme: ThemeColors;
  language: AppLanguage;
  onLanguageChange: (value: AppLanguage) => void;
  onClose: () => void;
  onHapticLight: () => void;
}

export default function InfoModal({
  visible,
  theme,
  language,
  onLanguageChange,
  onClose,
  onHapticLight,
}: InfoModalProps) {
  const appVersion = Constants.expoConfig?.version ?? '1.1.0';
  const languageLabel = language === 'ko' ? '언어' : 'Language';
  const closeLabel = language === 'ko' ? '닫기' : 'Close';
  const feedbackLabel = language === 'ko' ? '피드백 보내기' : 'Send Feedback';
  const subtitleLabel = language === 'ko' ? '간편한 컬러 추출기' : 'Simple Color Extractor';
  const footerLabel = language === 'ko'
    ? 'Studio Aryeon 제작\nCodex 및 Claude Code와 함께'
    : 'Built by Studio Aryeon\nwith Codex and Claude Code';
  const handleFeedbackPress = async () => {
    onHapticLight();
    const report = await buildRuntimeErrorReport(5);
    const bodyPrefix = language === 'ko'
      ? '안녕하세요! 피드백을 보냅니다.\n\n[Runtime Error Logs]\n'
      : 'Hi! Sending feedback.\n\n[Runtime Error Logs]\n';
    const url = `mailto:studio.aryeon@gmail.com?subject=Pixel Paw Feedback&body=${encodeURIComponent(
      `${bodyPrefix}${report}`
    )}`;
    void Linking.openURL(url);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
        <View style={[styles.infoModalContent, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.infoModalHeader}>
            <View style={[styles.headerLogoMark, { marginBottom: 16 }]}>
              <Image
                source={require('../../../../assets/pow-header.png')}
                style={styles.headerLogoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.infoModalTitle, { color: theme.textPrimary }]}>Pixel Paw</Text>
            <Text style={[styles.infoModalVersion, { color: theme.textMuted }]}>{subtitleLabel}</Text>
            <Text style={[styles.infoModalVersionNum, { color: theme.textMuted }]}>v{appVersion}</Text>
          </View>

          <TouchableOpacity
            style={[styles.infoModalButton, { backgroundColor: theme.backgroundTertiary }]}
            onPress={() => {
              void handleFeedbackPress();
            }}
          >
            <Ionicons name="mail-outline" size={20} color={theme.accent} />
            <Text style={[styles.infoModalButtonText, { color: theme.textPrimary }]}>
              {feedbackLabel}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoModalLanguageSection}>
            <Text style={[styles.infoModalLanguageLabel, { color: theme.textMuted }]}>
              {languageLabel}
            </Text>
            <View style={styles.infoModalLanguageToggleRow}>
              <TouchableOpacity
                style={[
                  styles.infoModalLanguageButton,
                  {
                    backgroundColor: language === 'ko' ? theme.accent : theme.backgroundTertiary,
                  },
                ]}
                onPress={() => {
                  onHapticLight();
                  onLanguageChange('ko');
                }}
              >
                <Text
                  style={[
                    styles.infoModalLanguageButtonText,
                    { color: language === 'ko' ? '#fff' : theme.textSecondary },
                  ]}
                >
                  한국어
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.infoModalLanguageButton,
                  {
                    backgroundColor: language === 'en' ? theme.accent : theme.backgroundTertiary,
                  },
                ]}
                onPress={() => {
                  onHapticLight();
                  onLanguageChange('en');
                }}
              >
                <Text
                  style={[
                    styles.infoModalLanguageButtonText,
                    { color: language === 'en' ? '#fff' : theme.textSecondary },
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.infoModalFooter, { color: theme.textMuted }]}>
            {footerLabel}
          </Text>

          <TouchableOpacity
            style={[styles.infoModalCloseButton, { backgroundColor: theme.accent }]}
            onPress={() => {
              onHapticLight();
              onClose();
            }}
          >
            <Text style={styles.infoModalCloseButtonText}>{closeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
