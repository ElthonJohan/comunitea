import { useShallow } from 'zustand/react/shallow';
import { useG3ProgressStore, type EjercicioG3State } from '../../../stores/g3ProgressStore';

export type { EjercicioG3State };

/** Mismo criterio que useEjerciciosG2: selector plano para `useShallow`. */
export function useEjerciciosG3() {
    return useG3ProgressStore(
        useShallow((st) => ({
            completados: st.completados,
            fallosPorEjercicio: st.fallosPorEjercicio,
            estrellasPorNivel: st.estrellasPorNivel,
            caminoCompleto: st.caminoCompleto,
            hydrated: st.hydrated,
            isExerciseDone: st.isExerciseDone,
            isLevelComplete: st.isLevelComplete,
            isLevelUnlocked: st.isLevelUnlocked,
            nivelBadgeState: st.nivelBadgeState,
            firstIncompleteIndex: st.firstIncompleteIndex,
            registerFail: st.registerFail,
            completeExercise: st.completeExercise,
            setCaminoCompleto: st.setCaminoCompleto,
            estrellasNivel: st.estrellasNivel,
            segmentBetweenCompleted: st.segmentBetweenCompleted,
            resetAllProgress: st.resetAllProgress,
        })),
    );
}
