import { useRutinasProgressStore, setEjercicioCompletados as setStore } from '../../../stores/rutinasProgressStore';

export { setStore as setEjercicioCompletados };

export function useEjerciciosProgressMap(): Record<string, number> {
    return useRutinasProgressStore((s) => s.progress);
}

export function useEjercicioCompletados(ejercicioId: string): number {
    return useRutinasProgressStore((s) => s.progress[ejercicioId] ?? 0);
}
