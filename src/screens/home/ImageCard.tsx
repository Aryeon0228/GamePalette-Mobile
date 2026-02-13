import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Grayscale } from 'react-native-color-matrix-image-filters';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { COLOR_TOKENS } from '../../constants/designTokens';
import { type AppLanguage } from '../../lib/colorUtils';

interface ImageCardProps {
  currentImageUri: string | null;
  showGrayscale: boolean;
  language: AppLanguage;
  theme: ThemeColors;
  isExtracting: boolean;
  onImagePress: () => void;
  onToggleGrayscale: () => void;
  onReExtractPress: () => void;
  onOpenCamera: () => void;
  onPickFromGallery: () => void;
}

export default function ImageCard({
  currentImageUri,
  showGrayscale,
  language,
  theme,
  isExtracting,
  onImagePress,
  onToggleGrayscale,
  onReExtractPress,
  onOpenCamera,
  onPickFromGallery,
}: ImageCardProps) {
  const isKorean = language === 'ko';
  const cameraAccent = COLOR_TOKENS.info;
  const emptyDecoIcons: Array<{
    name: string;
    color: string;
    size: number;
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    opacity?: number;
  }> = [
    { name: 'star', color: '#fbbf24', size: 13, top: 14, left: 20, opacity: 0.58 },
    { name: 'paw', color: '#f472b6', size: 12, top: 28, right: 28, opacity: 0.46 },
    { name: 'star-outline', color: '#60a5fa', size: 12, bottom: 42, left: 30, opacity: 0.52 },
    { name: 'paw', color: '#34d399', size: 13, top: 50, right: 50, opacity: 0.44 },
    { name: 'star', color: '#a78bfa', size: 11, bottom: 22, right: 20, opacity: 0.56 },
  ];

  if (currentImageUri) {
    const imageElement = (
      <Image
        source={{ uri: currentImageUri }}
        style={styles.image}
        contentFit="cover"
      />
    );

    return (
      <TouchableOpacity style={styles.imageCard} onPress={onImagePress}>
        <View style={{ width: '100%', height: '100%' }}>
          {showGrayscale ? (
            <Grayscale style={{ width: '100%', height: '100%' }}>
              {imageElement}
            </Grayscale>
          ) : (
            imageElement
          )}
        </View>
        <View style={styles.sourceImageBadge}>
          <Text style={styles.sourceImageText}>{isKorean ? '원본 이미지' : 'Source Image'}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.valueOverlayButton,
            {
              backgroundColor: showGrayscale ? '#34d399' + 'CC' : 'rgba(0, 0, 0, 0.6)',
            },
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onToggleGrayscale();
          }}
        >
          <Ionicons name="contrast-outline" size={14} color="#fff" />
          <Text style={styles.valueOverlayButtonText}>{isKorean ? '명도' : 'Value'}</Text>
        </TouchableOpacity>
        {/* Re-extract button */}
        <TouchableOpacity
          style={styles.reExtractIconButton}
          onPress={(e) => {
            e.stopPropagation();
            onReExtractPress();
          }}
          disabled={isExtracting}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
        </TouchableOpacity>
        {isExtracting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>{isKorean ? '색상을 추출하는 중...' : 'Extracting colors...'}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.imageCardEmpty, { backgroundColor: theme.backgroundSecondary, borderColor: theme.borderLight }]}
    >
      {/* Decorative markers: mixed stars + paws for quick visual comparison */}
      <View style={styles.emptyDecoContainer}>
        {emptyDecoIcons.map((icon, index) => (
          <Ionicons
            key={`${icon.name}-${index}`}
            name={icon.name as any}
            size={icon.size}
            color={icon.color}
            style={[
              styles.emptyDecoIcon,
              {
                top: icon.top,
                right: icon.right,
                bottom: icon.bottom,
                left: icon.left,
                opacity: icon.opacity ?? 0.5,
              },
            ]}
          />
        ))}
      </View>

      {/* Central content */}
      <View style={[styles.emptyIconCircle, { backgroundColor: theme.accent + '15' }]}>
        <View style={[styles.emptyIconInner, { backgroundColor: theme.accent + '25' }]}>
          <Ionicons name="color-palette-outline" size={32} color={theme.accent} />
        </View>
      </View>
      <Text style={[styles.imageCardEmptyTitle, { color: theme.textPrimary }]}>
        {isKorean ? '이미지를 추가해 주세요' : 'Add your artwork'}
      </Text>
      <Text style={[styles.imageCardEmptySubtitle, { color: theme.textMuted }]}>
        {isKorean ? '아름다운 색상 팔레트를 추출해 보세요' : 'Extract beautiful color palettes'}
      </Text>
      <View style={styles.imageSourceButtons}>
        <TouchableOpacity
          style={[styles.imageSourceButton, { backgroundColor: theme.backgroundTertiary, borderColor: theme.borderLight }]}
          onPress={onOpenCamera}
        >
          <View style={[styles.imageSourceIconBg, { backgroundColor: `${cameraAccent}24` }]}>
            <Ionicons name="camera" size={22} color={cameraAccent} />
          </View>
          <Text style={[styles.imageSourceButtonText, { color: theme.textPrimary }]}>
            {isKorean ? '카메라' : 'Camera'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.imageSourceButton, { backgroundColor: theme.backgroundTertiary, borderColor: theme.borderLight }]}
          onPress={onPickFromGallery}
        >
          <View style={[styles.imageSourceIconBg, { backgroundColor: '#f472b6' + '20' }]}>
            <Ionicons name="images" size={22} color="#f472b6" />
          </View>
          <Text style={[styles.imageSourceButtonText, { color: theme.textPrimary }]}>
            {isKorean ? '갤러리' : 'Gallery'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
