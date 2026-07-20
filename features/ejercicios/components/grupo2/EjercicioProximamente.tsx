import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Fonts } from '../../../../constants/Typography';

type Props = {
    /** Marca el ejercicio como hecho y sigue el flujo de feedback del padre. */
    onSeguir: () => void;
    /** Vuelve al mapa del grupo 2 sin completar (por si el adulto prefiere salir). */
    onIrAlMapa: () => void;
};

/**
 * Placeholder para ejercicios 4–6 mientras se añade contenido.
 */
export function EjercicioProximamente({ onSeguir, onIrAlMapa }: Props) {
    return (
        <View style={styles.wrap} accessibilityRole="summary">
            <Text style={styles.emoji} accessibilityLabel="Próximamente">
                🌟
            </Text>
            <Text style={styles.title}>¡Próximamente!</Text>
            <Text style={styles.sub}>Aquí vendrán más juegos muy pronto.</Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={onSeguir} activeOpacity={0.9}>
                <Text style={styles.btnPrimaryTxt}>Seguir →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGhost} onPress={onIrAlMapa} activeOpacity={0.85}>
                <Text style={styles.btnGhostTxt}>Volver al mapa</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 12,
    },
    emoji: { fontSize: 72, marginBottom: 12 },
    title: {
        fontSize: 24,
        fontFamily: Fonts.displayBold,
        color: '#3949AB',
        textAlign: 'center',
        marginBottom: 8,
    },
    sub: {
        fontSize: 16,
        fontFamily: Fonts.body,
        color: '#616161',
        textAlign: 'center',
        marginBottom: 28,
        maxWidth: 300,
    },
    btnPrimary: {
        backgroundColor: '#3949AB',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        minWidth: 220,
        minHeight: 72,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    btnPrimaryTxt: { color: '#fff', fontSize: 18, fontFamily: Fonts.bodyBold },
    btnGhost: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        minHeight: 48,
        justifyContent: 'center',
    },
    btnGhostTxt: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: '#5C35A0' },
});
