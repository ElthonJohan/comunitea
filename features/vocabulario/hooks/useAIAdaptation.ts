/**
 * useAIAdaptation.ts
 *
 * Phase 8 — AI Engine (client-side).
 *
 * Responsabilidades:
 *  - Calcular frecuencia de uso de cada pictograma desde sentence_log (últimos 30 días).
 *  - Exponer getOrderedItems() para reordenar ítems de una categoría por frecuencia (RF-08.2).
 *  - Detectar patrones (longitud de frase, categorías sin uso) y guardar ai_insights (RF-08.4, RF-08.5).
 *  - Cargar insights no vistos para mostrar en reportes (RF-08.9).
 *  - markSeen() para archivar un insight.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { VocabularyItem } from '../data/Vocabulary';

// ── Tipos públicos ────────────────────────────────────────────────────────────

export type InsightType =
    | 'unused_category'
    | 'sentence_length_trend'
    | 'sublevel_ready'
    | 'vocabulary_suggestion'
    | 'general';

export interface AIInsight {
    id: string;
    insight_type: InsightType;
    message: string;
    seen: boolean;
    created_at: string;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const DAYS_WINDOW = 30;
const DAYS_UNUSED = 14;
const MIN_SENTENCES_FOR_ANALYSIS = 15;
const AVG_LENGTH_THRESHOLD = 2.8;   // si promedio ≥ esto → sugerir vocabulario más amplio
const MAX_SENTENCE_LOG_ROWS = 1000;

function formatInsightLabel(id: string) {
    return id
        .replace(/-/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAIAdaptation() {
    const { user } = useAuth();
    const [pictogramFrequency, setPictogramFrequency] = useState<Record<string, number>>({});
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        (async () => {
            const loadInsights = async () => {
                const { data: insightRows } = await supabase
                    .from('ai_insights')
                    .select('id, insight_type, payload, seen, created_at')
                    .eq('user_id', user.id)
                    .gte('expires_at', new Date().toISOString())
                    .order('seen', { ascending: true })
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (!cancelled) {
                    setInsights(
                        (insightRows ?? []).map((r) => ({
                            id: r.id,
                            insight_type: r.insight_type as InsightType,
                            message: (r.payload as { message?: string })?.message ?? '',
                            seen: r.seen,
                            created_at: r.created_at,
                        }))
                    );
                    setLoaded(true);
                }
            };

            const cutoff30 = new Date(Date.now() - DAYS_WINDOW * 24 * 3600 * 1000).toISOString();
            const cutoff14 = new Date(Date.now() - DAYS_UNUSED * 24 * 3600 * 1000).toISOString();

            const { data: rows } = await supabase
                .from('sentence_log')
                .select('pictogram_ids, created_at')
                .eq('user_id', user.id)
                .gte('created_at', cutoff30)
                .order('created_at', { ascending: false })
                .limit(MAX_SENTENCE_LOG_ROWS);

            if (cancelled) return;
            if (!rows || rows.length === 0) {
                await loadInsights();
                return;
            }

            // ── Frecuencia global ─────────────────────────────────────────────
            const freq: Record<string, number> = {};
            const recentIds = new Set<string>(); // usados en los últimos 14 días
            const pairFreq: Record<string, number> = {};
            let totalLength = 0;

            for (const row of rows) {
                const ids: string[] = row.pictogram_ids ?? [];
                totalLength += ids.length;
                const isRecent = row.created_at >= cutoff14;
                for (const id of ids) {
                    freq[id] = (freq[id] ?? 0) + 1;
                    if (isRecent) recentIds.add(id);
                }
                for (let index = 0; index < ids.length - 1; index += 1) {
                    const key = `${ids[index]}=>${ids[index + 1]}`;
                    pairFreq[key] = (pairFreq[key] ?? 0) + 1;
                }
            }

            if (!cancelled) setPictogramFrequency(freq);

            // ── Análisis de patrones  ────────────────────────────────────────
            if (rows.length >= MIN_SENTENCES_FOR_ANALYSIS) {
                const avgLength = totalLength / rows.length;

                // RF-08.5: Longitud de frase consistentemente alta
                if (avgLength >= AVG_LENGTH_THRESHOLD) {
                    await supabase.rpc('upsert_ai_insight', {
                        p_user_id: user.id,
                        p_type: 'sentence_length_trend',
                        p_payload: {
                            message: `Tu niño construye frases de ${avgLength.toFixed(1)} pictogramas en promedio. Podría estar listo para un vocabulario más amplio o frases más complejas.`,
                            avg_length: avgLength,
                            sentence_count: rows.length,
                        },
                    });
                }

                // RF-08.4: Categorías sin uso en últimos 14 días
                // Detectamos categorías "raíz" (comida, bano, dormir…) sin pictogramas recientes
                const ALL_ROOT_CATEGORIES: { id: string; label: string; sampleIds: string[] }[] = [
                    { id: 'comida',    label: 'Comida',    sampleIds: ['agua', 'leche', 'jugo', 'manzana', 'pollo', 'comer', 'desayuno', 'almuerzo'] },
                    { id: 'bano',      label: 'Baño',      sampleIds: ['bano', 'inodoro', 'lavado', 'dientes', 'papel'] },
                    { id: 'dormir',    label: 'Dormir',    sampleIds: ['dormir', 'cama', 'osito', 'silencio', 'luz'] },
                    { id: 'jugar',     label: 'Jugar',     sampleIds: ['jugar', 'formas', 'animales', 'television'] },
                    { id: 'emociones', label: 'Emociones', sampleIds: ['alegria', 'tristeza', 'calma', 'miedo', 'enojo', 'feliz', 'triste'] },
                    { id: 'ropa',      label: 'Ropa',      sampleIds: ['polo', 'pantalon', 'zapatos', 'casaca'] },
                ];

                for (const cat of ALL_ROOT_CATEGORIES) {
                    const hasRecentUse = cat.sampleIds.some(id => recentIds.has(id));
                    if (!hasRecentUse) {
                        await supabase.rpc('upsert_ai_insight', {
                            p_user_id: user.id,
                            p_type: 'unused_category',
                            p_payload: {
                                message: `La categoría "${cat.label}" no se ha usado en los últimos ${DAYS_UNUSED} días. Podrías practicarla en una actividad guiada.`,
                                category_id: cat.id,
                                category_label: cat.label,
                            },
                        });
                    }
                }

                const bestPair = Object.entries(pairFreq)
                    .sort((left, right) => right[1] - left[1])[0];

                if (bestPair && bestPair[1] >= 3) {
                    const [fromId, toId] = bestPair[0].split('=>');
                    await supabase.rpc('upsert_ai_insight', {
                        p_user_id: user.id,
                        p_type: 'vocabulary_suggestion',
                        p_payload: {
                            message: `Después de "${formatInsightLabel(fromId)}" suele aparecer "${formatInsightLabel(toId)}". Conviene destacarlo en actividades o en el vocabulario activo.`,
                            source_id: fromId,
                            suggested_id: toId,
                            count: bestPair[1],
                        },
                    });
                }
            }

            await loadInsights();
        })();

        return () => { cancelled = true; };
    }, [user]);

    /**
     * Reordena los ítems de una categoría por frecuencia de uso.
     * Los más usados aparecen primero. Los no usados mantienen su orden relativo original.
     * Las categorías-padre (con sub-ítems) no se reordenan para preservar la estructura visual.
     * E2 (RNF-02.2): aplica boost temporal según hora del día.
     */
    const getOrderedItems = useCallback(
        (items: VocabularyItem[]): VocabularyItem[] => {
            // Si no hay datos de frecuencia aún, devuelve el orden original.
            if (Object.keys(pictogramFrequency).length === 0) return items;

            // E2: boost por hora del día
            const hour = new Date().getHours();
            let timeBoostIds: string[];
            if (hour >= 6 && hour < 10) {
                // Mañana: higiene, desayuno, escuela
                timeBoostIds = ['dientes', 'bano', 'ducha', 'desayuno', 'leche', 'tostada', 'mochila', 'escuela'];
            } else if (hour >= 10 && hour < 14) {
                // Mediodía: almuerzo, actividades escolares
                timeBoostIds = ['almuerzo', 'comer', 'agua', 'clase', 'libro', 'jugar'];
            } else if (hour >= 14 && hour < 19) {
                // Tarde: merienda, juego, actividades
                timeBoostIds = ['merienda', 'jugar', 'pelota', 'musica', 'television', 'parque'];
            } else if (hour >= 19 && hour < 22) {
                // Noche: cena, baño, cuento
                timeBoostIds = ['cena', 'bano', 'pijama', 'cuento', 'dormir'];
            } else {
                // Madrugada: dormir
                timeBoostIds = ['dormir', 'silencio', 'osito'];
            }
            const timeBoostSet = new Set(timeBoostIds);

            // Solo reordenar ítems hoja (sin sub-ítems). Las sub-categorías quedan fijas.
            const leaves = items.filter(it => !it.items || it.items.length === 0);
            const branches = items.filter(it => it.items && it.items.length > 0);

            const sortedLeaves = [...leaves].sort((a, b) => {
                // E2: time boost adds +3 to effective frequency
                const fa = (pictogramFrequency[a.id] ?? 0) + (timeBoostSet.has(a.id) ? 3 : 0);
                const fb = (pictogramFrequency[b.id] ?? 0) + (timeBoostSet.has(b.id) ? 3 : 0);
                return fb - fa; // mayor frecuencia + boost primero
            });

            // Branches primero (navegación), luego hojas ordenadas
            return [...branches, ...sortedLeaves];
        },
        [pictogramFrequency]
    );

    /** Marca un insight como visto (local + DB). */
    const markSeen = useCallback(async (id: string) => {
        setInsights(prev => prev.filter(i => i.id !== id));
        await supabase.from('ai_insights').update({ seen: true }).eq('id', id);
    }, []);

    return { getOrderedItems, insights, markSeen, loaded, pictogramFrequency };
}
