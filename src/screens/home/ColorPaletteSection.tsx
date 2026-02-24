import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { styles } from './HomeScreen.styles';
import { ThemeColors } from '../../store/themeStore';
import { COLOR_TOKENS } from '../../constants/designTokens';
import { ColorBlindnessType } from '../../lib/colorUtils';

interface ColorPaletteSectionProps {
  theme: ThemeColors;
  processedColors: string[];
  styledColors: string[];
  selectedColorIndex: number | null;
  colorBlindMode: ColorBlindnessType;
  colorCount: number;
  onColorPress: (index: number) => void;
}

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
          const originalColor = styledColors[index];
          const isCvdActive = colorBlindMode !== 'none' && originalColor !== color;
          return (
            <TouchableOpacity
              key={color + '-' + index}
              style={[
                styles.colorCard,
                isSelected && styles.colorCardSelected,
              ]}
              onPress={() => onColorPress(index)}
            >
              <View style={[
                styles.colorSwatch,
                { backgroundColor: color, overflow: 'hidden' },
                isSelected && [styles.colorSwatchSelected, { borderColor: color, shadowColor: color }],
              ]}>
                {isCvdActive && (
                  <View style={[styles.cvdSplitOriginal, { backgroundColor: originalColor }]} />
                )}
              </View>
              {isSelected && (
                <View style={[styles.chipTriangle, { borderBottomColor: color }]} />
              )}
              <Text style={[styles.chipRank, { color: isSelected ? theme.textPrimary : theme.textMuted }]}>
                #{index + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  const hintColors = [COLOR_TOKENS.textSubtle, COLOR_TOKENS.textFaint, COLOR_TOKENS.textGhost, COLOR_TOKENS.textMuted, COLOR_TOKENS.textSubtle, COLOR_TOKENS.textFaint, COLOR_TOKENS.textGhost, COLOR_TOKENS.textMuted];

  return (
    <View style={[styles.colorCardsContainer, styles.colorCardsEmpty]}>
      {Array.from({ length: colorCount }).map((_, index) => {
        const hintColor = hintColors[index % hintColors.length];
        return (
          <View key={'empty-' + index} style={styles.colorCard}>
            <View style={[styles.colorSwatch, styles.colorSwatchEmpty, { borderColor: hintColor + '30', backgroundColor: hintColor + '08' }]} />
          </View>
        );
      })}
    </View>
  );
}

export default React.memo(ColorPaletteSection);
