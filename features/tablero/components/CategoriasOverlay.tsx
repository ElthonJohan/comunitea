import React, { useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Animated,
    Dimensions,
    type ListRenderItemInfo,
} from 'react-native';
import { Fonts } from '../../../constants/Typography';
import { ghostOutline } from '../../../constants/TableroTheme';
import type { TableroThemeTokens } from '../../../constants/TableroTheme';
import { useTableroTheme } from '../../../hooks/useTableroTheme';
import { Radii, Space } from '../../../constants/Theme';
import type { CategoriaResumen } from '../hooks/useTablero';

type Row =
    | { kind: 'all' }
    | { kind: 'cat'; cat: CategoriaResumen }
    | { kind: 'new' };

type Props = {
    visible: boolean;
    top: number;
    categorias: CategoriaResumen[];
    categoriaActiva: string | null;
    onClose: () => void;
    onSelectCategoria: (id: string) => void;
    onClearCategoria: () => void;
    onNuevaCategoria?: () => void;
};

function buildRows(categorias: CategoriaResumen[]): Row[] {
    return [{ kind: 'all' }, ...categorias.map((c) => ({ kind: 'cat' as const, cat: c })), { kind: 'new' }];
}

export default function CategoriasOverlay({
    visible,
    top,
    categorias,
    categoriaActiva,
    onClose,
    onSelectCategoria,
    onClearCategoria,
    onNuevaCategoria,
}: Props) {
    const T = useTableroTheme();
    const styles = useMemo(() => createCategoriasOverlayStyles(T), [T]);
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-16)).current;
    const rows = buildRows(categorias);

    useEffect(() => {
        if (visible) {
            translateY.setValue(-16);
            opacity.setValue(0);
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 9,
                    tension: 65,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, opacity, translateY]);

    const renderItem = ({ item }: ListRenderItemInfo<Row>) => {
        if (item.kind === 'all') {
            return (
                <TouchableOpacity
                    style={[styles.item, !categoriaActiva && styles.itemActive]}
                    onPress={() => {
                        onClearCategoria();
                        onClose();
                    }}
                    accessibilityRole="button"
                    activeOpacity={0.9}
                >
                    <Text style={styles.itemEmoji}>📂</Text>
                    <View style={styles.col}>
                        <Text style={styles.itemTitle}>Todas las categorías</Text>
                        <Text style={styles.itemMeta}>Ver todo el tablero</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
            );
        }
        if (item.kind === 'new') {
            return (
                <TouchableOpacity
                    style={[styles.item, styles.itemNew]}
                    onPress={() => onNuevaCategoria?.()}
                    accessibilityRole="button"
                    activeOpacity={0.9}
                >
                    <Text style={styles.itemEmoji}>➕</Text>
                    <View style={styles.col}>
                        <Text style={styles.itemTitle}>Nueva categoría</Text>
                        <Text style={styles.itemMeta}>Personalizar</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
            );
        }
        const active = categoriaActiva === item.cat.id;
        return (
            <TouchableOpacity
                style={[styles.item, active && styles.itemActive]}
                onPress={() => onSelectCategoria(item.cat.id)}
                accessibilityRole="button"
                activeOpacity={0.9}
            >
                <Text style={styles.itemEmoji}>{item.cat.emoji}</Text>
                <View style={styles.col}>
                    <Text style={styles.itemTitle}>{item.cat.nombre}</Text>
                    <Text style={styles.itemMeta}>{item.cat.pictogramCount} pictogramas</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Animated.View
            pointerEvents={visible ? 'auto' : 'none'}
            style={[
                styles.shell,
                {
                    top,
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Categorías</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeHit} accessibilityLabel="Cerrar">
                    <Text style={styles.closeText}>✕ cerrar</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={rows}
                keyExtractor={(r, i) =>
                    r.kind === 'all' ? 'all' : r.kind === 'new' ? 'new' : r.cat.id + i
                }
                contentContainerStyle={styles.list}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={{ height: Space.md }} />}
                keyboardShouldPersistTaps="handled"
            />
        </Animated.View>
    );
}

const { height: SCREEN_H } = Dimensions.get('window');

function createCategoriasOverlayStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
    shell: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: T.overlayBg,
        zIndex: 100,
        maxHeight: SCREEN_H,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Space.md,
        paddingVertical: Space.md,
        backgroundColor: T.overlayHeaderBg,
        marginBottom: Space.sm,
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: Fonts.displayBold,
        color: T.overlayTitle,
    },
    closeHit: {
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: Space.sm,
    },
    closeText: {
        fontSize: 14,
        fontFamily: Fonts.bodySemiBold,
        color: T.primary,
    },
    list: {
        paddingHorizontal: Space.md,
        paddingBottom: Space.xl,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: T.overlayRow,
        borderRadius: Radii.md,
        paddingVertical: Space.md,
        paddingHorizontal: Space.md,
    },
    itemActive: {
        backgroundColor: T.overlayRowActive,
        ...ghostOutline,
    },
    itemNew: {
        borderStyle: 'dashed',
        borderWidth: 1.5,
        borderColor: T.plusDash,
        backgroundColor: T.overlayNewBg,
    },
    itemEmoji: {
        fontSize: 22,
    },
    col: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 13,
        fontFamily: Fonts.bodyBold,
        color: T.overlayTitle,
    },
    itemMeta: {
        fontSize: 10,
        fontFamily: Fonts.bodySemiBold,
        color: T.overlayMeta,
        marginTop: 2,
    },
    arrow: {
        fontSize: 22,
        color: T.overlayArrow,
    },
});
}
