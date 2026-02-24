import React from 'react';
import { View, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './HomeScreen.styles';

interface CameraModalProps {
  visible: boolean;
  cameraRef: React.RefObject<CameraView | null>;
  onClose: () => void;
  onTakePicture: () => void;
  onHapticLight: () => void;
}

function CameraModal({
  visible,
  cameraRef,
  onClose,
  onTakePicture,
  onHapticLight,
}: CameraModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />
        <SafeAreaView style={styles.cameraOverlay}>
          <TouchableOpacity
            style={styles.cameraCloseButton}
            onPress={() => {
              onHapticLight();
              onClose();
            }}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.cameraBottomControls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={onTakePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default React.memo(CameraModal);
