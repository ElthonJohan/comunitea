import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, KeyboardAvoidingView, Platform, Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors } from '../constants/Colors';
import { Radii, Space, ShadowAmbientLight, outlineBorder } from '../constants/Theme';
import { Fonts } from '../constants/Typography';
import PrimaryGradientButton from '../components/PrimaryGradientButton';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { isTutorialDoneForLevel } from '../features/tutorial/hooks/useTutorialState';
import { ROUTES, hrefCategorias } from '../types/routes';
import { useAuth } from '../context/AuthContext';
import { useChildProfile } from '../context/ChildProfileContext';
import { supabase } from '../lib/supabase';
import type {
    AdultRole, CommunicationLevel, Diagnosis, Gender,
} from '../context/ChildProfileContext';
import type { VocabLevel } from '../context/AuthContext';
import { COMM_TO_VOCAB } from '../lib/communicationVocabMap';
import { PREFERRED_ACTIVITIES } from '../features/tablero/data/preferredActivitiesCatalog';
import { formatImportantPersonLine, parseImportantPersonLine } from '../features/tablero/buildMergedBoard';

// Decodifica base64 a Uint8Array para Supabase Storage (sin dependencias externas)
function decodeBase64(base64: string): Uint8Array {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
    let bufLen = base64.length * 0.75;
    if (base64[base64.length - 1] === '=') bufLen--;
    if (base64[base64.length - 2] === '=') bufLen--;
    const bytes = new Uint8Array(new ArrayBuffer(bufLen));
    let p = 0;
    for (let i = 0; i < base64.length; i += 4) {
        const e0 = lookup[base64.charCodeAt(i)];
        const e1 = lookup[base64.charCodeAt(i + 1)];
        const e2 = lookup[base64.charCodeAt(i + 2)];
        const e3 = lookup[base64.charCodeAt(i + 3)];
        bytes[p++] = (e0 << 2) | (e1 >> 4);
        if (p < bufLen) bytes[p++] = ((e1 & 15) << 4) | (e2 >> 2);
        if (p < bufLen) bytes[p++] = ((e2 & 3) << 6) | (e3 & 63);
    }
    return bytes;
}

const VOCAB_LABELS: Record<VocabLevel, string> = {
    BASICO: 'Básico',
    INTERMEDIO: 'Intermedio',
    AVANZADO: 'Avanzado',
};

interface OnboardingForm {
    consentAccepted: boolean;
    role: AdultRole | null;
    childName: string;
    childAvatarUri: string | null;
    gender: Gender | null;
    communicationLevel: CommunicationLevel | null;
    diagnosis: Diagnosis | null;
    environments: string[];
    soundSensitive: boolean;
    preferredActivities: string[];
    importantPeople: string[];
}

const ROLES: { id: AdultRole; label: string; emoji: string }[] = [
    { id: 'padre_madre', label: 'Padre / Madre', emoji: '👨‍👩‍👧' },
    { id: 'terapeuta', label: 'Terapeuta', emoji: '🩺' },
    { id: 'psicologo', label: 'Psicólogo/a', emoji: '🧠' },
    { id: 'docente', label: 'Docente', emoji: '📚' },
];

const COMM_OPTIONS: { id: CommunicationLevel; label: string; sublabel: string; emoji: string }[] = [
    { id: 'sin_lenguaje', label: 'Todavía no usa palabras', sublabel: 'Señas, miradas, vocalizaciones', emoji: '🔇' },
    { id: 'palabras_aisladas', label: 'Palabras sueltas', sublabel: 'Mamá, agua, más…', emoji: '💬' },
    { id: 'frases_simples', label: 'Frases cortas', sublabel: 'Quiero agua, no quiero…', emoji: '🗣️' },
    { id: 'frases_complejas', label: 'Frases más largas', sublabel: '4 o más palabras', emoji: '📢' },
];

const GENDERS: { id: Gender; label: string }[] = [
    { id: 'masculino', label: 'Masculino' },
    { id: 'femenino', label: 'Femenino' },
    { id: 'otro', label: 'Otro' },
    { id: 'prefiero_no_decir', label: 'Prefiero no decir' },
];

const DIAGNOSES: { id: Diagnosis; label: string; sublabel: string; emoji: string }[] = [
    {
        id: 'dsm5_nivel1',
        label: 'Nivel 1 — Necesita apoyo',
        sublabel: 'Puede comunicar algunas cosas pero le cuesta en situaciones sociales o nuevas; necesita apoyo puntual',
        emoji: '🟡',
    },
    {
        id: 'dsm5_nivel2',
        label: 'Nivel 2 — Necesita apoyo sustancial',
        sublabel: 'Comunicación verbal muy limitada o inexistente; responde mejor a rutinas claras y apoyos visuales',
        emoji: '🟠',
    },
    {
        id: 'dsm5_nivel3',
        label: 'Nivel 3 — Necesita apoyo muy sustancial',
        sublabel: 'Comunicación espontánea mínima o ausente; necesidades de apoyo muy altas',
        emoji: '🔴',
    },
    {
        id: 'sin_diagnostico',
        label: 'Sin diagnóstico / No especificado',
        sublabel: 'No tengo diagnóstico formal o no es relevante por ahora',
        emoji: '⚪',
    },
];

const ENVIRONMENTS: { id: string; label: string; emoji: string }[] = [
    { id: 'hogar', label: 'Hogar', emoji: '🏠' },
    { id: 'escuela', label: 'Escuela', emoji: '🏫' },
    { id: 'terapia', label: 'Terapia', emoji: '🏥' },
    { id: 'otro', label: 'Otro', emoji: '🌳' },
];

const TOTAL_STEPS = 9;
const MANDATORY_UPTO = 4; // pasos 0, 1, 2, 3 son obligatorios

export default function OnboardingScreen() {
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [pickingImage, setPickingImage] = useState(false);
    const [form, setForm] = useState<OnboardingForm>({
        consentAccepted: false,
        role: null,
        childName: '',
        childAvatarUri: null,
        gender: null,
        communicationLevel: null,
        diagnosis: null,
        environments: [],
        soundSensitive: false,
        preferredActivities: [],
        importantPeople: [],
    });
    const [newPersonName, setNewPersonName] = useState('');
    const [newPersonEmoji, setNewPersonEmoji] = useState('👤');
    const [newActivityName, setNewActivityName] = useState('');

    const router = useRouter();
    const { user, updateLevel, profile } = useAuth();
    const { saveChildProfile } = useChildProfile();

    // B4: Bloquear re-entrada si el onboarding ya fue completado
    React.useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED).then(async (done) => {
            if (done === 'true') {
                const tutDone = await isTutorialDoneForLevel(profile?.level);
                router.replace(tutDone ? hrefCategorias() : ROUTES.tutorial);
            }
        });
    }, [router, profile?.level]);

    const isOptionalStep = step >= MANDATORY_UPTO;
    const isLastStep = step === TOTAL_STEPS - 1;

    const canAdvance = (() => {
        if (step === 0) return form.consentAccepted;
        if (step === 1) return form.role !== null;
        if (step === 2) return form.childName.trim().length >= 2;
        if (step === 3) return form.communicationLevel !== null;
        return true;
    })();

    // B3: Etiquetas adaptadas al rol del adulto
    const isClinical = form.role === 'terapeuta' || form.role === 'psicologo' || form.role === 'docente';
    const commLevelTitle = isClinical ? '¿Cuál es el perfil verbal?' : '¿Cómo se comunica ahora?';
    const commLevelSubtitle = isClinical
        ? 'Define el nivel de vocabulario AAC inicial'
        : 'Esto define el vocabulario inicial que verás en la app';

    // — Foto del niño —
    const handlePickPhoto = async () => {
        setPickingImage(true);
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });
            if (!result.canceled && result.assets[0]) {
                setForm(f => ({ ...f, childAvatarUri: result.assets[0].uri }));
            }
        } finally {
            setPickingImage(false);
        }
    };

    const uploadAvatar = async (localUri: string): Promise<string | null> => {
        if (!user) return null;
        try {
            const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: 'base64' });
            const filePath = `${user.id}/child_${Date.now()}.jpg`;
            const { error } = await supabase.storage
                .from('avatars')
                .upload(filePath, decodeBase64(base64), { contentType: 'image/jpeg' });
            if (error) return null;
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            return data.publicUrl;
        } catch {
            return null;
        }
    };

    // — Guardar y terminar —
    const handleComplete = async () => {
        if (!form.communicationLevel) return;
        setSaving(true);
        try {
            let avatarUrl: string | null = null;
            if (form.childAvatarUri) {
                avatarUrl = await uploadAvatar(form.childAvatarUri);
            }

            await saveChildProfile({
                name: form.childName.trim(),
                avatar_url: avatarUrl,
                birth_date: null,
                gender: form.gender,
                communication_level: form.communicationLevel,
                diagnosis: form.diagnosis,
                environments: form.environments,
                preferred_activities: form.preferredActivities,
                important_people: form.importantPeople,
                sound_sensitive: form.soundSensitive,
                onboarding_completed: true,
            });

            if (form.preferredActivities.length > 0 || form.importantPeople.length > 0) {
                await AsyncStorage.setItem(
                    STORAGE_KEYS.PREFERRED_ACTIVITIES,
                    JSON.stringify(form.preferredActivities),
                );
                await AsyncStorage.setItem(
                    STORAGE_KEYS.IMPORTANT_PEOPLE,
                    JSON.stringify(form.importantPeople),
                );
            }

            if (form.role && user) {
                await supabase.from('profiles').update({ role: form.role }).eq('id', user.id);
            }

            await updateLevel(COMM_TO_VOCAB[form.communicationLevel]);
            await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
            await AsyncStorage.setItem(STORAGE_KEYS.CONSENT_ACCEPTED, new Date().toISOString());
            router.replace(ROUTES.tutorial);
        } catch {
            Alert.alert('Error', 'No se pudo guardar el perfil. Por favor intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setStep(s => s + 1);
        }
    };

    const toggleEnvironment = (id: string) => {
        setForm(f => ({
            ...f,
            environments: f.environments.includes(id)
                ? f.environments.filter(e => e !== id)
                : [...f.environments, id],
        }));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Indicador de progreso */}
            <View style={styles.progressContainer}>
                <View style={styles.progressDots}>
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                        <React.Fragment key={i}>
                            {i === MANDATORY_UPTO && <View style={styles.progressSpacer} />}
                            <View style={[
                                styles.dot,
                                i < MANDATORY_UPTO ? styles.dotMandatory : styles.dotOptional,
                                i === step && styles.dotActive,
                                i < step && styles.dotDone,
                            ]} />
                        </React.Fragment>
                    ))}
                </View>
                <Text style={styles.progressLabel}>
                    {`Paso ${step + 1} de ${TOTAL_STEPS} · ${isOptionalStep ? 'Personalización (opcional)' : 'Obligatorio'}`}
                </Text>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── PASO 0: Consentimiento COPPA/GDPR ── */}
                    {step === 0 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Privacidad y datos</Text>
                            <Text style={styles.stepSubtitle}>
                                ComuniTEA recopila datos de uso para personalizar la comunicación del niño.
                                Nunca vendemos datos ni los compartimos con terceros.
                            </Text>

                            <View style={styles.consentCard}>
                                <Text style={styles.consentSectionTitle}>Qué guardamos:</Text>
                                <Text style={styles.consentItem}>• Perfil del niño y configuraciones</Text>
                                <Text style={styles.consentItem}>• Historial de frases y pictogramas usados</Text>
                                <Text style={styles.consentItem}>• Estadísticas de uso para generar reportes</Text>
                            </View>

                            <View style={styles.consentCard}>
                                <Text style={styles.consentSectionTitle}>Tus derechos:</Text>
                                <Text style={styles.consentItem}>• Podés eliminar todos tus datos en cualquier momento desde Perfil</Text>
                                <Text style={styles.consentItem}>• Los datos se almacenan en servidores seguros</Text>
                                <Text style={styles.consentItem}>• Cumplimos con GDPR y regulaciones de protección de datos</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.consentCheckRow, form.consentAccepted && styles.consentCheckRowSelected]}
                                onPress={() => setForm(f => ({ ...f, consentAccepted: !f.consentAccepted }))}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, form.consentAccepted && styles.checkboxChecked]}>
                                    {form.consentAccepted && <Text style={styles.checkboxTick}>✓</Text>}
                                </View>
                                <Text style={styles.consentCheckLabel}>
                                    Entiendo y acepto el tratamiento de mis datos para el funcionamiento de la app
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ── PASO 1: Rol ── */}
                    {step === 1 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>¿Cuál es tu rol?</Text>
                            <Text style={styles.stepSubtitle2}>Esto nos ayuda a personalizar la experiencia</Text>
                            {ROLES.map(({ id, label, emoji }) => (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.optionCard, form.role === id && styles.optionCardSelected]}
                                    onPress={() => setForm(f => ({ ...f, role: id }))}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.optionEmoji}>{emoji}</Text>
                                    <Text style={[styles.optionLabel, form.role === id && styles.optionLabelSelected]}>
                                        {label}
                                    </Text>
                                    {form.role === id && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* ── PASO 2: Datos del niño ── */}
                    {step === 2 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>¿Sobre quién es esta app?</Text>
                            <Text style={styles.stepSubtitle2}>Cuéntanos sobre el niño o niña</Text>

                            <TouchableOpacity style={styles.avatarButton} onPress={handlePickPhoto} disabled={pickingImage}>
                                {form.childAvatarUri ? (
                                    <Image source={{ uri: form.childAvatarUri }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarEmoji}>{pickingImage ? '⏳' : '📷'}</Text>
                                        <Text style={styles.avatarPlaceholderText}>Agregar foto</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.fieldLabel}>Nombre *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={form.childName}
                                onChangeText={v => setForm(f => ({ ...f, childName: v }))}
                                placeholder="¿Cómo se llama?"
                                placeholderTextColor={Colors.text.disabled}
                                autoCapitalize="words"
                                maxLength={40}
                                returnKeyType="done"
                            />

                            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>
                                Género <Text style={styles.optionalTag}>(opcional)</Text>
                            </Text>
                            <View style={styles.pillsRow}>
                                {GENDERS.map(({ id, label }) => (
                                    <TouchableOpacity
                                        key={id}
                                        style={[styles.pill, form.gender === id && styles.pillSelected]}
                                        onPress={() => setForm(f => ({ ...f, gender: f.gender === id ? null : id }))}
                                    >
                                        <Text style={[styles.pillText, form.gender === id && styles.pillTextSelected]}>
                                            {label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ── PASO 3: Nivel comunicativo ── */}
                    {step === 3 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>{commLevelTitle}</Text>
                            <Text style={styles.stepSubtitle2}>{commLevelSubtitle}</Text>
                            {COMM_OPTIONS.map(({ id, label, sublabel, emoji }) => (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.optionCard, form.communicationLevel === id && styles.optionCardSelected]}
                                    onPress={() => setForm(f => ({ ...f, communicationLevel: id }))}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.optionEmoji}>{emoji}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.optionLabel, form.communicationLevel === id && styles.optionLabelSelected]}>
                                            {label}
                                        </Text>
                                        <Text style={styles.optionSublabel}>{sublabel}</Text>
                                    </View>
                                    {form.communicationLevel === id && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                            {form.communicationLevel && (
                                <View style={styles.vocabBadge}>
                                    <Text style={styles.vocabBadgeText}>
                                        Vocabulario inicial: {VOCAB_LABELS[COMM_TO_VOCAB[form.communicationLevel]]} ✓
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* ── PASO 4: Diagnóstico (opcional) ── */}
                    {step === 4 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>¿Nivel de diagnóstico TEA?</Text>
                            <Text style={styles.stepSubtitle2}>
                                Usamos descripciones funcionales para ayudarte a elegir. Podés omitir este paso.
                            </Text>
                            {DIAGNOSES.map(({ id, label, sublabel, emoji }) => (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.optionCard, form.diagnosis === id && styles.optionCardSelected]}
                                    onPress={() => setForm(f => ({ ...f, diagnosis: f.diagnosis === id ? null : id }))}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.optionEmoji}>{emoji}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.optionLabel, form.diagnosis === id && styles.optionLabelSelected]}>
                                            {label}
                                        </Text>
                                        <Text style={styles.optionSublabel}>{sublabel}</Text>
                                    </View>
                                    {form.diagnosis === id && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* ── PASO 5: Entornos (opcional) ── */}
                    {step === 5 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>¿Dónde se usará la app?</Text>
                            <Text style={styles.stepSubtitle2}>Podés seleccionar varios entornos</Text>
                            <View style={styles.envGrid}>
                                {ENVIRONMENTS.map(({ id, label, emoji }) => {
                                    const selected = form.environments.includes(id);
                                    return (
                                        <TouchableOpacity
                                            key={id}
                                            style={[styles.envCard, selected && styles.envCardSelected]}
                                            onPress={() => toggleEnvironment(id)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.envEmoji}>{emoji}</Text>
                                            <View style={styles.envLabelRow}>
                                                <Text style={[styles.envLabel, selected && styles.envLabelSelected]}>
                                                    {label}
                                                </Text>
                                                {selected && <Text style={styles.checkmark}>✓</Text>}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* ── PASO 6: Sensibilidad sensorial (opcional) ── */}
                    {step === 6 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>¿Sensibilidad sensorial?</Text>
                            <Text style={styles.stepSubtitle2}>
                                Si el niño/a es sensible a sonidos fuertes o estímulos intensos,
                                activaremos un modo más tranquilo con volumen reducido y sin celebraciones con música.
                            </Text>
                            <TouchableOpacity
                                style={[styles.optionCard, form.soundSensitive && styles.optionCardSelected]}
                                onPress={() => setForm(f => ({ ...f, soundSensitive: true }))}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.optionEmoji}>🔇</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.optionLabel, form.soundSensitive && styles.optionLabelSelected]}>
                                        Sí, es sensible
                                    </Text>
                                    <Text style={styles.optionSublabel}>Modo tranquilo activado</Text>
                                </View>
                                {form.soundSensitive && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.optionCard, !form.soundSensitive && styles.optionCardSelected]}
                                onPress={() => setForm(f => ({ ...f, soundSensitive: false }))}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.optionEmoji}>🔊</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.optionLabel, !form.soundSensitive && styles.optionLabelSelected]}>
                                        Sin problemas
                                    </Text>
                                    <Text style={styles.optionSublabel}>Experiencia completa</Text>
                                </View>
                                {!form.soundSensitive && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ── PASO 7: Actividades preferidas (B1, opcional) ── */}
                    {step === 7 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>¿Qué le gusta hacer?</Text>
                            <Text style={styles.stepSubtitle2}>
                                Elige opciones y/o escribe actividades a medida. Aparecerán como pictogramas en «Le gusta».
                            </Text>
                            <View style={styles.activityGrid}>
                                {PREFERRED_ACTIVITIES.map(({ id, label, emoji }) => {
                                    const selected = form.preferredActivities.includes(id);
                                    return (
                                        <TouchableOpacity
                                            key={id}
                                            style={[styles.activityChip, selected && styles.activityChipSelected]}
                                            onPress={() => setForm(f => ({
                                                ...f,
                                                preferredActivities: selected
                                                    ? f.preferredActivities.filter(a => a !== id)
                                                    : [...f.preferredActivities, id],
                                            }))}
                                            activeOpacity={0.75}
                                        >
                                            <Text style={styles.activityEmoji}>{emoji}</Text>
                                            <Text style={[styles.activityLabel, selected && styles.activityLabelSelected]}>
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <View style={styles.personInputRow}>
                                <TextInput
                                    style={styles.personInput}
                                    value={newActivityName}
                                    onChangeText={setNewActivityName}
                                    placeholder="Otra actividad (ej: bailar, patines)"
                                    placeholderTextColor={Colors.text.disabled}
                                    maxLength={40}
                                    returnKeyType="done"
                                    onSubmitEditing={() => {
                                        const trimmed = newActivityName.trim();
                                        const token = `custom:${trimmed}`;
                                        if (trimmed && !form.preferredActivities.includes(token)) {
                                            setForm(f => ({ ...f, preferredActivities: [...f.preferredActivities, token] }));
                                        }
                                        setNewActivityName('');
                                    }}
                                />
                                <TouchableOpacity
                                    style={styles.personAddBtn}
                                    onPress={() => {
                                        const trimmed = newActivityName.trim();
                                        const token = `custom:${trimmed}`;
                                        if (trimmed && !form.preferredActivities.includes(token)) {
                                            setForm(f => ({ ...f, preferredActivities: [...f.preferredActivities, token] }));
                                        }
                                        setNewActivityName('');
                                    }}
                                >
                                    <Text style={styles.personAddBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.personChips}>
                                {form.preferredActivities
                                    .filter((a) => a.startsWith('custom:'))
                                    .map((token) => {
                                        const label = token.slice('custom:'.length);
                                        return (
                                            <TouchableOpacity
                                                key={token}
                                                style={styles.personChip}
                                                onPress={() => setForm(f => ({
                                                    ...f,
                                                    preferredActivities: f.preferredActivities.filter((a) => a !== token),
                                                }))}
                                            >
                                                <Text style={styles.personChipText}>✨ {label}  ✕</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                            </View>
                        </View>
                    )}

                    {/* ── PASO 8: Personas importantes (B2, opcional) ── */}
                    {step === 8 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Personas importantes</Text>
                            <Text style={styles.stepSubtitle2}>
                                Emoji y nombre (mamá, papá, maestra…). Aparecerán en el tablero; si configurás al menos una, reemplazan a los ejemplos fijos.
                            </Text>
                            <View style={styles.personInputRow}>
                                <TextInput
                                    style={styles.personEmojiInput}
                                    value={newPersonEmoji}
                                    onChangeText={(t) => setNewPersonEmoji(t.trim().slice(0, 8) || '👤')}
                                    placeholder="👤"
                                    maxLength={8}
                                    autoCapitalize="none"
                                />
                                <TextInput
                                    style={styles.personInput}
                                    value={newPersonName}
                                    onChangeText={setNewPersonName}
                                    placeholder="Nombre (ej: Mamá, Profe Ana)"
                                    placeholderTextColor={Colors.text.disabled}
                                    maxLength={30}
                                    returnKeyType="done"
                                    onSubmitEditing={() => {
                                        const trimmed = newPersonName.trim();
                                        const line = formatImportantPersonLine(newPersonEmoji, trimmed);
                                        if (!trimmed) return;
                                        const dup = form.importantPeople.some(
                                            (p) => parseImportantPersonLine(p).name === trimmed,
                                        );
                                        if (!dup) {
                                            setForm(f => ({ ...f, importantPeople: [...f.importantPeople, line] }));
                                        }
                                        setNewPersonName('');
                                    }}
                                />
                                <TouchableOpacity
                                    style={styles.personAddBtn}
                                    onPress={() => {
                                        const trimmed = newPersonName.trim();
                                        if (!trimmed) return;
                                        const dup = form.importantPeople.some(
                                            (p) => parseImportantPersonLine(p).name === trimmed,
                                        );
                                        if (!dup) {
                                            setForm(f => ({
                                                ...f,
                                                importantPeople: [
                                                    ...f.importantPeople,
                                                    formatImportantPersonLine(newPersonEmoji, trimmed),
                                                ],
                                            }));
                                        }
                                        setNewPersonName('');
                                    }}
                                >
                                    <Text style={styles.personAddBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.personChips}>
                                {form.importantPeople.map((line) => {
                                    const { emoji, name } = parseImportantPersonLine(line);
                                    return (
                                        <TouchableOpacity
                                            key={line}
                                            style={styles.personChip}
                                            onPress={() => setForm(f => ({
                                                ...f,
                                                importantPeople: f.importantPeople.filter(p => p !== line),
                                            }))}
                                        >
                                            <Text style={styles.personChipText}>{emoji} {name}  ✕</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            {form.importantPeople.length === 0 && (
                                <Text style={styles.personHint}>Podés agregar hasta 10 personas. Toca un chip para eliminarlo.</Text>
                            )}
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Botones de navegación */}
            <View style={styles.navContainer}>
                {isOptionalStep && (
                    <TouchableOpacity style={styles.skipButton} onPress={handleComplete} disabled={saving}>
                        <Text style={styles.skipButtonText}>Omitir personalización y empezar</Text>
                    </TouchableOpacity>
                )}
                <View style={styles.navRow}>
                    {step > 0 && (
                        <TouchableOpacity
                            style={[styles.backButton, saving && styles.disabledButton]}
                            onPress={() => setStep(s => s - 1)}
                            disabled={saving}
                        >
                            <Text style={styles.backButtonText}>← Atrás</Text>
                        </TouchableOpacity>
                    )}
                    <PrimaryGradientButton
                        style={styles.nextButton}
                        label={isLastStep ? '¡Empecemos!' : 'Siguiente →'}
                        onPress={handleNext}
                        disabled={!canAdvance || saving}
                        loading={saving}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    progressContainer: {
        paddingTop: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        gap: 8,
    },
    progressDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    dotMandatory: {
        backgroundColor: Colors.surfaceContainerHighest,
    },
    dotOptional: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.surfaceContainerHighest,
    },
    dotActive: {
        backgroundColor: Colors.primary,
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    dotDone: {
        backgroundColor: Colors.primaryContainer,
        opacity: 0.85,
    },
    progressSpacer: {
        width: 2,
        height: 12,
        backgroundColor: Colors.text.disabled,
        marginHorizontal: 6,
    },
    progressLabel: {
        fontSize: 12,
        fontFamily: Fonts.bodyMedium,
        color: Colors.text.secondary,
        letterSpacing: 0.3,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 16,
    },
    stepContent: {
        gap: 12,
    },
    stepTitle: {
        fontSize: 26,
        fontFamily: Fonts.displayBold,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    stepSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.body,
        color: Colors.text.secondary,
        lineHeight: 22,
        marginBottom: Space.md,
    },
    stepSubtitle2: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
        lineHeight: 22,
        marginBottom: Space.md,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radii.md,
        padding: Space.md,
        gap: 14,
        ...ShadowAmbientLight,
    },
    optionCardSelected: {
        backgroundColor: Colors.surfaceContainerHigh,
    },
    optionEmoji: {
        fontSize: 28,
    },
    optionLabel: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
    },
    optionLabelSelected: {
        color: Colors.text.primary,
    },
    optionSublabel: {
        fontSize: 14,
        fontFamily: Fonts.bodySemiBold,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    checkmark: {
        fontSize: 18,
        fontFamily: Fonts.bodyBold,
        color: Colors.primary,
    },
    vocabBadge: {
        backgroundColor: Colors.primaryLight,
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    vocabBadgeText: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
    },
    avatarButton: {
        alignSelf: 'center',
        marginBottom: 8,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: Colors.primary,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primaryLight,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: {
        fontSize: 28,
    },
    avatarPlaceholderText: {
        fontSize: 10,
        fontFamily: Fonts.body,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    fieldLabel: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
    },
    optionalTag: {
        fontFamily: Fonts.body,
        color: Colors.text.secondary,
    },
    textInput: {
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radii.default,
        ...outlineBorder(1),
        padding: 14,
        fontSize: 16,
        fontFamily: Fonts.body,
        color: Colors.text.primary,
    },
    pillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Radii.full,
        backgroundColor: Colors.surfaceContainerLow,
    },
    pillSelected: {
        backgroundColor: Colors.surfaceContainerHigh,
    },
    pillText: {
        fontSize: 16,
        fontFamily: Fonts.bodyMedium,
        color: Colors.text.secondary,
    },
    pillTextSelected: {
        color: Colors.text.primary,
        fontFamily: Fonts.bodySemiBold,
    },
    envGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    envCard: {
        width: '46%',
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radii.md,
        padding: 20,
        alignItems: 'center',
        gap: 8,
        ...ShadowAmbientLight,
    },
    envCardSelected: {
        backgroundColor: Colors.surfaceContainerHigh,
    },
    envLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    envEmoji: {
        fontSize: 32,
    },
    envLabel: {
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: Colors.text.secondary,
    },
    envLabelSelected: {
        color: Colors.text.primary,
        fontFamily: Fonts.bodySemiBold,
    },
    navContainer: {
        padding: Space.lg,
        paddingBottom: Space.sm,
        gap: 10,
        backgroundColor: Colors.surfaceContainerLow,
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    skipButtonText: {
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: Colors.text.secondary,
        textDecorationLine: 'underline',
    },
    navRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    backButton: {
        flex: 1,
        backgroundColor: Colors.surfaceContainerButtons,
        borderRadius: Radii.xl,
        minHeight: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: Colors.text.primary,
    },
    disabledButton: {
        opacity: 0.5,
    },
    nextButton: {
        flex: 1,
    },
    // ── Consentimiento ──
    consentCard: {
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: Radii.md,
        padding: Space.md,
        gap: 6,
    },
    consentSectionTitle: {
        fontSize: 13,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    consentItem: {
        fontSize: 13,
        fontFamily: Fonts.body,
        color: Colors.text.secondary,
        lineHeight: 19,
    },
    consentCheckRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radii.md,
        padding: Space.md,
        marginTop: 4,
        ...ShadowAmbientLight,
    },
    consentCheckRowSelected: {
        backgroundColor: Colors.surfaceContainerHigh,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: Radii.sm,
        ...outlineBorder(1.5),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
        flexShrink: 0,
    },
    checkboxChecked: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkboxTick: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: Fonts.bodyBold,
    },
    consentCheckLabel: {
        fontSize: 14,
        fontFamily: Fonts.bodyMedium,
        color: Colors.text.primary,
        lineHeight: 20,
        flex: 1,
    },
    // B1 — Actividades preferidas
    activityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 8,
    },
    activityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: Radii.full,
        backgroundColor: Colors.surfaceContainerLowest,
        gap: 6,
    },
    activityChipSelected: {
        backgroundColor: Colors.surfaceContainerHigh,
    },
    activityEmoji: {
        fontSize: 18,
    },
    activityLabel: {
        fontSize: 14,
        fontFamily: Fonts.bodyMedium,
        color: Colors.text.secondary,
    },
    activityLabelSelected: {
        color: Colors.text.primary,
        fontFamily: Fonts.bodyBold,
    },
    // B2 — Personas importantes
    personInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    personEmojiInput: {
        width: 56,
        height: 48,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: Colors.border,
        paddingHorizontal: 6,
        fontSize: 26,
        fontFamily: Fonts.body,
        textAlign: 'center',
        color: Colors.text.primary,
        backgroundColor: Colors.surfaceContainerLowest,
    },
    personInput: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: Colors.border,
        paddingHorizontal: 14,
        fontSize: 15,
        fontFamily: Fonts.body,
        color: Colors.text.primary,
        backgroundColor: Colors.surfaceContainerLowest,
    },
    personAddBtn: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    personAddBtnText: {
        fontSize: 26,
        fontFamily: Fonts.bodyBold,
        color: Colors.white,
        lineHeight: 30,
    },
    personChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    personChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Radii.full,
        backgroundColor: Colors.surfaceContainerHigh,
    },
    personChipText: {
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: Colors.text.primary,
    },
    personHint: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 18,
    },
});
