import type { VocabLevel } from '../context/AuthContext';
import type { ChildProgress } from '../context/ChildProfileContext';
import { xpProgress01 } from './gamification/xpLevel';

const VOCAB_BADGE: Record<VocabLevel, string> = {
    BASICO: 'Nivel 1',
    INTERMEDIO: 'Nivel 2',
    AVANZADO: 'Nivel 3',
};

/** Texto de nivel + barra 0–1 para el `Header` (gamificación si hay fila de progreso). */
export function headerGamificationDisplay(
    progress: ChildProgress | null,
    vocabLevel: VocabLevel,
): { nivelLabel: string; xpProgress: number } {
    if (!progress) {
        return {
            nivelLabel: VOCAB_BADGE[vocabLevel] ?? VOCAB_BADGE.BASICO,
            xpProgress: 0,
        };
    }
    return {
        nivelLabel: `Nivel ${progress.level}`,
        xpProgress: xpProgress01(progress.xp, progress.level),
    };
}
