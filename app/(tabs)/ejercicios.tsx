import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useChildProfile } from '../../context/ChildProfileContext';
import Header from '../../features/tablero/components/Header';
import EjercicioCard from '../../features/ejercicios/components/EjercicioCard';
import { EJEMPLOS_EJERCICIOS } from '../../features/ejercicios/hooks/useEjerciciosMock';
import { useEjerciciosProgressMap } from '../../features/ejercicios/hooks/useEjerciciosProgressStore';
import { useEjerciciosG2 } from '../../features/ejercicios/hooks/useEjerciciosG2';
import { useEjerciciosG3 } from '../../features/ejercicios/hooks/useEjerciciosG3';
import { ghostOutline } from '../../constants/TableroTheme';
import type { TableroThemeTokens } from '../../constants/TableroTheme';
import type { AppColorPalette } from '../../constants/Colors';
import { useThemeColors } from '../../context/AppThemeContext';
import { useTableroTheme } from '../../hooks/useTableroTheme';
import { Fonts } from '../../constants/Typography';
import { Radii, Space, ShadowAmbientLight } from '../../constants/Theme';
import { ROUTES, hrefCategorias, hrefEjercicioMock } from '../../types/routes';
import { headerGamificationDisplay } from '../../lib/gamificationHeader';

function createEjerciciosTabStyles(T: TableroThemeTokens, c: AppColorPalette) {
    return StyleSheet.create({
        safe: {
            flex: 1,
            backgroundColor: T.screen,
        },
        list: {
            paddingTop: Space.md,
            paddingBottom: Space.xl,
        },
        caminoCardG2: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: Space.md,
            marginBottom: Space.md,
            padding: Space.md,
            borderRadius: Radii.default,
            backgroundColor: T.primaryLight,
            ...ghostOutline,
            gap: Space.md,
            ...ShadowAmbientLight,
        },
        caminoTitleG2: {
            fontSize: 17,
            fontFamily: Fonts.displayBold,
            color: c.primaryDark,
        },
        caminoArrowG2: {
            fontSize: 22,
            color: c.tertiary,
            fontFamily: Fonts.bodyBold,
        },
        caminoCard: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: Space.md,
            marginBottom: Space.md,
            padding: Space.md,
            borderRadius: Radii.default,
            backgroundColor: T.surfaceNest,
            ...ghostOutline,
            gap: Space.md,
            ...ShadowAmbientLight,
        },
        caminoEmoji: { fontSize: 36 },
        caminoTextCol: { flex: 1 },
        caminoTitle: {
            fontSize: 17,
            fontFamily: Fonts.displayBold,
            color: c.primary,
        },
        caminoSub: {
            marginTop: Space.xs,
            fontSize: 13,
            fontFamily: Fonts.body,
            color: c.text.secondary,
        },
        caminoArrow: {
            fontSize: 22,
            color: c.tertiary,
            fontFamily: Fonts.bodyBold,
        },
        resetBtn: {
            marginHorizontal: Space.md,
            marginBottom: Space.sm,
            paddingVertical: Space.sm,
            paddingHorizontal: Space.md,
            alignItems: 'center',
            borderRadius: Radii.default,
            borderWidth: 1,
            borderColor: c.text.secondary,
            backgroundColor: c.surfaceContainerLowest,
        },
        resetBtnText: {
            fontSize: 14,
            fontFamily: Fonts.bodySemiBold,
            color: c.text.secondary,
        },
        emptyRutinas: {
            paddingHorizontal: Space.lg,
            paddingVertical: Space.lg,
            alignItems: 'center',
        },
        emptyRutinasTitle: {
            fontSize: 16,
            fontFamily: Fonts.bodyBold,
            color: c.text.primary,
            textAlign: 'center',
        },
        emptyRutinasSub: {
            marginTop: Space.sm,
            fontSize: 14,
            fontFamily: Fonts.body,
            color: c.text.secondary,
            textAlign: 'center',
        },
    });
}

export default function EjerciciosScreen() {
    const T = useTableroTheme();
    const c = useThemeColors();
    const styles = useMemo(() => createEjerciciosTabStyles(T, c), [T, c]);
    const router = useRouter();
    const { profile } = useAuth();
    const { childProfile, childProgress } = useChildProfile();
    const progreso = useEjerciciosProgressMap();
    const { resetAllProgress: resetG2, hydrated: hydratedG2 } = useEjerciciosG2();
    const { resetAllProgress: resetG3, hydrated: hydratedG3 } = useEjerciciosG3();

    const childName = childProfile?.name ?? 'Niño';
    const { nivelLabel, xpProgress } = headerGamificationDisplay(
        childProgress,
        profile?.level ?? 'BASICO',
    );

    const openEjercicio = useCallback(
        (id: string) => {
            router.push(hrefEjercicioMock(id));
        },
        [router],
    );

    const openCaminoG3 = useCallback(() => {
        router.push(ROUTES.ejerciciosGrupo3);
    }, [router]);

    const openCaminoG2 = useCallback(() => {
        router.push(ROUTES.ejerciciosGrupo2);
    }, [router]);

    const onReiniciarTodosEjercicios = useCallback(() => {
        Alert.alert(
            'Reiniciar todos los ejercicios',
            'Se borrará el progreso del Grupo 2 y del Grupo 3 (niveles, estrellas y fallos). ¿Seguro?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Reiniciar',
                    style: 'destructive',
                    onPress: () => {
                        resetG2();
                        void resetG3();
                    },
                },
            ],
        );
    }, [resetG2, resetG3]);

    const headerCamino = (
        <>
            <TouchableOpacity style={styles.caminoCardG2} onPress={openCaminoG2} activeOpacity={0.9}>
                <Text style={styles.caminoEmoji}>🧭</Text>
                <View style={styles.caminoTextCol}>
                    <Text style={styles.caminoTitleG2}>Práctica intermedia</Text>
                    <Text style={styles.caminoSub}>Grupo 2 · TEA nivel moderado</Text>
                </View>
                <Text style={styles.caminoArrowG2}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.caminoCard} onPress={openCaminoG3} activeOpacity={0.9}>
                <Text style={styles.caminoEmoji}>🛤️</Text>
                <View style={styles.caminoTextCol}>
                    <Text style={styles.caminoTitle}>El Camino de los Pictos</Text>
                    <Text style={styles.caminoSub}>Grupo 3 · TEA nivel severo</Text>
                </View>
                <Text style={styles.caminoArrow}>→</Text>
            </TouchableOpacity>
            {hydratedG2 && hydratedG3 ? (
                <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={onReiniciarTodosEjercicios}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Reiniciar todos los ejercicios del Grupo 2 y Grupo 3"
                >
                    <Text style={styles.resetBtnText}>Reiniciar todos los ejercicios</Text>
                </TouchableOpacity>
            ) : null}
        </>
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <Header
                childName={childName}
                nivelLabel={nivelLabel}
                xpProgress={xpProgress}
                avatarUri={childProfile?.avatar_url}
                initialLetter={childName.charAt(0)}
                showNavIcons
                onPressHome={() => router.replace(hrefCategorias())}
                onPressStar={() => router.replace(ROUTES.perfil)}
                onPressSettings={() => router.push(ROUTES.settings)}
            />
            <FlatList
                data={EJEMPLOS_EJERCICIOS}
                keyExtractor={(e) => e.id}
                ListHeaderComponent={headerCamino}
                ListEmptyComponent={
                    <View style={styles.emptyRutinas}>
                        <Text style={styles.emptyRutinasTitle}>Sin rutinas de ejemplo</Text>
                        <Text style={styles.emptyRutinasSub}>
                            Puedes crear actividades guiadas desde Ajustes → Actividades guiadas.
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <EjercicioCard
                        nombre={item.nombre}
                        hora={item.hora}
                        pasos={item.pasos}
                        completados={progreso[item.id] ?? 0}
                        emoji={item.emoji}
                        onPress={() => openEjercicio(item.id)}
                    />
                )}
            />
        </SafeAreaView>
    );
}
