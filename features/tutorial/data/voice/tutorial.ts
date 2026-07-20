/**
 * Textos de narración del tutorial (TTS de respaldo).
 * Intermedio / Avanzado: clips en `tutorialG1G2Assets.ts` (`assets/audio/tutorial-g1-g2/`).
 * Básico: clips en `tutorialG3Assets.ts` (`assets/audio/tutorial-g3/`).
 */

export const TUTORIAL_STEP_SCRIPTS = {
    ex0_base: '¡Hola! Bienvenido a ComuniTEA. Vamos a jugar. Toca la categoría de ALIMENTOS para empezar.',
    ex0_correct: '¡Muy bien!',
    ex0_incorrect: 'Intenta otra vez.',
    ex1_base: 'Mira la imagen de jugo. El niño quiere el jugo. Toquemos el jugo.',
    ex1_correct: '¡Muy bien!',
    ex1_incorrect: 'Intenta otra vez.',
    ex2_base: '¿Qué es lo que quieres? Toca el jugo.',
    ex2_correct: '¡Muy bien!',
    ex2_incorrect: 'Intenta otra vez.',
    ex3_step1: 'Muy bien. Toca yo quiero.',
    ex3_step2: 'Ahora toca el jugo.',
    ex3_incorrect: 'Intenta otra vez.',
    ex3_complete: 'Formamos la frase: Yo quiero jugo. ¡Excelente!',
} as const;

export const TUTORIAL_BASIC_SCRIPTS = {
    b_ex0_base: '¡Hola! Bienvenido a ComuniTEA. Vamos a jugar. Toca la categoría de ALIMENTOS para empezar.',
    b_ex0_correct: '¡Muy bien!',
    b_ex1_base: 'Mira la manzana. Toquemos la manzana.',
    b_ex1_correct: '¡Muy bien, hemos tocado la manzana!',
    b_ex2_base: 'Mira la manzana. Toca la misma manzana.',
    b_ex2_correct: '¡Muy bien, lo has logrado!',
    b_ex2_incorrect: 'Intentemos otra vez.',
    b_ex3_base: 'Muy bien. Arrastremos la manzana. Llévala a la boca.',
    b_ex3_correct: '¡Excelente, lo has logrado!',
    b_ex3_incorrect: 'Intentemos otra vez.',
    b_celebration:
        '¡Muy bien! Completaste el tutorial. Ya practicaste tocar, elegir y arrastrar.',
} as const;

/** Narración final tutorial intermedio/avanzado */
export const TUTORIAL_CELEBRATION_NARRATION_INTERMEDIATE =
    '¡Muy bien! Completaste el tutorial. Ya puedes usar la app para comunicarte.';
