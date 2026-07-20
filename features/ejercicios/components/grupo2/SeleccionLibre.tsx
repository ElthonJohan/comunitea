import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Fonts } from '../../../../constants/Typography';
import type { G2Opt } from '../../../../constants/ejerciciosGrupo2';

type Props = {
    opciones: [G2Opt, G2Opt];
    onPick: (opt: G2Opt) => void;
};

const BOX = 130;

export function SeleccionLibre({ opciones, onPick }: Props) {
    return (
        <View style={styles.row}>
            {opciones.map((o) => (
                <Pressable
                    key={o.id}
                    style={({ pressed }) => [styles.box, pressed && styles.pressed]}
                    onPress={() => onPick(o)}
                    accessibilityLabel={o.label}
                >
                    <Text style={styles.emoji}>{o.emoji}</Text>
                    <Text style={styles.label}>{o.label}</Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        flexWrap: 'wrap',
    },
    box: {
        width: BOX,
        minHeight: Math.max(72, BOX),
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        borderWidth: 3,
        borderColor: '#90CAF9',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    pressed: { opacity: 0.9 },
    emoji: { fontSize: 56 },
    label: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: Fonts.bodyBold,
        color: '#1565C0',
        textAlign: 'center',
    },
});
