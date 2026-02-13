import { useCallback, useState } from 'react';
import { Alert, Image as RNImage } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import UPNG from 'upng-js';

import { type CropSelectionPayload, type NormalizedPoint } from '../modals/ImageCropModal';

export interface CropSourceAsset {
  uri: string;
  width: number;
  height: number;
}

interface UseImageImportAndCropParams {
  onImageReady: (imageUri: string) => Promise<void>;
  onCropSuccess: () => void;
  permissionTitle: string;
  galleryPermissionMessage: string;
  errorTitle: string;
  galleryErrorMessage: string;
  cropErrorMessage: string;
}

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  const CHUNK_SIZE = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const end = Math.min(i + CHUNK_SIZE, bytes.length);
    let chunk = '';
    for (let j = i; j < end; j++) {
      chunk += String.fromCharCode(bytes[j]);
    }
    binary += chunk;
  }
  return btoa(binary);
};

const pointInPolygon = (x: number, y: number, polygon: NormalizedPoint[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersects = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
};

const createLassoMaskedImage = async (
  imageUri: string,
  normalizedPath: NormalizedPoint[]
): Promise<string> => {
  if (normalizedPath.length < 3) return imageUri;

  const maxMaskDimension = 1400;
  const { width: sourceWidth, height: sourceHeight } = await new Promise<{ width: number; height: number }>(
    (resolve, reject) => {
      RNImage.getSize(
        imageUri,
        (width, height) => resolve({ width, height }),
        reject
      );
    }
  );
  const shouldResize = sourceWidth > maxMaskDimension || sourceHeight > maxMaskDimension;
  const resizeActions = shouldResize
    ? [{ resize: sourceWidth >= sourceHeight ? { width: maxMaskDimension } : { height: maxMaskDimension } }]
    : [];

  const pngImage = await ImageManipulator.manipulateAsync(
    imageUri,
    resizeActions,
    {
      compress: 1,
      format: ImageManipulator.SaveFormat.PNG,
      base64: true,
    }
  );

  if (!pngImage.base64) {
    return imageUri;
  }

  const bytes = base64ToBytes(pngImage.base64);
  const decoded = UPNG.decode(bytes.buffer as ArrayBuffer);
  const width = decoded.width;
  const height = decoded.height;
  const rgbaData = new Uint8Array(UPNG.toRGBA8(decoded)[0]);

  const polygon = normalizedPath.map((point) => ({
    x: clamp01(point.x) * Math.max(width - 1, 1),
    y: clamp01(point.y) * Math.max(height - 1, 1),
  }));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!pointInPolygon(x + 0.5, y + 0.5, polygon)) {
        rgbaData[(y * width + x) * 4 + 3] = 0;
      }
    }
  }

  const encoded = UPNG.encode([rgbaData.buffer], width, height, 0);
  const encodedBytes = new Uint8Array(encoded as ArrayBuffer);
  const encodedBase64 = bytesToBase64(encodedBytes);
  if (!FileSystem.cacheDirectory) {
    throw new Error('Cache directory is unavailable');
  }
  const maskedUri = `${FileSystem.cacheDirectory}lasso-mask-${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(maskedUri, encodedBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return maskedUri;
};

const resolveImageSize = async (
  uri: string,
  width?: number,
  height?: number
): Promise<{ width: number; height: number }> => {
  if (width && height) {
    return { width, height };
  }
  return new Promise((resolve, reject) => {
    RNImage.getSize(
      uri,
      (resolvedWidth, resolvedHeight) => resolve({ width: resolvedWidth, height: resolvedHeight }),
      reject
    );
  });
};

export function useImageImportAndCrop({
  onImageReady,
  onCropSuccess,
  permissionTitle,
  galleryPermissionMessage,
  errorTitle,
  galleryErrorMessage,
  cropErrorMessage,
}: UseImageImportAndCropParams) {
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropSourceAsset, setCropSourceAsset] = useState<CropSourceAsset | null>(null);
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);

  const pickFromGallery = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(permissionTitle, galleryPermissionMessage);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const { width, height } = await resolveImageSize(asset.uri, asset.width, asset.height);
        setCropSourceAsset({
          uri: asset.uri,
          width,
          height,
        });
        setShowCropModal(true);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert(errorTitle, galleryErrorMessage);
    }
  }, [errorTitle, galleryErrorMessage, galleryPermissionMessage, permissionTitle]);

  const handleCropCancel = useCallback(() => {
    setShowCropModal(false);
    setCropSourceAsset(null);
  }, []);

  const handleCropConfirm = useCallback(async (selection: CropSelectionPayload) => {
    if (!cropSourceAsset) return;
    setIsApplyingCrop(true);
    try {
      const cropped = await ImageManipulator.manipulateAsync(
        cropSourceAsset.uri,
        [{ crop: selection.cropArea }],
        {
          compress: 1,
          format: selection.mode === 'lasso' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
        }
      );
      let processedUri = cropped.uri;
      if (selection.mode === 'lasso' && selection.normalizedPath && selection.normalizedPath.length >= 3) {
        processedUri = await createLassoMaskedImage(cropped.uri, selection.normalizedPath);
      }
      setShowCropModal(false);
      setCropSourceAsset(null);
      await onImageReady(processedUri);
      onCropSuccess();
    } catch (error) {
      console.error('Crop error:', error);
      Alert.alert(errorTitle, cropErrorMessage);
    } finally {
      setIsApplyingCrop(false);
    }
  }, [cropErrorMessage, cropSourceAsset, errorTitle, onCropSuccess, onImageReady]);

  return {
    showCropModal,
    cropSourceAsset,
    isApplyingCrop,
    pickFromGallery,
    handleCropCancel,
    handleCropConfirm,
  };
}
