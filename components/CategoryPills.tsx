import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { getCategoryColor } from '../constants/Colors';
import type { AppColorPalette } from '../constants/Colors';
import { useThemeColors } from '../context/AppThemeContext';
import { Radii } from '../constants/Theme';
import { Fonts } from '../constants/Typography';
import { VocabularyItem } from '../constants/Vocabulary';

interface CategoryPillsProps {
    categories: VocabularyItem[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

export default function CategoryPills({ categories, selectedId, onSelect }: CategoryPillsProps) {
    const Colors = useThemeColors();
    const styles = useMemo(() => createCategoryPillsStyles(Colors), [Colors]);
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* "Todo" chip */}
                <TouchableOpacity
                    style={[
                        styles.chip,
                        selectedId === null
                            ? { backgroundColor: Colors.primary }
                            : { backgroundColor: Colors.surfaceContainerLow },
                    ]}
                    onPress={() => onSelect(null)}
                    activeOpacity={0.75}
                >
                    <Text style={[
                        styles.chipText,
                        { color: selectedId === null ? Colors.onPrimary : Colors.primary },
                    ]}>
                        Todo
                    </Text>
                </TouchableOpacity>

                {/* Chips de categoría — color semántico (sólo items con sub-ítems) */}
                {categories.filter(cat => cat.items && cat.items.length > 0).map((cat) => {
                    const isActive = selectedId === cat.id;
                    const catColor = getCategoryColor(cat.id, Colors);
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.chip,
                                isActive
                                    ? { backgroundColor: catColor }
                                    : { backgroundColor: Colors.surfaceContainerLow },
                            ]}
                            onPress={() => onSelect(cat.id)}
                            activeOpacity={0.75}
                        >
                            <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                            <Text style={[
                                styles.chipText,
                                { color: isActive ? Colors.onPrimary : catColor },
                            ]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

function createCategoryPillsStyles(Colors: AppColorPalette) {
    return StyleSheet.create({
    container: {
        height: 52,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 12,
        alignItems: 'center',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: Radii.full,
        minHeight: 40,
    },
    chipEmoji: {
        fontSize: 15,
        marginRight: 5,
    },
    chipText: {
        fontSize: 13,
        fontFamily: Fonts.bodyBold,
    },
});
}

