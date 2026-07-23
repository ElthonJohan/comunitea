import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Fonts } from '../../../constants/Typography';
import { TutorialTheme } from './tutorialTheme';
import TutorialAvatar from './TutorialAvatar';
import VoiceBubble from './VoiceBubble';

type Props = {
    message?: string;
    buttonLabel?: string;
    onContinue: () => void;
    /** Contenido opcional entre la burbuja y el botón (p. ej. pictograma de refuerzo). */
    children?: React.ReactNode;
    onReplay?: () => void;
};

export default function FeedbackCorrect({
    message = '¡Muy bien!',
    buttonLabel = 'Continuar →',
    onContinue,
    children,
    onReplay,
}: Props) {
    const confettiRef = useRef<ConfettiCannon>(null);
    const s1 = useRef(new Animated.Value(0)).current;
    const s2 = useRef(new Animated.Value(0)).current;
    const s3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        confettiRef.current?.start();
        Animated.stagger(180, [
            Animated.spring(s1, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
            Animated.spring(s2, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
            Animated.spring(s3, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        ]).start();
    }, [s1, s2, s3]);

    const starStyle = (v: Animated.Value) => ({
        opacity: v,
        transform: [
            {
                scale: v.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                }),
            },
        ],
    });

    return (
        <View style={styles.root}>
            <ConfettiCannon
                ref={confettiRef}
                count={80}
                origin={{ x: -10, y: 0 }}
                fadeOut
                autoStart={false}
                explosionSpeed={350}
                fallSpeed={2800}
                colors={['#FFD700', '#4CAF50', '#a4c3b2', '#fff', '#FF7043']}
            />
            <View style={styles.starsRow}>
                <Animated.Text style={[styles.star, starStyle(s1)]}>⭐</Animated.Text>
                <Animated.Text style={[styles.star, starStyle(s2)]}>⭐</Animated.Text>
                <Animated.Text style={[styles.star, starStyle(s3)]}>⭐</Animated.Text>
            </View>
            <TutorialAvatar mood="happy" />
            <VoiceBubble text={message} onReplay={onReplay} />
            {children}
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.btn} onPress={onContinue} activeOpacity={0.85}>
                <Text style={styles.btnText}>{buttonLabel}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: TutorialTheme.correctBg,
        paddingBottom: 24,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
        marginBottom: 8,
    },
    star: {
        fontSize: 36,
    },
    spacer: {
        flex: 1,
    },
    btn: {
        marginHorizontal: 24,
        backgroundColor: TutorialTheme.correctButton,
        paddingVertical: 16,
        borderRadius: 20,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 17,
        fontFamily: Fonts.bodyBold,
    },
});
