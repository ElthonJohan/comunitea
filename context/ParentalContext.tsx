/**
 * ParentalContext.tsx
 * Muestra pantalla de bloqueo cuando se supera el límite de uso diario.
 * Desbloqueo con PIN (reutiliza EditModeContext).
 */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppState, AppStateStatus } from 'react-native';
import { useParental } from '../lib/hooks/useParental';
import { useEditMode } from './EditModeContext';
import { Colors } from '../constants/Colors';

interface ParentalContextValue {
    usedSecondsToday: number;
    isBlocked: boolean;
}

const ParentalContext = createContext<ParentalContextValue | null>(null);

export function ParentalProvider({ children }: { children: React.ReactNode }) {
    const {
        usedSecondsToday,
        isBlocked,
        addUsedSeconds,
        refresh,
    } = useParental();
    const { isEditMode, requestUnlock } = useEditMode();
    const [bypass, setBypass] = useState(false);
    const sessionStartRef = useRef<number>(Date.now());
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    useEffect(() => {
        if (isBlocked && isEditMode) {
            setBypass(true);
        }
    }, [isBlocked, isEditMode]);

    useEffect(() => {
        const sub = AppState.addEventListener('change', (nextState) => {
            if (appStateRef.current === 'active' && nextState !== 'active') {
                const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
                if (elapsed > 0) addUsedSeconds(elapsed);
                refresh();
            } else if (nextState === 'active') {
                sessionStartRef.current = Date.now();
                refresh();
            }
            appStateRef.current = nextState;
        });
        return () => sub.remove();
    }, [addUsedSeconds, refresh]);

    useEffect(() => {
        if (!isBlocked || bypass) return;
        const interval = setInterval(() => {
            if (AppState.currentState === 'active') {
                addUsedSeconds(30);
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [isBlocked, bypass, addUsedSeconds]);

    const showBlock = isBlocked && !bypass;

    return (
        <ParentalContext.Provider value={{ usedSecondsToday, isBlocked: showBlock }}>
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
