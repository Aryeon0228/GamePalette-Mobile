import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import {
  getColorInfo,
  formatHex,
  formatRgb,
  formatHsl,
  getContrastColor,
  generateValueVariations,
} from '../lib/styleFilters';

interface ColorDetailPanelProps {
  color: string;
  onClose?: () => void;
}

type ColorFormat = 'HEX' | 'RGB' | 'HSL';

export default function ColorDetailPanel({ color, onClose }: ColorDetailPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<ColorFormat>('HEX');
  const [copied, setCopied] = useState(false);

  const colorInfo = getColorInfo(color);
  const textColor = getContrastColor(color);
  const variations = generateValueVariations(color, 5);

  const getFormattedColor = (): string => {
    switch (selectedFormat) {
      case 'HEX':
        return formatHex(colorInfo.hex);
      case 'RGB':
        return formatRgb(colorInfo.rgb.r, colorInfo.rgb.g, colorInfo.rgb.b);
      case 'HSL':
        return formatHsl(colorInfo.hsl.h, colorInfo.hsl.s, colorInfo.hsl.l);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(getFormattedColor());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={styles.container}>
      {/* Main color preview */}
      <View style={[styles.colorPreview, { backgroundColor: color }]}>
        <Text style={[styles.colorValue, { color: textColor }]}>
          {getFormattedColor()}
        </Text>
      </View>

      {/* Format selector and copy button */}
      <View style={styles.controls}>
        <View style={styles.formatSelector}>
          {(['HEX', 'RGB', 'HSL'] as ColorFormat[]).map((format) => (
            <TouchableOpacity
              key={format}
              style={[
                styles.formatButton,
                selectedFormat === format && styles.formatButtonActive,
              ]}
              onPress={() => setSelectedFormat(format)}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  selectedFormat === format && styles.formatButtonTextActive,
                ]}
              >
                {format}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.copyButton, copied && styles.copyButtonSuccess]}
          onPress={handleCopy}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={18}
            color="#fff"
          />
          <Text style={styles.copyButtonText}>
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Value variations */}
      <View style={styles.variationsContainer}>
        <Text style={styles.variationsLabel}>Value Variations</Text>
        <View style={styles.variationsStrip}>
          {variations.map((varColor, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.variationSwatch, { backgroundColor: varColor }]}
              onPress={async () => {
                await Clipboard.setStringAsync(varColor.toUpperCase());
              }}
            />
          ))}
        </View>
      </View>

      {/* Color info */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Hue</Text>
          <Text style={styles.infoValue}>{colorInfo.hsl.h}°</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Saturation</Text>
          <Text style={styles.infoValue}>{colorInfo.hsl.s}%</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Lightness</Text>
          <Text style={styles.infoValue}>{colorInfo.hsl.l}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  colorPreview: {
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorValue: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formatSelector: {
    flexDirection: 'row',
    backgroundColor: '#E8E8ED',
    borderRadius: 8,
    padding: 4,
  },
  formatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  formatButtonActive: {
    backgroundColor: '#C7C7CC',
  },
  formatButtonText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  formatButtonTextActive: {
    color: '#1C1C1E',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  copyButtonSuccess: {
    backgroundColor: '#34C759',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  variationsContainer: {
    marginBottom: 16,
  },
  variationsLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 8,
  },
  variationsStrip: {
    flexDirection: 'row',
    gap: 6,
  },
  variationSwatch: {
    flex: 1,
    height: 32,
    borderRadius: 6,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: '#8E8E93',
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: {
    color: '#1C1C1E',
    fontSize: 14,
    fontWeight: '600',
  },
});
