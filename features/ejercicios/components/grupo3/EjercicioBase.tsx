import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../../../../constants/Typography';
import { G3_LINEN } from '../../../../constants/ejerciciosGrupo3';
import { speakG3, stopSpeakG3 } from '../../../../lib/speakG3';

export type EjercicioSpeakBlock = {
    speak: (text: string, delayMs?: number) => Promise<void>;
    stop: () => void;
};

type Props = {
    /** Emoji del nivel (cabecera infantil). */
    emojiNivel: string;
    /** Nombre corto del nivel (sin prefijo “Nivel X ·”). */
    tituloNivel: string;
    /** Paso actual dentro del nivel (1-based). */
    pasoActual: number;
    /** Total de pasos en el nivel. */
    pasosTotal: number;
    instruccion: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    speakOnMount?: boolean;
    /** Fondo de pantalla (G3 linen por defecto) */
    backgroundColor?: string;
    /** Voz del bloque (G3 por defecto) */
    speakBlock?: EjercicioSpeakBlock;
};

export function EjercicioBase({
    emojiNivel,
    tituloNivel,
    pasoActual,
    pasosTotal,
    instruccion,
    children,
    footer,
    speakOnMount = true,
    backgroundColor = G3_LINEN,
    speakBlock = { speak: speakG3, stop: stopSpeakG3 },
}: Props) {
    const { speak, stop } = speakBlock;

    React.useEffect(() => {
        if (!speakOnMount) return;
        speak(instruccion, 600);
        return () => stop();
    }, [instruccion, speakOnMount, speak, stop]);

    const repeat = () => {
        stop();
        speak(instruccion, 200);
    };

    const currentIdx = Math.max(0, pasoActual - 1);

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Text style={styles.headerEmoji} accessibilityLabel={`Nivel: ${tituloNivel}`}>
                    {emojiNivel}
                </Text>
                <View style={styles.headerCol}>
                    <Text style={styles.tituloNivel} numberOfLines={2}>
                        {tituloNivel}
                    </Text>
                    <View style={styles.dotsRow} accessibilityRole="progressbar">
                        {Array.from({ length: pasosTotal }, (_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.progDot,
                                    i < currentIdx && styles.progDotDone,
                                    i === currentIdx && styles.progDotCurrent,
                                    i > currentIdx && styles.progDotTodo,
                                ]}
                            />
                        ))}
                    </View>
                </View>
            </View>
            <Pressable
                style={styles.bubble}
                onPress={repeat}
                accessibilityRole="button"
                accessibilityLabel="Repetir instrucción"
            >
                <Text style={styles.bubbleIcon}>🔊</Text>
                <Text style={styles.bubbleText}>{instruccion}</Text>
            </Pressable>
            <View style={styles.center}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.06)',
    },
    headerEmoji: {
        fontSize: 40,
        lineHeight: 48,
    },
    headerCol: {
        flex: 1,
        minWidth: 0,
    },
    tituloNivel: {
        fontSize: 20,
        fontFamily: Fonts.displayBold,
        color: '#3949AB',
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    progDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    progDotDone: {
        backgroundColor: '#81C784',
    },
    progDotCurrent: {
        backgroundColor: '#3949AB',
        transform: [{ scale: 1.15 }],
    },
    progDotTodo: {
        backgroundColor: '#E0E0E0',
    },
    bubble: {
        marginHorizontal: 16,
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#90CAF9',
        minHeight: 72,
    },
    bubbleIcon: {
        fontSize: 22,
    },
    bubbleText: {
        flex: 1,
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: '#1565C0',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    footer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        paddingTop: 8,
        minHeight: 72,
        justifyContent: 'flex-end',
    },
});
