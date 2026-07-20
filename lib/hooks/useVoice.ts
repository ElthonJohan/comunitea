import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '../../stores/settingsStore';

/** Preferencia de voz (Zustand + AsyncStorage vía settingsStore). */
export function useVoice() {
    return useSettingsStore(
        useShallow((s) => ({
            voice: s.voice,
            setVoice: s.setVoice,
            isLoading: !s.hydrated,
        })),
    );
}
