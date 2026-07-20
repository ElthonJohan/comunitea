import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, TouchableOpacity, useWindowDimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { Fonts } from '../../../../../constants/Typography';
import { type ComoLoDigoRonda, RONDAS_COMO_LO_DIGO } from '../../../data/rondas/nivel3';
import { speakG2 } from '../../../../../lib/speakG2';

type Ronda = ComoLoDigoRonda;

const RONDAS = RONDAS_COMO_LO_DIGO;

type Props = {
    onRegisterFail: () => void;
    onExerciseComplete: () => void;
};

export function ComoLoDigo({ onRegisterFail, onExerciseComplete }: Props) {
    const { width } = useWindowDimensions();
    const confettiRef = useRef<ConfettiCannon>(null);
    const [ronda, setRonda] = useState(0);
    const [dots, setDots] = useState([false, false, false]);
    const [streak, setStreak] = useState(0);
    const [showGold, setShowGold] = useState(false);
    const [wrongId, setWrongId] = useState<string | null>(null);
    const [showNext, setShowNext] = useState(false);
    const shake = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(1)).current;

    const cur = RONDAS[ronda]!;

    useEffect(() => {
        setStreak(0);
        setShowGold(false);
        setWrongId(null);
        setShowNext(false);
    }, [ronda]);

    useEffect(() => {
        if (!showGold) return;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.05, duration: 550, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [showGold, pulse]);

    const shakeBtn = () => {
        shake.setValue(0);
        Animated.sequence([
            Animated.timing(shake, { toValue: -8, duration: 45, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 8, duration: 45, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 0, duration: 45, useNativeDriver: true }),
        ]).start();
    };

    const hit = async (id: string) => {
        if (showNext) return;
        if (id === cur.correctoId) {
            setStreak(0);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const t = cur.frase.trim().endsWith('.') ? cur.frase.trim() : `${cur.frase.trim()}.`;
            await speakG2(t, 200);
            confettiRef.current?.start();
            setDots((d) => {
                const n = [...d];
                n[ronda] = true;
                return n;
            });
            setShowNext(true);
            return;
        }
        const next = streak + 1;
        setStreak(next);
        onRegisterFail();
        setWrongId(id);
        shakeBtn();
        if (next >= 2) setShowGold(true);
        await speakG2('Elige la necesidad correcta.', 300);
        setTimeout(() => setWrongId(null), 2000);
    };

    const siguiente = () => {
        setShowNext(false);
        if (ronda >= 2) {
            onExerciseComplete();
            return;
        }
        setRonda((x) => x + 1);
    };

    return (
        <View style={styles.wrap}>
            <View style={[styles.imgBox, { backgroundColor: cur.situBg }]}>
                <Text style={styles.situBig}>{cur.situEmoji}</Text>
            </View>
            <Text style={styles.desc}>{cur.texto}</Text>
            <View style={styles.row}>
                {cur.botones.map((b) => {
                    const gold = showGold && b.id === cur.correctoId;
                    const inner = (
                        <Pressable
                            style={[
                                styles.tile,
                                { backgroundColor: b.bg },
                                gold && styles.goldBorder,
                            ]}
                            onPress={() => void hit(b.id)}
                        >
                            {gold ? (
                                <Animated.View style={{ transform: [{ scale: pulse }] }}>
                                    <Text style={[styles.tileTxt, { color: b.fg }]}>
                                        {b.emoji} {b.label}
                                    </Text>
                                </Animated.View>
                            ) : (
                                <Text style={[styles.tileTxt, { color: b.fg }]}>
                                    {b.emoji} {b.label}
                                </Text>
                            )}
                            {wrongId === b.id ? (
                                <View style={styles.xMark}>
                                    <Text style={styles.xTxt}>✕</Text>
                                </View>
                            ) : null}
                        </Pressable>
                    );
                    return (
                        <View key={b.id} style={styles.tileWrap}>
                            {wrongId === b.id ? (
                                <Animated.View style={{ transform: [{ translateX: shake }] }}>{inner}</Animated.View>
                            ) : (
                                inner
                            )}
                        </View>
                    );
                })}
            </View>
            <View style={styles.confettiHost} pointerEvents="none">
                <ConfettiCannon
                    ref={confettiRef}
                    count={32}
                    origin={{ x: width / 2, y: 120 }}
                    fadeOut
                    autoStart={false}
                />
            </View>
            <View style={styles.dots}>
                {dots.map((f, i) => (
                    <View key={i} style={[styles.dot, f ? styles.dotOn : styles.dotOff]} />
                ))}
            </View>
            {showNext ? (
                <TouchableOpacity style={styles.nextBtn} onPress={siguiente} activeOpacity={0.9}>
                    <Text style={styles.nextTxt}>{ronda >= 2 ? '¡Listo!' : 'Siguiente'}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { width: '100%', paddingBottom: 12, position: 'relative' },
    imgBox: {
        width: 160,
        height: 120,
        borderRadius: 16,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    situBig: { fontSize: 72 },
    desc: {
        fontSize: 14,
        fontFamily: Fonts.bodySemiBold,
        color: '#E65100',
        textAlign: 'center',
        marginBottom: 14,
    },
    row: { gap: 10, width: '100%' },
    tileWrap: { width: '100%' },
    tile: {
        minHeight: 72,
        borderRadius: 12,
        padding: 12,
        justifyContent: 'center',
        position: 'relative',
    },
    goldBorder: { borderWidth: 3, borderColor: '#FFC107' },
    tileTxt: { fontSize: 14, fontFamily: Fonts.bodyBold, textAlign: 'center' },
    xMark: { position: 'absolute', top: 8, right: 10 },
    xTxt: { fontSize: 24, color: '#C62828', fontWeight: '800' },
    confettiHost: { position: 'absolute', top: 60, left: 0, right: 0, height: 100 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 18 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    dotOn: { backgroundColor: '#F57F17' },
    dotOff: { backgroundColor: '#E0E0E0' },
    nextBtn: {
        marginTop: 14,
        alignSelf: 'center',
        backgroundColor: '#F57F17',
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 14,
    },
    nextTxt: { color: '#fff', fontSize: 16, fontFamily: Fonts.bodyBold },
});
