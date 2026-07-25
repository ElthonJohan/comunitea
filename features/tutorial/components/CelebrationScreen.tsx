import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Fonts } from '../../../constants/Typography';
import { TutorialTheme } from './tutorialTheme';
import TutorialAvatar from './TutorialAvatar';
import VoiceBubble from './VoiceBubble';
import { Colors } from 'constants';

const DEFAULT_ACHIEVEMENTS = [
    'Tocar para pedir algo',
    'Elegir lo que quiero',
    'Armar una frase completa',
];

type Props = {
    /** @deprecated Usar onContinue; se mantiene por compatibilidad con el tutorial intermedio. */
    onFinish?: () => void;
    onContinue?: () => void;
    title?: string;
    subtitle?: string;
    achievements?: string[];
    buttonLabel?: string;
    onReplay?: () => void;
};

export default function CelebrationScreen({
    onFinish,
    onContinue,
    title = '¡LO LOGRASTE!',
    subtitle = '¡Muy bien! Completaste el tutorial.',
    achievements = DEFAULT_ACHIEVEMENTS,
    buttonLabel = 'Empezar a usar la app →',
    onReplay,
}: Props) {
    const [burst, setBurst] = useState(0);
    const jump = useRef(new Animated.Value(0)).current;
    const achievementsKey = useMemo(() => achievements.join('\0'), [achievements]);
    const itemAnims = useMemo(
        () => achievements.map(() => new Animated.Value(0)),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- recrear solo si cambia la lista
        [achievementsKey],
    );

    const handlePress = () => {
        (onContinue ?? onFinish)?.();
    };

    useEffect(() => {
        const id = setInterval(() => setBurst((b) => b + 1), 4200);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(jump, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(jump, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]),
        ).start();
    }, [jump]);

    useEffect(() => {
        itemAnims.forEach((v) => v.setValue(0));
        Animated.stagger(
            220,
            itemAnims.map((v) =>
                Animated.spring(v, { toValue: 1, friction: 8, tension: 65, useNativeDriver: true }),
            ),
        ).start();
    }, [achievementsKey, itemAnims]);

    const translateY = jump.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -14],
    });

    const rowStyle = (i: number) => {
        const v = itemAnims[i];
        if (!v) return {};
        return {
            opacity: v,
            transform: [
                {
                    translateY: v.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                    }),
                },
            ],
        };
    };

    return (
        <View style={styles.root}>
            <ConfettiCannon
                key={burst}
                count={140}
                origin={{ x: -10, y: 0 }}
                fadeOut
                autoStart
                explosionSpeed={380}
                fallSpeed={3000}
                colors={['#FFD700', '#FFF59D', '#FF7043', '#fff', '#4CAF50']}
            />
            <Text style={styles.brand}>
                Comuni<Text style={styles.brandAccent}>TEA</Text>
            </Text>
            <Animated.View style={{ transform: [{ translateY }] }}>
                <TutorialAvatar mood="happy" />
            </Animated.View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.bigStars}>
                <Text style={styles.goldStar}>⭐</Text>
                <Text style={styles.goldStar}>⭐</Text>
                <Text style={styles.goldStar}>⭐</Text>
            </View>
            <VoiceBubble text={subtitle} dark onReplay={onReplay} />
            <View style={styles.list}>
                {achievements.map((label, i) => (
                    <Animated.View key={`${label}-${i}`} style={[styles.item, rowStyle(i)]}>
                        <Text style={styles.check}>✔</Text>
                        <Text style={styles.itemText}>{label}</Text>
                    </Animated.View>
                ))}
            </View>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.btn} onPress={handlePress} activeOpacity={0.88}>
                <Text style={styles.btnText}>{buttonLabel}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: TutorialTheme.celebrationBg,
        paddingTop: 12,
        paddingBottom: 28,
        paddingHorizontal: 20,
    },
    brand: {
        fontSize: 28,
        fontFamily: Fonts.displayExtraBold,
        color: Colors.onPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    brandAccent: {
        color: Colors.primary,
    },
    title: {
        fontSize: 34,
        fontFamily: Fonts.displayExtraBold,
        color: '#5D4A10',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 8,
    },
    bigStars: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    goldStar: {
        fontSize: 42,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: Colors.text.primary,
    },
    list: {
        marginTop: 20,
        gap: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: TutorialTheme.correctBg,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
    },
    check: {
        fontSize: 20,
        color: '#2E7D32',
        fontFamily: Fonts.bodyBold,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: '#1d1c12',
    },
    spacer: { flex: 1, minHeight: 12 },
    btn: {
        backgroundColor: TutorialTheme.incorrectAccent,
        paddingVertical: 18,
        borderRadius: 22,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: Fonts.bodyBold,
    },
});
