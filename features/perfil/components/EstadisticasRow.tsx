import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../../../constants/Typography';
import type { TableroThemeTokens } from '../../../constants/TableroTheme';
import { useTableroTheme } from '../../../hooks/useTableroTheme';

type Props = {
    frasesHoy: number;
    diasSeguidos: number;
    pctAciertos: number;
};

function createEstadisticasStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
        row: {
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: 14,
            marginTop: 16,
        },
        card: {
            flex: 1,
            backgroundColor: T.statCardBg,
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 8,
            alignItems: 'center',
            minHeight: 88,
            justifyContent: 'center',
        },
        num: {
            fontSize: 22,
            fontFamily: Fonts.bodyBold,
            color: T.ejercicioAccent,
        },
        lbl: {
            fontSize: 12,
            fontFamily: Fonts.bodySemiBold,
            color: T.ejercicioMeta,
            marginTop: 8,
            textAlign: 'center',
        },
    });
}

export default function EstadisticasRow({ frasesHoy, diasSeguidos, pctAciertos }: Props) {
    const T = useTableroTheme();
    const styles = useMemo(() => createEstadisticasStyles(T), [T]);
    return (
        <View style={styles.row}>
            <View style={styles.card}>
                <Text style={styles.num}>{frasesHoy}</Text>
                <Text style={styles.lbl}>Frases hoy</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.num}>{diasSeguidos}</Text>
                <Text style={styles.lbl}>Días seguidos</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.num}>{pctAciertos}%</Text>
                <Text style={styles.lbl}>Aciertos</Text>
            </View>
        </View>
    );
}
