/**
 * Datos y textos de voz — ejercicios Grupo 2 (TEA nivel moderado).
 */

/** Fondo ejercicios Grupo 2 — azul muy suave */
export const G2_BG = '#F0F4FF';

/** Ejercicios por nivel en el camino G2 (slots 1–6; 4–6 pueden ser “próximamente”). */
export const G2_EJERCICIOS_POR_NIVEL = 6;

export const NIVEL_G2_EMOJI: Record<number, string> = {
    1: '👋',
    2: '💜',
    3: '🙋',
    4: '🗂️',
    5: '💬',
};

export const NIVEL_G2_NOMBRES: Record<number, string> = {
    1: 'Reconocer y Pedir',
    2: 'Mis emociones',
    3: 'Pedir ayuda',
    4: 'Las Categorías',
    5: 'Turno y Respuesta',
};

export const NIVEL_G2_INTRO_VOZ: Record<number, string> = {
    1: 'Nivel uno. Reconocer y pedir. Sigue las instrucciones.',
    2: 'Nivel dos. Mis emociones. Mira las escenas y dime cómo se siente.',
    3: 'Nivel tres. Pedir ayuda. Aprende qué necesitas y a quién se lo dices.',
    4: 'Nivel cuatro. Las categorías. Busca en el lugar correcto.',
    5: 'Nivel cinco. Turno y respuesta. Responde a la profe.',
};

export const MAPA_G2_BIENVENIDA = '¡Hola! Vamos a practicar. ¿Empezamos?';

export function g2ExerciseKey(nivel: number, ejercicioIndex: number): string {
    return `${nivel}-${ejercicioIndex + 1}`;
}

/** Sub-ejercicio E1|E2|E3 dentro de un nivel (p. ej. 2-E1) */
export function g2SubExerciseKey(nivel: number, sub: 'E1' | 'E2' | 'E3'): string {
    return `${nivel}-${sub}`;
}

export function starsFromFailsG2(totalFails: number): 1 | 2 | 3 {
    if (totalFails === 0) return 3;
    if (totalFails <= 2) return 2;
    return 1;
}

/** Nivel 1 */
export type G2Opt = { id: string; emoji: string; label: string };

export const G2_N1_E1: { opciones: [G2Opt, G2Opt]; instruccion: string } = {
    opciones: [
        { id: 'manzana', emoji: '🍎', label: 'Manzana' },
        { id: 'jugo', emoji: '🥤', label: 'Jugo' },
    ],
    instruccion: '¿Qué quieres? Toca lo que quieres.',
};

export const G2_N1_E2 = {
    opciones: [
        { id: 'galleta', emoji: '🍪', label: 'Galleta' },
        { id: 'auto', emoji: '🚗', label: 'Auto' },
        { id: 'oso', emoji: '🧸', label: 'Oso' },
    ] as G2Opt[],
    correctoId: 'auto',
    instruccion: 'Toca el auto.',
    pista: 'El auto es un juguete con ruedas.',
};

export const G2_N1_E3 = {
    opciones: [
        { id: 'manzana', emoji: '🍎', label: 'Manzana' },
        { id: 'platano', emoji: '🍌', label: 'Plátano' },
        { id: 'naranja', emoji: '🍊', label: 'Naranja' },
    ] as G2Opt[],
    correctoId: 'naranja',
    instruccion: 'Toca la naranja.',
    pista: 'La naranja es redonda y de color naranja.',
};

/** Pictograma con palabra para leer la frase en voz alta */
export type G2PictoFrase = { id: string; emoji: string; label: string; palabra: string };

/** Nivel 4 — NavegadorCategorias */
export const G2_N4_E1 = {
    faseA: [
        { id: 'comida', emoji: '🍽️', nombre: 'Comida', bg: '#FFF8E1' },
        { id: 'juguetes', emoji: '🚗', nombre: 'Juguetes', bg: '#E8F5E9' },
    ],
    categoriaCorrecta: 'comida',
    vozA: '¿Dónde está el jugo? Toca la categoría.',
    vozAError: 'El jugo es una comida. Toca Comida.',
    faseBPictos: [
        { id: 'jugo', emoji: '🥤', label: 'Jugo' },
        { id: 'pan', emoji: '🍞', label: 'Pan' },
        { id: 'queso', emoji: '🧀', label: 'Queso' },
        { id: 'manzana', emoji: '🍎', label: 'Manzana' },
        { id: 'leche', emoji: '🥛', label: 'Leche' },
        { id: 'galleta', emoji: '🍪', label: 'Galleta' },
    ] as G2Opt[],
    pictoCorrecto: 'jugo',
    vozB: '¡Bien! Ahora toca el jugo.',
};

export const G2_N4_E2 = {
    faseA: [
        { id: 'comida', emoji: '🍽️', nombre: 'Comida', bg: '#FFF8E1' },
        { id: 'verduras', emoji: '🌿', nombre: 'Verduras', bg: '#E8F5E9' },
        { id: 'emociones', emoji: '😊', nombre: 'Emociones', bg: '#F3E5F5' },
    ],
    categoriaCorrecta: 'emociones',
    vozA: 'Quieres decir que estás feliz. ¿En qué categoría está?',
    vozAError: 'Las emociones están en otra categoría. Toca Emociones.',
    faseBPictos: [
        { id: 'feliz', emoji: '😊', label: 'Feliz' },
        { id: 'triste', emoji: '😢', label: 'Triste' },
        { id: 'enojado', emoji: '😠', label: 'Enojado' },
        { id: 'nervioso', emoji: '😰', label: 'Nervioso' },
    ] as G2Opt[],
    pictoCorrecto: 'feliz',
    vozB: '¡Bien! Ahora toca cómo te sientes.',
};

/** Nivel 4 ej. 3 — tablero real libre */
export const G2_N4_E3 = {
    instruccion: 'Ahora tú decides. Dime algo usando la app.',
    vozIdle: 'Toca una categoría para empezar.',
};

/** Nivel 5 */
export const G2_N5_E1 = {
    pregunta: '¿Qué quieres merendar?',
    vozPregunta: '¿Qué quieres merendar?',
    foodPictos: [
        { id: 'manzana', emoji: '🍎', label: 'Manzana', palabra: 'manzana' },
        { id: 'galleta', emoji: '🍪', label: 'Galleta', palabra: 'galleta' },
        { id: 'jugo', emoji: '🥤', label: 'Jugo', palabra: 'jugo' },
        { id: 'pan', emoji: '🍞', label: 'Pan', palabra: 'pan' },
        { id: 'queso', emoji: '🧀', label: 'Queso', palabra: 'queso' },
    ] as G2PictoFrase[],
    vozGracias: '¡Gracias por decirme!',
};

export const G2_N5_E2 = {
    pregunta: '¿Cómo estás hoy?',
    vozPregunta: '¿Cómo estás hoy?',
    emociones: [
        { id: 'bien', emoji: '😊', label: 'Bien', respuesta: '¡Me alegra que estés bien!' },
        { id: 'triste', emoji: '😢', label: 'Triste', respuesta: 'Lo siento. ¿Necesitas ayuda?' },
        { id: 'cansado', emoji: '😴', label: 'Cansado', respuesta: 'Descansa un poco.' },
        { id: 'enojado', emoji: '😠', label: 'Enojado', respuesta: 'Entiendo. Respira despacio.' },
    ],
};

export const G2_N5_E3 = {
    pregunta: '¿Qué quieres hacer ahora?',
    vozPregunta: '¿Qué quieres hacer ahora?',
    vozFinal: '¡Muy bien! Ya sabes usar ComuniTEA para hablar con los demás.',
};
