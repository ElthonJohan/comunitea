/**
 * vocabulary-manager.tsx
 * Panel parental: activar/desactivar pictogramas individuales por categoría.
 * Solo accesible desde el panel parental (modo edición activo).
 */
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SectionList,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { VOCABULARY, VocabularyItem } from '../constants/Vocabulary';
import { useAuth } from '../context/AuthContext';
import { useDisabledPictograms } from '../features/vocabulario/hooks/useDisabledPictograms';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface FlatItem {
    id: string;
    label: string;
    emoji: string;
    parentLabel?: string;
}

interface Section {
    title: string;
    emoji: string;
    data: FlatItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function flattenItems(items: VocabularyItem[], parentLabel?: string): FlatItem[] {
    const result: FlatItem[] = [];
    for (const item of items) {
        if (item.items && item.items.length > 0) {
            // Subcategoría: aplanar sus hijos con el nombre del grupo como parentLabel
            result.push(...flattenItems(item.items, item.label));
        } else {
            result.push({ id: item.id, label: item.label, emoji: item.emoji, parentLabel });
        }
    }
    return result;
}

function buildSections(level: string): Section[] {
    const categories = VOCABULARY[level] ?? VOCABULARY['BASICO'];
    return categories.map((cat) => ({
        title: cat.label,
        emoji: cat.emoji,
        data: cat.items ? flattenItems(cat.items) : [{ id: cat.id, label: cat.label, emoji: cat.emoji }],
    }));
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function VocabularyManagerScreen() {
    const router = useRouter();
    const { profile } = useAuth();
    const { isDisabled, toggle, loaded } = useDisabledPictograms();

    const level = profile?.level ?? 'BASICO';
    const sections = buildSections(level);

    const totalItems = sections.reduce((acc, s) => acc + s.data.length, 0);
    const disabledCount = sections.reduce(
        (acc, s) => acc + s.data.filter((i) => isDisabled(i.id)).length,
        0,
    );

    if (!loaded) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator style={{ flex: 1 }} size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Gestor de vocabulario</Text>
                    <Text style={styles.subtitle}>
                        {disabledCount === 0
                            ? `${totalItems} pictogramas activos`
                            : `${totalItems - disabledCount} activos · ${disabledCount} ocultos`}
                    </Text>
                </View>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section }) => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                    </View>
                )}
                renderItem={({ item }) => {
                    const off = isDisabled(item.id);
                    return (
                        <View style={[styles.row, off && styles.rowDisabled]}>
                            <Text style={styles.itemEmoji}>{item.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.itemLabel, off && styles.itemLabelOff]}>
                                    {item.label}
                                </Text>
                                {item.parentLabel && (
                                    <Text style={styles.itemParent}>{item.parentLabel}</Text>
                                )}
                            </View>
                            <Switch
                                value={!off}
                                onValueChange={() => toggle(item.id)}
                                trackColor={{ false: Colors.border, true: Colors.primary }}
                                thumbColor={Colors.white}
                            />
                        </View>
                    );
                }}
                ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
        </SafeAreaView>
    );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
    container:    { flex: 1, backgroundColor: Colors.surface },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn:      { padding: 4 },
    title:        { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
    subtitle:     { fontSize: 13, color: Colors.text.secondary, marginTop: 2 },
    list:         { paddingBottom: 40 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.surface,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 8,
    },
    sectionEmoji: { fontSize: 20 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: Colors.surfaceContainerLowest,
        gap: 14,
    },
    rowDisabled:  { opacity: 0.45 },
    itemEmoji:    { fontSize: 24, width: 32, textAlign: 'center' },
    itemLabel:    { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
    itemLabelOff: { textDecorationLine: 'line-through', color: Colors.text.secondary },
    itemParent:   { fontSize: 12, color: Colors.text.secondary, marginTop: 1 },
    divider:      { height: 1, backgroundColor: Colors.border, marginLeft: 70 },
});
