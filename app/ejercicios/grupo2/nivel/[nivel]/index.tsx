import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NIVEL_G2_INTRO_VOZ, NIVEL_G2_NOMBRES, G2_BG } from '../../../../../constants/ejerciciosGrupo2';
import { useEjerciciosG2 } from '../../../../../features/ejercicios/hooks/useEjerciciosG2';
import { speakG2, stopSpeakG2 } from '../../../../../lib/speakG2';
import { Fonts } from '../../../../../constants/Typography';
import { ROUTES, hrefG2Ejercicio } from '../../../../../types/routes';

export default function NivelG2IntroScreen() {
    const { nivel } = useLocalSearchParams<{ nivel: string }>();
    const router = useRouter();
    const ni = Math.min(5, Math.max(1, parseInt(nivel ?? '1', 10) || 1));
    const { firstIncompleteIndex, isLevelUnlocked, hydrated, isExerciseDone } = useEjerciciosG2();

    const segments = useMemo(() => {
        return [0, 1, 2, 3, 4, 5].map((i) => {
            if (isExerciseDone(ni, i)) return 'done' as const;
            if (i === firstIncompleteIndex(ni)) return 'current' as const;
            return 'pending' as const;
        });
    }, [ni, isExerciseDone, firstIncompleteIndex]);

    useEffect(() => {
        if (!hydrated) return;
        if (!isLevelUnlocked(ni)) {
            router.replace(ROUTES.ejerciciosGrupo2);
            return;
        }
        const intro = NIVEL_G2_INTRO_VOZ[ni] ?? '';
        speakG2(intro, 400);
        const t = setTimeout(() => {
            const idx = firstIncompleteIndex(ni);
            router.replace(hrefG2Ejercicio(ni, idx + 1));
        }, 2800);
        return () => {
            clearTimeout(t);
            stopSpeakG2();
        };
    }, [hydrated, ni, isLevelUnlocked, firstIncompleteIndex, router]);

    if (!hydrated || !isLevelUnlocked(ni)) {
        return (
            <SafeAreaView style={styles.safe}>
                <ActivityIndicator size="large" color="#3949AB" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <Text style={styles.title}>{NIVEL_G2_NOMBRES[ni]}</Text>
            <Text style={styles.sub}>Preparando ejercicios…</Text>
            <View style={styles.barRow}>
                {segments.map((s, i) => (
                    <View
                        key={i}
                        style={[
                            styles.seg,
                            s === 'done' && styles.segDone,
                            s === 'current' && styles.segCurrent,
                            s === 'pending' && styles.segPending,
                        ]}
                    />
                ))}
            </View>
            <ActivityIndicator style={{ marginTop: 24 }} size="large" color="#3949AB" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: G2_BG,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 22,
        fontFamily: Fonts.displayBold,
        color: '#3949AB',
        textAlign: 'center',
    },
    sub: {
        marginTop: 8,
        fontSize: 15,
        fontFamily: Fonts.body,
        color: '#616161',
    },
    barRow: {
        flexDirection: 'row',
        marginTop: 32,
        gap: 8,
        width: '80%',
        maxWidth: 320,
    },
    seg: {
        flex: 1,
        height: 12,
        borderRadius: 6,
    },
    segDone: { backgroundColor: '#4CAF50' },
    segCurrent: { backgroundColor: '#3949AB' },
    segPending: { backgroundColor: '#E0E0E0' },
});
