import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    SectionList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { hrefActivityRun } from '../types/routes';
import { useState, useEffect } from 'react';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { VOCABULARY, VocabularyItem } from '../constants/Vocabulary';
import {
    useActivities,
    GuidedActivity,
    ActivityStep,
    ActivityType,
} from '../features/vocabulario/hooks/useActivities';

// ---------------------------------------------------------------------------
// Tipos y constantes
// ---------------------------------------------------------------------------
type Mode = 'list' | 'create';

const TYPE_LABELS: Record<ActivityType, string> = {
    rutina_visual:        '📋 Rutina Visual',
    practica_vocabulario: '🔤 Práctica de vocabulario',
    pregunta:             '❓ Pregunta',
};

// ---------------------------------------------------------------------------
// Utilitarios de vocabulario
// ---------------------------------------------------------------------------
function collectLeaves(items: VocabularyItem[]): VocabularyItem[] {
    const result: VocabularyItem[] = [];
    for (const item of items) {
        if (item.items && item.items.length > 0) {
            result.push(...collectLeaves(item.items));
        } else {
            result.push(item);
        }
    }
    return result;
}

function buildSections(
    vocab: VocabularyItem[],
): { title: string; data: VocabularyItem[] }[] {
    return vocab
        .map((cat) => ({ title: cat.label, data: collectLeaves(cat.items ?? []) }))
        .filter((s) => s.data.length > 0);
}

// ---------------------------------------------------------------------------
// Pantalla principal
// ---------------------------------------------------------------------------
export default function ActivityEditorScreen() {
    const router  = useRouter();
    const { profile } = useAuth();
    const { activities, loading, loadActivities, createActivity, deleteActivity } = useActivities();

    // Form state
    const [mode,       setMode]       = useState<Mode>('list');
    const [name,       setName]       = useState('');
    const [type,       setType]       = useState<ActivityType>('rutina_visual');
    const [steps,      setSteps]      = useState<ActivityStep[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [saving,     setSaving]     = useState(false);

    useEffect(() => { loadActivities(); }, [loadActivities]);

    const level        = profile?.level ?? 'BASICO';
    const vocabSections = buildSections(VOCABULARY[level] ?? []);

    // ---------------------------------------------------------------------------
    // Handlers — crear
    // ---------------------------------------------------------------------------
    const resetForm = () => {
        setName(''); setType('rutina_visual'); setSteps([]);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Falta el nombre', 'Escribe un nombre para la actividad.');
            return;
        }
        if (steps.length === 0) {
            Alert.alert('Sin pasos', 'Agrega al menos un pictograma.');
            return;
        }
        setSaving(true);
        await createActivity(name.trim(), type, steps);
        setSaving(false);
        setMode('list');
        resetForm();
    };

    const handleTypeChange = () => {
        const types: ActivityType[] = ['rutina_visual', 'practica_vocabulario', 'pregunta'];
        Alert.alert('Tipo de actividad', 'Elige el tipo', [
            ...types.map((t) => ({ text: TYPE_LABELS[t], onPress: () => setType(t) })),
            { text: 'Cancelar', style: 'cancel' as const },
        ]);
    };

    const addStep = (item: VocabularyItem) => {
        setSteps((prev) => [...prev, { id: item.id, label: item.label, emoji: item.emoji }]);
        setShowPicker(false);
    };

    const removeStep = (index: number) => {
        setSteps((prev) => prev.filter((_, i) => i !== index));
    };

    const cancelCreate = () => { setMode('list'); resetForm(); };

    // ---------------------------------------------------------------------------
    // Handlers — lista
    // ---------------------------------------------------------------------------
    const handleDelete = (activity: GuidedActivity) => {
        Alert.alert(
            'Eliminar actividad',
            `¿Eliminar "${activity.name}"? Esta acción no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => deleteActivity(activity.id) },
            ],
        );
    };

    const handlePlay = (activity: GuidedActivity) => {
        router.push(hrefActivityRun(activity.id));
    };

    // ---------------------------------------------------------------------------
    // Vista — CREATE
    // ---------------------------------------------------------------------------
    if (mode === 'create') {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={cancelCreate} style={styles.headerBtn}>
                        <Ionicons name="close" size={22} color={Colors.text.secondary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nueva actividad</Text>
                    <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={saving}>
                        {saving
                            ? <ActivityIndicator size="small" color={Colors.primary} />
                            : <Text style={styles.saveText}>Guardar</Text>}
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={steps}
                    keyExtractor={(_, i) => String(i)}
                    contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
                    ListHeaderComponent={
                        <>
                            <TextInput
                                style={styles.nameInput}
                                placeholder="Nombre de la actividad"
                                placeholderTextColor={Colors.text.disabled}
                                value={name}
                                onChangeText={setName}
                                maxLength={60}
                            />
                            <TouchableOpacity style={styles.typeBtn} onPress={handleTypeChange}>
                                <Text style={styles.typeLabel}>{TYPE_LABELS[type]}</Text>
                                <Ionicons name="chevron-down" size={18} color={Colors.text.secondary} />
                            </TouchableOpacity>
                            <Text style={styles.sectionLabel}>
                                PASOS{steps.length > 0 ? ` (${steps.length})` : ''}
                            </Text>
                        </>
                    }
                    renderItem={({ item, index }) => (
                        <View style={styles.stepRow}>
                            <Text style={styles.stepNum}>{index + 1}</Text>
                            <Text style={styles.stepEmoji}>{item.emoji}</Text>
                            <Text style={styles.stepLabel} numberOfLines={1}>{item.label}</Text>
                            <TouchableOpacity onPress={() => removeStep(index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close-circle" size={22} color={Colors.danger} />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyStepsText}>
                            Agrega pictogramas para construir la actividad
                        </Text>
                    }
                    ListFooterComponent={
                        <TouchableOpacity style={styles.addStepBtn} onPress={() => setShowPicker(true)}>
                            <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
                            <Text style={styles.addStepText}>Agregar pictograma</Text>
                        </TouchableOpacity>
                    }
                />

                {/* Step picker modal */}
                <Modal
                    visible={showPicker}
                    animationType="slide"
                    onRequestClose={() => setShowPicker(false)}
                >
                    <SafeAreaView style={styles.container}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.headerBtn}>
                                <Ionicons name="close" size={22} color={Colors.text.secondary} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Selecciona un pictograma</Text>
                            <View style={styles.headerBtn} />
                        </View>
                        <SectionList
                            sections={vocabSections}
                            keyExtractor={(item) => item.id}
                            renderSectionHeader={({ section }) => (
                                <Text style={styles.pickerSectionHeader}>{section.title}</Text>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.pickerItem}
                                    onPress={() => addStep(item)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.pickerEmoji}>{item.emoji}</Text>
                                    <Text style={styles.pickerItemLabel}>{item.label}</Text>
                                    <Ionicons name="add" size={18} color={Colors.primary} />
                                </TouchableOpacity>
                            )}
                            stickySectionHeadersEnabled
                        />
                    </SafeAreaView>
                </Modal>
            </SafeAreaView>
        );
    }

    // ---------------------------------------------------------------------------
    // Vista — LIST (default)
    // ---------------------------------------------------------------------------
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.text.secondary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Actividades guiadas</Text>
                <TouchableOpacity onPress={() => setMode('create')} style={styles.headerBtn}>
                    <Ionicons name="add" size={26} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 48 }} />
            ) : activities.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="clipboard-outline" size={64} color={Colors.text.disabled} />
                    <Text style={styles.emptyStateTitle}>No hay actividades</Text>
                    <Text style={styles.emptyStateSub}>
                        Crea la primera con el botón + de arriba
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={activities}
                    keyExtractor={(a) => a.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <View style={styles.activityCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.activityName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.activityMeta}>
                                    {TYPE_LABELS[item.type]} · {item.steps.length} paso{item.steps.length !== 1 ? 's' : ''}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.playBtn}
                                onPress={() => handlePlay(item)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="play" size={20} color={Colors.white} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleDelete(item)}
                                style={styles.deleteBtn}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="trash-outline" size={20} color={Colors.text.disabled} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
    container:    { flex: 1, backgroundColor: Colors.surface },

    // Header compartido
    header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: Colors.surfaceContainerLowest, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
    headerBtn:    { width: 44, alignItems: 'center' },
    headerTitle:  { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: Colors.text.primary },
    saveText:     { color: Colors.primary, fontSize: 16, fontWeight: '600' },

    // Create form
    nameInput:    { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12, color: Colors.text.primary },
    typeBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
    typeLabel:    { flex: 1, fontSize: 15, color: Colors.text.primary },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.secondary, marginBottom: 8, letterSpacing: 0.6 },
    stepRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 10, padding: 12, marginBottom: 8, gap: 10, shadowColor: Colors.onSurface, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
    stepNum:      { fontSize: 13, fontWeight: '700', color: Colors.text.disabled, width: 20, textAlign: 'center' },
    stepEmoji:    { fontSize: 26 },
    stepLabel:    { flex: 1, fontSize: 15, color: Colors.text.primary, fontWeight: '500' },
    addStepBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 4, marginTop: 4 },
    addStepText:  { fontSize: 16, color: Colors.primary, fontWeight: '600' },
    emptyStepsText: { fontSize: 14, color: Colors.text.disabled, textAlign: 'center', paddingVertical: 16, fontStyle: 'italic' },

    // Picker modal
    pickerSectionHeader: { fontSize: 12, fontWeight: '700', color: Colors.text.secondary, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface, letterSpacing: 0.5 },
    pickerItem:   { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: Colors.surfaceContainerLowest, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
    pickerEmoji:  { fontSize: 28 },
    pickerItemLabel: { flex: 1, fontSize: 16, color: Colors.text.primary, fontWeight: '500' },

    // List view
    emptyState:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
    emptyStateTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.secondary },
    emptyStateSub:   { fontSize: 14, color: Colors.text.disabled, textAlign: 'center', lineHeight: 20 },
    activityCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: Colors.onSurface, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, gap: 10 },
    activityName:    { fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 3 },
    activityMeta:    { fontSize: 13, color: Colors.text.secondary },
    playBtn:         { backgroundColor: Colors.primary, borderRadius: 10, padding: 10 },
    deleteBtn:       { paddingLeft: 4 },
});
