import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VoiceProfile } from '../constants/AudioAssets';
import { STORAGE_KEYS } from '../lib/storage/keys';

export type VoiceType = VoiceProfile;

/** AsyncStorage guarda solo la cadena 'femenina' | 'masculina'. */
const voiceLegacyStorage: StateStorage = {
    getItem: async () => {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.VOICE_PREFERENCE);
        if (raw === 'femenina' || raw === 'masculina') {
            return JSON.stringify({ state: { voice: raw as VoiceType }, version: 0 });
        }
        return null;
    },
    setItem: async (_name, value) => {
        const doc = JSON.parse(value) as { state?: { voice?: VoiceType } };
        const v = doc.state?.voice ?? 'femenina';
        await AsyncStorage.setItem(STORAGE_KEYS.VOICE_PREFERENCE, v);
    },
    removeItem: async () => {
        await AsyncStorage.removeItem(STORAGE_KEYS.VOICE_PREFERENCE);
    },
};

interface SettingsState {
    voice: VoiceType;
    hydrated: boolean;
    setVoice: (voice: VoiceType) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            voice: 'femenina',
            hydrated: false,
            setVoice: (voice) => set({ voice }),
        }),
        {
            name: 'voice-legacy',
            storage: createJSONStorage(() => voiceLegacyStorage),
            partialize: (s) => ({ voice: s.voice }),
            onRehydrateStorage: () => () => {
                useSettingsStore.setState({ hydrated: true });
            },
        },
    ),
);
