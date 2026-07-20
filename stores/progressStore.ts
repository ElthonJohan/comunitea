/**
 * Punto único de exportación del progreso (G2, G3, rutinas mock).
 */
export {
    useG2ProgressStore,
    loadG2EmocionesRegistradas,
    loadG2AyudasRegistradas,
    type EjerciciosG2State,
    type AyudaRegistroG2,
    type G2SubEjercicio,
} from './g2ProgressStore';
export { useG3ProgressStore, type EjercicioG3State } from './g3ProgressStore';
export { useRutinasProgressStore, setEjercicioCompletados } from './rutinasProgressStore';
