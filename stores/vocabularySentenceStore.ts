import { create } from 'zustand';
import type { VocabularyItem } from '../constants/Vocabulary';

interface VocabularySentenceState {
    sentence: VocabularyItem[];
    addToSentence: (item: VocabularyItem) => void;
    removeFromSentence: (index: number) => void;
    clearSentence: () => void;
}

export const useVocabularySentenceStore = create<VocabularySentenceState>((set) => ({
    sentence: [],
    addToSentence: (item) => set((s) => ({ sentence: [...s.sentence, item] })),
    removeFromSentence: (index) =>
        set((s) => ({ sentence: s.sentence.filter((_, i) => i !== index) })),
    clearSentence: () => set({ sentence: [] }),
}));
