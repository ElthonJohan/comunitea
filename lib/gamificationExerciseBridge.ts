/**
 * Los stores G2/G3 no pueden usar React Context; el provider registra aquí el callback
 * para registrar intentos / completados de ejercicios.
 */
export type ExerciseGamificationPayload =
    | { kind: 'wrong_attempt' }
    | { kind: 'exercise_completed' };

type Listener = (payload: ExerciseGamificationPayload) => void;

let listener: Listener | null = null;

export function setExerciseGamificationListener(fn: Listener | null) {
    listener = fn;
}

export function notifyExerciseGamification(payload: ExerciseGamificationPayload) {
    try {
        listener?.(payload);
    } catch (e) {
        console.warn('[gamification] exercise listener', e);
    }
}
