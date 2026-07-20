import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image } from 'react-native';
import { TUTORIAL_POINTING_HAND_PNG } from '../../../../constants/tutorialHandAsset';
import { Fonts } from '../../../../constants/Typography';
import {
    buildFraseYoQuieroPalabra,
    VOZ_FORMADOR_G3_PRIMERO_YO_QUIERO,
    vozFormadorG3BienAhoraTocaLabel,
} from '../../../../features/tablero/data/voice/frase';
import { speakG3 } from '../../../../lib/speakG3';
import { speakFrasePhrase } from '../../../../lib/speakFrasePhrase';
import { expandFormadorYoQuiero } from '../../../../lib/expandPhraseForTts';
import { useVoice } from '../../../../lib/hooks/useVoice';
import { useNetwork } from '../../../../context/NetworkContext';
import { useParental } from '../../../../lib/hooks/useParental';
import { useAuth } from '../../../../context/AuthContext';

type Step = 'yo' | 'objeto' | 'done';

type Props = {
    emoji: string;
    label: string;
    palabraFrase: string;
    instruccion: string;
    onComplete: () => void;
};

export function FormadorFrase({ emoji, label, palabraFrase, instruccion: _instruccion, onComplete }: Props) {
    const { profile } = useAuth();
    const { voice } = useVoice();
    const { isConnected } = useNetwork();
    const { settings: parentalSettings } = useParental();
    const ttsSpeed = parentalSettings?.tts_speed ?? 1.0;

    const [step, setStep] = useState<Step>('yo');
    const [barComplete, setBarComplete] = useState(false);
    const yoPulse = useRef(new Animated.Value(1)).current;
    const pictoPulse = useRef(new Animated.Value(1)).current;
    const pictoOffset = useRef(new Animated.Value(0)).current;
    const pictoScale = useRef(new Animated.Value(1)).current;
    const slotFillOp = useRef(new Animated.Value(0)).current;

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
                Animated.timing(pictoPulse, { toValue: 1.05, duration: 700, useNativeDriver: true }),
                Animated.timing(pictoPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
            ]),
        );
        if (step === 'objeto') loop.start();
        else pictoPulse.setValue(1);
        return () => loop.stop();
    }, [step, pictoPulse]);

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
        await speakG3(vozFormadorG3BienAhoraTocaLabel(label), 200);
    };

    const onPressPicto = async () => {
        if (step === 'yo') {
            await speakG3(VOZ_FORMADOR_G3_PRIMERO_YO_QUIERO, 200);
            Animated.sequence([
                Animated.timing(pictoOffset, { toValue: -10, duration: 80, useNativeDriver: true }),
                Animated.spring(pictoOffset, { toValue: 0, useNativeDriver: true, friction: 4 }),
            ]).start();
            return;
        }
        if (step !== 'objeto') return;
        setStep('done');
        setBarComplete(true);
        Animated.parallel([
            Animated.timing(pictoScale, { toValue: 0, duration: 350, useNativeDriver: true }),
            Animated.timing(slotFillOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start(async () => {
            const expanded = await expandFormadorYoQuiero(palabraFrase, label, profile?.level);
            const natural = expanded ?? buildFraseYoQuieroPalabra(palabraFrase);
            await speakFrasePhrase(natural, {
                voice,
                isConnected,
                ttsSpeed,
                delayMs: 300,
            });
            await new Promise((r) => setTimeout(r, 1000));
            onComplete();
        });
    };

    const combinedScale = Animated.multiply(pictoPulse, pictoScale);

    return (
        <View style={styles.wrap}>
            <View style={styles.barRow}>
                <Animated.View style={[styles.yoSlot, { transform: [{ scale: step === 'yo' ? yoPulse : 1 }] }]}>
                    <Pressable
                        onPress={onPressYo}
                        style={[styles.yoInner, step !== 'yo' && styles.yoSelected]}
                        disabled={step !== 'yo'}
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
                <View
                    style={[
                        styles.objSlot,
                        barComplete && styles.objSlotDone,
                    ]}
                >
                    <Animated.Text style={[styles.slotEmoji, { opacity: slotFillOp }]}>{emoji}</Animated.Text>
                </View>
            </View>
            {step !== 'done' ? (
                <Animated.View
                    style={{
                        transform: [{ translateX: pictoOffset }, { scale: combinedScale }],
                        marginTop: 32,
                    }}
                >
                    <Pressable onPress={onPressPicto} style={styles.pictoBig} accessibilityLabel={label}>
                        <Text style={styles.pictoEmoji}>{emoji}</Text>
                        <Text style={styles.pictoLabel}>{label}</Text>
                    </Pressable>
                </Animated.View>
            ) : null}
            {step === 'yo' ? (
                <View style={styles.hintRow}>
                    <Image source={TUTORIAL_POINTING_HAND_PNG} style={styles.hintHand} accessibilityLabel="" />
                    <Text style={styles.hint}>Toca «YO QUIERO» primero</Text>
                </View>
            ) : step === 'objeto' ? (
                <View style={styles.hintRow}>
                    <Image source={TUTORIAL_POINTING_HAND_PNG} style={styles.hintHand} accessibilityLabel="" />
                    <Text style={styles.hint}>Ahora toca {label.toLowerCase()}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        width: '100%',
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    yoSlot: {
        minWidth: 100,
        minHeight: 72,
        borderRadius: 10,
        overflow: 'hidden',
    },
    yoInner: {
        flex: 1,
        backgroundColor: '#5C35A0',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        gap: 6,
    },
    yoSelected: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
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
        height: 72,
        borderRadius: 10,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#9575CD',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3E5F5',
    },
    objSlotDone: {
        borderStyle: 'solid',
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    slotEmoji: {
        fontSize: 28,
    },
    pictoBig: {
        width: 120,
        height: 120,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        borderWidth: 3,
        borderColor: '#90CAF9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pictoEmoji: { fontSize: 56 },
    pictoLabel: {
        marginTop: 4,
        fontSize: 12,
        fontFamily: Fonts.bodyBold,
        color: '#1565C0',
    },
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
});
