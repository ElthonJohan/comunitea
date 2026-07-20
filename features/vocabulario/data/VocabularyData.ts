
import { VocabularyItem } from './Vocabulary';

export const INTERMEDIATE_DATA: VocabularyItem[] = [
    {
        id: 'yo', label: 'YO', emoji: '🧑', items: [
            { id: 'me-llamo', label: 'ME LLAMO', emoji: '🏷️' },
            { id: 'yo-soy', label: 'YO SOY', emoji: '😊' },
            { id: 'mi-cumple', label: 'MI CUMPLEAÑOS', emoji: '🎂' },
            { id: 'tengo-x-anos', label: 'TENGO ... AÑOS', emoji: '🔢' },
        ]
    },
    {
        id: 'comida', label: 'COMIDA', emoji: '🍎', items: [
            { id: 'desayuno', label: 'DESAYUNO', emoji: '🥞' },
            { id: 'almuerzo', label: 'ALMUERZO', emoji: '🍲' },
            { id: 'cena', label: 'CENA', emoji: '🥗' },
            { id: 'snack', label: 'MERIENDA', emoji: '🍪' },
            {
                id: 'frutas', label: 'FRUTAS', emoji: '🍇', items: [
                    { id: 'manzana', label: 'MANZANA', emoji: '🍎' },
                    { id: 'platano', label: 'PLÁTANO', emoji: '🍌' },
                    { id: 'naranja', label: 'NARANJA', emoji: '🍊' },
                    { id: 'uvas', label: 'UVAS', emoji: '🍇' },
                    { id: 'fresas', label: 'FRESAS', emoji: '🍓' },
                    { id: 'mandarina', label: 'MANDARINA', emoji: '🍊' },
                    { id: 'pera', label: 'PERA', emoji: '🍐' },
                    { id: 'sandia', label: 'SANDÍA', emoji: '🍉' },
                    { id: 'mango', label: 'MANGO', emoji: '🥭' },
                    { id: 'durazno', label: 'DURAZNO', emoji: '🍑' },
                    { id: 'pina', label: 'PIÑA', emoji: '🍍' },
                    { id: 'limon', label: 'LIMÓN', emoji: '🍋' },
                ]
            },
            {
                id: 'verduras', label: 'VERDURAS', emoji: '🥕', items: [
                    { id: 'zanahoria', label: 'ZANAHORIA', emoji: '🥕' },
                    { id: 'lechuga', label: 'LECHUGA', emoji: '🥬' },
                    { id: 'tomate', label: 'TOMATE', emoji: '🍅' },
                    { id: 'brocoli', label: 'BRÓCOLI', emoji: '🥦' },
                    { id: 'pepino', label: 'PEPINO', emoji: '🥒' },
                    { id: 'palta', label: 'PALTA', emoji: '🥑' },
                    { id: 'espinaca', label: 'ESPINACA', emoji: '🥬' },
                    { id: 'cebolla', label: 'CEBOLLA', emoji: '🧅' },
                    { id: 'papa', label: 'PAPA', emoji: '🥔' },
                    { id: 'yuca', label: 'YUCA', emoji: '🌿' },
                    { id: 'camote', label: 'CAMOTE', emoji: '🍠' },
                    { id: 'choclo', label: 'CHOCLO', emoji: '🌽' },
                ]
            },
            {
                id: 'bebidas', label: 'BEBIDAS', emoji: '🥤', items: [
                    { id: 'agua', label: 'AGUA', emoji: '💧' },
                    { id: 'jugo', label: 'JUGO', emoji: '🧃' },
                    { id: 'leche', label: 'LECHE', emoji: '🥛' },
                    { id: 'chocolatada', label: 'CHOCOLATADA', emoji: '🍫' },
                    { id: 'gaseosa', label: 'GASEOSA', emoji: '🫙' },
                    { id: 'limonada', label: 'LIMONADA', emoji: '🍋' },
                ]
            },
            {
                id: 'lacteos', label: 'LÁCTEOS', emoji: '🧀', items: [
                    { id: 'queso', label: 'QUESO', emoji: '🧀' },
                    { id: 'yogurt', label: 'YOGURT', emoji: '🫙' },
                    { id: 'mantequilla', label: 'MANTEQUILLA', emoji: '🧈' },
                    { id: 'manjar', label: 'MANJAR', emoji: '🥄' },
                ]
            },
        ]
    },
    {
        id: 'emociones', label: 'EMOCIONES', emoji: '😊', items: [
            { id: 'feliz', label: 'FELIZ', emoji: '😄' },
            { id: 'triste', label: 'TRISTE', emoji: '😢' },
            { id: 'enojado', label: 'ENOJADO', emoji: '😠' },
            { id: 'asustado', label: 'ASUSTADO', emoji: '😨' },
            { id: 'cansado', label: 'CANSADO', emoji: '😴' },
            { id: 'aburrido', label: 'ABURRIDO', emoji: '😐' },
            { id: 'confundido', label: 'CONFUNDIDO', emoji: '😕' },
        ]
    },
    {
        id: 'personas', label: 'PERSONAS', emoji: '👨‍👩‍👧‍👦', items: [
            { id: 'mama', label: 'MAMÁ', emoji: '👩' },
            { id: 'papa', label: 'PAPÁ', emoji: '👨' },
            { id: 'hermano', label: 'HERMANO', emoji: '👦' },
            { id: 'hermana', label: 'HERMANA', emoji: '👧' },
            { id: 'abuela', label: 'ABUELA', emoji: '👵' },
            { id: 'abuelo', label: 'ABUELO', emoji: '👴' },
            { id: 'maestra', label: 'MAESTRA', emoji: '👩‍🏫' },
            { id: 'amigo', label: 'AMIGO', emoji: '🧒' },
        ]
    },
    {
        id: 'numeros', label: 'NÚMEROS', emoji: '🔢', items: [
            { id: '1', label: 'UNO', emoji: '1️⃣' },
            { id: '2', label: 'DOS', emoji: '2️⃣' },
            { id: '3', label: 'TRES', emoji: '3️⃣' },
            { id: '4', label: 'CUATRO', emoji: '4️⃣' },
            { id: '5', label: 'CINCO', emoji: '5️⃣' },
            { id: '6', label: 'SEIS', emoji: '6️⃣' },
            { id: '7', label: 'SIETE', emoji: '7️⃣' },
            { id: '8', label: 'OCHO', emoji: '8️⃣' },
            { id: '9', label: 'NUEVE', emoji: '9️⃣' },
            { id: '10', label: 'DIEZ', emoji: '🔟' },
        ]
    },
    {
        id: 'colores', label: 'COLORES', emoji: '🎨', items: [
            { id: 'rojo', label: 'ROJO', emoji: '🔴' },
            { id: 'azul', label: 'AZUL', emoji: '🔵' },
            { id: 'verde', label: 'VERDE', emoji: '🟢' },
            { id: 'amarillo', label: 'AMARILLO', emoji: '🟡' },
            { id: 'negro', label: 'NEGRO', emoji: '⚫' },
            { id: 'blanco', label: 'BLANCO', emoji: '⚪' },
        ]
    },
    {
        id: 'quiero-decir', label: 'QUIERO DECIR', emoji: '💬', items: [
            { id: 'hola', label: 'HOLA', emoji: '👋' },
            { id: 'adios', label: 'ADIÓS', emoji: '👋' },
            { id: 'gracias', label: 'GRACIAS', emoji: '🙏' },
            { id: 'por-favor', label: 'POR FAVOR', emoji: '🥺' },
            { id: 'si', label: 'SÍ', emoji: '👍' },
            { id: 'no', label: 'NO', emoji: '👎' },
        ]
    },
    {
        id: 'abcedario', label: 'ABCDARIO', emoji: '🔤', items: [
            { id: 'a', label: 'A', emoji: '🅰️' },
            { id: 'b', label: 'B', emoji: '🅱️' },
            { id: 'c', label: 'C', emoji: '©️' },
            // Placeholder for full alphabet
        ]
    },
    {
        id: 'hora', label: 'HORA', emoji: '🕐', items: [
            { id: 'manana', label: 'MAÑANA', emoji: '🌅' },
            { id: 'tarde', label: 'TARDE', emoji: '☀️' },
            { id: 'noche', label: 'NOCHE', emoji: '🌙' },
            { id: 'ahora', label: 'AHORA', emoji: '👇' },
            { id: 'despues', label: 'DESPUÉS', emoji: '➡️' },
        ]
    },
    {
        id: 'lugar', label: 'LUGAR', emoji: '📍', items: [
            { id: 'casa', label: 'CASA', emoji: '🏠' },
            { id: 'escuela', label: 'ESCUELA', emoji: '🏫' },
            { id: 'parque', label: 'PARQUE', emoji: '🏞️' },
            { id: 'tienda', label: 'TIENDA', emoji: '🏪' },
            { id: 'medico', label: 'MÉDICO', emoji: '🏥' },
        ]
    },
    {
        id: 'higiene', label: 'HIGIENE', emoji: '🧼', items: [
            { id: 'lavar-manos', label: 'LAVAR MANOS', emoji: '🤲' },
            { id: 'cepillar-dientes', label: 'CEPILLAR DIENTES', emoji: '🪥' },
            { id: 'bañarse', label: 'BAÑARSE', emoji: '🚿' },
            { id: 'lavar-cara', label: 'LAVAR CARA', emoji: '🚿' },
            { id: 'peinarse', label: 'PEINARSE', emoji: '💇' },
        ]
    },
    {
        id: 'juguetes', label: 'JUGUETES', emoji: '🧸', items: [
            { id: 'pelota', label: 'PELOTA', emoji: '⚽' },
            { id: 'osito', label: 'OSITO', emoji: '🧸' },
            { id: 'carro', label: 'CARRO', emoji: '🚗' },
            { id: 'legos', label: 'LEGOS', emoji: '🧱' },
            { id: 'dinosaurio', label: 'DINOSAURIO', emoji: '🦖' },
            { id: 'muneca', label: 'MUÑECA', emoji: '🪆' },
            { id: 'tren', label: 'TREN', emoji: '🚂' },
            { id: 'plastilina', label: 'PLASTILINA', emoji: '🪣' },
        ]
    },
    {
        id: 'mi-dia', label: 'MI DÍA', emoji: '🌅', items: [
            { id: 'levantarse', label: 'LEVANTARSE', emoji: '🌅' },
            { id: 'cepillar-dientes', label: 'CEPILLAR DIENTES', emoji: '🪥' },
            { id: 'bañarse', label: 'BAÑARSE', emoji: '🚿' },
            { id: 'lavar-cara', label: 'LAVAR CARA', emoji: '💧' },
            { id: 'vestirse', label: 'VESTIRSE', emoji: '👕' },
            { id: 'desayunar', label: 'DESAYUNAR', emoji: '🥞' },
            { id: 'colegio', label: 'IR AL COLEGIO', emoji: '🏫' },
            { id: 'llegar-casa', label: 'LLEGAR A CASA', emoji: '🏠' },
            { id: 'pijama', label: 'PONERSE PIJAMA', emoji: '🩳' },
            { id: 'dormir', label: 'DORMIR', emoji: '💤' },
        ]
    }
];

export const ADVANCED_DATA: VocabularyItem[] = [
    {
        id: 'yo-quiero', label: 'YO QUIERO', emoji: '✋', items: [
            { id: 'quiero-ir', label: 'QUIERO IR A...', emoji: '🚶' },
            { id: 'quiero-comer', label: 'QUIERO COMER...', emoji: '🍽️' },
            { id: 'quiero-jugar', label: 'QUIERO JUGAR A...', emoji: '🎮' },
            { id: 'quiero-ver', label: 'QUIERO VER...', emoji: '👀' },
        ]
    },
    {
        id: 'me-gusta', label: 'ME GUSTA', emoji: '👍', items: [
            { id: 'me-gusta-esto', label: 'ME GUSTA ESTO', emoji: '👍' },
            { id: 'es-divertido', label: 'ES DIVERTIDO', emoji: '😄' },
            { id: 'es-rico', label: 'ES RICO', emoji: '😋' },
        ]
    },
    {
        id: 'no-me-gusta', label: 'NO ME GUSTA', emoji: '👎', items: [
            { id: 'no-me-gusta-esto', label: 'NO ME GUSTA ESTO', emoji: '👎' },
            { id: 'es-aburrido', label: 'ES ABURRIDO', emoji: '🥱' },
            { id: 'sabe-feo', label: 'SABE FEO', emoji: '🤢' },
        ]
    },
    {
        id: 'podemos-hablar', label: '¿PODEMOS HABLAR?', emoji: '💬', items: [
            { id: 'preguntar', label: 'QUIERO PREGUNTAR', emoji: '❓' },
            { id: 'contar', label: 'QUIERO CONTARTE ALGO', emoji: '🗣️' },
            { id: 'como-estas', label: '¿CÓMO ESTÁS?', emoji: '👋' },
        ]
    },
    // Adding content to existing categories from intermediate/basic but with advanced nuance if needed
    { id: 'personas', label: 'PERSONAS', emoji: '👥', items: INTERMEDIATE_DATA.find(c => c.id === 'personas')?.items },
    { id: 'lugar', label: 'LUGAR', emoji: '📍', items: INTERMEDIATE_DATA.find(c => c.id === 'lugar')?.items },
    { id: 'comida', label: 'COMIDA', emoji: '🍎', items: INTERMEDIATE_DATA.find(c => c.id === 'comida')?.items },
    {
        id: 'escuela', label: 'ESCUELA', emoji: '🏫', items: [
            { id: 'clase', label: 'CLASE', emoji: '📚' },
            { id: 'recreo', label: 'RECREO', emoji: '⚽' },
            { id: 'tarea', label: 'TAREA', emoji: '📝' },
            { id: 'lapiz', label: 'LAPIZ', emoji: '✏️' },
        ]
    },
    {
        id: 'agenda', label: 'AGENDA', emoji: '📅', items: [
            { id: 'lunes', label: 'LUNES', emoji: '1️⃣' },
            { id: 'martes', label: 'MARTES', emoji: '2️⃣' },
            { id: 'miercoles', label: 'MIÉRCOLES', emoji: '3️⃣' },
            { id: 'jueves', label: 'JUEVES', emoji: '4️⃣' },
            { id: 'viernes', label: 'VIERNES', emoji: '5️⃣' },
            { id: 'fin-semana', label: 'FIN DE SEMANA', emoji: '🎉' },
        ]
    },
    {
        id: 'conversaciones', label: 'CONVERSACIONES', emoji: '🗣️', items: [
            { id: 'que-haces', label: '¿QUÉ HACES?', emoji: '❓' },
            { id: 'donde-vas', label: '¿DÓNDE VAS?', emoji: '👣' },
            { id: 'quien-es', label: '¿QUIÉN ES?', emoji: '👤' },
        ]
    },
    {
        id: 'necesito-ayuda', label: 'NECESITO AYUDA', emoji: '🆘', backgroundColor: '#EF5350', items: [
            { id: 'dolor', label: 'TENGO DOLOR', emoji: '🤕' },
            { id: 'perdido', label: 'ESTOY PERDIDO', emoji: '🗺️' },
            { id: 'miedo', label: 'TENGO MIEDO', emoji: '😨' },
        ]
    },
    {
        id: 'verbos', label: 'VERBOS', emoji: '🏃', items: [
            { id: 'ir', label: 'IR', emoji: '🚶' },
            { id: 'venir', label: 'VENIR', emoji: '🏃' },
            { id: 'dar', label: 'DAR', emoji: '🤲' },
            { id: 'tomar', label: 'TOMAR', emoji: '✊' },
            { id: 'ver', label: 'VER', emoji: '👀' },
            { id: 'escuchar', label: 'ESCUCHAR', emoji: '👂' },
        ]
    }
];
