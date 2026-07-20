/**
 * Rondas de ejercicios Grupo 2 — nivel 2 (emociones).
 */

export type ReconocerEmocionRonda = {
    situEmoji: string;
    texto: string;
    opciones: { id: string; emoji: string; label: string }[];
    correctoId: string;
};

export const RONDAS_RECONOCER_EMOCION: ReconocerEmocionRonda[] = [
    {
        situEmoji: '🎂',
        texto: 'El niño recibió un regalo',
        opciones: [
            { id: 'feliz', emoji: '😊', label: 'Feliz' },
            { id: 'triste', emoji: '😢', label: 'Triste' },
        ],
        correctoId: 'feliz',
    },
    {
        situEmoji: '😤',
        texto: 'El niño no puede abrir la caja',
        opciones: [
            { id: 'feliz', emoji: '😊', label: 'Feliz' },
            { id: 'enojado', emoji: '😠', label: 'Enojado' },
        ],
        correctoId: 'enojado',
    },
    {
        situEmoji: '🤗',
        texto: 'El niño abraza a mamá',
        opciones: [
            { id: 'feliz', emoji: '😊', label: 'Feliz' },
            { id: 'triste', emoji: '😢', label: 'Triste' },
        ],
        correctoId: 'feliz',
    },
];

export type IdentificarEmocionRonda = {
    muestra: string;
    correctoId: string;
    opciones: { id: string; emoji: string; label: string }[];
};

export const RONDAS_IDENTIFICAR_EMOCION: IdentificarEmocionRonda[] = [
    {
        muestra: '😊',
        correctoId: 'feliz',
        opciones: [
            { id: 'feliz', emoji: '😊', label: 'Feliz' },
            { id: 'triste', emoji: '😢', label: 'Triste' },
            { id: 'enojado', emoji: '😠', label: 'Enojado' },
        ],
    },
    {
        muestra: '😰',
        correctoId: 'nervioso',
        opciones: [
            { id: 'feliz', emoji: '😊', label: 'Feliz' },
            { id: 'nervioso', emoji: '😰', label: 'Nervioso' },
            { id: 'triste', emoji: '😢', label: 'Triste' },
        ],
    },
    {
        muestra: '😠',
        correctoId: 'enojado',
        opciones: [
            { id: 'enojado', emoji: '😠', label: 'Enojado' },
            { id: 'feliz', emoji: '😊', label: 'Feliz' },
            { id: 'triste', emoji: '😢', label: 'Triste' },
        ],
    },
];

export type UnirEmocionPar = { faceId: string; emoji: string; word: string };

export type UnirEmocionRonda = { pares: UnirEmocionPar[] };

export const RONDAS_UNIR_EMOCION: UnirEmocionRonda[] = [
    {
        pares: [
            { faceId: 'feliz', emoji: '😊', word: 'Feliz' },
            { faceId: 'triste', emoji: '😢', word: 'Triste' },
        ],
    },
    {
        pares: [
            { faceId: 'feliz', emoji: '😊', word: 'Feliz' },
            { faceId: 'enojado', emoji: '😠', word: 'Enojado' },
            { faceId: 'triste', emoji: '😢', word: 'Triste' },
        ],
    },
    {
        pares: [
            { faceId: 'feliz', emoji: '😊', word: 'Feliz' },
            { faceId: 'nervioso', emoji: '😰', word: 'Nervioso' },
            { faceId: 'enojado', emoji: '😠', word: 'Enojado' },
        ],
    },
];
