/**
 * Audios grabados para tutorial Intermedio/Avanzado (carpeta tutorial-g1-g2).
 * G2 ≈ Intermedio, G1 ≈ Avanzado; mismos pasos y mismos clips en la app.
 *
 * Carpetas: `femenina` (Samantha) y `masculino` (Luis) — alinear con VoiceProfile `masculina` → `masculino`.
 */
import type { VoiceProfile } from '../../../../constants/AudioAssets';
import type { TutorialStep } from '../../hooks/useTutorialState';
import {
    TUTORIAL_G1G2_FEMENINA as CLIPS_FEMENINA,
    TUTORIAL_G1G2_MASCULINO as CLIPS_MASCULINO,
} from '../../../../assets/audio/tutorial-g1-g2/audioRequires';

/** Qué clip(s) van con cada paso del tutorial intermedio/avanzado (`app/tutorial/index.tsx`). */
const STEP_TO_CLIP_INDICES: Partial<Record<TutorialStep, number | readonly number[]>> = {
    /** Bienvenida + instrucción categoría */
    ex0_base: 1,
    ex0_correct: 4,
    ex0_incorrect: 3,
    /** Instrucción ejercicio 1 */
    ex1_base: 2,
    ex1_correct: 4,
    ex1_incorrect: 3,
    ex2_base: 5,
    ex2_correct: 4,
    ex2_incorrect: 7,
    ex3_step1: 8,
    ex3_step2: 9,
    ex3_incorrect: 7,
    ex3_complete: 10,
};

function clipTable(voice: VoiceProfile): Record<number, number> {
    return voice === 'masculina' ? CLIPS_MASCULINO : CLIPS_FEMENINA;
}

/** Módulos `require()` listos para `createAudioPlayer` (0 = ninguno). */
export function getTutorialG1G2ClipModules(step: TutorialStep, voice: VoiceProfile): number[] {
    const spec = STEP_TO_CLIP_INDICES[step];
    if (spec === undefined) return [];
    const indices = Array.isArray(spec) ? spec : [spec];
    const table = clipTable(voice);
    return indices.map((i) => table[i]).filter((m) => m != null);
}

/** Narración final (pantalla celebración). */
export function getTutorialG1G2CelebrationModule(voice: VoiceProfile): number | null {
    const m = clipTable(voice)[11];
    return m ?? null;
}
