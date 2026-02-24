import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleProp, ViewStyle, StyleSheet } from 'react-native';
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

// Style keys that affect layout positioning (belong on the outer Pressable)
const LAYOUT_KEYS = new Set([
    'flex', 'flexGrow', 'flexShrink', 'flexBasis',
    'alignSelf',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'marginHorizontal', 'marginVertical', 'marginStart', 'marginEnd',
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'position', 'top', 'right', 'bottom', 'left',
    'start', 'end',
    'zIndex',
]);

function splitStyle(style: StyleProp<ViewStyle>): { outer: ViewStyle; inner: ViewStyle } {
    const flat = StyleSheet.flatten(style) || {};
    const outer: Record<string, unknown> = {};
    const inner: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(flat)) {
        if (LAYOUT_KEYS.has(key)) {
            outer[key] = value;
        } else {
            inner[key] = value;
        }
    }
    return { outer: outer as ViewStyle, inner: inner as ViewStyle };
}

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
    const { outer, inner } = useMemo(() => splitStyle(style), [style]);

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
            style={outer}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <Animated.View style={[inner, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
}
