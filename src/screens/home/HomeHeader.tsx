import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './HomeScreen.styles';
import { useThemeStore } from '../../store/themeStore';
import { type AppLanguage } from '../../lib/colorUtils';
import { BouncyButton } from '../../components/BouncyButton';

interface HomeHeaderProps {
  language: AppLanguage;
  onShowInfo: () => void;
}

function HomeHeader({
  language,
  onShowInfo,
}: HomeHeaderProps) {
  const [logoLoadError, setLogoLoadError] = useState(false);
  const subtitle = language === 'ko' ? '간편한 컬러 추출기' : 'Simple Color Extractor';
  const { colors, toggleTheme, isDark } = useThemeStore();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.headerLogoMark}>
          {logoLoadError ? (
            <Ionicons name="paw" size={18} color="#ffd1dc" style={styles.headerLogoFallbackIcon} />
          ) : (
            <Image
              source={require('../../../assets/pow-header.png')}
              style={styles.headerLogoImage}
              resizeMode="contain"
              onError={() => setLogoLoadError(true)}
            />
          )}
        </View>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Pixel Paw</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <BouncyButton
          style={[
            styles.headerButton,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight, borderWidth: 1 },
          ]}
          onPress={toggleTheme}
          pressedScale={0.9}
          hapticFeedback
        >
          <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.textSecondary} />
        </BouncyButton>
        <BouncyButton
          style={[
            styles.headerButton,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight, borderWidth: 1 },
          ]}
          onPress={onShowInfo}
          pressedScale={0.9}
          hapticFeedback
        >
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
        </BouncyButton>
      </View>
    </View>
  );
}

export default React.memo(HomeHeader);
