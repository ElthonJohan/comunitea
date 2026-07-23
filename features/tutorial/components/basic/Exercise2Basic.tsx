import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { TUTORIAL_POINTING_HAND_PNG } from '../../../../constants/tutorialHandAsset';
import { Fonts } from '../../../../constants/Typography';
import { TutorialTheme } from '../tutorialTheme';
import TutorialAvatar from '../TutorialAvatar';
import VoiceBubble from '../VoiceBubble';

type Props = {
    onCorrect: () => void;
    onWrong: () => void;
    onReplay?: () => void;
};

function ChoicePicto({
    emoji,
    label,
    onPress,
}: {
    emoji: string;
    label: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={styles.choice}
            onPress={onPress}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <Text style={styles.choiceEmoji}>{emoji}</Text>
            <Text style={styles.choiceLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

export default function Exercise2Basic({ onCorrect, onWrong, onReplay }: Props) {
    const hintY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const h = Animated.loop(
            Animated.sequence([
                Animated.timing(hintY, { toValue: -8, duration: 380, useNativeDriver: true }),
                Animated.timing(hintY, { toValue: 0, duration: 380, useNativeDriver: true }),
            ]),
        );
        h.start();
        return () => h.stop();
    }, [hintY]);

    return (
        <View style={styles.root}>
            <TutorialAvatar mood="neutral" />
            <VoiceBubble text="Mira la imagen / Toca la misma" onReplay={onReplay} />
            <Text style={styles.sectionLabel}>MODELO (ARRIBA)</Text>
            <View style={styles.modelBox}>
                <Text style={styles.modelEmoji}>🍎</Text>
                <Text style={styles.modelCaption}>MANZANA</Text>
            </View>
            <View style={styles.separator} />
            <Text style={styles.sectionLabel}>ELIGE ABAJO</Text>
            <View style={styles.row}>
                <View style={styles.choiceWrap}>
                    <Animated.View style={{ transform: [{ translateY: hintY }] }}>
                        <Image source={TUTORIAL_POINTING_HAND_PNG} style={styles.finger} accessibilityLabel="" />
                    </Animated.View>
                    <ChoicePicto emoji="🍎" label="MANZANA" onPress={onCorrect} />
                </View>
                <ChoicePicto emoji="🚗" label="COCHE" onPress={onWrong} />
            </View>
            <Text style={styles.legend}>elegir entre opciones · reconocer imágenes iguales</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingBottom: 12,
    },
    sectionLabel: {
        textAlign: 'center',
        fontSize: 13,
        fontFamily: Fonts.bodyBold,
        color: 'rgba(91,75,138,0.95)',
        marginTop: 8,
        marginBottom: 6,
    },
    modelBox: {
        alignSelf: 'center',
        width: 180,
        height: 180,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderWidth: 3,
        borderColor: TutorialTheme.baseHeader,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modelEmoji: {
        fontSize: 80,
    },
    modelCaption: {
        marginTop: 4,
        fontSize: 18,
        fontFamily: Fonts.displayBold,
        color: '#1d1c12',
    },
    separator: {
        height: 2,
        backgroundColor: 'rgba(91,75,138,0.2)',
        marginVertical: 14,
        marginHorizontal: 24,
        borderRadius: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 12,
        alignItems: 'flex-start',
    },
    choiceWrap: {
        alignItems: 'center',
    },
    finger: {
        width: 40,
        height: 40,
        marginBottom: 2,
        resizeMode: 'contain',
    },
    choice: {
        width: 130,
        height: 140,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderWidth: 2,
        borderColor: 'rgba(29,28,18,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    choiceEmoji: {
        fontSize: 56,
    },
    choiceLabel: {
        marginTop: 4,
        fontSize: 15,
        fontFamily: Fonts.bodyBold,
        color: '#1d1c12',
    },
    legend: {
        textAlign: 'center',
        fontSize: 12,
        fontFamily: Fonts.bodySemiBold,
        color: 'rgba(91,75,138,0.85)',
        marginTop: 'auto',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
});
