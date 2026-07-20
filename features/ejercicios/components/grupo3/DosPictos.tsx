import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { TUTORIAL_POINTING_HAND_PNG } from '../../../../constants/tutorialHandAsset';
import { Fonts } from '../../../../constants/Typography';
import type { G3Side } from '../../../../constants/ejerciciosGrupo3';
import { FeedbackIncorrecto } from './FeedbackIncorrecto';

type Picto = { emoji: string; label: string };

type Props = {
    left: Picto;
    right: Picto;
    correct: G3Side;
    onCorrect: () => void;
    onWrong: (side: G3Side) => void;
    wrongSide: G3Side | null;
    dimWrong: G3Side | null;
    instruccion: string;
    showFinger?: boolean;
};

const BOX = 130;
const R = 16;

export function DosPictos({
    left,
    right,
    correct,
    onCorrect,
    onWrong,
    wrongSide,
    dimWrong,
    instruccion,
    showFinger,
}: Props) {
    const hit = (side: G3Side) => {
        if (side === correct) onCorrect();
        else onWrong(side);
    };

    const cell = (side: G3Side, p: Picto) => {
        const isDim = dimWrong === side;
        return (
            <Pressable
                style={[styles.box, isDim && styles.dim]}
                onPress={() => hit(side)}
                accessibilityLabel={p.label}
            >
                <Text style={styles.emoji}>{p.emoji}</Text>
                <Text style={styles.label}>{p.label}</Text>
                {wrongSide === side ? (
                    <FeedbackIncorrecto active instruccion={instruccion} style={styles.xMark} />
                ) : null}
            </Pressable>
        );
    };

    return (
        <View style={styles.row}>
            {cell('left', left)}
            {cell('right', right)}
            {showFinger ? (
                <View style={styles.finger} pointerEvents="none">
                    <Image source={TUTORIAL_POINTING_HAND_PNG} style={styles.fingerImg} accessibilityLabel="" />
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        position: 'relative',
    },
    box: {
        width: BOX,
        height: BOX,
        borderRadius: R,
        backgroundColor: '#E3F2FD',
        borderWidth: 3,
        borderColor: '#90CAF9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dim: {
        opacity: 0.4,
    },
    emoji: {
        fontSize: 56,
    },
    label: {
        marginTop: 6,
        fontSize: 12,
        fontFamily: Fonts.bodyBold,
        color: '#1565C0',
    },
    finger: {
        position: 'absolute',
        bottom: -40,
    },
    fingerImg: {
        width: 44,
        height: 44,
        resizeMode: 'contain',
    },
    xMark: {
        top: 4,
        right: 4,
    },
});
