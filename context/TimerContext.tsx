import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VisualTimer from '../components/VisualTimer';
import PinModal from '../components/PinModal';
import { Colors } from '../constants/Colors';
import { STORAGE_KEYS } from '../constants/StorageKeys';

interface TimerContextValue {
    /** Abre el temporizador. Si pasas segundos (p. ej. rutina), usa esa duración; si no, el límite diario o 60 s. */
    showTimer: (presetSeconds?: number) => void;
    /** Inicia el countdown diario desde `seconds`. Llama solo una vez al montar el dashboard. */
    startDailyTimer: (seconds: number) => void;
    /** Segundos restantes del límite diario (null si no está corriendo). */
    dailySecondsLeft: number | null;
    /** true mientras la app esté bloqueada por tiempo agotado. */
    isBlocked: boolean;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
    // Modal visual on-demand
    const [modalVisible, setModalVisible] = useState(false);
    /** Duración explícita al abrir desde rutinas; si no, se usa límite diario o valor por defecto del modal */
    const [modalPresetSeconds, setModalPresetSeconds] = useState<number | undefined>(undefined);

    // Countdown diario en segundo plano
    const [dailySecondsLeft, setDailySecondsLeft] = useState<number | null>(null);
    const [dailyRunning, setDailyRunning] = useState(false);

    // Estado de bloqueo
    const [isBlocked, setIsBlocked] = useState(false);
    const [showPin, setShowPin] = useState(false);
    // undefined = aún cargando; null = no existe PIN
    const [storedPin, setStoredPin] = useState<string | null | undefined>(undefined);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEYS.PARENTAL_PIN).then(pin => setStoredPin(pin));
    }, []);

    // Countdown diario
    useEffect(() => {
        if (!dailyRunning || dailySecondsLeft === null) return;
        if (dailySecondsLeft <= 0) {
            setDailyRunning(false);
            setIsBlocked(true);
            setShowPin(true);
            return;
        }
        const id = setInterval(() => {
            setDailySecondsLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearInterval(id);
    }, [dailyRunning, dailySecondsLeft]);

    const showTimer = useCallback((presetSeconds?: number) => {
        setModalPresetSeconds(presetSeconds);
        setModalVisible(true);
    }, []);

    const startDailyTimer = useCallback((seconds: number) => {
        setDailySecondsLeft(seconds);
        setDailyRunning(true);
    }, []);

    const handlePinSuccess = useCallback((pin: string) => {
        if (storedPin === null || pin === storedPin) {
            setIsBlocked(false);
            setShowPin(false);
        } else {
            // PIN incorrecto: cerrar y reabrir para shake visual
            setShowPin(false);
            setTimeout(() => setShowPin(true), 100);
        }
    }, [storedPin]);

    return (
        <TimerContext.Provider value={{ showTimer, startDailyTimer, dailySecondsLeft, isBlocked }}>
            {children}

            {/* Modal visual — muestra segundos restantes del día */}
            <VisualTimer
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setModalPresetSeconds(undefined);
                }}
                initialDuration={modalPresetSeconds ?? dailySecondsLeft ?? undefined}
            />

            {/* Overlay de bloqueo cuando se agota el tiempo */}
            {isBlocked && !showPin && (
                <View style={styles.overlay}>
                    <Text style={styles.emoji}>⏰</Text>
                    <Text style={styles.title}>¡Tiempo de descanso!</Text>
                    <Text style={styles.sub}>El tiempo de uso del niño ha terminado por hoy.</Text>
                    <TouchableOpacity style={styles.btn} onPress={() => setShowPin(true)}>
                        <Text style={styles.btnText}>Soy el padre/tutor 🔐</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* PIN modal para desbloquear */}
            {showPin && storedPin !== undefined && (
                <PinModal
                    visible={true}
                    mode={storedPin === null ? 'setup' : 'verify'}
                    title="Zona de Padres 🔐"
                    subtitle="Ingresa el PIN para desbloquear"
                    onSuccess={handlePinSuccess}
                    onCancel={() => setShowPin(false)}
                />
            )}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    const ctx = useContext(TimerContext);
    if (!ctx) throw new Error('useTimer must be used within TimerProvider');
    return ctx;
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        elevation: 999,
        zIndex: 999,
    },
    emoji: { fontSize: 72, marginBottom: 16 },
    title: { fontSize: 26, fontWeight: 'bold', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 },
    sub: { fontSize: 15, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    btn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 20 },
    btnText: { color: Colors.text.inverse, fontSize: 16, fontWeight: '700' },
});
