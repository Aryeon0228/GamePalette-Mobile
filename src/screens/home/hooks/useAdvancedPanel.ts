import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

export function useAdvancedPanel() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAdvancedMounted, setIsAdvancedMounted] = useState(false);
  const advancedPanelAnim = useRef(new Animated.Value(0)).current;
  const advancedPanelAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const animateAdvancedPanel = useCallback((toValue: 0 | 1, onComplete?: () => void) => {
    advancedPanelAnimationRef.current?.stop();
    const animation = Animated.timing(advancedPanelAnim, {
      toValue,
      duration: toValue === 1 ? 220 : 170,
      easing: toValue === 1 ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    advancedPanelAnimationRef.current = animation;
    animation.start(({ finished }) => {
      if (advancedPanelAnimationRef.current === animation) {
        advancedPanelAnimationRef.current = null;
      }
      if (finished && onComplete) {
        onComplete();
      }
    });
  }, [advancedPanelAnim]);

  const openAdvancedPanel = useCallback(() => {
    if (showAdvanced && isAdvancedMounted) return;
    setIsAdvancedMounted(true);
    setShowAdvanced(true);
    requestAnimationFrame(() => {
      animateAdvancedPanel(1);
    });
  }, [animateAdvancedPanel, isAdvancedMounted, showAdvanced]);

  const closeAdvancedPanel = useCallback(() => {
    if (!isAdvancedMounted) return;
    setShowAdvanced(false);
    animateAdvancedPanel(0, () => {
      setIsAdvancedMounted(false);
    });
  }, [animateAdvancedPanel, isAdvancedMounted]);

  const toggleAdvancedPanel = useCallback(() => {
    if (showAdvanced) {
      closeAdvancedPanel();
      return;
    }
    openAdvancedPanel();
  }, [closeAdvancedPanel, openAdvancedPanel, showAdvanced]);

  useEffect(() => {
    return () => {
      advancedPanelAnimationRef.current?.stop();
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
