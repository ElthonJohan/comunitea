import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../../features/tablero/components/Header';
import { MapaCaminoG2 } from '../../../features/ejercicios/components/grupo2/MapaCaminoG2';
import { useChildProfile } from '../../../context/ChildProfileContext';
import { useEjerciciosG2 } from '../../../features/ejercicios/hooks/useEjerciciosG2';
import { G2_BG } from '../../../constants/ejerciciosGrupo2';
import { Fonts } from '../../../constants/Typography';
import { ROUTES, hrefCategorias, hrefG2Nivel } from '../../../types/routes';
import { useAuth } from '../../../context/AuthContext';
import { headerGamificationDisplay } from '../../../lib/gamificationHeader';

export default function Grupo2MapaScreen() {
    const router = useRouter();
    const { profile } = useAuth();
    const { childProfile, childProgress } = useChildProfile();
    const { nivelBadgeState, estrellasNivel, hydrated } = useEjerciciosG2();

    const childName = childProfile?.name ?? 'Niño';
    const { nivelLabel, xpProgress } = headerGamificationDisplay(
        childProgress,
        profile?.level ?? 'BASICO',
    );

    const estados = [1, 2, 3, 4, 5].map((n) => nivelBadgeState(n));
    const estrellas = [1, 2, 3, 4, 5].map((n) => estrellasNivel(n));

    const onSelectNivel = useCallback(
        (n: number) => {
            const st = nivelBadgeState(n);
            if (st === 'bloqueado') return;
            router.push(hrefG2Nivel(n));
        },
        [nivelBadgeState, router],
    );

    if (!hydrated) {
        return <View style={[styles.safe, styles.fill]} />;
    }

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
            <View style={styles.titleWrap}>
                <Text style={styles.title}>Práctica intermedia</Text>
                <Text style={styles.sub}>Cinco pasos con apoyo visual</Text>
            </View>
            <MapaCaminoG2 estados={estados} estrellas={estrellas} onSelectNivel={onSelectNivel} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: G2_BG,
    },
    fill: {
        backgroundColor: G2_BG,
    },
    titleWrap: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
    },
    title: {
        fontSize: 22,
        fontFamily: Fonts.displayBold,
        color: '#3949AB',
        textAlign: 'center',
    },
    sub: {
        marginTop: 4,
        fontSize: 14,
        fontFamily: Fonts.body,
        color: '#616161',
        textAlign: 'center',
    },
});
