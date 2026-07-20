import { useShallow } from 'zustand/react/shallow';
import { useVocabularySentenceStore } from '../../stores/vocabularySentenceStore';

/** Tira de frase del vocabulario (Zustand). */
export function useSentence() {
    return useVocabularySentenceStore(
        useShallow((s) => ({
            sentence: s.sentence,
            addToSentence: s.addToSentence,
            removeFromSentence: s.removeFromSentence,
            clearSentence: s.clearSentence,
        })),
    );
}
