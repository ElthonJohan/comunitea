import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { NivelBadge, NivelBadgeEstado } from './NivelBadge';
import { G3_GREEN, G3_GREY } from '../../../../constants/ejerciciosGrupo3';

type Props = {
    estados: NivelBadgeEstado[];
    estrellas: (0 | 1 | 2 | 3)[];
    onSelectNivel: (nivel: number) => void;
    /** Nombres por nivel (p. ej. Grupo 2) */
    levelNames?: Record<number, string>;
    scrollContentBackgroundColor?: string;
};

function Conector({ completado }: { completado: boolean }) {
    const h = 36;
    const color = completado ? G3_GREEN : G3_GREY;
    return (
        <View style={styles.connectorWrap}>
            <Svg width={4} height={h}>
                <Line
                    x1={2}
                    y1={0}
                    x2={2}
                    y2={h}
                    stroke={color}
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                />
            </Svg>
        </View>
    );
}

export function MapaCamino({
    estados,
    estrellas,
    onSelectNivel,
    levelNames,
    scrollContentBackgroundColor,
}: Props) {
    return (
        <ScrollView
            contentContainerStyle={[styles.scroll, scrollContentBackgroundColor ? { backgroundColor: scrollContentBackgroundColor } : null]}
            style={scrollContentBackgroundColor ? { backgroundColor: scrollContentBackgroundColor } : undefined}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.col}>
                {[1, 2, 3, 4, 5].map((n, idx) => (
                    <React.Fragment key={n}>
                        <NivelBadge
                            nivel={n}
                            estado={estados[idx]}
                            estrellas={estrellas[idx]}
                            nombre={levelNames?.[n]}
                            onPress={() => onSelectNivel(n)}
                        />
                        {idx < 4 ? <Conector completado={estados[idx] === 'completado'} /> : null}
                    </React.Fragment>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        paddingVertical: 16,
        paddingBottom: 32,
        alignItems: 'center',
    },
    col: {
        alignItems: 'center',
    },
    connectorWrap: {
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
