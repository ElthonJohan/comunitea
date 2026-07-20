/**
 * Datos y textos de voz — ejercicios Grupo 3 (TEA nivel severo).
 */

/** Tema visual Grupo 3 — TEA nivel severo (menos estimulación). */
export const G3_LINEN = '#F8F4E3';
export const G3_PRIMARY = '#3949AB';
export const G3_GREEN = '#4CAF50';
export const G3_GREY = '#E0E0E0';
export const G3_LOCKED = '#E0E0E0';

export const NIVEL_G3_NOMBRES: Record<number, string> = {
    1: 'El Despertar',
    2: 'La Elección',
    3: 'Mis Necesidades',
    4: 'Pedir Ayuda',
    5: 'Mi Primera Frase',
};

export const NIVEL_G3_EMOJI: Record<number, string> = {
    1: '☀️',
    2: '🔀',
    3: '💭',
    4: '🤝',
    5: '✨',
};

export const NIVEL_G3_INTRO_VOZ: Record<number, string> = {
    1: 'Nivel uno. El despertar. Toca lo que ves en pantalla.',
    2: 'Nivel dos. La elección. Toca el dibujo que te digo.',
    3: 'Nivel tres. Mis necesidades. Elige el dibujo correcto.',
    4: 'Nivel cuatro. Pedir ayuda. Ayuda al niño a decir lo que necesita.',
    5: 'Nivel cinco. Tu primera frase. Sigue los pasos con calma.',
};

export type G3Side = 'left' | 'right';

export type G3L1 = { emoji: string; label: string; instruccion: string; bien: string };
export const G3_NIVEL_1: G3L1[] = [
    { emoji: '🍎', label: 'Manzana', instruccion: 'Toca la manzana', bien: 'Manzana' },
    { emoji: '🍌', label: 'Plátano', instruccion: 'Toca el plátano', bien: 'Plátano' },
    { emoji: '🧸', label: 'Juguete', instruccion: 'Toca el juguete', bien: 'Juguete' },
];

export type G3L2 = {
    emoji: string;
    label: string;
    instruccion: string;
    pictoSide: G3Side;
};
export const G3_NIVEL_2: G3L2[] = [
    { emoji: '🍎', label: 'Manzana', instruccion: 'Toca la manzana', pictoSide: 'left' },
    { emoji: '🍌', label: 'Plátano', instruccion: 'Toca el plátano', pictoSide: 'right' },
    { emoji: '🧸', label: 'Juguete', instruccion: 'Toca el juguete', pictoSide: 'left' },
];

export type G3L3 = {
    left: { emoji: string; label: string };
    right: { emoji: string; label: string };
    correct: G3Side;
    instruccion: string;
    correctoNombre: string;
};
export const G3_NIVEL_3: G3L3[] = [
    {
        left: { emoji: '🍎', label: 'Manzana' },
        right: { emoji: '⚽', label: 'Pelota' },
        correct: 'left',
        instruccion: 'Toca la manzana',
        correctoNombre: 'manzana',
    },
    {
        left: { emoji: '🥛', label: 'Leche' },
        right: { emoji: '🚗', label: 'Carro' },
        correct: 'left',
        instruccion: 'Toca la leche',
        correctoNombre: 'leche',
    },
    {
        left: { emoji: '🍪', label: 'Galleta' },
        right: { emoji: '👟', label: 'Zapato' },
        correct: 'left',
        instruccion: 'Toca la galleta',
        correctoNombre: 'galleta',
    },
];

export type G3NeedKind = 'duele' | 'agua' | 'ayuda';

export type G3L4 = {
    situBg: string;
    situEmoji: string;
    need: G3NeedKind;
    instruccion: string;
    frase: string;
    label: string;
};
export const G3_NIVEL_4: G3L4[] = [
    {
        situBg: '#FFEBEE',
        situEmoji: '🩹',
        need: 'duele',
        instruccion: 'Al niño le duele. Toca me duele.',
        frase: 'Me duele.',
        label: 'ME DUELE',
    },
    {
        situBg: '#FFF3E0',
        situEmoji: '☀️',
        need: 'agua',
        instruccion: 'El niño tiene sed. Toca quiero agua.',
        frase: 'Quiero agua.',
        label: 'QUIERO AGUA',
    },
    {
        situBg: '#E3F2FD',
        situEmoji: '😢',
        need: 'ayuda',
        instruccion: 'El niño necesita ayuda. Toca ayuda.',
        frase: 'Ayuda, por favor.',
        label: 'AYUDA',
    },
];

export type G3L5 = { emoji: string; label: string; instruccion: string; palabraFrase: string };
export const G3_NIVEL_5: G3L5[] = [
    { emoji: '🍎', label: 'Manzana', instruccion: 'Dime: yo quiero manzana. Toca los dos.', palabraFrase: 'manzana' },
    { emoji: '🍪', label: 'Galleta', instruccion: 'Pide la galleta. Toca los dibujos.', palabraFrase: 'galleta' },
    { emoji: '🧸', label: 'Juguete', instruccion: 'Pide el juguete.', palabraFrase: 'juguete' },
];

export function g3ExerciseKey(nivel: number, ejercicioIndex: number): string {
    return `${nivel}-${ejercicioIndex + 1}`;
}

export function starsFromFails(totalFails: number): 1 | 2 | 3 {
    if (totalFails === 0) return 3;
    if (totalFails <= 2) return 2;
    return 1;
}
