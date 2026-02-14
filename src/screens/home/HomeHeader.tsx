import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { type AppLanguage } from '../../lib/colorUtils';

interface HomeHeaderProps {
  theme: ThemeColors;
  language: AppLanguage;
  onShowInfo: () => void;
  onHapticLight: () => void;
}

function HomeHeader({
  theme,
  language,
  onShowInfo,
  onHapticLight,
}: HomeHeaderProps) {
  const [logoLoadError, setLogoLoadError] = useState(false);
  const subtitle = language === 'ko' ? '간편한 컬러 추출기' : 'Simple Color Extractor';

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
          <Text style={[styles.title, { color: theme.textPrimary }]}>Pixel Paw</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: theme.backgroundSecondary, borderColor: theme.borderLight, borderWidth: 1 },
          ]}
          onPress={() => {
            onHapticLight();
            onShowInfo();
          }}
        >
          <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default React.memo(HomeHeader);
