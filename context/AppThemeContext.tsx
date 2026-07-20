import React, { createContext, useContext, useMemo } from 'react';
import { Palettes, syncStaticColors, type AppColorPalette } from '../constants/Colors';
import { useAppThemeStore } from '../stores/appThemeStore';

const AppThemeContext = createContext<AppColorPalette>(Palettes.sage);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
    const palette = useAppThemeStore((s) => s.palette);
    const colors = useMemo(() => {
        syncStaticColors(palette);
        return Palettes[palette];
    }, [palette]);

    return <AppThemeContext.Provider value={colors}>{children}</AppThemeContext.Provider>;
}

export function useThemeColors(): AppColorPalette {
    return useContext(AppThemeContext);
}
