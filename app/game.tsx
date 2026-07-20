/**
 * app/game.tsx — Modo juego PECS con 5 sub-niveles
 *
 * Sub-niveles:
 *  1 — Reconocimiento: 1 pictograma visible, el niño lo toca (sin distractores)
 *  2 — Discriminación 2: audio cue + 2 opciones
 *  3 — Discriminación 4: audio cue + 4 opciones (2×2)
 *  4 — Estructura "QUIERO + ?": contexto de frase + 4 opciones
 *  5 — Vocabulario ampliado: audio cue + 6 opciones en nivel INTERMEDIO
 *
 * Criterio de avance: ≥8/10 en 2 sesiones consecutivas → sube sub-nivel.
 * Feedback de error: borde rojo en opción errónea + borde amarillo 2s en correcta.
 * Timer visual: barra de color (verde → naranja → rojo), sin números.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { VOCABULARY, VocabularyItem } from '../constants/Vocabulary';
import { useSpeech } from '../features/vocabulario/hooks/useSpeech';
import { useParental } from '../lib/hooks/useParental';
import { useGame, GameSessionRecord } from '../features/vocabulario/hooks/useGame';
import { useAuth } from '../context/AuthContext';
import CelebrationOverlay from '../components/CelebrationOverlay';

// ── Constantes ────────────────────────────────────────────────────────────────
const TRIALS_PER_SESSION = 10;
const TIMER_SECONDS = 15;

// ── Vocabulario de emociones ──────────────────────────────────────────────────
const EMOTIONS: VocabularyItem[] = [
    { id: 'emo_feliz',       label: 'Feliz',       emoji: '😊', speechText: 'feliz'       },
    { id: 'emo_triste',      label: 'Triste',      emoji: '😢', speechText: 'triste'      },
    { id: 'emo_enojado',     label: 'Enojado',     emoji: '😠', speechText: 'enojado'     },
    { id: 'emo_asustado',    label: 'Asustado',    emoji: '😨', speechText: 'asustado'    },
    { id: 'emo_cansado',     label: 'Cansado',     emoji: '😴', speechText: 'cansado'     },
    { id: 'emo_sorprendido', label: 'Sorprendido', emoji: '😮', speechText: 'sorprendido' },
    { id: 'emo_aburrido',    label: 'Aburrido',    emoji: '😐', speechText: 'aburrido'    },
];

interface EmotionScene {
    sceneEmoji: string;
    sceneLabel: string;
    emotion: VocabularyItem;
}

const EMOTION_SCENES: EmotionScene[] = [
    { sceneEmoji: '😭', sceneLabel: 'Un niño está llorando',       emotion: EMOTIONS[1] /* triste */      },
    { sceneEmoji: '🎁', sceneLabel: 'Llegó un regalo sorpresa',    emotion: EMOTIONS[5] /* sorprendido */ },
    { sceneEmoji: '😤', sceneLabel: 'Las cosas no salen bien',     emotion: EMOTIONS[2] /* enojado */    },
    { sceneEmoji: '👻', sceneLabel: 'Algo le da mucho miedo',      emotion: EMOTIONS[3] /* asustado */   },
    { sceneEmoji: '🎉', sceneLabel: 'Una fiesta con sus amigos',   emotion: EMOTIONS[0] /* feliz */      },
    { sceneEmoji: '😪', sceneLabel: 'No durmió bien anoche',       emotion: EMOTIONS[4] /* cansado */    },
    { sceneEmoji: '📺', sceneLabel: 'No hay nada que hacer',       emotion: EMOTIONS[6] /* aburrido */   },
];

// ── Vocabulario para sentence_build ──────────────────────────────────────────
const SB_QUIERO: VocabularyItem = { id: 'sb_quiero', label: 'QUIERO', emoji: '🙋', speechText: 'quiero' };
const SB_TARGETS: VocabularyItem[] = [
    { id: 'sb_jugar',   label: 'Jugar',    emoji: '⚽', speechText: 'jugar'    },
    { id: 'sb_galleta', label: 'Galleta',  emoji: '🍪', speechText: 'galleta'  },
    { id: 'sb_jugo',    label: 'Jugo',     emoji: '🧃', speechText: 'jugo'     },
    { id: 'sb_agua',    label: 'Agua',     emoji: '💧', speechText: 'agua'     },
    { id: 'sb_dormir',  label: 'Dormir',   emoji: '😴', speechText: 'dormir'   },
    { id: 'sb_bano',    label: 'Baño',     emoji: '🚿', speechText: 'baño'     },
    { id: 'sb_musica',  label: 'Música',   emoji: '🎵', speechText: 'música'   },
    { id: 'sb_abrir',   label: 'Abrir',    emoji: '📖', speechText: 'abrir'    },
];

// ── Escenas para free_phrase ──────────────────────────────────────────────────
interface FreePhraseScene {
    sceneEmoji: string;
    sceneLabel: string;
    verbs: VocabularyItem[];
    nouns: VocabularyItem[];
}

const FREE_PHRASE_SCENES: FreePhraseScene[] = [
    {
        sceneEmoji: '🌳',
        sceneLabel: 'Un parque',
        verbs: [
            { id: 'fp_quiero', label: 'Quiero', emoji: '🙋', speechText: 'quiero' },
            { id: 'fp_veo',    label: 'Veo',    emoji: '👀', speechText: 'veo'    },
        ],
        nouns: [
            { id: 'fp_arboles', label: 'Árboles', emoji: '🌲', speechText: 'árboles' },
            { id: 'fp_jugar',   label: 'Jugar',   emoji: '⚽', speechText: 'jugar'   },
            { id: 'fp_ir',      label: 'Ir',      emoji: '🏃', speechText: 'ir'      },
            { id: 'fp_flores',  label: 'Flores',  emoji: '🌸', speechText: 'flores'  },
        ],
    },
    {
        sceneEmoji: '🍳',
        sceneLabel: 'La cocina',
        verbs: [
            { id: 'fp_quiero', label: 'Quiero', emoji: '🙋', speechText: 'quiero' },
            { id: 'fp_huelo',  label: 'Huelo',  emoji: '👃', speechText: 'huelo'  },
        ],
        nouns: [
            { id: 'fp_comer',    label: 'Comer',   emoji: '🍴', speechText: 'comer'   },
            { id: 'fp_galletas', label: 'Galletas',emoji: '🍪', speechText: 'galletas'},
            { id: 'fp_jugo',     label: 'Jugo',    emoji: '🧃', speechText: 'jugo'    },
            { id: 'fp_fruta',    label: 'Fruta',   emoji: '🍎', speechText: 'fruta'   },
        ],
    },
    {
        sceneEmoji: '🏠',
        sceneLabel: 'Mi casa',
        verbs: [
            { id: 'fp_quiero', label: 'Quiero', emoji: '🙋', speechText: 'quiero' },
            { id: 'fp_tengo',  label: 'Tengo',  emoji: '✋', speechText: 'tengo'  },
        ],
        nouns: [
            { id: 'fp_dormir',  label: 'Dormir', emoji: '😴', speechText: 'dormir'  },
            { id: 'fp_jugar2',  label: 'Jugar',  emoji: '🎮', speechText: 'jugar'   },
            { id: 'fp_hambre',  label: 'Hambre', emoji: '🍽️', speechText: 'hambre'  },
            { id: 'fp_calor',   label: 'Calor',  emoji: '🌡️', speechText: 'calor'   },
        ],
    },
    {
        sceneEmoji: '🏫',
        sceneLabel: 'La escuela',
        verbs: [
            { id: 'fp_quiero',   label: 'Quiero',   emoji: '🙋', speechText: 'quiero'   },
            { id: 'fp_necesito', label: 'Necesito', emoji: '❗', speechText: 'necesito' },
        ],
        nouns: [
            { id: 'fp_bano2',   label: 'Baño',    emoji: '🚿', speechText: 'baño'    },
            { id: 'fp_agua2',   label: 'Agua',    emoji: '💧', speechText: 'agua'    },
            { id: 'fp_ayuda',   label: 'Ayuda',   emoji: '🤝', speechText: 'ayuda'   },
            { id: 'fp_lapiz',   label: 'Un lápiz',emoji: '✏️', speechText: 'un lápiz'},
        ],
    },
];

// ── Generación de retos ───────────────────────────────────────────────────────
type ChallengeType = 'standard' | 'scene' | 'sequence' | 'category_sort' | 'emotion_scene' | 'sentence_build' | 'free_phrase';

interface Challenge {
    type: ChallengeType;
    target: VocabularyItem;
    options: VocabularyItem[];
    showSentenceContext: boolean;
    // For 'sequence' / 'sentence_build': ordered taps required
    sequence?: VocabularyItem[];
    // For 'category_sort': two category buckets
    sortCategories?: { label: string; ids: string[] }[];
    // For 'emotion_scene' / 'free_phrase': scene context
    sceneEmoji?: string;
    sceneLabel?: string;
    // For 'free_phrase': valid verb and noun option ids
    validVerbs?: string[];
    validNouns?: string[];
}

function getAllLeaves(levelKey: string): VocabularyItem[] {
    const root: VocabularyItem[] = VOCABULARY[levelKey] ?? VOCABULARY['BASICO'] ?? [];
    const leaves: VocabularyItem[] = [];
    const visit = (item: VocabularyItem) => {
        if (!item.items || item.items.length === 0) leaves.push(item);
        else item.items.forEach(visit);
    };
    root.forEach(visit);
    return leaves;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

type VocabLevel = 'BASICO' | 'INTERMEDIO' | 'AVANZADO';

function generateChallenge(sublevel: number, vocabLevel: VocabLevel = 'BASICO', extraOptions?: number): Challenge {
    const levelKey = vocabLevel;
    const optionCount = vocabLevel === 'AVANZADO' ? 4 : vocabLevel === 'INTERMEDIO' ? 3 : 2;
    const leaves = shuffle(getAllLeaves(levelKey));
    const fallback: VocabularyItem = { id: 'hola', label: 'HOLA', emoji: '👋' };
    if (leaves.length === 0) return { type: 'standard' as ChallengeType, target: fallback, options: [fallback], showSentenceContext: false };

    const target = leaves[0];
    const pool = leaves.filter(l => l.id !== target.id);
    // extraOptions: C3 adaptive — número de distractores extra (puede ser negativo)
    const adjust = extraOptions ?? 0;

    switch (sublevel) {
        case 1: {
            // Sub-nivel 1: necesidades básicas — opciones según nivel
            const distractorCount = Math.min(optionCount - 1, pool.length);
            const opts = shuffle([target, ...pool.slice(0, distractorCount)]);
            return { type: 'standard' as ChallengeType, target, options: opts, showSentenceContext: false };
        }
        case 2:
            // Sub-nivel 2: identificación de emociones
            return generateEmotionScene(vocabLevel);
        case 3: {
            const count = Math.max(1, (optionCount - 1) + adjust);
            const opts = shuffle([target, ...pool.slice(0, count)]);
            return { type: 'standard' as ChallengeType, target, options: opts, showSentenceContext: false };
        }
        case 4:
            // Sub-nivel 4: construcción de frase "QUIERO + ___"
            return generateSentenceBuild();
        case 5:
            // Sub-nivel 5: frase espontánea verbo + sustantivo
            return generateFreePhrase();
        default:
            return { type: 'standard' as ChallengeType, target, options: [target], showSentenceContext: false };
    }
}

// ── C4: Generadores de tipos de reto extendidos ───────────────────────────────

/** scene: muestra un emoji de escena y pide elegir el pictograma correcto */
function generateSceneChallenge(): Challenge {
    const leaves = shuffle(getAllLeaves('BASICO'));
    if (leaves.length < 2) return generateChallenge(3);
    const target = leaves[0];
    const opts = shuffle([target, ...leaves.slice(1, 4)]);
    return { type: 'scene', target, options: opts, showSentenceContext: false };
}

/** sequence: el usuario debe tocar 3 pictogramas en el orden correcto (rutina) */
function generateSequenceChallenge(): Challenge {
    const routine: VocabularyItem[] = [
        { id: 'sequence_1', label: 'Despertar', emoji: '⏰' },
        { id: 'sequence_2', label: 'Lavarse',   emoji: '🚿' },
        { id: 'sequence_3', label: 'Desayunar', emoji: '🍳' },
    ];
    const target = routine[0]; // target = primer paso (no usado en UI pero requerido)
    return {
        type: 'sequence',
        target,
        options: shuffle([...routine]),
        showSentenceContext: false,
        sequence: routine,
    };
}

/** category_sort: mostrar 4 ítems, el usuario elige cuál NO pertenece a la categoría */
function generateCategorySortChallenge(): Challenge {
    const allLeaves = getAllLeaves('BASICO');
    if (allLeaves.length < 5) return generateChallenge(3);
    const shuffled = shuffle(allLeaves);
    const intruder = shuffled[0];
    const group = shuffled.slice(1, 4);
    const opts = shuffle([intruder, ...group]);
    return {
        type: 'category_sort',
        target: intruder,  // the odd one out
        options: opts,
        showSentenceContext: false,
    };
}

/** Picks a random C4 adventure challenge */
export function generateC4Challenge(): Challenge {
    const roll = Math.random();
    if (roll < 0.33) return generateSceneChallenge();
    if (roll < 0.66) return generateSequenceChallenge();
    return generateCategorySortChallenge();
}

// ── Nuevos generadores de ejercicio ──────────────────────────────────────────

/** emotion_scene (sub-nivel 2): muestra escena visual → elige emoción correcta */
function generateEmotionScene(vocabLevel: VocabLevel = 'BASICO'): Challenge {
    const scene = EMOTION_SCENES[Math.floor(Math.random() * EMOTION_SCENES.length)];
    const distCount = vocabLevel === 'AVANZADO' ? 3 : 2;
    const distractors = shuffle(EMOTIONS.filter(e => e.id !== scene.emotion.id)).slice(0, distCount);
    const options = shuffle([scene.emotion, ...distractors]);
    return {
        type: 'emotion_scene',
        target: scene.emotion,
        options,
        showSentenceContext: false,
        sceneEmoji: scene.sceneEmoji,
        sceneLabel: scene.sceneLabel,
    };
}

/** sentence_build (sub-nivel 4): "QUIERO + ___" — tocar en orden correcto */
function generateSentenceBuild(): Challenge {
    const target = SB_TARGETS[Math.floor(Math.random() * SB_TARGETS.length)];
    const distractors = shuffle(SB_TARGETS.filter(t => t.id !== target.id)).slice(0, 2);
    const options = shuffle([SB_QUIERO, target, ...distractors]);
    return {
        type: 'sentence_build',
        target,
        options,
        showSentenceContext: false,
        sequence: [SB_QUIERO, target],
    };
}

/** free_phrase (sub-nivel 5): escena abierta → construir frase verbo + sustantivo */
function generateFreePhrase(): Challenge {
    const scene = FREE_PHRASE_SCENES[Math.floor(Math.random() * FREE_PHRASE_SCENES.length)];
    const options = shuffle([...scene.verbs, ...scene.nouns]);
    return {
        type: 'free_phrase',
        target: scene.verbs[0],
        options,
        showSentenceContext: false,
        sceneEmoji: scene.sceneEmoji,
        sceneLabel: scene.sceneLabel,
        validVerbs: scene.verbs.map(v => v.id),
        validNouns: scene.nouns.map(n => n.id),
        sequence: [scene.verbs[0], scene.nouns[0]],
    };
}

// ── Componente ────────────────────────────────────────────────────────────────
type Phase = 'playing' | 'correct' | 'wrong' | 'session_done' | 'level_done';

export default function GameScreen() {
    const router = useRouter();
    const { speak } = useSpeech();
    const { settings } = useParental();
    const { sublevel, loading, load, saveSession, recentSessionsAtLevel } = useGame();
    const { profile } = useAuth();
    const vocabLevel = ((profile as { level?: string } | null)?.level ?? 'BASICO') as VocabLevel;
    const vocabLevelRef = useRef<VocabLevel>(vocabLevel);

    // Estado de la pantalla
    const [phase, setPhase] = useState<Phase>('playing');
    const [challenge, setChallenge] = useState<Challenge>(() => generateChallenge(1));
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [highlightCorrectId, setHighlightCorrectId] = useState<string | null>(null);
    const [sessionResult, setSessionResult] = useState<{ correct: number; total: number } | null>(null);
    // C3: adaptive difficulty tracker
    const consecutiveErrorsRef = useRef(0);
    // C4: sequence challenge — track user's tap order
    const [sequenceTaps, setSequenceTaps] = useState<string[]>([]);

    // Refs para acceso seguro desde callbacks async / timer
    const phaseRef = useRef<Phase>('playing');
    const trialNumRef = useRef(0);
    const correctCountRef = useRef(0);
    const sublevelRef = useRef(sublevel);
    const recentRef = useRef<GameSessionRecord[]>(recentSessionsAtLevel);
    const challengeRef = useRef<Challenge>(challenge);
    const handleResultRef = useRef<(isCorrect: boolean) => void>(() => {});

    // Animaciones
    const timerAnim = useRef(new Animated.Value(1)).current;
    const timerComposite = useRef<Animated.CompositeAnimation | null>(null);
    const overlayAnim = useRef(new Animated.Value(0)).current;

    // Sincronizar refs
    useEffect(() => { sublevelRef.current = sublevel; }, [sublevel]);
    useEffect(() => { recentRef.current = recentSessionsAtLevel; }, [recentSessionsAtLevel]);
    useEffect(() => { vocabLevelRef.current = vocabLevel; }, [vocabLevel]);
    useEffect(() => { challengeRef.current = challenge; }, [challenge]);

    // Carga inicial
    useEffect(() => { load(); }, [load]);

    // Color de la barra de tiempo: verde → naranja → rojo
    const timerBarColor = timerAnim.interpolate({
        inputRange: [0, 0.3, 0.6, 1],
        outputRange: ['#e57373', '#ff9800', Colors.primary, Colors.primary],
    });
    const timerBarWidth = timerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    // ── Iniciar un reto ───────────────────────────────────────────────────────
    const startTrial = useCallback((level: number) => {
        // C3: distractor reduction — cada 3 errores consecutivos quitamos 1 distractor
        const errorPenalty = Math.floor(consecutiveErrorsRef.current / 3);
        // E1: en sub-nivel 5, alternar entre retos estándar y retos C4 (RF-08.8)
        const useC4 = level >= 5 && Math.random() < 0.4;
        const c = useC4 ? generateC4Challenge() : generateChallenge(level, vocabLevelRef.current, -errorPenalty);
        setChallenge(c);
        challengeRef.current = c;
        setSelectedId(null);
        setHighlightCorrectId(null);
        setSequenceTaps([]);
        setPhase('playing');
        phaseRef.current = 'playing';

        timerComposite.current?.stop();
        timerAnim.setValue(1);

        // Audio cue: solo en niveles con distractores
        if (level > 1) {
            setTimeout(() => speak(c.target.label), 400);
        }

        timerComposite.current = Animated.timing(timerAnim, {
            toValue: 0,
            duration: TIMER_SECONDS * 1000,
            useNativeDriver: false,
        });
        timerComposite.current.start(({ finished }) => {
            if (finished) handleResultRef.current(false);
        });
    }, [speak, timerAnim]);

    // ── Avanzar al siguiente reto o cerrar sesión ─────────────────────────────
    const nextTrial = useCallback((level: number, recent: GameSessionRecord[]) => {
        trialNumRef.current += 1;
        if (trialNumRef.current >= TRIALS_PER_SESSION) {
            const correct = correctCountRef.current;
            setSessionResult({ correct, total: TRIALS_PER_SESSION });
            saveSession(correct, TRIALS_PER_SESSION, level, recent).then(result => {
                if (result.advanced) {
                    setPhase('level_done');
                    phaseRef.current = 'level_done';
                } else {
                    if (result.performanceDrop) {
                        Alert.alert(
                            'Aviso para el adulto',
                            `En esta sesión el niño acertó ${correct}/${TRIALS_PER_SESSION}. Podría ser útil revisar el sub-nivel actual.`,
                        );
                    }
                    setPhase('session_done');
                    phaseRef.current = 'session_done';
                }
            });
        } else {
            startTrial(level);
        }
    }, [saveSession, startTrial]);

    // ── Manejar resultado de un reto ──────────────────────────────────────────
    const handleResult = useCallback((isCorrect: boolean) => {
        if (phaseRef.current !== 'playing') return;
        timerComposite.current?.stop();

        if (isCorrect) {
            correctCountRef.current += 1;
            consecutiveErrorsRef.current = 0; // C3: reset on correct
            setPhase('correct');
            phaseRef.current = 'correct';

            const intensity = settings?.animation_intensity ?? 'normal';
            if (intensity !== 'none') {
                const toVal = intensity === 'soft' ? 0.3 : 0.55;
                Animated.sequence([
                    Animated.timing(overlayAnim, { toValue: toVal, duration: 150, useNativeDriver: true }),
                    Animated.delay(300),
                    Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
                ]).start();
            }
            setTimeout(() => nextTrial(sublevelRef.current, recentRef.current), 650);
        } else {
            setPhase('wrong');
            phaseRef.current = 'wrong';
            const correctLabel = challengeRef.current.target.label;
            setHighlightCorrectId(challengeRef.current.target.id);
            consecutiveErrorsRef.current += 1; // C3: track consecutive errors
            speak(correctLabel);
            setTimeout(() => {
                setHighlightCorrectId(null);
                nextTrial(sublevelRef.current, recentRef.current);
            }, 2000);
        }
    }, [settings, overlayAnim, speak, nextTrial]);

    // Mantener ref actualizado (para el timer)
    useEffect(() => { handleResultRef.current = handleResult; }, [handleResult]);

    // Primer reto al terminar de cargar
    const startedRef = useRef(false);
    useEffect(() => {
        if (!loading && !startedRef.current) {
            startedRef.current = true;
            trialNumRef.current = 0;
            correctCountRef.current = 0;
            startTrial(sublevel);
        }
    }, [loading, sublevel, startTrial]);

    // Cleanup al desmontar
    useEffect(() => () => { timerComposite.current?.stop(); }, []);

    // ── Tap en opción ─────────────────────────────────────────────────────────
    const handleOptionTap = (item: VocabularyItem) => {
        if (phaseRef.current !== 'playing') return;

        // sentence_build: dos taps en orden → QUIERO + objetivo
        if (challenge.type === 'sentence_build') {
            if (sequenceTaps.includes(item.id)) return;
            const newTaps = [...sequenceTaps, item.id];
            setSequenceTaps(newTaps);
            if (newTaps.length === 2) {
                const seq = challenge.sequence!;
                const correct = seq[0].id === newTaps[0] && seq[1].id === newTaps[1];
                setSelectedId(item.id);
                handleResult(correct);
            }
            return;
        }

        // free_phrase: verbo primero, luego sustantivo (cualquier combo válido)
        if (challenge.type === 'free_phrase') {
            if (sequenceTaps.length >= 2) return;
            const newTaps = [...sequenceTaps, item.id];
            setSequenceTaps(newTaps);
            if (newTaps.length === 2) {
                const correct =
                    (challenge.validVerbs!.includes(newTaps[0]) && challenge.validNouns!.includes(newTaps[1])) ||
                    (challenge.validVerbs!.includes(newTaps[1]) && challenge.validNouns!.includes(newTaps[0]));
                setSelectedId(item.id);
                handleResult(correct);
            }
            return;
        }

        // Tipos estándar (un solo tap)
        setSelectedId(item.id);
        handleResult(item.id === challenge.target.id);
    };

    // ── Estilo dinámico de cada opción ────────────────────────────────────────
    const getOptionStyle = (item: VocabularyItem) => {
        const base = [styles.option];
        if (phase === 'correct' && item.id === challenge.target.id) return [...base, styles.optionCorrect];
        if (phase === 'wrong' && item.id === selectedId) return [...base, styles.optionWrong];
        if (highlightCorrectId === item.id) return [...base, styles.optionHighlight];
        return base;
    };

    const numCols = challenge.options.length <= 2 ? 2 : 2; // siempre 2 columnas

    // ── Pantalla de loading ───────────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centered]}>
                <Text style={styles.loadingText}>Cargando juego...</Text>
            </SafeAreaView>
        );
    }

    // ── Pantalla de resumen (sesión o nivel completado) ───────────────────────
    if (phase === 'session_done' || phase === 'level_done') {
        const result = sessionResult ?? { correct: 0, total: TRIALS_PER_SESSION };
        const pct = Math.round((result.correct / result.total) * 100);
        const isLevelDone = phase === 'level_done';

        return (
            <SafeAreaView style={[styles.container, styles.centered]}>
                {/* C2/F4: Confetti celebration when leveling up, respects animation_intensity */}
                <CelebrationOverlay
                    visible={isLevelDone}
                    message="¡Subiste de nivel! 🏆"
                    intensity={settings?.animation_intensity ?? 'normal'}
                />
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryEmoji}>
                        {isLevelDone ? '🏆' : pct >= 80 ? '⭐' : '💪'}
                    </Text>
                    <Text style={styles.summaryTitle}>
                        {isLevelDone ? '¡Subiste de nivel!' : '¡Sesión completada!'}
                    </Text>
                    <Text style={styles.summaryScore}>{result.correct}/{result.total}</Text>
                    <Text style={styles.summaryPct}>{pct}% correcto</Text>
                    {isLevelDone && (
                        <Text style={styles.summaryMsg}>Ahora en sub-nivel {sublevel}</Text>
                    )}
                    {/* F3: Proximidad al siguiente nivel */}
                    {!isLevelDone && (() => {
                        const highScoreCount = recentSessionsAtLevel.filter(s => s.total > 0 && (s.correct / s.total) >= 0.8).length;
                        const needed = Math.max(0, 2 - highScoreCount);
                        return (
                            <Text style={styles.summaryProximity}>
                                {needed === 0
                                    ? '¡Listo para avanzar de nivel! 🎯'
                                    : `${needed} sesión${needed > 1 ? 'es' : ''} más con ≥80% para avanzar`}
                            </Text>
                        );
                    })()}
                    <TouchableOpacity
                        style={styles.summaryBtn}
                        onPress={() => {
                            setPhase('playing');
                            phaseRef.current = 'playing';
                            trialNumRef.current = 0;
                            correctCountRef.current = 0;
                            startTrial(sublevelRef.current);
                        }}
                    >
                        <Text style={styles.summaryBtnText}>Jugar de nuevo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.summaryBtnSecondary} onPress={() => router.back()}>
                        <Text style={styles.summaryBtnSecondaryText}>Salir</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Pantalla de juego ─────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Overlay de feedback correcto */}
            <Animated.View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, styles.overlay, { opacity: overlayAnim }]}
            />

            {/* Encabezado: sub-nivel + puntos de progreso */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Ionicons name="close" size={28} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.levelLabel}>
                    {([
                        '',
                        'Necesidades Básicas',
                        'Emociones',
                        'Identificación',
                        'Frase Corta',
                        'Frase Espontánea',
                    ][sublevel] ?? `Sub-nivel ${sublevel}`)}
                </Text>
                <View style={styles.trialDots}>
                    {Array.from({ length: TRIALS_PER_SESSION }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i < trialNumRef.current
                                    ? styles.dotDone
                                    : i === trialNumRef.current
                                    ? styles.dotActive
                                    : styles.dotPending,
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* Barra de tiempo */}
            <View style={styles.timerTrack}>
                <Animated.View style={[styles.timerBar, { width: timerBarWidth, backgroundColor: timerBarColor }]} />
            </View>

            {/* Área scrolleable del reto */}
            <ScrollView
                style={styles.playScroll}
                contentContainerStyle={styles.playScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled"
            >

            {/* Sub-nivel 1: audio cue + 2 opciones grandes */}
            {sublevel === 1 && (
                <>
                    <TouchableOpacity
                        style={styles.audioPrompt}
                        onPress={() => speak(challenge.target.label)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="volume-high" size={28} color={Colors.text.inverse} />
                        <Text style={styles.audioPromptText}>Toca lo que escuchas</Text>
                    </TouchableOpacity>

                    <View style={styles.optionsGrid}>
                        {challenge.options.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={[...getOptionStyle(item), styles.optionLarge]}
                                onPress={() => handleOptionTap(item)}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.optionEmojiLarge}>{item.emoji}</Text>
                                <Text style={styles.optionLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {/* Sub-niveles 3: audio cue + cuadrícula estándar */}
            {sublevel === 3 && challenge.type === 'standard' && (
                <>
                    <TouchableOpacity
                        style={styles.audioPrompt}
                        onPress={() => speak(challenge.target.label)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="volume-high" size={28} color={Colors.text.inverse} />
                        <Text style={styles.audioPromptText}>Toca lo que escuchas</Text>
                    </TouchableOpacity>

                    <View style={styles.optionsGrid}>
                        {challenge.options.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    ...getOptionStyle(item),
                                    { width: numCols === 2 ? '47%' : '30%' },
                                ]}
                                onPress={() => handleOptionTap(item)}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.optionEmoji}>{item.emoji}</Text>
                                <Text style={styles.optionLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {/* Sub-nivel 2: emotion_scene — escena visual → elige emoción */}
            {challenge.type === 'emotion_scene' && (
                <>
                    <View style={styles.emotionSceneBox}>
                        <Text style={styles.emotionSceneEmoji}>{challenge.sceneEmoji}</Text>
                        <Text style={styles.emotionSceneLabel}>{challenge.sceneLabel}</Text>
                    </View>
                    <Text style={styles.emotionQuestion}>¿Cómo se siente?</Text>
                    <View style={styles.optionsGrid}>
                        {challenge.options.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={[...getOptionStyle(item), { width: '30%', minHeight: 100 }]}
                                onPress={() => handleOptionTap(item)}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.optionEmoji}>{item.emoji}</Text>
                                <Text style={styles.optionLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {/* Sub-nivel 4: sentence_build — QUIERO + ___ en orden */}
            {challenge.type === 'sentence_build' && (
                <>
                    <Text style={styles.sbQuestion}>¿Qué quieres decir?</Text>
                    {/* Tira de frase mini */}
                    <View style={styles.sbStrip}>
                        <View style={[styles.sbSlot, sequenceTaps.length > 0 && styles.sbSlotFilled]}>
                            <Text style={styles.sbSlotEmoji}>{sequenceTaps.length > 0 ? SB_QUIERO.emoji : '?'}</Text>
                            <Text style={styles.sbSlotLabel}>{sequenceTaps.length > 0 ? 'QUIERO' : ''}</Text>
                        </View>
                        <Text style={styles.sbPlus}>+</Text>
                        <View style={[styles.sbSlot, sequenceTaps.length > 1 && styles.sbSlotFilled]}>
                            <Text style={styles.sbSlotEmoji}>
                                {sequenceTaps.length > 1
                                    ? challenge.options.find(o => o.id === sequenceTaps[1])?.emoji ?? '?'
                                    : '?'}
                            </Text>
                            {sequenceTaps.length > 1 && (
                                <Text style={styles.sbSlotLabel}>
                                    {challenge.options.find(o => o.id === sequenceTaps[1])?.label ?? ''}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.optionsGrid}>
                        {challenge.options.map(item => {
                            const tapped = sequenceTaps.includes(item.id);
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[...getOptionStyle(item), { width: '47%' }, tapped && styles.optionSequenceTapped]}
                                    disabled={tapped || phaseRef.current !== 'playing'}
                                    onPress={() => handleOptionTap(item)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.optionEmoji}>{item.emoji}</Text>
                                    <Text style={styles.optionLabel}>{item.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </>
            )}

            {/* Sub-nivel 5: free_phrase — escena abierta, construir verbo + sustantivo */}
            {challenge.type === 'free_phrase' && (
                <>
                    <View style={styles.fpSceneBox}>
                        <Text style={styles.fpSceneEmoji}>{challenge.sceneEmoji}</Text>
                        <Text style={styles.fpSceneLabel}>{challenge.sceneLabel}</Text>
                    </View>
                    {/* Tira de 2 casillas */}
                    <View style={styles.sbStrip}>
                        {[0, 1].map(i => (
                            <View key={i} style={[styles.sbSlot, !!sequenceTaps[i] && styles.sbSlotFilled]}>
                                <Text style={styles.sbSlotEmoji}>
                                    {sequenceTaps[i]
                                        ? challenge.options.find(o => o.id === sequenceTaps[i])?.emoji ?? '?'
                                        : '+'}
                                </Text>
                                {!!sequenceTaps[i] && (
                                    <Text style={styles.sbSlotLabel}>
                                        {challenge.options.find(o => o.id === sequenceTaps[i])?.label ?? ''}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                    <Text style={styles.fpInstruction}>Elige un verbo y luego un objeto</Text>
                    {/* Verbos */}
                    <Text style={styles.fpGroupLabel}>Acción:</Text>
                    <View style={styles.fpRow}>
                        {challenge.options
                            .filter(o => challenge.validVerbs?.includes(o.id))
                            .map(item => {
                                const tapped = sequenceTaps.includes(item.id);
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[...getOptionStyle(item), styles.fpChip, tapped && styles.optionSequenceTapped]}
                                        disabled={tapped || sequenceTaps.length >= 2 || phaseRef.current !== 'playing'}
                                        onPress={() => handleOptionTap(item)}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={styles.optionEmoji}>{item.emoji}</Text>
                                        <Text style={styles.optionLabel}>{item.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                    </View>
                    {/* Sustantivos */}
                    <Text style={styles.fpGroupLabel}>Objeto:</Text>
                    <View style={styles.fpRow}>
                        {challenge.options
                            .filter(o => challenge.validNouns?.includes(o.id))
                            .map(item => {
                                const tapped = sequenceTaps.includes(item.id);
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[...getOptionStyle(item), styles.fpChip, tapped && styles.optionSequenceTapped]}
                                        disabled={tapped || sequenceTaps.length >= 2 || phaseRef.current !== 'playing'}
                                        onPress={() => handleOptionTap(item)}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={styles.optionEmoji}>{item.emoji}</Text>
                                        <Text style={styles.optionLabel}>{item.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                    </View>
                </>
            )}

            {/* C4: scene — elegir el pictograma correcto para la escena */}
            {challenge.type === 'scene' && (
                <>
                    <View style={styles.scenePrompt}>
                        <Text style={styles.sceneEmoji}>{challenge.target.emoji}</Text>
                        <Text style={styles.sceneLabel}>¿Qué ves en la escena?</Text>
                    </View>
                    <View style={styles.optionsGrid}>
                        {challenge.options.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={[...getOptionStyle(item), { width: '47%' }]}
                                onPress={() => handleOptionTap(item)}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.optionEmoji}>{item.emoji}</Text>
                                <Text style={styles.optionLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {/* C4: category_sort — elegir el que NO pertenece */}
            {challenge.type === 'category_sort' && (
                <>
                    <View style={styles.sortPrompt}>
                        <Text style={styles.sortPromptText}>¿Cuál NO va con los demás?</Text>
                    </View>
                    <View style={styles.optionsGrid}>
                        {challenge.options.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={[...getOptionStyle(item), { width: '47%' }]}
                                onPress={() => handleOptionTap(item)}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.optionEmoji}>{item.emoji}</Text>
                                <Text style={styles.optionLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {/* C4: sequence — tocar los pasos en orden */}
            {challenge.type === 'sequence' && (
                <>
                    <View style={styles.sortPrompt}>
                        <Text style={styles.sortPromptText}>Toca los pasos en orden</Text>
                    </View>
                    <View style={styles.optionsGrid}>
                        {challenge.options.map(item => {
                            const tapIdx = sequenceTaps.indexOf(item.id);
                            const isTapped = tapIdx >= 0;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[...getOptionStyle(item), { width: '47%' }, isTapped && styles.optionSequenceTapped]}
                                    onPress={() => {
                                        if (phaseRef.current !== 'playing' || isTapped) return;
                                        const newTaps = [...sequenceTaps, item.id];
                                        setSequenceTaps(newTaps);
                                        if (newTaps.length === (challenge.sequence?.length ?? 0)) {
                                            const correct = challenge.sequence!.every((s, i) => s.id === newTaps[i]);
                                            handleResult(correct);
                                        }
                                    }}
                                    activeOpacity={0.75}
                                >
                                    {isTapped && <Text style={styles.sequenceIdx}>{tapIdx + 1}</Text>}
                                    <Text style={styles.optionEmoji}>{item.emoji}</Text>
                                    <Text style={styles.optionLabel}>{item.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </>
            )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: Colors.text.secondary,
    },
    overlay: {
        backgroundColor: Colors.primary,
        zIndex: 10,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    closeBtn: {
        padding: 4,
    },
    levelLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text.primary,
        flex: 1,
    },
    trialDots: {
        flexDirection: 'row',
        gap: 5,
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        maxWidth: 120,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotPending: { backgroundColor: Colors.text.disabled },
    dotActive: { backgroundColor: Colors.primary },
    dotDone: { backgroundColor: Colors.text.secondary },

    // Timer
    timerTrack: {
        height: 8,
        backgroundColor: Colors.primaryLight,
        marginHorizontal: 16,
        borderRadius: 4,
        overflow: 'hidden',
    },
    timerBar: {
        height: '100%',
        borderRadius: 4,
    },

    // Scroll container del reto
    playScroll: {
        flex: 1,
    },
    playScrollContent: {
        paddingBottom: 24,
    },

    // Sentence context (level 4)
    sentenceContext: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
        marginBottom: 4,
    },
    sentenceCard: {
        alignItems: 'center',
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: 12,
        padding: 12,
        minWidth: 80,
        shadowColor: Colors.onSurface,
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    sentenceEmoji: {
        fontSize: 32,
    },
    sentenceCardLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text.primary,
        marginTop: 4,
    },
    sentenceBlank: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    sentenceBlankText: {
        fontSize: 32,
        color: Colors.primary,
        fontWeight: '700',
    },

    // Big single target (level 1)
    bigTarget: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 24,
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: 24,
        shadowColor: Colors.onSurface,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    bigEmoji: {
        fontSize: 96,
    },
    bigLabel: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text.primary,
        marginTop: 12,
    },
    bigCorrectBadge: {
        position: 'absolute',
        top: 16,
        right: 20,
        fontSize: 40,
        color: Colors.primary,
    },

    // Audio prompt button
    audioPrompt: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        marginHorizontal: 24,
        marginTop: 20,
        marginBottom: 8,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 10,
    },
    audioPromptText: {
        color: Colors.text.inverse,
        fontSize: 16,
        fontWeight: '700',
    },

    // Options grid
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 12,
        flex: 1,
    },
    option: {
        aspectRatio: 1,
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
        shadowColor: Colors.onSurface,
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
        padding: 8,
    },
    optionCorrect: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    optionWrong: {
        borderColor: '#e57373',
        backgroundColor: '#fdecea',
    },
    optionHighlight: {
        borderColor: '#f9a825',
        backgroundColor: '#fffde7',
    },
    optionEmoji: {
        fontSize: 48,
    },
    optionEmojiLarge: {
        fontSize: 64,
    },
    optionLarge: {
        width: '47%',
        minHeight: 160,
    },
    optionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.text.primary,
        textAlign: 'center',
        marginTop: 6,
    },

    // C4 challenge types
    scenePrompt: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    sceneEmoji: {
        fontSize: 72,
        marginBottom: 8,
    },
    sceneLabel: {
        fontSize: 16,
        color: Colors.text.secondary,
        fontWeight: '600',
    },
    sortPrompt: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    sortPromptText: {
        fontSize: 17,
        color: Colors.text.primary,
        fontWeight: '700',
        textAlign: 'center',
    },
    optionSequenceTapped: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
        opacity: 0.7,
    },
    sequenceIdx: {
        position: 'absolute',
        top: 6,
        right: 8,
        fontSize: 16,
        fontWeight: '900',
        color: Colors.primary,
    },
    // ── emotion_scene ────────────────────────────────────────────────────────
    emotionSceneBox: {
        alignItems: 'center',
        backgroundColor: Colors.surfaceContainerLowest,
        marginHorizontal: 24,
        marginTop: 12,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 16,
        shadowColor: Colors.onSurface,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    emotionSceneEmoji: {
        fontSize: 80,
        lineHeight: 90,
    },
    emotionSceneLabel: {
        fontSize: 16,
        color: Colors.text.secondary,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
    },
    emotionQuestion: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 4,
    },
    // ── sentence_build ───────────────────────────────────────────────────────
    sbQuestion: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    sbStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 24,
        marginBottom: 16,
    },
    sbSlot: {
        width: 90,
        height: 90,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surfaceContainerLowest,
    },
    sbSlotFilled: {
        borderStyle: 'solid',
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    sbSlotEmoji: {
        fontSize: 30,
    },
    sbSlotLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.primary,
        marginTop: 2,
    },
    sbPlus: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.text.secondary,
    },
    // ── free_phrase ──────────────────────────────────────────────────────────
    fpSceneBox: {
        alignItems: 'center',
        backgroundColor: Colors.surfaceContainerLowest,
        marginHorizontal: 24,
        marginTop: 12,
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 16,
        shadowColor: Colors.onSurface,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    fpSceneEmoji: {
        fontSize: 64,
        lineHeight: 74,
    },
    fpSceneLabel: {
        fontSize: 15,
        color: Colors.text.secondary,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 6,
    },
    fpInstruction: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 8,
    },
    fpGroupLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.text.secondary,
        marginLeft: 24,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fpRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 8,
    },
    fpChip: {
        width: '47%',
    },
    summaryCard: {
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        marginHorizontal: 24,
        shadowColor: Colors.onSurface,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        gap: 8,
    },
    summaryEmoji: { fontSize: 64 },
    summaryTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.text.primary,
        textAlign: 'center',
    },
    summaryScore: {
        fontSize: 48,
        fontWeight: '900',
        color: Colors.primary,
    },
    summaryPct: {
        fontSize: 16,
        color: Colors.text.secondary,
    },
    summaryMsg: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginTop: 4,
    },
    summaryProximity: {
        fontSize: 13,
        color: Colors.text.secondary,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 8,
        paddingHorizontal: 8,
    },
    summaryBtn: {
        marginTop: 16,
        backgroundColor: Colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 14,
        width: '100%',
        alignItems: 'center',
    },
    summaryBtnText: {
        color: Colors.text.inverse,
        fontSize: 16,
        fontWeight: '800',
    },
    summaryBtnSecondary: {
        marginTop: 8,
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    summaryBtnSecondaryText: {
        color: Colors.text.secondary,
        fontSize: 15,
        fontWeight: '600',
    },
});
