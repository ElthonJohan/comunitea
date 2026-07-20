import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Fonts } from '../../../../constants/Typography';
import type { G2Opt } from '../../../../constants/ejerciciosGrupo2';
import { FeedbackIncorrecto } from '../grupo3/FeedbackIncorrecto';
import { speakG2 } from '../../../../lib/speakG2';

type Props = {
    opciones: G2Opt[];
    correctoId: string;
    instruccion: string;
    pistaTras2Fallos: string;
    onCorrect: () => void;
    onWrong: () => void;
    layout?: 'row' | 'triangle';
};

const BOX = 100;

export function SeleccionDirigida({
    opciones,
    correctoId,
    instruccion,
    pistaTras2Fallos,
    onCorrect,
    onWrong,
    layout = 'row',
}: Props) {
    const [wrongMeta, setWrongMeta] = useState<{ id: string; silent: boolean } | null>(null);
    const [streak, setStreak] = useState(0);

    const hit = (o: G2Opt) => {
        if (o.id === correctoId) {
            setStreak(0);
            setWrongMeta(null);
            onCorrect();
            return;
        }
        const next = streak + 1;
        setStreak(next);
        onWrong();
        setWrongMeta({ id: o.id, silent: next === 2 });
        if (next === 2) {
            void speakG2(pistaTras2Fallos, 400);
        }
        setTimeout(() => setWrongMeta(null), 2000);
    };

    const rowStyle = layout === 'triangle' ? styles.triWrap : styles.row;

    const cell = (o: G2Opt) => (
        <Pressable
            key={o.id}
            style={[styles.box, wrongMeta?.id === o.id && styles.dim]}
            onPress={() => hit(o)}
            accessibilityLabel={o.label}
        >
            <Text style={styles.emoji}>{o.emoji}</Text>
            <Text style={styles.label}>{o.label}</Text>
            {wrongMeta?.id === o.id ? (
                <FeedbackIncorrecto
                    active
                    instruccion={instruccion}
                    style={styles.xMark}
                    speakDelayMs={250}
                    speakFn={speakG2}
                    silent={wrongMeta.silent}
                />
            ) : null}
        </Pressable>
    );

    return (
        <View style={styles.wrap}>
            <View style={rowStyle}>
                {layout === 'triangle' && opciones.length === 3 ? (
                    <>
                        <View style={styles.triTop}>
                            {cell(opciones[0]!)}
                            {cell(opciones[1]!)}
                        </View>
                        <View style={styles.triBot}>{cell(opciones[2]!)}</View>
                    </>
                ) : (
                    opciones.map((o) => cell(o))
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { alignItems: 'center' },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    triWrap: { alignItems: 'center', width: '100%' },
    triTop: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
    triBot: { marginTop: 12, alignItems: 'center' },
    box: {
        width: BOX,
        minHeight: Math.max(72, BOX),
        borderRadius: 16,
        backgroundColor: '#E3F2FD',
        borderWidth: 3,
        borderColor: '#90CAF9',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 6,
        position: 'relative',
    },
    dim: { opacity: 0.4 },
    emoji: { fontSize: 44 },
    label: { fontSize: 11, fontFamily: Fonts.bodyBold, color: '#1565C0', marginTop: 4, textAlign: 'center' },
    xMark: { top: 2, right: 2 },
});
