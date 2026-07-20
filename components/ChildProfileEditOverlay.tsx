import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Radii, Space, ShadowAmbientLight } from '../constants/Theme';
import { Fonts } from '../constants/Typography';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import {
    useChildProfile,
    type CommunicationLevel,
    type Gender,
} from '../context/ChildProfileContext';
import { useAuth } from '../context/AuthContext';
import { useImagePicker } from '../lib/hooks/useImagePicker';
import { COMM_TO_VOCAB } from '../lib/communicationVocabMap';
import { PREFERRED_ACTIVITIES } from '../features/tablero/data/preferredActivitiesCatalog';
import { formatImportantPersonLine, parseImportantPersonLine } from '../features/tablero/buildMergedBoard';

const COMM_OPTIONS: { id: CommunicationLevel; label: string; emoji: string }[] = [
    { id: 'sin_lenguaje',      label: 'Todavía no usa palabras', emoji: '🔇' },
    { id: 'palabras_aisladas', label: 'Palabras sueltas',       emoji: '💬' },
    { id: 'frases_simples',    label: 'Frases cortas',          emoji: '🗣️' },
    { id: 'frases_complejas',  label: 'Frases más largas',      emoji: '📢' },
];

const GENDERS: { id: Gender; label: string }[] = [
    { id: 'masculino',         label: 'Masculino' },
    { id: 'femenino',          label: 'Femenino' },
    { id: 'otro',              label: 'Otro' },
    { id: 'prefiero_no_decir', label: 'Prefiero no decir' },
];

type Props = {
    visible: boolean;
    onClose: () => void;
    onSaved?: () => void;
};

export default function ChildProfileEditOverlay({ visible, onClose, onSaved }: Props) {
    const { saveChildProfile, refreshChildProfile } = useChildProfile();
    const { updateLevel } = useAuth();
    const { pickAndUploadImage, uploading } = useImagePicker();

    const [name, setName] = useState('');
    const [gender, setGender] = useState<Gender | null>(null);
    const [communicationLevel, setCommunicationLevel] = useState<CommunicationLevel>('sin_lenguaje');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [preferredActivities, setPreferredActivities] = useState<string[]>([]);
    const [importantPeople, setImportantPeople] = useState<string[]>([]);
    const [newActivityName, setNewActivityName] = useState('');
    const [newPersonName, setNewPersonName] = useState('');
    const [newPersonEmoji, setNewPersonEmoji] = useState('👤');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (visible) {
            setName('');
            setGender(null);
            setCommunicationLevel('sin_lenguaje');
            setAvatarUrl(null);
            setPreferredActivities([]);
            setImportantPeople([]);
            setNewActivityName('');
            setNewPersonName('');
            setNewPersonEmoji('👤');
        }
    }, [visible]);

    const pickPhoto = useCallback(async () => {
        Alert.alert('Foto del niño', 'Elegí el origen', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Cámara',
                onPress: async () => {
                    const url = await pickAndUploadImage(true);
                    if (url) setAvatarUrl(url);
                },
            },
            {
                text: 'Galería',
                onPress: async () => {
                    const url = await pickAndUploadImage(false);
                    if (url) setAvatarUrl(url);
                },
            },
        ]);
    }, [pickAndUploadImage]);

    const handleSave = async () => {
        const trimmed = name.trim();
        if (trimmed.length < 2) {
            Alert.alert('Nombre', 'Ingresá al menos 2 letras para el nombre del niño o la niña.');
            return;
        }
        setSaving(true);
        try {
            await saveChildProfile({
                name: trimmed,
                birth_date: null,
                gender,
                avatar_url: avatarUrl,
                diagnosis: null,
                communication_level: communicationLevel,
                environments: [],
                preferred_activities: preferredActivities,
                important_people: importantPeople,
                sound_sensitive: false,
                onboarding_completed: true,
            });
            await updateLevel(COMM_TO_VOCAB[communicationLevel]);
            await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
            await AsyncStorage.setItem(
                STORAGE_KEYS.PREFERRED_ACTIVITIES,
                JSON.stringify(preferredActivities),
            );
            await AsyncStorage.setItem(
                STORAGE_KEYS.IMPORTANT_PEOPLE,
                JSON.stringify(importantPeople),
            );
            await refreshChildProfile();
            onSaved?.();
            onClose();
        } catch {
            Alert.alert('Error', 'No se pudo guardar. Revisá tu conexión y que la base de datos esté actualizada (migración important_people).');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.headerRow}>
                        <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                            <Ionicons name="close" size={26} color={Colors.text.primary} />
                        </Pressable>
                        <Text style={styles.headerTitle}>Perfil del niño</Text>
                        <View style={{ width: 38 }} />
                    </View>
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.lead}>
                            Completá los datos que se usan en el tablero AAC: nombre, foto, comunicación, gustos y personas importantes.
                        </Text>

                        <Text style={styles.label}>Foto (opcional)</Text>
                        <TouchableOpacity style={styles.avatarWrap} onPress={pickPhoto} disabled={uploading || saving}>
                            {uploading ? (
                                <ActivityIndicator color={Colors.primary} />
                            ) : avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                            ) : (
                                <View style={styles.avatarPh}>
                                    <Ionicons name="camera" size={32} color={Colors.text.secondary} />
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Nombre del niño o la niña"
                            placeholderTextColor={Colors.text.disabled}
                            autoCapitalize="words"
                            maxLength={48}
                        />

                        <Text style={styles.label}>Género (opcional)</Text>
                        <View style={styles.chipRow}>
                            {GENDERS.map(({ id, label }) => {
                                const on = gender === id;
                                return (
                                    <TouchableOpacity
                                        key={id}
                                        style={[styles.smallChip, on && styles.smallChipOn]}
                                        onPress={() => setGender(id)}
                                    >
                                        <Text style={[styles.smallChipTxt, on && styles.smallChipTxtOn]}>{label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={styles.label}>¿Cómo se comunica?</Text>
                        {COMM_OPTIONS.map(({ id, label, emoji }) => {
                            const on = communicationLevel === id;
                            return (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.commCard, on && styles.commCardOn]}
                                    onPress={() => setCommunicationLevel(id)}
                                >
                                    <Text style={styles.commEmoji}>{emoji}</Text>
                                    <Text style={[styles.commLabel, on && styles.commLabelOn]}>{label}</Text>
                                    {on ? <Ionicons name="checkmark-circle" size={22} color={Colors.primary} /> : null}
                                </TouchableOpacity>
                            );
                        })}

                        <Text style={styles.label}>¿Qué le gusta hacer?</Text>
                        <Text style={styles.hint}>Tocá opciones y/o agregá actividades libres.</Text>
                        <View style={styles.actGrid}>
                            {PREFERRED_ACTIVITIES.map(({ id, label, emoji }) => {
                                const selected = preferredActivities.includes(id);
                                return (
                                    <TouchableOpacity
                                        key={id}
                                        style={[styles.actChip, selected && styles.actChipOn]}
                                        onPress={() =>
                                            setPreferredActivities((prev) =>
                                                selected ? prev.filter((a) => a !== id) : [...prev, id],
                                            )}
                                    >
                                        <Text style={styles.actEmoji}>{emoji}</Text>
                                        <Text style={[styles.actTxt, selected && styles.actTxtOn]} numberOfLines={2}>
                                            {label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={styles.addRow}>
                            <TextInput
                                style={styles.addInput}
                                value={newActivityName}
                                onChangeText={setNewActivityName}
                                placeholder="Otra actividad…"
                                placeholderTextColor={Colors.text.disabled}
                                maxLength={40}
                            />
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => {
                                    const t = newActivityName.trim();
                                    const token = `custom:${t}`;
                                    if (t && !preferredActivities.includes(token)) {
                                        setPreferredActivities((p) => [...p, token]);
                                    }
                                    setNewActivityName('');
                                }}
                            >
                                <Text style={styles.addBtnTxt}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.tagWrap}>
                            {preferredActivities
                                .filter((a) => a.startsWith('custom:'))
                                .map((token) => (
                                    <TouchableOpacity
                                        key={token}
                                        style={styles.tag}
                                        onPress={() =>
                                            setPreferredActivities((p) => p.filter((a) => a !== token))
                                        }
                                    >
                                        <Text style={styles.tagTxt}>✨ {token.slice(8)} ✕</Text>
                                    </TouchableOpacity>
                                ))}
                        </View>

                        <Text style={styles.label}>Personas importantes</Text>
                        <Text style={styles.hint}>
                            Emoji y nombre. Si agregás al menos una, en el tablero reemplazan a los ejemplos fijos (Mamá, Papá…).
                        </Text>
                        <View style={styles.addRow}>
                            <TextInput
                                style={styles.emojiInput}
                                value={newPersonEmoji}
                                onChangeText={(t) => setNewPersonEmoji(t.trim().slice(0, 8) || '👤')}
                                placeholder="👤"
                                maxLength={8}
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={styles.addInput}
                                value={newPersonName}
                                onChangeText={setNewPersonName}
                                placeholder="Nombre…"
                                placeholderTextColor={Colors.text.disabled}
                                maxLength={30}
                            />
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => {
                                    const t = newPersonName.trim();
                                    if (!t) return;
                                    const dup = importantPeople.some(
                                        (line) => parseImportantPersonLine(line).name === t,
                                    );
                                    if (!dup) {
                                        setImportantPeople((p) => [...p, formatImportantPersonLine(newPersonEmoji, t)]);
                                    }
                                    setNewPersonName('');
                                }}
                            >
                                <Text style={styles.addBtnTxt}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.tagWrap}>
                            {importantPeople.map((line) => {
                                const { emoji, name } = parseImportantPersonLine(line);
                                return (
                                    <TouchableOpacity
                                        key={line}
                                        style={styles.tag}
                                        onPress={() => setImportantPeople((list) => list.filter((x) => x !== line))}
                                    >
                                        <Text style={styles.tagTxt}>{emoji} {name} ✕</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.saveBtn, (saving || name.trim().length < 2) && styles.saveBtnOff]}
                            onPress={() => void handleSave()}
                            disabled={saving || name.trim().length < 2}
                        >
                            {saving ? (
                                <ActivityIndicator color={Colors.onPrimary} />
                            ) : (
                                <Text style={styles.saveBtnTxt}>Guardar perfil</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.surface },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    closeBtn: { padding: 8 },
    headerTitle: { fontSize: 17, fontFamily: Fonts.bodyBold, color: Colors.text.primary },
    scroll: { padding: 20, paddingBottom: 120 },
    lead: {
        fontSize: 14,
        fontFamily: Fonts.body,
        color: Colors.text.secondary,
        marginBottom: 20,
        lineHeight: 20,
    },
    label: {
        fontSize: 12,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.secondary,
        marginBottom: 8,
        marginTop: 4,
    },
    hint: {
        fontSize: 12,
        fontFamily: Fonts.body,
        color: Colors.text.disabled,
        marginBottom: 10,
    },
    avatarWrap: {
        alignSelf: 'center',
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: Colors.surfaceContainerHigh,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImg: { width: 100, height: 100 },
    avatarPh: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    input: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radii.md,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: 16,
        fontFamily: Fonts.body,
        color: Colors.text.primary,
        marginBottom: 8,
        backgroundColor: Colors.surfaceContainerLowest,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    smallChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: Radii.md,
        backgroundColor: Colors.surfaceContainerHigh,
    },
    smallChipOn: { backgroundColor: Colors.primaryContainer },
    smallChipTxt: { fontSize: 13, fontFamily: Fonts.body, color: Colors.text.primary },
    smallChipTxtOn: { fontFamily: Fonts.bodyBold, color: Colors.primary },
    commCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 8,
        backgroundColor: Colors.surfaceContainerLowest,
    },
    commCardOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
    commEmoji: { fontSize: 22 },
    commLabel: { flex: 1, fontSize: 15, fontFamily: Fonts.body, color: Colors.text.primary },
    commLabelOn: { fontFamily: Fonts.bodyBold },
    actGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    actChip: {
        width: '31%',
        minWidth: 100,
        flexGrow: 1,
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: Radii.md,
        backgroundColor: Colors.surfaceContainerHigh,
        alignItems: 'center',
    },
    actChipOn: { backgroundColor: Colors.primaryContainer },
    actEmoji: { fontSize: 20, marginBottom: 4 },
    actTxt: { fontSize: 11, fontFamily: Fonts.body, color: Colors.text.primary, textAlign: 'center' },
    actTxtOn: { fontFamily: Fonts.bodyBold, color: Colors.primary },
    addRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    emojiInput: {
        width: 52,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radii.md,
        paddingHorizontal: 4,
        paddingVertical: 10,
        fontSize: 24,
        textAlign: 'center',
        fontFamily: Fonts.body,
        color: Colors.text.primary,
    },
    addInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radii.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        fontFamily: Fonts.body,
        color: Colors.text.primary,
    },
    addBtn: {
        width: 48,
        borderRadius: Radii.md,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtnTxt: { fontSize: 22, color: Colors.onPrimary, fontFamily: Fonts.bodyBold },
    tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    tag: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: Radii.md,
        backgroundColor: Colors.surfaceContainerHighest,
    },
    tagTxt: { fontSize: 13, fontFamily: Fonts.body, color: Colors.text.primary },
    footer: {
        padding: 16,
        paddingBottom: Space.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.surface,
        ...ShadowAmbientLight,
    },
    saveBtn: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: Radii.lg,
        alignItems: 'center',
    },
    saveBtnOff: { opacity: 0.55 },
    saveBtnTxt: { fontSize: 16, fontFamily: Fonts.bodyBold, color: Colors.onPrimary },
});
