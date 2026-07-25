import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useChildProfile } from '../../context/ChildProfileContext';
import Header from '../../features/tablero/components/Header';
import { categoriasFromSubcats, type CategoriaResumen } from '../../features/tablero/hooks/useTablero';
import { mergeAllSubcats } from '../../features/tablero/buildMergedBoard';
import type { Subcategoria } from '../../features/tablero/data/tablero';
import type { TableroThemeTokens } from '../../constants/TableroTheme';
import { Fonts } from '../../constants/Typography';
import { useTableroTheme } from '../../hooks/useTableroTheme';
import { Radii, ShadowAmbientLight } from '../../constants/Theme';
import { ROUTES, hrefCategorias } from '../../types/routes';
import { PICTOGRAM_ASSETS } from '../../constants/PictogramAssetCatalog';
import { headerGamificationDisplay } from '../../lib/gamificationHeader';

function previewAssetForCategory(cat: CategoriaResumen, subs: Subcategoria[]) {
    const sub = subs.find((s) => s.categoriaId === cat.id);
    if (!sub?.pictogramas?.length) return undefined;
    for (const p of sub.pictogramas) {
        const src = PICTOGRAM_ASSETS[p.id];
        if (src) return src;
    }
    return undefined;
}

function createCategoriasStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
        safe: {
            flex: 1,
            backgroundColor: T.tableroCanvas,
        },
        screenTitle: {
            marginTop: 12,
            marginHorizontal: 16,
            fontSize: 22,
            fontFamily: Fonts.displayBold,
            color: T.textPrimary,
        },
        screenSub: {
            marginTop: 4,
            marginHorizontal: 16,
            marginBottom: 8,
            fontSize: 16,
            fontFamily: Fonts.bodySemiBold,
            color: T.textSecondary,
        },
        list: {
            paddingBottom: 24,
            gap: 12,
        },
        row: {
            justifyContent: 'space-between',
            gap: 12,
        },
        card: {
            backgroundColor: T.surfaceCard,
            borderRadius: Radii.lg,
            padding: 14,
            alignItems: 'center',
            minHeight: 168,
            borderWidth: 1,
            borderColor: 'rgba(29, 28, 18, 0.12)',
            ...ShadowAmbientLight,
        },
        cardImage: {
            width: 92,
            height: 92,
            marginBottom: 10,
        },
        cardEmoji: {
            fontSize: 68,
            marginBottom: 6,
        },
        cardTitle: {
            fontSize: 16,
            fontFamily: Fonts.bodyBold,
            color: T.textPrimary,
            textAlign: 'center',
        },
        cardMeta: {
            marginTop: 6,
            fontSize: 16,
            fontFamily: Fonts.bodyBold,
            color: T.textMuted,
        },
    });
}

export default function CategoriasScreen() {
    const T = useTableroTheme();
    const styles = useMemo(() => createCategoriasStyles(T), [T]);
    const router = useRouter();
    const { profile } = useAuth();
    const { childProfile, childProgress } = useChildProfile();
    const { width } = useWindowDimensions();
    const pad = 12;
    const gap = 12;
    const numCols = 2;
    const cardW = (width - pad * 2 - gap) / numCols;

    const mergedSubcats = useMemo(
        () => mergeAllSubcats(childProfile?.preferred_activities),
        [childProfile?.preferred_activities],
    );
    const categorias = useMemo(() => categoriasFromSubcats(mergedSubcats), [mergedSubcats]);

    const childName = childProfile?.name ?? 'Niño';
    const { nivelLabel, xpProgress } = headerGamificationDisplay(
        childProgress,
        profile?.level ?? 'BASICO',
    );

    const onSelect = useCallback(
        (id: string) => {
            router.push(`/(tabs)/tablero?cat=${encodeURIComponent(id)}`);
        },
        [router],
    );

    const renderItem = useCallback(
        ({ item }: { item: CategoriaResumen }) => {
            const img = previewAssetForCategory(item, mergedSubcats);
            return (
                <TouchableOpacity
                    style={[styles.card, { width: cardW }]}
                    onPress={() => onSelect(item.id)}
                    activeOpacity={0.88}
                    accessibilityRole="button"
                    accessibilityLabel={item.nombre}
                >
                    {img ? (
                        <Image source={img} style={styles.cardImage} resizeMode="contain" />
                    ) : (
                        <Text style={styles.cardEmoji}>{item.emoji}</Text>
                    )}
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.nombre}
                    </Text>
                    <Text style={styles.cardMeta}>{item.pictogramCount} pictos</Text>
                </TouchableOpacity>
            );
        },
        [cardW, mergedSubcats, onSelect, styles],
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <Header
                childName={childName}
                nivelLabel={nivelLabel}
                xpProgress={xpProgress}
                avatarUri={childProfile?.avatar_url}
                initialLetter={childName.charAt(0)}
                onPressHome={() => router.replace(hrefCategorias())}
                onPressStar={() => router.replace(ROUTES.perfil)}
                onPressSettings={() => router.push(ROUTES.settings)}
            />
            <Text style={styles.screenTitle}>Categorías</Text>
            <Text style={styles.screenSub}>Elige una categoría para ver el tablero</Text>
            <FlatList
                data={categorias}
                keyExtractor={(c) => c.id}
                numColumns={numCols}
                columnWrapperStyle={styles.row}
                contentContainerStyle={[styles.list, { paddingHorizontal: pad }]}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
