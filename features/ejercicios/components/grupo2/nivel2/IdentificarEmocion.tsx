import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    TouchableOpacity,
    Modal,
    useWindowDimensions,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { Fonts } from '../../../../../constants/Typography';
import {
    type IdentificarEmocionRonda,
    RONDAS_IDENTIFICAR_EMOCION,
} from '../../../data/rondas/nivel2';
import { speakG2 } from '../../../../../lib/speakG2';

type Ronda = IdentificarEmocionRonda;

const RONDAS = RONDAS_IDENTIFICAR_EMOCION;

type Props = {
    onRegisterFail: () => void;
    onCorrectChoice: (emotionId: string) => void;
    onExerciseComplete: () => void;
};

export function IdentificarEmocion({ onRegisterFail, onCorrectChoice, onExerciseComplete }: Props) {
    const { width } = useWindowDimensions();
    const confettiRef = useRef<ConfettiCannon>(null);
    const [ronda, setRonda] = useState(0);
    const [dots, setDots] = useState([false, false, false]);
    const [wrongId, setWrongId] = useState<string | null>(null);
    const [showOk, setShowOk] = useState(false);
    const shake = useRef(new Animated.Value(0)).current;

    const cur = RONDAS[ronda]!;

    useEffect(() => {
        if (!showOk) return;
        const t = setTimeout(() => confettiRef.current?.start(), 120);
        return () => clearTimeout(t);
    }, [showOk]);

    const shakeOpt = () => {
        shake.setValue(0);
        Animated.sequence([
            Animated.timing(shake, { toValue: -8, duration: 45, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 8, duration: 45, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 0, duration: 45, useNativeDriver: true }),
        ]).start();
    };

    const pick = async (id: string) => {
        if (showOk) return;
        if (id === cur.correctoId) {
            onCorrectChoice(id);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setDots((d) => {
                const n = [...d];
                n[ronda] = true;
                return n;
            });
            setShowOk(true);
            return;
        }
        onRegisterFail();
        setWrongId(id);
        shakeOpt();
        await speakG2('Intenta otra vez.', 280);
        setTimeout(() => setWrongId(null), 1600);
    };

    const siguiente = async () => {
        setShowOk(false);
        if (ronda >= 2) {
            onExerciseComplete();
            return;
        }
        setRonda((x) => x + 1);
    };

    return (
        <View style={styles.wrap}>
            <View style={styles.cardBig}>
                <Text style={styles.bigEmoji}>{cur.muestra}</Text>
            </View>
            <Text style={styles.hint}>Toca la respuesta correcta</Text>
            <View style={styles.grid}>
                <View style={styles.gridRow}>
                    {cur.opciones.slice(0, 2).map((o) => {
                        const inner = (
                            <Pressable
                                style={({ pressed }) => [styles.optCard, pressed && { opacity: 0.9 }]}
                                onPress={() => void pick(o.id)}
                            >
                                <Text style={styles.optEm}>{o.emoji}</Text>
                                <Text style={styles.optLb}>{o.label}</Text>
                                {wrongId === o.id ? (
                                    <View style={styles.xMark}>
                                        <Text style={styles.xTxt}>✕</Text>
                                    </View>
                                ) : null}
                            </Pressable>
                        );
                        return (
                            <View key={o.id} style={styles.gridCell}>
                                {wrongId === o.id ? (
                                    <Animated.View style={{ transform: [{ translateX: shake }] }}>
                                        {inner}
                                    </Animated.View>
                                ) : (
                                    inner
                                )}
                            </View>
                        );
                    })}
                </View>
                {cur.opciones[2] ? (
                    <View style={styles.gridRowCenter}>
                        {(() => {
                            const o = cur.opciones[2]!;
                            const inner = (
                                <Pressable
                                    style={({ pressed }) => [styles.optCard, pressed && { opacity: 0.9 }]}
                                    onPress={() => void pick(o.id)}
                                >
                                    <Text style={styles.optEm}>{o.emoji}</Text>
                                    <Text style={styles.optLb}>{o.label}</Text>
                                    {wrongId === o.id ? (
                                        <View style={styles.xMark}>
                                            <Text style={styles.xTxt}>✕</Text>
                                        </View>
                                    ) : null}
                                </Pressable>
                            );
                            return wrongId === o.id ? (
                                <Animated.View style={{ transform: [{ translateX: shake }] }}>{inner}</Animated.View>
                            ) : (
                                inner
                            );
                        })()}
                    </View>
                ) : null}
            </View>
            <View style={styles.dots}>
                {dots.map((f, i) => (
                    <View key={i} style={[styles.dot, f ? styles.dotOn : styles.dotOff]} />
                ))}
            </View>
            <Modal visible={showOk} transparent animationType="fade">
                <View style={styles.modalBg}>
                    <View style={styles.confettiHost}>
                        <ConfettiCannon
                            ref={confettiRef}
                            count={40}
                            origin={{ x: width / 2, y: 80 }}
                            fadeOut
                            autoStart={false}
                            colors={['#81C784', '#FFF59D', '#fff']}
                        />
                    </View>
                    <Text style={styles.okTitle}>¡Correcto!</Text>
                    <TouchableOpacity style={styles.nextBtn} onPress={() => void siguiente()} activeOpacity={0.9}>
                        <Text style={styles.nextTxt}>{ronda >= 2 ? 'Terminar' : 'Siguiente'}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { width: '100%', paddingBottom: 12 },
    cardBig: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E8F0',
    },
    bigEmoji: { fontSize: 100 },
    hint: { textAlign: 'center', fontSize: 12, color: '#888', marginTop: 12, marginBottom: 10 },
    grid: { gap: 10 },
    gridRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
    gridRowCenter: { alignItems: 'center', marginTop: 4 },
    gridCell: { flex: 1, maxWidth: 160 },
    optCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        padding: 12,
        alignItems: 'center',
        minHeight: 72,
        position: 'relative',
    },
    optEm: { fontSize: 40 },
    optLb: { marginTop: 4, fontSize: 11, color: '#5C35A0', fontFamily: Fonts.bodyBold },
    xMark: { position: 'absolute', top: 4, right: 4 },
    xTxt: { fontSize: 22, color: '#C62828', fontWeight: '800' },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 14 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    dotOn: { backgroundColor: '#5C35A0' },
    dotOff: { backgroundColor: '#E0E0E0' },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(129, 199, 132, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    okTitle: {
        fontSize: 26,
        fontFamily: Fonts.displayBold,
        color: '#1B5E20',
        marginBottom: 24,
    },
    nextBtn: {
        backgroundColor: '#5C35A0',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 14,
        minHeight: 72,
        justifyContent: 'center',
    },
    nextTxt: { color: '#fff', fontSize: 17, fontFamily: Fonts.bodyBold },
    confettiHost: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
});
