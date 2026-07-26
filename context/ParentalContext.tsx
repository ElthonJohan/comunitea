/**
 * ParentalContext.tsx
 * Muestra pantalla de bloqueo cuando se supera el límite de uso diario.
 * Desbloqueo con PIN y extensión de tiempo.
 *
 * Evaluación de bloqueo:
 *  - isTimeUp se calcula LOCALMENTE: displaySeconds >= limitSeconds.
 *  - NO se invoca signOut / logout al alcanzar el límite.
 *  - El overlay se muestra cuando isTimeUp && !bypass && !!user.
 *
 * Funcionalidades del overlay:
 *  - Botón "Soy Padre/Apoderado" → verifica PIN → permite extender tiempo.
 *  - Botón "Cerrar sesión" → signOut y redirección automática a /login.
 *  - Extensión de tiempo: +15, +30, +60 minutos al límite diario.
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
import { Ionicons } from '@expo/vector-icons';
import { useParental } from '../lib/hooks/useParental';
import { useAuth } from './AuthContext';
import { Colors } from '../constants/Colors';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import PinModal from '../components/PinModal';

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

// ---------------------------------------------------------------------------
// Contexto
// ---------------------------------------------------------------------------

interface ParentalContextValue {
    usedSecondsToday: number;
    isBlocked: boolean;
    /** Amplía el límite diario en `additionalMinutes` y oculta el overlay. */
    extendTime: (additionalMinutes: number) => void;
}

const ParentalContext = createContext<ParentalContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ParentalProvider({ children }: { children: React.ReactNode }) {
    const {
        settings,
        usedSecondsToday,
        addUsedSeconds,
        updateDailyLimit,
        refresh,
    } = useParental();
    const { user, signOut } = useAuth();
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
            storedDateRef.current = settingsDate;
            setDisplaySeconds(usedSecondsToday);
        } else if (settingsDate === today || storedDateRef.current === today) {
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

            flushToServerRef.current();

            AsyncStorage.setItem(
                TIMER_BACKUP_KEY,
                JSON.stringify({ seconds: displaySeconds, date: todayString() }),
            ).catch(() => {});

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

    // --- Extender tiempo: aumenta el límite diario y desbloquea la app ---
    const extendTime = useCallback((additionalMinutes: number) => {
        if (!settings) return;
        const newLimitMinutes = settings.daily_limit_minutes + additionalMinutes;
        updateDailyLimit(newLimitMinutes);
        setBypass(true);
        hasWarnedRef.current = false;
    }, [settings, updateDailyLimit]);

    // --- Cerrar sesión desde el overlay ---
    const handleSignOut = useCallback(() => {
        signOut().catch(() => {});
    }, [signOut]);

    // --- Bloqueo local: isTimeUp evaluado en memoria ---
    // !!user evita que el overlay aparezca cuando no hay sesión (post-logout)
    const showBlock = isTimeUp && !bypass && !!user;

    return (
        <ParentalContext.Provider value={{ usedSecondsToday: displaySeconds, isBlocked: showBlock, extendTime }}>
            {children}
            {showBlock && (
                <BlockOverlay onExtend={extendTime} onSignOut={handleSignOut} />
            )}
        </ParentalContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Overlay de bloqueo con PIN + extensión de tiempo
// ---------------------------------------------------------------------------

type OverlayStep = 'blocked' | 'pin' | 'extend';

function BlockOverlay({ onExtend, onSignOut }: { onExtend: (min: number) => void; onSignOut: () => void }) {
    const [step, setStep] = useState<OverlayStep>('blocked');
    const [pinMode, setPinMode] = useState<'setup' | 'verify'>('verify');
    const [storedPin, setStoredPin] = useState<string | null>(null);
    const [pinModalVisible, setPinModalVisible] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEYS.PARENTAL_PIN).then(setStoredPin);
    }, []);

    const handleAdultPress = () => {
        setPinMode(storedPin === null ? 'setup' : 'verify');
        setPinModalVisible(true);
    };

    const handlePinSuccess = (pin: string) => {
        if (pinMode === 'setup') {
            AsyncStorage.setItem(STORAGE_KEYS.PARENTAL_PIN, pin).catch(() => {});
            setStoredPin(pin);
            setPinModalVisible(false);
            setStep('extend');
        } else {
            if (pin === storedPin) {
                setPinModalVisible(false);
                setStep('extend');
            } else {
                setPinModalVisible(false);
                setTimeout(() => setPinModalVisible(true), 100);
            }
        }
    };

    const handlePinCancel = () => {
        setPinModalVisible(false);
        setStep('blocked');
    };

    // --- Paso: seleccionar extensión de tiempo ---
    if (step === 'extend') {
        return <TimeExtensionPicker onSelect={onExtend} onBack={() => setStep('blocked')} />;
    }

    // --- Paso: pantalla de bloqueo con opciones ---
    return (
        <View style={overlayStyles.overlay}>
            <View style={overlayStyles.iconContainer}>
                <Ionicons name="time-outline" size={48} color={Colors.primary} />
            </View>

            <Text style={overlayStyles.title}>Por hoy has llegado al límite</Text>
            <Text style={overlayStyles.subtitle}>
                El tiempo de uso diario se ha completado. Si eres el adulto a cargo, puedes ampliar el tiempo o cerrar sesión.
            </Text>

            <TouchableOpacity
                style={overlayStyles.primaryButton}
                onPress={handleAdultPress}
                activeOpacity={0.8}
            >
                <Ionicons name="lock-open-outline" size={20} color={Colors.text.inverse} />
                <Text style={overlayStyles.primaryButtonText}>Soy Padre / Apoderado</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={overlayStyles.secondaryButton}
                onPress={onSignOut}
                activeOpacity={0.8}
            >
                <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                <Text style={overlayStyles.secondaryButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>

            {pinModalVisible && (
                <PinModal
                    visible={pinModalVisible}
                    mode={pinMode}
                    title={pinMode === 'setup' ? 'Crear PIN Parental' : 'Zona de Padres'}
                    subtitle={
                        pinMode === 'setup'
                            ? 'Elige un PIN de 4 dígitos para proteger la configuración'
                            : 'Ingresa tu PIN para modificar el tiempo'
                    }
                    onSuccess={handlePinSuccess}
                    onCancel={handlePinCancel}
                />
            )}
        </View>
    );
}

// ---------------------------------------------------------------------------
// Selector de extensión de tiempo
// ---------------------------------------------------------------------------

function TimeExtensionPicker({ onSelect, onBack }: { onSelect: (min: number) => void; onBack: () => void }) {
    const options = [
        { label: '+15 minutos', minutes: 15, sub: 'Uso extendido', icon: 'add-circle-outline' as const },
        { label: '+30 minutos', minutes: 30, sub: 'Uso moderado', icon: 'add-circle' as const },
        { label: '+60 minutos', minutes: 60, sub: 'Uso completo', icon: 'checkmark-circle' as const },
    ];

    return (
        <View style={overlayStyles.overlay}>
            <View style={overlayStyles.iconContainer}>
                <Ionicons name="hourglass-outline" size={48} color={Colors.primary} />
            </View>

            <Text style={overlayStyles.title}>Ampliar tiempo de uso</Text>
            <Text style={overlayStyles.subtitle}>
                Selecciona cuántos minutos adicionales deseas agregar al límite diario.
            </Text>

            {options.map((opt) => (
                <TouchableOpacity
                    key={opt.minutes}
                    style={overlayStyles.timeOption}
                    onPress={() => onSelect(opt.minutes)}
                    activeOpacity={0.8}
                >
                    <Ionicons name={opt.icon} size={24} color={Colors.primary} />
                    <View style={overlayStyles.timeOptionTextWrap}>
                        <Text style={overlayStyles.timeOptionLabel}>{opt.label}</Text>
                        <Text style={overlayStyles.timeOptionSub}>{opt.sub}</Text>
                    </View>
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={overlayStyles.backButton} onPress={onBack} activeOpacity={0.8}>
                <Text style={overlayStyles.backButtonText}>Volver</Text>
            </TouchableOpacity>
        </View>
    );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------

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
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 22,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 24,
        marginBottom: 14,
        minWidth: 260,
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text.inverse,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.surfaceContainerLow,
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.border,
        minWidth: 260,
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.danger,
    },
    // --- TimeExtensionPicker ---
    timeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: Colors.surfaceContainerLow,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 12,
        width: '100%',
    },
    timeOptionTextWrap: {
        flex: 1,
    },
    timeOptionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    timeOptionSub: {
        fontSize: 13,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    backButton: {
        marginTop: 8,
        paddingVertical: 12,
    },
    backButtonText: {
        fontSize: 16,
        color: Colors.text.secondary,
        fontWeight: '600',
    },
});

// ---------------------------------------------------------------------------
// Hook de consumo
// ---------------------------------------------------------------------------

export function useParentalBlock() {
    const ctx = useContext(ParentalContext);
    return ctx ?? { usedSecondsToday: 0, isBlocked: false, extendTime: () => {} };
}
