import React, { useRef, useEffect } from 'react';
import { Pressable, Animated, StyleProp, ViewStyle } from 'react-native';
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
    const scale = useRef(new Animated.Value(restScale)).current;

    useEffect(() => {
        if (!isBreathing) {
            scale.setValue(restScale);
            return;
        }
        const breatheAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scale, {
                    toValue: restScale * 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: restScale,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );
        breatheAnimation.start();

        return () => {
            breatheAnimation.stop();
        };
    }, [isBreathing, scale, restScale]);

    const handlePressIn = () => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.spring(scale, {
            toValue: pressedScale,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
        onPressIn?.();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: restScale,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
        onPressOut?.();
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <Animated.View style={[style, { transform: [{ scale }] }]}>
                {children}
            </Animated.View>
        </Pressable>
    );
}
