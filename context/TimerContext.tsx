/**
 * TimerContext.tsx
 * Gestiona el modal del temporizador visual (VisualTimer).
 * El bloqueo por tiempo agotado lo gestiona exclusivamente ParentalContext.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import VisualTimer from '../components/VisualTimer';

interface TimerContextValue {
    /** Abre el temporizador visual. Si pasas segundos (p. ej. rutina), usa esa duración. */
    showTimer: (presetSeconds?: number) => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPresetSeconds, setModalPresetSeconds] = useState<number | undefined>(undefined);

    const showTimer = useCallback((presetSeconds?: number) => {
        setModalPresetSeconds(presetSeconds);
        setModalVisible(true);
    }, []);

    return (
        <TimerContext.Provider value={{ showTimer }}>
            {children}

            <VisualTimer
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setModalPresetSeconds(undefined);
                }}
                initialDuration={modalPresetSeconds}
            />
        </TimerContext.Provider>
    );
}

export function useTimer() {
    const ctx = useContext(TimerContext);
    if (!ctx) throw new Error('useTimer must be used within TimerProvider');
    return ctx;
}
