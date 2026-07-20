/**
 * Tests de humo — Fase 0
 * Verifican que los módulos core cargan sin errores y exportan
 * las funciones/valores esperados.
 */

// Mock de módulos nativos que no están disponibles en Jest/Node
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@react-native-community/netinfo', () => ({
    fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
    addEventListener: jest.fn(() => jest.fn()),
}));
jest.mock('react-native-url-polyfill/auto', () => {});
jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn() }));
jest.mock('expo-audio', () => ({
    createAudioPlayer: jest.fn(() => ({
        remove: jest.fn(),
        play: jest.fn(),
        pause: jest.fn(),
        addListener: jest.fn(() => ({ remove: jest.fn() })),
    })),
    setAudioModeAsync: jest.fn(),
}));
jest.mock('expo-file-system/legacy', () => ({
    documentDirectory: '/tmp/',
    cacheDirectory: '/tmp/',
    writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
    deleteAsync: jest.fn().mockResolvedValue(undefined),
    readAsStringAsync: jest.fn().mockResolvedValue(''),
    EncodingType: { Base64: 'base64' },
}));

// Variables de entorno requeridas por supabase.ts
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

describe('Smoke tests — módulos core', () => {
    it('supabase client se inicializa correctamente con variables de entorno', () => {
        const { supabase } = require('../../lib/supabase');
        expect(supabase).toBeDefined();
        expect(typeof supabase.from).toBe('function');
        expect(typeof supabase.auth).toBe('object');
    });

    it('constantes de vocabulario exportan datos válidos', () => {
        const { VOCABULARY } = require('../../constants/Vocabulary');
        expect(typeof VOCABULARY).toBe('object');
        expect(Object.keys(VOCABULARY).length).toBeGreaterThan(0);
        // Cada categoría debe tener al menos un ítem
        const firstKey = Object.keys(VOCABULARY)[0];
        const firstItem = VOCABULARY[firstKey][0];
        expect(typeof firstItem.id).toBe('string');
        expect(typeof firstItem.label).toBe('string');
    });

    it('constantes de categorías exportan datos válidos', () => {
        const { BASIC_CATEGORIES } = require('../../constants/Categories');
        expect(Array.isArray(BASIC_CATEGORIES)).toBe(true);
        expect(BASIC_CATEGORIES.length).toBeGreaterThan(0);
        const first = BASIC_CATEGORIES[0];
        expect(typeof first.id).toBe('string');
        expect(typeof first.label).toBe('string');
    });

    it('supabase.ts lanza error sin variables de entorno', () => {
        const original_url = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const original_key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

        delete process.env.EXPO_PUBLIC_SUPABASE_URL;
        delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

        // Limpiar el módulo en caché para forzar re-ejecución
        jest.resetModules();

        expect(() => {
            require('../../lib/supabase');
        }).toThrow('[ComuniTEA]');

        // Restaurar
        process.env.EXPO_PUBLIC_SUPABASE_URL = original_url;
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = original_key;
        jest.resetModules();
    });
});
