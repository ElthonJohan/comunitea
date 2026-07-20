import { useCallback, useMemo, useRef, useState } from 'react';
import type { FlatList } from 'react-native';
import { PETICIONES_ROW } from '../data/tablero';
import type { Subcategoria } from '../data/tablero';
import { mergeAllSubcats, mergePersonasRow } from '../buildMergedBoard';
import { useUserGroup } from '../../ejercicios/hooks/useUserGroup';
import { useChildProfile } from '../../../context/ChildProfileContext';

export type { Pictograma, Subcategoria } from '../data/tablero';

export interface CategoriaResumen {
    id: string;
    nombre: string;
    emoji: string;
    pictogramCount: number;
}

export interface TableroState {
    subcategorias: Subcategoria[];
    categoriaActiva: string | null;
    overlayVisible: boolean;
}

/** Agrupa subcategorías por `categoriaId` para la pantalla de categorías y el tablero. */
export function categoriasFromSubcats(subcats: Subcategoria[]): CategoriaResumen[] {
    const map = new Map<string, CategoriaResumen>();
    for (const s of subcats) {
        const cur = map.get(s.categoriaId);
        const count = s.pictogramas.length;
        if (!cur) {
            map.set(s.categoriaId, {
                id: s.categoriaId,
                nombre: s.nombre,
                emoji: s.emoji,
                pictogramCount: count,
            });
        } else {
            cur.pictogramCount += count;
        }
    }
    return Array.from(map.values());
}

export function useTablero() {
    const { childProfile } = useChildProfile();
    const { maxSubcategoriasVisibles } = useUserGroup();
    const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const listRef = useRef<FlatList<Subcategoria>>(null);

    const subcategoriasFull = useMemo(
        () => mergeAllSubcats(childProfile?.preferred_activities),
        [childProfile?.preferred_activities],
    );
    const personas = useMemo(
        () => mergePersonasRow(childProfile?.important_people, childProfile?.avatar_url ?? null),
        [childProfile?.important_people, childProfile?.avatar_url],
    );
    const subcategorias = useMemo(
        () => subcategoriasFull.slice(0, maxSubcategoriasVisibles),
        [subcategoriasFull, maxSubcategoriasVisibles],
    );

    const categorias = useMemo(() => categoriasFromSubcats(subcategoriasFull), [subcategoriasFull]);

    const openOverlay = useCallback(() => setOverlayVisible(true), []);
    const closeOverlay = useCallback(() => setOverlayVisible(false), []);

    const selectCategoria = useCallback(
        (categoriaId: string) => {
            setCategoriaActiva(categoriaId);
            setOverlayVisible(false);
            const index = subcategorias.findIndex((s) => s.categoriaId === categoriaId);
            if (index >= 0 && listRef.current) {
                requestAnimationFrame(() => {
                    try {
                        listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
                    } catch {
                        listRef.current?.scrollToOffset({ offset: 0, animated: true });
                    }
                });
            }
        },
        [subcategorias],
    );

    const clearCategoriaActiva = useCallback(() => setCategoriaActiva(null), []);

    const categoriaActivaLabel = useMemo(
        () => categorias.find((c) => c.id === categoriaActiva)?.nombre ?? null,
        [categorias, categoriaActiva],
    );

    const favoritos = useMemo(
        () => subcategoriasFull.flatMap((s) => s.pictogramas).filter((p) => p.esFavorito),
        [subcategoriasFull],
    );

    return {
        subcategorias,
        categorias,
        categoriaActiva,
        overlayVisible,
        openOverlay,
        closeOverlay,
        selectCategoria,
        clearCategoriaActiva,
        categoriaActivaLabel,
        listRef,
        personas,
        peticiones: PETICIONES_ROW,
        favoritos,
        state: {
            subcategorias,
            categoriaActiva,
            overlayVisible,
        } satisfies TableroState,
    };
}
