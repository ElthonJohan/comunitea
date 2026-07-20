
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface VisualTimerProps {
    visible: boolean;
    onClose: () => void;
    initialDuration?: number;
}

export default function VisualTimer({ visible, onClose, initialDuration }: VisualTimerProps) {
    const [timeLeft, setTimeLeft] = useState(initialDuration || 60);
    const [isRunning, setIsRunning] = useState(false);
    const [initialTime, setInitialTime] = useState(initialDuration || 60);

    useEffect(() => {
        if (visible && initialDuration) {
            setTimeLeft(initialDuration);
            setInitialTime(initialDuration);
            setIsRunning(true);
        } else if (visible && !initialDuration) {
            setTimeLeft(60);
            setInitialTime(60);
            setIsRunning(false);
        }
    }, [visible, initialDuration]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const startTimer = (seconds: number) => {
        setInitialTime(seconds);
        setTimeLeft(seconds);
        setIsRunning(true);
    };

    const stopTimer = () => {
        setIsRunning(false);
        setTimeLeft(initialTime);
    };

    const percentage = Math.max(0, (timeLeft / initialTime) * 100);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Temporizador</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                            <Ionicons name="close" size={24} color={Colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Timer Visual Representation */}
                    <View style={styles.timerDisplay}>
                        <View style={styles.barBackground}>
                            <View style={[styles.barFill, { width: `${percentage}%` }]} />
                        </View>
                        <Text style={styles.timeText}>{timeLeft} <Text style={styles.unitText}>seg</Text></Text>
                    </View>

                    {/* Shortcuts */}
                    <View style={styles.presets}>
                        {[1, 3, 5].map((min) => (
                            <TouchableOpacity key={min} style={styles.presetButton} onPress={() => startTimer(min * 60)}>
                                <Text style={styles.presetText}>{min} Min</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Controls */}
                    <View style={styles.actions}>
                        {!isRunning ? (
                            <TouchableOpacity style={[styles.actionButton, styles.startButton]} onPress={() => setIsRunning(true)}>
                                <Text style={styles.actionText}>Reanudar</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.actionButton, styles.pauseButton]} onPress={() => setIsRunning(false)}>
                                <Text style={[styles.actionText, styles.pauseText]}>Pausa</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={stopTimer}>
                            <Text style={[styles.actionText, styles.resetText]}>Reiniciar</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(29, 28, 18, 0.42)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.onSurface,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    timerDisplay: {
        width: '100%',
        marginBottom: 30,
        alignItems: 'center',
    },
    barBackground: {
        width: '100%',
        height: 24,
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(29, 28, 18, 0.12)',
    },
    barFill: {
        height: '100%',
        backgroundColor: Colors.danger,
        borderRadius: 12,
    },
    timeText: {
        marginTop: 16,
        fontSize: 48,
        fontWeight: '900',
        color: Colors.text.primary,
        fontVariant: ['tabular-nums'],
    },
    unitText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    presets: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    presetButton: {
        backgroundColor: Colors.primaryLight,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    presetText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    startButton: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    pauseButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    resetButton: {
        backgroundColor: '#FFEBEE', // Light Red
    },
    actionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    pauseText: {
        color: Colors.text.primary,
    },
    resetText: {
        color: Colors.danger,
    },
});
