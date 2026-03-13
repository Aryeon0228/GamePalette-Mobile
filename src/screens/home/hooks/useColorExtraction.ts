import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import {
  analyzeLuminosityHistogram,
  extractColorsFromImage,
  type ExtractionMethod,
  type LuminosityHistogram,
} from '../../../lib/colorExtractor';

interface UseColorExtractionParams {
  colorCount: number;
  extractionMethod: ExtractionMethod;
  currentImageUri: string | null;
  setCurrentColors: (colors: string[]) => void;
  setCurrentImageUri: (uri: string | null) => void;
  setExtractionMethod: (method: ExtractionMethod) => void;
  errorTitle: string;
  extractErrorMessage: string;
}

export function useColorExtraction({
  colorCount,
  extractionMethod,
  currentImageUri,
  setCurrentColors,
  setCurrentImageUri,
  setExtractionMethod,
  errorTitle,
  extractErrorMessage,
}: UseColorExtractionParams) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [histogram, setHistogram] = useState<LuminosityHistogram | null>(null);
  const extractRequestRef = useRef(0);
  const histogramRequestRef = useRef(0);

  const doExtract = useCallback(
    async (imageUri: string, count: number, method: ExtractionMethod) => {
      const requestId = ++extractRequestRef.current;
      setIsExtracting(true);
      try {
        const colors = await extractColorsFromImage(imageUri, count, method);
        if (requestId !== extractRequestRef.current) return;
        setCurrentColors(colors);
      } catch (error) {
        if (requestId === extractRequestRef.current) {
          if (__DEV__) console.error('Error extracting colors:', error);
          Alert.alert(errorTitle, extractErrorMessage);
        }
      } finally {
        if (requestId === extractRequestRef.current) {
          setIsExtracting(false);
        }
      }
    },
    [errorTitle, extractErrorMessage, setCurrentColors]
  );

  const analyzeHistogram = useCallback(async (imageUri: string) => {
    const requestId = ++histogramRequestRef.current;
    try {
      const histogramData = await analyzeLuminosityHistogram(imageUri);
      if (requestId !== histogramRequestRef.current) return;
      setHistogram(histogramData);
    } catch (error) {
      if (requestId === histogramRequestRef.current) {
        if (__DEV__) console.error('Histogram analysis error:', error);
        setHistogram(null);
      }
    }
  }, []);

  const extractColors = useCallback(
    async (imageUri: string) => {
      setCurrentImageUri(imageUri);
      setHistogram(null);
      await doExtract(imageUri, colorCount, extractionMethod);
      void analyzeHistogram(imageUri);
    },
    [analyzeHistogram, colorCount, doExtract, extractionMethod, setCurrentImageUri]
  );

  const handleMethodChange = useCallback(
    async (method: ExtractionMethod) => {
      setExtractionMethod(method);
      if (currentImageUri) {
        await doExtract(currentImageUri, colorCount, method);
      }
    },
    [colorCount, currentImageUri, doExtract, setExtractionMethod]
  );

  const handleReExtract = useCallback(async () => {
    if (!currentImageUri) return;
    await doExtract(currentImageUri, colorCount, extractionMethod);
  }, [colorCount, currentImageUri, doExtract, extractionMethod]);

  const reExtractWithCount = useCallback(
    (newCount: number) => {
      if (!currentImageUri) return;
      void doExtract(currentImageUri, newCount, extractionMethod);
    },
    [currentImageUri, doExtract, extractionMethod]
  );

  // 앱 시작 시 이미지가 있지만 히스토그램이 없으면 자동 분석
  useEffect(() => {
    if (currentImageUri && !histogram) {
      void analyzeHistogram(currentImageUri);
    }
  }, [currentImageUri]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isExtracting,
    histogram,
    extractColors,
    handleMethodChange,
    handleReExtract,
    reExtractWithCount,
  };
}
