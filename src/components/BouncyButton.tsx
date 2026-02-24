import React, { useEffect } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withRepeat,
    withSequence,
    cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export interface BouncyButtonProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    pressedScale?: number;
    restScale?: number;
    hapticFeedback?: boolean;
    isBreathing?: boolean;
    onPressIn?: () => void;
    onPressOut?: () => void;
    onPress?: () => void;
}

export function BouncyButton({
    children,
    style,
    pressedScale = 0.94,
    restScale = 1,
    hapticFeedback = false,
    isBreathing = false,
    onPressIn,
    onPressOut,
    onPress,
}: BouncyButtonProps) {
    const scale = useSharedValue(restScale);

    useEffect(() => {
        if (!isBreathing) {
            cancelAnimation(scale);
            scale.value = restScale;
            return;
        }
        scale.value = withRepeat(
            withSequence(
                withTiming(restScale * 1.05, { duration: 1500 }),
                withTiming(restScale, { duration: 1500 }),
            ),
            -1,
        );

        return () => {
            cancelAnimation(scale);
        };
    }, [isBreathing, restScale]);

    const handlePressIn = () => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        cancelAnimation(scale);
        scale.value = withSpring(pressedScale, { damping: 12, stiffness: 200 });
        onPressIn?.();
    };

    const handlePressOut = () => {
        scale.value = withSpring(restScale, { damping: 12, stiffness: 200 });
        onPressOut?.();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <Animated.View style={[style, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
}
