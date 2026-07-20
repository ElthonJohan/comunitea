import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../lib/storage/keys';
import { g3ExerciseKey, starsFromFails } from '../constants/ejerciciosGrupo3';
import { notifyExerciseGamification } from '../lib/gamificationExerciseBridge';

export interface EjercicioG3State {
    completados: string[];
    fallosPorEjercicio: Record<string, number>;
    estrellasPorNivel: Record<number, 1 | 2 | 3>;
    caminoCompleto: boolean;
}

const defaultG3State = (): EjercicioG3State => ({
    completados: [],
    fallosPorEjercicio: {},
    estrellasPorNivel: {},
    caminoCompleto: false,
});

const g3LegacyStorage: StateStorage = {
    getItem: async () => {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.EJERCICIOS_G3);
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw) as unknown;
            if (parsed && typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as EjercicioG3State).completados)) {
                return JSON.stringify({ state: parsed as EjercicioG3State, version: 0 });
            }
            return raw;
        } catch {
            return null;
        }
    },
    setItem: async (_name, value) => {
        const doc = JSON.parse(value) as { state?: EjercicioG3State };
        const inner = doc.state ?? (doc as unknown as EjercicioG3State);
        await AsyncStorage.setItem(STORAGE_KEYS.EJERCICIOS_G3, JSON.stringify(inner));
    },
    removeItem: async () => {
        await AsyncStorage.removeItem(STORAGE_KEYS.EJERCICIOS_G3);
    },
};

type G3Persisted = EjercicioG3State;

interface G3Store extends EjercicioG3State {
    hydrated: boolean;
    isExerciseDone: (nivel: number, ejIndex: number) => boolean;
    isLevelComplete: (nivel: number) => boolean;
    isLevelUnlocked: (nivel: number) => boolean;
    nivelBadgeState: (nivel: number) => 'bloqueado' | 'disponible' | 'completado';
    firstIncompleteIndex: (nivel: number) => number;
    registerFail: (nivel: number, ejIndex: number) => Promise<void>;
    completeExercise: (nivel: number, ejIndex: number) => Promise<void>;
    setCaminoCompleto: () => Promise<void>;
    estrellasNivel: (nivel: number) => 0 | 1 | 2 | 3;
    segmentBetweenCompleted: (fromNivel: number, toNivel: number) => boolean;
    resetAllProgress: () => Promise<void>;
}

export const useG3ProgressStore = create<G3Store>()(
    persist(
        (set, get) => ({
            ...defaultG3State(),
            hydrated: false,

            isExerciseDone: (nivel, ejIndex) => get().completados.includes(g3ExerciseKey(nivel, ejIndex)),

            isLevelComplete: (nivel) => {
                const { completados } = get();
                for (let i = 0; i < 3; i++) {
                    if (!completados.includes(g3ExerciseKey(nivel, i))) return false;
                }
                return true;
            },

            isLevelUnlocked: (nivel) => {
                if (nivel <= 1) return true;
                return get().isLevelComplete(nivel - 1);
            },

            nivelBadgeState: (nivel) => {
                if (!get().isLevelUnlocked(nivel)) return 'bloqueado';
                if (get().isLevelComplete(nivel)) return 'completado';
                return 'disponible';
            },

            firstIncompleteIndex: (nivel) => {
                const { completados } = get();
                for (let i = 0; i < 3; i++) {
                    if (!completados.includes(g3ExerciseKey(nivel, i))) return i;
                }
                return 0;
            },

            registerFail: async (nivel, ejIndex) => {
                const state = get();
                const k = g3ExerciseKey(nivel, ejIndex);
                set({
                    fallosPorEjercicio: {
                        ...state.fallosPorEjercicio,
                        [k]: (state.fallosPorEjercicio[k] ?? 0) + 1,
                    },
                });
                notifyExerciseGamification({ kind: 'wrong_attempt' });
            },

            completeExercise: async (nivel, ejIndex) => {
                const state = get();
                const k = g3ExerciseKey(nivel, ejIndex);
                if (state.completados.includes(k)) return;
                const completados = [...state.completados, k];
                let estrellasPorNivel = { ...state.estrellasPorNivel };
                const justFinishedLevel = ejIndex === 2;
                if (justFinishedLevel) {
                    let fails = 0;
                    for (let i = 0; i < 3; i++) {
                        const key = g3ExerciseKey(nivel, i);
                        fails += state.fallosPorEjercicio[key] ?? 0;
                    }
                    estrellasPorNivel[nivel] = starsFromFails(fails);
                }
                set({ completados, estrellasPorNivel });
                notifyExerciseGamification({ kind: 'exercise_completed' });
            },

            setCaminoCompleto: async () => {
                await AsyncStorage.setItem(STORAGE_KEYS.EJERCICIOS_G3_COMPLETADOS, 'true');
                set({ caminoCompleto: true });
            },

            estrellasNivel: (nivel) => {
                if (!get().isLevelComplete(nivel)) return 0;
                return get().estrellasPorNivel[nivel] ?? 1;
            },

            segmentBetweenCompleted: (fromNivel, toNivel) => {
                if (fromNivel >= toNivel) return false;
                return get().isLevelComplete(fromNivel);
            },

            resetAllProgress: async () => {
                await AsyncStorage.removeItem(STORAGE_KEYS.EJERCICIOS_G3_COMPLETADOS);
                set({ ...defaultG3State(), hydrated: true });
            },
        }),
        {
            name: 'g3-legacy',
            storage: createJSONStorage(() => g3LegacyStorage),
            partialize: (s): G3Persisted => ({
                completados: s.completados,
                fallosPorEjercicio: s.fallosPorEjercicio,
                estrellasPorNivel: s.estrellasPorNivel,
                caminoCompleto: s.caminoCompleto,
            }),
            onRehydrateStorage: () => () => {
                useG3ProgressStore.setState({ hydrated: true });
            },
        },
    ),
);
