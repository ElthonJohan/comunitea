export type CategoryLevel = 'BASICO' | 'INTERMEDIO' | 'AVANZADO';

export interface Category {
    id: string;
    label: string;
    emoji: string;
    backgroundColor?: string;
    customContent?: React.ReactNode;
}

// NIVEL BÁSICO - 9 categorías
export const BASIC_CATEGORIES: Category[] = [
    {
        id: 'yo',
        label: 'YO',
        emoji: '👤',
        backgroundColor: '#FFCC80',
    },
    {
        id: 'comida',
        label: 'COMIDA',
        emoji: '🍎',
        backgroundColor: '#E8F5E9',
    },
    {
        id: 'emociones',
        label: 'EMOCIONES',
        emoji: '😊',
        backgroundColor: '#FFF59D',
    },
    {
        id: 'bano',
        label: 'BAÑO',
        emoji: '🚽',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'dormir',
        label: 'DORMIR',
        emoji: '🛏️',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'jugar',
        label: 'JUGAR',
        emoji: '🎮',
        backgroundColor: '#90CAF9',
    },
    {
        id: 'ropa',
        label: 'ROPA',
        emoji: '👕',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'quiero',
        label: 'QUIERO',
        emoji: '✋',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'no-quiero',
        label: 'NO QUIERO',
        emoji: '🚫',
        backgroundColor: '#B0BEC5',
    },
];

// NIVEL INTERMEDIO - 12 categorías
export const INTERMEDIATE_CATEGORIES: Category[] = [
    {
        id: 'yo',
        label: 'YO',
        emoji: '👤',
        backgroundColor: '#FFCC80',
    },
    {
        id: 'comida',
        label: 'COMIDA',
        emoji: '🍎',
        backgroundColor: '#E8F5E9',
    },
    {
        id: 'emociones',
        label: 'EMOCIONES',
        emoji: '😊',
        backgroundColor: '#FFF59D',
    },
    {
        id: 'personas',
        label: 'PERSONAS',
        emoji: '👨‍👩‍👧‍👦',
        backgroundColor: '#FFF9C4',
    },
    {
        id: 'numeros',
        label: 'NÚMEROS',
        emoji: '🔢',
        backgroundColor: '#C8E6C9',
    },
    {
        id: 'colores',
        label: 'COLORES',
        emoji: '🎨',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'quiero-decir',
        label: 'QUIERO DECIR',
        emoji: '💬',
        backgroundColor: '#FFE0B2',
    },
    {
        id: 'no-quiero',
        label: 'NO QUIERO',
        emoji: '✋',
        backgroundColor: '#B0BEC5',
    },
    {
        id: 'abcdario',
        label: 'ABCDARIO',
        emoji: '🔤',
        backgroundColor: '#FFCCBC',
    },
    {
        id: 'hora',
        label: 'HORA',
        emoji: '🕐',
        backgroundColor: '#80DEEA',
    },
    {
        id: 'lugar',
        label: 'LUGAR',
        emoji: '📍',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'higiene',
        label: 'HIGIENE',
        emoji: '🧼',
        backgroundColor: '#FFFFFF',
    },
];

// NIVEL AVANZADO - 16 categorías
export const ADVANCED_CATEGORIES: Category[] = [
    {
        id: 'yo-quiero',
        label: 'YO QUIERO',
        emoji: '✋',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'me-gusta',
        label: 'ME GUSTA',
        emoji: '👍',
        backgroundColor: '#64B5F6',
    },
    {
        id: 'no-me-gusta',
        label: 'NO ME GUSTA',
        emoji: '👎',
        backgroundColor: '#EF9A9A',
    },
    {
        id: 'podemos-hablar',
        label: '¿PODEMOS HABLAR?',
        emoji: '💬',
        backgroundColor: '#A5D6A7',
    },
    {
        id: 'personas',
        label: 'PERSONAS',
        emoji: '👨‍👩‍👧‍👦',
        backgroundColor: '#FFF9C4',
    },
    {
        id: 'lugar',
        label: 'LUGAR',
        emoji: '📍',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'comida',
        label: 'COMIDA',
        emoji: '🍎',
        backgroundColor: '#E8F5E9',
    },
    {
        id: 'higiene',
        label: 'HIGIENE',
        emoji: '🧼',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'escuela',
        label: 'ESCUELA',
        emoji: '🏫',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'agenda',
        label: 'AGENDA',
        emoji: '📅',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'hora',
        label: 'HORA',
        emoji: '🕐',
        backgroundColor: '#80DEEA',
    },
    {
        id: 'conversaciones',
        label: 'CONVERSACIONES',
        emoji: '💭',
        backgroundColor: '#81D4FA',
    },
    {
        id: 'necesito-ayuda',
        label: 'NECESITO AYUDA',
        emoji: '🆘',
        backgroundColor: '#FF8A80',
    },
    {
        id: 'verbos',
        label: 'VERBOS',
        emoji: '⚙️',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'colores',
        label: 'COLORES',
        emoji: '🎨',
        backgroundColor: '#FFFFFF',
    },
    {
        id: 'tamanos',
        label: 'TAMAÑOS',
        emoji: '📏',
        backgroundColor: '#FFFFFF',
    },
];

export const getCategoriesByLevel = (level: CategoryLevel): Category[] => {
    switch (level) {
        case 'BASICO':
            return BASIC_CATEGORIES;
        case 'INTERMEDIO':
            return INTERMEDIATE_CATEGORIES;
        case 'AVANZADO':
            return ADVANCED_CATEGORIES;
        default:
            return BASIC_CATEGORIES;
    }
};

// ──────────────────────────────────────────────────────────────
// Intenciones comunicativas (A3)
// Las 5 intenciones mapean IDs de categorías raíz a cada intento
// ──────────────────────────────────────────────────────────────
export type CommunicativeIntent = 'quiero' | 'siento' | 'hago' | 'veo' | 'no_quiero';

export interface IntentCategory {
    id: CommunicativeIntent;
    label: string;
    emoji: string;
    color: string;
}

export const INTENT_CATEGORIES: IntentCategory[] = [
    { id: 'quiero',    label: 'QUIERO',    emoji: '✋',  color: '#4CAF50' },
    { id: 'siento',    label: 'SIENTO',    emoji: '😊',  color: '#FFC107' },
    { id: 'hago',      label: 'HAGO',      emoji: '🏃',  color: '#2196F3' },
    { id: 'veo',       label: 'VEO',       emoji: '👀',  color: '#9C27B0' },
    { id: 'no_quiero', label: 'NO QUIERO', emoji: '🚫',  color: '#F44336' },
];

/** IDs de categoría raíz que corresponden a cada intención comunicativa */
export const CATEGORY_TO_INTENT: Record<string, CommunicativeIntent> = {
    // QUIERO (peticiones y deseos)
    comida:          'quiero',
    jugar:           'quiero',
    quiero:          'quiero',
    juguetes:        'quiero',
    'quiero-decir':  'quiero',
    'yo-quiero':     'quiero',
    'me-gusta':      'quiero',

    // SIENTO (estados internos y emociones)
    yo:              'siento',
    emociones:       'siento',

    // HAGO (acciones y rutinas)
    bano:            'hago',
    dormir:          'hago',
    ropa:            'hago',
    rutina:          'hago',
    higiene:         'hago',
    escuela:         'hago',
    agenda:          'hago',
    verbos:          'hago',
    hora:            'hago',
    transporte:      'hago',

    // VEO (entorno y descripción)
    personas:        'veo',
    lugar:           'veo',
    colores:         'veo',
    naturaleza:      'veo',
    animales:        'veo',
    numeros:         'veo',
    tamanos:         'veo',
    abcdario:        'veo',

    // NO QUIERO (negación)
    'no-quiero':     'no_quiero',
    'no-me-gusta':   'no_quiero',
    'necesito-ayuda': 'no_quiero',
};

