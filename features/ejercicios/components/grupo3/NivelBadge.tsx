import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '../../../../constants/Typography';
import {
    G3_PRIMARY,
    G3_GREEN,
    G3_GREY,
    G3_LOCKED,
    NIVEL_G3_NOMBRES,
} from '../../../../constants/ejerciciosGrupo3';

export type NivelBadgeEstado = 'bloqueado' | 'disponible' | 'completado';

type Props = {
    nivel: number;
    estado: NivelBadgeEstado;
    estrellas: 0 | 1 | 2 | 3;
    onPress: () => void;
    /** Si se pasa, sustituye el nombre del mapa G3 */
    nombre?: string;
};

const SIZE = 64;

export function NivelBadge({ nivel, estado, estrellas, onPress, nombre: nombreProp }: Props) {
    const nombre = nombreProp ?? NIVEL_G3_NOMBRES[nivel] ?? `Nivel ${nivel}`;
    const disabled = estado === 'bloqueado';

    const circleStyle = [
        styles.circle,
        estado === 'bloqueado' && styles.circleBloqueado,
        estado === 'disponible' && styles.circleDisponible,
        estado === 'completado' && styles.circleCompletado,
    ];

    const labelColor =
        estado === 'bloqueado' ? '#9E9E9E' : estado === 'completado' ? '#2E7D32' : G3_PRIMARY;

    const content =
        estado === 'bloqueado' ? (
            <Ionicons name="lock-closed" size={28} color="#757575" />
        ) : estado === 'completado' ? (
            <Text style={styles.check}>✓</Text>
        ) : (
            <Text style={styles.numero}>{nivel}</Text>
        );

    return (
        <TouchableOpacity
            style={styles.wrap}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`${nombre}, ${estado}`}
        >
            <View style={circleStyle}>{content}</View>
            <Text style={[styles.nombre, { color: labelColor }, disabled && styles.nombreBloqueado]} numberOfLines={2}>
                {nombre}
            </Text>
            {estado === 'completado' && estrellas > 0 ? (
                <Text style={styles.stars}>{'⭐'.repeat(estrellas)}</Text>
            ) : (
                <View style={styles.starsPlaceholder} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        width: 200,
    },
    circle: {
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleBloqueado: {
        backgroundColor: G3_LOCKED,
        opacity: 0.5,
    },
    circleDisponible: {
        backgroundColor: G3_PRIMARY,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    circleCompletado: {
        backgroundColor: G3_GREEN,
    },
    numero: {
        fontSize: 26,
        fontFamily: Fonts.displayBold,
        color: '#FFFFFF',
    },
    check: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '800',
    },
    nombre: {
        marginTop: 8,
        fontSize: 13,
        fontFamily: Fonts.bodyBold,
        textAlign: 'center',
        lineHeight: 16,
    },
    nombreBloqueado: {
        opacity: 0.6,
    },
    stars: {
        marginTop: 4,
        fontSize: 12,
        letterSpacing: 2,
    },
    starsPlaceholder: { height: 18 },
});
