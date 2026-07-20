import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Fonts } from '../../../constants/Typography';
import { ghostOutline } from '../../../constants/TableroTheme';
import type { TableroThemeTokens } from '../../../constants/TableroTheme';
import { Radii, Space } from '../../../constants/Theme';
import { useTableroTheme } from '../../../hooks/useTableroTheme';
import type { Pictograma } from '../../tablero/hooks/useTablero';

type Props = {
    favoritos: Pictograma[];
    onPressPicto?: (p: Pictograma) => void;
};

function createFavoritosStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
        wrap: {
            marginTop: Space.lg,
            paddingHorizontal: Space.md,
            paddingBottom: Space.xl,
        },
        section: {
            fontSize: 17,
            fontFamily: Fonts.displayBold,
            color: T.overlayTitle,
            marginBottom: Space.md,
        },
        list: {
            gap: 12,
        },
        picto: {
            width: 64,
            minHeight: 72,
            borderRadius: Radii.default,
            backgroundColor: T.pictoBg,
            ...ghostOutline,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: Space.sm,
            paddingHorizontal: Space.sm,
        },
        emoji: {
            fontSize: 28,
        },
        lbl: {
            fontSize: 11,
            fontFamily: Fonts.bodySemiBold,
            color: T.pictoLabel,
            marginTop: 4,
            maxWidth: 60,
            textAlign: 'center',
        },
        empty: {
            fontSize: 15,
            fontFamily: Fonts.bodySemiBold,
            color: T.overlayMeta,
            paddingVertical: Space.md,
        },
    });
}

export default function FavoritosRow({ favoritos, onPressPicto }: Props) {
    const T = useTableroTheme();
    const styles = useMemo(() => createFavoritosStyles(T), [T]);
    return (
        <View style={styles.wrap}>
            <Text style={styles.section}>Pictogramas favoritos</Text>
            <FlatList
                horizontal
                data={favoritos}
                keyExtractor={(i) => i.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>Aún no hay favoritos</Text>}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.picto}
                        onPress={() => onPressPicto?.(item)}
                        accessibilityLabel={item.label}
                    >
                        <Text style={styles.emoji}>{item.emoji}</Text>
                        <Text style={styles.lbl} numberOfLines={1}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
