import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { EjercicioBase } from '../../../../../../features/ejercicios/components/grupo3/EjercicioBase';
import { PictogramaGigante } from '../../../../../../features/ejercicios/components/grupo3/PictogramaGigante';
import { PantallaDividida } from '../../../../../../features/ejercicios/components/grupo3/PantallaDividida';
import { DosPictos } from '../../../../../../features/ejercicios/components/grupo3/DosPictos';
import { BotonNecesidad } from '../../../../../../features/ejercicios/components/grupo3/BotonNecesidad';
import { FormadorFrase } from '../../../../../../features/ejercicios/components/grupo3/FormadorFrase';
import { FeedbackCorrecto } from '../../../../../../features/ejercicios/components/grupo3/FeedbackCorrecto';
import { CelebracionNivel } from '../../../../../../features/ejercicios/components/grupo3/CelebracionNivel';
import {
    G3_NIVEL_1,
    G3_NIVEL_2,
    G3_NIVEL_3,
    G3_NIVEL_4,
    G3_NIVEL_5,
    NIVEL_G3_EMOJI,
    NIVEL_G3_NOMBRES,
} from '../../../../../../constants/ejerciciosGrupo3';
import { useEjerciciosG3 } from '../../../../../../features/ejercicios/hooks/useEjerciciosG3';
import { speakG3 } from '../../../../../../lib/speakG3';
import { Fonts } from '../../../../../../constants/Typography';
import { ROUTES, hrefCategorias, hrefG3Ejercicio } from '../../../../../../types/routes';

export default function EjercicioG3Screen() {
    const { nivel, id } = useLocalSearchParams<{ nivel: string; id: string }>();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const confettiBig = useRef<ConfettiCannon>(null);
    const l2TimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const ni = Math.min(5, Math.max(1, parseInt(nivel ?? '1', 10) || 1));
    const ej = Math.min(3, Math.max(1, parseInt(id ?? '1', 10) || 1));
    const ejIndex = ej - 1;

    const { completeExercise, registerFail, isLevelUnlocked, hydrated, setCaminoCompleto } = useEjerciciosG3();

    const [feedbackOk, setFeedbackOk] = useState(false);
    const [showContinue, setShowContinue] = useState(false);
    const [bounceKey, setBounceKey] = useState(0);
    const [fingerScale, setFingerScale] = useState(1);
    const [l3Wrong, setL3Wrong] = useState<'left' | 'right' | null>(null);
    const [l3Dim, setL3Dim] = useState<'left' | 'right' | null>(null);
    const [l4Done, setL4Done] = useState(false);
    const [celebraNivel, setCelebracionNivel] = useState(false);
    const [finCamino, setFinCamino] = useState(false);

    const l1 = G3_NIVEL_1[ejIndex];
    const l2 = G3_NIVEL_2[ejIndex];
    const l3 = G3_NIVEL_3[ejIndex];
    const l4 = G3_NIVEL_4[ejIndex];
    const l5 = G3_NIVEL_5[ejIndex];

    const headerBase = useMemo(
        () => ({
            emojiNivel: NIVEL_G3_EMOJI[ni] ?? '⭐',
            tituloNivel: NIVEL_G3_NOMBRES[ni] ?? '',
            pasoActual: ej,
            pasosTotal: 3,
        }),
        [ni, ej],
    );

    const clearL2Timer = useCallback(() => {
        if (l2TimeoutRef.current) {
            clearTimeout(l2TimeoutRef.current);
            l2TimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        if (!isLevelUnlocked(ni)) {
            router.replace(ROUTES.ejerciciosGrupo3);
        }
    }, [hydrated, ni, isLevelUnlocked, router]);

    useEffect(() => {
        setFeedbackOk(false);
        setShowContinue(false);
        setL3Wrong(null);
        setL3Dim(null);
        setL4Done(false);
        setFingerScale(1);
        setBounceKey(0);
        clearL2Timer();
    }, [ni, ej, clearL2Timer]);

    useEffect(() => {
        if (ni !== 1 || !l1) return;
        const t = setTimeout(() => {
            setFingerScale(1.35);
            speakG3(l1.instruccion, 200);
        }, 10000);
        return () => clearTimeout(t);
    }, [ni, l1, ej]);

    useEffect(() => {
        if (ni !== 2 || !l2) return;
        clearL2Timer();
        l2TimeoutRef.current = setTimeout(() => {
            speakG3(l2.instruccion, 200);
        }, 8000);
        return clearL2Timer;
    }, [ni, l2, ej, clearL2Timer]);

    const startSuccessFeedback = useCallback(() => {
        setFeedbackOk(true);
    }, []);

    const handleL1Tap = useCallback(() => {
        if (showContinue || feedbackOk) return;
        setBounceKey((k) => k + 1);
        speakG3(`¡Bien! ${l1.bien}.`, 200);
        startSuccessFeedback();
    }, [showContinue, feedbackOk, l1.bien, startSuccessFeedback]);

    const handleL2Correct = useCallback(() => {
        clearL2Timer();
        startSuccessFeedback();
    }, [clearL2Timer, startSuccessFeedback]);

    const handleL2Empty = useCallback(() => {}, []);

    const handleL3Correct = useCallback(async () => {
        setL3Dim(null);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await new Promise((r) => setTimeout(r, 500));
        startSuccessFeedback();
    }, [startSuccessFeedback]);

    const handleL3Wrong = useCallback(
        async (side: 'left' | 'right') => {
            await registerFail(ni, ejIndex);
            setL3Wrong(side);
            setL3Dim(side);
            setTimeout(() => setL3Wrong(null), 2200);
        },
        [ni, ejIndex, registerFail],
    );

    const handleL4Press = useCallback(async () => {
        await speakG3(l4.frase, 300);
        setL4Done(true);
        startSuccessFeedback();
    }, [l4.frase, startSuccessFeedback]);

    const handleL5Complete = useCallback(async () => {
        if (ni === 5 && ej === 3) {
            await completeExercise(ni, ejIndex);
            setFinCamino(true);
            confettiBig.current?.start();
            const iv = setInterval(() => confettiBig.current?.start(), 650);
            setTimeout(() => clearInterval(iv), 5000);
            await speakG3('¡Excelente! Aprendiste a usar Comuni Tea.', 500);
            return;
        }
        startSuccessFeedback();
    }, [ni, ej, completeExercise, ejIndex, startSuccessFeedback]);

    const onFeedbackDone = useCallback(async () => {
        setFeedbackOk(false);
        if (ej >= 3) {
            await completeExercise(ni, ejIndex);
            setCelebracionNivel(true);
            return;
        }
        setShowContinue(true);
    }, [ej, ni, ejIndex, completeExercise]);

    const onContinue = useCallback(async () => {
        await completeExercise(ni, ejIndex);
        setShowContinue(false);
        router.replace(hrefG3Ejercicio(ni, ej + 1));
    }, [completeExercise, ni, ejIndex, ej, router]);

    const feedbackSpeak = ni !== 1;

    const checklistNivel = useMemo(() => {
        const m: Record<number, string[]> = {
            1: ['Tocar hace que pase algo', 'Descubriste la pantalla'],
            2: ['Elegir el dibujo correcto', 'Lo vacío no hace nada'],
            3: ['Diferenciar dibujos', 'Elegir lo que pides'],
            4: ['Pedir con un botón', 'Decir cómo te sientes'],
            5: ['Dos pasos seguidos', 'Formar un mensaje corto'],
        };
        return m[ni] ?? ['¡Muy bien!'];
    }, [ni]);

    if (!hydrated || !isLevelUnlocked(ni)) {
        return null;
    }

    const footerContinue =
        showContinue && !celebraNivel ? (
            <TouchableOpacity style={styles.btnCont} onPress={onContinue} activeOpacity={0.9}>
                <Text style={styles.btnContText}>Continuar →</Text>
            </TouchableOpacity>
        ) : null;

    const body = (
        <>
            {ni === 1 && l1 ? (
                <EjercicioBase
                    {...headerBase}
                    instruccion={l1.instruccion}
                    speakOnMount
                    footer={footerContinue}
                >
                    <View style={styles.centerWrap} pointerEvents="box-none">
                        <PictogramaGigante
                            emoji={l1.emoji}
                            label={l1.label}
                            showFinger
                            fingerScale={fingerScale}
                            bounceKey={bounceKey}
                        />
                    </View>
                </EjercicioBase>
            ) : null}

            {ni === 2 && l2 ? (
                <EjercicioBase {...headerBase} instruccion={l2.instruccion} footer={footerContinue}>
                    <PantallaDividida
                        pictoSide={l2.pictoSide}
                        emoji={l2.emoji}
                        label={l2.label}
                        onCorrectSide={handleL2Correct}
                        onEmptySide={handleL2Empty}
                        fingerScale={fingerScale}
                        bounceKey={bounceKey}
                    />
                </EjercicioBase>
            ) : null}

            {ni === 3 && l3 ? (
                <EjercicioBase {...headerBase} instruccion={l3.instruccion} footer={footerContinue}>
                    <DosPictos
                        left={l3.left}
                        right={l3.right}
                        correct={l3.correct}
                        onCorrect={handleL3Correct}
                        onWrong={handleL3Wrong}
                        wrongSide={l3Wrong}
                        dimWrong={l3Dim}
                        instruccion={`Toca la ${l3.correctoNombre}`}
                    />
                </EjercicioBase>
            ) : null}

            {ni === 4 && l4 ? (
                <EjercicioBase {...headerBase} instruccion={l4.instruccion} footer={footerContinue}>
                    <BotonNecesidad
                        situBg={l4.situBg}
                        situEmoji={l4.situEmoji}
                        need={l4.need}
                        label={l4.label}
                        onPress={handleL4Press}
                        disabled={l4Done}
                    />
                </EjercicioBase>
            ) : null}

            {ni === 5 && l5 ? (
                <EjercicioBase {...headerBase} instruccion={l5.instruccion} footer={footerContinue}>
                    <FormadorFrase
                        emoji={l5.emoji}
                        label={l5.label}
                        palabraFrase={l5.palabraFrase}
                        instruccion={l5.instruccion}
                        onComplete={handleL5Complete}
                    />
                </EjercicioBase>
            ) : null}
        </>
    );

    return (
        <>
            {ni === 1 ? (
                <Pressable style={styles.fullTap} onPress={handleL1Tap}>
                    {body}
                </Pressable>
            ) : (
                body
            )}

            <FeedbackCorrecto
                visible={feedbackOk && !(ni === 5 && ej === 3)}
                onFinished={onFeedbackDone}
                speak={feedbackSpeak}
            />

            <CelebracionNivel
                visible={celebraNivel}
                nivel={ni}
                checklist={checklistNivel}
                onSeguir={() => {
                    setCelebracionNivel(false);
                    router.replace(ROUTES.ejerciciosGrupo3);
                }}
            />

            <Modal visible={finCamino} transparent animationType="fade">
                <View style={styles.finWrap}>
                    <ConfettiCannon
                        ref={confettiBig}
                        count={60}
                        origin={{ x: width / 2, y: 0 }}
                        fadeOut
                        autoStart={false}
                        colors={['#FFD700', '#4CAF50', '#3949AB', '#FFF']}
                    />
                    <Text style={styles.finEmoji}>🎉</Text>
                    <Text style={styles.finTitle}>¡Excelente!</Text>
                    <Text style={styles.finSub}>¡Aprendiste a usar ComuniTEA!</Text>
                    <TouchableOpacity
                        style={styles.finBtn}
                        onPress={async () => {
                            setFinCamino(false);
                            await setCaminoCompleto();
                            router.replace(hrefCategorias());
                        }}
                    >
                        <Text style={styles.finBtnText}>¡Usar ComuniTEA! →</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    fullTap: { flex: 1 },
    centerWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnCont: {
        minHeight: 72,
        borderRadius: 16,
        backgroundColor: '#3949AB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnContText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: Fonts.bodyBold,
    },
    finWrap: {
        flex: 1,
        backgroundColor: '#F8F4E3',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    finEmoji: { fontSize: 80, marginBottom: 12 },
    finTitle: {
        fontSize: 32,
        fontFamily: Fonts.displayBold,
        color: '#2E7D32',
        marginBottom: 8,
    },
    finSub: {
        fontSize: 18,
        fontFamily: Fonts.bodySemiBold,
        color: '#424242',
        textAlign: 'center',
        marginBottom: 32,
    },
    finBtn: {
        backgroundColor: '#3949AB',
        paddingVertical: 16,
        paddingHorizontal: 28,
        borderRadius: 16,
        minWidth: 280,
        alignItems: 'center',
    },
    finBtnText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: Fonts.bodyBold,
    },
});
