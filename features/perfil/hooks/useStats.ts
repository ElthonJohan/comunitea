/**
 * useStats.ts
 *
 * Registra eventos de uso en la tabla `usage_stats` de Supabase.
 * Fire-and-forget: los errores se loguean en consola pero no interrumpen la UX.
 *
 * Eventos soportados (según el CHECK de la tabla):
 *  - 'session_start'  → cuando el usuario abre la app con sesión activa.
 *  - 'pictogram_tap'  → cuando toca un pictograma final (no categoría).
 *  - 'sentence_play'  → cuando reproduce la barra de frases.
 *  - 'free_text'      → cuando usa el teclado de texto libre con ElevenLabs.
 *  - 'ai_expand'      → cuando usa la varita mágica (expandir frase con IA).
 */
import { useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useNetwork } from '../../../context/NetworkContext';
import { enqueueEvent } from '../../../lib/offlineQueue';

export type StatEvent = 'session_start' | 'pictogram_tap' | 'sentence_play' | 'free_text' | 'ai_expand';

/** Metadata opcional para enriquecer eventos de uso (RF-08.1). */
export interface StatEventMeta {
    /** ID de categoría raíz cuando el evento es pictogram_tap. */
    categoryId?: string;
    /** Número de pictogramas en la frase cuando el evento es sentence_play. */
    sentenceLength?: number;
    /** Latencia en ms de una llamada a IA (ai_expand). */
    latencyMs?: number;
    /** Intención comunicativa del pictograma (F1: RF-08.8). */
    intent?: string;
}

export function useStats() {
    const { user } = useAuth();
    const { isConnected } = useNetwork();

    const logEvent = useCallback((event: StatEvent, meta?: StatEventMeta) => {
        if (!user) return;
        const created_at = new Date().toISOString();
        const row = {
            user_id: user.id,
            event_type: event,
            created_at,
            ...(meta?.categoryId    !== undefined && { category_id:         meta.categoryId }),
            ...(meta?.sentenceLength !== undefined && { sentence_length:     meta.sentenceLength }),
            ...(meta?.latencyMs      !== undefined && { response_latency_ms: meta.latencyMs }),
        };
        if (!isConnected) {
            enqueueEvent({
                type: 'stat',
                user_id: user.id,
                event_type: event,
                created_at,
                ...(meta?.categoryId !== undefined && { category_id: meta.categoryId }),
                ...(meta?.sentenceLength !== undefined && { sentence_length: meta.sentenceLength }),
                ...(meta?.latencyMs !== undefined && { response_latency_ms: meta.latencyMs }),
            });
            return;
        }
        // Fire-and-forget: no await, no bloqueo de UI
        supabase
            .from('usage_stats')
            .insert(row)
            .then(({ error }) => {
                if (error) console.warn('[useStats] Error registrando evento:', error.message);
            });
    }, [user, isConnected]);

    /** Registra una frase completa en sentence_log para el predictor personalizado. */
    const logSentence = useCallback((pictogramIds: string[]) => {
        if (!user || pictogramIds.length === 0) return;
        const created_at = new Date().toISOString();
        if (!isConnected) {
            enqueueEvent({ type: 'sentence', user_id: user.id, pictogram_ids: pictogramIds, created_at });
            return;
        }
        supabase
            .from('sentence_log')
            .insert({ user_id: user.id, pictogram_ids: pictogramIds, created_at })
            .then(({ error }) => {
                if (error) console.warn('[useStats] Error registrando frase:', error.message);
            });
    }, [user, isConnected]);

    return { logEvent, logSentence };
}
