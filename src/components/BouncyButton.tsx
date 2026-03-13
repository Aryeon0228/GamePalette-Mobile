import React, { useEffect, useMemo } from 'react';
import { Pressable, View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    cancelAnimation,
    interpolate,
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
    isFloating?: boolean;
    floatingDistance?: number;
    floatingDuration?: number;
    floatingShadow?: boolean;
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
    isFloating = false,
    floatingDistance = 4,
    floatingDuration = 2000,
    floatingShadow = false,
    onPressIn,
    onPressOut,
    onPress,
}: BouncyButtonProps) {
    const scale = useSharedValue(restScale);
    const translateY = useSharedValue(0);
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

    useEffect(() => {
        if (!isFloating) {
            cancelAnimation(translateY);
            translateY.value = 0;
            return;
        }
        translateY.value = withRepeat(
            withSequence(
                withTiming(-floatingDistance, { duration: floatingDuration }),
                withTiming(floatingDistance, { duration: floatingDuration }),
            ),
            -1,
            true,
        );
        return () => {
            cancelAnimation(translateY);
        };
    }, [isFloating, floatingDistance, floatingDuration]);

    const handlePressIn = () => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        cancelAnimation(scale);
        scale.value = withTiming(pressedScale, { duration: 80 });
        onPressIn?.();
    };

    const handlePressOut = () => {
        scale.value = withTiming(restScale, { duration: 120 });
        onPressOut?.();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { translateY: translateY.value }],
    }));

    const shadowStyle = useAnimatedStyle(() => {
        // 버튼이 위로 뜰수록(-) 그림자가 커지고 연해짐
        const progress = interpolate(
            translateY.value,
            [-floatingDistance, 0, floatingDistance],
            [1, 0.5, 0],
        );
        return {
            opacity: interpolate(progress, [0, 0.5, 1], [0.35, 0.2, 0.12]),
            transform: [
                { scaleX: interpolate(progress, [0, 0.5, 1], [0.85, 0.9, 0.96]) },
                { scaleY: interpolate(progress, [0, 0.5, 1], [0.5, 0.55, 0.65]) },
                { translateY: interpolate(progress, [0, 0.5, 1], [0, 2, 5]) },
            ],
        };
    });

    const showShadow = isFloating && floatingShadow;

    return (
        <Pressable
            style={outer}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <View style={{ flex: 1 }}>
                {showShadow && (
                    <Animated.View
                        pointerEvents="none"
                        style={[floatShadowStyles.shadow, shadowStyle]}
                    />
                )}
                <Animated.View style={[{ flex: 1 }, inner, animatedStyle]}>
                    {children}
                </Animated.View>
            </View>
        </Pressable>
    );
}

const floatShadowStyles = StyleSheet.create({
    shadow: {
        position: 'absolute',
        bottom: -2,
        left: '12%',
        right: '12%',
        height: 8,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 6,
    },
});
