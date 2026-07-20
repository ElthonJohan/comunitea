import { useMemo } from 'react';
import { buildTableroTheme } from '../constants/TableroTheme';
import { useThemeColors } from '../context/AppThemeContext';

export function useTableroTheme() {
    const colors = useThemeColors();
    return useMemo(() => buildTableroTheme(colors), [colors]);
}
