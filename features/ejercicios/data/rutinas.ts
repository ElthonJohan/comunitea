/**
 * Rutinas de ejemplo (lista de ejercicios mock).
 */

export interface EjercicioPaso {
    id: string;
    emoji: string;
    nombre: string;
    descripcion?: string;
}

export interface EjercicioMock {
    id: string;
    nombre: string;
    hora: string;
    emoji: string;
    pasos: EjercicioPaso[];
}

/** Lista vacía: las rutinas de ejemplo se eliminaron; el padre puede crear actividades guiadas. */
export const EJEMPLOS_EJERCICIOS: EjercicioMock[] = [];
