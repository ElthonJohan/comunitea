/**
 * Frases en español para TTS de pictogramas (id de vocabulario → texto ElevenLabs).
 * Usado por generate-elevenlabs-pictogram-audio.mjs
 */

const CORE_REST = {
    yo: 'Yo',
    quiero: 'Quiero',
    no: 'No',
    'me-gustaria': 'Me gustaría',
    necesito: 'Necesito',
    'no-me-gusta': 'No me gusta',
    hola: 'Hola',
    gracias: 'Gracias',
};

const TOKEN = {
    banarse: 'Bañarse',
    manana: 'Mañana',
    despues: 'Después',
    miercoles: 'Miércoles',
    pina: 'Piña',
    platano: 'Plátano',
    sandia: 'Sandía',
    limon: 'Limón',
    brocoli: 'Brócoli',
    muneca: 'Muñeca',
    television: 'Televisión',
    lapiz: 'Lápiz',
    medico: 'Médico',
    alegria: 'Alegría',
};

const FULL = {
    bano: 'Baño',
    quiero: 'Sí quiero',
    'no-quiero': 'No quiero',
    'mi-nombre': 'Mi nombre es...',
    'tengo-calor': 'Tengo calor',
    'tengo-frio': 'Tengo frío',
    'tengo-hambre': 'Tengo hambre',
    'tengo-sed': 'Tengo sed',
    'estoy-cansado': 'Estoy cansado',
    'me-duele': 'Me duele',
    'me-llamo': 'Me llamo',
    'yo-soy': 'Yo soy',
    'mi-cumple': 'Mi cumpleaños',
    'tengo-x-anos': 'Tengo X años',
    inodoro: 'Baño',
    'dormir-accion': 'Dormir',
    'j-emociones': 'Emociones',
    comer: 'Quiero comer',
    papa: 'Papá',
    mama: 'Mamá',
    'papa-vegetal': 'Papa',
    'no-me-gusta': 'No me gusta',
    'no-jugar': 'No quiero jugar',
    'no-dormir': 'No quiero dormir',
    'no-hablar': 'No quiero hablar',
    'me-molesta': 'Me molesta',
    pantalon: 'Pantalón',
    calzon: 'Ropa interior',
    'por-favor': 'Por favor',
    si: 'Sí',
    no: 'No',
    profe: 'Profe',
    nico: 'Nico',
    'me-gusta': 'Me gusta',
    'quiero-ir': 'Quiero ir',
    'quiero-comer': 'Quiero comer',
    'quiero-jugar': 'Quiero jugar',
    'quiero-ver': 'Quiero ver',
    'me-gusta-esto': 'Me gusta esto',
    'es-divertido': 'Es divertido',
    'es-rico': 'Es rico',
    'no-me-gusta-esto': 'No me gusta esto',
    'es-aburrido': 'Es aburrido',
    'sabe-feo': 'Sabe feo',
    'como-estas': '¿Cómo estás?',
    'fin-semana': 'Fin de semana',
    'que-haces': '¿Qué haces?',
    'donde-vas': '¿Dónde vas?',
    'quien-es': '¿Quién es?',
    'necesito-ayuda': 'Necesito ayuda',
    colegio: 'Ir al colegio',
    'llegar-casa': 'Llegar a casa',
    'cepillar-dientes': 'Cepillar dientes',
    'lavar-cara': 'Lavar cara',
    'lavar-manos': 'Lavar manos',
    lavado: 'Lavar manos',
    banarse: 'Bañarse',
};

function capitalize(word) {
    if (!word) return '';
    const lower = word.toLowerCase();
    return TOKEN[lower] ?? lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * @param {string} id
 * @returns {string}
 */
export function phraseForId(id) {
    if (FULL[id]) return FULL[id];
    if (id.startsWith('core-')) {
        const rest = id.slice(5);
        if (CORE_REST[rest]) return CORE_REST[rest];
    }
    const parts = id.split('-').map((p) => capitalize(p));
    return parts.join(' ');
}
