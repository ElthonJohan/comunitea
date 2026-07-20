/**
 * PinModal.tsx
 * Modal numérico de 4 dígitos para el control parental.
 * Se usa tanto para configurar el PIN como para verificarlo.
 */
import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TouchableOpacity, StyleSheet,
    Vibration, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface PinModalProps {
    visible: boolean;
    mode: 'setup' | 'verify';       // 'setup' = crear PIN, 'verify' = ingresar PIN
    onSuccess: (pin: string) => void;
    onCancel: () => void;
    title?: string;
    subtitle?: string;
}

const PIN_LENGTH = 4;

export default function PinModal({ visible, mode, onSuccess, onCancel, title, subtitle }: PinModalProps) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState<'enter' | 'confirm'>('enter'); // solo en modo setup
    const [error, setError] = useState('');
    const shakeAnim = useState(new Animated.Value(0))[0];

    // Reset al abrir/cerrar
    useEffect(() => {
        if (visible) {
            setPin('');
            setConfirmPin('');
            setStep('enter');
            setError('');
        }
    }, [visible]);

    const shake = () => {
        Vibration.vibrate(200);
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleDigit = (digit: string) => {
        setError('');
        const current = step === 'confirm' ? confirmPin : pin;
        if (current.length >= PIN_LENGTH) return;
        const next = current + digit;

        if (step === 'confirm') {
            setConfirmPin(next);
            if (next.length === PIN_LENGTH) handleConfirmComplete(next);
        } else {
            setPin(next);
            if (next.length === PIN_LENGTH) {
                if (mode === 'verify') {
                    // En verificación: emitir inmediatamente
                    onSuccess(next);
                } else {
                    // En setup: pedir confirmación
                    setStep('confirm');
                }
            }
        }
    };

    const handleConfirmComplete = (confirmValue: string) => {
        if (confirmValue === pin) {
            onSuccess(pin);
        } else {
            shake();
            setError('Los PINs no coinciden. Inténtalo de nuevo.');
            setTimeout(() => {
                setConfirmPin('');
                setPin('');
                setStep('enter');
                setError('');
            }, 1500);
        }
    };

    const handleDelete = () => {
        setError('');
        if (step === 'confirm') {
            setConfirmPin(prev => prev.slice(0, -1));
        } else {
            setPin(prev => prev.slice(0, -1));
        }
    };

    const currentPin = step === 'confirm' ? confirmPin : pin;

    const resolvedTitle = title ?? (mode === 'setup' ? 'Crear PIN Parental' : 'Zona de Padres 🔐');
    const resolvedSubtitle = subtitle ?? (
        mode === 'setup'
            ? (step === 'enter' ? 'Elige un PIN de 4 dígitos' : 'Confirma tu PIN')
            : 'Ingresa el PIN para continuar'
    );

    const DIGITS = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['', '0', 'del'],
    ];

    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>{resolvedTitle}</Text>
                    <Text style={styles.subtitle}>{resolvedSubtitle}</Text>

                    {/* Indicadores de puntos */}
                    <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
                        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    i < currentPin.length && styles.dotFilled,
                                ]}
                            />
                        ))}
                    </Animated.View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {/* Teclado numérico */}
                    <View style={styles.keypad}>
                        {DIGITS.map((row, ri) => (
                            <View key={ri} style={styles.row}>
                                {row.map((key, ki) => {
                                    if (key === '') return <View key={ki} style={styles.keyEmpty} />;
                                    if (key === 'del') return (
                                        <TouchableOpacity key={ki} style={styles.key} onPress={handleDelete} activeOpacity={0.6}>
                                            <Ionicons name="backspace-outline" size={26} color={Colors.text.primary} />
                                        </TouchableOpacity>
                                    );
                                    return (
                                        <TouchableOpacity key={ki} style={styles.key} onPress={() => handleDigit(key)} activeOpacity={0.6}>
                                            <Text style={styles.keyText}>{key}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>

                    {/* Cancelar */}
                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: 320,
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: 32,
        paddingVertical: 36,
        paddingHorizontal: 28,
        alignItems: 'center',
        shadowColor: Colors.onSurface,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 16,
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
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 16,
    },
    dot: {
        width: 18, height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: 'transparent',
    },
    dotFilled: {
        backgroundColor: Colors.primary,
    },
    errorText: {
        color: Colors.danger,
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
        minHeight: 20,
    },
    keypad: { width: '100%', marginTop: 12, gap: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    key: {
        width: 72, height: 72,
        borderRadius: 36,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: Colors.onSurface,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    keyEmpty: { width: 72, height: 72 },
    keyText: { fontSize: 24, fontWeight: '700', color: Colors.text.primary },
    cancelButton: { marginTop: 24 },
    cancelText: { fontSize: 16, color: Colors.text.secondary, fontWeight: '600' },
});
