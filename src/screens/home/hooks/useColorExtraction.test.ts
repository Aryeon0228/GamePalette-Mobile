import { Alert } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useColorExtraction } from './useColorExtraction';
import { analyzeLuminosityHistogram, extractColorsFromImage } from '../../../lib/colorExtractor';

jest.mock('../../../lib/colorExtractor', () => ({
  extractColorsFromImage: jest.fn(),
  analyzeLuminosityHistogram: jest.fn(),
}));

describe('useColorExtraction', () => {
  const setCurrentColors = jest.fn();
  const setCurrentImageUri = jest.fn();
  const setExtractionMethod = jest.fn();
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const extractMock = extractColorsFromImage as jest.MockedFunction<typeof extractColorsFromImage>;
  const histogramMock = analyzeLuminosityHistogram as jest.MockedFunction<typeof analyzeLuminosityHistogram>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('extracts colors and updates histogram for a selected image', async () => {
    extractMock.mockResolvedValue(['#111111', '#222222']);
    histogramMock.mockResolvedValue({
      bins: [100],
      average: 120,
      contrast: 60,
      darkPercent: 30,
      midPercent: 40,
      brightPercent: 30,
      minValue: 10,
      maxValue: 220,
    });

    const { result } = renderHook(() =>
      useColorExtraction({
        colorCount: 5,
        extractionMethod: 'histogram',
        currentImageUri: null,
        setCurrentColors,
        setCurrentImageUri,
        setExtractionMethod,
        errorTitle: 'Error',
        extractErrorMessage: 'Failed',
      })
    );

    await act(async () => {
      await result.current.extractColors('file://image.png');
    });

    expect(setCurrentImageUri).toHaveBeenCalledWith('file://image.png');
    expect(setCurrentColors).toHaveBeenCalledWith(['#111111', '#222222']);

    await waitFor(() => {
      expect(result.current.histogram).toMatchObject({ average: 120, contrast: 60 });
    });
    expect(result.current.isExtracting).toBe(false);
  });

  it('changes extraction method and re-extracts when current image exists', async () => {
    extractMock.mockResolvedValue(['#aaaaaa']);
    histogramMock.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useColorExtraction({
        colorCount: 4,
        extractionMethod: 'kmeans',
        currentImageUri: 'file://existing.png',
        setCurrentColors,
        setCurrentImageUri,
        setExtractionMethod,
        errorTitle: 'Error',
        extractErrorMessage: 'Failed',
      })
    );

    await act(async () => {
      await result.current.handleMethodChange('histogram');
    });

    expect(setExtractionMethod).toHaveBeenCalledWith('histogram');
    expect(extractMock).toHaveBeenCalledWith('file://existing.png', 4, 'histogram');
    expect(setCurrentColors).toHaveBeenCalledWith(['#aaaaaa']);
  });

  it('shows alert on extraction failure for latest request', async () => {
    extractMock.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() =>
      useColorExtraction({
        colorCount: 3,
        extractionMethod: 'histogram',
        currentImageUri: null,
        setCurrentColors,
        setCurrentImageUri,
        setExtractionMethod,
        errorTitle: 'Error',
        extractErrorMessage: 'Failed to extract',
      })
    );

    await act(async () => {
      await result.current.extractColors('file://error.png');
    });

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to extract');
  });
});
