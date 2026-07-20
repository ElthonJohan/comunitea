import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { PictogramaGigante } from './PictogramaGigante';
import type { G3Side } from '../../../../constants/ejerciciosGrupo3';

type Props = {
    pictoSide: G3Side;
    emoji: string;
    label: string;
    onCorrectSide: () => void;
    onEmptySide: () => void;
    showFinger?: boolean;
    fingerScale?: number;
    bounceKey?: number;
};

export function PantallaDividida({
    pictoSide,
    emoji,
    label,
    onCorrectSide,
    onEmptySide,
    showFinger,
    fingerScale,
    bounceKey,
}: Props) {
    const empty = (
        <Pressable style={styles.emptySlot} onPress={onEmptySide} accessibilityLabel="Vacío">
            <View />
        </Pressable>
    );

    const picto = (
        <PictogramaGigante
            emoji={emoji}
            label={label}
            size={120}
            emojiSize={56}
            showPulse
            showFinger={showFinger}
            fingerScale={fingerScale}
            onPress={onCorrectSide}
            bounceKey={bounceKey}
        />
    );

    return (
        <View style={styles.row}>
            <View style={styles.half}>
                {pictoSide === 'left' ? picto : empty}
            </View>
            <View style={styles.sep} />
            <View style={styles.half}>
                {pictoSide === 'right' ? picto : empty}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flex: 1,
        flexDirection: 'row',
        minHeight: 280,
    },
    half: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sep: {
        width: 1,
        backgroundColor: '#E0E0E0',
    },
    emptySlot: {
        width: 120,
        height: 120,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#BDBDBD',
    },
});
