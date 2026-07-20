import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { PICTOGRAM_ASSETS } from '../../constants/PictogramAssetCatalog';
import { Colors } from '../../constants/Colors';
import { Radii, ShadowAmbientLight } from '../../constants/Theme';
import { Fonts } from '../../constants/Typography';
import { VOCABULARY, VocabularyItem, Pictogram, findItemById } from '../../constants/Vocabulary';
import { useSpeech } from '../../features/vocabulario/hooks/useSpeech';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SentenceStrip from '../../components/SentenceStrip';
import SuggestionBubbles from '../../components/SuggestionBubbles';
import { useSentence } from '../../lib/hooks/useSentence';
import { useStats } from '../../features/perfil/hooks/useStats';
import { useMagicExpand } from '../../features/vocabulario/hooks/useMagicExpand';
import { useMemo } from 'react';
import { usePictogramHistory } from '../../features/vocabulario/hooks/usePictogramHistory';
import { useAIAdaptation } from '../../features/vocabulario/hooks/useAIAdaptation';

export default function CategoryScreen() {
    const params = useLocalSearchParams<{ id: string; level: string }>();
    const categoryId = Array.isArray(params.id) ? params.id[0] : params.id;
    const levelParam = Array.isArray(params.level) ? params.level[0] : params.level;
    const router = useRouter();
    const { speak, speakSentence } = useSpeech();
    const { sentence, addToSentence, removeFromSentence, clearSentence } = useSentence();

    const currentLevel = levelParam || 'BASICO';
    const levelData = VOCABULARY[currentLevel] || VOCABULARY.BASICO;
    const { logEvent, logSentence } = useStats();
    const { handleMagicExpand, isExpanding } = useMagicExpand();
    const { getSuggestions } = usePictogramHistory();
    const { getOrderedItems } = useAIAdaptation();
    const suggestions = useMemo(() => {
        if (sentence.length === 0) return [];
        const lastId = sentence[sentence.length - 1].id;
        const existingIds = new Set(sentence.map(s => s.id));
        return getSuggestions(lastId, existingIds)
            .map(id => findItemById(levelData, id))
            .filter((item): item is VocabularyItem => item !== undefined);
    }, [sentence, levelData, getSuggestions]);

    const handleSuggestionSelect = (item: VocabularyItem) => {
        speak(item.speechText || item.label, item.id);
        addToSentence(item);
        logEvent('pictogram_tap', { categoryId });
    };

    const handleItemPress = (item: VocabularyItem) => {
        // If item has sub-items, navigate deeper? 
        // For Basic level, we have Category -> SubItems (Final).
        // If later we have more depth, we'd recurse. For now, assume these are final.
        // Actually, some items might need to navigate?
        // The spec says: "Solo los ítems finales ... deben disparar el audio"
        // In our Vocabulary.ts, 'items' inside a category are mostly final, OR groups like in COMIDA -> Frutas -> Manzana.

        // Siempre reproducir el audio del pictograma, sea sub-categoría o ítem final
        speak(item.speechText || item.label, item.id);

        if (item.items && item.items.length > 0) {
            // Es una sub-categoría (ej. Frutas dentro de Comida)
            router.push(`/category/${item.id}?level=${currentLevel}`);
        } else {
            // Es un ítem final
            addToSentence(item);
            logEvent('pictogram_tap', { categoryId });
        }
    };

    // We need to be able to find sub-categories if we navigated here.
    // Let's rewrite the finder logic to be recursive from the Level root.
    const findCategoryById = (items: VocabularyItem[], targetId: string): VocabularyItem | undefined => {
        for (const item of items) {
            if (item.id === targetId) return item;
            if (item.items) {
                const found = findCategoryById(item.items, targetId);
                if (found) return found;
            }
        }
        return undefined;
    };

    const activeCategory = categoryId ? findCategoryById(levelData, categoryId) : undefined;


    const playSentence = () => {
        const pictograms: Pictogram[] = sentence.map(item => ({
            id: item.id,
            text: item.speechText || item.label,
        }));
        speakSentence(pictograms);
        logEvent('sentence_play', { sentenceLength: sentence.length });
        logSentence(sentence.map(s => s.id));
    };

    const orderedItems = useMemo(() => {
        return getOrderedItems(activeCategory?.items || []);
    }, [activeCategory?.items, getOrderedItems]);

    if (!categoryId || !activeCategory) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: true, title: 'No encontrado' }} />
                <Text style={styles.emptyText}>
                    {!categoryId ? 'Falta el identificador de categoría.' : 'Categoría no encontrada.'}
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <SentenceStrip
                items={sentence}
                onRemoveItem={removeFromSentence}
                onClear={clearSentence}
                onPlay={playSentence}
                onMagicExpand={handleMagicExpand}
                isExpanding={isExpanding}
            />

            <SuggestionBubbles suggestions={suggestions} onSelect={handleSuggestionSelect} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={30} color={Colors.primaryButton} />
                </TouchableOpacity>
                <Text style={styles.title}>{activeCategory.label}</Text>
                <Text style={styles.emoji}>{activeCategory.emoji}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.gridContainer}>
                {orderedItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.card, { backgroundColor: item.backgroundColor || Colors.surfaceContainerLowest }]}
                        onPress={() => handleItemPress(item)}
                    >
                        {PICTOGRAM_ASSETS[item.id] ? (
                            <Image
                                source={PICTOGRAM_ASSETS[item.id]}
                                style={styles.cardImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <Text style={styles.cardEmoji}>{item.emoji}</Text>
                        )}
                        <Text style={styles.cardLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}

                {orderedItems.length === 0 && (
                    <Text style={styles.emptyText}>No hay elementos aquí todavía.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.surfaceContainerLow,
        ...ShadowAmbientLight,
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    title: {
        fontSize: 24,
        fontFamily: Fonts.displayBold,
        color: Colors.text.primary,
        flex: 1,
    },
    emoji: {
        fontSize: 30,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 10,
        gap: 15,
    },
    card: {
        width: '45%',
        aspectRatio: 1,
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radii.lg,
        justifyContent: 'center',
        alignItems: 'center',
        ...ShadowAmbientLight,
        padding: 10,
    },
    cardEmoji: {
        fontSize: 50,
        marginBottom: 10,
    },
    cardImage: {
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    cardLabel: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
        textAlign: 'center',
    },
    emptyText: {
        marginTop: 50,
        fontSize: 18,
        color: Colors.text.secondary,
        textAlign: 'center',
        width: '100%',
    }
});
