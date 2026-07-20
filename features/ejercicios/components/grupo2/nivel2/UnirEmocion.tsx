import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, TouchableOpacity, useWindowDimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { Fonts } from '../../../../../constants/Typography';
import { type UnirEmocionRonda, RONDAS_UNIR_EMOCION } from '../../../data/rondas/nivel2';
import { speakG2 } from '../../../../../lib/speakG2';

type Ronda = UnirEmocionRonda;

const RONDAS = RONDAS_UNIR_EMOCION;

type Props = {
    onRegisterFail: () => void;
    onSpeakEmotion: (emotionId: string) => void;
    onExerciseComplete: () => void;
};

export function UnirEmocion({ onRegisterFail, onSpeakEmotion, onExerciseComplete }: Props) {
    const { width } = useWindowDimensions();
    const confettiRef = useRef<ConfettiCannon>(null);
    const boardRef = useRef<View>(null);
    const faceRefs = useRef<Record<string, View | null>>({});
    const wordRefs = useRef<Record<string, View | null>>({});
    const [ronda, setRonda] = useState(0);
    const [dots, setDots] = useState([false, false, false]);
    const [matched, setMatched] = useState<Record<string, boolean>>({});
    const [selectedFace, setSelectedFace] = useState<string | null>(null);
    const [lineSegs, setLineSegs] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
    const [boardBox, setBoardBox] = useState({ w: 0, h: 0 });
    const [wrongWordId, setWrongWordId] = useState<string | null>(null);
    const shakeW = useRef(new Animated.Value(0)).current;

    const cur = RONDAS[ronda]!;
    const [showNext, setShowNext] = useState(false);

    const measureLine = (faceId: string, wordId: string) => {
        const b = boardRef.current;
        const fr = faceRefs.current[faceId];
        const wr = wordRefs.current[wordId];
        if (!b || !fr || !wr) return;
        b.measureInWindow((bx, by) => {
            fr.measureInWindow((fx, fy, fw, fh) => {
                wr.measureInWindow((wx, wy, ww, wh) => {
                    setLineSegs((prev) => [
                        ...prev,
                        {
                            x1: fx + fw / 2 - bx,
                            y1: fy + fh / 2 - by,
                            x2: wx + ww / 2 - bx,
                            y2: wy + wh / 2 - by,
                        },
                    ]);
                });
            });
        });
    };

    const shakeWord = () => {
        shakeW.setValue(0);
        Animated.sequence([
            Animated.timing(shakeW, { toValue: -8, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeW, { toValue: 8, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeW, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const onFacePress = (faceId: string) => {
        if (showNext || matched[faceId]) return;
        setSelectedFace(faceId);
        onSpeakEmotion(faceId);
    };

    const onWordPress = async (wordId: string, caraForzada?: string | null) => {
        if (showNext || matched[wordId]) return;
        const cara = caraForzada ?? selectedFace;
        if (!cara) {
            await speakG2('Primero toca una cara.', 250);
            return;
        }
        if (cara === wordId) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const nextM = { ...matched, [cara]: true, [wordId]: true };
            setMatched(nextM);
            measureLine(cara, wordId);
            setSelectedFace(null);
            const done = cur.pares.every((p) => nextM[p.faceId]);
            if (done) {
                confettiRef.current?.start();
                setDots((d) => {
                    const n = [...d];
                    n[ronda] = true;
                    return n;
                });
                setShowNext(true);
            }
            return;
        }
        onRegisterFail();
        setSelectedFace(null);
        setWrongWordId(wordId);
        shakeWord();
        await speakG2('Une la cara con la palabra.', 300);
        setTimeout(() => setWrongWordId(null), 1600);
    };

    const siguiente = async () => {
        setShowNext(false);
        setMatched({});
        setLineSegs([]);
        setSelectedFace(null);
        if (ronda >= 2) {
            onExerciseComplete();
            return;
        }
        setRonda((x) => x + 1);
    };

    return (
        <View style={styles.wrap}>
            <View
                ref={boardRef}
                style={styles.board}
                onLayout={(e) => {
                    const { width: w, height: h } = e.nativeEvent.layout;
                    setBoardBox({ w, h });
                }}
            >
                {boardBox.w > 0 && lineSegs.length > 0 ? (
                    <Svg
                        width={boardBox.w}
                        height={boardBox.h}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                    >
                        {lineSegs.map((l, i) => (
                            <Line
                                key={i}
                                x1={l.x1}
                                y1={l.y1}
                                x2={l.x2}
                                y2={l.y2}
                                stroke="#4CAF50"
                                strokeWidth={2}
                                strokeDasharray="4 2"
                            />
                        ))}
                    </Svg>
                ) : null}
                <View style={styles.cols}>
                    <View style={styles.col}>
                        {cur.pares.map((p) => {
                            const isSel = selectedFace === p.faceId;
                            const done = matched[p.faceId];
                            return (
                                <View
                                    key={p.faceId}
                                    ref={(r) => {
                                        faceRefs.current[p.faceId] = r;
                                    }}
                                    collapsable={false}
                                >
                                    <Pressable
                                        style={[
                                            styles.tile,
                                            isSel && styles.tileSel,
                                            done && styles.tileOk,
                                        ]}
                                        onPress={() => onFacePress(p.faceId)}
                                        disabled={done}
                                    >
                                        <Text style={styles.faceEmoji}>{p.emoji}</Text>
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.col}>
                        {cur.pares.map((p) => {
                            const done = matched[p.faceId];
                            return (
                                <View
                                    key={`w-${p.faceId}`}
                                    ref={(r) => {
                                        wordRefs.current[p.faceId] = r;
                                    }}
                                    collapsable={false}
                                >
                                    <Animated.View
                                        style={
                                            wrongWordId === p.faceId
                                                ? { transform: [{ translateX: shakeW }] }
                                                : undefined
                                        }
                                    >
                                        <Pressable
                                            style={[styles.tile, done && styles.tileOk]}
                                            onPress={() => void onWordPress(p.faceId)}
                                            disabled={done}
                                        >
                                            <Text style={styles.wordTxt}>{p.word}</Text>
                                            {wrongWordId === p.faceId ? (
                                                <View style={styles.xSmall}>
                                                    <Text style={styles.xSmallTxt}>✕</Text>
                                                </View>
                                            ) : null}
                                        </Pressable>
                                    </Animated.View>
                                </View>
                            );
                        })}
                    </View>
                </View>
                <View style={styles.confettiHost} pointerEvents="none">
                    <ConfettiCannon
                        ref={confettiRef}
                        count={35}
                        origin={{ x: width / 2, y: 80 }}
                        fadeOut
                        autoStart={false}
                    />
                </View>
            </View>
            <View style={styles.dots}>
                {dots.map((f, i) => (
                    <View key={i} style={[styles.dot, f ? styles.dotOn : styles.dotOff]} />
                ))}
            </View>
            {showNext ? (
                <TouchableOpacity style={styles.nextBtn} onPress={() => void siguiente()} activeOpacity={0.9}>
                    <Text style={styles.nextTxt}>{ronda >= 2 ? '¡Listo!' : 'Siguiente'}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { width: '100%', paddingBottom: 12, position: 'relative' },
    board: {
        minHeight: 220,
        position: 'relative',
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 12,
    },
    cols: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
    col: { flex: 1, gap: 12 },
    tile: {
        width: 72,
        height: 72,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tileSel: { borderColor: '#5C35A0', backgroundColor: '#EDE7F6' },
    tileOk: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
    faceEmoji: { fontSize: 36 },
    wordTxt: { fontSize: 13, fontFamily: Fonts.bodyBold, color: '#5C35A0', textAlign: 'center' },
    xSmall: { position: 'absolute', top: 2, right: 2 },
    xSmallTxt: { fontSize: 18, color: '#C62828', fontWeight: '800' },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 14 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    dotOn: { backgroundColor: '#5C35A0' },
    dotOff: { backgroundColor: '#E0E0E0' },
    nextBtn: {
        marginTop: 14,
        alignSelf: 'center',
        backgroundColor: '#5C35A0',
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 14,
    },
    nextTxt: { color: '#fff', fontSize: 16, fontFamily: Fonts.bodyBold },
    confettiHost: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
});
