import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

import { styles } from '../HomeScreen.styles';
import { ThemeColors } from '../../../store/themeStore';
import { type AppLanguage } from '../../../lib/colorUtils';

interface SavePaletteModalProps {
  visible: boolean;
  theme: ThemeColors;
  language: AppLanguage;
  paletteName: string;
  onPaletteNameChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SavePaletteModal({
  visible,
  theme,
  language,
  paletteName,
  onPaletteNameChange,
  onClose,
  onConfirm,
}: SavePaletteModalProps) {
  const isKorean = language === 'ko';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
            {isKorean ? '팔레트 저장' : 'Save Palette'}
          </Text>
          <TextInput
            style={[
              styles.modalInput,
              { backgroundColor: theme.backgroundTertiary, color: theme.textPrimary, borderColor: theme.border },
            ]}
            value={paletteName}
            onChangeText={onPaletteNameChange}
            placeholder={isKorean ? '자동: 팔레트 YYYY-MM-DD_001' : 'Auto: Palette YYYY-MM-DD_001'}
            placeholderTextColor={theme.textMuted}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.buttonBg }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: theme.textSecondary }]}>
                {isKorean ? '취소' : 'Cancel'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={onConfirm}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                {isKorean ? '저장' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
