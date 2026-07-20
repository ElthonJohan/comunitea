import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useChildProfile } from '../../context/ChildProfileContext';
import Header from '../../features/tablero/components/Header';
import EstadisticasRow from '../../features/perfil/components/EstadisticasRow';
import LogrosGrid from '../../features/perfil/components/LogrosGrid';
import { buildLogrosFromUnlocked } from '../../features/perfil/data/achievements';
import { headerGamificationDisplay } from '../../lib/gamificationHeader';
import FavoritosRow from '../../features/perfil/components/FavoritosRow';
import { useTablero } from '../../features/tablero/hooks/useTablero';
import { ghostOutline } from '../../constants/TableroTheme';
import type { TableroThemeTokens } from '../../constants/TableroTheme';
import type { AppColorPalette } from '../../constants/Colors';
import { useThemeColors } from '../../context/AppThemeContext';
import { useTableroTheme } from '../../hooks/useTableroTheme';
import { Fonts } from '../../constants/Typography';
import { Radii, Space, ShadowAmbientLight } from '../../constants/Theme';
import { loadG2AyudasRegistradas, loadG2EmocionesRegistradas } from '../../features/ejercicios/hooks/useEjerciciosG2';
import { ROUTES } from '../../types/routes';
import type { VocabLevel } from '../../context/AuthContext';

const EMO_PRACTICA_G2: Record<string, string> = {
    bien: '😊 Bien',
    triste: '😢 Triste',
    cansado: '😴 Cansado',
    enojado: '😠 Enojado',
    feliz: '😊 Feliz',
    nervioso: '😰 Nervioso',
};

/** Subtítulo de ruta de vocabulario (no duplicar “Nivel X”: el nivel de juego sale de `headerGamificationDisplay`). */
const VOCAB_SUBTITLE: Record<VocabLevel, string> = {
    BASICO: 'Vocabulario esencial',
    INTERMEDIO: 'Más categorías y contextos',
    AVANZADO: 'Vocabulario completo',
};

function createPerfilScreenStyles(T: TableroThemeTokens, c: AppColorPalette) {
    return StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: T.screen,
    },
    scroll: {
        paddingBottom: 100,
    },
    emocionesCard: {
        marginHorizontal: Space.md,
        marginTop: Space.md,
        padding: Space.md,
        borderRadius: Radii.default,
        backgroundColor: T.primaryLight,
        ...ghostOutline,
        ...ShadowAmbientLight,
    },
    emocionesTitle: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: c.primaryDark,
        marginBottom: Space.sm,
    },
    emocionesLine: {
        fontSize: 15,
        fontFamily: Fonts.body,
        color: c.text.primary,
    },
    ayudasCard: {
        marginHorizontal: Space.md,
        marginTop: Space.md,
        padding: Space.md,
        borderRadius: Radii.default,
        backgroundColor: T.overlayNewBg,
        ...ghostOutline,
        ...ShadowAmbientLight,
    },
    ayudasTitle: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: c.accent,
        marginBottom: Space.sm,
    },
    ayudasLine: {
        fontSize: 15,
        fontFamily: Fonts.body,
        color: c.text.primary,
        marginBottom: Space.xs,
    },
    card: {
        marginHorizontal: Space.md,
        marginTop: Space.md,
        backgroundColor: T.perfilCardBg,
        borderRadius: Radii.default,
        paddingVertical: Space.lg,
        paddingHorizontal: Space.lg,
        alignItems: 'center',
        ...ShadowAmbientLight,
    },
    bigAvatar: {
        width: 72,
        height: 72,
        borderRadius: Radii.full,
    },
    bigAvatarPh: {
        width: 72,
        height: 72,
        borderRadius: Radii.full,
        backgroundColor: T.perfilAvatarBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bigAvatarTxt: {
        color: T.perfilAvatarText,
        fontSize: 32,
        fontFamily: Fonts.displayBold,
    },
    name: {
        marginTop: Space.md,
        fontSize: 20,
        fontFamily: Fonts.bodyBold,
        color: T.overlayTitle,
    },
    levelPrimary: {
        marginTop: 8,
        fontSize: 17,
        fontFamily: Fonts.bodyBold,
        color: T.overlayTitle,
        textAlign: 'center',
    },
    levelSubtitle: {
        marginTop: 4,
        fontSize: 14,
        fontFamily: Fonts.bodySemiBold,
        color: T.overlayMeta,
        textAlign: 'center',
        paddingHorizontal: Space.sm,
    },
    xpTrack: {
        marginTop: 14,
        width: '100%',
        maxWidth: 320,
        height: 8,
        borderRadius: 4,
        backgroundColor: T.perfilXpTrack,
        overflow: 'hidden',
    },
    xpFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: T.perfilXpFill,
    },
    settingsLink: {
        marginHorizontal: Space.md,
        marginTop: Space.lg,
        paddingVertical: 18,
        alignItems: 'center',
    },
    settingsLinkText: {
        fontSize: 17,
        fontFamily: Fonts.bodySemiBold,
        color: T.primary,
    },
});
}

export default function PerfilScreen() {
    const T = useTableroTheme();
    const c = useThemeColors();
    const styles = useMemo(() => createPerfilScreenStyles(T, c), [T, c]);
    const router = useRouter();
    const { profile } = useAuth();
    const { childProfile, childProgress } = useChildProfile();
    const { favoritos } = useTablero();
    const [emocionesG2, setEmocionesG2] = useState<string[]>([]);
    const [ayudasG2, setAyudasG2] = useState<{ situacion: string; persona: string }[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            loadG2EmocionesRegistradas().then(setEmocionesG2);
            loadG2AyudasRegistradas().then(setAyudasG2);
        }, []),
    );

    const childName = childProfile?.name ?? 'Niño';
    const vocabLevel = (profile?.level ?? 'BASICO') as VocabLevel;
    const vocabSubtitle = VOCAB_SUBTITLE[vocabLevel] ?? VOCAB_SUBTITLE.BASICO;
    const letter = childName.charAt(0).toUpperCase();
    const { nivelLabel: headerNivel, xpProgress: xpPct } = headerGamificationDisplay(
        childProgress,
        vocabLevel,
    );

    const logros = useMemo(
        () => buildLogrosFromUnlocked(childProgress?.achievements ?? []),
        [childProgress?.achievements],
    );

    const stats = useMemo(() => {
        const t = childProgress?.total_attempts ?? 0;
        const pctAciertos =
            t === 0 ? 0 : Math.round((100 * (childProgress?.correct_attempts ?? 0)) / t);
        return {
            frasesHoy: childProgress?.sentences_today ?? 0,
            diasSeguidos: childProgress?.streak_days ?? 0,
            pctAciertos,
        };
    }, [
        childProgress?.sentences_today,
        childProgress?.streak_days,
        childProgress?.correct_attempts,
        childProgress?.total_attempts,
    ]);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <Header
                childName={childName}
                nivelLabel={headerNivel}
                xpProgress={xpPct}
                avatarUri={childProfile?.avatar_url}
                initialLetter={letter}
                showNavIcons={false}
            />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    {childProfile?.avatar_url ? (
                        <Image source={{ uri: childProfile.avatar_url }} style={styles.bigAvatar} />
                    ) : (
                        <View style={styles.bigAvatarPh}>
                            <Text style={styles.bigAvatarTxt}>{letter}</Text>
                        </View>
                    )}
                    <Text style={styles.name}>{childName}</Text>
                    <Text style={styles.levelPrimary}>{headerNivel}</Text>
                    <Text style={styles.levelSubtitle}>{vocabSubtitle}</Text>
                    <View style={styles.xpTrack}>
                        <View style={[styles.xpFill, { width: `${xpPct * 100}%` }]} />
                    </View>
                </View>

                <EstadisticasRow
                    frasesHoy={stats.frasesHoy}
                    diasSeguidos={stats.diasSeguidos}
                    pctAciertos={stats.pctAciertos}
                />

                {emocionesG2.length > 0 ? (
                    <View style={styles.emocionesCard}>
                        <Text style={styles.emocionesTitle}>Cómo te sentiste en la práctica (Grupo 2)</Text>
                        <Text style={styles.emocionesLine} numberOfLines={3}>
                            {emocionesG2
                                .slice(-12)
                                .map((id) => EMO_PRACTICA_G2[id] ?? id)
                                .join(' · ')}
                        </Text>
                    </View>
                ) : null}

                {ayudasG2.length > 0 ? (
                    <View style={styles.ayudasCard}>
                        <Text style={styles.ayudasTitle}>A quién pediste ayuda (práctica Grupo 2)</Text>
                        {ayudasG2.slice(-6).map((a, i) => (
                            <Text key={`${a.situacion}-${i}`} style={styles.ayudasLine} numberOfLines={2}>
                                → {a.persona}
                            </Text>
                        ))}
                    </View>
                ) : null}

                <LogrosGrid logros={logros} />

                <FavoritosRow favoritos={favoritos} />

                <TouchableOpacity
                    style={styles.settingsLink}
                    onPress={() => router.push(ROUTES.settings)}
                    accessibilityRole="button"
                >
                    <Text style={styles.settingsLinkText}>⚙️ Ajustes para adultos</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
