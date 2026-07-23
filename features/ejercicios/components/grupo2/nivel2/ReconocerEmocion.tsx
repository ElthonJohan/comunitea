import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, TouchableOpacity, useWindowDimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { Fonts } from '../../../../../constants/Typography';
import {
    type ReconocerEmocionRonda,
    RONDAS_RECONOCER_EMOCION,
} from '../../../data/rondas/nivel2';
import { speakG2 } from '../../../../../lib/speakG2';

export type ReconocerRonda = ReconocerEmocionRonda;

const RONDAS = RONDAS_RECONOCER_EMOCION;

type Props = {
    onRegisterFail: () => void;
    onCorrectChoice: (emotionId: string) => void;
    onExerciseComplete: () => void;
};

export function ReconocerEmocion({ onRegisterFail, onCorrectChoice, onExerciseComplete }: Props) {
    const { width } = useWindowDimensions();
    const confettiRef = useRef<ConfettiCannon>(null);
    const [ronda, setRonda] = useState(0);
    const [dots, setDots] = useState([false, false, false]);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showNextBtn, setShowNextBtn] = useState(false);
    const [wrongId, setWrongId] = useState<string | null>(null);
    const shake = useRef(new Animated.Value(0)).current;

    const cur = RONDAS[ronda]!;

    const shakeBtn = () => {
        shake.setValue(0);
        Animated.sequence([
            Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shake, { toValue: -8, duration: 50, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const pick = async (id: string) => {
        if (showNextBtn) return;
        if (id === cur.correctoId) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onCorrectChoice(id);
            setShowOverlay(true);
            confettiRef.current?.start();
            setDots((d) => {
                const n = [...d];
                n[ronda] = true;
                return n;
            });
            setShowNextBtn(true);
            return;
        }
        onRegisterFail();
        setWrongId(id);
        shakeBtn();
        await speakG2('¿Cómo se siente?', 300);
        setTimeout(() => setWrongId(null), 1800);
    };

    const siguiente = async () => {
        setShowOverlay(false);
        setShowNextBtn(false);
        if (ronda >= 2) {
            await speakG2('¡Muy bien! Ahora el siguiente.', 400);
            onExerciseComplete();
            return;
        }
        setRonda((x) => x + 1);
    };

    return (
        <View style={styles.wrap}>
            <View style={styles.card}>
                {showOverlay ? (
                    <View style={styles.greenOverlay} pointerEvents="none">
                        <ConfettiCannon
                            ref={confettiRef}
                            count={30}
                            origin={{ x: width / 2, y: 120 }}
                            fadeOut
                            autoStart={false}
                            colors={['#81C784', '#C8E6C9', '#FFF59D']}
                        />
                    </View>
                ) : null}
                <Text style={styles.situBig}>{cur.situEmoji}</Text>
                <Text style={styles.situTxt}>{cur.texto}</Text>
            </View>
            <Text style={styles.hintTap}>Toca cómo se siente</Text>
            <View style={styles.rowOpt}>
                {cur.opciones.map((o) => {
                    const inner = (
                        <Pressable
                            style={({ pressed }) => [styles.optBtn, pressed && { opacity: 0.92 }]}
                            onPress={() => void pick(o.id)}
                        >
                            <Text style={styles.optEmoji}>{o.emoji}</Text>
                            <Text style={styles.optLabel}>{o.label}</Text>
                            {wrongId === o.id ? (
                                <View style={styles.xMark}>
                                    <Text style={styles.xTxt}>✕</Text>
                                </View>
                            ) : null}
                        </Pressable>
                    );
                    return wrongId === o.id ? (
                        <Animated.View key={o.id} style={[styles.optWrap, { transform: [{ translateX: shake }] }]}>
                            {inner}
                        </Animated.View>
                    ) : (
                        <View key={o.id} style={styles.optWrap}>
                            {inner}
                        </View>
                    );
                })}
            </View>
            <View style={styles.dots}>
                {dots.map((f, i) => (
                    <View key={i} style={[styles.dot, f ? styles.dotOn : styles.dotOff]} />
                ))}
            </View>
            {showNextBtn ? (
                <TouchableOpacity style={styles.nextBtn} onPress={() => void siguiente()} activeOpacity={0.9}>
                    <Text style={styles.nextTxt}>{ronda >= 2 ? '¡Completado!' : 'Siguiente →'}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { width: '100%', paddingBottom: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8E8F0',
        padding: 24,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    greenOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(129, 199, 132, 0.35)',
        justifyContent: 'flex-start',
    },
    situBig: { fontSize: 80, marginBottom: 8 },
    situTxt: {
        fontSize: 14,
        fontWeight: '500',
        color: '#5C35A0',
        textAlign: 'center',
        fontFamily: Fonts.body,
    },
    hintTap: { textAlign: 'center', fontSize: 12, color: '#888', marginTop: 14, marginBottom: 10 },
    rowOpt: { flexDirection: 'row', gap: 12, width: '100%' },
    optWrap: { flex: 1 },
    optBtn: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        minHeight: 72,
        position: 'relative',
    },
    optEmoji: { fontSize: 48 },
    optLabel: { marginTop: 6, fontSize: 12, fontWeight: '500', color: '#5C35A0', fontFamily: Fonts.body },
    xMark: {
        position: 'absolute',
        top: 6,
        right: 6,
    },
    xTxt: { fontSize: 28, color: '#C62828', fontWeight: '800' },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    dotOn: { backgroundColor: '#5C35A0' },
    dotOff: { backgroundColor: '#E0E0E0' },
    nextBtn: {
        marginTop: 16,
        alignSelf: 'center',
        backgroundColor: '#5C35A0',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 14,
        minHeight: 72,
        justifyContent: 'center',
    },
    nextTxt: { color: '#fff', fontSize: 16, fontFamily: Fonts.bodyBold },
});
