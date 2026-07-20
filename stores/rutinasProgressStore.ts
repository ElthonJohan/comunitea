import { create } from 'zustand';

type ProgressMap = Record<string, number>;

interface RutinasState {
    progress: ProgressMap;
    setEjercicioCompletados: (ejercicioId: string, completados: number) => void;
}

export const useRutinasProgressStore = create<RutinasState>((set) => ({
    progress: {
        manana: 1,
        colegio: 0,
        noche: 2,
    },
    setEjercicioCompletados: (ejercicioId, completados) =>
        set((s) => ({
            progress: { ...s.progress, [ejercicioId]: completados },
        })),
}));

export function setEjercicioCompletados(ejercicioId: string, completados: number) {
    useRutinasProgressStore.getState().setEjercicioCompletados(ejercicioId, completados);
}
