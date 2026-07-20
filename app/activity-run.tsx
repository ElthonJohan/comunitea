import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../features/vocabulario/hooks/useSpeech';
import { useParental } from '../lib/hooks/useParental';
import { GuidedActivity } from '../features/vocabulario/hooks/useActivities';

export default function ActivityRunScreen() {
    const { id }         = useLocalSearchParams<{ id: string }>();
    const router         = useRouter();
    const { user }       = useAuth();
    const { speak }      = useSpeech();
    const { settings }   = useParental();

    const [activity,        setActivity]        = useState<GuidedActivity | null>(null);
    const [loading,         setLoading]         = useState(true);
    const [currentStep,     setCurrentStep]     = useState(0);
    const [stepsCompleted,  setStepsCompleted]  = useState(0);
    const [finished,        setFinished]        = useState(false);
    const [advancing,       setAdvancing]       = useState(false);

    const feedbackOpacity = useRef(new Animated.Value(0)).current;

    // Cargar actividad
    useEffect(() => {
        if (!id) return;
        supabase
            .from('guided_activities')
            .select('*')
            .eq('id', id)
            .single()
            .then(({ data }) => {
                if (data) setActivity(data as GuidedActivity);
                setLoading(false);
            });
    }, [id]);

    // Reproducir label del paso actual
    useEffect(() => {
        if (!activity) return;
        const step = activity.steps[currentStep];
        if (step) speak(step.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activity, currentStep]);

    // ---------------------------------------------------------------------------
    // Feedback visual configurable por intensidad sensorial
    // ---------------------------------------------------------------------------
    const runFeedback = (): Promise<void> => {
        const intensity = settings?.animation_intensity ?? 'normal';
        if (intensity === 'none') return Promise.resolve();

        const toValue = intensity === 'soft' ? 0.45 : 0.7;

        return new Promise<void>((resolve) => {
            Animated.sequence([
                Animated.timing(feedbackOpacity, { toValue, duration: 120, useNativeDriver: true }),
                Animated.delay(380),
                Animated.timing(feedbackOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
            ]).start(() => resolve());
        });
    };

    // ---------------------------------------------------------------------------
    // Avanzar al siguiente paso
    // ---------------------------------------------------------------------------
    const handleNext = async () => {
        if (!activity || advancing) return;
        setAdvancing(true);
        await runFeedback();

        const newCompleted = stepsCompleted + 1;
        setStepsCompleted(newCompleted);

        const isLast = currentStep + 1 >= activity.steps.length;
        if (isLast) {
            // Registrar sesión para reportes
            if (user) {
                supabase.from('activity_sessions').insert({
                    user_id:         user.id,
                    activity_id:     activity.id,
                    steps_total:     activity.steps.length,
                    steps_completed: newCompleted,
                }).then(({ error }) => {
                    if (error) console.warn('[activity-run] Error al registrar sesión:', error.message);
                });
            }
            setFinished(true);
        } else {
            setCurrentStep((s) => s + 1);
        }
        setAdvancing(false);
    };

    // ---------------------------------------------------------------------------
    // Loading
    // ---------------------------------------------------------------------------
    if (loading || !activity) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <Text style={styles.loadingText}>Cargando actividad…</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ---------------------------------------------------------------------------
    // Pantalla de finalización
    // ---------------------------------------------------------------------------
    if (finished) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <Text style={{ fontSize: 80 }}>🎉</Text>
                    <Text style={styles.finishTitle}>¡Actividad completada!</Text>
                    <Text style={styles.finishSub}>
                        {stepsCompleted} de {activity.steps.length} paso{activity.steps.length !== 1 ? 's' : ''} realizados
                    </Text>
                    <TouchableOpacity style={styles.nextBtn} onPress={() => router.back()} activeOpacity={0.8}>
                        <Text style={styles.nextBtnText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ---------------------------------------------------------------------------
    // Pantalla de paso activo
    // ---------------------------------------------------------------------------
    const step   = activity.steps[currentStep];
    const isLast = currentStep + 1 >= activity.steps.length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header con cierre y progreso */}
            <View style={styles.runHeader}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={26} color={Colors.text.secondary} />
                </TouchableOpacity>
                <Text style={styles.progressText}>
                    Paso {currentStep + 1} de {activity.steps.length}
                </Text>
                {/* Reproducir de nuevo al tocar el progreso */}
                <TouchableOpacity onPress={() => step && speak(step.label)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="volume-high-outline" size={22} color={Colors.text.disabled} />
                </TouchableOpacity>
            </View>

            {/* Barra de progreso por puntos */}
            <View style={styles.dotsRow}>
                {activity.steps.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i < currentStep  && styles.dotDone,
                            i === currentStep && styles.dotActive,
                        ]}
                    />
                ))}
            </View>

            {/* Contenido del paso */}
            <View style={styles.stepContent}>
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
                <Text style={styles.stepLabel}>{step.label}</Text>
                {step.instruction ? (
                    <Text style={styles.stepInstruction}>{step.instruction}</Text>
                ) : null}
            </View>

            {/* Botón de acción */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextBtn, advancing && { opacity: 0.7 }]}
                    onPress={handleNext}
                    activeOpacity={0.85}
                    disabled={advancing}
                >
                    <Text style={styles.nextBtnText}>
                        {isLast ? '¡Finalizar! 🎉' : 'Siguiente →'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Overlay de feedback positivo */}
            <Animated.View
                pointerEvents="none"
                style={[styles.feedbackOverlay, { opacity: feedbackOpacity }]}
            >
                <Ionicons name="checkmark-circle" size={110} color={Colors.white} />
            </Animated.View>
        </SafeAreaView>
    );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
    container:       { flex: 1, backgroundColor: Colors.surface },
    centered:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
    loadingText:     { fontSize: 18, color: Colors.text.secondary },

    // Header
    runHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    progressText:    { fontSize: 16, fontWeight: '600', color: Colors.text.secondary },

    // Dots
    dotsRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 20 },
    dot:             { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
    dotDone:         { backgroundColor: Colors.success },
    dotActive:       { backgroundColor: Colors.primary, transform: [{ scale: 1.3 }] },

    // Step content
    stepContent:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
    stepEmoji:       { fontSize: 96 },
    stepLabel:       { fontSize: 32, fontWeight: '800', color: Colors.text.primary, textAlign: 'center' },
    stepInstruction: { fontSize: 18, color: Colors.text.secondary, textAlign: 'center', lineHeight: 26 },

    // Footer
    footer:          { paddingHorizontal: 32, paddingBottom: 32, paddingTop: 8 },
    nextBtn:         { backgroundColor: Colors.primary, borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
    nextBtnText:     { color: Colors.white, fontSize: 20, fontWeight: '700' },

    // Completion
    finishTitle:     { fontSize: 30, fontWeight: '800', color: Colors.text.primary, textAlign: 'center' },
    finishSub:       { fontSize: 18, color: Colors.text.secondary, textAlign: 'center' },

    // Feedback overlay
    feedbackOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#7a9b88cc',   // Colors.success con alpha
        alignItems: 'center',
        justifyContent: 'center',
    },
});
