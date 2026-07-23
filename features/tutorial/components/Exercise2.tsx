import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Fonts } from '../../../constants/Typography';
import { Colors } from '../../../constants/Colors';
import { TutorialTheme } from './tutorialTheme';
import TutorialAvatar from './TutorialAvatar';
import VoiceBubble from './VoiceBubble';
import FingerIndicator from './FingerIndicator';

type Props = {
    onCorrect: () => void;
    onWrong: () => void;
};

export default function Exercise2({ onCorrect, onWrong }: Props) {
    return (
        <View style={styles.root}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onWrong} />
            <View style={styles.content} pointerEvents="box-none">
                <TutorialAvatar mood="neutral" />
                <VoiceBubble text="¿Qué quieres? Toca el jugo." />
                <Text style={styles.hint}>toca lo que quieres</Text>
                <Text style={styles.subHint}>puedo elegir lo que quiero</Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.picto, styles.pictoGood]}
                        onPress={onCorrect}
                        activeOpacity={0.85}
                        accessibilityLabel="Jugo"
                    >
                        <Text style={styles.emoji}>🥤</Text>
                        <Text style={styles.label}>JUGO</Text>
                        <FingerIndicator style={styles.fingerJuice} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.picto, styles.pictoNeutral]}
                        onPress={onWrong}
                        activeOpacity={0.85}
                        accessibilityLabel="Galleta"
                    >
                        <Text style={styles.emoji}>🍪</Text>
                        <Text style={styles.label}>GALLETA</Text>
                    </TouchableOpacity>
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
    },
    subHint: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
        marginTop: 6,
        marginBottom: 20,
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 12,
    },
    picto: {
        width: 150,
        height: 170,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        zIndex: 2,
        position: 'relative',
    },
    pictoGood: {
        borderColor: '#E53935',
    },
    pictoNeutral: {
        borderColor: 'rgba(29,28,18,0.2)',
    },
    emoji: {
        fontSize: 52,
        marginBottom: 6,
    },
    label: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: '#1d1c12',
    },
    fingerJuice: {
        bottom: -8,
        right: -4,
    },
});
