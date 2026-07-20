import { useShallow } from 'zustand/react/shallow';
import {
    useG2ProgressStore,
    loadG2EmocionesRegistradas,
    loadG2AyudasRegistradas,
    type G2SubEjercicio,
    type AyudaRegistroG2,
    type EjerciciosG2State,
} from '../../../stores/g2ProgressStore';

export type { G2SubEjercicio, AyudaRegistroG2, EjerciciosG2State };

/**
 * Selector plano (sin objeto `state` anidado): `useShallow` solo compara el primer nivel;
 * un `{ state: { ... } }` nuevo en cada getSnapshot provocaba bucles infinitos en React 18+.
 */
export function useEjerciciosG2() {
    return useG2ProgressStore(
        useShallow((st) => ({
            completados: st.completados,
            fallosPorEjercicio: st.fallosPorEjercicio,
            estrellasPorNivel: st.estrellasPorNivel,
            emocionesRegistradas: st.emocionesRegistradas,
            fallosPorSubEjercicio: st.fallosPorSubEjercicio,
            estrellasPorEjercicio: st.estrellasPorEjercicio,
            ayudasRegistradas: st.ayudasRegistradas,
            hydrated: st.hydrated,
            isExerciseDone: st.isExerciseDone,
            isLevelComplete: st.isLevelComplete,
            isLevelUnlocked: st.isLevelUnlocked,
            nivelBadgeState: st.nivelBadgeState,
            firstIncompleteIndex: st.firstIncompleteIndex,
            registerFail: st.registerFail,
            registerSubFail: st.registerSubFail,
            completeSubExercise: st.completeSubExercise,
            completeExercise: st.completeExercise,
            registerEmocion: st.registerEmocion,
            registerAyudaRegistro: st.registerAyudaRegistro,
            estrellasNivel: st.estrellasNivel,
            estrellasSubEjercicio: st.estrellasSubEjercicio,
            resetAllProgress: st.resetAllProgress,
        })),
    );
}

export { loadG2EmocionesRegistradas, loadG2AyudasRegistradas };
