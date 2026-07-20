import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import { EjercicioBaseG2 } from '../../../../../../features/ejercicios/components/grupo2/EjercicioBaseG2';
import { SeleccionLibre } from '../../../../../../features/ejercicios/components/grupo2/SeleccionLibre';
import { SeleccionDirigida } from '../../../../../../features/ejercicios/components/grupo2/SeleccionDirigida';
import { FormadorFraseG2 } from '../../../../../../features/ejercicios/components/grupo2/FormadorFraseG2';
import { ReconocerEmocion } from '../../../../../../features/ejercicios/components/grupo2/nivel2/ReconocerEmocion';
import { UnirEmocion } from '../../../../../../features/ejercicios/components/grupo2/nivel2/UnirEmocion';
import { IdentificarEmocion } from '../../../../../../features/ejercicios/components/grupo2/nivel2/IdentificarEmocion';
import { QueNecesito } from '../../../../../../features/ejercicios/components/grupo2/nivel3/QueNecesito';
import { ComoLoDigo } from '../../../../../../features/ejercicios/components/grupo2/nivel3/ComoLoDigo';
import { AQuienLePido } from '../../../../../../features/ejercicios/components/grupo2/nivel3/AQuienLePido';
import { EjercicioProximamente } from '../../../../../../features/ejercicios/components/grupo2/EjercicioProximamente';
import { NavegadorCategorias } from '../../../../../../features/ejercicios/components/grupo2/NavegadorCategorias';
import { TableroRealEjercicio } from '../../../../../../features/ejercicios/components/grupo2/TableroRealEjercicio';
import { AvatarInterlocutor } from '../../../../../../features/ejercicios/components/grupo2/AvatarInterlocutor';
import { FeedbackCorrecto } from '../../../../../../features/ejercicios/components/grupo3/FeedbackCorrecto';
import { CelebracionNivel } from '../../../../../../features/ejercicios/components/grupo3/CelebracionNivel';
import {
    G2_BG,
    G2_EJERCICIOS_POR_NIVEL,
    G2_N1_E1,
    G2_N1_E2,
    G2_N1_E3,
    G2_N4_E1,
    G2_N4_E2,
    G2_N4_E3,
    G2_N5_E1,
    G2_N5_E2,
    G2_N5_E3,
    NIVEL_G2_EMOJI,
    NIVEL_G2_NOMBRES,
} from '../../../../../../constants/ejerciciosGrupo2';
import { useEjerciciosG2 } from '../../../../../../features/ejercicios/hooks/useEjerciciosG2';
import { useChildProfile } from '../../../../../../context/ChildProfileContext';
import { speakG2, stopSpeakG2 } from '../../../../../../lib/speakG2';
import { Fonts } from '../../../../../../constants/Typography';
import { ROUTES, hrefG2Ejercicio } from '../../../../../../types/routes';

const G2_N2_INSTR = [
    'Mira la escena y elige cómo se siente.',
    'Une cada cara con su palabra.',
    'Di cómo se siente en la escena.',
];

const G2_N3_INSTR = [
    'Piensa qué necesitas en esta situación.',
    'Elige cómo lo dices.',
    'Piensa a quién le puedes pedir ayuda.',
];

const EMOTION_NAMES: Record<string, string> = {
    feliz: 'Feliz',
    triste: 'Triste',
    enojado: 'Enojado',
    nervioso: 'Nervioso',
};

export default function EjercicioG2Screen() {
    const { nivel, id } = useLocalSearchParams<{ nivel: string; id: string }>();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const confettiBig = useRef<ConfettiCannon>(null);
    const finCaminoStarted = useRef(false);
    const { childProfile } = useChildProfile();
    const childName = childProfile?.name ?? 'Niño';

    const ni = Math.min(5, Math.max(1, parseInt(nivel ?? '1', 10) || 1));
    const ej = Math.min(G2_EJERCICIOS_POR_NIVEL, Math.max(1, parseInt(id ?? '1', 10) || 1));
    const ejIndex = ej - 1;

    const { completeExercise, registerFail, registerEmocion, registerAyudaRegistro, isLevelUnlocked, hydrated } =
        useEjerciciosG2();

    const [feedbackOk, setFeedbackOk] = useState(false);
    const [showContinue, setShowContinue] = useState(false);
    const [celebraNivel, setCelebracionNivel] = useState(false);
    const [finCaminoG2, setFinCaminoG2] = useState(false);

    const headerBase = useMemo(
        () => ({
            emojiNivel: NIVEL_G2_EMOJI[ni] ?? '⭐',
            tituloNivel: NIVEL_G2_NOMBRES[ni] ?? '',
            pasoActual: ej,
            pasosTotal: G2_EJERCICIOS_POR_NIVEL,
        }),
        [ni, ej],
    );

    const checklistNivel = useMemo(() => {
        const m: Record<number, string[]> = {
            1: [
                'Elegir sin miedo a equivocarte',
                'Seguir una consigna con pictos',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
            ],
            2: [
                'Reconocer emociones',
                'Unir cara y palabra',
                'Identificar emociones',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
            ],
            3: [
                'Qué necesito',
                'Cómo lo digo',
                'A quién le pido',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
            ],
            4: [
                'Buscar por categoría',
                'Usar el tablero como en casa',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
            ],
            5: [
                'Responder a una pregunta',
                'Hablar con la app en un turno',
                'Otra conversación con pictos',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
                'Próximo reto (pronto)',
            ],
        };
        return m[ni] ?? ['¡Muy bien!'];
    }, [ni]);

    /** Solo logros reales en la pantalla final (sin textos tipo “próximamente”). */
    const checklistCelebracion = useMemo(
        () => checklistNivel.filter((line) => !/próximo reto|muy pronto/i.test(line)),
        [checklistNivel],
    );

    useEffect(() => {
        if (!hydrated) return;
        if (!isLevelUnlocked(ni)) {
            router.replace(ROUTES.ejerciciosGrupo2);
        }
    }, [hydrated, ni, isLevelUnlocked, router]);

    useEffect(() => {
        setFeedbackOk(false);
        setShowContinue(false);
        finCaminoStarted.current = false;
    }, [ni, ej]);

    const startSuccessFeedback = useCallback(() => {
        setFeedbackOk(true);
    }, []);

    const onSpeakEmotion = useCallback(async (emotionId: string) => {
        const name = EMOTION_NAMES[emotionId] ?? emotionId;
        await speakG2(name, 200);
    }, []);

    const triggerFinCaminoG2 = useCallback(async () => {
        if (finCaminoStarted.current) return;
        finCaminoStarted.current = true;
        setFinCaminoG2(true);
        confettiBig.current?.start();
        const iv = setInterval(() => confettiBig.current?.start(), 500);
        setTimeout(() => clearInterval(iv), 4000);
        await speakG2(G2_N5_E3.vozFinal, 400);
    }, []);

    const onFeedbackDone = useCallback(async () => {
        setFeedbackOk(false);
        if (ej >= G2_EJERCICIOS_POR_NIVEL) {
            await completeExercise(ni, ejIndex);
            if (ni === 5) {
                await triggerFinCaminoG2();
            } else {
                setCelebracionNivel(true);
            }
            return;
        }
        setShowContinue(true);
    }, [ej, ni, ejIndex, completeExercise, triggerFinCaminoG2]);

    const onContinue = useCallback(async () => {
        await completeExercise(ni, ejIndex);
        setShowContinue(false);
        router.replace(hrefG2Ejercicio(ni, ej + 1));
    }, [completeExercise, ni, ejIndex, ej, router]);

    const footerContinue =
        showContinue && !celebraNivel && !finCaminoG2 ? (
            <TouchableOpacity style={styles.btnCont} onPress={onContinue} activeOpacity={0.9}>
                <Text style={styles.btnContText}>Continuar →</Text>
            </TouchableOpacity>
        ) : null;

    /* ——— Nivel 1 ——— */
    const n1e1 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N1_E1.instruccion} footer={footerContinue}>
            <SeleccionLibre
                opciones={G2_N1_E1.opciones}
                onPick={async (opt) => {
                    await speakG2(`¡Muy bien! Pediste ${opt.label}.`, 250);
                    startSuccessFeedback();
                }}
            />
        </EjercicioBaseG2>
    );

    const n1e2 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N1_E2.instruccion} footer={footerContinue}>
            <SeleccionDirigida
                layout="triangle"
                opciones={G2_N1_E2.opciones}
                correctoId={G2_N1_E2.correctoId}
                instruccion={G2_N1_E2.instruccion}
                pistaTras2Fallos={G2_N1_E2.pista}
                onCorrect={startSuccessFeedback}
                onWrong={() => void registerFail(ni, ejIndex)}
            />
        </EjercicioBaseG2>
    );

    const n1e3 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N1_E3.instruccion} footer={footerContinue}>
            <SeleccionDirigida
                layout="triangle"
                opciones={G2_N1_E3.opciones}
                correctoId={G2_N1_E3.correctoId}
                instruccion={G2_N1_E3.instruccion}
                pistaTras2Fallos={G2_N1_E3.pista}
                onCorrect={startSuccessFeedback}
                onWrong={() => void registerFail(ni, ejIndex)}
            />
        </EjercicioBaseG2>
    );

    /* ——— Nivel 2 ——— */
    const n2e1 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N2_INSTR[0]!} footer={footerContinue}>
            <ReconocerEmocion
                onRegisterFail={() => void registerFail(2, 0)}
                onCorrectChoice={(id) => void registerEmocion(id)}
                onExerciseComplete={startSuccessFeedback}
            />
        </EjercicioBaseG2>
    );

    const n2e2 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N2_INSTR[1]!} footer={footerContinue}>
            <UnirEmocion
                onRegisterFail={() => void registerFail(2, 1)}
                onSpeakEmotion={(id) => void onSpeakEmotion(id)}
                onExerciseComplete={startSuccessFeedback}
            />
        </EjercicioBaseG2>
    );

    const n2e3 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N2_INSTR[2]!} footer={footerContinue}>
            <IdentificarEmocion
                onRegisterFail={() => void registerFail(2, 2)}
                onCorrectChoice={(id) => void registerEmocion(id)}
                onExerciseComplete={startSuccessFeedback}
            />
        </EjercicioBaseG2>
    );

    /* ——— Nivel 3 ——— */
    const n3e1 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N3_INSTR[0]!} footer={footerContinue}>
            <QueNecesito onExerciseComplete={startSuccessFeedback} />
        </EjercicioBaseG2>
    );

    const n3e2 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N3_INSTR[1]!} footer={footerContinue}>
            <ComoLoDigo
                onRegisterFail={() => void registerFail(3, 1)}
                onExerciseComplete={startSuccessFeedback}
            />
        </EjercicioBaseG2>
    );

    const n3e3 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N3_INSTR[2]!} footer={footerContinue}>
            <AQuienLePido
                onRegisterFail={() => void registerFail(3, 2)}
                onAyudaRegistro={(sit, per) => void registerAyudaRegistro(sit, per)}
                onExerciseComplete={startSuccessFeedback}
            />
        </EjercicioBaseG2>
    );

    /* ——— Nivel 4 ——— */
    const n4e1 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N4_E1.vozA} speakOnMount footer={footerContinue}>
            <NavegadorCategorias
                faseA={G2_N4_E1.faseA}
                categoriaCorrecta={G2_N4_E1.categoriaCorrecta}
                vozAError={G2_N4_E1.vozAError}
                faseBPictos={G2_N4_E1.faseBPictos}
                pictoCorrecto={G2_N4_E1.pictoCorrecto}
                vozB={G2_N4_E1.vozB}
                onPhaseBFaseAError={() => void registerFail(ni, ejIndex)}
                onWrongPicto={() => void registerFail(ni, ejIndex)}
                onComplete={startSuccessFeedback}
            />
        </EjercicioBaseG2>
    );

    const n4e2 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N4_E2.vozA} speakOnMount footer={footerContinue}>
            <NavegadorCategorias
                faseA={G2_N4_E2.faseA}
                categoriaCorrecta={G2_N4_E2.categoriaCorrecta}
                vozAError={G2_N4_E2.vozAError}
                faseBPictos={G2_N4_E2.faseBPictos}
                pictoCorrecto={G2_N4_E2.pictoCorrecto}
                vozB={G2_N4_E2.vozB}
                onPhaseBFaseAError={() => void registerFail(ni, ejIndex)}
                onWrongPicto={() => void registerFail(ni, ejIndex)}
                onComplete={startSuccessFeedback}
            />
        </EjercicioBaseG2>
    );

    const n4e3 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N4_E3.instruccion} speakOnMount footer={footerContinue}>
            <TableroRealEjercicio
                childName={childName}
                minSlotsParaCompletar={2}
                idleHintMs={20000}
                idleHintText={G2_N4_E3.vozIdle}
                onPhraseComplete={startSuccessFeedback}
            />
        </EjercicioBaseG2>
    );

    /* ——— Nivel 5 ——— */
    const n5e1 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N5_E1.pregunta} speakOnMount={false} footer={footerContinue}>
            <AvatarInterlocutor pregunta={G2_N5_E1.pregunta} vozPregunta={G2_N5_E1.vozPregunta} showTimer>
                <View style={styles.n5body}>
                    <FormadorFraseG2
                        modo="cincoLibre"
                        pictos={G2_N5_E1.foodPictos}
                        requirePlayButton
                        onComplete={async () => {
                            await speakG2(G2_N5_E1.vozGracias, 300);
                            startSuccessFeedback();
                        }}
                    />
                </View>
            </AvatarInterlocutor>
        </EjercicioBaseG2>
    );

    const n5e2 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N5_E2.pregunta} speakOnMount={false} footer={footerContinue}>
            <AvatarInterlocutor pregunta={G2_N5_E2.pregunta} vozPregunta={G2_N5_E2.vozPregunta} showTimer>
                <View style={styles.emotionGrid}>
                    {G2_N5_E2.emociones.map((e) => (
                        <Pressable
                            key={e.id}
                            style={({ pressed }) => [styles.emotionBtn, pressed && { opacity: 0.9 }]}
                            onPress={async () => {
                                await registerEmocion(e.id);
                                await speakG2(e.respuesta, 300);
                                startSuccessFeedback();
                            }}
                        >
                            <Text style={styles.emotionEmoji}>{e.emoji}</Text>
                            <Text style={styles.emotionLabel}>{e.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </AvatarInterlocutor>
        </EjercicioBaseG2>
    );

    const n5e3 = (
        <EjercicioBaseG2 {...headerBase} instruccion={G2_N5_E3.pregunta} speakOnMount={false} footer={footerContinue}>
            <AvatarInterlocutor pregunta={G2_N5_E3.pregunta} vozPregunta={G2_N5_E3.vozPregunta} showTimer>
                <TableroRealEjercicio
                    childName={childName}
                    minSlotsParaCompletar={2}
                    onPhraseComplete={startSuccessFeedback}
                />
            </AvatarInterlocutor>
        </EjercicioBaseG2>
    );

    const stubProx = (
        <EjercicioBaseG2
            {...headerBase}
            instruccion="Muy pronto habrá más juegos en este nivel."
            footer={footerContinue}
        >
            <EjercicioProximamente
                onSeguir={startSuccessFeedback}
                onIrAlMapa={() => {
                    stopSpeakG2();
                    router.replace(ROUTES.ejerciciosGrupo2);
                }}
            />
        </EjercicioBaseG2>
    );

    const pickBody = (): React.ReactNode => {
        if (ni === 1) {
            if (ej === 1) return n1e1;
            if (ej === 2) return n1e2;
            if (ej === 3) return n1e3;
            return stubProx;
        }
        if (ni === 2) {
            if (ej === 1) return n2e1;
            if (ej === 2) return n2e2;
            if (ej === 3) return n2e3;
            return stubProx;
        }
        if (ni === 3) {
            if (ej === 1) return n3e1;
            if (ej === 2) return n3e2;
            if (ej === 3) return n3e3;
            return stubProx;
        }
        if (ni === 4) {
            if (ej === 1) return n4e1;
            if (ej === 2) return n4e2;
            if (ej === 3) return n4e3;
            return stubProx;
        }
        if (ej === 1) return n5e1;
        if (ej === 2) return n5e2;
        if (ej === 3) return n5e3;
        return stubProx;
    };

    const body = pickBody();

    if (!hydrated || !isLevelUnlocked(ni)) {
        return null;
    }

    const hideStdFeedback = ni === 5 && ej === G2_EJERCICIOS_POR_NIVEL && finCaminoG2;
    const feedbackSpeak = !(ni === 5 && (ej === 1 || ej === 2));

    return (
        <>
            {body}

            <FeedbackCorrecto
                visible={feedbackOk && !hideStdFeedback}
                onFinished={onFeedbackDone}
                title="¡Muy bien!"
                speakText="¡Muy bien!"
                speak={feedbackSpeak}
                speakFn={speakG2}
                hapticOnShow
            />

            <CelebracionNivel
                visible={celebraNivel}
                nivel={ni}
                checklist={checklistCelebracion}
                backgroundColor={G2_BG}
                speakFn={speakG2}
                onSeguir={() => {
                    setCelebracionNivel(false);
                    router.replace(ROUTES.ejerciciosGrupo2);
                }}
            />

            <Modal visible={finCaminoG2} transparent animationType="fade">
                <View style={styles.finWrap}>
                    <ConfettiCannon
                        ref={confettiBig}
                        count={80}
                        origin={{ x: width / 2, y: 0 }}
                        fadeOut
                        autoStart={false}
                        colors={['#FFD700', '#9575CD', '#3949AB', '#FFF']}
                    />
                    <Text style={styles.finEmoji}>👏</Text>
                    <Text style={styles.finTitle}>¡Muy bien!</Text>
                    <Text style={styles.finSub}>Ya sabes usar ComuniTEA para hablar con los demás.</Text>
                    <TouchableOpacity
                        style={styles.finBtn}
                        onPress={() => {
                            stopSpeakG2();
                            setFinCaminoG2(false);
                            router.replace(ROUTES.ejerciciosGrupo2);
                        }}
                    >
                        <Text style={styles.finBtnText}>¡Seguir el camino!</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
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
    n5body: { flex: 1, justifyContent: 'center', minHeight: 200 },
    emotionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    emotionBtn: {
        minWidth: 100,
        minHeight: 72,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: '#EDE7F6',
        borderWidth: 2,
        borderColor: '#9575CD',
        alignItems: 'center',
    },
    emotionEmoji: { fontSize: 32 },
    emotionLabel: { marginTop: 4, fontSize: 12, fontFamily: Fonts.bodyBold, color: '#4527A0' },
    finWrap: {
        flex: 1,
        backgroundColor: G2_BG,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    finEmoji: { fontSize: 72, marginBottom: 8 },
    finTitle: {
        fontSize: 28,
        fontFamily: Fonts.displayBold,
        color: '#4527A0',
        marginBottom: 8,
    },
    finSub: {
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: '#424242',
        textAlign: 'center',
        marginBottom: 28,
    },
    finBtn: {
        backgroundColor: '#7E57C2',
        paddingVertical: 16,
        paddingHorizontal: 28,
        borderRadius: 16,
        minWidth: 260,
        alignItems: 'center',
    },
    finBtnText: {
        color: '#fff',
        fontSize: 17,
        fontFamily: Fonts.bodyBold,
    },
});
