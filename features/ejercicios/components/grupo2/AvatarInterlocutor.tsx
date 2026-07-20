import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { Fonts } from '../../../../constants/Typography';
import { speakG2, stopSpeakG2 } from '../../../../lib/speakG2';

const TIMER_MS = 20000;

type Props = {
    pregunta: string;
    vozPregunta: string;
    children: React.ReactNode;
    /** Barra de tiempo discreta (20s, repite pregunta una vez al agotarse) */
    showTimer?: boolean;
};

export function AvatarInterlocutor({ pregunta, vozPregunta, children, showTimer = true }: Props) {
    const { width: winW } = useWindowDimensions();
    const trackW = Math.max(40, winW - 48);
    const progress = useRef(new Animated.Value(0)).current;
    const repeats = useRef(0);
    const animRef = useRef<Animated.CompositeAnimation | null>(null);

    const speakQ = () => speakG2(vozPregunta, 400);

    const startBar = () => {
        animRef.current?.stop();
        progress.setValue(0);
        const a = Animated.timing(progress, {
            toValue: 1,
            duration: TIMER_MS,
            useNativeDriver: false,
        });
        animRef.current = a;
        a.start(({ finished }) => {
            if (!finished) return;
            if (repeats.current < 1) {
                repeats.current += 1;
                void speakQ();
                startBar();
            }
        });
    };

    useEffect(() => {
        void speakQ();
        if (showTimer) startBar();
        return () => {
            animRef.current?.stop();
            stopSpeakG2();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- voz al montar; timer una vez
    }, []);

    const fillW = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, trackW],
    });

    return (
        <View style={styles.wrap}>
            <View style={styles.topRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarEmoji}>👩‍⚕️</Text>
                </View>
                <View style={styles.bubble}>
                    <View style={styles.bubbleTip} />
                    <Text style={styles.pregunta}>{pregunta}</Text>
                </View>
            </View>
            {showTimer ? (
                <View style={[styles.timerTrack, { width: trackW, alignSelf: 'center' }]}>
                    <Animated.View style={[styles.timerFill, { width: fillW }]} />
                </View>
            ) : null}
            <View style={styles.body}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { width: '100%', flex: 1 },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingHorizontal: 4,
        marginBottom: 10,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#7E57C2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEmoji: { fontSize: 18 },
    bubble: {
        flex: 1,
        backgroundColor: '#EDE7F6',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        position: 'relative',
    },
    bubbleTip: {
        position: 'absolute',
        left: -6,
        top: 14,
        width: 0,
        height: 0,
        borderTopWidth: 6,
        borderBottomWidth: 6,
        borderRightWidth: 8,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: '#EDE7F6',
    },
    pregunta: {
        fontSize: 10,
        fontFamily: Fonts.bodyBold,
        color: '#4527A0',
        lineHeight: 14,
    },
    timerTrack: {
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(149, 117, 205, 0.2)',
        overflow: 'hidden',
        marginBottom: 12,
        marginHorizontal: 4,
    },
    timerFill: {
        height: 4,
        borderRadius: 2,
        backgroundColor: '#9575CD',
    },
    body: { flex: 1, minHeight: 120 },
});
