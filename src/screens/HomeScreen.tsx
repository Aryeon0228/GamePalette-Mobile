import Animated from 'react-native-reanimated';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
  StyleSheet,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { shallow } from 'zustand/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';

import { usePaletteStore } from '../store/paletteStore';
import { useThemeStore } from '../store/themeStore';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLOR_TOKENS, BLUR_INTENSITY, OVERLAY_TOKENS } from '../constants/designTokens';
import {
  toGrayscale,
  adjustColor,
  getColorBlindnessTypes,
  HarmonyType,
  simulateColorBlindness,
  ColorBlindnessType,
  type AppLanguage,
  type ColorInfo,
  type ColorFormat,
} from '../lib/colorUtils';
import { ExtractionMethod } from '../lib/colorExtractor';
import { StyleFilter, STYLE_PRESETS } from '../constants/stylePresets';
import { styles } from './home/HomeScreen.styles';
import { getHomeLocalization } from './home/homeLocalization';
import { useColorExtraction } from './home/hooks/useColorExtraction';
import { useImageImportAndCrop } from './home/hooks/useImageImportAndCrop';
import { usePaletteExport } from './home/hooks/usePaletteExport';
import { useCameraCapture } from './home/hooks/useCameraCapture';
import { useColorDetail } from './home/hooks/useColorDetail';
import { useToast } from './home/hooks/useToast';
import { useSectionEntrance } from './home/hooks/useSectionEntrance';
import HomeHeader from './home/HomeHeader';
import ImageCard from './home/ImageCard';
import ActionBar from './home/ActionBar';
import SettingsSummaryBar, { type SettingChipId } from './home/SettingsSummaryBar';
import SettingsPanel from './home/SettingsPanel';
import SwatchHint from './home/SwatchHint';
import ColorPaletteSection from './home/ColorPaletteSection';
import ColorDetailSection from './home/ColorDetailSection';
import HistogramSection from './home/HistogramSection';
import CameraModal from './home/CameraModal';
import ColorDetailModal from './home/modals/ColorDetailModal';
import SavePaletteModal from './home/modals/SavePaletteModal';
import ExportModal from './home/modals/ExportModal';
import InfoModal from './home/modals/InfoModal';
import ImageCropModal from './home/modals/ImageCropModal';

// ============================================
// ENTRANCE ANIMATION WRAPPER
// ============================================

function EntranceWrapper({ delay, children }: { delay: number; children: React.ReactNode }) {
  const entranceStyle = useSectionEntrance({ delay });
  return <Animated.View style={entranceStyle}>{children}</Animated.View>;
}

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
  const [colorFormat, setColorFormat] = useState<ColorFormat>('HEX');

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

  // Toast & Hint State
  const { toastMessage, showToast } = useToast();
  const [hasSeenColorTapHint, setHasSeenColorTapHint] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenColorTapHint').then((v) => {
      if (v !== 'true') setHasSeenColorTapHint(false);
    });
  }, []);

  // Theme & Store
  const theme = useThemeStore((state) => state.colors);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.isDark ? '#1e2130' : '#f0f0f2');
  }, [theme.isDark]);
  const {
    currentColors,
    currentImageUri,
    selectedColorIndex,
    colorCount,
    extractionMethod,
    setCurrentColors,
    setCurrentImageUri,
    setSelectedColorIndex,
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
      setExtractionMethod: state.setExtractionMethod,
      savePalette: state.savePalette,
    }),
    shallow
  );
  // ============================================
  // COMPUTED VALUES
  // ============================================

  const styledColors = useMemo(() =>
    currentColors.map((hex) => {
      if (showGrayscale) return toGrayscale(hex);
      const preset = STYLE_PRESETS[styleFilter];
      return adjustColor(hex, preset.saturation, preset.brightness);
    }),
    [currentColors, showGrayscale, styleFilter]
  );

  const processedColors = useMemo(() =>
    styledColors.map((color) => {
      if (colorBlindMode !== 'none') return simulateColorBlindness(color, colorBlindMode);
      return color;
    }),
    [styledColors, colorBlindMode]
  );

  const { colorInfo, colorHarmonies, currentHarmony } = useColorDetail(
    processedColors, selectedColorIndex, appLanguage, selectedHarmony
  );

  const isKorean = appLanguage === 'ko';
  const cvdOptions = useMemo(() => getColorBlindnessTypes(appLanguage), [appLanguage]);
  const cvdChipLabel = useMemo(() => {
    if (colorBlindMode === 'none') return '';
    return cvdOptions.find((option) => option.type === colorBlindMode)?.label ?? '';
  }, [colorBlindMode, cvdOptions]);

  const localization = getHomeLocalization(appLanguage);

  const {
    isExtracting,
    histogram,
    extractColors,
    handleMethodChange,
    handleReExtract,
  } = useColorExtraction({
    colorCount,
    extractionMethod,
    currentImageUri,
    setCurrentColors,
    setCurrentImageUri,
    setExtractionMethod,
    errorTitle: localization.errorTitle,
    extractErrorMessage: localization.extractErrorMessage,
  });

  const getFormattedColor = useCallback((info: ColorInfo, format: ColorFormat): string => {
    switch (format) {
      case 'HEX': return info.hex.toUpperCase();
      case 'RGB': return `${info.rgb.r}, ${info.rgb.g}, ${info.rgb.b}`;
      case 'HSL': return `${info.hsl.h}°, ${info.hsl.s}%, ${info.hsl.l}%`;
      case 'OKLCH': return `${info.oklch.l}%, ${info.oklch.c}, ${info.oklch.h}°`;
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
    Alert.alert(localization.permissionTitle, localization.cameraPermissionMessage);
  }, [localization.cameraPermissionMessage, localization.permissionTitle]);
  const handleCameraCaptureError = useCallback(() => {
    Alert.alert(localization.errorTitle, localization.cameraErrorMessage);
  }, [localization.cameraErrorMessage, localization.errorTitle]);

  const [activeDropdown, setActiveDropdown] = useState<SettingChipId | null>(null);

  const handleChipPress = useCallback((id: SettingChipId) => {
    hapticLight();
    if (id === 'style') {
      const keys: StyleFilter[] = ['original', 'hypercasual', 'stylized', 'realistic'];
      const idx = keys.indexOf(styleFilter);
      setStyleFilter(keys[(idx + 1) % keys.length]);
    } else if (id === 'method') {
      const next: ExtractionMethod = extractionMethod === 'histogram' ? 'kmeans' : 'histogram';
      handleMethodChange(next);
    } else if (id === 'cvd') {
      const keys: ColorBlindnessType[] = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
      const idx = keys.indexOf(colorBlindMode);
      setColorBlindMode(keys[(idx + 1) % keys.length]);
    }
    // 'bw' is handled by onToggleGrayscale directly
  }, [hapticLight, styleFilter, extractionMethod, colorBlindMode, handleMethodChange]);

  const { showCamera, cameraRef, openCamera, closeCamera, takePicture } = useCameraCapture({
    onImageCaptured: extractColors,
    onPermissionDenied: handleCameraPermissionDenied,
    onCaptureError: handleCameraCaptureError,
    onBeforeCapture: hapticMedium,
    onCaptureSuccess: hapticSuccess,
  });

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
    permissionTitle: localization.permissionTitle,
    galleryPermissionMessage: localization.galleryPermissionMessage,
    errorTitle: localization.errorTitle,
    galleryErrorMessage: localization.galleryErrorMessage,
    cropErrorMessage: localization.cropErrorMessage,
  });

  const showImageSourceOptions = useCallback(() => {
    hapticLight();
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [localization.actionSheetLabels.cancel, localization.actionSheetLabels.takePhoto, localization.actionSheetLabels.chooseFromLibrary],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) void openCamera();
          else if (buttonIndex === 2) void pickFromGallery();
        }
      );
    } else {
      Alert.alert(
        localization.imageSourceDialogTitle,
        localization.imageSourceDialogMessage,
        [
          { text: localization.actionSheetLabels.cancel, style: 'cancel' },
          { text: localization.actionSheetLabels.takePhoto, onPress: () => void openCamera() },
          { text: localization.actionSheetLabels.chooseFromLibrary, onPress: () => void pickFromGallery() },
        ]
      );
    }
  }, [localization.actionSheetLabels, localization.imageSourceDialogMessage, localization.imageSourceDialogTitle, hapticLight, openCamera, pickFromGallery]);

  // ============================================
  // COLOR INTERACTION
  // ============================================

  const handleColorPress = useCallback((index: number) => {
    hapticLight();
    if (!hasSeenColorTapHint) {
      setHasSeenColorTapHint(true);
      AsyncStorage.setItem('hasSeenColorTapHint', 'true');
    }
    if (activeDropdown) setActiveDropdown(null);
    if (selectedColorIndex === index) {
      setSelectedColorIndex(null);
    } else {
      setSelectedColorIndex(index);
    }
  }, [activeDropdown, hapticLight, selectedColorIndex, setSelectedColorIndex]);

  const copyColor = useCallback(async (value: string, label?: string) => {
    await Clipboard.setStringAsync(value);
    hapticSuccess();
    showToast(isKorean ? `${localization.copiedPrefix}: ${label || value}` : `${localization.copiedPrefix} ${label || value}`);
  }, [localization.copiedPrefix, hapticSuccess, isKorean, showToast]);

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
    untitledPaletteLabel: localization.untitledPaletteLabel,
    shareDialogTitle: localization.shareDialogTitle,
    errorTitle: localization.errorTitle,
    exportPngErrorMessage: localization.exportPngErrorMessage,
    exportErrorMessage: localization.exportErrorMessage,
    copiedPrefix: localization.copiedPrefix,
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
      Alert.alert(localization.noColorsTitle, localization.noColorsMessage);
      return;
    }
    setPaletteName('');
    setShowSaveModal(true);
  }, [localization.noColorsMessage, localization.noColorsTitle, processedColors.length]);

  const confirmSave = useCallback(() => {
    const originalColors = currentColors;
    setCurrentColors(processedColors);
    savePalette(paletteName.trim());
    setCurrentColors(originalColors);
    setShowSaveModal(false);
    setPaletteName('');
    Alert.alert(localization.savedTitle, localization.savedMessage);
  }, [currentColors, paletteName, processedColors, savePalette, localization.savedMessage, localization.savedTitle, setCurrentColors]);

  const handleExport = useCallback(() => {
    if (processedColors.length === 0) {
      Alert.alert(localization.noColorsTitle, localization.noColorsMessage);
      return;
    }
    setShowExportModal(true);
  }, [localization.noColorsMessage, localization.noColorsTitle, processedColors.length]);

  const handleShowInfo = useCallback(() => setShowInfo(true), []);
  const handleToggleGrayscale = useCallback(() => { hapticLight(); setShowGrayscale((prev) => !prev); }, [hapticLight]);
  const handleReExtractPress = useCallback(() => { hapticLight(); void handleReExtract(); }, [handleReExtract, hapticLight]);
  const handleOpenCameraPress = useCallback(() => { hapticLight(); void openCamera(); }, [hapticLight, openCamera]);
  const handlePickFromGalleryPress = useCallback(() => { hapticLight(); void pickFromGallery(); }, [hapticLight, pickFromGallery]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <Animated.View style={[styles.container]}>
      <LinearGradient
        colors={theme.isDark
          ? ['#1e2130', '#1a1d2e']
          : ['rgb(210, 210, 212)', 'rgb(200, 200, 198)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >
        <HomeHeader
          language={appLanguage}
          onShowInfo={handleShowInfo}
        />
        <View style={[styles.sectorNeumorphLight,
          theme.isDark && { shadowColor: '#5a68a0', shadowOpacity: 0.4 }
        ]}>
        <View style={[styles.imageGroupOuter,
          theme.isDark && { shadowColor: '#000', shadowOpacity: 0.6 }
        ]}>
          <View style={[styles.imageGroupInner,
            theme.isDark && { backgroundColor: theme.backgroundSecondary }
          ]}>
            <ImageCard
              currentImageUri={currentImageUri}
              showGrayscale={showGrayscale}
              language={appLanguage}
              theme={theme}
              isExtracting={isExtracting}
              onImagePress={showImageSourceOptions}
              onReExtractPress={handleReExtractPress}
              onOpenCamera={handleOpenCameraPress}
              onPickFromGallery={handlePickFromGalleryPress}
            />

            <SettingsSummaryBar
              onChipPress={handleChipPress}
              styleFilter={styleFilter}
              stylePresetChipLabel={localization.stylePresetChipLabels[styleFilter]}
              isKorean={isKorean}
              extractionMethod={extractionMethod}
              colorBlindMode={colorBlindMode}
              cvdChipLabel={cvdChipLabel}
              showGrayscale={showGrayscale}
              onToggleGrayscale={handleToggleGrayscale}
              isDark={theme.isDark}
            />

            <SettingsPanel
              isInline
              theme={theme}
              activeDropdown={activeDropdown}
              isKorean={isKorean}
              styleFilter={styleFilter}
              stylePresetButtonLabels={localization.stylePresetButtonLabels}
              stylePresetButtonLines={localization.stylePresetButtonLines}
              onStyleFilterChange={setStyleFilter}
              extractionMethod={extractionMethod}
              extractionMethodLabels={localization.extractionMethodLabels}
              methodDescriptions={localization.methodDescriptions}
              onMethodChange={handleMethodChange}
              colorBlindMode={colorBlindMode}
              cvdOptions={cvdOptions}
              onColorBlindModeChange={setColorBlindMode}
            />
          </View>
        </View>
        </View>


        {/* SwatchHint removed */}

        <View style={[styles.sectorNeumorphLight,
          theme.isDark && { shadowColor: '#5a68a0', shadowOpacity: 0.4 }
        ]}>
        <View style={[styles.imageGroupOuter, styles.paletteGroupOuter,
          theme.isDark && { shadowColor: '#000', shadowOpacity: 0.6 }
        ]}>
          <View style={[styles.paletteGroupInner,
            theme.isDark && { backgroundColor: theme.backgroundSecondary }
          ]}>
            <ColorPaletteSection
              theme={theme}
              processedColors={processedColors}
              styledColors={styledColors}
              selectedColorIndex={selectedColorIndex}
              colorBlindMode={colorBlindMode}
              colorCount={colorCount}
              onColorPress={handleColorPress}
            />
          </View>
        </View>
        </View>

        {colorInfo && selectedColorIndex !== null && (
          <EntranceWrapper delay={50}>
            <ColorDetailSection
              theme={theme}
              colorInfo={colorInfo}
              colorFormat={colorFormat}
              onFormatChange={setColorFormat}
              getFormattedColor={getFormattedColor}
              copyColor={copyColor}
              copyButtonLabel={localization.copyButtonLabel}
              variationHueShift={variationHueShift}
              onVariationHueShiftChange={setVariationHueShift}
              variationsLabel={localization.variationsLabel}
              lightnessLabel={localization.lightnessLabel}
              hueShiftLabel={localization.hueShiftLabel}
              harmonyLabel={localization.harmonyLabel}
              selectedHarmony={selectedHarmony}
              onHarmonyChange={setSelectedHarmony}
              colorHarmonies={colorHarmonies}
              currentHarmony={currentHarmony}
            />
          </EntranceWrapper>
        )}

        {histogram && currentImageUri && (
          <View style={[styles.sectorNeumorphLight,
            theme.isDark && { shadowColor: '#5a68a0', shadowOpacity: 0.4 }
          ]}>
          <View style={[styles.imageGroupOuter, styles.paletteGroupOuter,
            theme.isDark && { shadowColor: '#000', shadowOpacity: 0.6 }
          ]}>
            <View style={[styles.imageGroupInner,
              theme.isDark && { backgroundColor: theme.backgroundSecondary }
            ]}>
              <HistogramSection
                theme={theme}
                histogram={histogram}
                histogramTitle={localization.histogramTitle}
                histogramContrastLabel={localization.histogramContrastLabel}
                histogramDarkLabel={localization.histogramDarkLabel}
                histogramMidLabel={localization.histogramMidLabel}
                histogramBrightLabel={localization.histogramBrightLabel}
                histogramAverageLabel={localization.histogramAverageLabel}
              />
            </View>
          </View>
          </View>
        )}

        {currentImageUri && <View style={{ height: 100 }} />}
      </ScrollView>

      {processedColors.length > 0 && (
        <EntranceWrapper delay={150}>
          <ActionBar
            theme={theme}
            language={appLanguage}
            onNavigateToLibrary={onNavigateToLibrary}
            onSave={handleSave}
            onExport={handleExport}
          />
        </EntranceWrapper>
      )}

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

      <CameraModal
        visible={showCamera}
        cameraRef={cameraRef}
        onClose={closeCamera}
        onTakePicture={takePicture}
        onHapticLight={hapticLight}
      />

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
            <BlurView intensity={BLUR_INTENSITY.glass} tint={theme.isDark ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
            <Ionicons name="checkmark-circle" size={16} color={COLOR_TOKENS.emerald} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}
