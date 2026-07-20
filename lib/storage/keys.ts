/**
 * Claves centralizadas de AsyncStorage para toda la app.
 */
export const STORAGE_KEYS = {
    VOICE_PREFERENCE: 'user_voice_preference',
    PARENTAL_PIN: 'parental_pin',
    ELEVEN_CREDITS: 'eleven_credits',
    SHOW_KEYBOARD: 'show_keyboard',
    IMAGE_OVERRIDES: 'image_overrides',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    PICTOGRAM_CACHE_META: 'pictogram_cache_meta',
    OFFLINE_QUEUE: 'offline_event_queue',
    DISABLED_PICTOGRAMS: 'disabled_pictograms',
    ACTIVE_ENVIRONMENT: 'active_environment',
    CONSENT_ACCEPTED: 'consent_accepted_at',
    PREFERRED_ACTIVITIES: 'preferred_activities',
    IMPORTANT_PEOPLE: 'important_people',
    TUTORIAL_COMPLETED: 'comunitea_tutorial_completed',
    TUTORIAL_BASIC_COMPLETED: 'comunitea_tutorial_basic_completed',
    EJERCICIOS_G3: 'comunitea_ejercicios_g3',
    EJERCICIOS_G3_COMPLETADOS: 'ejercicios_g3_completados',
    EJERCICIOS_G2: 'comunitea_ejercicios_g2',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
