import { useCallback, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface UseCameraCaptureParams {
  onImageCaptured: (imageUri: string) => Promise<void>;
  onPermissionDenied: () => void;
  onCaptureError: () => void;
  onBeforeCapture?: () => void;
  onCaptureSuccess?: () => void;
}

export function useCameraCapture({
  onImageCaptured,
  onPermissionDenied,
  onCaptureError,
  onBeforeCapture,
  onCaptureSuccess,
}: UseCameraCaptureParams) {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const openCamera = useCallback(async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        onPermissionDenied();
        return;
      }
    }
    setShowCamera(true);
  }, [cameraPermission?.granted, onPermissionDenied, requestCameraPermission]);

  const closeCamera = useCallback(() => {
    setShowCamera(false);
  }, []);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return;
    onBeforeCapture?.();
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      setShowCamera(false);
      if (photo?.uri) {
        await onImageCaptured(photo.uri);
        onCaptureSuccess?.();
      }
    } catch (error) {
      console.error('Camera error:', error);
      onCaptureError();
    }
  }, [onBeforeCapture, onImageCaptured, onCaptureSuccess, onCaptureError]);

  return {
    showCamera,
    cameraRef,
    openCamera,
    closeCamera,
    takePicture,
  };
}
