/**
 * Cooccurrences.ts
 *
 * Mapa estático de co-ocurrencias entre pictogramas.
 * Cuando el niño selecciona un pictograma, el sistema consulta
 * este mapa para sugerir los 3 siguientes más probables.
 *
 * Clave:   id del pictograma actualmente en la SentenceStrip
 * Valor:   ids ordenados por relevancia (primeros = más sugeridos)
 *
 * Fase 4 (historial): este mapa actuará como fallback cuando el
 * usuario tenga menos de 20 frases registradas.
 */
export const COOCCURRENCES: Record<string, string[]> = {
    // ── Categorías principales ────────────────────────────────────────────
    'yo':            ['tengo-hambre', 'tengo-sed', 'me-duele', 'estoy-cansado', 'tengo-calor'],
    'comida':        ['agua', 'comer', 'manzana', 'pollo'],
    'emociones':     ['alegria', 'tristeza', 'miedo', 'calma'],
    'bano':          ['inodoro', 'lavado', 'dientes', 'papel'],
    'dormir':        ['osito', 'luz', 'silencio', 'cama'],
    'jugar':         ['formas', 'animales', 'television', 'mama'],
    'ropa':          ['polo', 'pantalon', 'zapatos', 'casaca'],
    'quiero':        ['comer', 'jugar', 'agua', 'mama', 'television'],
    'no-quiero':     ['no-me-gusta', 'no-jugar', 'no-dormir', 'me-molesta'],

    // ── Estado físico ─────────────────────────────────────────────────────
    'tengo-hambre':  ['comer', 'manzana', 'agua', 'pollo'],
    'tengo-sed':     ['agua', 'leche', 'jugo'],
    'me-duele':      ['mama', 'papa', 'calma'],
    'estoy-cansado': ['dormir', 'cama', 'silencio'],
    'tengo-calor':   ['agua', 'quiero', 'no-quiero'],
    'tengo-frio':    ['ropa', 'casaca', 'quiero'],
    'mi-nombre':     ['quiero', 'yo', 'mama'],

    // ── Emociones ─────────────────────────────────────────────────────────
    'calma':         ['osito', 'silencio', 'cama', 'dormir'],
    'alegria':       ['jugar', 'television', 'mama'],
    'tristeza':      ['mama', 'papa', 'osito', 'calma'],
    'enojo':         ['no-me-gusta', 'me-molesta', 'calma'],
    'miedo':         ['mama', 'papa', 'osito', 'luz'],
    'sorpresa':      ['mama', 'papa', 'jugar'],
    'asco':          ['no-me-gusta', 'no-quiero', 'agua'],

    // ── Comida / bebidas ──────────────────────────────────────────────────
    'frutas':        ['manzana', 'platano', 'fresas', 'naranja'],
    'verduras':      ['zanahoria', 'lechuga', 'tomate', 'brocoli'],
    'bebidas':       ['agua', 'leche', 'jugo'],
    'dulces':        ['paleta', 'chocolate', 'galleta'],
    'carnes':        ['pollo', 'carne', 'pescado', 'tocino'],
    'manzana':       ['platano', 'fresas', 'agua'],
    'platano':       ['manzana', 'fresas', 'naranja'],
    'fresas':        ['manzana', 'platano', 'naranja'],
    'naranja':       ['manzana', 'platano', 'agua'],
    'uvas':          ['manzana', 'platano', 'fresas'],
    'agua':          ['leche', 'jugo', 'tengo-sed'],
    'leche':         ['agua', 'jugo', 'tengo-sed'],
    'jugo':          ['agua', 'leche', 'manzana'],
    'pollo':         ['agua', 'leche', 'comer'],
    'carne':         ['agua', 'leche', 'comer'],
    'pescado':       ['agua', 'leche', 'comer'],
    'tocino':        ['agua', 'leche', 'comer'],
    'zanahoria':     ['lechuga', 'tomate', 'agua'],
    'lechuga':       ['zanahoria', 'tomate', 'brocoli'],
    'tomate':        ['zanahoria', 'lechuga', 'agua'],
    'brocoli':       ['zanahoria', 'lechuga', 'agua'],
    'paleta':        ['chocolate', 'galleta', 'agua'],
    'chocolate':     ['paleta', 'galleta', 'leche'],
    'galleta':       ['paleta', 'chocolate', 'leche'],
    'comer':         ['manzana', 'pollo', 'agua', 'leche'],

    // ── Dormir ────────────────────────────────────────────────────────────
    'osito':         ['dormir', 'calma', 'silencio'],
    'luz':           ['dormir', 'miedo', 'calma'],
    'cama':          ['dormir', 'osito', 'silencio'],
    'silencio':      ['dormir', 'calma', 'osito'],
    'dormir-accion': ['osito', 'silencio', 'cama'],

    // ── Baño ──────────────────────────────────────────────────────────────
    'inodoro':       ['papel', 'lavado'],
    'papel':         ['inodoro', 'lavado'],
    'lavado':        ['dientes', 'ducharse', 'papel'],
    'dientes':       ['lavado', 'ducharse', 'papel'],
    'ducharse':      ['lavado', 'dientes', 'ropa'],

    // ── Ropa ──────────────────────────────────────────────────────────────
    'polo':          ['pantalon', 'medias', 'zapatos'],
    'pantalon':      ['polo', 'medias', 'zapatos'],
    'zapatos':       ['medias', 'polo', 'pantalon'],
    'casaca':        ['polo', 'pantalon', 'medias'],
    'medias':        ['polo', 'pantalon', 'zapatos'],
    'calzon':        ['polo', 'pantalon', 'medias'],

    // ── Personas / quiero ─────────────────────────────────────────────────
    'mama':          ['papa', 'quiero', 'calma'],
    'papa':          ['mama', 'quiero', 'calma'],
    'television':    ['jugar', 'quiero', 'calma'],

    // ── No quiero ─────────────────────────────────────────────────────────
    'no-me-gusta':   ['no-quiero', 'me-molesta', 'no-dormir'],
    'me-molesta':    ['no-quiero', 'no-me-gusta', 'calma'],
    'no-jugar':      ['no-quiero', 'no-me-gusta'],
    'no-dormir':     ['no-quiero', 'no-me-gusta', 'television'],
    'no-hablar':     ['no-quiero', 'calma'],

    // ── Jugar ─────────────────────────────────────────────────────────────
    'formas':        ['animales', 'gestos', 'jugar'],
    'animales':      ['formas', 'gestos', 'jugar'],
    'gestos':        ['formas', 'animales', 'j-emociones'],
    'j-emociones':   ['alegria', 'tristeza', 'miedo'],
};
