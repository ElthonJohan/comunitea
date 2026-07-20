/**
 * useGame.ts
 *
 * Gestiona la progresión del modo juego PECS.
 * - Carga el sub-nivel actual desde `game_progress` (el registro más reciente).
 * - `saveSession` guarda la sesión y evalúa el criterio de avance:
 *   8/10 aciertos en 2 sesiones consecutivas → avanza un sub-nivel.
 * - `overrideSublevel` permite al padre fijar el sub-nivel manualmente.
 */
import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export interface GameSessionRecord {
    sublevel: number;
    correct: number;
    total: number;
}

export interface SaveSessionResult {
    advanced: boolean;
    newSublevel: number;
    performanceDrop: boolean;
}

export function useGame() {
    const { user } = useAuth();
    const [sublevel, setSublevel] = useState(1);
    const [loading, setLoading] = useState(true);
    const [recentSessionsAtLevel, setRecentSessionsAtLevel] = useState<GameSessionRecord[]>([]);

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const { data: progress } = await supabase
            .from('game_progress')
            .select('sublevel')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const currentSublevel: number = (progress as { sublevel: number } | null)?.sublevel ?? 1;
        setSublevel(currentSublevel);

        const { data: sessions } = await supabase
            .from('game_sessions')
            .select('sublevel, correct, total_trials')
            .eq('user_id', user.id)
            .eq('sublevel', currentSublevel)
            .order('completed_at', { ascending: false })
            .limit(5);

        if (sessions) {
            setRecentSessionsAtLevel(
                (sessions as { sublevel: number; correct: number; total_trials: number }[]).map(s => ({
                    sublevel: s.sublevel,
                    correct: s.correct,
                    total: s.total_trials,
                }))
            );
        }

        setLoading(false);
    }, [user]);

    /**
     * Guarda la sesión terminada y evalúa si el niño avanza de sub-nivel.
     * Recibe el sub-nivel y las sesiones previas como parámetros para evitar
     * dependencias de estado que puedan estar obsoletas en callbacks.
     */
    const saveSession = useCallback(async (
        correct: number,
        total: number,
        currentSublevel: number,
        previousSessions: GameSessionRecord[],
    ): Promise<SaveSessionResult> => {
        if (!user) return { advanced: false, newSublevel: currentSublevel, performanceDrop: false };

        await supabase.from('game_sessions').insert({
            user_id: user.id,
            sublevel: currentSublevel,
            correct,
            total_trials: total,
        });

        // Criterio de avance: ≥8/10 en las 2 últimas sesiones consecutivas
        const allSessions = [{ sublevel: currentSublevel, correct, total }, ...previousSessions];
        const lastTwo = allSessions.slice(0, 2);
        const shouldAdvance =
            currentSublevel < 5 &&
            lastTwo.length >= 2 &&
            lastTwo.every(s => s.total >= 10 && s.correct / s.total >= 0.8);

        // Alerta de rendimiento: cae más de 20 pp respecto a la sesión anterior
        const prev = previousSessions[0];
        const performanceDrop =
            prev != null &&
            prev.total >= 10 &&
            correct / total < 0.6 &&
            prev.correct / prev.total >= 0.6;

        if (shouldAdvance) {
            const newSublevel = currentSublevel + 1;
            await supabase.from('game_progress').insert({
                user_id: user.id,
                sublevel: newSublevel,
            });
            await supabase.rpc('upsert_ai_insight', {
                p_user_id: user.id,
                p_type: 'sublevel_ready',
                p_payload: {
                    message: `Completó con éxito el subnivel ${currentSublevel} y avanzó al ${newSublevel}.`,
                    previous_sublevel: currentSublevel,
                    new_sublevel: newSublevel,
                    correct,
                    total,
                },
            });
            setSublevel(newSublevel);
            return { advanced: true, newSublevel, performanceDrop: false };
        }

        return { advanced: false, newSublevel: currentSublevel, performanceDrop };
    }, [user]);

    const overrideSublevel = useCallback(async (newSublevel: number) => {
        if (!user) return;
        await supabase.from('game_progress').insert({
            user_id: user.id,
            sublevel: newSublevel,
        });
        setSublevel(newSublevel);
    }, [user]);

    return { sublevel, loading, load, saveSession, overrideSublevel, recentSessionsAtLevel };
}
