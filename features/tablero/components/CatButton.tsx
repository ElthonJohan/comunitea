import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '../../../constants/Typography';
import { TABLERO_LAYOUT } from '../../../constants/TableroTheme';
import type { TableroThemeTokens } from '../../../constants/TableroTheme';
import { useTableroTheme } from '../../../hooks/useTableroTheme';

type Props = {
    categoriaActiva: string | null;
    labelActiva?: string | null;
    onPress: () => void;
};

export const CAT_BUTTON_HEIGHT = TABLERO_LAYOUT.catButtonHeight;

export default function CatButton({ categoriaActiva, labelActiva, onPress }: Props) {
    const T = useTableroTheme();
    const styles = useMemo(() => createCatButtonStyles(T), [T]);
    const hasCat = !!categoriaActiva;
    const title = hasCat && labelActiva ? labelActiva : 'Ver todas las categorías';

    return (
        <View style={styles.outer}>
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={title}
                style={({ pressed }) => [styles.press, pressed && styles.pressed]}
            >
                <View style={styles.inner}>
                    <Ionicons name="grid" size={22} color={T.catButtonOnSolid} />
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                    <Text style={styles.chev}>{hasCat ? '▲' : '▼'}</Text>
                </View>
            </Pressable>
        </View>
    );
}

function createCatButtonStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
    outer: {
        marginTop: 8,
        marginHorizontal: 12,
    },
    press: {
        borderRadius: 10,
        overflow: 'hidden',
        minHeight: CAT_BUTTON_HEIGHT,
    },
    pressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.94,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 7,
        paddingHorizontal: 12,
        minHeight: CAT_BUTTON_HEIGHT,
        backgroundColor: T.catButtonSolid,
    },
    title: {
        flex: 1,
        color: T.catButtonOnSolid,
        fontSize: 14,
        fontFamily: Fonts.bodySemiBold,
        textAlign: 'center',
    },
    chev: {
        color: T.catButtonOnSolid,
        fontSize: 14,
        fontFamily: Fonts.bodyBold,
        minWidth: 24,
        textAlign: 'center',
    },
});
}
