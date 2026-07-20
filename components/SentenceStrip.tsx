
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/Colors";
import { Radii, ShadowAmbientLight, outlineBorder } from "../constants/Theme";
import { Fonts } from "../constants/Typography";
import { Ionicons } from "@expo/vector-icons";
import { VocabularyItem } from "../constants/Vocabulary";
import { useEffect, useRef } from "react";

const EMPTY_SLOTS = 4;

interface SentenceStripProps {
    items: VocabularyItem[];
    onRemoveItem: (index: number) => void;
    onClear: () => void;
    onPlay: () => void;
    onMagicExpand?: () => void;
    isExpanding?: boolean;
}

export default function SentenceStrip({ items, onRemoveItem, onClear, onPlay, onMagicExpand, isExpanding }: SentenceStripProps) {
    const isEmpty = items.length === 0;
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isExpanding) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
                    Animated.timing(pulseAnim, { toValue: 0, duration: 700, useNativeDriver: false }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(0);
        }
    }, [isExpanding]);

    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (items.length > 0) {
            setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [items.length]);

    return (
        <View style={styles.wrapper}>
            {/* Strip principal */}
            <View style={styles.stripRow}>
                {/* Zona de pictos + slots vacíos */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    contentContainerStyle={styles.scrollContent}
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollArea}
                >
                    {/* Ítems seleccionados */}
                    {items.map((item, index) => (
                        <TouchableOpacity
                            key={`${item.id}-${index}`}
                            style={[
                                styles.itemSlot,
                                { backgroundColor: Colors.surfaceContainerHigh },
                            ]}
                            onPress={() => onRemoveItem(index)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.itemEmoji}>{item.emoji}</Text>
                        </TouchableOpacity>
                    ))}

                    {/* Slots vacíos cuando hay menos de EMPTY_SLOTS */}
                    {items.length < EMPTY_SLOTS && Array.from({ length: EMPTY_SLOTS - items.length }).map((_, i) => (
                        <View key={`slot-${i}`} style={styles.emptySlot}>
                            <Text style={styles.slotPlus}>+</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Acciones derecha */}
                <View style={styles.actionsColumn}>
                    {/* Botón HABLAR — CTA principal */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.hablarBtnOuter,
                            isEmpty && styles.hablarBtnDisabled,
                            pressed && !isEmpty && styles.hablarBtnPressed,
                        ]}
                        onPress={onPlay}
                        disabled={isEmpty}
                    >
                        <LinearGradient
                            colors={[Colors.primary, Colors.primaryContainer]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.hablarGradient}
                        >
                            <Ionicons name="volume-high" size={18} color={Colors.onPrimary} />
                            <Text style={styles.hablarText}>HABLAR</Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Botones secundarios */}
                    <View style={styles.secondaryRow}>
                        {onMagicExpand && (
                            <TouchableOpacity
                                style={[styles.iconBtn, isExpanding && styles.iconBtnDisabled]}
                                onPress={onMagicExpand}
                                disabled={isExpanding || isEmpty}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.magicIcon}>✨</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.iconBtn, styles.iconBtnDanger]}
                            onPress={onClear}
                            disabled={isEmpty}
                            activeOpacity={0.75}
                        >
                            <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Guía textual debajo */}
            <Text style={styles.hint}>Toca los pictogramas para construir tu frase</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 4,
        backgroundColor: Colors.surface,
        zIndex: 10,
    },
    stripRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: Radii.lg,
        paddingHorizontal: 10,
        paddingVertical: 10,
        ...ShadowAmbientLight,
        minHeight: 80,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        alignItems: "center",
        gap: 8,
        paddingRight: 8,
    },
    // Ítems seleccionados
    itemSlot: {
        width: 56,
        height: 56,
        borderRadius: Radii.md,
        justifyContent: "center",
        alignItems: "center",
    },
    itemEmoji: {
        fontSize: 28,
    },
    // Slots vacíos (dashed border)
    emptySlot: {
        width: 52,
        height: 52,
        borderRadius: Radii.md,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.surfaceContainerHighest,
        ...outlineBorder(1),
    },
    slotPlus: {
        fontSize: 20,
        color: Colors.tertiary,
        fontFamily: Fonts.bodyBold,
    },
    // Columna de acciones derecha
    actionsColumn: {
        marginLeft: 10,
        alignItems: "center",
        gap: 6,
    },
    hablarBtnOuter: {
        borderRadius: Radii.full,
        overflow: "hidden",
        ...ShadowAmbientLight,
    },
    hablarBtnPressed: {
        transform: [{ scale: 0.98 }],
    },
    hablarGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 6,
    },
    hablarBtnDisabled: {
        opacity: 0.4,
    },
    hablarText: {
        color: Colors.onPrimary,
        fontSize: 13,
        fontFamily: Fonts.bodyBold,
        letterSpacing: 0.8,
    },
    secondaryRow: {
        flexDirection: "row",
        gap: 6,
    },
    iconBtn: {
        width: 32,
        height: 32,
        borderRadius: Radii.sm,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.surfaceContainerHighest,
    },
    iconBtnDanger: {
        backgroundColor: Colors.danger + '18',
    },
    iconBtnDisabled: {
        opacity: 0.4,
    },
    magicIcon: {
        fontSize: 16,
    },
    hint: {
        fontSize: 11,
        fontFamily: Fonts.bodyMedium,
        color: Colors.text.disabled,
        textAlign: "center",
        marginTop: 4,
    },
});
