import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image } from 'react-native';
import { TUTORIAL_POINTING_HAND_PNG } from '../../../../constants/tutorialHandAsset';
import { Fonts } from '../../../../constants/Typography';
import { Colors } from '../../../../constants/Colors';
import { TutorialTheme } from '../tutorialTheme';
import TutorialAvatar from '../TutorialAvatar';
import VoiceBubble from '../VoiceBubble';

type Props = {
    onCorrect: () => void;
    onReplay?: () => void;
};

export default function Exercise1Basic({ onCorrect, onReplay }: Props) {
    const pulse = useRef(new Animated.Value(1)).current;
    const borderPulse = useRef(new Animated.Value(0.5)).current;
    const hintY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const p = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.05, duration: 700, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
            ]),
        );
        p.start();
        return () => p.stop();
    }, [pulse]);

    useEffect(() => {
        const d = Animated.loop(
            Animated.sequence([
                Animated.timing(borderPulse, { toValue: 1, duration: 900, useNativeDriver: false }),
                Animated.timing(borderPulse, { toValue: 0.45, duration: 900, useNativeDriver: false }),
            ]),
        );
        d.start();
        return () => d.stop();
    }, [borderPulse]);

    useEffect(() => {
        const h = Animated.loop(
            Animated.sequence([
                Animated.timing(hintY, { toValue: -10, duration: 400, useNativeDriver: true }),
                Animated.timing(hintY, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]),
        );
        h.start();
        return () => h.stop();
    }, [hintY]);

    return (
        <Pressable style={styles.fullTouch} onPress={onCorrect} accessibilityRole="button">
            <View style={styles.inner} pointerEvents="box-none">
                <TutorialAvatar mood="neutral" />
                <VoiceBubble text="Mira... Toca la imagen" onReplay={onReplay} />
                <View style={styles.centerArea}>
                    <Animated.View style={{ transform: [{ scale: pulse }] }}>
                        <Animated.View
                            style={[
                                styles.pictoWrap,
                                {
                                    borderColor: TutorialTheme.baseHeader,
                                    borderStyle: 'dashed',
                                    borderWidth: 3,
                                    opacity: borderPulse,
                                },
                            ]}
                        >
                            <Animated.View style={[styles.fingerHint, { transform: [{ translateY: hintY }] }]}>
                                <Image
                                    source={TUTORIAL_POINTING_HAND_PNG}
                                    style={styles.fingerImg}
                                    accessibilityLabel="Toca la imagen"
                                />
                            </Animated.View>
                            <Text style={styles.emoji}>🍎</Text>
                            <Text style={styles.label}>MANZANA</Text>
                        </Animated.View>
                    </Animated.View>
                </View>
                <Text style={styles.hint}>
                    solo una imagen — no hay opciones
                </Text>
                <Text style={styles.legend}>dónde tocar · cómo interactuar</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    fullTouch: {
        flex: 1,
    },
    inner: {
        flex: 1,
        paddingBottom: 16,
    },
    centerArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    pictoWrap: {
        width: 200,
        height: 200,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    fingerHint: {
        position: 'absolute',
        bottom: -30,
        right: 25,
        zIndex: 2,
    },
    fingerImg: {
        width: 44,
        height: 44,
        resizeMode: 'contain',
    },
    emoji: {
        fontSize: 88,
    },
    label: {
        marginTop: 4,
        fontSize: 20,
        fontFamily: Fonts.displayBold,
        color: '#1d1c12',
    },
    hint: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
        paddingHorizontal: 20,
        marginTop: 8,
    },
    legend: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
        marginTop: 10,
    },
});
