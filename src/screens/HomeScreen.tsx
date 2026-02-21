import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActionSheetIOS,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { shallow } from 'zustand/shallow';

import { usePaletteStore } from '../store/paletteStore';
import { useThemeStore } from '../store/themeStore';
import {
  hexToRgb,
  rgbToHsl,
  rgbToHex,
  hslToRgb,
  toGrayscale,
  getLuminance,
  adjustColor,
  generateColorVariations,
  generateColorHarmonies,
  getColorBlindnessTypes,
  HarmonyType,
  simulateColorBlindness,
  ColorBlindnessType,
  type AppLanguage,
  type ColorInfo,
} from '../lib/colorUtils';
import { StyleFilter, STYLE_PRESETS } from '../constants/stylePresets';
import {
  FORMAT_ACCENT_COLORS,
  VARIATION_TOGGLE_COLORS,
  UNIFIED_EMPHASIS,
} from '../constants/uiEmphasis';
import { styles } from './home/HomeScreen.styles';
import { getHomeLocalization } from './home/homeLocalization';
import { useColorExtraction } from './home/hooks/useColorExtraction';
import { useImageImportAndCrop } from './home/hooks/useImageImportAndCrop';
import { usePaletteExport } from './home/hooks/usePaletteExport';
import { useAdvancedPanel } from './home/hooks/useAdvancedPanel';
import { useCameraCapture } from './home/hooks/useCameraCapture';
import HomeHeader from './home/HomeHeader';
import ImageCard from './home/ImageCard';
import ActionBar from './home/ActionBar';
import InlineSettingsPanel from './home/InlineSettingsPanel';
import ColorDetailModal from './home/modals/ColorDetailModal';
import SavePaletteModal from './home/modals/SavePaletteModal';
import ExportModal from './home/modals/ExportModal';
import InfoModal from './home/modals/InfoModal';
import ImageCropModal from './home/modals/ImageCropModal';

// ============================================
// TYPES
// ============================================

interface HomeScreenProps {
  onNavigateToLibrary: () => void;
  appLanguage: AppLanguage;
  onAppLanguageChange: (language: AppLanguage) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function HomeScreen({
  onNavigateToLibrary,
  appLanguage,
  onAppLanguageChange,
}: HomeScreenProps) {
  // UI State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showColorDetail, setShowColorDetail] = useState(false);
  const [paletteName, setPaletteName] = useState('');

  // Color Format State
  const [colorFormat, setColorFormat] = useState<'HEX' | 'RGB' | 'HSL'>('HEX');

  // Filter & Display State
  const [styleFilter, setStyleFilter] = useState<StyleFilter>('original');
  const [showGrayscale, setShowGrayscale] = useState(false);
  const [variationHueShift, setVariationHueShift] = useState(true);
  const [selectedHarmony, setSelectedHarmony] = useState<HarmonyType>('complementary');
  const [colorBlindMode, setColorBlindMode] = useState<ColorBlindnessType>('none');
  // SNS Card State
  const [snsCardType, setSnsCardType] = useState<'instagram' | 'twitter'>('instagram');
  const [cardShowHex, setCardShowHex] = useState(true);
  const [cardShowStats, setCardShowStats] = useState(true);
  const [cardShowHistogram, setCardShowHistogram] = useState(true);

  // Info Modal State
  const [showInfo, setShowInfo] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasSeenColorTapHint, setHasSeenColorTapHint] = useState(false);

  // Theme & Store
  const theme = useThemeStore((state) => state.colors);
  const {
    currentColors,
    currentImageUri,
    selectedColorIndex,
    colorCount,
    extractionMethod,
    setCurrentColors,
    setCurrentImageUri,
    setSelectedColorIndex,
    setColorCount,
    setExtractionMethod,
    savePalette,
  } = usePaletteStore(
    (state) => ({
      currentColors: state.currentColors,
      currentImageUri: state.currentImageUri,
      selectedColorIndex: state.selectedColorIndex,
      colorCount: state.colorCount,
      extractionMethod: state.extractionMethod,
      setCurrentColors: state.setCurrentColors,
      setCurrentImageUri: state.setCurrentImageUri,
      setSelectedColorIndex: state.setSelectedColorIndex,
      setColorCount: state.setColorCount,
      setExtractionMethod: state.setExtractionMethod,
      savePalette: state.savePalette,
    }),
    shallow
  );

  // ============================================
  // COMPUTED VALUES
  // ============================================

  // Colors WITHOUT CVD (for comparison display)
  const styledColors = useMemo(() =>
    currentColors.map((hex) => {
      if (showGrayscale) {
        return toGrayscale(hex);
      }
      const preset = STYLE_PRESETS[styleFilter];
      return adjustColor(hex, preset.saturation, preset.brightness);
    }),
    [currentColors, showGrayscale, styleFilter]
  );

  // Colors WITH CVD applied (final display)
  const processedColors = useMemo(() =>
    styledColors.map((color) => {
      if (colorBlindMode !== 'none') {
        return simulateColorBlindness(color, colorBlindMode);
      }
      return color;
    }),
    [styledColors, colorBlindMode]
  );

  const colorInfo = useMemo((): ColorInfo | null => {
    if (selectedColorIndex === null || !processedColors[selectedColorIndex]) {
      return null;
    }
    const hex = processedColors[selectedColorIndex];
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl };
  }, [processedColors, selectedColorIndex]);

  const colorHarmonies = useMemo(
    () => (colorInfo ? generateColorHarmonies(colorInfo.hex, appLanguage) : []),
    [appLanguage, colorInfo]
  );

  const currentHarmony = useMemo(
    () =>
      colorHarmonies.find((harmony) => harmony.type === selectedHarmony) ??
      colorHarmonies[0] ??
      null,
    [colorHarmonies, selectedHarmony]
  );

  const isKorean = appLanguage === 'ko';
  const cvdOptions = useMemo(() => getColorBlindnessTypes(appLanguage), [appLanguage]);
  const cvdChipLabel = useMemo(() => {
    if (colorBlindMode === 'none') return '';
    return cvdOptions.find((option) => option.type === colorBlindMode)?.label ?? '';
  }, [colorBlindMode, cvdOptions]);
  const kmeansAccentColor = '#48484A';
  const styleChipColor = STYLE_PRESETS[styleFilter].color;
  const methodChipColor = extractionMethod === 'histogram' ? '#8E8E93' : kmeansAccentColor;
  const countChipColor = '#636366';
  const {
    stylePresetChipLabels,
    stylePresetButtonLabels,
    stylePresetButtonLines,
    extractionMethodLabels,
    methodDescriptions,
    actionSheetLabels,
    imageSourceDialogTitle,
    imageSourceDialogMessage,
    permissionTitle,
    cameraPermissionMessage,
    galleryPermissionMessage,
    errorTitle,
    cameraErrorMessage,
    galleryErrorMessage,
    cropErrorMessage,
    extractErrorMessage,
    noColorsTitle,
    noColorsMessage,
    savedTitle,
    savedMessage,
    shareDialogTitle,
    exportErrorMessage,
    exportPngErrorMessage,
    untitledPaletteLabel,
    copiedPrefix,
    settingLabel,
    stylePresetLabel,
    extractionMethodLabel,
    colorCountLabel,
    colorVisionLabel,
    copyButtonLabel,
    variationsLabel,
    lightnessLabel,
    hueShiftLabel,
    harmonyLabel,
    histogramTitle,
    histogramContrastLabel,
    histogramDarkLabel,
    histogramMidLabel,
    histogramBrightLabel,
    histogramAverageLabel,
    swatchHintSubtitle,
    swatchHintTitle,
    emptyGuideTitle,
    emptyGuideAddImage,
    emptyGuideExpandSettings,
    emptyGuideTapSwatch,
  } = getHomeLocalization(appLanguage);

  const {
    isExtracting,
    histogram,
    extractColors,
    handleMethodChange,
    handleReExtract,
    reExtractWithCount,
  } = useColorExtraction({
    colorCount,
    extractionMethod,
    currentImageUri,
    setCurrentColors,
    setCurrentImageUri,
    setExtractionMethod,
    errorTitle,
    extractErrorMessage,
  });

  const getFormattedColor = useCallback((info: ColorInfo, format: 'HEX' | 'RGB' | 'HSL'): string => {
    switch (format) {
      case 'HEX': return info.hex.toUpperCase();
      case 'RGB': return `RGB(${info.rgb.r}, ${info.rgb.g}, ${info.rgb.b})`;
      case 'HSL': return `HSL(${info.hsl.h}, ${info.hsl.s}%, ${info.hsl.l}%)`;
    }
  }, []);

  // ============================================
  // HAPTIC FEEDBACK
  // ============================================

  const hapticLight = useCallback(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), []);
  const hapticMedium = useCallback(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), []);
  const hapticSuccess = useCallback(
    () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    []
  );
  const handleCameraPermissionDenied = useCallback(() => {
    Alert.alert(permissionTitle, cameraPermissionMessage);
  }, [cameraPermissionMessage, permissionTitle]);
  const handleCameraCaptureError = useCallback(() => {
    Alert.alert(errorTitle, cameraErrorMessage);
  }, [cameraErrorMessage, errorTitle]);

  const {
    showAdvanced,
    isAdvancedMounted,
    advancedPanelAnim,
    closeAdvancedPanel,
    toggleAdvancedPanel,
  } = useAdvancedPanel();

  const { showCamera, cameraRef, openCamera, closeCamera, takePicture } = useCameraCapture({
    onImageCaptured: extractColors,
    onPermissionDenied: handleCameraPermissionDenied,
    onCaptureError: handleCameraCaptureError,
    onBeforeCapture: hapticMedium,
    onCaptureSuccess: hapticSuccess,
  });

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  // ============================================
  // IMAGE HANDLING
  // ============================================

  const {
    showCropModal,
    cropSourceAsset,
    isApplyingCrop,
    pickFromGallery,
    handleCropCancel,
    handleCropConfirm,
  } = useImageImportAndCrop({
    onImageReady: extractColors,
    onCropSuccess: hapticSuccess,
    permissionTitle,
    galleryPermissionMessage,
    errorTitle,
    galleryErrorMessage,
    cropErrorMessage,
  });

  const showImageSourceOptions = useCallback(() => {
    hapticLight();
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [actionSheetLabels.cancel, actionSheetLabels.takePhoto, actionSheetLabels.chooseFromLibrary],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            void openCamera();
          } else if (buttonIndex === 2) {
            void pickFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        imageSourceDialogTitle,
        imageSourceDialogMessage,
        [
          { text: actionSheetLabels.cancel, style: 'cancel' },
          { text: actionSheetLabels.takePhoto, onPress: () => void openCamera() },
          { text: actionSheetLabels.chooseFromLibrary, onPress: () => void pickFromGallery() },
        ]
      );
    }
  }, [
    actionSheetLabels.cancel,
    actionSheetLabels.chooseFromLibrary,
    actionSheetLabels.takePhoto,
    hapticLight,
    imageSourceDialogMessage,
    imageSourceDialogTitle,
    openCamera,
    pickFromGallery,
  ]);

  const handleColorCountStep = useCallback((direction: 'down' | 'up') => {
    hapticLight();
    const newCount = direction === 'down'
      ? (colorCount <= 3 ? 8 : colorCount - 1)
      : (colorCount >= 8 ? 3 : colorCount + 1);
    setColorCount(newCount);
    reExtractWithCount(newCount);
  }, [colorCount, hapticLight, reExtractWithCount, setColorCount]);

  // ============================================
  // COLOR INTERACTION
  // ============================================

  const handleColorPress = useCallback((index: number) => {
    hapticLight();
    setHasSeenColorTapHint(true);
    if (isAdvancedMounted) {
      closeAdvancedPanel();
    }
    // Toggle selection - tap same color to deselect
    if (selectedColorIndex === index) {
      setSelectedColorIndex(null);
    } else {
      setSelectedColorIndex(index);
    }
  }, [closeAdvancedPanel, hapticLight, isAdvancedMounted, selectedColorIndex, setSelectedColorIndex]);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 1800);
  }, []);

  const copyColor = useCallback(async (value: string, label?: string) => {
    await Clipboard.setStringAsync(value);
    hapticSuccess();
    showToast(isKorean ? `${copiedPrefix}: ${label || value}` : `${copiedPrefix} ${label || value}`);
  }, [copiedPrefix, hapticSuccess, isKorean, showToast]);

  const handleCloseExportModal = useCallback(() => setShowExportModal(false), []);

  const {
    exportFormat,
    setExportFormat,
    isExporting,
    paletteCardRef,
    handleExportConfirm,
    copyToClipboard,
  } = usePaletteExport({
    processedColors,
    paletteName,
    untitledPaletteLabel,
    shareDialogTitle,
    errorTitle,
    exportPngErrorMessage,
    exportErrorMessage,
    copiedPrefix,
    isKorean,
    onHapticSuccess: hapticSuccess,
    onShowToast: showToast,
    onCloseModal: handleCloseExportModal,
  });

  // ============================================
  // SAVE & EXPORT
  // ============================================

  const handleSave = useCallback(() => {
    if (processedColors.length === 0) {
      Alert.alert(noColorsTitle, noColorsMessage);
      return;
    }
    // Set empty string to use auto-generated name
    setPaletteName('');
    setShowSaveModal(true);
  }, [noColorsMessage, noColorsTitle, processedColors.length]);

  const confirmSave = useCallback(() => {
    const originalColors = currentColors;
    setCurrentColors(processedColors);
    // Pass empty string for auto-generated name, or user's custom name
    savePalette(paletteName.trim());
    setCurrentColors(originalColors);
    setShowSaveModal(false);
    setPaletteName('');
    Alert.alert(savedTitle, savedMessage);
  }, [
    currentColors,
    paletteName,
    processedColors,
    savePalette,
    savedMessage,
    savedTitle,
    setCurrentColors,
  ]);

  const handleExport = useCallback(() => {
    if (processedColors.length === 0) {
      Alert.alert(noColorsTitle, noColorsMessage);
      return;
    }
    setShowExportModal(true);
  }, [noColorsMessage, noColorsTitle, processedColors.length]);

  const handleShowInfo = useCallback(() => {
    setShowInfo(true);
  }, []);

  const handleToggleGrayscale = useCallback(() => {
    hapticLight();
    setShowGrayscale((prev) => !prev);
  }, [hapticLight]);

  const handleReExtractPress = useCallback(() => {
    hapticLight();
    void handleReExtract();
  }, [handleReExtract, hapticLight]);

  const handleOpenCameraPress = useCallback(() => {
    hapticLight();
    void openCamera();
  }, [hapticLight, openCamera]);

  const handlePickFromGalleryPress = useCallback(() => {
    hapticLight();
    void pickFromGallery();
  }, [hapticLight, pickFromGallery]);

  const handleToggleAdvancedPanel = useCallback(() => {
    hapticLight();
    toggleAdvancedPanel();
  }, [hapticLight, toggleAdvancedPanel]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HomeHeader
        theme={theme}
        language={appLanguage}
        onShowInfo={handleShowInfo}
        onHapticLight={hapticLight}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >
        {/* Image Card */}
        <ImageCard
          currentImageUri={currentImageUri}
          showGrayscale={showGrayscale}
          language={appLanguage}
          theme={theme}
          isExtracting={isExtracting}
          onImagePress={showImageSourceOptions}
          onToggleGrayscale={handleToggleGrayscale}
          onReExtractPress={handleReExtractPress}
          onOpenCamera={handleOpenCameraPress}
          onPickFromGallery={handlePickFromGalleryPress}
        />

        {/* ── Settings Summary Bar ── */}
        <View style={[styles.summaryBar, { backgroundColor: theme.backgroundCard }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.summaryChipsScroll}
          >
            <View style={[styles.summaryChip, { backgroundColor: styleChipColor + UNIFIED_EMPHASIS.chipBgAlpha, borderColor: styleChipColor + UNIFIED_EMPHASIS.chipBorderAlpha, borderWidth: 1 }]}>
              <Ionicons name={STYLE_PRESETS[styleFilter].icon} size={13} color={styleChipColor} />
              <Text style={[styles.summaryChipText, { color: styleChipColor }]}>{stylePresetChipLabels[styleFilter]}</Text>
            </View>
            <View style={[styles.summaryChip, { backgroundColor: methodChipColor + UNIFIED_EMPHASIS.chipBgAlpha, borderColor: methodChipColor + UNIFIED_EMPHASIS.chipBorderAlpha, borderWidth: 1 }]}>
              <Ionicons name="flask-outline" size={13} color={methodChipColor} />
              <Text style={[styles.summaryChipText, { color: methodChipColor }]}>
                {extractionMethodLabels[extractionMethod]}
              </Text>
            </View>
            <View style={[styles.summaryChip, { backgroundColor: countChipColor + UNIFIED_EMPHASIS.chipBgAlpha, borderColor: countChipColor + UNIFIED_EMPHASIS.chipBorderAlpha, borderWidth: 1 }]}>
              <Ionicons name="color-palette-outline" size={13} color={countChipColor} />
              <Text style={[styles.summaryChipText, { color: countChipColor }]}>{colorCount}</Text>
            </View>
            {colorBlindMode !== 'none' && (
              <View style={[styles.summaryChip, { backgroundColor: UNIFIED_EMPHASIS.cvdBg, borderColor: UNIFIED_EMPHASIS.cvdBorder, borderWidth: 1 }]}>
                <Ionicons name="eye-outline" size={13} color={UNIFIED_EMPHASIS.cvdText} />
                <Text style={[styles.summaryChipText, { color: UNIFIED_EMPHASIS.cvdText }]}>{cvdChipLabel}</Text>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.summaryEditButton,
              { backgroundColor: isAdvancedMounted ? theme.accent + '22' : theme.backgroundTertiary },
            ]}
            onPress={handleToggleAdvancedPanel}
          >
            <Ionicons
              name={isAdvancedMounted ? 'close-outline' : 'options-outline'}
              size={16}
              color={isAdvancedMounted ? theme.accent : theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Swatch affordance hint */}
        {processedColors.length > 0 && selectedColorIndex === null && !hasSeenColorTapHint && (
          <View style={[styles.swatchHintCard, { backgroundColor: theme.backgroundCard, borderColor: theme.borderLight }]}>
            <View style={[styles.swatchHintIcon, { backgroundColor: theme.accent + '22' }]}>
              <Ionicons name="hand-left-outline" size={15} color={theme.accent} />
            </View>
            <View style={styles.swatchHintTextWrap}>
              <Text style={[styles.swatchHintTitle, { color: theme.textPrimary }]}>
                {swatchHintTitle}
              </Text>
              <Text style={[styles.swatchHintSubtitle, { color: theme.textMuted }]}>
                {swatchHintSubtitle}
              </Text>
            </View>
          </View>
        )}

        {/* Color Cards - Palette Swatches */}
        {processedColors.length > 0 ? (
          <View style={styles.colorCardsContainer}>
            {processedColors.map((color, index) => {
              const isSelected = selectedColorIndex === index;
              const originalColor = styledColors[index];
              const isCvdActive = colorBlindMode !== 'none' && originalColor !== color;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorCard,
                    isSelected && styles.colorCardSelected,
                  ]}
                  onPress={() => handleColorPress(index)}
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
        ) : (
          <View style={[styles.colorCardsContainer, styles.colorCardsEmpty]}>
            {Array.from({ length: colorCount }).map((_, index) => {
              const hintColors = ['#AEAEB2', '#C7C7CC', '#D1D1D6', '#8E8E93', '#AEAEB2', '#C7C7CC', '#D1D1D6', '#8E8E93'];
              const hintColor = hintColors[index % hintColors.length];
              return (
                <View key={index} style={styles.colorCard}>
                  <View style={[styles.colorSwatch, styles.colorSwatchEmpty, { borderColor: hintColor + '30', backgroundColor: hintColor + '08' }]}>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Inline settings panel (keeps palette visible while editing) */}
        <InlineSettingsPanel
          isMounted={isAdvancedMounted}
          showAdvanced={showAdvanced}
          theme={theme}
          advancedPanelAnim={advancedPanelAnim}
          isKorean={isKorean}
          settingLabel={settingLabel}
          stylePresetLabel={stylePresetLabel}
          styleFilter={styleFilter}
          stylePresetButtonLabels={stylePresetButtonLabels}
          stylePresetButtonLines={stylePresetButtonLines}
          onStyleFilterChange={setStyleFilter}
          extractionMethodLabel={extractionMethodLabel}
          extractionMethod={extractionMethod}
          extractionMethodLabels={extractionMethodLabels}
          methodDescriptions={methodDescriptions}
          kmeansAccentColor={kmeansAccentColor}
          onMethodChange={handleMethodChange}
          colorCountLabel={colorCountLabel}
          colorCount={colorCount}
          onColorCountStep={handleColorCountStep}
          colorVisionLabel={colorVisionLabel}
          cvdOptions={cvdOptions}
          colorBlindMode={colorBlindMode}
          onColorBlindModeChange={setColorBlindMode}
          onHapticLight={hapticLight}
          onClose={closeAdvancedPanel}
        />

        {/* Empty workspace guide */}
        {!currentImageUri && processedColors.length === 0 && (
          <View style={[styles.emptyGuideCard, { backgroundColor: theme.backgroundCard, borderColor: theme.borderLight }]}>
            <Text style={[styles.emptyGuideTitle, { color: theme.textPrimary }]}>
              {emptyGuideTitle}
            </Text>
            <View style={styles.emptyGuideRows}>
              <View style={styles.emptyGuideRow}>
                <Ionicons name="image-outline" size={14} color={theme.accent} />
                <Text style={[styles.emptyGuideText, { color: theme.textMuted }]}>
                  {emptyGuideAddImage}
                </Text>
              </View>
              <View style={styles.emptyGuideRow}>
                <Ionicons name="options-outline" size={14} color={theme.accent} />
                <Text style={[styles.emptyGuideText, { color: theme.textMuted }]}>
                  {emptyGuideExpandSettings}
                </Text>
              </View>
              <View style={styles.emptyGuideRow}>
                <Ionicons name="hand-left-outline" size={14} color={theme.accent} />
                <Text style={[styles.emptyGuideText, { color: theme.textMuted }]}>
                  {emptyGuideTapSwatch}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Inline Color Detail */}
        {colorInfo && selectedColorIndex !== null && (
          <View style={[styles.inlineColorDetail, { backgroundColor: theme.backgroundCard, borderColor: colorInfo.hex + '60', borderWidth: 1.5 }]}>
            {/* Color Preview + Value + Copy + Channel Bars */}
            {(() => {
              const isLight = getLuminance(colorInfo.hex) > 140;
              const fgColor = isLight ? '#000' : '#fff';
              const fgMuted = isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)';
              const shadowColor = isLight ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
              const trackBg = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.25)';
              const copyBg = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3)';
              return (
              <View style={[styles.inlineColorPreview, { backgroundColor: colorInfo.hex }]}>
                <View style={styles.previewTopRow}>
                  <Text style={[styles.inlineColorPreviewValue, { color: fgColor }]}>
                    {getFormattedColor(colorInfo, colorFormat)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.inlineColorCopyButton, { backgroundColor: copyBg }]}
                    onPress={() => copyColor(getFormattedColor(colorInfo, colorFormat), colorFormat)}
                  >
                    <Ionicons name="copy-outline" size={16} color={fgColor} />
                    <Text style={[styles.inlineColorCopyText, { color: fgColor }]}>{copyButtonLabel}</Text>
                  </TouchableOpacity>
                </View>

                {/* Fixed-height channel section: keep HEX/RGB/HSL card height stable */}
                <View style={styles.previewChannelContainer}>
                  {colorFormat === 'RGB' && (
                    <View style={styles.previewChannelBars}>
                      {[
                        { label: 'R', value: colorInfo.rgb.r, max: 255, color: '#ef4444', display: `${colorInfo.rgb.r}` },
                        { label: 'G', value: colorInfo.rgb.g, max: 255, color: '#22c55e', display: `${colorInfo.rgb.g}` },
                        { label: 'B', value: colorInfo.rgb.b, max: 255, color: '#3b82f6', display: `${colorInfo.rgb.b}` },
                      ].map((ch) => (
                        <View key={ch.label} style={styles.previewChannelRow}>
                          <Text style={[styles.previewChannelLabel, { color: fgMuted, textShadowColor: shadowColor }]}>{ch.label}</Text>
                          <View style={[styles.previewChannelTrack, { backgroundColor: trackBg }]}>
                            <View style={[styles.previewChannelFill, { width: `${(ch.value / ch.max) * 100}%`, backgroundColor: ch.color }]} />
                          </View>
                          <Text style={[styles.previewChannelValue, { color: fgMuted, textShadowColor: shadowColor }]}>{ch.display}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                {colorFormat === 'HSL' && (() => {
                  const { h, s, l } = colorInfo.hsl;
                  const hueRgb = hslToRgb(h, 100, 50);
                  const hueHex = rgbToHex(hueRgb.r, hueRgb.g, hueRgb.b);
                  const satRgb = hslToRgb(h, s, 50);
                  const satHex = rgbToHex(satRgb.r, satRgb.g, satRgb.b);
                  const lightnessGray = Math.round((l / 100) * 255);
                  const boostedGray = lightnessGray < 128
                    ? Math.max(0, lightnessGray - 35)
                    : Math.min(255, lightnessGray + 35);
                  const lightnessHex = rgbToHex(boostedGray, boostedGray, boostedGray);
                  const lightnessBorder = boostedGray >= 180
                    ? 'rgba(0,0,0,0.32)'
                    : 'rgba(255,255,255,0.4)';
                  const hslTrackBg = isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)';
                  const hslChannels: Array<{
                    label: string;
                    value: number;
                    max: number;
                    barColor: string;
                    display: string;
                    borderColor?: string;
                  }> = [
                    { label: 'H', value: h, max: 360, barColor: hueHex, display: `${h}°` },
                    { label: 'S', value: s, max: 100, barColor: satHex, display: `${s}%` },
                    { label: 'L', value: l, max: 100, barColor: lightnessHex, display: `${l}%`, borderColor: lightnessBorder },
                  ];
                  return (
                    <View style={styles.previewChannelBars}>
                      {hslChannels.map((ch) => (
                          <View key={ch.label} style={styles.previewChannelRow}>
                            <Text style={[styles.previewChannelLabel, { color: fgMuted, textShadowColor: shadowColor }]}>{ch.label}</Text>
                            <View style={[styles.previewChannelTrack, { backgroundColor: hslTrackBg }]}>
                              <View
                                style={[
                                  styles.previewChannelFill,
                                  {
                                    width: `${(ch.value / ch.max) * 100}%`,
                                    minWidth: ch.value > 0 ? 6 : 0,
                                    backgroundColor: ch.barColor,
                                  },
                                  ch.borderColor && { borderWidth: 1, borderColor: ch.borderColor },
                                ]}
                              />
                            </View>
                            <Text style={[styles.previewChannelValue, { color: fgMuted, textShadowColor: shadowColor }]}>{ch.display}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  })()}
                  {colorFormat === 'HEX' && <View style={styles.previewChannelBarsPlaceholder} />}
                </View>
              </View>
              );
            })()}

            {/* Format Segment Toggle */}
            <View style={[styles.formatSegment, { backgroundColor: theme.backgroundTertiary }]}>
              {(['HEX', 'RGB', 'HSL'] as const).map((fmt) => (
                <TouchableOpacity
                  key={fmt}
                  style={[
                    styles.formatSegmentButton,
                    colorFormat === fmt && { backgroundColor: FORMAT_ACCENT_COLORS[fmt] },
                  ]}
                  onPress={() => {
                    hapticLight();
                    setColorFormat(fmt);
                  }}
                >
                  <Text style={[
                    styles.formatSegmentText,
                    { color: colorFormat === fmt ? '#fff' : theme.textMuted },
                  ]}>
                    {fmt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Inline Variations */}
            <View style={[styles.inlineVariationsSection, { backgroundColor: theme.backgroundTertiary }]}>
              <View style={styles.variationsHeader}>
                <Text style={[styles.variationsSectionTitle, { color: theme.textPrimary }]}>{variationsLabel}</Text>
                <View style={[styles.hueShiftToggle, { backgroundColor: theme.backgroundSecondary }]}>
                  <TouchableOpacity
                    style={[
                      styles.hueShiftOption,
                      !variationHueShift && { backgroundColor: VARIATION_TOGGLE_COLORS.lightness },
                    ]}
                    onPress={() => {
                      hapticLight();
                      setVariationHueShift(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.hueShiftOptionText,
                        { color: !variationHueShift ? '#fff' : theme.textMuted },
                      ]}
                    >
                      {lightnessLabel}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.hueShiftOption,
                      variationHueShift && { backgroundColor: VARIATION_TOGGLE_COLORS.hueShift },
                    ]}
                    onPress={() => {
                      hapticLight();
                      setVariationHueShift(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.hueShiftOptionText,
                        { color: variationHueShift ? '#fff' : theme.textMuted },
                      ]}
                    >
                      {hueShiftLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.variationStrip}>
                {generateColorVariations(colorInfo.hex, variationHueShift).map(
                  (v, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.variationCell,
                        v.label === 'Base' && styles.variationCellBase,
                      ]}
                      onPress={() => copyColor(v.hex)}
                    >
                      <View style={[styles.variationColor, { backgroundColor: v.hex }]} />
                      <Text style={[styles.variationHex, { color: theme.textMuted }]}>{v.hex}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Inline Harmony */}
            {currentHarmony && (
              <View
                style={[
                  styles.harmonySection,
                  {
                    backgroundColor: theme.backgroundTertiary,
                    marginTop: 10,
                    marginBottom: 0,
                    padding: 12,
                  },
                ]}
              >
                <Text style={[styles.harmonySectionTitle, { color: theme.textPrimary }]}>{harmonyLabel}</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.harmonyTypesScroll}
                >
                  {colorHarmonies.map((harmony) => (
                    <TouchableOpacity
                      key={harmony.type}
                      style={[
                        styles.harmonyTypeButton,
                        {
                          backgroundColor:
                            selectedHarmony === harmony.type
                              ? UNIFIED_EMPHASIS.activeButtonBg
                              : theme.backgroundSecondary,
                        },
                      ]}
                      onPress={() => {
                        hapticLight();
                        setSelectedHarmony(harmony.type);
                      }}
                    >
                      <Text
                        style={[
                          styles.harmonyTypeText,
                          { color: selectedHarmony === harmony.type ? '#fff' : theme.textMuted },
                        ]}
                      >
                        {harmony.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.harmonyDesc, { color: theme.textMuted }]}>
                  {currentHarmony.description}
                  {currentHarmony.colors.length > 1 &&
                    ` (${currentHarmony.colors.map((color) => color.angle + '°').join(', ')})`}
                </Text>

                <View style={styles.harmonyColorsRow}>
                  {currentHarmony.colors.map((harmonyColor, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.harmonyColorItem}
                      onPress={() => copyColor(harmonyColor.hex.toUpperCase(), harmonyColor.name)}
                    >
                      <View
                        style={[
                          styles.harmonyColorSwatch,
                          { backgroundColor: harmonyColor.hex },
                          harmonyColor.angle === 0 && styles.harmonyColorSwatchBase,
                        ]}
                      />
                      <Text style={[styles.harmonyColorHex, { color: theme.textMuted }]}>
                        {harmonyColor.hex.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Luminosity Histogram */}
        {histogram && currentImageUri && (
          <View style={[styles.histogramCard, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <View style={styles.histogramHeader}>
              <View style={styles.histogramTitleRow}>
                <Ionicons name="analytics-outline" size={14} color={theme.textMuted} />
                <Text style={[styles.histogramTitle, { color: theme.textMuted }]}>{histogramTitle}</Text>
              </View>
              <View style={styles.histogramStats}>
                <Text style={[styles.histogramStatText, { color: theme.accent }]}>{histogram.contrast}%</Text>
                <Text style={[styles.histogramContrastLabel, { color: theme.textMuted }]}>{histogramContrastLabel}</Text>
              </View>
            </View>

            <View style={styles.histogramBars}>
              {histogram.bins.map((value, index) => (
                <View key={index} style={styles.histogramBarWrapper}>
                  <View
                    style={[
                      styles.histogramBar,
                      {
                        height: `${Math.max(value, 2)}%`,
                        backgroundColor: index < 11 ? '#8E8E93' : index < 21 ? '#AEAEB2' : '#C7C7CC',
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            <View style={styles.histogramScale}>
              <View style={styles.histogramGradient}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.histogramGradientStep,
                      { backgroundColor: `rgb(${i * 17}, ${i * 17}, ${i * 17})` },
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.histogramStatsRow}>
              <View style={[styles.histogramStatItem, { backgroundColor: theme.backgroundTertiary, borderColor: theme.borderLight, borderWidth: 1 }]}>
                <Text style={[styles.histogramStatValue, { color: theme.textPrimary }]}>{histogram.darkPercent}%</Text>
                <Text style={[styles.histogramStatLabel, { color: theme.textSecondary }]}>{histogramDarkLabel}</Text>
              </View>
              <View style={[styles.histogramStatItem, { backgroundColor: theme.backgroundTertiary, borderColor: theme.borderLight, borderWidth: 1 }]}>
                <Text style={[styles.histogramStatValue, { color: theme.textPrimary }]}>{histogram.midPercent}%</Text>
                <Text style={[styles.histogramStatLabel, { color: theme.textSecondary }]}>{histogramMidLabel}</Text>
              </View>
              <View style={[styles.histogramStatItem, { backgroundColor: theme.backgroundTertiary, borderColor: theme.borderLight, borderWidth: 1 }]}>
                <Text style={[styles.histogramStatValue, { color: theme.textPrimary }]}>{histogram.brightPercent}%</Text>
                <Text style={[styles.histogramStatLabel, { color: theme.textSecondary }]}>{histogramBrightLabel}</Text>
              </View>
              <View
                style={[
                  styles.histogramStatItem,
                  styles.histogramStatItemAvg,
                  { backgroundColor: theme.accent + '1a', borderColor: theme.accent + '44', borderWidth: 1 },
                ]}
              >
                <Text style={[styles.histogramStatValueAvg, { color: theme.accent }]}>{histogram.average}</Text>
                <Text style={[styles.histogramStatLabel, { color: theme.textSecondary }]}>{histogramAverageLabel}</Text>
              </View>
            </View>
          </View>
        )}

        {currentImageUri && <View style={{ height: 100 }} />}
      </ScrollView>

      <ActionBar
        theme={theme}
        language={appLanguage}
        onNavigateToLibrary={onNavigateToLibrary}
        onSave={handleSave}
        onExport={handleExport}
        onHapticLight={hapticLight}
      />

      <ColorDetailModal
        visible={showColorDetail && colorInfo !== null}
        theme={theme}
        colorInfo={colorInfo}
        colorFormat={colorFormat}
        onFormatChange={setColorFormat}
        onClose={() => setShowColorDetail(false)}
        getFormattedColor={getFormattedColor}
        copyColor={copyColor}
        variationHueShift={variationHueShift}
        onVariationHueShiftChange={setVariationHueShift}
        selectedHarmony={selectedHarmony}
        onHarmonyChange={setSelectedHarmony}
        language={appLanguage}
        onHapticLight={hapticLight}
      />

      <ImageCropModal
        visible={showCropModal}
        theme={theme}
        language={appLanguage}
        imageUri={cropSourceAsset?.uri ?? null}
        sourceWidth={cropSourceAsset?.width ?? 0}
        sourceHeight={cropSourceAsset?.height ?? 0}
        isApplying={isApplyingCrop}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
        onHapticLight={hapticLight}
      />

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={closeCamera}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />
          <SafeAreaView style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.cameraCloseButton}
              onPress={() => {
                hapticLight();
                closeCamera();
              }}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            <View style={styles.cameraBottomControls}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <SavePaletteModal
        visible={showSaveModal}
        theme={theme}
        language={appLanguage}
        paletteName={paletteName}
        onPaletteNameChange={setPaletteName}
        onClose={() => setShowSaveModal(false)}
        onConfirm={confirmSave}
      />

      <ExportModal
        visible={showExportModal}
        theme={theme}
        language={appLanguage}
        snsCardType={snsCardType}
        onSnsCardTypeChange={setSnsCardType}
        cardShowHex={cardShowHex}
        onCardShowHexChange={setCardShowHex}
        cardShowStats={cardShowStats}
        onCardShowStatsChange={setCardShowStats}
        cardShowHistogram={cardShowHistogram}
        onCardShowHistogramChange={setCardShowHistogram}
        paletteCardRef={paletteCardRef}
        processedColors={processedColors}
        currentImageUri={currentImageUri}
        histogram={histogram}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        isExporting={isExporting}
        onExportConfirm={handleExportConfirm}
        onCopyToClipboard={copyToClipboard}
        onClose={() => setShowExportModal(false)}
        onHapticLight={hapticLight}
      />

      <InfoModal
        visible={showInfo}
        theme={theme}
        language={appLanguage}
        onLanguageChange={onAppLanguageChange}
        onClose={() => setShowInfo(false)}
        onHapticLight={hapticLight}
      />

      {/* Inline Toast */}
      {toastMessage && (
        <View style={styles.toastContainer} pointerEvents="none">
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={16} color="#34d399" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

    </View>
  );
}
