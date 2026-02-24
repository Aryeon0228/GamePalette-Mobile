// Components
export { default as ActionBar } from './ActionBar';
export { default as CameraModal } from './CameraModal';
export { default as ColorDetailSection } from './ColorDetailSection';
export { default as ColorPaletteSection } from './ColorPaletteSection';
export { default as HistogramSection } from './HistogramSection';
export { default as HomeHeader } from './HomeHeader';
export { default as ImageCard } from './ImageCard';
export { default as InlineSettingsPanel } from './InlineSettingsPanel';
export { default as OnboardingGuide } from './OnboardingGuide';
export { default as SettingsSummaryBar } from './SettingsSummaryBar';
export { default as SwatchHint } from './SwatchHint';

// Hooks
export { useAdvancedPanel } from './hooks/useAdvancedPanel';
export { useCameraCapture } from './hooks/useCameraCapture';
export { useColorDetail } from './hooks/useColorDetail';
export { useColorExtraction } from './hooks/useColorExtraction';
export { useImageImportAndCrop } from './hooks/useImageImportAndCrop';
export { usePaletteExport } from './hooks/usePaletteExport';
export { useToast } from './hooks/useToast';

// Styles & Localization
export { styles } from './HomeScreen.styles';
export { getHomeLocalization } from './homeLocalization';
