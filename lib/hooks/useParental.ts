/**
 * useParental.ts
 * Temporizador parental, límite de uso diario y configuración sensorial.
 * Carga/actualiza parental_settings y expone isBlocked, addUsedSeconds, etc.
 */
import { useState, useEffect, useCallback } from 'react';
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

function todayString(): string {
    return new Date().toISOString().slice(0, 10);
}

export function useParental() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<ParentalSettings | null>(null);
    const [loading, setLoading] = useState(true);

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
                daily_limit_minutes:  0,
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

    const addUsedSeconds = useCallback(
        async (seconds: number) => {
            if (!user || !settings) return;
            const today = todayString();
            let used = settings.used_seconds_today;
            let dateToday = settings.date_today;

            if (dateToday !== today) {
                used = 0;
                dateToday = today;
            }
            used += seconds;

            const { error } = await supabase
                .from('parental_settings')
                .upsert(
                    {
                        user_id: user.id,
                        daily_limit_minutes:  settings.daily_limit_minutes,
                        used_seconds_today:   used,
                        date_today:           dateToday,
                        tts_speed:            settings.tts_speed,
                        animation_intensity:  settings.animation_intensity,
                        game_mode_enabled:    settings.game_mode_enabled,
                    },
                    { onConflict: 'user_id' },
                );

            if (!error) {
                setSettings((s) => (s ? { ...s, used_seconds_today: used, date_today: dateToday } : null));
            }
        },
        [user?.id, settings],
    );

    const updateDailyLimit = useCallback(
        async (minutes: number) => {
            if (!user) return;
            const today = todayString();
            const currentUsed =
                settings && settings.date_today === today ? settings.used_seconds_today : 0;

            const { error } = await supabase.from('parental_settings').upsert(
                {
                    user_id:              user.id,
                    daily_limit_minutes:  minutes,
                    used_seconds_today:   currentUsed,
                    date_today:           today,
                    tts_speed:            settings?.tts_speed            ?? 1.0,
                    animation_intensity:  settings?.animation_intensity  ?? 'normal',
                    game_mode_enabled:    settings?.game_mode_enabled     ?? false,
                },
                { onConflict: 'user_id' },
            );

            if (!error) {
                setSettings((s) => s ? { ...s, daily_limit_minutes: minutes, used_seconds_today: currentUsed, date_today: today } : null);
                await auditLog(user.id, 'daily_limit_minutes', String(settings?.daily_limit_minutes ?? 0), String(minutes));
            }
        },
        [user?.id, settings],
    );

    const updateSensoryConfig = useCallback(
        async (patch: Partial<Pick<ParentalSettings, 'tts_speed' | 'animation_intensity'>>) => {
            if (!user || !settings) return;
            const next = { ...settings, ...patch };

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
                    const oldVal = String(settings[key as keyof ParentalSettings] ?? '');
                    await auditLog(user.id, key, oldVal, String(value));
                }
            }
        },
        [user?.id, settings],
    );

    const updateGameMode = useCallback(
        async (enabled: boolean) => {
            if (!user || !settings) return;

            const { error } = await supabase.from('parental_settings').upsert(
                {
                    user_id:              user.id,
                    daily_limit_minutes:  settings.daily_limit_minutes,
                    used_seconds_today:   settings.used_seconds_today,
                    date_today:           settings.date_today,
                    tts_speed:            settings.tts_speed,
                    animation_intensity:  settings.animation_intensity,
                    game_mode_enabled:    enabled,
                },
                { onConflict: 'user_id' },
            );

            if (!error) {
                setSettings((s) => s ? { ...s, game_mode_enabled: enabled } : null);
                await auditLog(user.id, 'game_mode_enabled', String(settings.game_mode_enabled), String(enabled));
            }
        },
        [user?.id, settings],
    );

    const limitSeconds = settings ? settings.daily_limit_minutes * 60 : 0;
    const usedToday =
        settings && settings.date_today === todayString() ? settings.used_seconds_today : 0;
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
