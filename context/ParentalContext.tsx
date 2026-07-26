/**
 * ParentalContext.tsx
 * Muestra pantalla de bloqueo cuando se supera el límite de uso diario.
 * Desbloqueo con PIN (reutiliza EditModeContext).
 *
 * Evaluación de bloqueo:
 *  - isTimeUp se calcula LOCALMENTE: displaySeconds >= limitSeconds.
 *  - NO se invoca signOut / logout al alcanzar el límite.
 *  - El overlay se muestra cuando isTimeUp && !bypass.
 *
 * Tracking de tiempo:
 *  1. setInterval cada 60 s para actualizar el contador local (UI reactiva).
 *  2. Sync a Supabase cada 5 min y al pasar a background.
 *  3. Reset del sessionStartRef al volver a foreground.
 *  4. Limpieza completa de refs al cerrar sesión o cambiar de usuario.
 *  5. Guard de 5 min: no acumula tiempo si el gap supera MAX_ACCUMULABLE_SECONDS.
 *  6. Congelación de estado antes de Alert: flush + AsyncStorage + bandera alertActive.
 *  7. Bloqueo absoluto de disminución: displaySeconds es monótonamente creciente.
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useParental } from '../lib/hooks/useParental';
import { useEditMode } from './EditModeContext';
import { useAuth } from './AuthContext';
import { Colors } from '../constants/Colors';

const SYNC_INTERVAL_MS = 5 * 60 * 1000;
const TICK_INTERVAL_MS = 60 * 1000;
const MAX_ACCUMULABLE_SECONDS = 5 * 60;

/** Clave local para backup del temporizador antes de Alert. */
const TIMER_BACKUP_KEY = '@comunitea/timer_backup';

/** Fecha local YYYY-MM-DD (no UTC) para evitar resets antes de medianoche en GMT-. */
function todayString(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

interface ParentalContextValue {
    usedSecondsToday: number;
    isBlocked: boolean;
}

const ParentalContext = createContext<ParentalContextValue | null>(null);

export function ParentalProvider({ children }: { children: React.ReactNode }) {
    const {
        settings,
        usedSecondsToday,
        addUsedSeconds,
        refresh,
    } = useParental();
    const { isEditMode, requestUnlock } = useEditMode();
    const { user } = useAuth();
    const [bypass, setBypass] = useState(false);

    const [displaySeconds, setDisplaySeconds] = useState(usedSecondsToday);

    // --- Date tracking para detectar cambio de día ---
    const storedDateRef = useRef(settings?.date_today ?? todayString());

    // --- Bandera Alert: suprime refresh durante la transición AppState del Alert ---
    const alertActiveRef = useRef(false);

    // --- Ref para flushToServer (evita closure stale dentro de effects) ---
    const flushToServerRef = useRef<() => void>(() => {});

    // --- Sync monótono: NUNCA decrementar displaySeconds en el mismo día ---
    useEffect(() => {
        const today = todayString();
        const settingsDate = settings?.date_today ?? '';

        if (settingsDate !== '' && settingsDate !== storedDateRef.current) {
            // Fecha cambió (nuevo día o primera carga): permitir reset completo
            storedDateRef.current = settingsDate;
            setDisplaySeconds(usedSecondsToday);
        } else if (settingsDate === today || storedDateRef.current === today) {
            // Mismo día: solo incrementar monotonamente
            setDisplaySeconds((prev) => Math.max(prev, usedSecondsToday));
        }
    }, [usedSecondsToday, settings?.date_today]);

    // --- Límite en segundos calculado localmente ---
    const limitSeconds = settings ? settings.daily_limit_minutes * 60 : 0;

    // --- Evaluación local: bloquea al instante sin esperar sync de Supabase ---
    const isTimeUp = limitSeconds > 0 && displaySeconds >= limitSeconds;

    // --- Alerta preventiva: 2 minutos antes del límite ---
    const hasWarnedRef = useRef(false);

    useEffect(() => {
        if (usedSecondsToday === 0) {
            hasWarnedRef.current = false;
        }
    }, [usedSecondsToday]);

    useEffect(() => {
        if (limitSeconds === 0) return;

        const remainingSeconds = limitSeconds - displaySeconds;

        if (remainingSeconds > 0 && remainingSeconds <= 120 && !hasWarnedRef.current) {
            hasWarnedRef.current = true;

            // 1. Forzar flush del tiempo acumulado a Supabase antes del Alert
            flushToServerRef.current();

            // 2. Persistir backup en AsyncStorage
            AsyncStorage.setItem(
                TIMER_BACKUP_KEY,
                JSON.stringify({ seconds: displaySeconds, date: todayString() }),
            ).catch(() => {});

            // 3. Marcar Alert activa para suprimir refresh durante inactive→active
            alertActiveRef.current = true;

            Alert.alert(
                '⏳ ¡Tiempo por terminar!',
                'Te quedan 2 minutos de uso diario antes de que la aplicación se bloquee.'
            );
        }
    }, [displaySeconds, limitSeconds]);

    // Refs para AppState tracking y sync
    const sessionStartRef = useRef<number>(Date.now());
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const lastSyncRef = useRef<number>(Date.now());

    // --- Limpieza absoluta al cerrar sesión o cambiar de usuario ---
    const prevUserIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (prevUserIdRef.current !== user?.id) {
            prevUserIdRef.current = user?.id;

            sessionStartRef.current = Date.now();
            lastSyncRef.current = Date.now();
            appStateRef.current = AppState.currentState;
            alertActiveRef.current = false;

            setBypass(false);
            storedDateRef.current = settings?.date_today ?? todayString();
        }
    }, [user?.id]);

    // --- Push a Supabase: acumula los segundos pendientes y refresca ---
    const flushToServer = useCallback(() => {
        const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);

        if (elapsed > MAX_ACCUMULABLE_SECONDS) {
            sessionStartRef.current = Date.now();
            lastSyncRef.current = Date.now();
            return;
        }

        if (elapsed > 0) {
            addUsedSeconds(elapsed);
            sessionStartRef.current = Date.now();
            lastSyncRef.current = Date.now();
        }
    }, [addUsedSeconds]);

    flushToServerRef.current = flushToServer;

    // --- Intervalo local: incrementa displaySeconds cada 60 s y sync cada 5 min ---
    useEffect(() => {
        const tick = setInterval(() => {
            if (appStateRef.current !== 'active') return;
            const now = Date.now();
            setDisplaySeconds((prev) => prev + 60);
            if (now - lastSyncRef.current >= SYNC_INTERVAL_MS) {
                flushToServer();
                refresh();
            }
        }, TICK_INTERVAL_MS);
        return () => clearInterval(tick);
    }, [flushToServer, refresh]);

    // --- AppState: sync al background, reset al foreground ---
    useEffect(() => {
        const sub = AppState.addEventListener('change', (nextState) => {
            if (appStateRef.current === 'active' && nextState !== 'active') {
                // Si el Alert causó el cambio, NO flush ni refresh
                if (alertActiveRef.current) {
                    appStateRef.current = nextState;
                    return;
                }
                flushToServer();
                refresh();
            } else if (nextState === 'active') {
                if (alertActiveRef.current) {
                    alertActiveRef.current = false;
                }
                sessionStartRef.current = Date.now();
                lastSyncRef.current = Date.now();
                refresh();
            }
            appStateRef.current = nextState;
        });
        return () => sub.remove();
    }, [flushToServer, refresh]);

    // --- Bloqueo local: isTimeUp evaluado en memoria ---
    const showBlock = isTimeUp && !bypass;

    return (
        <ParentalContext.Provider value={{ usedSecondsToday: displaySeconds, isBlocked: showBlock }}>
            {children}
            {showBlock && <BlockOverlay onUnlock={requestUnlock} />}
        </ParentalContext.Provider>
    );
}

function BlockOverlay({ onUnlock }: { onUnlock: () => void }) {
    return (
        <View style={overlayStyles.overlay}>
            <Text style={overlayStyles.title}>Por hoy has llegado al límite</Text>
            <Text style={overlayStyles.subtitle}>
                El tiempo de uso diario se ha completado. Si eres el adulto a cargo, puedes desbloquear con tu PIN.
            </Text>
            <TouchableOpacity style={overlayStyles.button} onPress={onUnlock} activeOpacity={0.8}>
                <Text style={overlayStyles.buttonText}>Soy el adulto</Text>
            </TouchableOpacity>
        </View>
    );
}

const overlayStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        zIndex: 9999,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 24,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text.inverse,
    },
});

export function useParentalBlock() {
    const ctx = useContext(ParentalContext);
    return ctx ?? { usedSecondsToday: 0, isBlocked: false };
}
