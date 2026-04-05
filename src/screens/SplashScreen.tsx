import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { COLOR_TOKENS, OVERLAY_TOKENS, FONT_FAMILY } from '../constants/designTokens';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FINISH_DELAY_MS = 3150;

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const coverScaleAnim = useRef(new Animated.Value(1)).current;
  const auroraAnim = useRef(new Animated.Value(0)).current;
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const titleOpacityAnim = useRef(new Animated.Value(0)).current;
  const titleTranslateAnim = useRef(new Animated.Value(18)).current;
  const titleScaleAnim = useRef(new Animated.Value(0.92)).current;
  const subtitleOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const auroraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auroraAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auroraAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const sweepLoop = Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 2600,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      })
    );

    auroraLoop.start();
    sweepLoop.start();

    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(titleOpacityAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateAnim, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(titleScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(620),
      Animated.timing(subtitleOpacityAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    const finishTimer = setTimeout(() => {
      onFinish();
    }, FINISH_DELAY_MS);

    return () => {
      clearTimeout(finishTimer);
      auroraLoop.stop();
      sweepLoop.stop();
    };
  }, [
    auroraAnim,
    coverScaleAnim,
    onFinish,
    subtitleOpacityAnim,
    sweepAnim,
    titleOpacityAnim,
    titleScaleAnim,
    titleTranslateAnim,
  ]);

  const auroraOpacity = auroraAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.03, 0.08],
  });

  const auroraScale = auroraAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.03],
  });

  const sweepTranslateX = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 1.2, SCREEN_WIDTH * 1.2],
  });

  const sweepOpacity = sweepAnim.interpolate({
    inputRange: [0, 0.14, 0.55, 1],
    outputRange: [0, 0.05, 0.03, 0],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.coverLayer,
          {
            transform: [{ scale: coverScaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/splash-cover-1290x2796.png')}
          style={styles.coverImage}
          contentFit="cover"
          transition={0}
        />
      </Animated.View>

      <View style={styles.coverTint} />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.auroraGlow,
          {
            opacity: auroraOpacity,
            transform: [{ scale: auroraScale }],
          },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.sweepLight,
          {
            opacity: sweepOpacity,
            transform: [{ translateX: sweepTranslateX }, { rotate: '-14deg' }],
          },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.vignetteTop,
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.vignetteBottom,
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.brandBlock,
          {
            opacity: titleOpacityAnim,
            transform: [{ translateY: titleTranslateAnim }, { scale: titleScaleAnim }],
          },
        ]}
      >
        <View style={styles.brandTitleFrame}>
          <Text style={styles.brandSparkle}>✦</Text>
          <Text style={styles.brandTitle}>Pixel Paw</Text>
          <Text style={styles.brandSparkle}>✦</Text>
        </View>
        <Animated.Text style={[styles.brandSubtitle, { opacity: subtitleOpacityAnim }]}>
          Simple Color Extractor
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_TOKENS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coverLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OVERLAY_TOKENS.splashTint,
  },
  auroraGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72,
    borderRadius: (SCREEN_WIDTH * 0.72) / 2,
    backgroundColor: OVERLAY_TOKENS.splashAurora,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  sweepLight: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.28,
    height: '130%',
    borderRadius: SCREEN_WIDTH * 0.14,
    backgroundColor: OVERLAY_TOKENS.splashAurora,
  },
  vignetteTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  vignetteBottom: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OVERLAY_TOKENS.splashVignetteBottom,
  },
  brandBlock: {
    position: 'absolute',
    top: '22%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandTitleFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: OVERLAY_TOKENS.splashBrandBg,
    borderWidth: 1,
    borderColor: OVERLAY_TOKENS.splashBrandBorder,
    shadowColor: COLOR_TOKENS.textPrimary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
  brandSparkle: {
    color: COLOR_TOKENS.brandSparkle,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
    lineHeight: 16,
    textShadowColor: OVERLAY_TOKENS.splashSparkleGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  brandTitle: {
    color: COLOR_TOKENS.brandTitleText,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 54,
    letterSpacing: -0.7,
    textShadowColor: OVERLAY_TOKENS.splashTitleShadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  brandSubtitle: {
    marginTop: 10,
    color: OVERLAY_TOKENS.splashSubtitle,
    fontFamily: FONT_FAMILY.medium,
    fontSize: 16,
    letterSpacing: 0.6,
  },
});
