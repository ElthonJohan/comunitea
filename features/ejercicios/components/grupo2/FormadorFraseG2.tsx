import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image } from 'react-native';
import { TUTORIAL_POINTING_HAND_PNG } from '../../../../constants/tutorialHandAsset';
import { Fonts } from '../../../../constants/Typography';
import type { G2PictoFrase } from '../../data/grupo2';
import {
    buildFraseYoQuieroPalabra,
    FRASE_PREFIX_YO_QUIERO,
    VOZ_FORMADOR_G2_AHORA_ELIGE,
    VOZ_FORMADOR_G2_PRIMERO_YO_QUIERO,
    vozFormadorG2BienAhoraTocaLabel,
} from '../../../../features/tablero/data/voice/frase';
import { speakG2 } from '../../../../lib/speakG2';
import { speakFrasePhrase } from '../../../../lib/speakFrasePhrase';
import { expandFormadorYoQuiero } from '../../../../lib/expandPhraseForTts';
import { useVoice } from '../../../../lib/hooks/useVoice';
import { useNetwork } from '../../../../context/NetworkContext';
import { useParental } from '../../../../lib/hooks/useParental';
import { useAuth } from '../../../../context/AuthContext';

type Step = 'yo' | 'objeto' | 'listo' | 'done';

export type { G2PictoFrase };

type Props = {
    modo: 'uno' | 'dosLibre' | 'tresLibre' | 'cincoLibre';
    pictos: G2PictoFrase[];
    onComplete: () => void;
    /** Si es true, tras elegir objeto el niño debe pulsar ▶ para hablar y terminar */
    requirePlayButton?: boolean;
};

const SIZE_UNO = 130;
const SIZE_DOS = 110;
const SIZE_TRES = 100;
const SIZE_CINCO = 82;

export function FormadorFraseG2({ modo, pictos, onComplete, requirePlayButton = false }: Props) {
    const { profile } = useAuth();
    const { voice } = useVoice();
    const { isConnected } = useNetwork();
    const { settings: parentalSettings } = useParental();
    const ttsSpeed = parentalSettings?.tts_speed ?? 1.0;

    const [step, setStep] = useState<Step>('yo');
    const [barComplete, setBarComplete] = useState(false);
    const [picked, setPicked] = useState<G2PictoFrase | null>(null);
    const yoPulse = useRef(new Animated.Value(1)).current;
    const guidePulse = useRef(new Animated.Value(1)).current;
    const slotFillOp = useRef(new Animated.Value(0)).current;
    const pictoKey = pictos.map((p) => p.id).join(',');
    const pictoScales = useMemo(() => pictos.map(() => new Animated.Value(1)), [pictoKey]);

    const size =
        modo === 'uno'
            ? SIZE_UNO
            : modo === 'dosLibre'
              ? SIZE_DOS
              : modo === 'tresLibre'
                ? SIZE_TRES
                : SIZE_CINCO;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(yoPulse, { toValue: 1.06, duration: 700, useNativeDriver: true }),
                Animated.timing(yoPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
            ]),
        );
        if (step === 'yo') loop.start();
        return () => loop.stop();
    }, [step, yoPulse]);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(guidePulse, { toValue: 1.05, duration: 700, useNativeDriver: true }),
                Animated.timing(guidePulse, { toValue: 1, duration: 700, useNativeDriver: true }),
            ]),
        );
        if (step === 'objeto') loop.start();
        return () => loop.stop();
    }, [step, guidePulse]);

    const onPressYo = async () => {
        if (step !== 'yo') return;
        setStep('objeto');
        // Leer "Yo quiero" con ElevenLabs
        await speakFrasePhrase('Yo quiero', {
            voice,
            isConnected,
            ttsSpeed,
            delayMs: 0,
        });
        // Luego la instrucción
        if (modo === 'uno' && pictos[0]) {
            await speakG2(vozFormadorG2BienAhoraTocaLabel(pictos[0].label), 200);
        } else {
            await speakG2(VOZ_FORMADOR_G2_AHORA_ELIGE, 200);
        }
    };

    const speakFraseFormador = async (p: G2PictoFrase) => {
        const expanded = await expandFormadorYoQuiero(p.palabra, p.label, profile?.level);
        const frase = expanded ?? buildFraseYoQuieroPalabra(p.palabra);
        await speakFrasePhrase(frase, { voice, isConnected, ttsSpeed, delayMs: 300 });
    };

    const finishWith = async (p: G2PictoFrase) => {
        setPicked(p);
        setStep('done');
        setBarComplete(true);
        Animated.timing(slotFillOp, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        await speakFraseFormador(p);
        onComplete();
    };

    const onPressPicto = async (p: G2PictoFrase, index: number) => {
        if (step === 'yo') {
            await speakG2(VOZ_FORMADOR_G2_PRIMERO_YO_QUIERO, 200);
            const s = pictoScales[index];
            if (s) {
                Animated.sequence([
                    Animated.timing(s, { toValue: 0.92, duration: 80, useNativeDriver: true }),
                    Animated.spring(s, { toValue: 1, useNativeDriver: true, friction: 4 }),
                ]).start();
            }
            return;
        }
        if (step !== 'objeto') return;
        if (requirePlayButton) {
            setPicked(p);
            setBarComplete(true);
            Animated.timing(slotFillOp, { toValue: 1, duration: 400, useNativeDriver: true }).start();
            setStep('listo');
            return;
        }
        await finishWith(p);
    };

    const onPressPlay = async () => {
        if (step !== 'listo' || !picked) return;
        setStep('done');
        await speakFraseFormador(picked);
        onComplete();
    };

    const showEmoji = picked?.emoji ?? '';

    return (
        <View style={styles.wrap}>
            <View style={styles.barRow}>
                <Animated.View style={[styles.yoWrap, { transform: [{ scale: step === 'yo' ? yoPulse : 1 }] }]}>
                    <Pressable
                        onPress={onPressYo}
                        style={[styles.yoInner, step !== 'yo' && styles.yoDone]}
                        disabled={step !== 'yo'}
                        accessibilityLabel={FRASE_PREFIX_YO_QUIERO}
                    >
                        <View style={styles.yoPicto}>
                            <Text style={styles.yoEmoji}>🧑</Text>
                            <Text style={styles.yoText}>YO</Text>
                        </View>
                        <View style={styles.yoPicto}>
                            <Text style={styles.yoEmoji}>🦋</Text>
                            <Text style={styles.yoText}>QUIERO</Text>
                        </View>
                    </Pressable>
                </Animated.View>
                <View style={[styles.objSlot, barComplete && styles.objSlotDone]}>
                    <Animated.Text style={[styles.slotEmoji, { opacity: slotFillOp }]}>{showEmoji}</Animated.Text>
                </View>
            </View>

            {step !== 'done' && step !== 'listo' ? (
                <View style={[styles.pictoZone, modo !== 'uno' && styles.pictoRow]}>
                    {pictos.map((p, i) => {
                        const scaleAnim = pictoScales[i];
                        if (!scaleAnim) return null;
                        return (
                            <Animated.View
                                key={p.id}
                                style={{
                                    transform: [
                                        {
                                            scale:
                                                step === 'objeto'
                                                    ? Animated.multiply(scaleAnim, guidePulse)
                                                    : scaleAnim,
                                        },
                                    ],
                                }}
                            >
                                <Pressable
                                    onPress={() => onPressPicto(p, i)}
                                    style={[styles.pictoBox, { width: size, height: size, minWidth: 44, minHeight: 44 }]}
                                    accessibilityLabel={p.label}
                                >
                                    <Text style={styles.pictoEmoji}>{p.emoji}</Text>
                                    <Text style={styles.pictoLabel}>{p.label}</Text>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </View>
            ) : null}

            {step === 'listo' ? (
                <Pressable
                    style={styles.playBtn}
                    onPress={onPressPlay}
                    accessibilityLabel="Hablar frase"
                >
                    <Text style={styles.playBtnText}>▶</Text>
                </Pressable>
            ) : null}

            {step === 'yo' ? (
                <View style={styles.hintRow}>
                    <Image source={TUTORIAL_POINTING_HAND_PNG} style={styles.hintHand} accessibilityLabel="" />
                    <Text style={styles.hint}>Toca «YO QUIERO» primero</Text>
                </View>
            ) : step === 'objeto' ? (
                <View style={styles.hintRow}>
                    <Image source={TUTORIAL_POINTING_HAND_PNG} style={styles.hintHand} accessibilityLabel="" />
                    <Text style={styles.hint}>Ahora elige</Text>
                </View>
            ) : step === 'listo' ? (
                <View style={styles.hintRow}>
                    <Image source={TUTORIAL_POINTING_HAND_PNG} style={styles.hintHand} accessibilityLabel="" />
                    <Text style={styles.hint}>Toca ▶ para decir tu frase</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { alignItems: 'center', width: '100%' },
    barRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    yoWrap: { borderRadius: 10, overflow: 'hidden' },
    yoInner: {
        minWidth: 100,
        minHeight: 60,
        backgroundColor: '#5C35A0',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        gap: 6,
    },
    yoDone: { borderWidth: 2, borderColor: '#FFFFFF' },
    yoPicto: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    yoEmoji: { fontSize: 20 },
    yoText: { color: '#5C35A0', fontSize: 10, fontFamily: Fonts.bodyBold, textAlign: 'center', marginTop: 2 },
    objSlot: {
        width: 80,
        height: 60,
        borderRadius: 10,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#9575CD',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EDE7F6',
    },
    objSlotDone: {
        borderStyle: 'solid',
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    slotEmoji: { fontSize: 28 },
    pictoZone: { marginTop: 28, alignItems: 'center', gap: 16 },
    pictoRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    pictoBox: {
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        borderWidth: 3,
        borderColor: '#90CAF9',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    pictoEmoji: { fontSize: 52 },
    pictoLabel: { marginTop: 4, fontSize: 12, fontFamily: Fonts.bodyBold, color: '#1565C0', textAlign: 'center' },
    hintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingHorizontal: 12,
    },
    hintHand: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },
    hint: {
        flexShrink: 1,
        fontSize: 14,
        fontFamily: Fonts.bodySemiBold,
        color: '#5C35A0',
        textAlign: 'left',
    },
    playBtn: {
        marginTop: 24,
        minWidth: 72,
        minHeight: 56,
        borderRadius: 12,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    playBtnText: { color: '#fff', fontSize: 22, fontFamily: Fonts.bodyBold },
});
