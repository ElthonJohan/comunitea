/**
 * SuggestionBubbles.tsx
 *
 * Muestra 2-3 pictogramas sugeridos debajo de la SentenceStrip.
 * Las sugerencias vienen de Cooccurrences.ts (Fase 2) o del
 * historial personalizado del niño (Fase 4).
 *
 * Al tocar una burbuja se llama `onSelect`, que añade el ítem
 * a la SentenceStrip y reproduce su audio.
 */
import React, { useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, Animated,
} from 'react-native';
import { VocabularyItem } from '../constants/Vocabulary';
import { Colors } from '../constants/Colors';

interface SuggestionBubblesProps {
    suggestions: VocabularyItem[];
    onSelect: (item: VocabularyItem) => void;
}

export default function SuggestionBubbles({ suggestions, onSelect }: SuggestionBubblesProps) {
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 1400, useNativeDriver: false }),
                Animated.timing(glowAnim, { toValue: 0, duration: 1400, useNativeDriver: false }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.55],
    });

    if (suggestions.length === 0) return null;

    return (
        <View style={styles.wrapper}>
            <Text style={styles.headerLabel}>💡 Sugerencias</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {suggestions.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => onSelect(item)}
                        style={styles.bubble}
                        activeOpacity={0.72}
                    >
                        {/* Capa de brillo pulsante */}
                        <Animated.View style={[styles.glowLayer, { opacity: glowOpacity }]} />
                        <Text style={styles.emoji}>{item.emoji}</Text>
                        <Text style={styles.bubbleLabel} numberOfLines={1}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 16,
        paddingTop: 2,
        paddingBottom: 8,
    },
    headerLabel: {
        fontSize: 11,
        color: Colors.text.disabled,
        fontWeight: '700',
        marginBottom: 7,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    scroll: {
        gap: 10,
        paddingRight: 8,
    },
    bubble: {
        width: 70,
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderWidth: 1.5,
        borderColor: '#C7D7FF',
        overflow: 'hidden',
    },
    glowLayer: {
        ...StyleSheet.absoluteFill,
        backgroundColor: '#C7D7FF',
        borderRadius: 20,
    },
    emoji: {
        fontSize: 26,
        marginBottom: 5,
    },
    bubbleLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.text.primary,
        textAlign: 'center',
    },
});
