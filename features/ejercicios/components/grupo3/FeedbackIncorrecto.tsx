import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { speakG3 } from '../../../../lib/speakG3';

type Props = {
    active: boolean;
    instruccion: string;
    style?: ViewStyle;
    /** Pausa antes de hablar (G2 más corta) */
    speakDelayMs?: number;
    speakFn?: (text: string, delayMs?: number) => Promise<void>;
    /** Solo animación / X, sin repetir voz */
    silent?: boolean;
};

export function FeedbackIncorrecto({
    active,
    instruccion,
    style,
    speakDelayMs = 400,
    speakFn,
    silent = false,
}: Props) {
    const shake = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!active) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const seq = Animated.sequence([
            Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]);
        seq.start();
        if (!silent) {
            const say = speakFn ?? speakG3;
            say(instruccion, speakDelayMs);
        }
    }, [active, instruccion, shake, speakDelayMs, speakFn, silent]);

    if (!active) return null;

    return (
        <Animated.View style={[styles.mark, style, { transform: [{ translateX: shake }] }]}>
            <Text style={styles.x}>✕</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    mark: {
        position: 'absolute',
        top: -8,
        right: -8,
        zIndex: 10,
    },
    x: {
        fontSize: 32,
        color: '#C62828',
        fontWeight: '800',
    },
});
