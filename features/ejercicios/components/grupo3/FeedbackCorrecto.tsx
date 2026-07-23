import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal, useWindowDimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { Fonts } from '../../../../constants/Typography';
import { speakG3 } from '../../../../lib/speakG3';

type Props = {
    visible: boolean;
    onFinished: () => void;
    speak?: boolean;
    /** Texto mostrado (por defecto ¡Bien!) */
    title?: string;
    /** Frase hablada si speak=true (por defecto igual que title o ¡Bien!) */
    speakText?: string;
    /** Si se indica, sustituye speakG3 para la voz */
    speakFn?: (text: string, delayMs?: number) => Promise<void>;
    /** Tinte semitransparente del overlay */
    overlayTint?: string;
    /** Háptico suave al acierto */
    hapticOnShow?: boolean;
};

export function FeedbackCorrecto({
    visible,
    onFinished,
    speak = true,
    title = '¡Bien!',
    speakText,
    speakFn,
    overlayTint = 'rgba(129, 199, 132, 0.35)',
    hapticOnShow = false,
}: Props) {
    const { width } = useWindowDimensions();
    const confettiRef = useRef<ConfettiCannon>(null);
    const scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) return;
        if (hapticOnShow) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        const say = speakFn ?? speakG3;
        if (speak) {
            say(speakText ?? title, 200);
        }
        confettiRef.current?.start();
        scale.setValue(0);
        Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
        const t = setTimeout(onFinished, 1500);
        return () => clearTimeout(t);
    }, [visible, onFinished, scale, speak, title, speakText, speakFn, hapticOnShow]);

    if (!visible) return null;

    return (
        <Modal transparent visible animationType="none">
            <View style={[styles.overlay, { backgroundColor: overlayTint }]} pointerEvents="none">
                <ConfettiCannon
                    ref={confettiRef}
                    count={40}
                    origin={{ x: width / 2, y: 0 }}
                    fadeOut
                    autoStart={false}
                    explosionSpeed={350}
                    fallSpeed={2200}
                    colors={['#4CAF50', '#81C784', '#FFF59D', '#FFFFFF']}
                />
                <Animated.View style={[styles.avatarWrap, { transform: [{ scale }] }]}>
                    <Text style={styles.avatar}>😄</Text>
                </Animated.View>
                <Text style={styles.title}>{title}</Text>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarWrap: { marginBottom: 8 },
    avatar: { fontSize: 56 },
    title: {
        fontSize: 24,
        fontFamily: Fonts.displayBold,
        color: '#1B5E20',
    },
});
