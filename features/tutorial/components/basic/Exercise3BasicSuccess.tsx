import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Fonts } from '../../../../constants/Typography';
import { TutorialTheme } from '../tutorialTheme';
import TutorialAvatar from '../TutorialAvatar';
import VoiceBubble from '../VoiceBubble';

type Props = {
    onContinue: () => void;
};

export default function Exercise3BasicSuccess({ onContinue }: Props) {
    const confettiRef = useRef<ConfettiCannon>(null);
    const s1 = useRef(new Animated.Value(0)).current;
    const s2 = useRef(new Animated.Value(0)).current;
    const s3 = useRef(new Animated.Value(0)).current;
    const appleX = useRef(new Animated.Value(0)).current;
    const appleScale = useRef(new Animated.Value(1)).current;
    const appleOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        confettiRef.current?.start();
        Animated.stagger(180, [
            Animated.spring(s1, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
            Animated.spring(s2, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
            Animated.spring(s3, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        ]).start();

        Animated.sequence([
            Animated.parallel([
                Animated.timing(appleX, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(appleScale, {
                    toValue: 0.2,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(appleOpacity, {
                    toValue: 0.15,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [s1, s2, s3, appleX, appleScale, appleOpacity]);

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

    const mergeTranslate = appleX.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 52],
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
            <VoiceBubble text="¡Excelente!" />
            <View style={styles.mergeRow}>
                <Animated.View
                    style={[
                        styles.appleWrap,
                        {
                            opacity: appleOpacity,
                            transform: [{ translateX: mergeTranslate }, { scale: appleScale }],
                        },
                    ]}
                >
                    <Text style={styles.mergeEmoji}>🍎</Text>
                </Animated.View>
                <Text style={styles.arrowMini}>→</Text>
                <View style={styles.mouthWrap}>
                    <Text style={styles.mergeEmoji}>👄</Text>
                </View>
            </View>
            <Text style={styles.caption}>la manzana &quot;entró&quot; a la boca</Text>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.btn} onPress={onContinue} activeOpacity={0.85}>
                <Text style={styles.btnText}>Continuar →</Text>
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
    mergeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        gap: 12,
    },
    appleWrap: {
        width: 72,
        height: 72,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mouthWrap: {
        width: 72,
        height: 72,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(46,125,50,0.35)',
    },
    arrowMini: {
        fontSize: 28,
        color: TutorialTheme.correctButton,
        fontFamily: Fonts.bodyBold,
    },
    mergeEmoji: {
        fontSize: 44,
    },
    caption: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 15,
        fontFamily: Fonts.bodySemiBold,
        color: 'rgba(29,28,18,0.7)',
        paddingHorizontal: 20,
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
