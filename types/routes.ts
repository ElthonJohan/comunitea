import type { Href } from 'expo-router';

/**
 * Rutas de Expo Router como constantes (evita typos; usar con router.push/replace).
 */
export const ROUTES = {
    index: '/',
    login: '/login',
    voiceSelection: '/voice-selection',
    onboarding: '/onboarding',
    tutorial: '/tutorial',
    tutorialBasic: '/tutorial/basic',
    settings: '/settings',
    categorias: '/(tabs)/categorias',
    tablero: '/(tabs)/tablero',
    ejerciciosTab: '/(tabs)/ejercicios',
    perfil: '/(tabs)/perfil',
    ejerciciosGrupo2: '/ejercicios/grupo2',
    ejerciciosGrupo3: '/ejercicios/grupo3',
    sentences: '/sentences',
    report: '/report',
    vocabularyManager: '/vocabulary-manager',
    activityEditor: '/activity-editor',
    activityRun: '/activity-run',
    game: '/game',
    teamManager: '/team-manager',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type AppRoute = (typeof ROUTES)[RouteKey];

/** Rutas con segmentos dinámicos (tipado con Href de Expo Router). */
export function hrefEjercicioMock(id: string): Href {
    return `/ejercicios/${id}`;
}

export function hrefG2Nivel(n: number): Href {
    return `/ejercicios/grupo2/nivel/${n}`;
}

export function hrefG2Ejercicio(nivel: number, ej: number): Href {
    return `/ejercicios/grupo2/nivel/${nivel}/ejercicio/${ej}`;
}

export function hrefG3Nivel(n: number): Href {
    return `/ejercicios/grupo3/nivel/${n}`;
}

export function hrefG3Ejercicio(nivel: number, ej: number): Href {
    return `/ejercicios/grupo3/nivel/${nivel}/ejercicio/${ej}`;
}

export function hrefActivityRun(id: string): Href {
    return { pathname: '/activity-run', params: { id } };
}

/** Inicio del flujo tablero (rejilla de categorías). Cast por si los typed routes de Expo aún no incluyen la ruta. */
export function hrefCategorias(): Href {
    return '/(tabs)/categorias' as Href;
}
