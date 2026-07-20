/**
 * Rondas de ejercicios Grupo 2 — nivel 3 (pedir ayuda / necesidades).
 */

export type QueNecesitoRonda = {
    situEmoji: string;
    situBg: string;
    texto: string;
    botonLabel: string;
    botonEmoji: string;
    botonBg: string;
    botonFg: string;
    vozAntes: string;
    frase: string;
};

export const RONDAS_QUE_NECESITO: QueNecesitoRonda[] = [
    {
        situEmoji: '🩹',
        situBg: '#FFEBEE',
        texto: 'El niño tiene una herida',
        botonLabel: 'ME DUELE',
        botonEmoji: '😣',
        botonBg: '#FFCDD2',
        botonFg: '#B71C1C',
        vozAntes: "El niño tiene dolor. Toca 'me duele'.",
        frase: 'Me duele.',
    },
    {
        situEmoji: '☀️',
        situBg: '#E3F2FD',
        texto: 'El niño tiene mucho calor y sed',
        botonLabel: 'QUIERO AGUA',
        botonEmoji: '🥤',
        botonBg: '#E3F2FD',
        botonFg: '#1565C0',
        vozAntes: 'El niño tiene sed. Toca para pedir agua.',
        frase: 'Quiero agua.',
    },
    {
        situEmoji: '😴',
        situBg: '#EDE7F6',
        texto: 'El niño está muy cansado',
        botonLabel: 'QUIERO DESCANSAR',
        botonEmoji: '😴',
        botonBg: '#EDE7F6',
        botonFg: '#4527A0',
        vozAntes: 'El niño está cansado. Toca para descansar.',
        frase: 'Quiero descansar.',
    },
];

export type ComoLoDigoBtn = { id: string; label: string; emoji: string; bg: string; fg: string };

export type ComoLoDigoRonda = {
    situEmoji: string;
    situBg: string;
    texto: string;
    correctoId: string;
    botones: ComoLoDigoBtn[];
    frase: string;
};

export const RONDAS_COMO_LO_DIGO: ComoLoDigoRonda[] = [
    {
        situEmoji: '🤢',
        situBg: '#E8F5E9',
        texto: 'El niño se siente mal del estómago',
        correctoId: 'duele',
        botones: [
            { id: 'duele', label: 'Me duele', emoji: '😣', bg: '#FFCDD2', fg: '#B71C1C' },
            { id: 'agua', label: 'Quiero agua', emoji: '🥤', bg: '#E3F2FD', fg: '#1565C0' },
            { id: 'ayuda', label: 'Ayuda', emoji: '🙋', bg: '#FFF9C4', fg: '#F57F17' },
        ],
        frase: 'Me duele.',
    },
    {
        situEmoji: '😭',
        situBg: '#FCE4EC',
        texto: 'El niño está llorando y no sabe qué hacer',
        correctoId: 'ayuda',
        botones: [
            { id: 'duele', label: 'Me duele', emoji: '😣', bg: '#FFCDD2', fg: '#B71C1C' },
            { id: 'agua', label: 'Quiero agua', emoji: '🥤', bg: '#E3F2FD', fg: '#1565C0' },
            { id: 'ayuda', label: 'Ayuda', emoji: '🙋', bg: '#FFF9C4', fg: '#F57F17' },
        ],
        frase: 'Ayuda.',
    },
    {
        situEmoji: '🌵',
        situBg: '#FFF8E1',
        texto: 'El niño lleva horas sin tomar nada',
        correctoId: 'agua',
        botones: [
            { id: 'duele', label: 'Me duele', emoji: '😣', bg: '#FFCDD2', fg: '#B71C1C' },
            { id: 'agua', label: 'Quiero agua', emoji: '🥤', bg: '#E3F2FD', fg: '#1565C0' },
            { id: 'bano', label: 'Baño', emoji: '🚽', bg: '#E8F5E9', fg: '#2E7D32' },
        ],
        frase: 'Quiero agua.',
    },
];

export type AQuienLePidoOpt = { id: string; emoji: string; rol: string };

export type AQuienLePidoRonda = {
    situEmoji: string;
    situBg: string;
    texto: string;
    voz: string;
    opciones: AQuienLePidoOpt[];
    correctas: string[];
    feedback: Record<string, string>;
};

export const RONDAS_A_QUIEN_LE_PIDO: AQuienLePidoRonda[] = [
    {
        situEmoji: '🤢',
        situBg: '#FFF3E0',
        texto: 'Me duele el estómago en casa',
        voz: 'Estás en casa. ¿A quién le pides ayuda?',
        opciones: [
            { id: 'mama', emoji: '👩', rol: 'Mamá / Papá' },
            { id: 'maestra', emoji: '👩‍🏫', rol: 'Maestra' },
            { id: 'doctor', emoji: '👨‍⚕️', rol: 'Doctor' },
        ],
        correctas: ['mama'],
        feedback: {
            mama: '¡Correcto! En casa le pides a mamá o papá.',
        },
    },
    {
        situEmoji: '😖',
        situBg: '#E8EAF6',
        texto: 'Me caí en el patio del colegio',
        voz: 'Estás en el colegio. ¿A quién le avisas?',
        opciones: [
            { id: 'mama', emoji: '👩', rol: 'Mamá / Papá' },
            { id: 'maestra', emoji: '👩‍🏫', rol: 'Maestra' },
            { id: 'doctor', emoji: '👨‍⚕️', rol: 'Doctor' },
        ],
        correctas: ['maestra'],
        feedback: {
            maestra: '¡Muy bien! En el colegio le avisas a la maestra.',
        },
    },
    {
        situEmoji: '🤒',
        situBg: '#FFEBEE',
        texto: 'Me duele mucho la cabeza y tengo fiebre',
        voz: 'Te sientes muy mal. ¿A quién le pides ayuda?',
        opciones: [
            { id: 'mama', emoji: '👩', rol: 'Mamá / Papá' },
            { id: 'maestra', emoji: '👩‍🏫', rol: 'Maestra' },
            { id: 'doctor', emoji: '👨‍⚕️', rol: 'Doctor' },
        ],
        correctas: ['doctor', 'mama'],
        feedback: {
            doctor: '¡Bien! El doctor puede ayudarte cuando estás muy enfermo.',
            mama: '¡También! Primero le dices a mamá o papá y ellos te llevan al doctor.',
        },
    },
];
