import React, { useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    FlatList,
    Animated,
    Dimensions,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../../constants/Typography';
import type { TableroThemeTokens } from '../../../constants/TableroTheme';
import { useTableroTheme } from '../../../hooks/useTableroTheme';
import { Space } from '../../../constants/Theme';
import type { Pictograma } from '../data/tablero';

const DRAWER_W = Math.min(300, Dimensions.get('window').width * 0.82);

type Kind = 'persona' | 'peticion';

type Props = {
    visible: boolean;
    kind: Kind | null;
    items: Pictograma[];
    onSelect: (p: Pictograma) => void;
    onClose: () => void;
    onAddExtra?: () => void;
};

export default function PersonasPeticionesDrawer({
    visible,
    kind,
    items,
    onSelect,
    onClose,
    onAddExtra,
}: Props) {
    const T = useTableroTheme();
    const styles = useMemo(() => createPersonasDrawerStyles(T), [T]);
    const insets = useSafeAreaInsets();
    const slide = useRef(new Animated.Value(-DRAWER_W)).current;
    const backdrop = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slide, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 9,
                    tension: 65,
                }),
                Animated.timing(backdrop, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slide, {
                    toValue: -DRAWER_W,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(backdrop, {
                    toValue: 0,
                    duration: 160,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, slide, backdrop]);

    const title = kind === 'persona' ? 'Personas' : kind === 'peticion' ? 'Peticiones' : '';

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.root} pointerEvents="box-none">
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                    <Animated.View style={[styles.backdrop, { opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }) }]} />
                </Pressable>
                <Animated.View
                    style={[
                        styles.drawer,
                        {
                            width: DRAWER_W,
                            paddingTop: insets.top + Space.sm,
                            transform: [{ translateX: slide }],
                        },
                    ]}
                >
                    <View style={styles.drawerHeader}>
                        <Text style={styles.drawerTitle}>{title}</Text>
                        <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Cerrar">
                            <Text style={styles.closeX}>✕</Text>
                        </Pressable>
                    </View>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.list}
                        ListFooterComponent={
                            onAddExtra ? (
                                <TouchableOpacity
                                    style={styles.plusRow}
                                    onPress={() => {
                                        onAddExtra();
                                        onClose();
                                    }}
                                    activeOpacity={0.88}
                                >
                                    <Text style={styles.plusTxt}>+ Agregar</Text>
                                </TouchableOpacity>
                            ) : null
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.rowChip}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                                activeOpacity={0.88}
                            >
                                {item.imageUri ? (
                                    <Image source={{ uri: item.imageUri }} style={styles.rowAvatar} resizeMode="cover" />
                                ) : (
                                    <Text style={styles.rowEmoji}>{item.emoji}</Text>
                                )}
                                <Text style={styles.rowLabel} numberOfLines={2}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </Animated.View>
            </View>
        </Modal>
    );
}

function createPersonasDrawerStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
    root: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: '#1d1c12',
    },
    drawer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: T.surfaceCard,
        borderRightWidth: 1,
        borderRightColor: 'rgba(29, 28, 18, 0.12)',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    drawerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: T.personasCardDivider,
    },
    drawerTitle: {
        fontSize: 17,
        fontFamily: Fonts.bodyBold,
        color: T.textPrimary,
    },
    closeX: {
        fontSize: 20,
        color: T.textSecondary,
        fontFamily: Fonts.bodyBold,
    },
    list: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        gap: 8,
    },
    rowChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: T.personaChipBg,
        borderWidth: 1,
        borderColor: T.personaChipBorder,
    },
    rowEmoji: {
        fontSize: 32,
    },
    rowAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    rowLabel: {
        flex: 1,
        fontSize: 15,
        fontFamily: Fonts.bodySemiBold,
        color: T.textPrimary,
    },
    plusRow: {
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: T.slotObjetoBorderEmpty,
    },
    plusTxt: {
        fontSize: 14,
        fontFamily: Fonts.bodyBold,
        color: T.personasPlusColor,
    },
});
}
