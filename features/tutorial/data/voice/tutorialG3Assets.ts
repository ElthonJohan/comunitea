/**
 * Audios grabados tutorial nivel básico (`assets/audio/tutorial-g3`).
 * `VoiceProfile` femenina → carpeta `femenino`, masculina → `masculino`.
 */
import type { VoiceProfile } from '../../../../constants/AudioAssets';
import type { TutorialStepBasic } from '../../hooks/useTutorialBasicState';
import {
    TUTORIAL_G3_FEMENINO as CLIPS_FEMENINO,
    TUTORIAL_G3_MASCULINO as CLIPS_MASCULINO,
} from '../../../../assets/audio/tutorial-g3/audioRequires';

const STEP_TO_CLIP_INDICES: Partial<Record<TutorialStepBasic, number | readonly number[]>> = {
    /** Bienvenida + instrucción categoría */
    b_ex0_base: 1,
    b_ex0_correct: 4,
    /** Instrucción ejercicio 1 */
    b_ex1_base: 2,
    b_ex1_correct: 4,
    b_ex2_base: 5,
    b_ex2_correct: 6,
    b_ex2_incorrect: 7,
    b_ex3_base: 8,
    b_ex3_correct: 6,
    b_ex3_incorrect: 7,
};

function clipTable(voice: VoiceProfile): Record<number, number> {
    return voice === 'masculina' ? CLIPS_MASCULINO : CLIPS_FEMENINO;
}

/** Módulos `require()` para `createAudioPlayer`. */
export function getTutorialG3ClipModules(step: TutorialStepBasic, voice: VoiceProfile): number[] {
    if (step === 'b_celebration') {
        const mod = getTutorialG3CelebrationModule(voice);
        return mod != null ? [mod] : [];
    }
    const spec = STEP_TO_CLIP_INDICES[step];
    if (spec === undefined) return [];
    const indices = Array.isArray(spec) ? spec : [spec];
    const table = clipTable(voice);
    return indices.map((i) => table[i]).filter((m) => m != null);
}

/** Narración final: índice 10 (Samantha) / 9 (Luis). */
export function getTutorialG3CelebrationModule(voice: VoiceProfile): number | null {
    const t = clipTable(voice);
    const idx = voice === 'masculina' ? 9 : 10;
    const m = t[idx];
    return m ?? null;
}
