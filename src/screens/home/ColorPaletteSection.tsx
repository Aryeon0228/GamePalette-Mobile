import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { COLOR_TOKENS } from '../../constants/designTokens';
import { ColorBlindnessType } from '../../lib/colorUtils';
import { BouncyButton } from '../../components/BouncyButton';

const HINT_COLORS = [
  COLOR_TOKENS.textSubtle,
  COLOR_TOKENS.textFaint,
  COLOR_TOKENS.textGhost,
  COLOR_TOKENS.textMuted,
  COLOR_TOKENS.textSubtle,
  COLOR_TOKENS.textFaint,
  COLOR_TOKENS.textGhost,
  COLOR_TOKENS.textMuted,
];

/**
 * Classic inset neumorphism overlay.
 * Light source: top-left → shadow on inner top+left edges, highlight on inner bottom+right edges.
 * Top/Left: ~5px dark shadow fading inward
 * Bottom/Right: thin pure white highlight fading inward
 */
const InsetOverlay = React.memo(function InsetOverlay({ isDark }: { isDark?: boolean }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top edge: soft dark shadow fading down */}
      <LinearGradient
        colors={isDark
          ? ['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.0)']
          : ['rgba(0,0,0,0.22)', 'rgba(0,0,0,0.04)', 'rgba(0,0,0,0.0)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={insetStyles.edgeTop}
      />
      {/* Left edge: soft dark shadow fading right */}
      <LinearGradient
        colors={isDark
          ? ['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.10)', 'rgba(0,0,0,0.0)']
          : ['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.06)', 'rgba(0,0,0,0.0)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={insetStyles.edgeLeft}
      />
      {/* Bottom edge: soft white highlight fading up */}
      <LinearGradient
        colors={isDark
          ? ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.01)', 'rgba(255,255,255,0.04)']
          : ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.55)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={insetStyles.edgeBottom}
      />
      {/* Right edge: soft white highlight fading left */}
      <LinearGradient
        colors={isDark
          ? ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.01)', 'rgba(255,255,255,0.04)']
          : ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.55)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={insetStyles.edgeRight}
      />
    </View>
  );
});

const insetStyles = StyleSheet.create({
  edgeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '8%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  edgeLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '19%',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  edgeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '22%',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  edgeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '16%',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
});

interface ColorPaletteSectionProps {
  theme: ThemeColors;
  processedColors: string[];
  styledColors: string[];
  selectedColorIndex: number | null;
  colorBlindMode: ColorBlindnessType;
  colorCount: number;
  onColorPress: (index: number) => void;
}

interface ColorCardProps {
  index: number;
  color: string;
  originalColor: string;
  isSelected: boolean;
  isCvdActive: boolean;
  theme: ThemeColors;
  onColorPress: (index: number) => void;
}

const ColorCard = React.memo(function ColorCard({
  index,
  color,
  originalColor,
  isSelected,
  isCvdActive,
  theme,
  onColorPress,
}: ColorCardProps) {
  return (
    <BouncyButton
      style={[
        styles.colorCard,
        isSelected && styles.colorCardSelected,
      ]}
      onPress={() => onColorPress(index)}
      pressedScale={0.9}
      hapticFeedback
    >
      <View style={[styles.colorSwatchOuterLight,
        theme.isDark && { backgroundColor: theme.backgroundTertiary }
      ]}>
        <View style={[
          styles.colorSwatchOuter,
          { shadowColor: color },
          theme.isDark && { backgroundColor: theme.backgroundSecondary },
          isSelected && styles.colorSwatchOuterSelected,
        ]}>
          <View style={[
            styles.colorSwatchMid,
            { shadowColor: color },
            isSelected && styles.colorSwatchMidSelected,
          ]}>
            <View style={[
              styles.colorSwatch,
              { backgroundColor: color, shadowColor: color, overflow: 'hidden' },
              theme.isDark && { borderTopColor: 'rgba(0,0,0,0.4)' },
              isSelected && styles.colorSwatchSelected,
            ]}>
              {isCvdActive && (
                <View style={styles.colorSwatchInner}>
                  <View style={[styles.cvdSplitOriginal, { backgroundColor: originalColor }]} />
                </View>
              )}
              <InsetOverlay isDark={theme.isDark} />
            </View>
          </View>
        </View>
      </View>
      {isSelected && (
        <View style={[styles.chipTriangle, { borderBottomColor: color }]} />
      )}
      <Text style={[styles.chipRank, { color: isSelected ? theme.textPrimary : theme.textMuted }]}>
        #{index + 1}
      </Text>
    </BouncyButton>
  );
});

function ColorPaletteSection({
  theme,
  processedColors,
  styledColors,
  selectedColorIndex,
  colorBlindMode,
  colorCount,
  onColorPress,
}: ColorPaletteSectionProps) {
  if (processedColors.length > 0) {
    return (
      <View style={styles.colorCardsContainer}>
        {processedColors.map((color, index) => {
          const isSelected = selectedColorIndex === index;
          const originalColor = styledColors[index] ?? color;
          const isCvdActive = colorBlindMode !== 'none' && originalColor !== color;
          return (
            <ColorCard
              key={color + '-' + index}
              index={index}
              color={color}
              originalColor={originalColor}
              isSelected={isSelected}
              isCvdActive={isCvdActive}
              theme={theme}
              onColorPress={onColorPress}
            />
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.colorCardsContainer, styles.colorCardsEmpty]}>
      {Array.from({ length: colorCount }).map((_, index) => {
        const hintColor = HINT_COLORS[index % HINT_COLORS.length];
        return (
          <View key={'empty-' + index} style={styles.colorCard}>
            <View style={[styles.colorSwatch, styles.colorSwatchEmpty, { backgroundColor: theme.isDark ? theme.backgroundSecondary : (hintColor + '18'), overflow: 'hidden' }]}>
              <InsetOverlay isDark={theme.isDark} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default React.memo(ColorPaletteSection);
