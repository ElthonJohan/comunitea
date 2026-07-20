/**
 * Datos del tablero AAC: pictogramas, subcategorías, filas fijas.
 */

export interface Pictograma {
    id: string;
    emoji: string;
    label: string;
    categoria: string;
    esFavorito: boolean;
    /**
     * Clave en `getAudioAssets(perfil)` de `constants/AudioAssets.ts`.
     * Si no se define, se usa `id` al resolver el clip (p. ej. `manzana` → archivo manzana.mp3).
     */
    audioAssetKey?: string;
    /** Foto del niño u otro picto con imagen remota (personas / tablero). */
    imageUri?: string;
}

export interface Subcategoria {
    id: string;
    nombre: string;
    emoji: string;
    categoriaId: string;
    pictogramas: Pictograma[];
}

export function pic(
    id: string,
    emoji: string,
    label: string,
    categoria: string,
    esFavorito = false,
    audioAssetKey?: string,
    imageUri?: string,
): Pictograma {
    return {
        id,
        emoji,
        label,
        categoria,
        esFavorito,
        ...(audioAssetKey !== undefined ? { audioAssetKey } : {}),
        ...(imageUri !== undefined && imageUri.length > 0 ? { imageUri } : {}),
    };
}

/** Clave para buscar el mp3 en `getAudioAssets(voice)` al reproducir un pictograma del tablero. */
export function getPictogramAudioKey(p: Pictograma): string {
    return p.audioAssetKey ?? p.id;
}

export const PERSONAS_ROW: Pictograma[] = [
    pic('mama', '👩', 'Mamá', 'personas'),
    pic('papa', '👨', 'Papá', 'personas'),
    pic('profe', '👩‍🏫', 'Profe', 'personas'),
    pic('nico', '👦', 'Nico', 'personas'),
];

export const PETICIONES_ROW: Pictograma[] = [
    pic('quiero', '🤲', 'Quiero', 'peticiones'),
    pic('no-quiero', '🚫', 'No quiero', 'peticiones'),
    pic('me-gusta', '❤️', 'Me gusta', 'peticiones'),
    pic('me-duele', '😣', 'Me duele', 'peticiones'),
    pic('ayuda', '🙋', 'Ayuda', 'peticiones'),
];

export const ALL_SUBCATS: Subcategoria[] = [
    {
        id: 'frutas',
        nombre: 'Frutas',
        emoji: '🍎',
        categoriaId: 'frutas',
        pictogramas: [
            pic('manzana', '🍎', 'Manzana', 'frutas', true),
            pic('platano', '🍌', 'Plátano', 'frutas'),
            pic('naranja', '🍊', 'Naranja', 'frutas'),
            pic('uvas', '🍇', 'Uvas', 'frutas'),
            pic('fresa', '🍓', 'Fresa', 'frutas', false, 'fresas'),
        ],
    },
    {
        id: 'comida',
        nombre: 'Comida',
        emoji: '🍽️',
        categoriaId: 'comida',
        pictogramas: [
            pic('jugo', '🥤', 'Jugo', 'comida'),
            pic('galleta', '🍪', 'Galleta', 'comida'),
            pic('huevo', '🍳', 'Huevo', 'comida'),
            pic('pan', '🍞', 'Pan', 'comida'),
            pic('arroz', '🍚', 'Arroz', 'comida'),
        ],
    },
    {
        id: 'juguetes',
        nombre: 'Juguetes',
        emoji: '🧸',
        categoriaId: 'juguetes',
        pictogramas: [
            pic('auto', '🚗', 'Auto', 'juguetes', false, 'carro'),
            pic('pelota', '⚽', 'Pelota', 'juguetes'),
            pic('oso', '🧸', 'Oso', 'juguetes', false, 'osito'),
            pic('estrella', '⭐', 'Estrella', 'juguetes'),
        ],
    },
    {
        id: 'verduras',
        nombre: 'Verduras',
        emoji: '🥕',
        categoriaId: 'verduras',
        pictogramas: [
            pic('zanahoria', '🥕', 'Zanahoria', 'verduras'),
            pic('tomate', '🍅', 'Tomate', 'verduras'),
            pic('brocoli', '🥦', 'Brócoli', 'verduras'),
        ],
    },
    {
        id: 'golosinas',
        nombre: 'Golosinas',
        emoji: '🍬',
        categoriaId: 'golosinas',
        pictogramas: [
            pic('caramelo', '🍬', 'Caramelo', 'golosinas'),
            pic('chocolate', '🍫', 'Chocolate', 'golosinas'),
            pic('helado', '🍦', 'Helado', 'golosinas'),
        ],
    },
    {
        id: 'actividades',
        nombre: 'Actividades',
        emoji: '🎮',
        categoriaId: 'actividades',
        pictogramas: [
            pic('dormir', '😴', 'Dormir', 'actividades', false, 'dormir-accion'),
            pic('bano', '🛁', 'Baño', 'actividades', false, 'banarse'),
            pic('jugar', '🎮', 'Jugar', 'actividades'),
            pic('leer', '📖', 'Leer', 'actividades'),
        ],
    },
    {
        id: 'emociones',
        nombre: 'Emociones',
        emoji: '😊',
        categoriaId: 'emociones',
        pictogramas: [
            pic('feliz', '😊', 'Feliz', 'emociones', false, 'alegria'),
            pic('triste', '😢', 'Triste', 'emociones', false, 'tristeza'),
            pic('enojado', '😠', 'Enojado', 'emociones', false, 'enojo'),
            pic('asustado', '😨', 'Asustado', 'emociones', false, 'miedo'),
        ],
    },
];
