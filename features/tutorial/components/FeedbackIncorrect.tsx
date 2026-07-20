import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Fonts } from '../../../constants/Typography';
import { TutorialTheme } from './tutorialTheme';
import TutorialAvatar from './TutorialAvatar';
import VoiceBubble from './VoiceBubble';

type Props = {
    title?: string;
    buttonLabel?: string;
    onRetry: () => void;
    children?: React.ReactNode;
    /** Muestra avatar del niño con estado triste (tutorial básico). */
    showAvatar?: boolean;
};

export default function FeedbackIncorrect({
    title = 'Intenta otra vez',
    buttonLabel = 'Intentar de nuevo',
    onRetry,
    children,
    showAvatar,
}: Props) {
    const shake = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    }, [shake]);

    return (
        <View style={styles.root}>
            {showAvatar ? (
                <>
                    <TutorialAvatar mood="sad" />
                    <VoiceBubble text={title} />
                    <Animated.Text style={[styles.xIcon, styles.xAfterBubble, { transform: [{ translateX: shake }] }]}>
                        ❌
                    </Animated.Text>
                </>
            ) : (
                <>
                    <Animated.Text style={[styles.xIcon, { transform: [{ translateX: shake }] }]}>
                        ❌
                    </Animated.Text>
                    <Text style={styles.title}>{title}</Text>
                </>
            )}
            {children}
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.btn} onPress={onRetry} activeOpacity={0.85}>
                <Text style={styles.btnText}>{buttonLabel}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: TutorialTheme.incorrectBg,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    xIcon: {
        fontSize: 72,
        textAlign: 'center',
        marginTop: 24,
    },
    xAfterBubble: {
        marginTop: 8,
    },
    title: {
        fontSize: 22,
        fontFamily: Fonts.displayBold,
        color: TutorialTheme.incorrectAccent,
        textAlign: 'center',
        marginBottom: 16,
    },
    spacer: {
        flex: 1,
        minHeight: 12,
    },
    btn: {
        marginTop: 12,
        backgroundColor: TutorialTheme.incorrectButton,
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
