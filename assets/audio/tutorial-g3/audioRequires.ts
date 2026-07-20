/**
 * Requires junto a los mp3 (rutas `./`) para que Metro resuelva en Android.
 * Tutorial nivel básico (BASICO) — carpeta `tutorial-g3` (`femenino` / `masculino`).
 */
export const TUTORIAL_G3_FEMENINO: Record<number, number> = {
    1: require('./femenino/Samantha_audio1_¡Hola! Bienvenido a ComuniTEA_Vamos a jugar_Toca la categoría de ALIMENTOS para empezar.mp3'),
    2: require('./femenino/Samantha_audio2_Mira la manzana_Toquemos la manzana.mp3'),
    3: require('./femenino/Samantha_audio3_Vamos tu puedes.mp3'),
    4: require('./femenino/Samantha_audio4_¡Muy bien, has tocado la manzana!.mp3'),
    5: require('./femenino/Samantha_audio5_Mira una manzana_Elige la misma imagen_Es la manzana_.mp3'),
    6: require('./femenino/Samantha_audio6_¡Muy bien, lo has logrado!.mp3'),
    7: require('./femenino/Samantha_audio7_Intentemos otra vez.mp3'),
    8: require('./femenino/Samantha_audio8_Vamos, casi terminamos.mp3'),
    10: require('./femenino/Samantha_audio10_FELICIDADES, hemos terminado.mp3'),
};

export const TUTORIAL_G3_MASCULINO: Record<number, number> = {
    1: require('./masculino/Luis_audio1_¡Hola! Bienvenido a ComuniTEA_Vamos a jugar_Toca la categoría de ALIMENTOS para empezar.mp3'),
    2: require('./masculino/Luis_audio2_Mira la manzana_Toquemos la manzana.mp3'),
    3: require('./masculino/Luis_audio3_Vamos tu puedes.mp3'),
    4: require('./masculino/Luis_audio4_¡Muy bien, has tocado la manzana!.mp3'),
    5: require('./masculino/Luis_audio5_Mira una manzana_Elige la misma imagen_Es la manzana.mp3'),
    6: require('./masculino/Luis_audio6_¡Muy bien, lo has logrado!.mp3'),
    7: require('./masculino/Luis_audio7_Intentemos otra vez.mp3'),
    /* Comillas tipográficas en el nombre del archivo en disco (U+201D, U+201C). */
    8: require('./masculino/Luis_audio8_Vamos casi terminamos_ Arrastremos la manzana\u201d \u201cLlévala a la boca\u201d.mp3'),
    9: require('./masculino/Luis_audio9_FELICIDADES, hemos terminado.mp3'),
};
