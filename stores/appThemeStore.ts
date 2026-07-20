import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeColor } from '../constants/Colors';

const STORAGE_KEY = 'comunitea-accent-palette';

type AppThemeState = {
    palette: ThemeColor;
    setPalette: (p: ThemeColor) => void;
};

export const useAppThemeStore = create<AppThemeState>()(
    persist(
        (set) => ({
            palette: 'sage',
            setPalette: (palette) => set({ palette }),
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({ palette: s.palette }),
        },
    ),
);
