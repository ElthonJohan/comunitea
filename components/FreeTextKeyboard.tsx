import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, Alert, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSpeech } from '../features/vocabulario/hooks/useSpeech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { useStats } from '../features/perfil/hooks/useStats';

const MAX_DAILY_CREDITS = 10;

export default function FreeTextKeyboard() {
    const [text, setText] = useState('');
    const { speakFreeText, stop } = useSpeech();
    const { logEvent } = useStats();
    const [isPlaying, setIsPlaying] = useState(false);
    const [creditsUsed, setCreditsUsed] = useState(0);

    // Cargar créditos al iniciar
    useEffect(() => {
        loadCredits();
    }, []);

    const loadCredits = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]; // Ej: "2024-03-03"
            const storedData = await AsyncStorage.getItem(STORAGE_KEYS.ELEVEN_CREDITS);
            
            if (storedData) {
                const { date, count } = JSON.parse(storedData);
                if (date === today) {
                    setCreditsUsed(count);
                } else {
                    // Es un nuevo día, reiniciar
                    await AsyncStorage.setItem(STORAGE_KEYS.ELEVEN_CREDITS, JSON.stringify({ date: today, count: 0 }));
                    setCreditsUsed(0);
                }
            } else {
                await AsyncStorage.setItem(STORAGE_KEYS.ELEVEN_CREDITS, JSON.stringify({ date: today, count: 0 }));
                setCreditsUsed(0);
            }
        } catch (e) {
            console.error("Error cargando créditos", e);
        }
    };

    const incrementCredits = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const newCount = creditsUsed + 1;
            await AsyncStorage.setItem(STORAGE_KEYS.ELEVEN_CREDITS, JSON.stringify({ date: today, count: newCount }));
            setCreditsUsed(newCount);
            return newCount;
        } catch (e) {
            console.error(e);
            return creditsUsed;
        }
    };

    const handleSpeak = async () => {
        if (!text.trim()) return;

        if (isPlaying) {
            await stop();
            setIsPlaying(false);
            return;
        }

        if (creditsUsed >= MAX_DAILY_CREDITS) {
            Alert.alert(
                "Límite diario alcanzado", 
                `Has agotado tus ${MAX_DAILY_CREDITS} frases gratis del día. Intenta de nuevo mañana.`
            );
            return;
        }

        Keyboard.dismiss();
        setIsPlaying(true);
        try {
            // Pasamos true como segundo flag opcional solo para control interno
            await speakFreeText(text.trim());
            await incrementCredits();
            logEvent('free_text');
        } catch (error) {
            Alert.alert("Error", "No se pudo generar la voz.");
        } finally {
            setIsPlaying(false);
        }
    };

    const handleClear = () => {
        setText('');
        stop();
        setIsPlaying(false);
    };

    const remaining = MAX_DAILY_CREDITS - creditsUsed;

    return (
        <View style={styles.container}>
            <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe para hablar..."
                        placeholderTextColor={Colors.text.disabled}
                        value={text}
                        onChangeText={setText}
                        multiline={true}
                        maxLength={100} 
                    />
                    
                    {text.length > 0 && (
                        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={24} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.creditsText}>
                    {remaining} {remaining === 1 ? 'uso' : 'usos'} hoy
                </Text>
            </View>

            <TouchableOpacity 
                style={[
                    styles.playButton, 
                    !text.trim() && styles.playButtonDisabled,
                    isPlaying && styles.playButtonActive
                ]} 
                onPress={handleSpeak}
                disabled={!text.trim() && !isPlaying}
            >
                {isPlaying ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Ionicons name="volume-high" size={28} color="white" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: Colors.surfaceContainerLowest,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        width: '100%',
    },
    inputWrapper: {
        flex: 1,
        marginRight: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 12,
        minHeight: 50,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text.primary,
        paddingVertical: 10,
        fontWeight: '500',
    },
    clearButton: {
        padding: 4,
    },
    creditsText: {
        fontSize: 10,
        color: '#888',
        marginTop: 4,
        marginLeft: 8,
    },
    playButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primaryButton,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primaryButton,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 10,
    },
    playButtonDisabled: {
        backgroundColor: '#BDBDBD',
        shadowOpacity: 0,
        elevation: 0,
    },
    playButtonActive: {
        backgroundColor: '#FF9800',
    }
});
