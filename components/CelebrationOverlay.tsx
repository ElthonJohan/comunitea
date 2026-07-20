/**
 * CelebrationOverlay.tsx
 * C2: Overlay de celebración con confetti cuando el niño avanza de sub-nivel.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Colors } from '../constants/Colors';

interface Props {
    visible: boolean;
    message?: string;
    intensity?: 'none' | 'soft' | 'normal';
}

const { width } = Dimensions.get('window');

export default function CelebrationOverlay({ visible, message = '¡Subiste de nivel! 🏆', intensity = 'normal' }: Props) {
    const confettiRef = useRef<ConfettiCannon>(null);

    useEffect(() => {
        if (visible && intensity !== 'none') {
            confettiRef.current?.start();
        }
    }, [visible, intensity]);

    if (!visible || intensity === 'none') return null;

    const confettiCount = intensity === 'soft' ? 40 : 120;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <ConfettiCannon
                ref={confettiRef}
                count={confettiCount}
                origin={{ x: width / 2, y: -10 }}
                autoStart={false}
                fadeOut
                explosionSpeed={350}
                fallSpeed={3000}
                colors={['#a4c3b2', '#eab4a4', '#ffd700', '#7eb0d4', '#fd7f6f']}
            />
            <View style={styles.banner}>
                <Text style={styles.bannerText}>{message}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: '35%',
        alignSelf: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 20,
        shadowColor: Colors.onSurface,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    bannerText: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.white,
        textAlign: 'center',
    },
});
