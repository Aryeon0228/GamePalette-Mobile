import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

import { styles } from './HomeScreen.styles';
import { useThemeStore } from '../../store/themeStore';
import { type AppLanguage } from '../../lib/colorUtils';
import { BouncyButton } from '../../components/BouncyButton';
import { BLUR_INTENSITY, OVERLAY_TOKENS, getOverlayTokens, FONT_FAMILY, COLOR_TOKENS } from '../../constants/designTokens';

const SUN_COLOR = '#E8A317';
const MOON_COLOR = '#EBD054';

interface HomeHeaderProps {
  language: AppLanguage;
  onShowInfo: () => void;
}

function HomeHeader({
  language,
  onShowInfo,
}: HomeHeaderProps) {
  const { colors, toggleTheme, isDark } = useThemeStore();
  const overlayTokens = getOverlayTokens(isDark);

  return (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
        Pixel Paw
      </Text>
      <View style={styles.headerRight}>
        <View style={[styles.headerButtonNeumorphLight,
          isDark && { shadowColor: colors.shadowGlow, shadowOpacity: 0.3 }
        ]}>
          <View style={[styles.headerButtonNeumorphDark,
            isDark && { shadowColor: colors.shadowDrop, shadowOpacity: 0.5 }
          ]}>
            <BouncyButton
              style={styles.headerButtonPill}
              onPress={toggleTheme}
              pressedScale={0.9}
              hapticFeedback
            >
              <BlurView
                intensity={BLUR_INTENSITY.glass}
                tint={isDark ? "dark" : "light"}
                style={[styles.headerButtonPillBlur,
                  isDark && {
                    backgroundColor: overlayTokens.darkBlurSurface,
                    borderColor: overlayTokens.blurBorder,
                  }
                ]}
              >
                <LinearGradient
                  colors={[overlayTokens.glassGradientTop, overlayTokens.glassGradientMid, overlayTokens.glassGradientBottom]}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFillObject}
                  pointerEvents="none"
                />
                <View style={localStyles.glowContainer} pointerEvents="none">
                  <Svg style={StyleSheet.absoluteFill} viewBox="0 0 36 36" pointerEvents="none">
                    <Defs>
                      <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor={isDark ? SUN_COLOR : MOON_COLOR} stopOpacity={isDark ? 0.5 : 0.45} />
                        <Stop offset="100%" stopColor={isDark ? SUN_COLOR : MOON_COLOR} stopOpacity={0} />
                      </RadialGradient>
                    </Defs>
                    <Circle cx="18" cy="18" r="18" fill="url(#glow)" />
                  </Svg>
                  <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={isDark ? SUN_COLOR : MOON_COLOR} />
                </View>
              </BlurView>
            </BouncyButton>
          </View>
        </View>
        <View style={[styles.headerButtonNeumorphLight,
          isDark && { shadowColor: colors.shadowGlow, shadowOpacity: 0.3 }
        ]}>
          <View style={[styles.headerButtonNeumorphDark,
            isDark && { shadowColor: colors.shadowDrop, shadowOpacity: 0.5 }
          ]}>
            <BouncyButton
              style={styles.headerButtonPill}
              onPress={onShowInfo}
              pressedScale={0.9}
              hapticFeedback
            >
              <BlurView
                intensity={BLUR_INTENSITY.glass}
                tint={isDark ? "dark" : "light"}
                style={[styles.headerButtonPillBlur,
                  isDark && {
                    backgroundColor: overlayTokens.darkBlurSurface,
                    borderColor: overlayTokens.blurBorder,
                  }
                ]}
              >
                <LinearGradient
                  colors={[overlayTokens.glassGradientTop, overlayTokens.glassGradientMid, overlayTokens.glassGradientBottom]}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFillObject}
                  pointerEvents="none"
                />
                <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
              </BlurView>
            </BouncyButton>
          </View>
        </View>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  glowContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(HomeHeader);
