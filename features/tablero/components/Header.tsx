import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Fonts } from '../../../constants/Typography';
import { TABLERO_LAYOUT } from '../../../constants/TableroTheme';
import type { TableroThemeTokens } from '../../../constants/TableroTheme';
import { Radii, Space } from '../../../constants/Theme';
import { useTableroTheme } from '../../../hooks/useTableroTheme';

type Props = {
    childName: string;
    /** Nivel de gamificación o etiqueta auxiliar (p. ej. desde `headerGamificationDisplay`). */
    nivelLabel: string;
    /** 0–1 — barra de XP del nivel actual (p. ej. `headerGamificationDisplay` → `xpProgress`). */
    xpProgress: number;
    avatarUri?: string | null;
    initialLetter?: string;
    showNavIcons?: boolean;
    onPressHome?: () => void;
    onPressStar?: () => void;
    onPressSettings?: () => void;
};

export const HEADER_HEIGHT = TABLERO_LAYOUT.headerHeight;

export default function Header({
    childName,
    nivelLabel,
    xpProgress,
    avatarUri,
    initialLetter,
    showNavIcons = true,
    onPressHome,
    onPressStar,
    onPressSettings,
}: Props) {
    const T = useTableroTheme();
    const styles = useMemo(() => createHeaderStyles(T), [T]);
    const letter = initialLetter || childName.trim().charAt(0).toUpperCase() || '?';
    const barW = Math.max(0, Math.min(1, xpProgress)) * 100;

    return (
        <View style={styles.bar} accessibilityRole="header">
            <View style={styles.left}>
                {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                    <View style={styles.avatarPh}>
                        <Text style={styles.avatarLetter}>{letter}</Text>
                    </View>
                )}
            </View>
            <View style={styles.center}>
                <Text style={styles.name} numberOfLines={1}>
                    {childName}
                </Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{nivelLabel}</Text>
                    <View style={styles.track}>
                        <View style={[styles.fill, { width: `${barW}%` }]} />
                    </View>
                </View>
            </View>
            {showNavIcons ? (
                <View style={styles.right}>
                    <TouchableOpacity
                        onPress={onPressHome}
                        style={styles.iconHit}
                        accessibilityLabel="Inicio"
                        hitSlop={8}
                    >
                        <Text style={styles.iconEmoji}>🏠</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onPressStar}
                        style={styles.iconHit}
                        accessibilityLabel="Favoritos"
                        hitSlop={8}
                    >
                        <Text style={styles.iconEmoji}>⭐</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onPressSettings}
                        style={styles.iconHit}
                        accessibilityLabel="Ajustes"
                        hitSlop={8}
                    >
                        <Text style={styles.iconEmoji}>⚙️</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.rightSpacer} />
            )}
        </View>
    );
}

function createHeaderStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
    bar: {
        height: HEADER_HEIGHT,
        backgroundColor: T.headerBg,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    left: { marginRight: 12 },
    avatarImg: {
        width: 42,
        height: 42,
        borderRadius: Radii.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
    },
    avatarPh: {
        width: 42,
        height: 42,
        borderRadius: Radii.full,
        backgroundColor: 'rgba(255,255,255,0.22)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        color: T.headerText,
        fontSize: 18,
        fontFamily: Fonts.displayBold,
    },
    center: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        color: T.headerText,
        fontSize: 15,
        fontFamily: Fonts.bodyBold,
    },
    badge: {
        marginTop: 6,
    },
    badgeText: {
        color: 'rgba(255,255,255,0.92)',
        fontSize: 12,
        fontFamily: Fonts.bodySemiBold,
        marginBottom: 4,
    },
    track: {
        height: 6,
        borderRadius: Radii.sm,
        backgroundColor: T.xpTrackBg,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: Radii.sm,
        backgroundColor: T.xpFill,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rightSpacer: { width: 8 },
    iconHit: {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconEmoji: {
        fontSize: 24,
    },
});
}
