import { INTERMEDIATE_DATA, ADVANCED_DATA } from './VocabularyData';

export interface VocabularyItem {
    id: string;
    label: string;
    emoji: string;
    backgroundColor?: string;
    speechText?: string;
    items?: VocabularyItem[];
}

export interface LevelVocabulary {
    [key: string]: VocabularyItem;
}

export const VOCABULARY: Record<string, VocabularyItem[]> = {
    BASICO: [
        // ══════════════════════════════════════════════════════════════════
        // PALABRAS NÚCLEO — siempre visibles, sin sub-categoría.
        // Al tocarlas se añaden directamente a la tira de frase.
        // Son las más importantes para la comunicación funcional en TEA.
        // ══════════════════════════════════════════════════════════════════
        { id: 'core-yo',           label: 'YO',           emoji: '🧑',  speechText: 'yo',           backgroundColor: '#FFCC80' },
        { id: 'core-quiero',       label: 'QUIERO',       emoji: '🙋',  speechText: 'quiero',       backgroundColor: '#A5D6A7' },
        { id: 'core-no',           label: 'NO',           emoji: '🙅',  speechText: 'no',           backgroundColor: '#EF9A9A' },
        { id: 'core-me-gustaria',  label: 'ME GUSTARÍA',  emoji: '💭',  speechText: 'me gustaría',  backgroundColor: '#CE93D8' },
        { id: 'core-necesito',     label: 'NECESITO',     emoji: '❗',   speechText: 'necesito',     backgroundColor: '#FF8A65' },
        { id: 'core-no-me-gusta',  label: 'NO ME GUSTA',  emoji: '👎',  speechText: 'no me gusta',  backgroundColor: '#FFCDD2' },
        { id: 'core-hola',         label: 'HOLA',         emoji: '👋',  speechText: 'hola',         backgroundColor: '#80DEEA' },
        { id: 'core-gracias',      label: 'GRACIAS',      emoji: '🙏',  speechText: 'gracias',      backgroundColor: '#FFE082' },
        // ══════════════════════════════════════════════════════════════════
        // CATEGORÍAS — tienen sub-ítems; se accede con las pastillas
        // (Orden: alta frecuencia → autonomía → entorno)
        // ══════════════════════════════════════════════════════════════════
        {
            id: 'emociones',
            label: 'EMOCIONES',
            emoji: '😊',
            backgroundColor: '#FFF59D',
            items: [
                { id: 'calma', label: 'CALMA', emoji: '😌' },
                { id: 'alegria', label: 'ALEGRÍA', emoji: '😂' },
                { id: 'tristeza', label: 'TRISTEZA', emoji: '😢' },
                { id: 'enojo', label: 'ENOJO', emoji: '😠' },
                { id: 'miedo', label: 'MIEDO', emoji: '😨' },
                { id: 'sorpresa', label: 'SORPRESA', emoji: '😮' },
                { id: 'asco', label: 'ASCO', emoji: '🤢' },
            ]
        },
        {
            id: 'comida',
            label: 'COMIDA',
            emoji: '🍎',
            backgroundColor: '#E8F5E9',
            items: [
                {
                    id: 'frutas', label: 'FRUTAS', emoji: '🍇', items: [
                        { id: 'manzana', label: 'MANZANA', emoji: '🍎' },
                        { id: 'platano', label: 'PLÁTANO', emoji: '🍌' },
                        { id: 'fresas', label: 'FRESAS', emoji: '🍓' },
                        { id: 'uvas', label: 'UVAS', emoji: '🍇' },
                        { id: 'naranja', label: 'NARANJA', emoji: '🍊' },
                        { id: 'mandarina', label: 'MANDARINA', emoji: '🍊' },
                        { id: 'pera', label: 'PERA', emoji: '🍐' },
                        { id: 'sandia', label: 'SANDÍA', emoji: '🍉' },
                        { id: 'mango', label: 'MANGO', emoji: '🥭' },
                        { id: 'limon', label: 'LIMÓN', emoji: '🍋' },
                    ]
                },
                {
                    id: 'verduras', label: 'VERDURAS', emoji: '🥕', items: [
                        { id: 'zanahoria', label: 'ZANAHORIA', emoji: '🥕' },
                        { id: 'lechuga', label: 'LECHUGA', emoji: '🥬' },
                        { id: 'tomate', label: 'TOMATE', emoji: '🍅' },
                        { id: 'brocoli', label: 'BRÓCOLI', emoji: '🥦' },
                        { id: 'pepino', label: 'PEPINO', emoji: '🥒' },
                        { id: 'palta', label: 'PALTA', emoji: '🥑' },
                        { id: 'espinaca', label: 'ESPINACA', emoji: '🥬' },
                        { id: 'cebolla', label: 'CEBOLLA', emoji: '🧅' },
                    ]
                },
                {
                    id: 'bebidas', label: 'BEBIDAS', emoji: '🥤', items: [
                        { id: 'agua', label: 'AGUA', emoji: '💧' },
                        { id: 'leche', label: 'LECHE', emoji: '🥛' },
                        { id: 'jugo', label: 'JUGO', emoji: '🧃' },
                        { id: 'chocolatada', label: 'CHOCOLATADA', emoji: '🍫' },
                        { id: 'gaseosa', label: 'GASEOSA', emoji: '🫙' },
                    ]
                },
                {
                    id: 'lacteos', label: 'LÁCTEOS', emoji: '🧀', items: [
                        { id: 'queso', label: 'QUESO', emoji: '🧀' },
                        { id: 'yogurt', label: 'YOGURT', emoji: '🫙' },
                        { id: 'mantequilla', label: 'MANTEQUILLA', emoji: '🧈' },
                        { id: 'manjar', label: 'MANJAR', emoji: '🥄' },
                    ]
                },
                {
                    id: 'dulces', label: 'DULCES', emoji: '🍬', items: [
                        { id: 'paleta', label: 'PALETA', emoji: '🍭' },
                        { id: 'chocolate', label: 'CHOCOLATE', emoji: '🍫' },
                        { id: 'galleta', label: 'GALLETA', emoji: '🍪' },
                        { id: 'gelatina', label: 'GELATINA', emoji: '🍮' },
                        { id: 'pan', label: 'PAN', emoji: '🍞' },
                    ]
                },
                {
                    id: 'carnes', label: 'CARNES', emoji: '🍖', items: [
                        { id: 'pollo', label: 'POLLO', emoji: '🍗' },
                        { id: 'tocino', label: 'TOCINO', emoji: '🥓' },
                        { id: 'carne', label: 'CARNE', emoji: '🥩' },
                        { id: 'pescado', label: 'PESCADO', emoji: '🐟' },
                    ]
                },
            ]
        },
        {
            id: 'bano',
            label: 'BAÑO',
            emoji: '🚽',
            backgroundColor: '#B3E5FC',
            items: [
                { id: 'inodoro', label: 'BAÑO', emoji: '🚽' },
                { id: 'papel', label: 'PAPEL', emoji: '🧻' },
                { id: 'ducharse', label: 'DUCHARSE', emoji: '🚿' },
                { id: 'lavado', label: 'LAVAR MANOS', emoji: '🧼' },
                { id: 'dientes', label: 'DIENTES', emoji: '🪥' },
            ]
        },
        {
            id: 'jugar',
            label: 'JUGAR',
            emoji: '🎮',
            backgroundColor: '#90CAF9',
            items: [
                { id: 'pelota', label: 'PELOTA', emoji: '⚽' },
                { id: 'carro', label: 'CARRO', emoji: '🚗' },
                { id: 'legos', label: 'LEGOS', emoji: '🧱' },
                { id: 'dinosaurio', label: 'DINOSAURIO', emoji: '🦖' },
                { id: 'muneca', label: 'MUÑECA', emoji: '🪆' },
                { id: 'tren', label: 'TREN', emoji: '🚂' },
                { id: 'plastilina', label: 'PLASTILINA', emoji: '🪣' },
                { id: 'formas', label: 'FORMAS', emoji: '🔷' },
                { id: 'animales', label: 'ANIMALES', emoji: '🐮' },
            ]
        },
        {
            id: 'yo',
            label: 'YO',
            emoji: '🧑',
            backgroundColor: '#FFCC80',
            items: [
                { id: 'mi-nombre', label: 'ME LLAMO...', emoji: '🏷️', speechText: 'me llamo' },
                { id: 'tengo-calor', label: 'TENGO CALOR', emoji: '🥵', speechText: 'tengo calor' },
                { id: 'tengo-frio', label: 'TENGO FRÍO', emoji: '🥶', speechText: 'tengo frío' },
                { id: 'tengo-hambre', label: 'TENGO HAMBRE', emoji: '😋', speechText: 'tengo hambre' },
                { id: 'tengo-sed', label: 'TENGO SED', emoji: '🥤', speechText: 'tengo sed' },
                { id: 'estoy-cansado', label: 'ESTOY CANSADO', emoji: '🥱', speechText: 'estoy cansado' },
                { id: 'me-duele', label: 'ME DUELE', emoji: '🤕', speechText: 'me duele' },
            ]
        },
        {
            id: 'dormir',
            label: 'DORMIR',
            emoji: '🛏️',
            backgroundColor: '#D1C4E9',
            items: [
                { id: 'dormir-accion', label: 'DORMIR', emoji: '💤' },
                { id: 'pijama', label: 'PIJAMA', emoji: '🩳' },
                { id: 'osito', label: 'OSITO', emoji: '🧸' },
                { id: 'cama', label: 'CAMA', emoji: '🛏️' },
                { id: 'luz', label: 'LUZ', emoji: '💡' },
                { id: 'silencio', label: 'SILENCIO', emoji: '🤫' },
            ]
        },
        {
            id: 'ropa',
            label: 'ROPA',
            emoji: '👕',
            backgroundColor: '#F8BBD0',
            items: [
                { id: 'polo', label: 'POLO', emoji: '👕' },
                { id: 'pantalon', label: 'PANTALÓN', emoji: '👖' },
                { id: 'short', label: 'SHORT', emoji: '🩳' },
                { id: 'medias', label: 'MEDIAS', emoji: '🧦' },
                { id: 'zapatillas', label: 'ZAPATILLAS', emoji: '👟' },
                { id: 'zapatos', label: 'ZAPATOS', emoji: '👞' },
                { id: 'chompa', label: 'CHOMPA', emoji: '🧶' },
                { id: 'gorro', label: 'GORRO', emoji: '🧢' },
                { id: 'vestido', label: 'VESTIDO', emoji: '👗' },
                { id: 'casaca', label: 'CASACA', emoji: '🧥' },
                { id: 'calzon', label: 'ROPA INTERIOR', emoji: '👙' },
            ]
        },
        {
            id: 'quiero',
            label: 'QUIERO',
            emoji: '✋',
            backgroundColor: '#A5D6A7',
            items: [
                { id: 'comer', label: 'COMER', emoji: '🍽️' },
                { id: 'television', label: 'TELEVISIÓN', emoji: '📺' },
                { id: 'papa', label: 'PAPÁ', emoji: '👨' },
                { id: 'mama', label: 'MAMÁ', emoji: '👩❤️' },
            ]
        },
        {
            id: 'no-quiero',
            label: 'NO QUIERO',
            emoji: '🤚',
            backgroundColor: '#EF9A9A',
            items: [
                { id: 'no-me-gusta', label: 'NO ME GUSTA', emoji: '👎' },
                { id: 'no-jugar', label: 'NO JUGAR', emoji: '🙅‍♂️' },
                { id: 'no-dormir', label: 'NO DORMIR', emoji: '😫' },
                { id: 'no-hablar', label: 'NO HABLAR', emoji: '🤐' },
                { id: 'me-molesta', label: 'ME MOLESTA', emoji: '😤' },
            ]
        },
    ],
    INTERMEDIO: INTERMEDIATE_DATA,
    AVANZADO: ADVANCED_DATA
};

export const getVocabularyByLevel = (level: string): VocabularyItem[] => {
    return VOCABULARY[level] || VOCABULARY.BASICO;
};

/**
 * Busca recursivamente un VocabularyItem por id en cualquier nivel del árbol.
 * Usado por el sistema de sugerencias de co-ocurrencias (Fase 2).
 */
export const findItemById = (items: VocabularyItem[], targetId: string): VocabularyItem | undefined => {
    for (const item of items) {
        if (item.id === targetId) return item;
        if (item.items) {
            const found = findItemById(item.items, targetId);
            if (found) return found;
        }
    }
    return undefined;
};

/**
 * Aplana recursivamente un árbol de VocabularyItem, devolviendo sólo las hojas
 * (ítems sin sub-ítems). Permite navegación ≤2 niveles (categoría → ítems planos).
 * Los ítems con sub-ítems que son sub-categorías intermedias se sustituyen por
 * sus hijos directos; si una sub-categoría tiene a su vez hijos, se aplana de nuevo.
 */
export const flattenItems = (items: VocabularyItem[]): VocabularyItem[] => {
    const result: VocabularyItem[] = [];
    for (const item of items) {
        if (item.items && item.items.length > 0) {
            result.push(...flattenItems(item.items));
        } else {
            result.push(item);
        }
    }
    return result;
};

// 1. Definimos qué es un Pictograma
export interface Pictogram {
  id: string;           // Ej: 'comer', 'alegria' (Debe coincidir con las llaves de AUDIO_ASSETS)
  text: string;         // El texto que se muestra y que lee el TTS (Ej: 'Comer')
  iconName?: string;    // Nombre del icono (lucide o expo-vector-icons)
  image?: any;          // Por si usas imágenes locales (require) o fotos personalizadas
  color?: string;       // Color opcional para el borde o fondo del botón
}

// 2. Definimos qué es una Categoría (que contiene pictogramas)
export interface Category {
  id: string;
  title: string;
  icon: string;
  level: 'basico' | 'intermedio' | 'avanzado';
  items: Pictogram[];
}