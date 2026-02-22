import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLOR_TOKENS, RADIUS_TOKENS, SHADOW_TOKENS } from '../constants/designTokens';

export interface GlassPanelProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    specularHighlight?: boolean;
}

export function GlassPanel({
    children,
    style,
    intensity = 50,
    tint = 'default',
    specularHighlight = true
}: GlassPanelProps) {
    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint={tint as any} style={StyleSheet.absoluteFillObject} />
            {specularHighlight && (
                <View style={styles.specularHighlight} pointerEvents="none" />
            )}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: RADIUS_TOKENS.xl,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.02)', // tiny bit of base color
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)', // basic glass border
        ...SHADOW_TOKENS.glassmorphism,
    },
    specularHighlight: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: RADIUS_TOKENS.xl,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    content: {
        flex: 1,
    }
});
