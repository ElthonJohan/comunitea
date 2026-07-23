import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Fonts } from '../../../constants/Typography';
import type { TableroThemeTokens } from '../../../constants/TableroTheme';
import { useTableroTheme } from '../../../hooks/useTableroTheme';
import { Space } from '../../../constants/Theme';
import type { Pictograma } from '../data/tablero';

/** Radio de esquina del picto (escala leve con el tamaño). */
const R_PICTO = 16;

type Props = {
    nombre: string;
    pictogramas: Pictograma[];
    onAddPictograma: (p: Pictograma) => void;
    onPressPlus?: () => void;
    pictoWidth: number;
    pictoHeight: number;
    activePictoId?: string | null;
    /** Grupo 3 (BASICO): rejilla vertical en lugar de carrusel horizontal. */
    vertical?: boolean;
};

export default function SubcategoriaRow({
    nombre,
    pictogramas,
    onAddPictograma,
    onPressPlus,
    pictoWidth,
    pictoHeight,
    activePictoId,
    vertical = false,
}: Props) {
    const T = useTableroTheme();
    const styles = useMemo(() => createSubcategoriaRowStyles(T), [T]);
    const w = Math.round(pictoWidth + 42);
    const h = Math.round(pictoHeight + 38);
    const emojiSize = Math.min(42, Math.round(w * 0.38));

    const list = vertical ? (
        <View style={styles.vGridWrap}>
            {pictogramas.map((item) => (
                <View key={item.id} style={styles.gridCell}>
                    <PictoCell
                        styles={styles}
                        item={item}
                        onPress={() => onAddPictograma(item)}
                        w={w}
                        h={h}
                        emojiSize={emojiSize}
                        active={activePictoId === item.id}
                    />
                </View>
            ))}
        </View>
    ) : (
        <FlatList
            horizontal
            data={pictogramas}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
                <PictoCell
                    styles={styles}
                    item={item}
                    onPress={() => onAddPictograma(item)}
                    w={w}
                    h={h}
                    emojiSize={emojiSize}
                    active={activePictoId === item.id}
                />
            )}
        />
    );

    return (
        <View style={styles.wrap}>
            <View style={styles.labelRow}>
                <Text style={styles.nombre}>{nombre}</Text>
                <View style={styles.rule} />
                <TouchableOpacity
                    onPress={onPressPlus}
                    style={styles.plusBtn}
                    hitSlop={12}
                    accessibilityLabel={`Más en ${nombre}`}
                >
                    <Text style={styles.plus}>+</Text>
                </TouchableOpacity>
            </View>
            {list}
        </View>
    );
}

type SubRowStyles = ReturnType<typeof createSubcategoriaRowStyles>;

function PictoCell({
    styles,
    item,
    onPress,
    w,
    h,
    emojiSize,
    active,
}: {
    styles: SubRowStyles;
    item: Pictograma;
    onPress: () => void;
    w: number;
    h: number;
    emojiSize: number;
    active: boolean;
}) {
    const scale = useRef(new Animated.Value(1)).current;
    const ringOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(ringOpacity, {
            toValue: active ? 1 : 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    }, [active, ringOpacity]);

    const bump = () => {
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 0.92,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                tension: 200,
                friction: 12,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <TouchableOpacity
            onPress={() => {
                bump();
                onPress();
            }}
            accessibilityLabel={item.label}
            activeOpacity={0.88}
            style={styles.hit}
        >
            <Animated.View style={[styles.pictoOuter, { width: w, height: h, transform: [{ scale }] }]}>
                <View style={styles.pictoInner}>
                    <Animated.View
                        pointerEvents="none"
                        style={[styles.activeOverlay, { opacity: ringOpacity }]}
                    />
                    <Text style={[styles.emoji, styles.pictoContent, { fontSize: emojiSize }]}>{item.emoji}</Text>
                    <Text
                        style={[styles.lbl, styles.pictoContent, { maxWidth: w - 4 }]}
                        numberOfLines={1}
                    >
                        {item.label}
                    </Text>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

function createSubcategoriaRowStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
    wrap: {
        marginBottom: 0,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginBottom: 6,
        gap: Space.xs,
    },
    nombre: {
        fontSize: 12,
        fontFamily: Fonts.bodyBold,
        color: T.subcatTitle,
    },
    rule: {
        flex: 1,
        height: 1,
        backgroundColor: T.subcatHeaderRule,
    },
    plusBtn: {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plus: {
        fontSize: 12,
        color: T.subcatPlus,
        fontFamily: Fonts.bodyBold,
    },
    hList: {
        paddingHorizontal: 12,
        gap: 10,
        alignItems: 'center',
    },
    vGridWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        paddingBottom: 4,
        gap: 10,
    },
    gridCell: {
        width: '31%',
        minWidth: 88,
        alignItems: 'center',
    },
    hit: {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pictoOuter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pictoInner: {
        width: '100%',
        height: '100%',
        borderRadius: R_PICTO,
        backgroundColor: T.pictoBg,
        borderWidth: 1,
        borderColor: T.pictoBorder,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        overflow: 'hidden',
    },
    activeOverlay: {
        ...StyleSheet.absoluteFill,
        borderRadius: R_PICTO,
        backgroundColor: T.pictoActiveBg,
        borderWidth: 1.5,
        borderColor: T.pictoActiveBorder,
    },
    pictoContent: {
        zIndex: 1,
    },
    emoji: {
        textAlign: 'center',
    },
    lbl: {
        fontSize: 10,
        fontFamily: Fonts.bodySemiBold,
        color: T.pictoLabel,
        marginTop: 2,
        textAlign: 'center',
    },
});
}
