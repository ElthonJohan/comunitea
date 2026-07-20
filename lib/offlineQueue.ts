/**
 * offlineQueue.ts
 *
 * Cola persistente (AsyncStorage) para eventos de telemetría que no pudieron
 * enviarse a Supabase por falta de conexión.
 *
 * Uso:
 *   - enqueueEvent(event)  → guarda en cola local
 *   - flushQueue()         → intenta enviar todo; limpia la cola solo si tiene éxito
 *
 * flushQueue() es llamado automáticamente por NetworkContext cuando se restaura
 * la conexión. También puede llamarse manualmente.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const QUEUE_KEY = 'offline_event_queue';

export type QueuedEvent =
    | {
          type: 'stat';
          user_id: string;
          event_type: string;
          created_at: string;
          category_id?: string;
          sentence_length?: number;
          response_latency_ms?: number;
      }
    | { type: 'sentence'; user_id: string; pictogram_ids: string[]; created_at: string };

/** Añade un evento a la cola persistente de AsyncStorage. */
export async function enqueueEvent(event: QueuedEvent): Promise<void> {
    try {
        const raw = await AsyncStorage.getItem(QUEUE_KEY);
        const queue: QueuedEvent[] = raw ? JSON.parse(raw) : [];
        queue.push(event);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.warn('[OfflineQueue] Error encolando evento:', e);
    }
}

/** Envía todos los eventos pendientes a Supabase en un batch. Solo limpia la cola si tiene éxito total. */
export async function flushQueue(): Promise<void> {
    try {
        const raw = await AsyncStorage.getItem(QUEUE_KEY);
        if (!raw) return;
        const queue: QueuedEvent[] = JSON.parse(raw);
        if (queue.length === 0) return;

        const stats = queue
            .filter((e): e is Extract<QueuedEvent, { type: 'stat' }> => e.type === 'stat')
            .map(({ user_id, event_type, created_at, category_id, sentence_length, response_latency_ms }) => ({
                user_id,
                event_type,
                created_at,
                ...(category_id !== undefined && { category_id }),
                ...(sentence_length !== undefined && { sentence_length }),
                ...(response_latency_ms !== undefined && { response_latency_ms }),
            }));

        const sentences = queue
            .filter((e): e is Extract<QueuedEvent, { type: 'sentence' }> => e.type === 'sentence')
            .map(({ user_id, pictogram_ids, created_at }) => ({ user_id, pictogram_ids, created_at }));

        const results = await Promise.allSettled([
            stats.length > 0
                ? supabase.from('usage_stats').insert(stats).then(({ error }) => { if (error) throw error; })
                : Promise.resolve(),
            sentences.length > 0
                ? supabase.from('sentence_log').insert(sentences).then(({ error }) => { if (error) throw error; })
                : Promise.resolve(),
        ]);

        if (results.every(r => r.status === 'fulfilled')) {
            await AsyncStorage.removeItem(QUEUE_KEY);
            console.log(`[OfflineQueue] ${queue.length} eventos sincronizados.`);
        }
    } catch (e) {
        console.warn('[OfflineQueue] Error sincronizando cola:', e);
    }
}
