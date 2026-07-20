import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Fonts } from '../../../constants/Typography';
import { TutorialTheme } from './tutorialTheme';
import { Colors } from '../../../constants/Colors';
import TutorialAvatar from './TutorialAvatar';
import VoiceBubble from './VoiceBubble';

type Props = {
    onContinue: () => void;
};

export default function Exercise3Complete({ onContinue }: Props) {
    const confettiRef = useRef<ConfettiCannon>(null);
    const s1 = useRef(new Animated.Value(0)).current;
    const s2 = useRef(new Animated.Value(0)).current;
    const s3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        confettiRef.current?.start();
        Animated.stagger(160, [
            Animated.spring(s1, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
            Animated.spring(s2, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
            Animated.spring(s3, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
        ]).start();
    }, [s1, s2, s3]);

    const star = (v: Animated.Value) => ({
        opacity: v,
        transform: [
            {
                scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }),
            },
        ],
    });

    return (
        <View style={styles.root}>
            <ConfettiCannon
                ref={confettiRef}
                count={100}
                origin={{ x: -10, y: 0 }}
                fadeOut
                autoStart={false}
                explosionSpeed={400}
                fallSpeed={2600}
                colors={['#4CAF50', '#FFD700', '#a4c3b2', '#fff']}
            />
            <View style={styles.stars}>
                <Animated.Text style={[styles.star, star(s1)]}>⭐</Animated.Text>
                <Animated.Text style={[styles.star, star(s2)]}>⭐</Animated.Text>
                <Animated.Text style={[styles.star, star(s3)]}>⭐</Animated.Text>
            </View>
            <TutorialAvatar mood="happy" />
            <VoiceBubble text="¡Excelente!" />
            <View style={styles.strip}>
                <View style={styles.chip}>
                    <Text style={styles.chipEmoji}>🧑</Text>
                    <Text style={styles.chipText}>YO</Text>
                </View>
                <View style={styles.chip}>
                    <Text style={styles.chipEmoji}>🦋</Text>
                    <Text style={styles.chipText}>QUIERO</Text>
                </View>
                <Text style={styles.plus}> </Text>
                <View style={styles.chip}>
                    <Text style={styles.chipEmoji}>🥤</Text>
                    <Text style={styles.chipText}>JUGO</Text>
                </View>
            </View>
            <Text style={styles.bigPhrase}>YO QUIERO JUGO</Text>
            <Text style={styles.tag}>cómo usar la app para comunicarse</Text>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.btn} onPress={onContinue} activeOpacity={0.88}>
                <Text style={styles.btnText}>Continuar →</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#C8E6C9',
        paddingBottom: 24,
    },
    stars: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 12,
    },
    star: { fontSize: 34 },
    strip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 16,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceContainerLow,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    chipEmoji: { fontSize: 24 },
    chipText: { fontSize: 15, fontFamily: Fonts.bodyBold, color: Colors.onSurface },
    plus: { fontSize: 18 },
    bigPhrase: {
        fontSize: 28,
        fontFamily: Fonts.displayBold,
        color: TutorialTheme.correctButton,
        textAlign: 'center',
        marginTop: 20,
        letterSpacing: 0.5,
    },
    tag: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: Fonts.bodyMedium,
        color: '#2E7D32',
        marginTop: 8,
    },
    spacer: { flex: 1, minHeight: 8 },
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
