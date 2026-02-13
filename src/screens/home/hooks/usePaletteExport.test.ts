import { Alert } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';

import { usePaletteExport } from './usePaletteExport';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: '/cache/',
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

describe('usePaletteExport', () => {
  const onHapticSuccess = jest.fn();
  const onShowToast = jest.fn();
  const onCloseModal = jest.fn();
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  const clipboardMock = Clipboard.setStringAsync as jest.MockedFunction<typeof Clipboard.setStringAsync>;
  const isAvailableMock = Sharing.isAvailableAsync as jest.MockedFunction<typeof Sharing.isAvailableAsync>;
  const shareMock = Sharing.shareAsync as jest.MockedFunction<typeof Sharing.shareAsync>;
  const writeMock = FileSystem.writeAsStringAsync as jest.MockedFunction<typeof FileSystem.writeAsStringAsync>;
  const deleteMock = FileSystem.deleteAsync as jest.MockedFunction<typeof FileSystem.deleteAsync>;

  beforeEach(() => {
    jest.clearAllMocks();
    isAvailableMock.mockResolvedValue(true);
    shareMock.mockResolvedValue(undefined);
    writeMock.mockResolvedValue();
    deleteMock.mockResolvedValue({ exists: false, isDirectory: false } as any);
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it('copies css palette content to clipboard and closes modal', async () => {
    const { result } = renderHook(() =>
      usePaletteExport({
        processedColors: ['#112233', '#445566'],
        paletteName: '',
        untitledPaletteLabel: 'Untitled',
        shareDialogTitle: 'Share',
        errorTitle: 'Error',
        exportPngErrorMessage: 'PNG failed',
        exportErrorMessage: 'Export failed',
        copiedPrefix: 'Copied',
        isKorean: false,
        onHapticSuccess,
        onShowToast,
        onCloseModal,
      })
    );

    await act(async () => {
      await result.current.copyToClipboard('css');
    });

    expect(clipboardMock).toHaveBeenCalledWith('--color-1: #112233;\n--color-2: #445566;');
    expect(onHapticSuccess).toHaveBeenCalled();
    expect(onShowToast).toHaveBeenCalledWith('Copied CSS');
    expect(onCloseModal).toHaveBeenCalled();
  });

  it('exports css text file then cleans up temp file', async () => {
    const { result } = renderHook(() =>
      usePaletteExport({
        processedColors: ['#abcdef'],
        paletteName: '',
        untitledPaletteLabel: 'Untitled',
        shareDialogTitle: 'Share',
        errorTitle: 'Error',
        exportPngErrorMessage: 'PNG failed',
        exportErrorMessage: 'Export failed',
        copiedPrefix: 'Copied',
        isKorean: false,
        onHapticSuccess,
        onShowToast,
        onCloseModal,
      })
    );

    act(() => {
      result.current.setExportFormat('css');
    });

    await act(async () => {
      await result.current.handleExportConfirm();
    });

    expect(writeMock).toHaveBeenCalledWith('/cache/palette.css', expect.stringContaining('--color-1: #abcdef;'));
    expect(shareMock).toHaveBeenCalledWith('/cache/palette.css');
    expect(deleteMock).toHaveBeenCalledWith('/cache/palette.css', { idempotent: true });
    expect(onCloseModal).toHaveBeenCalled();
  });

  it('exports png when capture ref is available', async () => {
    const { result } = renderHook(() =>
      usePaletteExport({
        processedColors: ['#123456'],
        paletteName: '',
        untitledPaletteLabel: 'Untitled',
        shareDialogTitle: 'Share Palette',
        errorTitle: 'Error',
        exportPngErrorMessage: 'PNG failed',
        exportErrorMessage: 'Export failed',
        copiedPrefix: 'Copied',
        isKorean: false,
        onHapticSuccess,
        onShowToast,
        onCloseModal,
      })
    );

    act(() => {
      result.current.paletteCardRef.current = {
        capture: jest.fn().mockResolvedValue('file://palette.png'),
      } as any;
      result.current.setExportFormat('png');
    });

    await act(async () => {
      await result.current.handleExportConfirm();
    });

    expect(shareMock).toHaveBeenCalledWith(
      'file://palette.png',
      expect.objectContaining({ mimeType: 'image/png', dialogTitle: 'Share Palette' })
    );
    expect(onCloseModal).toHaveBeenCalled();
  });
});
