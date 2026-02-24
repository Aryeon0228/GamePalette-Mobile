import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLOR_TOKENS, RADIUS_TOKENS, SHADOW_TOKENS, OVERLAY_TOKENS } from '../constants/designTokens';

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
    tint = 'light',
    specularHighlight = true
}: GlassPanelProps) {
    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFillObject} />
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
        backgroundColor: OVERLAY_TOKENS.glassWhiteFaint,
        borderWidth: 1,
        borderColor: OVERLAY_TOKENS.glassWhiteThin,
        ...SHADOW_TOKENS.glassmorphism,
    },
    specularHighlight: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: RADIUS_TOKENS.xl,
        borderTopWidth: 1.5,
        borderLeftWidth: 1,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderColor: OVERLAY_TOKENS.glassWhiteBorder,
    },
    content: {
        flex: 1,
    }
});
