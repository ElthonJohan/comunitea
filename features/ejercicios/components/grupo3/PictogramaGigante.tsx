import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ViewStyle, Image } from 'react-native';
import { Fonts } from '../../../../constants/Typography';
import { TUTORIAL_POINTING_HAND_PNG } from '../../../../constants/tutorialHandAsset';

const AnimatedImage = Animated.createAnimatedComponent(Image);

type Props = {
    emoji: string;
    label: string;
    size?: number;
    emojiSize?: number;
    showPulse?: boolean;
    showFinger?: boolean;
    fingerScale?: number;
    onPress?: () => void;
    style?: ViewStyle;
    bounceKey?: number;
};

export function PictogramaGigante({
    emoji,
    label,
    size = 160,
    emojiSize = 72,
    showPulse = true,
    showFinger = true,
    fingerScale = 1,
    onPress,
    style,
    bounceKey = 0,
}: Props) {
    const pulse = useRef(new Animated.Value(1)).current;
    const bounce = useRef(new Animated.Value(1)).current;
    const fingerBob = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!showPulse) {
            pulse.setValue(1);
            return;
        }
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.05, duration: 700, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [showPulse, pulse]);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(fingerBob, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(fingerBob, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
        );
        if (showFinger) loop.start();
        return () => loop.stop();
    }, [showFinger, fingerBob]);

    useEffect(() => {
        if (bounceKey === 0) return;
        bounce.setValue(0.9);
        Animated.sequence([
            Animated.spring(bounce, { toValue: 1.1, friction: 4, useNativeDriver: true }),
            Animated.spring(bounce, { toValue: 1, friction: 6, useNativeDriver: true }),
        ]).start();
    }, [bounceKey, bounce]);

    const fingerTranslate = fingerBob.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -6],
    });

    return (
        <View style={[styles.wrap, style]}>
            <Animated.View style={{ transform: [{ scale: Animated.multiply(pulse, bounce) }] }}>
                {onPress ? (
                    <Pressable
                        onPress={onPress}
                        style={({ pressed }) => [
                            styles.card,
                            { width: size, height: size, borderRadius: 20, opacity: pressed ? 0.92 : 1 },
                        ]}
                    >
                        <Text style={[styles.emoji, { fontSize: emojiSize }]}>{emoji}</Text>
                    </Pressable>
                ) : (
                    <View style={[styles.card, { width: size, height: size, borderRadius: 20 }]}>
                        <Text style={[styles.emoji, { fontSize: emojiSize }]}>{emoji}</Text>
                    </View>
                )}
            </Animated.View>
            {showFinger ? (
                <Animated.View
                    style={[
                        styles.fingerWrap,
                        {
                            transform: [{ translateY: fingerTranslate }, { scale: fingerScale }],
                        },
                    ]}
                    pointerEvents="none"
                >
                    <AnimatedImage source={TUTORIAL_POINTING_HAND_PNG} style={styles.finger} />
                </Animated.View>
            ) : null}
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    card: {
        backgroundColor: '#E3F2FD',
        borderWidth: 3,
        borderColor: '#90CAF9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        textAlign: 'center',
    },
    fingerWrap: {
        position: 'absolute',
        bottom: 36,
        right: -8,
    },
    finger: {
        width: 44,
        height: 44,
        resizeMode: 'contain',
    },
    label: {
        marginTop: 12,
        fontSize: 14,
        fontFamily: Fonts.bodyBold,
        color: '#1565C0',
        textAlign: 'center',
    },
});
