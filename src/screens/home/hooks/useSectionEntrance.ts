import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  type AnimatedStyle,
} from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';

interface UseSectionEntranceOptions {
  delay?: number;
  translateY?: number;
}

export function useSectionEntrance({
  delay = 0,
  translateY = 16,
}: UseSectionEntranceOptions = {}): AnimatedStyle<ViewStyle> {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withSpring(1, { damping: 18, stiffness: 140 }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * translateY }],
  }));

  return animatedStyle;
}
