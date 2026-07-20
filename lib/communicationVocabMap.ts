import type { CommunicationLevel } from '../context/ChildProfileContext';
import type { VocabLevel } from '../context/AuthContext';

/** Nivel de vocabulario de la app según el perfil comunicativo del niño. */
export const COMM_TO_VOCAB: Record<CommunicationLevel, VocabLevel> = {
    sin_lenguaje:      'BASICO',
    palabras_aisladas: 'BASICO',
    frases_simples:    'INTERMEDIO',
    frases_complejas:  'AVANZADO',
};
