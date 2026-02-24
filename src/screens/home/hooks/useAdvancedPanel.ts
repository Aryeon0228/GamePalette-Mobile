import { useCallback, useEffect, useState } from 'react';
import {
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';

export function useAdvancedPanel() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAdvancedMounted, setIsAdvancedMounted] = useState(false);
  const advancedPanelAnim = useSharedValue(0);

  const openAdvancedPanel = useCallback(() => {
    if (showAdvanced && isAdvancedMounted) return;
    setIsAdvancedMounted(true);
    setShowAdvanced(true);
    requestAnimationFrame(() => {
      advancedPanelAnim.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    });
  }, [advancedPanelAnim, isAdvancedMounted, showAdvanced]);

  const closeAdvancedPanel = useCallback(() => {
    if (!isAdvancedMounted) return;
    setShowAdvanced(false);
    advancedPanelAnim.value = withTiming(0, {
      duration: 170,
      easing: Easing.in(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(setIsAdvancedMounted)(false);
      }
    });
  }, [advancedPanelAnim, isAdvancedMounted]);

  const toggleAdvancedPanel = useCallback(() => {
    if (showAdvanced) {
      closeAdvancedPanel();
      return;
    }
    openAdvancedPanel();
  }, [closeAdvancedPanel, openAdvancedPanel, showAdvanced]);

  useEffect(() => {
    return () => {
      cancelAnimation(advancedPanelAnim);
    };
  }, []);

  return {
    showAdvanced,
    isAdvancedMounted,
    advancedPanelAnim,
    openAdvancedPanel,
    closeAdvancedPanel,
    toggleAdvancedPanel,
  };
}
