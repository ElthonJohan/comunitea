/**
 * Plantillas de frase AAC y mensajes de voz compartidos (tablero / formadores).
 */

/** Prefijo estándar para leer la frase (TTS y UI pill) */
export const FRASE_PREFIX_YO_QUIERO = 'Yo quiero';

/** Texto del botón “yo quiero” en formadores (mayúsculas) */
export const LABEL_YO_QUIERO_BOTON = 'YO QUIERO';

/** Frase hablada a partir de etiquetas de pictos en la barra */
export function buildFraseYoQuieroFromLabels(labels: string[]): string {
    return `${FRASE_PREFIX_YO_QUIERO} ${labels.join(' ')}`;
}

/** Frase con una sola palabra/objeto (termina en punto) */
export function buildFraseYoQuieroPalabra(palabra: string): string {
    const p = palabra.trim().replace(/\.+$/, '');
    return `${FRASE_PREFIX_YO_QUIERO} ${p}.`;
}

/** Tablero G2: mínimo de pictos antes de hablar */
export const VOZ_TABLERO_G2_MIN_PICTOS =
    'Pon al menos dos pictogramas y vuelve a tocar el botón.';

/** Formador frase G2 */
export const VOZ_FORMADOR_G2_PRIMERO_YO_QUIERO = "Primero toca 'Yo quiero'.";
export const VOZ_FORMADOR_G2_AHORA_ELIGE = 'Ahora elige.';

export function vozFormadorG2BienAhoraTocaLabel(label: string): string {
    return `¡Bien! Ahora toca ${label.toLowerCase()}.`;
}

/** Formador frase G3 */
export const VOZ_FORMADOR_G3_PRIMERO_YO_QUIERO = "Primero toca 'yo quiero'.";

export function vozFormadorG3BienAhoraTocaLabel(label: string): string {
    return `¡Bien! Ahora toca ${label.toLowerCase()}.`;
}
