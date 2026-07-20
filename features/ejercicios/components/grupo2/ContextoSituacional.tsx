import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Fonts } from '../../../../constants/Typography';
import { FeedbackIncorrecto } from '../grupo3/FeedbackIncorrecto';
import { speakG2 } from '../../../../lib/speakG2';

type Btn = { id: string; label: string; emoji: string; bg: string; fg: string };

type PropsUno = {
    tipo: 'uno';
    situBg: string;
    situEmoji: string;
    botonLabel: string;
    botonEmoji: string;
    botonBg: string;
    botonFg: string;
    frase: string;
    onSuccess: () => void;
};

type PropsTres = {
    tipo: 'tres';
    situBg: string;
    situEmoji: string;
    instruccion: string;
    correctoId: string;
    pistaResalta?: boolean;
    botones: Btn[];
    onCorrect: () => void;
    onWrong: () => void;
};

type Props = PropsUno | PropsTres;

export function ContextoSituacional(props: Props) {
    if (props.tipo === 'uno') {
        return <ContextoUno {...props} />;
    }
    return <ContextoTres {...props} />;
}

function ContextoUno({
    situBg,
    situEmoji,
    botonLabel,
    botonEmoji,
    botonBg,
    botonFg,
    frase,
    onSuccess,
}: PropsUno) {
    const done = useRef(false);
    const go = async () => {
        if (done.current) return;
        done.current = true;
        const t = frase.trim().endsWith('.') ? frase.trim() : `${frase.trim()}.`;
        await speakG2(t, 200);
        onSuccess();
    };
    return (
        <View style={styles.col}>
            <View style={[styles.imgBox, { backgroundColor: situBg }]}>
                <Text style={styles.situEmoji}>{situEmoji}</Text>
            </View>
            <View style={{ height: 24 }} />
            <Pressable
                style={({ pressed }) => [
                    styles.btnUno,
                    { backgroundColor: botonBg },
                    pressed && { opacity: 0.92 },
                ]}
                onPress={go}
            >
                <Text style={[styles.btnUnoText, { color: botonFg }]}>
                    {botonLabel} {botonEmoji}
                </Text>
            </Pressable>
        </View>
    );
}

function ContextoTres({
    situBg,
    situEmoji,
    instruccion,
    correctoId,
    pistaResalta,
    botones,
    onCorrect,
    onWrong,
}: PropsTres) {
    const [wrongId, setWrongId] = useState<string | null>(null);
    const [wrongSilent, setWrongSilent] = useState(false);
    const [streak, setStreak] = useState(0);
    const [showGold, setShowGold] = useState(false);
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!showGold || !pistaResalta) return;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.06, duration: 650, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [showGold, pistaResalta, pulse]);

    const hit = (b: Btn) => {
        if (b.id === correctoId) {
            setStreak(0);
            setShowGold(false);
            onCorrect();
            return;
        }
        const next = streak + 1;
        setStreak(next);
        onWrong();
        setWrongSilent(next === 2);
        setWrongId(b.id);
        if (next === 2 && pistaResalta) {
            setShowGold(true);
        }
        setTimeout(() => {
            setWrongId(null);
            setWrongSilent(false);
        }, 2200);
    };

    return (
        <View style={styles.col}>
            <View style={[styles.imgBox, { backgroundColor: situBg }]}>
                <Text style={styles.situEmoji}>{situEmoji}</Text>
            </View>
            <View style={{ height: 24 }} />
            <View style={styles.btnRow}>
                {botones.map((b) => (
                    <Pressable
                        key={b.id}
                        style={({ pressed }) => [
                            styles.btnTres,
                            { backgroundColor: b.bg },
                            wrongId === b.id && styles.dim,
                            showGold && b.id === correctoId && styles.goldBorder,
                            pressed && { opacity: 0.9 },
                        ]}
                        onPress={() => hit(b)}
                    >
                        <Animated.View
                            style={showGold && b.id === correctoId ? { transform: [{ scale: pulse }] } : undefined}
                        >
                            <Text style={[styles.btnTresText, { color: b.fg }]}>
                                {b.emoji} {b.label}
                            </Text>
                        </Animated.View>
                        {wrongId === b.id ? (
                            <FeedbackIncorrecto
                                active
                                instruccion={instruccion}
                                style={styles.xMark}
                                speakDelayMs={250}
                                speakFn={speakG2}
                                silent={wrongSilent}
                            />
                        ) : null}
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    col: { alignItems: 'center', width: '100%' },
    imgBox: {
        width: 160,
        height: 120,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    situEmoji: { fontSize: 64 },
    btnUno: {
        minWidth: 200,
        minHeight: 44,
        height: 70,
        paddingHorizontal: 16,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnUnoText: { fontSize: 15, fontFamily: Fonts.bodyBold, textAlign: 'center' },
    btnRow: { gap: 12, alignItems: 'center', width: '100%' },
    btnTres: {
        minWidth: 150,
        minHeight: 44,
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        position: 'relative',
    },
    btnTresText: { fontSize: 13, fontFamily: Fonts.bodyBold, textAlign: 'center' },
    dim: { opacity: 0.45 },
    goldBorder: {
        borderWidth: 3,
        borderColor: '#FFC107',
    },
    xMark: { top: 4, right: 4 },
});
