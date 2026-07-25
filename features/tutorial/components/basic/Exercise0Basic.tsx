import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Fonts } from '../../../../constants/Typography';
import { Colors } from '../../../../constants/Colors';
import { TutorialTheme } from '../tutorialTheme';
import TutorialAvatar from '../TutorialAvatar';
import VoiceBubble from '../VoiceBubble';
import FingerIndicator from '../FingerIndicator';

type Props = {
    onCorrect: () => void;
    onReplay?: () => void;
};

export default function Exercise0Basic({ onCorrect, onReplay }: Props) {
    return (
        <View style={styles.root}>
            <View style={styles.content} pointerEvents="box-none">
                <TutorialAvatar mood="neutral" />
                <VoiceBubble
                    text="¡Hola! Bienvenido a ComuniTEA. Vamos a jugar. Toca la categoría de ALIMENTOS para empezar."
                    onReplay={onReplay}
                />
                <Text style={styles.hint}>Toca la categoría alimentos</Text>
                <View style={styles.pictoWrap}>
                    <TouchableOpacity
                        style={styles.picto}
                        onPress={onCorrect}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Alimentos"
                    >
                        <Text style={styles.pictoEmoji}>🍎</Text>
                        <Text style={styles.pictoLabel}>ALIMENTOS</Text>
                    </TouchableOpacity>
                    <FingerIndicator style={styles.finger} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: TutorialTheme.baseBg,
    },
    content: {
        flex: 1,
        paddingTop: 8,
    },
    hint: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
        marginTop: 12,
        marginBottom: 8,
    },
    pictoWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    picto: {
        width: 200,
        height: 200,
        borderRadius: 28,
        backgroundColor: '#fff',
        borderWidth: 4,
        borderColor: '#E53935',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        shadowColor: '#1d1c12',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },
    pictoEmoji: {
        fontSize: 72,
        marginBottom: 8,
    },
    pictoLabel: {
        fontSize: 22,
        fontFamily: Fonts.bodyBold,
        color: '#1d1c12',
    },
    finger: {
        bottom: '28%',
        right: '30%',
    },
});
