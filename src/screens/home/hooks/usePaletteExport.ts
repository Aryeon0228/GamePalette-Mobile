import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import type ViewShot from 'react-native-view-shot';

import { hexToRgb, rgbToHsl } from '../../../lib/colorUtils';

export type ExportFormat = 'png' | 'json' | 'css';
type CopyFormat = 'text' | 'json' | 'css';

interface UsePaletteExportParams {
  processedColors: string[];
  paletteName: string;
  untitledPaletteLabel: string;
  shareDialogTitle: string;
  errorTitle: string;
  exportPngErrorMessage: string;
  exportErrorMessage: string;
  copiedPrefix: string;
  isKorean: boolean;
  onHapticSuccess: () => void;
  onShowToast: (message: string) => void;
  onCloseModal: () => void;
}

export function usePaletteExport({
  processedColors,
  paletteName,
  untitledPaletteLabel,
  shareDialogTitle,
  errorTitle,
  exportPngErrorMessage,
  exportErrorMessage,
  copiedPrefix,
  isKorean,
  onHapticSuccess,
  onShowToast,
  onCloseModal,
}: UsePaletteExportParams) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState(false);
  const paletteCardRef = useRef<ViewShot>(null);

  const exportAsPng = async () => {
    if (!paletteCardRef.current) return;

    setIsExporting(true);
    try {
      const uri = await paletteCardRef.current.capture?.();
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: shareDialogTitle,
        });
      }
    } catch (error) {
      console.error('PNG export error:', error);
      Alert.alert(errorTitle, exportPngErrorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsText = async (format: Exclude<ExportFormat, 'png'>) => {
    let content = '';
    let filename = 'palette';
    let fileUri: string | null = null;

    switch (format) {
      case 'json':
        content = JSON.stringify(
          {
            name: paletteName || untitledPaletteLabel,
            colors: processedColors.map((hex, i) => ({
              index: i,
              hex,
              rgb: hexToRgb(hex),
              hsl: (() => {
                const rgb = hexToRgb(hex);
                return rgbToHsl(rgb.r, rgb.g, rgb.b);
              })(),
            })),
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
        filename = 'palette.json';
        break;
      case 'css':
        content = `:root {\n${processedColors
          .map((hex, i) => `  --color-${i + 1}: ${hex};`)
          .join('\n')}\n}`;
        filename = 'palette.css';
        break;
    }

    setIsExporting(true);
    try {
      fileUri = FileSystem.cacheDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, content);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      Alert.alert(errorTitle, exportErrorMessage);
    } finally {
      if (fileUri) {
        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => undefined);
      }
      setIsExporting(false);
    }
  };

  const handleExportConfirm = async () => {
    if (exportFormat === 'png') {
      await exportAsPng();
    } else {
      await exportAsText(exportFormat);
    }
    onCloseModal();
  };

  const copyToClipboard = async (format: CopyFormat) => {
    let content = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(processedColors);
        break;
      case 'css':
        content = processedColors.map((hex, i) => `--color-${i + 1}: ${hex};`).join('\n');
        break;
      default:
        content = processedColors.join('\n');
    }

    await Clipboard.setStringAsync(content);
    onHapticSuccess();
    onShowToast(isKorean ? `${copiedPrefix}: ${format.toUpperCase()}` : `${copiedPrefix} ${format.toUpperCase()}`);
    onCloseModal();
  };

  return {
    exportFormat,
    setExportFormat,
    isExporting,
    paletteCardRef,
    handleExportConfirm,
    copyToClipboard,
  };
}
