import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, TouchableOpacity, useWindowDimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { Fonts } from '../../../../../constants/Typography';
import { type AQuienLePidoRonda, RONDAS_A_QUIEN_LE_PIDO } from '../../../data/rondas/nivel3';
import { speakG2 } from '../../../../../lib/speakG2';

type Ronda = AQuienLePidoRonda;

const RONDAS = RONDAS_A_QUIEN_LE_PIDO;

type Props = {
    onRegisterFail: () => void;
    onAyudaRegistro: (situacion: string, persona: string) => void;
    onExerciseComplete: () => void;
};

export function AQuienLePido({ onRegisterFail, onAyudaRegistro, onExerciseComplete }: Props) {
    const { width } = useWindowDimensions();
    const confettiRef = useRef<ConfettiCannon>(null);
    const [ronda, setRonda] = useState(0);
    const [dots, setDots] = useState([false, false, false]);
    const [wrongId, setWrongId] = useState<string | null>(null);
    const [showNext, setShowNext] = useState(false);
    const shake = useRef(new Animated.Value(0)).current;

    const cur = RONDAS[ronda]!;

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
        if (cur.correctas.includes(id)) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const msg = cur.feedback[id];
            if (msg) await speakG2(msg, 250);
            if (ronda === 2) {
                const persona = cur.opciones.find((o) => o.id === id)?.rol ?? id;
                onAyudaRegistro(cur.texto, persona);
            }
            confettiRef.current?.start();
            setDots((d) => {
                const n = [...d];
                n[ronda] = true;
                return n;
            });
            setShowNext(true);
            return;
        }
        onRegisterFail();
        setWrongId(id);
        shakeBtn();
        await speakG2('Piensa quién puede ayudarte en esta situación.', 300);
        setTimeout(() => setWrongId(null), 2000);
    };

    React.useEffect(() => {
        const v = RONDAS[ronda]?.voz;
        if (!v) return;
        void speakG2(v, 450);
    }, [ronda]);

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
            <Text style={styles.q}>¿A quién le pides ayuda?</Text>
            <View style={styles.row}>
                {cur.opciones.map((o) => {
                    const inner = (
                        <Pressable style={styles.card} onPress={() => void hit(o.id)}>
                            <Text style={styles.cardEm}>{o.emoji}</Text>
                            <Text style={styles.cardRol}>{o.rol}</Text>
                            {wrongId === o.id ? (
                                <View style={styles.xMark}>
                                    <Text style={styles.xTxt}>✕</Text>
                                </View>
                            ) : null}
                        </Pressable>
                    );
                    return (
                        <View key={o.id} style={styles.cardWrap}>
                            {wrongId === o.id ? (
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
                    count={34}
                    origin={{ x: width / 2, y: 100 }}
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
        width: 140,
        height: 110,
        borderRadius: 16,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    situBig: { fontSize: 64 },
    desc: {
        fontSize: 14,
        fontFamily: Fonts.bodySemiBold,
        color: '#E65100',
        textAlign: 'center',
        marginBottom: 8,
    },
    q: { fontSize: 13, fontFamily: Fonts.bodyBold, color: '#424242', textAlign: 'center', marginBottom: 12 },
    row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    cardWrap: { width: '30%', minWidth: 96 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        padding: 10,
        alignItems: 'center',
        minHeight: 72,
        position: 'relative',
    },
    cardEm: { fontSize: 40 },
    cardRol: { marginTop: 4, fontSize: 12, fontFamily: Fonts.bodyBold, color: '#5C35A0', textAlign: 'center' },
    xMark: { position: 'absolute', top: 4, right: 4 },
    xTxt: { fontSize: 20, color: '#C62828', fontWeight: '800' },
    confettiHost: { position: 'absolute', top: 40, left: 0, right: 0, height: 120 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16 },
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
