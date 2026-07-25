/**
 * useParental.ts
 * Temporizador parental, límite de uso diario y configuración sensorial.
 * Carga/actualiza parental_settings y expone isBlocked, addUsedSeconds, etc.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../../context/AuthContext';
import { auditLog } from '../auditLog';

export type AnimationIntensity = 'none' | 'soft' | 'normal';

export interface ParentalSettings {
    daily_limit_minutes: number;
    used_seconds_today: number;
    date_today: string;
    tts_speed: number;
    animation_intensity: AnimationIntensity;
    game_mode_enabled: boolean;
}

/** Fecha local YYYY-MM-DD (no UTC) para evitar resets antes de medianoche en GMT-. */
function todayString(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function useParental() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<ParentalSettings | null>(null);
    const [loading, setLoading] = useState(true);

    // Ref siempre actualizado — previene closures stale en addUsedSeconds
    const settingsRef = useRef<ParentalSettings | null>(null);
    settingsRef.current = settings;

    const load = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('parental_settings')
            .select('daily_limit_minutes, used_seconds_today, date_today, tts_speed, animation_intensity, game_mode_enabled')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) {
            setSettings(null);
        } else if (data) {
            const row = data as {
                daily_limit_minutes: number;
                used_seconds_today: number;
                date_today: string;
                tts_speed: number;
                animation_intensity: AnimationIntensity;
                game_mode_enabled: boolean;
            };
            setSettings({
                daily_limit_minutes:  row.daily_limit_minutes  ?? 30,
                used_seconds_today:   row.used_seconds_today   ?? 0,
                date_today:           row.date_today           ?? todayString(),
                tts_speed:            row.tts_speed            ?? 1.0,
                animation_intensity:  row.animation_intensity  ?? 'normal',
                game_mode_enabled:    row.game_mode_enabled    ?? false,
            });
        } else {
            setSettings({
                daily_limit_minutes:  30,
                used_seconds_today:   0,
                date_today:           todayString(),
                tts_speed:            1.0,
                animation_intensity:  'normal',
                game_mode_enabled:    false,
            });
        }
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        load();
    }, [load]);

    /**
     * Acumula segundos de uso. Usa settingsRef para leer el valor más reciente
     * y evitar race conditions cuando se llama múltiples veces en rápido sucesión.
     */
    const addUsedSeconds = useCallback(
        async (seconds: number) => {
            if (!user) return;
            const s = settingsRef.current;
            if (!s) return;

            const today = todayString();
            let used = s.date_today !== today ? 0 : s.used_seconds_today;
            used += seconds;
            const dateToday = today;

            const { error } = await supabase
                .from('parental_settings')
                .upsert(
                    {
                        user_id: user.id,
                        daily_limit_minutes:  s.daily_limit_minutes,
                        used_seconds_today:   used,
                        date_today:           dateToday,
                        tts_speed:            s.tts_speed,
                        animation_intensity:  s.animation_intensity,
                        game_mode_enabled:    s.game_mode_enabled,
                    },
                    { onConflict: 'user_id' },
                );

            if (!error) {
                setSettings((prev) => (prev ? { ...prev, used_seconds_today: used, date_today: dateToday } : null));
            }
        },
        [user?.id],
    );

    /**
     * Actualiza el límite diario en minutos.
     * Si se desactiva (0), resetea used_seconds_today para evitar bloqueos residuales.
     */
    const updateDailyLimit = useCallback(
        async (minutes: number) => {
            if (!user) return;
            const s = settingsRef.current;
            const today = todayString();
            const resetUsed = minutes === 0 ? 0
                : s && s.date_today === today ? s.used_seconds_today : 0;

            const { error } = await supabase.from('parental_settings').upsert(
                {
                    user_id:              user.id,
                    daily_limit_minutes:  minutes,
                    used_seconds_today:   resetUsed,
                    date_today:           today,
                    tts_speed:            s?.tts_speed            ?? 1.0,
                    animation_intensity:  s?.animation_intensity  ?? 'normal',
                    game_mode_enabled:    s?.game_mode_enabled     ?? false,
                },
                { onConflict: 'user_id' },
            );

            if (!error) {
                setSettings((prev) => prev
                    ? { ...prev, daily_limit_minutes: minutes, used_seconds_today: resetUsed, date_today: today }
                    : null);
                await auditLog(user.id, 'daily_limit_minutes', String(s?.daily_limit_minutes ?? 0), String(minutes));
            }
        },
        [user?.id],
    );

    const updateSensoryConfig = useCallback(
        async (patch: Partial<Pick<ParentalSettings, 'tts_speed' | 'animation_intensity'>>) => {
            const s = settingsRef.current;
            if (!user || !s) return;
            const next = { ...s, ...patch };

            const { error } = await supabase.from('parental_settings').upsert(
                {
                    user_id:              user.id,
                    daily_limit_minutes:  next.daily_limit_minutes,
                    used_seconds_today:   next.used_seconds_today,
                    date_today:           next.date_today,
                    tts_speed:            next.tts_speed,
                    animation_intensity:  next.animation_intensity,
                    game_mode_enabled:    next.game_mode_enabled,
                },
                { onConflict: 'user_id' },
            );

            if (!error) {
                setSettings(next);
                for (const [key, value] of Object.entries(patch)) {
                    const oldVal = String(s[key as keyof ParentalSettings] ?? '');
                    await auditLog(user.id, key, oldVal, String(value));
                }
            }
        },
        [user?.id],
    );

    const updateGameMode = useCallback(
        async (enabled: boolean) => {
            const s = settingsRef.current;
            if (!user || !s) return;

            const { error } = await supabase.from('parental_settings').upsert(
                {
                    user_id:              user.id,
                    daily_limit_minutes:  s.daily_limit_minutes,
                    used_seconds_today:   s.used_seconds_today,
                    date_today:           s.date_today,
                    tts_speed:            s.tts_speed,
                    animation_intensity:  s.animation_intensity,
                    game_mode_enabled:    enabled,
                },
                { onConflict: 'user_id' },
            );

            if (!error) {
                setSettings((prev) => prev ? { ...prev, game_mode_enabled: enabled } : null);
                await auditLog(user.id, 'game_mode_enabled', String(s.game_mode_enabled), String(enabled));
            }
        },
        [user?.id],
    );

    const limitSeconds = settings ? settings.daily_limit_minutes * 60 : 0;
    const today = todayString();
    const usedToday =
        settings && settings.date_today === today ? settings.used_seconds_today : 0;
    const isBlocked = limitSeconds > 0 && usedToday >= limitSeconds;

    return {
        settings,
        loading,
        usedSecondsToday: usedToday,
        isBlocked,
        addUsedSeconds,
        updateDailyLimit,
        updateSensoryConfig,
        updateGameMode,
        refresh: load,
    };
}
