import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../lib/storage/keys';
import {
    G2_EJERCICIOS_POR_NIVEL,
    g2ExerciseKey,
    g2SubExerciseKey,
    starsFromFailsG2,
} from '../constants/ejerciciosGrupo2';
import { notifyExerciseGamification } from '../lib/gamificationExerciseBridge';

export type G2SubEjercicio = 'E1' | 'E2' | 'E3';

export interface AyudaRegistroG2 {
    situacion: string;
    persona: string;
}

export interface EjerciciosG2State {
    completados: string[];
    fallosPorEjercicio: Record<string, number>;
    estrellasPorNivel: Record<number, 1 | 2 | 3>;
    emocionesRegistradas: string[];
    fallosPorSubEjercicio: Record<string, number>;
    estrellasPorEjercicio: Record<string, 1 | 2 | 3>;
    ayudasRegistradas: AyudaRegistroG2[];
}

const defaultG2State = (): EjerciciosG2State => ({
    completados: [],
    fallosPorEjercicio: {},
    estrellasPorNivel: {},
    emocionesRegistradas: [],
    fallosPorSubEjercicio: {},
    estrellasPorEjercicio: {},
    ayudasRegistradas: [],
});

/** AsyncStorage guarda el JSON plano de EjerciciosG2State (compat instalaciones previas). */
const g2LegacyStorage: StateStorage = {
    getItem: async () => {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.EJERCICIOS_G2);
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw) as unknown;
            if (parsed && typeof parsed === 'object' && parsed !== null && 'completados' in parsed) {
                return JSON.stringify({ state: parsed as EjerciciosG2State, version: 0 });
            }
            return raw;
        } catch {
            return null;
        }
    },
    setItem: async (_name, value) => {
        const doc = JSON.parse(value) as { state?: EjerciciosG2State };
        const inner = doc.state ?? (doc as unknown as EjerciciosG2State);
        await AsyncStorage.setItem(STORAGE_KEYS.EJERCICIOS_G2, JSON.stringify(inner));
    },
    removeItem: async () => {
        await AsyncStorage.removeItem(STORAGE_KEYS.EJERCICIOS_G2);
    },
};

function subToIndex(sub: G2SubEjercicio): number {
    if (sub === 'E1') return 0;
    if (sub === 'E2') return 1;
    return 2;
}

/** Fallos por ejercicio; en niveles 2–3 fusiona claves antiguas `nivel-E1` con `nivel-1`. */
function failsForG2ExerciseSlot(state: EjerciciosG2State, nivel: number, ejIndex: number): number {
    const k = g2ExerciseKey(nivel, ejIndex);
    const direct = state.fallosPorEjercicio[k] ?? 0;
    if (nivel === 2 || nivel === 3) {
        if (ejIndex >= 0 && ejIndex <= 2) {
            const sub: G2SubEjercicio = ejIndex === 0 ? 'E1' : ejIndex === 1 ? 'E2' : 'E3';
            const subFails = state.fallosPorSubEjercicio[g2SubExerciseKey(nivel as 2 | 3, sub)] ?? 0;
            return Math.max(direct, subFails);
        }
    }
    return direct;
}

function totalFailsForG2Level(state: EjerciciosG2State, nivel: number): number {
    let fails = 0;
    for (let i = 0; i < G2_EJERCICIOS_POR_NIVEL; i++) {
        fails += failsForG2ExerciseSlot(state, nivel, i);
    }
    return fails;
}

/**
 * Instalaciones que completaron el nivel con solo 3 ejercicios (antes del paso a 6)
 * quedaban con el primer pendiente en el índice 3 → pantalla "Próximamente" al abrir el nivel.
 * Rellena automáticamente los slots 4–6 si ya estaban hechos los tres primeros.
 */
function migrateG2LegacyThreeSlotsToSix(state: EjerciciosG2State): EjerciciosG2State {
    const had = new Set(state.completados);
    const toAdd: string[] = [];
    for (let n = 1; n <= 5; n++) {
        const k0 = g2ExerciseKey(n, 0);
        const k1 = g2ExerciseKey(n, 1);
        const k2 = g2ExerciseKey(n, 2);
        const kLast = g2ExerciseKey(n, G2_EJERCICIOS_POR_NIVEL - 1);
        if (had.has(k0) && had.has(k1) && had.has(k2) && !had.has(kLast)) {
            for (let i = 3; i < G2_EJERCICIOS_POR_NIVEL; i++) {
                const k = g2ExerciseKey(n, i);
                if (!had.has(k)) toAdd.push(k);
            }
        }
    }
    if (toAdd.length === 0) return state;
    return { ...state, completados: [...state.completados, ...toAdd] };
}

type G2Persisted = EjerciciosG2State;

interface G2Store extends EjerciciosG2State {
    hydrated: boolean;
    isExerciseDone: (nivel: number, ejIndex: number) => boolean;
    isLevelComplete: (nivel: number) => boolean;
    isLevelUnlocked: (nivel: number) => boolean;
    nivelBadgeState: (nivel: number) => 'bloqueado' | 'disponible' | 'completado';
    firstIncompleteIndex: (nivel: number) => number;
    registerFail: (nivel: number, ejIndex: number) => Promise<void>;
    registerSubFail: (nivel: 2 | 3, sub: G2SubEjercicio) => Promise<void>;
    completeSubExercise: (nivel: 2 | 3, sub: G2SubEjercicio) => Promise<void>;
    completeExercise: (nivel: number, ejIndex: number) => Promise<void>;
    registerEmocion: (emotionId: string) => Promise<void>;
    registerAyudaRegistro: (situacion: string, persona: string) => Promise<void>;
    estrellasNivel: (nivel: number) => 0 | 1 | 2 | 3;
    estrellasSubEjercicio: (nivel: 2 | 3, sub: G2SubEjercicio) => 1 | 2 | 3 | null;
    /** Borra progreso G2 (completados, fallos, estrellas, registros auxiliares). */
    resetAllProgress: () => void;
}

export const useG2ProgressStore = create<G2Store>()(
    persist(
        (set, get) => ({
            ...defaultG2State(),
            hydrated: false,

            isExerciseDone: (nivel, ejIndex) => get().completados.includes(g2ExerciseKey(nivel, ejIndex)),

            isLevelComplete: (nivel) => {
                const { completados } = get();
                for (let i = 0; i < G2_EJERCICIOS_POR_NIVEL; i++) {
                    if (!completados.includes(g2ExerciseKey(nivel, i))) return false;
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
                for (let i = 0; i < G2_EJERCICIOS_POR_NIVEL; i++) {
                    if (!completados.includes(g2ExerciseKey(nivel, i))) return i;
                }
                return 0;
            },

            registerFail: async (nivel, ejIndex) => {
                const state = get();
                const k = g2ExerciseKey(nivel, ejIndex);
                set({
                    fallosPorEjercicio: {
                        ...state.fallosPorEjercicio,
                        [k]: (state.fallosPorEjercicio[k] ?? 0) + 1,
                    },
                });
                notifyExerciseGamification({ kind: 'wrong_attempt' });
            },

            registerSubFail: async (nivel, sub) => {
                const state = get();
                const sk = g2SubExerciseKey(nivel, sub);
                set({
                    fallosPorSubEjercicio: {
                        ...state.fallosPorSubEjercicio,
                        [sk]: (state.fallosPorSubEjercicio[sk] ?? 0) + 1,
                    },
                });
                notifyExerciseGamification({ kind: 'wrong_attempt' });
            },

            completeSubExercise: async (nivel, sub) => {
                const state = get();
                const idx = subToIndex(sub);
                const sk = g2SubExerciseKey(nivel, sub);
                const k = g2ExerciseKey(nivel, idx);
                if (state.completados.includes(k)) return;
                const fails = state.fallosPorSubEjercicio[sk] ?? 0;
                const stars = starsFromFailsG2(fails);
                const completados = [...state.completados, k];
                const estrellasPorEjercicio = { ...state.estrellasPorEjercicio, [sk]: stars };
                let estrellasPorNivel = { ...state.estrellasPorNivel };
                /* Compat: rutas antiguas que solo completaban E1–E3 vía tabs. */
                if (idx === 2) {
                    const s1 = estrellasPorEjercicio[g2SubExerciseKey(nivel, 'E1')] ?? stars;
                    const s2 = estrellasPorEjercicio[g2SubExerciseKey(nivel, 'E2')] ?? stars;
                    const s3 = estrellasPorEjercicio[g2SubExerciseKey(nivel, 'E3')] ?? stars;
                    estrellasPorNivel[nivel] = Math.min(s1, s2, s3) as 1 | 2 | 3;
                }
                set({
                    completados,
                    estrellasPorEjercicio,
                    estrellasPorNivel,
                });
                notifyExerciseGamification({ kind: 'exercise_completed' });
            },

            completeExercise: async (nivel, ejIndex) => {
                const state = get();
                const k = g2ExerciseKey(nivel, ejIndex);
                if (state.completados.includes(k)) return;
                const completados = [...state.completados, k];
                let estrellasPorNivel = { ...state.estrellasPorNivel };
                const last = G2_EJERCICIOS_POR_NIVEL - 1;
                if (ejIndex === last) {
                    estrellasPorNivel[nivel] = starsFromFailsG2(totalFailsForG2Level({ ...state, completados }, nivel));
                }
                set({ completados, estrellasPorNivel });
                notifyExerciseGamification({ kind: 'exercise_completed' });
            },

            registerEmocion: async (emotionId) => {
                const state = get();
                const emocionesRegistradas = [...state.emocionesRegistradas, emotionId].slice(-30);
                set({ emocionesRegistradas });
            },

            registerAyudaRegistro: async (situacion, persona) => {
                const state = get();
                const ayudasRegistradas = [...state.ayudasRegistradas, { situacion, persona }].slice(-40);
                set({ ayudasRegistradas });
            },

            estrellasNivel: (nivel) => {
                if (!get().isLevelComplete(nivel)) return 0;
                return get().estrellasPorNivel[nivel] ?? 1;
            },

            estrellasSubEjercicio: (nivel, sub) => {
                const v = get().estrellasPorEjercicio[g2SubExerciseKey(nivel, sub)];
                return v ?? null;
            },

            resetAllProgress: () => {
                set({ ...defaultG2State(), hydrated: true });
            },
        }),
        {
            name: 'g2-legacy',
            storage: createJSONStorage(() => g2LegacyStorage),
            partialize: (s): G2Persisted => ({
                completados: s.completados,
                fallosPorEjercicio: s.fallosPorEjercicio,
                estrellasPorNivel: s.estrellasPorNivel,
                emocionesRegistradas: s.emocionesRegistradas,
                fallosPorSubEjercicio: s.fallosPorSubEjercicio,
                estrellasPorEjercicio: s.estrellasPorEjercicio,
                ayudasRegistradas: s.ayudasRegistradas,
            }),
            onRehydrateStorage: () => (persisted) => {
                if (persisted && typeof persisted === 'object' && Array.isArray((persisted as EjerciciosG2State).completados)) {
                    const p = persisted as EjerciciosG2State;
                    const base: EjerciciosG2State = { ...defaultG2State(), ...p };
                    const migrated = migrateG2LegacyThreeSlotsToSix(base);
                    if (migrated.completados.length > p.completados.length) {
                        useG2ProgressStore.setState({ completados: migrated.completados });
                    }
                }
                useG2ProgressStore.setState({ hydrated: true });
            },
        },
    ),
);

export async function loadG2EmocionesRegistradas(): Promise<string[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.EJERCICIOS_G2);
    if (!raw) return [];
    try {
        const p = JSON.parse(raw) as Partial<EjerciciosG2State>;
        return Array.isArray(p.emocionesRegistradas) ? p.emocionesRegistradas : [];
    } catch {
        return [];
    }
}

export async function loadG2AyudasRegistradas(): Promise<AyudaRegistroG2[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.EJERCICIOS_G2);
    if (!raw) return [];
    try {
        const p = JSON.parse(raw) as Partial<EjerciciosG2State>;
        return Array.isArray(p.ayudasRegistradas) ? p.ayudasRegistradas : [];
    } catch {
        return [];
    }
}
