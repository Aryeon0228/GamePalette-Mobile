import type { ExtractionMethod } from '../../lib/colorExtractor';
import type { AppLanguage } from '../../lib/colorUtils';
import type { StyleFilter } from '../../constants/stylePresets';

interface ActionSheetLabels {
  cancel: string;
  takePhoto: string;
  chooseFromLibrary: string;
}

export interface HomeLocalization {
  stylePresetChipLabels: Record<StyleFilter, string>;
  stylePresetButtonLabels: Record<StyleFilter, string>;
  stylePresetButtonLines: Record<StyleFilter, number>;
  extractionMethodLabels: Record<ExtractionMethod, string>;
  methodDescriptions: Record<ExtractionMethod, string>;
  actionSheetLabels: ActionSheetLabels;
  imageSourceDialogTitle: string;
  imageSourceDialogMessage: string;
  permissionTitle: string;
  cameraPermissionMessage: string;
  galleryPermissionMessage: string;
  errorTitle: string;
  cameraErrorMessage: string;
  galleryErrorMessage: string;
  cropErrorMessage: string;
  extractErrorMessage: string;
  noColorsTitle: string;
  noColorsMessage: string;
  savedTitle: string;
  savedMessage: string;
  shareDialogTitle: string;
  exportErrorMessage: string;
  exportPngErrorMessage: string;
  untitledPaletteLabel: string;
  copiedPrefix: string;
  settingLabel: string;
  stylePresetLabel: string;
  extractionMethodLabel: string;
  colorCountLabel: string;
  colorVisionLabel: string;
  copyButtonLabel: string;
  variationsLabel: string;
  lightnessLabel: string;
  hueShiftLabel: string;
  harmonyLabel: string;
  histogramTitle: string;
  histogramContrastLabel: string;
  histogramDarkLabel: string;
  histogramMidLabel: string;
  histogramBrightLabel: string;
  histogramAverageLabel: string;
  swatchHintTitle: string;
  swatchHintSubtitle: string;
  emptyGuideTitle: string;
  emptyGuideAddImage: string;
  emptyGuideExpandSettings: string;
  emptyGuideTapSwatch: string;
}

const KO_LOCALIZATION: HomeLocalization = {
  stylePresetChipLabels: {
    original: '원본',
    hypercasual: '하이퍼',
    stylized: '스타일',
    realistic: '실사',
  },
  stylePresetButtonLabels: {
    original: '원본',
    hypercasual: '하이퍼\n캐주얼',
    stylized: '스타일\n라이즈드',
    realistic: '실사',
  },
  stylePresetButtonLines: {
    original: 1,
    hypercasual: 2,
    stylized: 2,
    realistic: 1,
  },
  extractionMethodLabels: {
    histogram: '휴 히스토그램',
    kmeans: '케이-민스',
  },
  methodDescriptions: {
    histogram: '평균 색 분포를 고르게 추출',
    kmeans: '핵심 색만 골라서 추출',
  },
  actionSheetLabels: {
    cancel: '취소',
    takePhoto: '사진 촬영',
    chooseFromLibrary: '앨범에서 선택',
  },
  imageSourceDialogTitle: '이미지 선택',
  imageSourceDialogMessage: '이미지 가져올 방식을 선택하세요',
  permissionTitle: '권한 필요',
  cameraPermissionMessage: '카메라 접근 권한을 허용해 주세요.',
  galleryPermissionMessage: '사진 라이브러리 접근 권한을 허용해 주세요.',
  errorTitle: '오류',
  cameraErrorMessage: '사진을 촬영하지 못했습니다.',
  galleryErrorMessage: '사진 라이브러리를 열지 못했습니다.',
  cropErrorMessage: '이미지를 자르지 못했습니다.',
  extractErrorMessage: '이미지에서 색상을 추출하지 못했습니다.',
  noColorsTitle: '색상 없음',
  noColorsMessage: '먼저 이미지에서 색상을 추출해 주세요.',
  savedTitle: '저장 완료!',
  savedMessage: '팔레트가 보관함에 저장되었습니다.',
  shareDialogTitle: '팔레트 공유',
  exportErrorMessage: '팔레트를 내보내지 못했습니다.',
  exportPngErrorMessage: 'PNG로 내보내지 못했습니다.',
  untitledPaletteLabel: '이름 없는 팔레트',
  copiedPrefix: '복사됨',
  settingLabel: '설정',
  stylePresetLabel: '색감 프리셋',
  extractionMethodLabel: '추출 방식',
  colorCountLabel: '색상 개수',
  colorVisionLabel: '색각 모드',
  copyButtonLabel: '복사',
  variationsLabel: '색상 변형',
  lightnessLabel: '명암',
  hueShiftLabel: '명암+색조',
  harmonyLabel: '조화',
  histogramTitle: '명도 분포',
  histogramContrastLabel: '대비',
  histogramDarkLabel: '어둠',
  histogramMidLabel: '중간',
  histogramBrightLabel: '밝음',
  histogramAverageLabel: '평균',
  swatchHintTitle: '팔레트 색상을 탭해보세요',
  swatchHintSubtitle: '상세값, 색상 변형, 조화 팔레트가 바로 열려요.',
  emptyGuideTitle: '메인 화면 가이드',
  emptyGuideAddImage: '카메라/갤러리로 이미지를 추가하세요.',
  emptyGuideExpandSettings: '요약 바 우측 버튼으로 설정을 펼칠 수 있어요.',
  emptyGuideTapSwatch: '추출된 색상 칩은 탭하면 상세 설명이 열립니다.',
};

const EN_LOCALIZATION: HomeLocalization = {
  stylePresetChipLabels: {
    original: 'Original',
    hypercasual: 'Hyper',
    stylized: 'Stylized',
    realistic: 'Realistic',
  },
  stylePresetButtonLabels: {
    original: 'Original',
    hypercasual: 'Hyper',
    stylized: 'Stylized',
    realistic: 'Realistic',
  },
  stylePresetButtonLines: {
    original: 1,
    hypercasual: 1,
    stylized: 1,
    realistic: 1,
  },
  extractionMethodLabels: {
    histogram: 'Hue Histogram',
    kmeans: 'K-Means',
  },
  methodDescriptions: {
    histogram: 'Picks colors evenly from spread',
    kmeans: 'Picks only the key colors',
  },
  actionSheetLabels: {
    cancel: 'Cancel',
    takePhoto: 'Take Photo',
    chooseFromLibrary: 'Choose from Library',
  },
  imageSourceDialogTitle: 'Select Image',
  imageSourceDialogMessage: 'Choose image source',
  permissionTitle: 'Permission Required',
  cameraPermissionMessage: 'Please allow camera access.',
  galleryPermissionMessage: 'Please allow access to your photo library.',
  errorTitle: 'Error',
  cameraErrorMessage: 'Failed to take photo.',
  galleryErrorMessage: 'Failed to open photo library.',
  cropErrorMessage: 'Failed to crop image.',
  extractErrorMessage: 'Failed to extract colors from image.',
  noColorsTitle: 'No Colors',
  noColorsMessage: 'Please extract colors from an image first.',
  savedTitle: 'Saved!',
  savedMessage: 'Palette saved to library.',
  shareDialogTitle: 'Share Palette',
  exportErrorMessage: 'Failed to export palette.',
  exportPngErrorMessage: 'Failed to export as PNG.',
  untitledPaletteLabel: 'Untitled Palette',
  copiedPrefix: 'Copied',
  settingLabel: 'Setting',
  stylePresetLabel: 'Style Preset',
  extractionMethodLabel: 'Extraction Method',
  colorCountLabel: 'Color Count',
  colorVisionLabel: 'Color Vision',
  copyButtonLabel: 'Copy',
  variationsLabel: 'Variations',
  lightnessLabel: 'Value',
  hueShiftLabel: 'Value + Hue',
  harmonyLabel: 'Harmony',
  histogramTitle: 'LUMINOSITY',
  histogramContrastLabel: 'contrast',
  histogramDarkLabel: 'Dark',
  histogramMidLabel: 'Mid',
  histogramBrightLabel: 'Bright',
  histogramAverageLabel: 'Avg',
  swatchHintTitle: 'Tap a palette swatch',
  swatchHintSubtitle: 'Open details, variations, and harmony instantly.',
  emptyGuideTitle: 'Main Screen Guide',
  emptyGuideAddImage: 'Add artwork from camera or gallery.',
  emptyGuideExpandSettings: 'Use the right summary button to expand settings.',
  emptyGuideTapSwatch: 'Tap extracted swatches to open detailed info.',
};

export const getHomeLocalization = (language: AppLanguage): HomeLocalization => {
  return language === 'ko' ? KO_LOCALIZATION : EN_LOCALIZATION;
};
