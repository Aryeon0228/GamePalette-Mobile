import React, { useState } from 'react';
import { Alert, View, Text, Modal, Linking, Image, StyleSheet as RNStyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { BouncyButton } from '../../../components/BouncyButton';

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
  const [logoLoadError, setLogoLoadError] = useState(false);
  const appVersion = Constants.expoConfig?.version ?? '1.1.0';
  const languageLabel = language === 'ko' ? '언어' : 'Language';
  const closeLabel = language === 'ko' ? '닫기' : 'Close';
  const feedbackLabel = language === 'ko' ? '피드백 보내기' : 'Send Feedback';
  const feedbackPromptTitle = language === 'ko' ? '진단 로그 포함' : 'Include Diagnostics';
  const feedbackPromptMessage = language === 'ko'
    ? '최근 진단 로그를 함께 보낼까요? 민감한 정보는 자동으로 가려집니다.'
    : 'Include recent diagnostics in the email? Sensitive data will be redacted automatically.';
  const feedbackWithoutLogsLabel = language === 'ko' ? '로그 없이 보내기' : 'Send Without Logs';
  const feedbackWithLogsLabel = language === 'ko' ? '로그 포함 보내기' : 'Send With Logs';
  const cancelLabel = language === 'ko' ? '취소' : 'Cancel';
  const subtitleLabel = language === 'ko' ? '간편한 컬러 추출기' : 'Simple Color Extractor';
  const footerLabel = language === 'ko'
    ? 'Studio Aryeon 제작\nCodex 및 Claude Code와 함께'
    : 'Built by Studio Aryeon\nwith Codex and Claude Code';
  const openFeedbackMail = async (includeDiagnostics: boolean) => {
    const report = includeDiagnostics ? await buildRuntimeErrorReport(5) : '';
    const bodyPrefix = language === 'ko'
      ? `안녕하세요! 피드백을 보냅니다.${includeDiagnostics ? '\n\n[Redacted Diagnostics]\n' : ''}`
      : `Hi! Sending feedback.${includeDiagnostics ? '\n\n[Redacted Diagnostics]\n' : ''}`;
    const url = `mailto:studio.aryeon@gmail.com?subject=Pixel Paw Feedback&body=${encodeURIComponent(
      `${bodyPrefix}${report}`
    )}`;
    void Linking.openURL(url);
  };
  const handleFeedbackPress = () => {
    onHapticLight();
    Alert.alert(feedbackPromptTitle, feedbackPromptMessage, [
      { text: cancelLabel, style: 'cancel' },
      { text: feedbackWithoutLogsLabel, onPress: () => { void openFeedbackMail(false); } },
      { text: feedbackWithLogsLabel, onPress: () => { void openFeedbackMail(true); } },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={40} tint="light" style={RNStyleSheet.absoluteFill} />
        <View style={[styles.infoModalContent, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.infoModalHeader}>
            <View style={styles.infoHeaderLogoMark}>
              {logoLoadError ? (
                <Ionicons name="paw" size={22} color="#ffd1dc" style={styles.infoHeaderLogoFallbackIcon} />
              ) : (
                <Image
                  source={require('../../../../assets/pow-header.png')}
                  style={styles.infoHeaderLogoImage}
                  resizeMode="contain"
                  onError={() => setLogoLoadError(true)}
                />
              )}
            </View>
            <Text style={[styles.infoModalTitle, { color: theme.textPrimary }]}>Pixel Paw</Text>
            <Text style={[styles.infoModalVersion, { color: theme.textMuted }]}>{subtitleLabel}</Text>
            <Text style={[styles.infoModalVersionNum, { color: theme.textMuted }]}>v{appVersion}</Text>
          </View>

          <BouncyButton
            pressedScale={0.93}
            hapticFeedback
            style={[styles.infoModalButton, { backgroundColor: theme.backgroundTertiary }]}
            onPress={handleFeedbackPress}
          >
            <Ionicons name="mail-outline" size={20} color={theme.accent} />
            <Text style={[styles.infoModalButtonText, { color: theme.textPrimary }]}>
              {feedbackLabel}
            </Text>
          </BouncyButton>

          <View style={styles.infoModalLanguageSection}>
            <Text style={[styles.infoModalLanguageLabel, { color: theme.textMuted }]}>
              {languageLabel}
            </Text>
            <View style={styles.infoModalLanguageToggleRow}>
              <BouncyButton
                pressedScale={0.93}
                hapticFeedback
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
                    { color: language === 'ko' ? theme.textOnAccent : theme.textSecondary },
                  ]}
                >
                  한국어
                </Text>
              </BouncyButton>
              <BouncyButton
                pressedScale={0.93}
                hapticFeedback
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
                    { color: language === 'en' ? theme.textOnAccent : theme.textSecondary },
                  ]}
                >
                  English
                </Text>
              </BouncyButton>
            </View>
          </View>

          <Text style={[styles.infoModalFooter, { color: theme.textMuted }]}>
            {footerLabel}
          </Text>

          <BouncyButton
            pressedScale={0.93}
            hapticFeedback
            style={[styles.infoModalCloseButton, { backgroundColor: theme.accent }]}
            onPress={() => {
              onHapticLight();
              onClose();
            }}
          >
            <Text style={styles.infoModalCloseButtonText}>{closeLabel}</Text>
          </BouncyButton>
        </View>
      </View>
    </Modal>
  );
}
