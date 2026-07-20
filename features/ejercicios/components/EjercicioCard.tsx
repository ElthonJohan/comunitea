import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Fonts } from '../../../constants/Typography';
import { ghostOutline } from '../../../constants/TableroTheme';
import type { TableroThemeTokens } from '../../../constants/TableroTheme';
import { Radii, Space, ShadowAmbientLight } from '../../../constants/Theme';
import { useTableroTheme } from '../../../hooks/useTableroTheme';
import type { EjercicioPaso } from '../hooks/useEjerciciosMock';

type Props = {
    nombre: string;
    hora: string;
    pasos: EjercicioPaso[];
    completados: number;
    emoji: string;
    onPress: () => void;
};

function createEjercicioCardStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: T.ejercicioCardBg,
            borderRadius: Radii.md,
            paddingVertical: Space.sm,
            paddingHorizontal: Space.sm,
            marginHorizontal: Space.md,
            marginBottom: Space.md,
            overflow: 'hidden',
            ...ShadowAmbientLight,
        },
        accent: {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: T.ejercicioAccentStrip,
            borderTopLeftRadius: Radii.md,
            borderBottomLeftRadius: Radii.md,
        },
        emoji: {
            fontSize: 20,
            marginLeft: Space.md,
            marginRight: Space.sm,
        },
        col: {
            flex: 1,
            minWidth: 0,
        },
        nombre: {
            fontSize: 12,
            fontFamily: Fonts.bodyBold,
            color: T.ejercicioAccent,
        },
        hora: {
            fontSize: 10,
            fontFamily: Fonts.bodySemiBold,
            color: T.ejercicioMeta,
            marginTop: 2,
        },
        pasosRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: Space.sm,
        },
        paso: {
            width: 22,
            height: 22,
            borderRadius: Radii.sm,
            justifyContent: 'center',
            alignItems: 'center',
        },
        pasoPend: {
            backgroundColor: T.surfaceCard,
            ...ghostOutline,
        },
        pasoDone: {
            backgroundColor: T.slotActiveBg,
            ...ghostOutline,
        },
        pasoEmoji: {
            fontSize: 12,
        },
    });
}

export default function EjercicioCard({
    nombre,
    hora,
    pasos,
    completados,
    emoji,
    onPress,
}: Props) {
    const T = useTableroTheme();
    const styles = useMemo(() => createEjercicioCardStyles(T), [T]);
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.9}
            accessibilityRole="button"
        >
            <View style={styles.accent} />
            <Text style={styles.emoji}>{emoji}</Text>
            <View style={styles.col}>
                <Text style={styles.nombre}>{nombre}</Text>
                <Text style={styles.hora}>{hora}</Text>
                <View style={styles.pasosRow}>
                    {pasos.map((p, i) => {
                        const done = i < completados;
                        return (
                            <View key={p.id} style={[styles.paso, done ? styles.pasoDone : styles.pasoPend]}>
                                <Text style={styles.pasoEmoji}>{p.emoji}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </TouchableOpacity>
    );
}
