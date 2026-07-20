/**
 * Tipos compartidos entre features (dominio tablero AAC).
 */
export type { Pictograma, Subcategoria } from '../features/tablero/data/tablero';

export interface CategoriaResumen {
    id: string;
    nombre: string;
    emoji: string;
    pictogramCount: number;
}

export interface TableroState {
    subcategorias: import('../features/tablero/data/tablero').Subcategoria[];
    categoriaActiva: string | null;
    overlayVisible: boolean;
}
