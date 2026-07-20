import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Fonts } from '../../../../constants/Typography';
import type { G2Opt } from '../../../../constants/ejerciciosGrupo2';
import { FeedbackIncorrecto } from '../grupo3/FeedbackIncorrecto';
import { speakG2 } from '../../../../lib/speakG2';

export type G2CatBtn = { id: string; emoji: string; nombre: string; bg: string };

type Phase = 'A' | 'B';

type Props = {
    faseA: G2CatBtn[];
    categoriaCorrecta: string;
    vozAError: string;
    faseBPictos: G2Opt[];
    pictoCorrecto: string;
    vozB: string;
    onPhaseBFaseAError: () => void;
    onWrongPicto?: () => void;
    onComplete: () => void;
};

const CELL_W = 80;
const CELL_H = 76;

export function NavegadorCategorias({
    faseA,
    categoriaCorrecta,
    vozAError,
    faseBPictos,
    pictoCorrecto,
    vozB,
    onPhaseBFaseAError,
    onWrongPicto,
    onComplete,
}: Props) {
    const [phase, setPhase] = useState<Phase>('A');
    const [wrongCat, setWrongCat] = useState<string | null>(null);
    const [wrongPic, setWrongPic] = useState<string | null>(null);

    const pickCat = async (id: string) => {
        if (id === categoriaCorrecta) {
            setWrongCat(null);
            await speakG2(vozB, 400);
            setPhase('B');
            return;
        }
        onPhaseBFaseAError();
        setWrongCat(id);
        setTimeout(() => setWrongCat(null), 2000);
    };

    const pickPicto = async (o: G2Opt) => {
        if (o.id === pictoCorrecto) {
            onComplete();
            return;
        }
        onWrongPicto?.();
        setWrongPic(o.id);
        await speakG2(vozB, 250);
        setTimeout(() => setWrongPic(null), 2000);
    };

    if (phase === 'A') {
        return (
            <View style={styles.wrap}>
                {faseA.map((c) => (
                    <Pressable
                        key={c.id}
                        style={({ pressed }) => [
                            styles.catBtn,
                            { backgroundColor: c.bg },
                            pressed && { opacity: 0.92 },
                        ]}
                        onPress={() => pickCat(c.id)}
                    >
                        <Text style={styles.catEmoji}>{c.emoji}</Text>
                        <Text style={styles.catNombre}>{c.nombre}</Text>
                        {wrongCat === c.id ? (
                            <FeedbackIncorrecto
                                active
                                instruccion={vozAError}
                                style={styles.xCat}
                                speakDelayMs={200}
                                speakFn={speakG2}
                            />
                        ) : null}
                    </Pressable>
                ))}
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.gridWrap} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
                {faseBPictos.map((o) => (
                    <Pressable
                        key={o.id}
                        style={({ pressed }) => [
                            styles.cell,
                            wrongPic === o.id && styles.dimCell,
                            pressed && { opacity: 0.9 },
                        ]}
                        onPress={() => pickPicto(o)}
                    >
                        <Text style={styles.cellEmoji}>{o.emoji}</Text>
                        <Text style={styles.cellLabel} numberOfLines={2}>
                            {o.label}
                        </Text>
                        {wrongPic === o.id ? (
                            <FeedbackIncorrecto
                                active
                                instruccion={vozB}
                                style={styles.xCell}
                                speakDelayMs={200}
                                speakFn={speakG2}
                                silent
                            />
                        ) : null}
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    wrap: { width: '100%', gap: 12, paddingHorizontal: 4 },
    catBtn: {
        width: '100%',
        minHeight: 60,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
        position: 'relative',
    },
    catEmoji: { fontSize: 20 },
    catNombre: { fontSize: 10, fontFamily: Fonts.bodyBold, color: '#424242' },
    xCat: { position: 'absolute', top: 8, right: 8 },
    gridWrap: { paddingVertical: 8, alignItems: 'center' },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        maxWidth: 3 * CELL_W + 40,
    },
    cell: {
        width: CELL_W,
        minHeight: CELL_H,
        borderRadius: 10,
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#B39DDB',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    cellEmoji: { fontSize: 28 },
    cellLabel: {
        marginTop: 2,
        fontSize: 9,
        fontFamily: Fonts.bodyBold,
        color: '#4527A0',
        textAlign: 'center',
    },
    dimCell: { opacity: 0.45 },
    xCell: { top: 2, right: 2 },
});
