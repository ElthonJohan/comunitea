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

/**
 * Timestamp del último write exitoso a Supabase (módulo-level, no por instancia).
 * Evita que load() sobreescriba un valor recién guardado cuando el componente
 * se desmonta y remonta rápidamente (navegación entre pantallas).
 * Se resetea al cambiar de usuario para evitar datos stale entre sesiones.
 */
let _lastWriteTs = 0;
let _lastWriteUid = '';
const WRITE_STALE_MS = 3_000;

/** UID del usuario previamente cargado — detecta logout / cambio de cuenta. */
let _prevLoadUid: string | undefined = undefined;

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

        // Al cambiar de usuario (logout → login), invalidar la protección stale-write
        // para que siempre se carguen los datos frescos del nuevo usuario.
        if (_prevLoadUid !== user.id) {
            _prevLoadUid = user.id;
            _lastWriteTs = 0;
            _lastWriteUid = '';
        }

        // Si se acaba de escribir para este usuario, no sobreescribir
        if (_lastWriteUid === user.id && Date.now() - _lastWriteTs < WRITE_STALE_MS) {
            setLoading(false);
            return;
        }
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
            const today = todayString();
            const dateMatch = (row.date_today ?? '') === today;
            const loaded: ParentalSettings = {
                daily_limit_minutes:  row.daily_limit_minutes  ?? 30,
                used_seconds_today:   dateMatch ? (row.used_seconds_today ?? 0) : 0,
                date_today:           dateMatch ? today : today,
                tts_speed:            row.tts_speed            ?? 1.0,
                animation_intensity:  row.animation_intensity  ?? 'normal',
                game_mode_enabled:    row.game_mode_enabled    ?? false,
            };
            // Monotonic guard: nunca decrementar used_seconds_today en el mismo día
            setSettings((prev) => {
                if (!prev) return loaded;
                if (loaded.date_today === today && prev.date_today === today && loaded.used_seconds_today < prev.used_seconds_today) {
                    return { ...loaded, used_seconds_today: prev.used_seconds_today };
                }
                return loaded;
            });
            // Si la fecha no coincidía (cross-midnight / timezone mismatch), persistir el reset
            if (!dateMatch) {
                await supabase.from('parental_settings').upsert(
                    { user_id: user.id, ...loaded },
                    { onConflict: 'user_id' },
                );
            }
        } else {
            const defaults: ParentalSettings = {
                daily_limit_minutes:  30,
                used_seconds_today:   0,
                date_today:           todayString(),
                tts_speed:            1.0,
                animation_intensity:  'normal',
                game_mode_enabled:    false,
            };
            setSettings(defaults);
            // Crear la fila en Supabase de inmediato para que no quede huérfana
            await supabase.from('parental_settings').upsert(
                { user_id: user.id, ...defaults },
                { onConflict: 'user_id' },
            );
        }
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        load();
    }, [load]);

    /**
     * Acumula segundos de uso. Optimistic update: aplica el cambio en estado
     * local ANTES del write async a Supabase, para que refresh() no sobreescriba
     * con un valor stale durante transiciones de AppState (ej. Alert.alert).
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

            // 1. Optimistic update inmediato
            const optimistic = { ...s, used_seconds_today: used, date_today: dateToday };
            setSettings(optimistic);
            _lastWriteTs = Date.now();
            _lastWriteUid = user.id;

            // 2. Persistir a Supabase
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

            if (error) {
                // Revertir en caso de error
                setSettings(s);
                _lastWriteTs = 0;
                _lastWriteUid = '';
            }
        },
        [user?.id],
    );

    /**
     * Actualiza el límite diario en minutos.
     * Optimistic update: aplica el cambio inmediatamente en estado local,
     * persiste async a Supabase y revierte si falla.
     */
    const updateDailyLimit = useCallback(
        async (minutes: number) => {
            if (!user) return;
            const s = settingsRef.current;
            const today = todayString();
            const resetUsed = minutes === 0 ? 0
                : s && s.date_today === today ? s.used_seconds_today : 0;
            const prevSettings = s ? { ...s } : null;

            // 1. Optimistic update inmediato
            const optimistic: ParentalSettings = s
                ? { ...s, daily_limit_minutes: minutes, used_seconds_today: resetUsed, date_today: today }
                : { daily_limit_minutes: minutes, used_seconds_today: resetUsed, date_today: today,
                    tts_speed: 1.0, animation_intensity: 'normal', game_mode_enabled: false };
            setSettings(optimistic);
            _lastWriteTs = Date.now();
            _lastWriteUid = user.id;

            // 2. Persistir a Supabase
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

            if (error) {
                // 3. Revertir en caso de error
                setSettings(prevSettings);
                _lastWriteTs = 0;
                _lastWriteUid = '';
            } else {
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
            const prevSettings = { ...s };

            // Optimistic update
            setSettings(next);
            _lastWriteTs = Date.now();
            _lastWriteUid = user.id;

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

            if (error) {
                setSettings(prevSettings);
                _lastWriteTs = 0;
                _lastWriteUid = '';
            } else {
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
            const prevSettings = { ...s };

            // Optimistic update
            const optimistic = { ...s, game_mode_enabled: enabled };
            setSettings(optimistic);
            _lastWriteTs = Date.now();
            _lastWriteUid = user.id;

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

            if (error) {
                setSettings(prevSettings);
                _lastWriteTs = 0;
                _lastWriteUid = '';
            } else {
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
