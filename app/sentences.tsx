import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSentenceHistory } from '../features/vocabulario/hooks/useSentenceHistory';
import { useAuth } from '../context/AuthContext';
import { getVocabularyByLevel, findItemById } from '../constants/Vocabulary';
import { useSpeech } from '../features/vocabulario/hooks/useSpeech';

function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
        return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function SentencesScreen() {
    const router = useRouter();
    const { profile } = useAuth();
    const { entries, loading, error, refresh } = useSentenceHistory();
    const { speakSentence } = useSpeech();
    const vocabulary = useMemo(
        () => getVocabularyByLevel(profile?.level ?? 'BASICO'),
        [profile?.level],
    );

    const resolveLabels = (pictogramIds: string[]): string => {
        return pictogramIds
            .map((id) => {
                const item = findItemById(vocabulary, id);
                return item ? (item.speechText || item.label) : id;
            })
            .join(' ');
    };

    const handlePlay = (pictogramIds: string[]) => {
        const pictograms = pictogramIds
            .map((id) => {
                const item = findItemById(vocabulary, id);
                return item ? { id: item.id, text: item.speechText || item.label } : null;
            })
            .filter((p): p is { id: string; text: string } => p !== null);
        if (pictograms.length) speakSentence(pictograms);
    };

    if (loading && entries.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Mis oraciones</Text>
                </View>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Mis oraciones</Text>
                <TouchableOpacity onPress={refresh} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {error ? (
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : entries.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>Aún no hay oraciones guardadas.</Text>
                    <Text style={styles.emptySubtext}>Las frases que reproduzcas se guardarán aquí.</Text>
                </View>
            ) : (
                <FlatList
                    data={entries}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => handlePlay(item.pictogram_ids)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.rowLabel} numberOfLines={2}>
                                {resolveLabels(item.pictogram_ids)}
                            </Text>
                            <View style={styles.rowRight}>
                                <Text style={styles.rowDate}>{formatDate(item.created_at)}</Text>
                                <Ionicons name="volume-high" size={22} color={Colors.primary} />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.surfaceContainerLowest,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    refreshButton: {
        padding: 8,
    },
    list: {
        padding: 16,
        paddingBottom: 32,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surfaceContainerLowest,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    rowLabel: {
        flex: 1,
        fontSize: 16,
        color: Colors.text.primary,
        marginRight: 12,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rowDate: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        color: Colors.danger,
        fontSize: 16,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.text.disabled,
        textAlign: 'center',
    },
});
