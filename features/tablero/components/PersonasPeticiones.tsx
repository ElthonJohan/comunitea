import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, Image } from 'react-native';
import { Fonts } from '../../../constants/Typography';
import type { TableroThemeTokens } from '../../../constants/TableroTheme';
import { Space } from '../../../constants/Theme';
import { useTableroTheme } from '../../../hooks/useTableroTheme';
import type { Pictograma } from '../data/tablero';

const PICTO_W = 72;
const PICTO_H = 72;
const PLUS_W = 72;
const PLUS_H = 72;
const ROW_LABEL_W = 58;

type Props = {
    personas: Pictograma[];
    peticiones: Pictograma[];
    onAddPersona: (p: Pictograma) => void;
    onAddPeticion: (p: Pictograma) => void;
    onAddPersonaExtra?: () => void;
    onAddPeticionExtra?: () => void;
};

type PPStyles = ReturnType<typeof createPersonasPeticionesStyles>;

function PersonaChip({ item, onPress, styles }: { item: Pictograma; onPress: () => void; styles: PPStyles }) {
    const scale = useRef(new Animated.Value(1)).current;
    const bump = () => {
        Animated.sequence([
            Animated.spring(scale, { toValue: 0.92, tension: 300, friction: 10, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, tension: 200, friction: 12, useNativeDriver: true }),
        ]).start();
    };
    return (
        <TouchableOpacity
            onPress={() => {
                bump();
                onPress();
            }}
            activeOpacity={0.88}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            accessibilityRole="button"
            accessibilityLabel={item.label}
        >
            <Animated.View
                style={[
                    styles.personaChip,
                    { width: PICTO_W, height: PICTO_H, transform: [{ scale }] },
                ]}
            >
                {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.personaImg} resizeMode="cover" />
                ) : (
                    <Text style={styles.personaEmoji}>{item.emoji}</Text>
                )}
                <Text style={styles.personaLbl} numberOfLines={1}>
                    {item.label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

function PeticionChip({ item, onPress, styles }: { item: Pictograma; onPress: () => void; styles: PPStyles }) {
    const scale = useRef(new Animated.Value(1)).current;
    const bump = () => {
        Animated.sequence([
            Animated.spring(scale, { toValue: 0.92, tension: 300, friction: 10, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, tension: 200, friction: 12, useNativeDriver: true }),
        ]).start();
    };
    return (
        <TouchableOpacity
            onPress={() => {
                bump();
                onPress();
            }}
            activeOpacity={0.88}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            accessibilityRole="button"
            accessibilityLabel={item.label}
        >
            <Animated.View
                style={[
                    styles.peticionChip,
                    { width: PICTO_W, height: PICTO_H, transform: [{ scale }] },
                ]}
            >
                <Text style={styles.peticionEmoji}>{item.emoji}</Text>
                <Text style={styles.peticionLbl} numberOfLines={1}>
                    {item.label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

function RowPlus({ onPress, styles }: { onPress: () => void; styles: PPStyles }) {
    return (
        <TouchableOpacity
            style={[styles.plusBtn, { width: PLUS_W, height: PLUS_H }]}
            onPress={onPress}
            accessibilityLabel="Agregar"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.88}
        >
            <Text style={styles.plusTxt}>+</Text>
        </TouchableOpacity>
    );
}

export default function PersonasPeticiones({
    personas,
    peticiones,
    onAddPersona,
    onAddPeticion,
    onAddPersonaExtra,
    onAddPeticionExtra,
}: Props) {
    const T = useTableroTheme();
    const styles = useMemo(() => createPersonasPeticionesStyles(T), [T]);
    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.labelPersonas} numberOfLines={1}>
                    Personas
                </Text>
                <FlatList
                    horizontal
                    data={[...personas, null]}
                    keyExtractor={(item, i) => (item ? item.id : `plus-p-${i}`)}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.hList}
                    renderItem={({ item }) =>
                        item ? (
                            <PersonaChip item={item} styles={styles} onPress={() => onAddPersona(item)} />
                        ) : (
                            <RowPlus styles={styles} onPress={() => onAddPersonaExtra?.()} />
                        )
                    }
                />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.labelPeticiones} numberOfLines={1}>
                    Peticiones
                </Text>
                <FlatList
                    horizontal
                    data={[...peticiones, null]}
                    keyExtractor={(item, i) => (item ? item.id : `plus-t-${i}`)}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.hList}
                    renderItem={({ item }) =>
                        item ? (
                            <PeticionChip item={item} styles={styles} onPress={() => onAddPeticion(item)} />
                        ) : (
                            <RowPlus styles={styles} onPress={() => onAddPeticionExtra?.()} />
                        )
                    }
                />
            </View>
        </View>
    );
}

function createPersonasPeticionesStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
    card: {
        marginTop: 8,
        marginHorizontal: 12,
        backgroundColor: T.personasCardBg,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: T.personasCardBorder,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    labelPersonas: {
        minWidth: ROW_LABEL_W,
        flexShrink: 0,
        fontSize: 8,
        fontFamily: Fonts.bodyBold,
        textTransform: 'uppercase',
        color: T.personasRowLabel,
        letterSpacing: 0.5,
    },
    labelPeticiones: {
        minWidth: ROW_LABEL_W,
        flexShrink: 0,
        fontSize: 8,
        fontFamily: Fonts.bodyBold,
        textTransform: 'uppercase',
        color: T.peticionesRowLabel,
        letterSpacing: 0.5,
    },
    hList: {
        flexGrow: 1,
        gap: 8,
        paddingVertical: 7,
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: T.personasCardDivider,
        marginHorizontal: 8,
    },
    personaChip: {
        borderRadius: 12,
        backgroundColor: T.personaChipBg,
        borderWidth: 1,
        borderColor: T.personaChipBorder,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    personaEmoji: { fontSize: 30 },
    personaImg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 2,
    },
    personaLbl: {
        fontSize: 9,
        fontFamily: Fonts.bodySemiBold,
        color: T.personaChipLabel,
        marginTop: 1,
        maxWidth: 68,
        textAlign: 'center',
    },
    peticionChip: {
        borderRadius: 12,
        backgroundColor: T.peticionChipBg,
        borderWidth: 1,
        borderColor: T.peticionChipBorder,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    peticionEmoji: { fontSize: 30 },
    peticionLbl: {
        fontSize: 9,
        fontFamily: Fonts.bodySemiBold,
        color: T.peticionChipLabel,
        marginTop: 1,
        maxWidth: 68,
        textAlign: 'center',
    },
    plusBtn: {
        borderRadius: 12,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: T.slotObjetoBorderEmpty,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    plusTxt: {
        fontSize: 18,
        color: T.personasPlusColor,
        fontFamily: Fonts.bodyBold,
    },
});
}
