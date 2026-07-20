/**
 * Requires centralizados junto a los mp3 (rutas relativas `./`) para que Metro las resuelva en Android.
 * No mover los `require` a `features/…` con muchos `../`.
 */
export const TUTORIAL_G1G2_FEMENINA: Record<number, number> = {
    1: require('./femenina/Samantha_audio1_¡Hola! Bienvenido a ComuniTEA_Vamos a jugar_Toca la categoría de ALIMENTOS para empezar.mp3'),
    2: require('./femenina/Samantha_audio2_Mira la imagen de jugo_Quiero el jugo_Toquemos el jugo.mp3'),
    3: require('./femenina/Samantha_audio3_Vamos tu puedes! Toca la imagen de jugo.mp3'),
    4: require('./femenina/Samantha_audio4_MUYBIEN.mp3'),
    5: require('./femenina/Samantha_audio5_Ahora nos preguntamos_ ¿Qué es lo que quieres_.mp3'),
    6: require('./femenina/Samantha_audio6_Queremos el jugo_Toquemos la imagen del jugo.mp3'),
    7: require('./femenina/Samantha_audio7_INTENTAOTRAVEZ.mp3'),
    8: require('./femenina/Samantha_audio8_Vas muy bien!_Ahora toca el yo quiero_Vamos tu puedes, toca el yo quiero.mp3'),
    9: require('./femenina/Samantha_audio9_Ahora toca el jugo.mp3'),
    10: require('./femenina/Samantha_audio10_Formamos la frase_ Yo quiero jugo_¡Excelente!.mp3'),
    11: require('./femenina/Samantha_audio11_FELICIDADES, hemos terminado.mp3'),
};

export const TUTORIAL_G1G2_MASCULINO: Record<number, number> = {
    1: require('./masculino/Luis_audio1_¡Hola! Bienvenido a ComuniTEA_Vamos a jugar_Toca la categoría de ALIMENTOS para empezar.mp3'),
    2: require('./masculino/Luis_audio2_Mira la imagen de jugo_Quiero el jugo_Toquemos el jugo.mp3'),
    3: require('./masculino/Luis_ audio3_Vamos tu puedes! Toca la imagen de jugo.mp3'),
    4: require('./masculino/Luis_audio4_ ¡Muy bien!.mp3'),
    5: require('./masculino/Luis_audio5_Ahora nos preguntamos_ ¿Qué es lo que quieres_.mp3'),
    6: require('./masculino/Luis_audio6_Queremos el jugo_Toquemos la imagen del jugo.mp3'),
    7: require('./masculino/Luis_audio7_Intenta otra vez.mp3'),
    8: require('./masculino/Luis_audio8_Vas muy bien!_Ahora toca el yo quiero_Vamos tu puedes, toca el yo quiero.mp3'),
    9: require('./masculino/Luis_audio9_Ahora toca el jugo.mp3'),
    10: require('./masculino/Luis_audio10_Formamos la frase_ Yo quiero jugo_¡Excelente!.mp3'),
    11: require('./masculino/Luis_audio11_FELICIDADES, hemos terminado.mp3'),
};
