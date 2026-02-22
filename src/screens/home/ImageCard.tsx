import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Grayscale } from 'react-native-color-matrix-image-filters';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { COLOR_TOKENS } from '../../constants/designTokens';
import { type AppLanguage } from '../../lib/colorUtils';
import { BouncyButton } from '../../components/BouncyButton';

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

function ImageCard({
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

  const loupeX = useSharedValue(-100);
  const loupeY = useSharedValue(-100);
  const loupeScale = useSharedValue(0);
  const isInteracting = useSharedValue(false);

  const triggerHaptic = (type: 'light' | 'medium') => {
    if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleScanComplete = () => {
    triggerHaptic('medium');
    onReExtractPress();
  };

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      isInteracting.value = true;
      loupeX.value = e.x;
      loupeY.value = e.y;
      loupeScale.value = withSpring(1, { damping: 15 });
      runOnJS(triggerHaptic)('light');
    })
    .onChange((e) => {
      loupeX.value = e.x;
      loupeY.value = e.y;
    })
    .onFinalize(() => {
      isInteracting.value = false;
      loupeScale.value = withSpring(0);
      runOnJS(handleScanComplete)();
    });

  const animatedLoupeStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: loupeX.value - 30 },
        { translateY: loupeY.value - 60 },
        { scale: loupeScale.value }
      ],
      opacity: loupeScale.value,
    };
  });

  if (currentImageUri) {
    const imageElement = (
      <Image
        source={{ uri: currentImageUri }}
        style={styles.image}
        contentFit="cover"
      />
    );

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.imageCard}>
          <View style={{ width: '100%', height: '100%' }}>
            {showGrayscale ? (
              <Grayscale style={{ width: '100%', height: '100%' }}>
                {imageElement}
              </Grayscale>
            ) : (
              imageElement
            )}
          </View>

          <Animated.View style={[styles.loupe, animatedLoupeStyle]} pointerEvents="none">
            <View style={styles.loupeCrosshair} />
          </Animated.View>

          <View style={styles.sourceImageBadge}>
            <Text style={styles.sourceImageText}>{isKorean ? '원본 이미지' : 'Source Image'}</Text>
          </View>
          <BouncyButton
            style={[
              styles.valueOverlayButton,
              {
                backgroundColor: showGrayscale ? '#34d399' + 'CC' : 'rgba(0, 0, 0, 0.6)',
              },
            ]}
            onPress={() => onToggleGrayscale()}
            pressedScale={0.9}
            hapticFeedback
          >
            <Ionicons name="contrast-outline" size={14} color="#fff" />
            <Text style={styles.valueOverlayButtonText}>{isKorean ? '명도' : 'Value'}</Text>
          </BouncyButton>

          <BouncyButton
            style={styles.reExtractIconButton}
            onPress={onReExtractPress}
            pressedScale={0.9}
            hapticFeedback
            isBreathing={!isExtracting}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
          </BouncyButton>

          {isExtracting && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>{isKorean ? '색상을 추출하는 중...' : 'Extracting colors...'}</Text>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    );
  }

  return (
    <View style={[styles.imageCardEmpty, { backgroundColor: theme.backgroundSecondary, borderColor: theme.borderLight }]}>
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
        <BouncyButton
          style={[styles.imageSourceButton, { backgroundColor: theme.backgroundTertiary, borderColor: theme.borderLight }]}
          onPress={onOpenCamera}
          hapticFeedback
        >
          <View style={[styles.imageSourceIconBg, { backgroundColor: `${cameraAccent}24` }]}>
            <Ionicons name="camera" size={22} color={cameraAccent} />
          </View>
          <Text style={[styles.imageSourceButtonText, { color: theme.textPrimary }]}>
            {isKorean ? '카메라' : 'Camera'}
          </Text>
        </BouncyButton>
        <BouncyButton
          style={[styles.imageSourceButton, { backgroundColor: theme.backgroundTertiary, borderColor: theme.borderLight }]}
          onPress={onPickFromGallery}
          hapticFeedback
        >
          <View style={[styles.imageSourceIconBg, { backgroundColor: '#f472b6' + '20' }]}>
            <Ionicons name="images" size={22} color="#f472b6" />
          </View>
          <Text style={[styles.imageSourceButtonText, { color: theme.textPrimary }]}>
            {isKorean ? '갤러리' : 'Gallery'}
          </Text>
        </BouncyButton>
      </View>
    </View>
  );
}

export default React.memo(ImageCard);
