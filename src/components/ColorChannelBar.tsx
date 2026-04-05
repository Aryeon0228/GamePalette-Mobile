/**
 * ColorChannelBar Component
 * Displays a visual bar representing a color channel value (R/G/B or H/S/L)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLOR_TOKENS, FONT_FAMILY } from '../constants/designTokens';

const C = COLOR_TOKENS;

interface ColorChannelBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  isHue?: boolean;
}

export function ColorChannelBar({
  label,
  value,
  max,
  color,
  isHue,
}: ColorChannelBarProps) {
  const percentage = (value / max) * 100;

  return (
    <View style={styles.channelRow}>
      <Text style={styles.channelLabel}>{label}</Text>
      <View style={styles.channelBarContainer}>
        {isHue ? (
          <View style={styles.hueGradientBar}>
            <View
              style={[
                styles.channelBarFill,
                { width: `${percentage}%`, backgroundColor: color },
              ]}
            />
          </View>
        ) : (
          <View style={styles.channelBarBg}>
            <View
              style={[
                styles.channelBarFill,
                { width: `${percentage}%`, backgroundColor: color },
              ]}
            />
          </View>
        )}
      </View>
      <Text style={styles.channelValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  channelLabel: {
    width: 20,
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
  },
  channelBarContainer: {
    flex: 1,
    marginHorizontal: 10,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  channelBarBg: {
    flex: 1,
    backgroundColor: C.borderSoft,
    borderRadius: 4,
    overflow: 'hidden',
  },
  hueGradientBar: {
    flex: 1,
    backgroundColor: C.borderSoft,
    borderRadius: 4,
    overflow: 'hidden',
  },
  channelBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  channelValue: {
    width: 36,
    fontSize: 12,
    color: C.textSecondary,
    textAlign: 'right',
    fontFamily: FONT_FAMILY.mono,
  },
});
