import Animated from 'react-native-reanimated';
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { shallow } from 'zustand/shallow';

import { usePaletteStore } from '../store/paletteStore';
import { useThemeStore } from '../store/themeStore';
import { COLOR_TOKENS } from '../constants/designTokens';
import {
  toGrayscale,
  adjustColor,
  getColorBlindnessTypes,
  HarmonyType,
  simulateColorBlindness,
  ColorBlindnessType,
  type AppLanguage,
  type ColorInfo,
} from '../lib/colorUtils';
import { StyleFilter, STYLE_PRESETS } from '../constants/stylePresets';
import { styles } from './home/HomeScreen.styles';
import { getHomeLocalization } from './home/homeLocalization';
import { useColorExtraction } from './home/hooks/useColorExtraction';
import { useImageImportAndCrop } from './home/hooks/useImageImportAndCrop';
import { usePaletteExport } from './home/hooks/usePaletteExport';
import { useAdvancedPanel } from './home/hooks/useAdvancedPanel';
import { useCameraCapture } from './home/hooks/useCameraCapture';
import { useColorDetail } from './home/hooks/useColorDetail';
import { useToast } from './home/hooks/useToast';
import { useSectionEntrance } from './home/hooks/useSectionEntrance';
import HomeHeader from './home/HomeHeader';
import ImageCard from './home/ImageCard';
import ActionBar from './home/ActionBar';
import InlineSettingsPanel from './home/InlineSettingsPanel';
import SettingsSummaryBar from './home/SettingsSummaryBar';
import SwatchHint from './home/SwatchHint';
import OnboardingGuide from './home/OnboardingGuide';
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

  // Toast & Hint State
  const { toastMessage, showToast } = useToast();
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
  const kmeansAccentColor = COLOR_TOKENS.accentMuted;
  const styleChipColor = STYLE_PRESETS[styleFilter].color;
  const methodChipColor = extractionMethod === 'histogram' ? COLOR_TOKENS.textMuted : kmeansAccentColor;
  const countChipColor = COLOR_TOKENS.accentVariationLightness;

  const localization = getHomeLocalization(appLanguage);

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
    errorTitle: localization.errorTitle,
    extractErrorMessage: localization.extractErrorMessage,
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
    Alert.alert(localization.permissionTitle, localization.cameraPermissionMessage);
  }, [localization.cameraPermissionMessage, localization.permissionTitle]);
  const handleCameraCaptureError = useCallback(() => {
    Alert.alert(localization.errorTitle, localization.cameraErrorMessage);
  }, [localization.cameraErrorMessage, localization.errorTitle]);

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
    if (isAdvancedMounted) closeAdvancedPanel();
    if (selectedColorIndex === index) {
      setSelectedColorIndex(null);
    } else {
      setSelectedColorIndex(index);
    }
  }, [closeAdvancedPanel, hapticLight, isAdvancedMounted, selectedColorIndex, setSelectedColorIndex]);

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
  const handleToggleAdvancedPanel = useCallback(() => { hapticLight(); toggleAdvancedPanel(); }, [hapticLight, toggleAdvancedPanel]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <HomeHeader
        language={appLanguage}
        onShowInfo={handleShowInfo}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >
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

        <SettingsSummaryBar
          theme={theme}
          styleFilter={styleFilter}
          styleChipColor={styleChipColor}
          methodChipColor={methodChipColor}
          countChipColor={countChipColor}
          extractionMethodLabel={localization.extractionMethodLabels[extractionMethod]}
          stylePresetChipLabel={localization.stylePresetChipLabels[styleFilter]}
          colorCount={colorCount}
          colorBlindMode={colorBlindMode}
          cvdChipLabel={cvdChipLabel}
          isAdvancedMounted={isAdvancedMounted}
          onToggleAdvancedPanel={handleToggleAdvancedPanel}
        />

        {processedColors.length > 0 && selectedColorIndex === null && !hasSeenColorTapHint && (
          <EntranceWrapper delay={100}>
            <SwatchHint
              theme={theme}
              title={localization.swatchHintTitle}
              subtitle={localization.swatchHintSubtitle}
            />
          </EntranceWrapper>
        )}

        <ColorPaletteSection
          theme={theme}
          processedColors={processedColors}
          styledColors={styledColors}
          selectedColorIndex={selectedColorIndex}
          colorBlindMode={colorBlindMode}
          colorCount={colorCount}
          onColorPress={handleColorPress}
        />

        <InlineSettingsPanel
          isMounted={isAdvancedMounted}
          showAdvanced={showAdvanced}
          theme={theme}
          advancedPanelAnim={advancedPanelAnim}
          isKorean={isKorean}
          settingLabel={localization.settingLabel}
          stylePresetLabel={localization.stylePresetLabel}
          styleFilter={styleFilter}
          stylePresetButtonLabels={localization.stylePresetButtonLabels}
          stylePresetButtonLines={localization.stylePresetButtonLines}
          onStyleFilterChange={setStyleFilter}
          extractionMethodLabel={localization.extractionMethodLabel}
          extractionMethod={extractionMethod}
          extractionMethodLabels={localization.extractionMethodLabels}
          methodDescriptions={localization.methodDescriptions}
          kmeansAccentColor={kmeansAccentColor}
          onMethodChange={handleMethodChange}
          colorCountLabel={localization.colorCountLabel}
          colorCount={colorCount}
          onColorCountStep={handleColorCountStep}
          colorVisionLabel={localization.colorVisionLabel}
          cvdOptions={cvdOptions}
          colorBlindMode={colorBlindMode}
          onColorBlindModeChange={setColorBlindMode}
          onClose={closeAdvancedPanel}
        />

        {!currentImageUri && processedColors.length === 0 && (
          <EntranceWrapper delay={300}>
            <OnboardingGuide
              theme={theme}
              title={localization.emptyGuideTitle}
              addImageLabel={localization.emptyGuideAddImage}
              expandSettingsLabel={localization.emptyGuideExpandSettings}
              tapSwatchLabel={localization.emptyGuideTapSwatch}
            />
          </EntranceWrapper>
        )}

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
          <EntranceWrapper delay={200}>
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
          </EntranceWrapper>
        )}

        {currentImageUri && <View style={{ height: 100 }} />}
      </ScrollView>

      <ActionBar
        theme={theme}
        language={appLanguage}
        onNavigateToLibrary={onNavigateToLibrary}
        onSave={handleSave}
        onExport={handleExport}
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
            <Ionicons name="checkmark-circle" size={16} color={COLOR_TOKENS.emerald} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}
