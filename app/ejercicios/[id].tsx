import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import { EJEMPLOS_EJERCICIOS } from '../../features/ejercicios/hooks/useEjerciciosMock';
import {
    setEjercicioCompletados,
    useEjercicioCompletados,
} from '../../features/ejercicios/hooks/useEjerciciosProgressStore';
import { LinearGradient } from 'expo-linear-gradient';
import { ghostOutline } from '../../constants/TableroTheme';
import type { TableroThemeTokens } from '../../constants/TableroTheme';
import type { AppColorPalette } from '../../constants/Colors';
import { useThemeColors } from '../../context/AppThemeContext';
import { useTableroTheme } from '../../hooks/useTableroTheme';
import { Fonts } from '../../constants/Typography';
import { Radii, Space } from '../../constants/Theme';

function createEjercicioPasoStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
        safe: {
            flex: 1,
            backgroundColor: T.screen,
        },
        top: {
            paddingHorizontal: Space.md,
            paddingVertical: Space.sm,
        },
        back: {
            minHeight: 44,
            justifyContent: 'center',
            marginBottom: Space.xs,
        },
        backText: {
            fontSize: 16,
            fontFamily: Fonts.bodySemiBold,
            color: T.primary,
        },
        title: {
            fontSize: 18,
            fontFamily: Fonts.displayBold,
            color: T.overlayTitle,
        },
        trackOuter: {
            marginHorizontal: Space.md,
            height: 20,
            borderRadius: Radii.sm,
            backgroundColor: T.perfilXpTrack,
            overflow: 'hidden',
        },
        trackFill: {
            height: '100%',
            borderRadius: Radii.sm,
            backgroundColor: T.perfilXpFill,
        },
        body: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: Space.lg,
        },
        pictoBig: {
            width: 80,
            height: 76,
            borderRadius: Radii.default,
            backgroundColor: T.pictoBg,
            ...ghostOutline,
            justifyContent: 'center',
            alignItems: 'center',
        },
        pictoEmoji: {
            fontSize: 40,
        },
        pasoNombre: {
            marginTop: Space.md,
            fontSize: 13,
            fontFamily: Fonts.bodyBold,
            color: T.overlayTitle,
            textAlign: 'center',
        },
        pasoDesc: {
            marginTop: Space.sm,
            fontSize: 10,
            fontFamily: Fonts.bodySemiBold,
            color: T.textMuted,
            textAlign: 'center',
        },
        btnWrap: {
            marginHorizontal: Space.md,
            marginBottom: Space.md,
            borderRadius: Radii.md,
            overflow: 'hidden',
        },
        btn: {
            height: 44,
            borderRadius: Radii.md,
            justifyContent: 'center',
            alignItems: 'center',
        },
        btnText: {
            color: T.onPrimary,
            fontSize: 15,
            fontFamily: Fonts.bodyBold,
        },
    });
}

export default function EjercicioPasoScreen() {
    const T = useTableroTheme();
    const c = useThemeColors();
    const styles = useMemo(() => createEjercicioPasoStyles(T), [T]);
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const confettiRef = useRef<ConfettiCannon>(null);

    const ejercicio = useMemo(() => EJEMPLOS_EJERCICIOS.find((e) => e.id === id), [id]);

    const doneFromStore = useEjercicioCompletados(ejercicio?.id ?? '__none__');
    const total = ejercicio?.pasos.length ?? 0;
    const lastIndex = Math.max(0, total - 1);

    const [stepIndex, setStepIndex] = useState(() =>
        ejercicio ? Math.min(doneFromStore, lastIndex) : 0,
    );
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!ejercicio) return;
        const clamped = Math.min(doneFromStore, lastIndex);
        setStepIndex(clamped);
    }, [doneFromStore, ejercicio, lastIndex]);

    const current = ejercicio?.pasos[stepIndex];
    const doneCount = stepIndex;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: total > 0 ? doneCount / total : 0,
            duration: 320,
            useNativeDriver: false,
        }).start();
    }, [doneCount, total, progressAnim]);

    const barWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Math.max(0, width - 32)],
    });

    const handleListo = () => {
        if (!ejercicio) return;
        confettiRef.current?.start();
        const nextStep = stepIndex + 1;
        if (nextStep >= total) {
            setEjercicioCompletados(ejercicio.id, total);
            setTimeout(() => router.back(), 600);
        } else {
            setEjercicioCompletados(ejercicio.id, nextStep);
            setStepIndex(nextStep);
        }
    };

    if (!ejercicio || !current) {
        return (
            <SafeAreaView style={[styles.safe, { justifyContent: 'center', padding: 24 }]} edges={['top', 'bottom']}>
                <Text style={[styles.title, { textAlign: 'center', marginBottom: 16 }]}>Rutina no disponible</Text>
                <TouchableOpacity
                    style={[styles.btnWrap, { overflow: 'visible' }]}
                    onPress={() => router.back()}
                    activeOpacity={0.88}
                >
                    <LinearGradient
                        colors={[T.frasePillFrom, T.frasePillTo]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.btn}
                    >
                        <Text style={styles.btnText}>Volver</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <ConfettiCannon
                ref={confettiRef}
                count={30}
                origin={{ x: width / 2, y: 0 }}
                fadeOut
                autoStart={false}
                explosionSpeed={320}
                fallSpeed={2200}
                colors={[c.warning, c.success, c.primaryContainer, c.white]}
            />
            <View style={styles.top}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityRole="button">
                    <Text style={styles.backText}>← volver</Text>
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={2}>
                    {ejercicio.nombre}
                </Text>
            </View>

            <View style={styles.trackOuter}>
                <Animated.View style={[styles.trackFill, { width: barWidth }]} />
            </View>

            <View style={styles.body}>
                <View style={styles.pictoBig}>
                    <Text style={styles.pictoEmoji}>{current.emoji}</Text>
                </View>
                <Text style={styles.pasoNombre}>{current.nombre}</Text>
                {current.descripcion ? (
                    <Text style={styles.pasoDesc}>{current.descripcion}</Text>
                ) : (
                    <Text style={styles.pasoDesc}>Paso {stepIndex + 1} de {total}</Text>
                )}
            </View>

            <TouchableOpacity style={styles.btnWrap} onPress={handleListo} activeOpacity={0.92}>
                <LinearGradient
                    colors={[T.frasePillFrom, T.frasePillTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.btn}
                >
                    <Text style={styles.btnText}>¡Listo! ✓</Text>
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
