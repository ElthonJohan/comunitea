/**
 * usePictogramHistory.ts
 *
 * Fase 4: Predictor personalizado basado en el historial de frases del niño.
 * Incluye patrones por turno (mañana/tarde/noche) para adaptar sugerencias.
 *
 * 1. Carga las últimas 500 frases desde `sentence_log` (con created_at).
 * 2. Construye mapa de co-ocurrencias global y por turno.
 * 3. getSuggestions prioriza co-ocurrencias del turno actual si hay suficientes datos.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { COOCCURRENCES } from '../../../constants/Cooccurrences';

/** Mínimo de frases para activar el modo personalizado */
const MIN_SENTENCES = 20;
/** Mínimo de frases en el turno actual para usar patrón por turno */
const MIN_SENTENCES_PER_TURN = 5;

export type Turn = 'morning' | 'afternoon' | 'evening';

function getCurrentTurn(): Turn {
    const h = new Date().getHours();
    if (h >= 6 && h < 12) return 'morning';
    if (h >= 12 && h < 18) return 'afternoon';
    return 'evening';
}

function getTurnFromDate(isoDate: string): Turn {
    const h = new Date(isoDate).getHours();
    if (h >= 6 && h < 12) return 'morning';
    if (h >= 12 && h < 18) return 'afternoon';
    return 'evening';
}

export function usePictogramHistory() {
    const { user } = useAuth();
    const [coMap, setCoMap] = useState<Record<string, Record<string, number>>>({});
    const [coMapByTurn, setCoMapByTurn] = useState<Record<Turn, Record<string, Record<string, number>>>>({
        morning: {},
        afternoon: {},
        evening: {},
    });
    const [sentenceCountByTurn, setSentenceCountByTurn] = useState<Record<Turn, number>>({
        morning: 0,
        afternoon: 0,
        evening: 0,
    });
    const [sentenceCount, setSentenceCount] = useState(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        (async () => {
            const { data, error } = await supabase
                .from('sentence_log')
                .select('pictogram_ids, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(500);

            if (cancelled) return;
            if (error) {
                console.warn('[usePictogramHistory] Error cargando historial:', error.message);
                setLoaded(true);
                return;
            }

            const rows = data ?? [];
            setSentenceCount(rows.length);

            const map: Record<string, Record<string, number>> = {};
            const byTurn: Record<Turn, Record<string, Record<string, number>>> = {
                morning: {},
                afternoon: {},
                evening: {},
            };
            const countByTurn: Record<Turn, number> = { morning: 0, afternoon: 0, evening: 0 };

            for (const row of rows) {
                const ids: string[] = row.pictogram_ids ?? [];
                const turn = row.created_at ? getTurnFromDate(row.created_at) : 'evening';
                countByTurn[turn]++;

                for (let i = 0; i < ids.length - 1; i++) {
                    const a = ids[i];
                    const b = ids[i + 1];
                    if (!map[a]) map[a] = {};
                    map[a][b] = (map[a][b] ?? 0) + 1;

                    if (!byTurn[turn][a]) byTurn[turn][a] = {};
                    byTurn[turn][a][b] = (byTurn[turn][a][b] ?? 0) + 1;
                }
            }

            setCoMap(map);
            setCoMapByTurn(byTurn);
            setSentenceCountByTurn(countByTurn);
            setLoaded(true);
        })();

        return () => { cancelled = true; };
    }, [user]);

    const getSuggestions = useCallback(
        (lastId: string, existingIds: Set<string>, limit = 3): string[] => {
            const currentTurn = getCurrentTurn();
            const turnCount = sentenceCountByTurn[currentTurn];
            const useTurnMap = turnCount >= MIN_SENTENCES_PER_TURN && coMapByTurn[currentTurn][lastId];

            if (sentenceCount >= MIN_SENTENCES) {
                const source = useTurnMap ? coMapByTurn[currentTurn][lastId] : coMap[lastId];
                if (source) {
                    return Object.entries(source)
                        .sort(([, a], [, b]) => b - a)
                        .map(([id]) => id)
                        .filter(id => !existingIds.has(id))
                        .slice(0, limit);
                }
            }
            return (COOCCURRENCES[lastId] ?? [])
                .filter(id => !existingIds.has(id))
                .slice(0, limit);
        },
        [coMap, coMapByTurn, sentenceCount, sentenceCountByTurn],
    );

    return { getSuggestions, loaded, sentenceCount, sentenceCountByTurn, getCurrentTurn };
}
