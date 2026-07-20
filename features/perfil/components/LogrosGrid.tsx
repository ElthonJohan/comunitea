import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Fonts } from '../../../constants/Typography';
import type { TableroThemeTokens } from '../../../constants/TableroTheme';
import { useTableroTheme } from '../../../hooks/useTableroTheme';

export interface LogroItem {
    id: string;
    emoji: string;
    desbloqueado: boolean;
}

type Props = {
    logros: LogroItem[];
};

function createLogrosStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
        wrap: {
            marginTop: 22,
            paddingHorizontal: 14,
        },
        section: {
            fontSize: 17,
            fontFamily: Fonts.displayBold,
            color: T.overlayTitle,
            marginBottom: 12,
        },
        list: {
            gap: 12,
            paddingBottom: 6,
        },
        badge: {
            width: 44,
            height: 44,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
        },
        badgeOn: {
            backgroundColor: '#FFF9C4',
            borderColor: '#FFD740',
        },
        badgeOff: {
            backgroundColor: '#F5F5F5',
            borderColor: '#E0E0E0',
            opacity: 0.5,
        },
        emoji: {
            fontSize: 22,
        },
    });
}

export default function LogrosGrid({ logros }: Props) {
    const T = useTableroTheme();
    const styles = useMemo(() => createLogrosStyles(T), [T]);
    return (
        <View style={styles.wrap}>
            <Text style={styles.section}>Logros</Text>
            <FlatList
                horizontal
                data={logros}
                keyExtractor={(i) => i.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View
                        style={[styles.badge, item.desbloqueado ? styles.badgeOn : styles.badgeOff]}
                        accessibilityLabel={item.id}
                    >
                        <Text style={styles.emoji}>{item.emoji}</Text>
                    </View>
                )}
            />
        </View>
    );
}
