import { useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';

export type UserGroupLevel = 'basic' | 'intermediate' | 'advanced';

export function useUserGroup(): {
    nivel: UserGroupLevel;
    pictoWidth: number;
    pictoHeight: number;
    minTouchSize: number;
    maxSubcategoriasVisibles: number;
} {
    const { profile } = useAuth();

    return useMemo(() => {
        const level = profile?.level;
        const nivel: UserGroupLevel =
            level === 'BASICO' ? 'basic' : level === 'INTERMEDIO' ? 'intermediate' : 'advanced';

        const big = nivel === 'basic';
        return {
            nivel,
            /** Guía de tamaño para celdas del tablero (SubcategoriaRow escala a partir de esto). */
            pictoWidth: big ? 62 : 54,
            pictoHeight: big ? 58 : 50,
            minTouchSize: 48,
            maxSubcategoriasVisibles: nivel === 'basic' ? 4 : 999,
        };
    }, [profile?.level]);
}
