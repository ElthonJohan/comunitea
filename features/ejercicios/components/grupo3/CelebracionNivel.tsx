import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    useWindowDimensions,
    Modal,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Fonts } from '../../../../constants/Typography';
import { G3_LINEN } from '../../../../constants/ejerciciosGrupo3';
import { speakG3 } from '../../../../lib/speakG3';

type Props = {
    visible: boolean;
    nivel: number;
    checklist: string[];
    onSeguir: () => void;
    backgroundColor?: string;
    speakFn?: (text: string, delayMs?: number) => Promise<void>;
};

export function CelebracionNivel({
    visible,
    nivel,
    checklist,
    onSeguir,
    backgroundColor = G3_LINEN,
    speakFn,
}: Props) {
    const { width } = useWindowDimensions();
    const confettiRef = useRef<ConfettiCannon>(null);
    const [burst, setBurst] = useState(0);
    const jump = useRef(new Animated.Value(0)).current;
    const star1 = useRef(new Animated.Value(0)).current;
    const star2 = useRef(new Animated.Value(0)).current;
    const star3 = useRef(new Animated.Value(0)).current;

    const itemAnims = useMemo(
        () => checklist.map(() => new Animated.Value(0)),
        [checklist],
    );

    useEffect(() => {
        if (!visible) return;
        (speakFn ?? speakG3)(`¡Nivel ${nivel} completado!`, 300);
        confettiRef.current?.start();
        const iv = setInterval(() => {
            confettiRef.current?.start();
            setBurst((b) => b + 1);
        }, 900);
        itemAnims.forEach((v) => v.setValue(0));
        Animated.loop(
            Animated.sequence([
                Animated.timing(jump, { toValue: -12, duration: 280, useNativeDriver: true }),
                Animated.timing(jump, { toValue: 0, duration: 280, useNativeDriver: true }),
            ]),
        ).start();
        Animated.stagger(300, [
            Animated.spring(star1, { toValue: 1, useNativeDriver: true, friction: 5 }),
            Animated.spring(star2, { toValue: 1, useNativeDriver: true, friction: 5 }),
            Animated.spring(star3, { toValue: 1, useNativeDriver: true, friction: 5 }),
        ]).start();
        const anims = itemAnims.map((val, i) =>
            Animated.timing(val, {
                toValue: 1,
                duration: 400,
                delay: 800 + i * 200,
                useNativeDriver: true,
            }),
        );
        Animated.parallel(anims).start();
        const stop = setTimeout(() => clearInterval(iv), 3000);
        return () => {
            clearInterval(iv);
            clearTimeout(stop);
        };
    }, [visible, nivel, checklist, jump, star1, star2, star3, itemAnims, speakFn]);

    if (!visible) return null;

    return (
        <Modal visible transparent animationType="fade">
            <View style={[styles.wrap, { backgroundColor }]}>
                <ConfettiCannon
                    key={burst}
                    ref={confettiRef}
                    count={50}
                    origin={{ x: width / 2, y: 40 }}
                    fadeOut
                    autoStart={false}
                    colors={['#FFD700', '#4CAF50', '#FFF176', '#FFFFFF']}
                />
                <Animated.Text style={[styles.emoji, { transform: [{ translateY: jump }] }]}>🥳</Animated.Text>
                <View style={styles.starsRow}>
                    {[star1, star2, star3].map((s, i) => (
                        <Animated.Text
                            key={i}
                            style={[styles.star, { opacity: s, transform: [{ scale: s }] }]}
                        >
                            ⭐
                        </Animated.Text>
                    ))}
                </View>
                <Text style={styles.title}>¡Nivel {nivel} completado!</Text>
                <View style={styles.list}>
                    {checklist.map((line, i) => {
                        const a = itemAnims[i];
                        const rowKey = `celebracion-${nivel}-${i}`;
                        if (!a) return <Text key={rowKey} style={styles.item}>✓ {line}</Text>;
                        return (
                            <Animated.View
                                key={rowKey}
                                style={{
                                    opacity: a,
                                    transform: [
                                        {
                                            translateY: a.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [12, 0],
                                            }),
                                        },
                                    ],
                                }}
                            >
                                <Text style={styles.item}>✓ {line}</Text>
                            </Animated.View>
                        );
                    })}
                </View>
                <TouchableOpacity style={styles.btn} onPress={onSeguir} activeOpacity={0.9}>
                    <Text style={styles.btnText}>Seguir el camino →</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flex: 1,
        backgroundColor: G3_LINEN,
        paddingTop: 48,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    emoji: { fontSize: 72, marginBottom: 8 },
    starsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    star: { fontSize: 40 },
    title: {
        fontSize: 20,
        fontFamily: Fonts.displayBold,
        color: '#33691E',
        marginBottom: 20,
        textAlign: 'center',
    },
    list: { alignSelf: 'stretch', marginBottom: 24 },
    item: {
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: '#424242',
        marginBottom: 8,
    },
    btn: {
        marginTop: 'auto',
        marginBottom: 40,
        minHeight: 52,
        minWidth: 260,
        borderRadius: 16,
        backgroundColor: '#3949AB',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    btnText: {
        color: '#fff',
        fontSize: 17,
        fontFamily: Fonts.bodyBold,
    },
});
