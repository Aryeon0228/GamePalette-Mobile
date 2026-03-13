import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { styles } from './HomeScreen.styles';
import { FONT_FAMILY } from '../../constants/designTokens';
import { ExtractionMethod } from '../../lib/colorExtractor';
import { ColorBlindnessType } from '../../lib/colorUtils';
import { StyleFilter } from '../../constants/stylePresets';

// ============================================
// TYPES
// ============================================

export type SettingChipId = 'style' | 'method' | 'cvd' | 'bw';

// ============================================
// CONSTANTS
// ============================================

const REEL_HEIGHT = 24;
const REEL_OUT_DURATION = 90;
const REEL_IN_DURATION = 140;
// ============================================
// SLOT REEL — the rolling drum
// ============================================

interface SlotReelProps {
  currentValue: string;
  onPress: () => void;
  isActive?: boolean;
  isDark: boolean;
  textColor?: string;
  glowColors?: string[];
}

const SlotReel = React.memo(function SlotReel({
  currentValue,
  onPress,
  isActive,
  isDark,
  textColor,
  glowColors,
}: SlotReelProps) {
  const translateY = useSharedValue(0);
  const prevValueRef = useRef(currentValue);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displayValue, setDisplayValue] = useState(currentValue);

  const colors = isDark
    ? {
        reelBg: isActive ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)',
        reelBorder: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        text: 'rgba(210, 215, 230, 0.85)',
        shadowTop: 'rgba(0,0,0,0.15)',
        shadowBot: 'transparent',
      }
    : {
        reelBg: isActive ? 'rgb(225, 225, 230)' : 'rgb(210, 210, 214)',
        reelBorder: isActive ? 'rgba(120, 120, 128, 0.35)' : 'rgba(160, 160, 168, 0.4)',
        text: '#3A3A3C',
        shadowTop: 'rgba(60, 60, 67, 0.1)',
        shadowBot: 'transparent',
      };

  useEffect(() => {
    if (prevValueRef.current === currentValue) return;
    prevValueRef.current = currentValue;
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    translateY.value = withTiming(-REEL_HEIGHT, {
      duration: REEL_OUT_DURATION,
      easing: Easing.in(Easing.quad),
    });

    transitionTimeoutRef.current = setTimeout(() => {
      setDisplayValue(currentValue);
      translateY.value = withSequence(
        withTiming(REEL_HEIGHT, { duration: 0 }),
        withTiming(0, {
          duration: REEL_IN_DURATION,
          easing: Easing.out(Easing.back(1.3)),
        }),
      );
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      transitionTimeoutRef.current = null;
    }, REEL_OUT_DURATION);

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [currentValue, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.90, { duration: 60 });
  }, []);
  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.back(1.8)) });
  }, []);

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} style={{ flex: 1 }}>
      <Animated.View
        style={[
          reelStyles.reel,
          {
            backgroundColor: colors.reelBg,
            borderColor: colors.reelBorder,
          },
          scaleStyle,
        ]}
      >
        {/* Radial glow behind text — single or dual */}
        {glowColors && glowColors.length === 1 && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <RadialGradient id="glow0" cx="50%" cy="50%" rx="45%" ry="55%">
                  <Stop offset="0%" stopColor={glowColors[0]} stopOpacity="0.25" />
                  <Stop offset="70%" stopColor={glowColors[0]} stopOpacity="0.08" />
                  <Stop offset="100%" stopColor={glowColors[0]} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow0)" />
            </Svg>
          </View>
        )}
        {glowColors && glowColors.length >= 2 && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <RadialGradient id="glowL" cx="30%" cy="50%" rx="35%" ry="55%">
                  <Stop offset="0%" stopColor={glowColors[0]} stopOpacity="0.28" />
                  <Stop offset="65%" stopColor={glowColors[0]} stopOpacity="0.08" />
                  <Stop offset="100%" stopColor={glowColors[0]} stopOpacity="0" />
                </RadialGradient>
                <RadialGradient id="glowR" cx="70%" cy="50%" rx="35%" ry="55%">
                  <Stop offset="0%" stopColor={glowColors[1]} stopOpacity="0.28" />
                  <Stop offset="65%" stopColor={glowColors[1]} stopOpacity="0.08" />
                  <Stop offset="100%" stopColor={glowColors[1]} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowL)" />
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowR)" />
            </Svg>
          </View>
        )}
        {/* Slot window with overflow hidden */}
        <View style={reelStyles.window}>
          <Animated.View style={animatedStyle}>
            <Text style={[reelStyles.valueText, { color: textColor ?? colors.text }]} numberOfLines={1}>
              {displayValue}
            </Text>
          </Animated.View>
        </View>
        {/* Inner shadow overlays — mechanical slot depth */}
        <LinearGradient
          colors={[colors.shadowTop, 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={reelStyles.shadowTop}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', colors.shadowBot]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={reelStyles.shadowBottom}
          pointerEvents="none"
        />
      </Animated.View>
    </Pressable>
  );
});

const reelStyles = StyleSheet.create({
  reel: {
    height: REEL_HEIGHT + 8,
    borderRadius: 7,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  window: {
    height: REEL_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  valueText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: '600',
    textAlign: 'center',
  },
  shadowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  shadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
  },
});

// ============================================
// MAIN COMPONENT
// ============================================

interface SettingsSummaryBarProps {
  onChipPress: (id: SettingChipId) => void;
  // Style
  styleFilter: StyleFilter;
  stylePresetChipLabel: string;
  isKorean: boolean;
  // Method
  extractionMethod: ExtractionMethod;
  // CVD
  colorBlindMode: ColorBlindnessType;
  cvdChipLabel: string;
  // B&W
  showGrayscale: boolean;
  onToggleGrayscale: () => void;
  isDark: boolean;
}

const METHOD_LABELS_KO: Record<ExtractionMethod, string> = {
  histogram: '평균',
  kmeans: '핵심',
};
const METHOD_LABELS_EN: Record<ExtractionMethod, string> = {
  histogram: 'Avg',
  kmeans: 'Key',
};
const CVD_LABELS_KO: Record<ColorBlindnessType, string> = {
  none: '기본',
  protanopia: '적색약',
  deuteranopia: '녹색약',
  tritanopia: '청색약',
};
const CVD_LABELS_EN: Record<ColorBlindnessType, string> = {
  none: 'Default',
  protanopia: 'Protan',
  deuteranopia: 'Deutan',
  tritanopia: 'Tritan',
};

// CVD confused-pair colors for text + glow
const CVD_TEXT_COLORS_LIGHT: Record<ColorBlindnessType, string | undefined> = {
  none: 'rgba(60, 60, 67, 0.3)',
  protanopia: '#D64040',
  deuteranopia: '#22944E',
  tritanopia: '#3478F6',
};
const CVD_TEXT_COLORS_DARK: Record<ColorBlindnessType, string | undefined> = {
  none: 'rgba(210, 215, 230, 0.35)',
  protanopia: '#FF6B6B',
  deuteranopia: '#4ADE80',
  tritanopia: '#60A5FA',
};
const CVD_GLOW_COLORS: Record<ColorBlindnessType, string[] | undefined> = {
  none: undefined,
  protanopia: ['#ef4444', '#22c55e'],
  deuteranopia: ['#22c55e', '#ef4444'],
  tritanopia: ['#3b82f6', '#eab308'],
};

function SettingsSummaryBar({
  onChipPress,
  styleFilter,
  stylePresetChipLabel,
  isKorean,
  extractionMethod,
  colorBlindMode,
  cvdChipLabel,
  showGrayscale,
  onToggleGrayscale,
  isDark,
}: SettingsSummaryBarProps) {
  const methodLabel = isKorean
    ? METHOD_LABELS_KO[extractionMethod]
    : METHOD_LABELS_EN[extractionMethod];
  const cvdLabel = colorBlindMode === 'none'
    ? (isKorean ? '기본' : 'Default')
    : cvdChipLabel;
  const handleStylePress = useCallback(() => onChipPress('style'), [onChipPress]);
  const handleMethodPress = useCallback(() => onChipPress('method'), [onChipPress]);
  const handleCvdPress = useCallback(() => onChipPress('cvd'), [onChipPress]);

  const labelColor = isDark ? 'rgba(160, 170, 200, 0.5)' : 'rgba(100, 120, 160, 0.5)';

  return (
    <View style={[styles.summaryBar, { backgroundColor: 'transparent', overflow: 'visible' }]}>
      <View style={barStyles.container}>
        {/* Category labels row */}
        <View style={barStyles.labelRow}>
          <Text style={[barStyles.label, { color: labelColor }]}>{isKorean ? '색감' : 'STYLE'}</Text>
          <Text style={[barStyles.label, { color: labelColor }]}>{isKorean ? '방식' : 'MODE'}</Text>
          <Text style={[barStyles.label, { color: labelColor }]}>{isKorean ? '색각' : 'CVD'}</Text>
          <Text style={[barStyles.label, { color: labelColor }]}>{isKorean ? '흑백' : 'B&W'}</Text>
        </View>
        {/* Slot reels row */}
        <View style={barStyles.reelRow}>
          <SlotReel
            currentValue={stylePresetChipLabel}
            isActive={styleFilter !== 'original'}
            onPress={handleStylePress}
            isDark={isDark}
            textColor={styleFilter === 'original' ? (isDark ? 'rgba(210, 215, 230, 0.35)' : 'rgba(60, 60, 67, 0.3)') : undefined}
          />
          <SlotReel
            currentValue={methodLabel}
            isActive={true}
            onPress={handleMethodPress}
            isDark={isDark}
            textColor={isDark
              ? (extractionMethod === 'kmeans' ? '#FF80B0' : '#60A5FA')
              : (extractionMethod === 'kmeans' ? '#D64080' : '#3478F6')}
            glowColors={extractionMethod === 'kmeans' ? ['#D64080'] : ['#3478F6']}
          />
          <SlotReel
            currentValue={cvdLabel}
            isActive={colorBlindMode !== 'none'}
            onPress={handleCvdPress}
            isDark={isDark}
            textColor={isDark ? CVD_TEXT_COLORS_DARK[colorBlindMode] : CVD_TEXT_COLORS_LIGHT[colorBlindMode]}
            glowColors={CVD_GLOW_COLORS[colorBlindMode]}
          />
          <SlotReel
            currentValue={showGrayscale ? 'ON' : 'OFF'}
            isActive={showGrayscale}
            onPress={onToggleGrayscale}
            isDark={isDark}
            textColor={!showGrayscale ? (isDark ? 'rgba(210, 215, 230, 0.35)' : 'rgba(60, 60, 67, 0.3)') : undefined}
          />
        </View>
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 3,
  },
  labelRow: {
    flexDirection: 'row',
    gap: 6,
  },
  label: {
    flex: 1,
    fontSize: 10,
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: '600',
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  reelRow: {
    flexDirection: 'row',
    gap: 6,
  },
});

export default React.memo(SettingsSummaryBar);
