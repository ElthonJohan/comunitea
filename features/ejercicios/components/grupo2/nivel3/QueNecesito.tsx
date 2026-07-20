import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, useWindowDimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { Fonts } from '../../../../../constants/Typography';
import { type QueNecesitoRonda, RONDAS_QUE_NECESITO } from '../../../data/rondas/nivel3';
import { speakG2 } from '../../../../../lib/speakG2';

type Ronda = QueNecesitoRonda;

const RONDAS = RONDAS_QUE_NECESITO;

type Props = {
    onExerciseComplete: () => void;
};

export function QueNecesito({ onExerciseComplete }: Props) {
    const { width } = useWindowDimensions();
    const confettiRef = useRef<ConfettiCannon>(null);
    const [ronda, setRonda] = useState(0);
    const [dots, setDots] = useState([false, false, false]);
    const [showNext, setShowNext] = useState(false);
    const doneTap = useRef(false);

    const cur = RONDAS[ronda]!;

    const tap = async () => {
        if (showNext || doneTap.current) return;
        doneTap.current = true;
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
    };

    const siguiente = () => {
        doneTap.current = false;
        setShowNext(false);
        if (ronda >= 2) {
            onExerciseComplete();
            return;
        }
        setRonda((x) => x + 1);
        void speakG2(RONDAS[ronda + 1]!.vozAntes, 400);
    };

    React.useEffect(() => {
        const v = RONDAS[ronda]?.vozAntes;
        if (!v) return;
        void speakG2(v, 500);
    }, [ronda]);

    return (
        <View style={styles.wrap}>
            <View style={[styles.imgBox, { backgroundColor: cur.situBg }]}>
                <Text style={styles.situBig}>{cur.situEmoji}</Text>
            </View>
            <Text style={styles.desc}>{cur.texto}</Text>
            <Pressable
                style={({ pressed }) => [
                    styles.btn,
                    { backgroundColor: cur.botonBg },
                    pressed && { opacity: 0.92 },
                ]}
                onPress={() => void tap()}
            >
                <Text style={[styles.btnTxt, { color: cur.botonFg }]}>
                    {cur.botonLabel} {cur.botonEmoji}
                </Text>
            </Pressable>
            <View style={styles.confettiHost} pointerEvents="none">
                <ConfettiCannon
                    ref={confettiRef}
                    count={28}
                    origin={{ x: width / 2, y: 140 }}
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
    wrap: { width: '100%', alignItems: 'center', paddingBottom: 12, position: 'relative' },
    imgBox: {
        width: 160,
        height: 120,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    situBig: { fontSize: 72 },
    desc: {
        fontSize: 14,
        fontFamily: Fonts.bodySemiBold,
        color: '#F57F17',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    btn: {
        minWidth: 200,
        minHeight: 72,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnTxt: { fontSize: 15, fontFamily: Fonts.bodyBold, textAlign: 'center' },
    confettiHost: { position: 'absolute', top: 40, left: 0, right: 0, height: 100 },
    dots: { flexDirection: 'row', gap: 10, marginTop: 20 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    dotOn: { backgroundColor: '#F57F17' },
    dotOff: { backgroundColor: '#E0E0E0' },
    nextBtn: {
        marginTop: 14,
        backgroundColor: '#F57F17',
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 14,
    },
    nextTxt: { color: '#fff', fontSize: 16, fontFamily: Fonts.bodyBold },
});
