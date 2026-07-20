/**
 * useReport.ts
 * Carga reportes de uso, comparativas entre períodos y progresión del modo juego.
 */
import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export interface ReportData {
    description: string;
    byEventType: Record<string, number>;
    byHour: Record<string, number>;
    topPictograms: { id: string; count: number }[];
    sessions: number;
    sentencePlays: number;
    pictogramTaps: number;
    periodDays: number;
}

export interface DailyPoint {
    day: string;   // ISO date string
    sessions: number;
    sentence_plays: number;
    pictogram_taps: number;
    ai_expands: number;
}

export interface GameHistoryPoint {
    completed_at: string;
    sublevel: number;
    correct: number;
    total_trials: number;
    pct: number;
}

export interface ReportInsight {
    id: string;
    insight_type: string;
    message: string;
    seen: boolean;
    created_at: string;
}

export interface FullReportData {
    current: ReportData;
    previous: ReportData | null;   // mismo número de días, período anterior
    daily: DailyPoint[];
    gameHistory: GameHistoryPoint[];
    insights: ReportInsight[];
}

export function useReport() {
    const { user } = useAuth();
    const [data, setData] = useState<FullReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = useCallback(
        async (days: number = 7) => {
            if (!user) return;
            setLoading(true);
            setError(null);
            try {
                const [currentRes, prevRes, dailyRes, gameRes, insightsRes] = await Promise.all([
                    supabase.rpc('get_usage_report', { p_days: days }),
                    supabase.rpc('get_usage_report', { p_days: days * 2 }),   // doble período → "periodo anterior"
                    supabase.rpc('get_daily_usage', { p_days: days }),
                    supabase.rpc('get_game_history', { p_limit: 10 }),
                    supabase
                        .from('ai_insights')
                        .select('id, insight_type, payload, seen, created_at, expires_at')
                        .gte('expires_at', new Date().toISOString())
                        .order('seen', { ascending: true })
                        .order('created_at', { ascending: false })
                        .limit(5),
                ]);

                if (currentRes.error) throw new Error(currentRes.error.message);

                const parseReport = (raw: unknown): ReportData | null => {
                    if (!raw || typeof raw !== 'object' || 'error' in (raw as object)) return null;
                    const r = raw as {
                        description: string;
                        byEventType: Record<string, number>;
                        byHour: Record<string, number>;
                        topPictograms: { id: string; count: number }[];
                        sessions: number;
                        sentencePlays: number;
                        pictogramTaps: number;
                        periodDays: number;
                    };
                    return {
                        description: r.description ?? '',
                        byEventType: r.byEventType ?? {},
                        byHour: r.byHour ?? {},
                        topPictograms: Array.isArray(r.topPictograms) ? r.topPictograms : [],
                        sessions: r.sessions ?? 0,
                        sentencePlays: r.sentencePlays ?? 0,
                        pictogramTaps: r.pictogramTaps ?? 0,
                        periodDays: r.periodDays ?? days,
                    };
                };

                const current = parseReport(currentRes.data);
                if (!current) throw new Error('No se pudo leer el reporte actual');

                // El período anterior es la segunda mitad del doble período
                const prevFull = parseReport(prevRes.data);
                const previous: ReportData | null = prevFull
                    ? {
                          ...prevFull,
                          sessions: Math.max(0, prevFull.sessions - current.sessions),
                          sentencePlays: Math.max(0, prevFull.sentencePlays - current.sentencePlays),
                          pictogramTaps: Math.max(0, prevFull.pictogramTaps - current.pictogramTaps),
                          periodDays: days,
                      }
                    : null;

                type RawDaily = { day: string; sessions: string | number; sentence_plays: string | number; pictogram_taps: string | number; ai_expands: string | number };
                const daily: DailyPoint[] = Array.isArray(dailyRes.data)
                    ? (dailyRes.data as RawDaily[]).map(d => ({
                          day: d.day,
                          sessions: Number(d.sessions),
                          sentence_plays: Number(d.sentence_plays),
                          pictogram_taps: Number(d.pictogram_taps),
                          ai_expands: Number(d.ai_expands),
                      }))
                    : [];

                type RawGame = { completed_at: string; sublevel: number; correct: number; total_trials: number; pct: string | number };
                const gameHistory: GameHistoryPoint[] = Array.isArray(gameRes.data)
                    ? (gameRes.data as RawGame[]).map(g => ({
                          completed_at: g.completed_at,
                          sublevel: g.sublevel,
                          correct: g.correct,
                          total_trials: g.total_trials,
                          pct: Number(g.pct),
                      }))
                    : [];

                type RawInsight = {
                    id: string;
                    insight_type: string;
                    payload: { message?: string } | null;
                    seen: boolean;
                    created_at: string;
                };
                const insights: ReportInsight[] = Array.isArray(insightsRes.data)
                    ? (insightsRes.data as RawInsight[]).map(item => ({
                          id: item.id,
                          insight_type: item.insight_type,
                          message: item.payload?.message ?? '',
                          seen: item.seen,
                          created_at: item.created_at,
                      }))
                    : [];

                setData({ current, previous, daily, gameHistory, insights });
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Error desconocido');
                setData(null);
            } finally {
                setLoading(false);
            }
        },
        [user?.id],
    );

    return { data, loading, error, fetchReport };
}
