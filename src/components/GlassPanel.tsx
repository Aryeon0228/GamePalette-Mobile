import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { OVERLAY_TOKENS, BLUR_INTENSITY } from '../constants/designTokens';

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
    intensity = BLUR_INTENSITY.glass,
    tint = 'light',
    specularHighlight = true
}: GlassPanelProps) {
    return (
        <View style={[styles.container, style]}>
            {/* Blur/gradient effects — clipped separately */}
            <View style={styles.effectsClip} pointerEvents="none">
                <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFillObject} />
                {specularHighlight && (
                    <>
                        {/* Top edge — radial fade down + right */}
                        <Svg style={styles.specularTop}>
                            <Defs>
                                <RadialGradient id="topSpec" cx="0%" cy="0%" rx="100%" ry="100%">
                                    <Stop offset="0" stopColor="rgb(241,212,159)" stopOpacity="1" />
                                    <Stop offset="1" stopColor="rgb(241,212,159)" stopOpacity="0" />
                                </RadialGradient>
                            </Defs>
                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#topSpec)" />
                        </Svg>
                        {/* Left edge — radial fade right + down */}
                        <Svg style={styles.specularLeft}>
                            <Defs>
                                <RadialGradient id="leftSpec" cx="0%" cy="0%" rx="100%" ry="100%">
                                    <Stop offset="0" stopColor="rgb(241,212,159)" stopOpacity="1" />
                                    <Stop offset="1" stopColor="rgb(241,212,159)" stopOpacity="0" />
                                </RadialGradient>
                            </Defs>
                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#leftSpec)" />
                        </Svg>
                        {/* Right edge — radial fade left + down */}
                        <Svg style={styles.specularRight}>
                            <Defs>
                                <RadialGradient id="rightSpec" cx="100%" cy="100%" rx="100%" ry="100%">
                                    <Stop offset="0" stopColor="#fff" stopOpacity="0.5" />
                                    <Stop offset="0.6" stopColor="#fff" stopOpacity="0.15" />
                                    <Stop offset="1" stopColor="#fff" stopOpacity="0.05" />
                                </RadialGradient>
                            </Defs>
                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#rightSpec)" />
                        </Svg>
                        {/* Bottom edge — radial fade up + left */}
                        <Svg style={styles.specularBottom}>
                            <Defs>
                                <RadialGradient id="bottomSpec" cx="100%" cy="100%" rx="100%" ry="100%">
                                    <Stop offset="0" stopColor="#fff" stopOpacity="0.5" />
                                    <Stop offset="0.6" stopColor="#fff" stopOpacity="0.15" />
                                    <Stop offset="1" stopColor="#fff" stopOpacity="0.05" />
                                </RadialGradient>
                            </Defs>
                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#bottomSpec)" />
                        </Svg>
                        </>
                )}
            </View>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        backgroundColor: OVERLAY_TOKENS.blurSurfaceMedium,
        // @ts-ignore — boxShadow supported in RN 0.76+
        boxShadow: [
            { offsetX: 1, offsetY: 1, blurRadius: 3, spreadDistance: 0, color: 'rgba(237,210,137,0.5)' },
            { offsetX: 7, offsetY: 7, blurRadius: 20, spreadDistance: -1, color: 'rgb(243,223,188)' },
            { offsetX: 10, offsetY: 10, blurRadius: 8, spreadDistance: 0, color: 'rgb(225,225,225)' },
        ],
    },
    effectsClip: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 10,
        overflow: 'hidden',
    },
    specularTop: {
        position: 'absolute',
        top: -1,
        left: 0,
        right: 0,
        height: '6%',
    },
    specularLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '2%',
    },
    specularRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '4.5%',
    },
    specularBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '6%',
    },
    content: {
        flex: 1,
    }
});
