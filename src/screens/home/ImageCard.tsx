import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image as RNImage } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Grayscale } from 'react-native-color-matrix-image-filters';

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
    .minDistance(8)
    .onStart((e) => {
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
    .onEnd(() => {
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
    return (
      <View style={styles.imageCard}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={{ width: '100%', height: '100%' }}>
            <View style={{ width: '100%', height: '100%' }}>
              {showGrayscale ? (
                <Grayscale amount={1}>
                  <RNImage
                    source={{ uri: currentImageUri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </Grayscale>
              ) : (
                <Image
                  source={{ uri: currentImageUri }}
                  style={styles.image}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              )}
            </View>

            <Animated.View style={[styles.loupe, animatedLoupeStyle]} pointerEvents="none">
              <View style={styles.loupeCrosshair} />
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        <BouncyButton
          style={styles.sourceImageBadge}
          onPress={onImagePress}
          pressedScale={0.9}
          hapticFeedback
        >
          <Ionicons name="camera-reverse-outline" size={13} color={theme.textOnAccent} style={{ marginRight: 4 }} />
          <Text style={styles.sourceImageText}>{isKorean ? '변경' : 'Change'}</Text>
        </BouncyButton>

        <BouncyButton
          style={styles.reExtractIconButton}
          onPress={onReExtractPress}
          pressedScale={0.9}
          hapticFeedback
          isBreathing={!isExtracting}
        >
          <Ionicons name="refresh" size={18} color={theme.textOnAccent} />
        </BouncyButton>


        {isExtracting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.textOnAccent} />
            <Text style={styles.loadingText}>
              {isKorean ? '색상을 추출하는 중...' : 'Extracting colors...'}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.imageCardEmptyBorder}>
      <View style={[styles.imageCardEmpty,
        theme.isDark && { backgroundColor: theme.backgroundSecondary + 'CC' }
      ]}>
        {/* 배경: 보라→파랑→초록 대각선 */}
        <LinearGradient
          colors={theme.isDark
            ? ['rgb(38, 35, 62)', 'rgb(35, 38, 60)', 'rgb(35, 35, 62)']
            : ['rgb(218, 210, 248)', 'rgb(205, 215, 250)', 'rgb(215, 218, 250)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        {/* 시안 blob (RadialGradient) */}
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <RadialGradient id="emptyBgGrad" cx="58%" cy="35%" r="45%">
              <Stop offset="0%" stopColor={theme.isDark ? "rgb(45, 42, 72)" : "rgb(210, 215, 255)"} stopOpacity={theme.isDark ? "0.5" : "0.7"} />
              <Stop offset="100%" stopColor={theme.isDark ? "rgb(45, 42, 72)" : "rgb(210, 215, 255)"} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#emptyBgGrad)" />
        </Svg>
        {/* 오목 이너섀도우 — 상단 */}
        <LinearGradient
          colors={theme.isDark ? ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)'] : ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 14, zIndex: 10 }} pointerEvents="none"
        />
        {/* 좌측 */}
        <LinearGradient
          colors={theme.isDark ? ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)'] : ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 14, zIndex: 10 }} pointerEvents="none"
        />
        {/* 하단 하이라이트 */}
        <LinearGradient
          colors={theme.isDark ? ['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)'] : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)']}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, zIndex: 10 }} pointerEvents="none"
        />
        {/* 우측 하이라이트 */}
        <LinearGradient
          colors={theme.isDark ? ['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)'] : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)']}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 14, zIndex: 10 }} pointerEvents="none"
        />
        <View style={styles.imageSourceButtons}>
        <View style={styles.imageSourceCardGlow}>
          <BouncyButton
            style={[styles.imageSourceCard, {
              backgroundColor: theme.isDark ? theme.backgroundTertiary + '99' : 'rgb(245, 245, 252)',
              borderWidth: 1.5,
              borderColor: theme.isDark ? theme.border + '18' : 'rgba(255,255,255,0.5)',
              overflow: 'hidden',
            }]}
            onPress={onOpenCamera}
            hapticFeedback
            pressedScale={0.95}
            isFloating
            floatingDistance={3}
            floatingDuration={2200}
          >
            {theme.isDark ? (
              <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFillObject} />
            ) : (
              <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
                <Defs>
                  <RadialGradient id="cameraGrad" cx="40%" cy="40%" r="75%">
                    <Stop offset="0%" stopColor="rgb(220, 225, 250)" />
                    <Stop offset="100%" stopColor="rgb(242, 245, 255)" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#cameraGrad)" />
              </Svg>
            )}
            <Ionicons name="camera-outline" size={26} color={theme.isDark ? theme.accentLight : theme.textSecondary} />
            <Text style={[styles.imageSourceCardText, theme.isDark && { color: theme.textSecondary }]}>
              {isKorean ? '카메라' : 'Camera'}
            </Text>
          </BouncyButton>
        </View>
        <View style={styles.imageSourceCardGlow}>
          <BouncyButton
            style={[styles.imageSourceCard, {
              backgroundColor: theme.isDark ? theme.backgroundTertiary + '99' : 'rgb(243, 245, 252)',
              borderWidth: 1.5,
              borderColor: theme.isDark ? theme.border + '18' : 'rgba(255,255,255,0.5)',
              overflow: 'hidden',
            }]}
            onPress={onPickFromGallery}
            hapticFeedback
            pressedScale={0.95}
            isFloating
            floatingDistance={3}
            floatingDuration={2600}
          >
            {theme.isDark ? (
              <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFillObject} />
            ) : (
              <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
                <Defs>
                  <RadialGradient id="galleryGrad" cx="40%" cy="40%" r="75%">
                    <Stop offset="0%" stopColor="rgb(218, 225, 250)" />
                    <Stop offset="100%" stopColor="rgb(242, 246, 255)" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#galleryGrad)" />
              </Svg>
            )}
            <Ionicons name="images-outline" size={26} color={theme.isDark ? theme.accentLight : theme.textSecondary} />
            <Text style={[styles.imageSourceCardText, theme.isDark && { color: theme.textSecondary }]}>
              {isKorean ? '갤러리' : 'Gallery'}
            </Text>
          </BouncyButton>
        </View>
        </View>
      </View>
    </View>
  );
}

export default React.memo(ImageCard);
