import { Alert } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';

import { useImageImportAndCrop } from './useImageImportAndCrop';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { PNG: 'png', JPEG: 'jpeg' },
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: '/cache/',
  writeAsStringAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
}));

jest.mock('upng-js', () => ({
  decode: jest.fn(),
  toRGBA8: jest.fn(),
  encode: jest.fn(),
}));

describe('useImageImportAndCrop', () => {
  const onImageReady = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined);
  const onCropSuccess = jest.fn();
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  const permissionMock = ImagePicker.requestMediaLibraryPermissionsAsync as jest.MockedFunction<typeof ImagePicker.requestMediaLibraryPermissionsAsync>;
  const launchMock = ImagePicker.launchImageLibraryAsync as jest.MockedFunction<typeof ImagePicker.launchImageLibraryAsync>;
  const manipulateMock = ImageManipulator.manipulateAsync as jest.MockedFunction<typeof ImageManipulator.manipulateAsync>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it('shows permission alert when gallery permission is denied', async () => {
    permissionMock.mockResolvedValue({ granted: false, canAskAgain: true, expires: 'never', status: 'denied' } as any);

    const { result } = renderHook(() =>
      useImageImportAndCrop({
        onImageReady,
        onCropSuccess,
        permissionTitle: 'Permission',
        galleryPermissionMessage: 'Need gallery access',
        errorTitle: 'Error',
        galleryErrorMessage: 'Gallery error',
        cropErrorMessage: 'Crop error',
      })
    );

    await act(async () => {
      await result.current.pickFromGallery();
    });

    expect(alertSpy).toHaveBeenCalledWith('Permission', 'Need gallery access');
    expect(result.current.showCropModal).toBe(false);
  });

  it('opens crop modal when gallery image is selected', async () => {
    permissionMock.mockResolvedValue({ granted: true, canAskAgain: true, expires: 'never', status: 'granted' } as any);
    launchMock.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://image.jpg', width: 1200, height: 800 }],
    } as any);

    const { result } = renderHook(() =>
      useImageImportAndCrop({
        onImageReady,
        onCropSuccess,
        permissionTitle: 'Permission',
        galleryPermissionMessage: 'Need gallery access',
        errorTitle: 'Error',
        galleryErrorMessage: 'Gallery error',
        cropErrorMessage: 'Crop error',
      })
    );

    await act(async () => {
      await result.current.pickFromGallery();
    });

    expect(result.current.showCropModal).toBe(true);
    expect(result.current.cropSourceAsset).toEqual({
      uri: 'file://image.jpg',
      width: 1200,
      height: 800,
    });
  });

  it('applies rectangular crop and forwards cropped uri', async () => {
    permissionMock.mockResolvedValue({ granted: true, canAskAgain: true, expires: 'never', status: 'granted' } as any);
    launchMock.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://image.jpg', width: 1200, height: 800 }],
    } as any);
    manipulateMock.mockResolvedValue({ uri: 'file://cropped.jpg' } as any);

    const { result } = renderHook(() =>
      useImageImportAndCrop({
        onImageReady,
        onCropSuccess,
        permissionTitle: 'Permission',
        galleryPermissionMessage: 'Need gallery access',
        errorTitle: 'Error',
        galleryErrorMessage: 'Gallery error',
        cropErrorMessage: 'Crop error',
      })
    );

    await act(async () => {
      await result.current.pickFromGallery();
    });

    await act(async () => {
      await result.current.handleCropConfirm({
        mode: 'rect',
        cropArea: { originX: 0, originY: 0, width: 200, height: 200 },
      });
    });

    expect(onImageReady).toHaveBeenCalledWith('file://cropped.jpg');
    expect(onCropSuccess).toHaveBeenCalled();
    expect(result.current.showCropModal).toBe(false);
    expect(result.current.cropSourceAsset).toBeNull();
    expect(result.current.isApplyingCrop).toBe(false);
  });
});
