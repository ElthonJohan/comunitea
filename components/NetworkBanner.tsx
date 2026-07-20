/**
 * NetworkBanner.tsx
 *
 * Barra discreta que aparece en la parte superior cuando el dispositivo está offline.
 * Diseño no intrusivo: no interrumpe la experiencia del niño.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useNetwork } from '../context/NetworkContext';

export function NetworkBanner() {
    const { isConnected } = useNetwork();
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isConnected ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isConnected]);

    return (
        <Animated.View
            style={[
                styles.banner,
                {
                    opacity: slideAnim,
                    transform: [
                        {
                            translateY: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-30, 0],
                            }),
                        },
                    ],
                },
            ]}
            pointerEvents="none"
        >
            <View style={styles.dot} />
            <Text style={styles.text}>Sin conexión · modo offline</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#616161',
        paddingVertical: 4,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFA726',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
});
