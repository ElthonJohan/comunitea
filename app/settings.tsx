import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Switch,
    Image,
    ScrollView,
    Linking,
    Modal,
    Pressable,
    TextInput,
} from 'react-native';
import type { ThemeColor, AppColorPalette } from '../constants/Colors';
import { Palettes } from '../constants/Colors';
import { useThemeColors } from '../context/AppThemeContext';
import { useAppThemeStore } from '../stores/appThemeStore';
import { Radii, Space, ShadowAmbientLight } from '../constants/Theme';
import { Fonts } from '../constants/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../lib/hooks/useVoice';
import { useEditMode } from '../context/EditModeContext';
import { useTimer } from '../context/TimerContext';
import { useParental, AnimationIntensity } from '../lib/hooks/useParental';
import { useParentalBlock } from '../context/ParentalContext';
import {
    useChildProfile,
    ActiveEnvironment,
    type Gender,
    type ChildProfileInput,
} from '../context/ChildProfileContext';
import { VoiceProfile } from '../constants/AudioAssets';
import { VocabLevel } from '../context/AuthContext';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useImagePicker } from '../lib/hooks/useImagePicker';
import { supabase } from '../lib/supabase';
import PinModal from '../components/PinModal';
import ChildProfileEditOverlay from '../components/ChildProfileEditOverlay';
import { ROUTES, hrefCategorias } from '../types/routes';

// ---------------------------------------------------------------------------
// Constantes de etiquetas (sin emojis corruptos - solo texto + iconos)
// ---------------------------------------------------------------------------
const VOICE_LABELS: Record<VoiceProfile, { label: string; sub: string; icon: string }> = {
    femenina:  { label: 'Voz Femenina',  sub: 'Tono adulto femenino',  icon: 'person' },
    masculina: { label: 'Voz Masculina', sub: 'Tono adulto masculino', icon: 'person-outline' },
};

function levelLabelsFromColors(colors: AppColorPalette): Record<VocabLevel, { label: string; sub: string; color: string }> {
    return {
        BASICO: { label: 'Básico', sub: 'Vocabulario esencial', color: colors.success },
        INTERMEDIO: { label: 'Intermedio', sub: 'Más categorías y contextos', color: colors.warning },
        AVANZADO: { label: 'Avanzado', sub: 'Vocabulario completo', color: colors.primary },
    };
}

const GENDER_LABELS: Record<Gender, string> = {
    masculino: 'Niño',
    femenino: 'Niña',
    otro: 'Otro',
    prefiero_no_decir: 'Prefiero no decir',
};

const ENVIRONMENT_LABELS: Record<ActiveEnvironment, { label: string; icon: string }> = {
    hogar:   { label: 'Hogar',   icon: 'home-outline' },
    escuela: { label: 'Escuela', icon: 'school-outline' },
    terapia: { label: 'Terapia', icon: 'medical-outline' },
};

const ANIMATION_LABELS: Record<AnimationIntensity, { label: string; sub: string }> = {
    none:   { label: 'Sin animaciones', sub: 'Pantalla estática'      },
    soft:   { label: 'Suaves',          sub: 'Transiciones ligeras'   },
    normal: { label: 'Normal',          sub: 'Animaciones completas'  },
};

const SPEED_OPTIONS: { label: string; sub: string; value: number }[] = [
    { label: 'Muy lenta', sub: '0.6×', value: 0.6 },
    { label: 'Lenta',     sub: '0.8×', value: 0.8 },
    { label: 'Normal',    sub: '1.0×', value: 1.0 },
    { label: 'Rápida',    sub: '1.2×', value: 1.2 },
];

// ---------------------------------------------------------------------------
// Modal premium de selección genérico
// ---------------------------------------------------------------------------
interface OptionItem {
    label: string;
    sub?: string;
    leftIcon?: string;
    leftColor?: string;
    selected?: boolean;
    onPress: () => void;
}

function SelectModal({
    visible,
    title,
    subtitle,
    options,
    onClose,
}: {
    visible: boolean;
    title: string;
    subtitle?: string;
    options: OptionItem[];
    onClose: () => void;
}) {
    const colors = useThemeColors();
    const modalSheet = useMemo(() => createModalStyles(colors), [colors]);
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={modalSheet.backdrop} onPress={onClose}>
                <Pressable style={modalSheet.sheet} onPress={() => {}}>
                    {/* Handle */}
                    <View style={modalSheet.handle} />
                    <Text style={modalSheet.title}>{title}</Text>
                    {subtitle ? <Text style={modalSheet.subtitle}>{subtitle}</Text> : null}
                    <View style={modalSheet.optionsList}>
                        {options.map((opt, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[modalSheet.option, opt.selected && modalSheet.optionSelected]}
                                onPress={() => { opt.onPress(); onClose(); }}
                                activeOpacity={0.7}
                            >
                                {opt.leftIcon ? (
                                    <View style={[modalSheet.optionIcon, { backgroundColor: (opt.leftColor ?? colors.primary) + '22' }]}>
                                        <Ionicons name={opt.leftIcon as any} size={20} color={opt.leftColor ?? colors.primary} />
                                    </View>
                                ) : null}
                                <View style={{ flex: 1 }}>
                                    <Text style={[modalSheet.optionLabel, opt.selected && modalSheet.optionLabelSelected]}>
                                        {opt.label}
                                    </Text>
                                    {opt.sub ? <Text style={modalSheet.optionSub}>{opt.sub}</Text> : null}
                                </View>
                                {opt.selected ? (
                                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                                ) : (
                                    <View style={modalSheet.optionCheck} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={modalSheet.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                        <Text style={modalSheet.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// ---------------------------------------------------------------------------
// Componentes de presentación internos
// ---------------------------------------------------------------------------
function SectionHeader({ title }: { title: string }) {
    const colors = useThemeColors();
    const sectionStyles = useMemo(() => createSectionStyles(colors), [colors]);
    return <Text style={sectionStyles.header}>{title.toUpperCase()}</Text>;
}

function Row({
    icon, label, sub, onPress, right,
}: {
    icon: string;
    label: string;
    sub?: string;
    onPress?: () => void;
    right?: React.ReactNode;
}) {
    const colors = useThemeColors();
    const sectionStyles = useMemo(() => createSectionStyles(colors), [colors]);
    const content = (
        <View style={sectionStyles.row}>
            <View style={sectionStyles.iconWrap}>
                <Ionicons name={icon as any} size={20} color={colors.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={sectionStyles.rowText}>{label}</Text>
                {sub ? <Text style={sectionStyles.rowSub}>{sub}</Text> : null}
            </View>
            {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.text.disabled} /> : null)}
        </View>
    );
    if (!onPress) return content;
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
}

function RowSpacer() {
    const colors = useThemeColors();
    const sectionStyles = useMemo(() => createSectionStyles(colors), [colors]);
    return <View style={sectionStyles.rowSpacer} />;
}
function Card({ children }: { children: React.ReactNode }) {
    const colors = useThemeColors();
    const sectionStyles = useMemo(() => createSectionStyles(colors), [colors]);
    return <View style={sectionStyles.card}>{children}</View>;
}

export default function SettingsScreen() {
    const colors = useThemeColors();
    const palette = useAppThemeStore((s) => s.palette);
    const setPalette = useAppThemeStore((s) => s.setPalette);
    const styles = useMemo(() => createSettingsScreenStyles(colors), [colors]);
    const sectionStyles = useMemo(() => createSectionStyles(colors), [colors]);
    const levelLabels = useMemo(() => levelLabelsFromColors(colors), [colors]);
    const router = useRouter();
    const { profile, user, signOut, isLoading, updateLevel, updateAvatar } = useAuth();
    const { pickAndUploadImage, uploading } = useImagePicker();
    const { voice, setVoice } = useVoice();
    const { isEditMode, enterEditMode, lockEditMode, changePinRequest } = useEditMode();
    const { showTimer } = useTimer();
    const { settings, updateDailyLimit, updateSensoryConfig, updateGameMode } = useParental();
    const { usedSecondsToday } = useParentalBlock();
    const { activeEnvironment, setEnvironment, childProfile, saveChildProfile, refreshChildProfile } =
        useChildProfile();
    const [signingOut, setSigningOut] = useState(false);
    const [childNameDraft, setChildNameDraft] = useState('');
    const [savingChild, setSavingChild] = useState(false);
    const [childGenderModalOpen, setChildGenderModalOpen] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(true);

    // Modales premium
    const [voiceModalOpen, setVoiceModalOpen] = useState(false);
    const [levelModalOpen, setLevelModalOpen] = useState(false);
    const [envModalOpen, setEnvModalOpen] = useState(false);
    const [animModalOpen, setAnimModalOpen] = useState(false);
    const [speedModalOpen, setSpeedModalOpen] = useState(false);
    const [limitModalOpen, setLimitModalOpen] = useState(false);
    const [childProfileSetupOpen, setChildProfileSetupOpen] = useState(false);

    // PIN gate al entrar al perfil
    const [pinVerified, setPinVerified] = useState(false);
    const [showProfilePin, setShowProfilePin] = useState(false);
    const [profileStoredPin, setProfileStoredPin] = useState<string | null | undefined>(undefined);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEYS.PARENTAL_PIN).then(pin => {
            setProfileStoredPin(pin);
            if (pin === null) {
                setPinVerified(true);
            } else {
                setShowProfilePin(true);
            }
        });
    }, []);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEYS.SHOW_KEYBOARD).then((val) => {
            if (val !== null) setShowKeyboard(val === 'true');
        });
    }, []);

    useEffect(() => {
        if (childProfile?.name) setChildNameDraft(childProfile.name);
    }, [childProfile?.id, childProfile?.name]);

    useFocusEffect(
        useCallback(() => {
            void refreshChildProfile();
        }, [refreshChildProfile]),
    );

    const toggleKeyboard = (value: boolean) => {
        setShowKeyboard(value);
        AsyncStorage.setItem(STORAGE_KEYS.SHOW_KEYBOARD, value ? 'true' : 'false');
    };

    const displayName = profile?.first_name
        ? `${profile.first_name}${profile.last_name ? ' ' + profile.last_name : ''}`
        : user?.email ?? 'Usuario';

    const handleSignOut = () => {
        Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres salir?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Cerrar sesión',
                style: 'destructive',
                onPress: async () => { setSigningOut(true); await signOut(); },
            },
        ]);
    };

    const handleAvatarPress = useCallback(() => {
        Alert.alert('Cambiar foto de perfil', 'Elige cómo quieres actualizar tu foto', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Cámara',   onPress: async () => { const url = await pickAndUploadImage(true);  if (url) await updateAvatar(url); } },
            { text: 'Galería',  onPress: async () => { const url = await pickAndUploadImage(false); if (url) await updateAvatar(url); } },
        ]);
    }, [pickAndUploadImage, updateAvatar]);

    const handleChildPhoto = useCallback(() => {
        if (!childProfile) return;
        Alert.alert('Foto del niño', 'Se usará en el tablero, categorías y perfil. Elige origen.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Cámara',
                onPress: async () => {
                    const url = await pickAndUploadImage(true);
                    if (!url) return;
                    setSavingChild(true);
                    try {
                        const { id: _id, user_id: _uid, ...editable } = childProfile;
                        await saveChildProfile({ ...editable, avatar_url: url } as ChildProfileInput);
                    } catch {
                        Alert.alert('Error', 'No se pudo guardar la foto.');
                    } finally {
                        setSavingChild(false);
                    }
                },
            },
            {
                text: 'Galería',
                onPress: async () => {
                    const url = await pickAndUploadImage(false);
                    if (!url) return;
                    setSavingChild(true);
                    try {
                        const { id: _id, user_id: _uid, ...editable } = childProfile;
                        await saveChildProfile({ ...editable, avatar_url: url } as ChildProfileInput);
                    } catch {
                        Alert.alert('Error', 'No se pudo guardar la foto.');
                    } finally {
                        setSavingChild(false);
                    }
                },
            },
        ]);
    }, [childProfile, pickAndUploadImage, saveChildProfile]);

    const handleSaveChildName = useCallback(async () => {
        if (!childProfile) return;
        const name = childNameDraft.trim() || 'Niño';
        setSavingChild(true);
        try {
            const { id: _id, user_id: _uid, ...editable } = childProfile;
            await saveChildProfile({ ...editable, name } as ChildProfileInput);
            Alert.alert('Listo', 'Nombre del niño actualizado.');
        } catch {
            Alert.alert('Error', 'No se pudo guardar el nombre.');
        } finally {
            setSavingChild(false);
        }
    }, [childProfile, childNameDraft, saveChildProfile]);

    const applyChildGender = useCallback(
        async (g: Gender) => {
            if (!childProfile) return;
            setSavingChild(true);
            try {
                const { id: _id, user_id: _uid, ...editable } = childProfile;
                await saveChildProfile({ ...editable, gender: g } as ChildProfileInput);
            } catch {
                Alert.alert('Error', 'No se pudo guardar el género.');
            } finally {
                setSavingChild(false);
            }
        },
        [childProfile, saveChildProfile],
    );

    const handleDeleteAccount = () => {
        Alert.alert(
            'Eliminar todos mis datos',
            'Esta acción es permanente e irreversible. Se eliminarán tu cuenta, el perfil del niño, todo el historial de frases, reportes y datos de uso.\n\n¿Estás completamente seguro?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar todo',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Última confirmación',
                            'Esta acción no se puede deshacer.',
                            [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                    text: 'Confirmar eliminación',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            const { error } = await supabase.functions.invoke('delete-user-data');
                                            if (error) throw error;
                                            await signOut();
                                        } catch {
                                            Alert.alert('Error', 'No se pudieron eliminar los datos. Contacta a soporte en privacidad@comuniteaapp.com');
                                        }
                                    },
                                },
                            ],
                        );
                    },
                },
            ],
        );
    };

    if (isLoading || profileStoredPin === undefined) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!pinVerified) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <PinModal
                    visible={showProfilePin}
                    mode="verify"
                    title="Zona de Padres"
                    subtitle="Ingresa el PIN para acceder al perfil"
                    onSuccess={(pin) => {
                        if (pin === profileStoredPin) {
                            setPinVerified(true);
                            setShowProfilePin(false);
                        } else {
                            setShowProfilePin(false);
                            setTimeout(() => setShowProfilePin(true), 100);
                        }
                    }}
                    onCancel={() => router.replace(hrefCategorias())}
                />
            </SafeAreaView>
        );
    }

    const currentLevelInfo = levelLabels[profile?.level ?? 'BASICO'];
    const currentSpeedOpt  = SPEED_OPTIONS.find((o) => o.value === settings?.tts_speed) ?? SPEED_OPTIONS[2];
    const currentAnimInfo  = ANIMATION_LABELS[settings?.animation_intensity ?? 'normal'];

    return (
        <SafeAreaView style={styles.container}>

            {/* -- Modales premium -- */}
            <SelectModal
                visible={voiceModalOpen}
                title="Voz de pictogramas"
                subtitle="Elige el perfil de voz para los pictogramas"
                onClose={() => setVoiceModalOpen(false)}
                options={(['femenina', 'masculina'] as VoiceProfile[]).map(v => ({
                    label: VOICE_LABELS[v].label,
                    sub: VOICE_LABELS[v].sub,
                    leftIcon: VOICE_LABELS[v].icon,
                    leftColor: colors.primary,
                    selected: voice === v,
                    onPress: () => setVoice(v),
                }))}
            />
            <SelectModal
                visible={levelModalOpen}
                title="Nivel de vocabulario"
                subtitle="Selecciona el nivel del tablero de comunicación"
                onClose={() => setLevelModalOpen(false)}
                options={(['BASICO', 'INTERMEDIO', 'AVANZADO'] as VocabLevel[]).map(l => ({
                    label: levelLabels[l].label,
                    sub: levelLabels[l].sub,
                    leftIcon: 'layers-outline',
                    leftColor: levelLabels[l].color,
                    selected: profile?.level === l,
                    onPress: () => updateLevel(l),
                }))}
            />
            <SelectModal
                visible={envModalOpen}
                title="Entorno activo"
                subtitle="Selecciona el contexto actual del niño"
                onClose={() => setEnvModalOpen(false)}
                options={(['hogar', 'escuela', 'terapia'] as ActiveEnvironment[]).map(e => ({
                    label: ENVIRONMENT_LABELS[e].label,
                    leftIcon: ENVIRONMENT_LABELS[e].icon,
                    leftColor: colors.primary,
                    selected: activeEnvironment === e,
                    onPress: () => setEnvironment(e),
                }))}
            />
            <SelectModal
                visible={animModalOpen}
                title="Intensidad de animaciones"
                subtitle="Controla el nivel de estimulación visual"
                onClose={() => setAnimModalOpen(false)}
                options={(['none', 'soft', 'normal'] as AnimationIntensity[]).map(a => ({
                    label: ANIMATION_LABELS[a].label,
                    sub: ANIMATION_LABELS[a].sub,
                    leftIcon: 'sparkles-outline',
                    leftColor: colors.primary,
                    selected: settings?.animation_intensity === a,
                    onPress: () => updateSensoryConfig({ animation_intensity: a }),
                }))}
            />
            <SelectModal
                visible={speedModalOpen}
                title="Velocidad de la voz"
                subtitle="Ajusta la velocidad del texto a voz"
                onClose={() => setSpeedModalOpen(false)}
                options={SPEED_OPTIONS.map(opt => ({
                    label: opt.label,
                    sub: opt.sub,
                    leftIcon: 'speedometer-outline',
                    leftColor: colors.primary,
                    selected: settings?.tts_speed === opt.value,
                    onPress: () => updateSensoryConfig({ tts_speed: opt.value }),
                }))}
            />
            <SelectModal
                visible={childGenderModalOpen}
                title="Género del niño"
                subtitle="Se guarda al elegir"
                onClose={() => setChildGenderModalOpen(false)}
                options={(['masculino', 'femenino', 'otro', 'prefiero_no_decir'] as Gender[]).map((g) => ({
                    label: GENDER_LABELS[g],
                    leftIcon: 'person-outline',
                    leftColor: colors.primary,
                    selected: childProfile?.gender === g,
                    onPress: () => {
                        void applyChildGender(g);
                    },
                }))}
            />
            <ChildProfileEditOverlay
                visible={childProfileSetupOpen}
                onClose={() => setChildProfileSetupOpen(false)}
                onSaved={() => void refreshChildProfile()}
            />
            <SelectModal
                visible={limitModalOpen}
                title="Límite de uso diario"
                subtitle={settings?.daily_limit_minutes
                    ? `Usado hoy: ${Math.floor(usedSecondsToday / 60)} min • Límite: ${settings.daily_limit_minutes} min`
                    : 'Elige el tiempo máximo de uso al día'}
                onClose={() => setLimitModalOpen(false)}
                options={[
                    { label: 'Desactivado', sub: 'Sin límite de tiempo', leftIcon: 'infinite-outline', leftColor: colors.text.secondary, selected: !settings?.daily_limit_minutes, onPress: () => updateDailyLimit(0) },
                    { label: '15 minutos',  sub: 'Uso corto',            leftIcon: 'time-outline',     leftColor: colors.success,         selected: settings?.daily_limit_minutes === 15, onPress: () => updateDailyLimit(15) },
                    { label: '30 minutos',  sub: 'Uso moderado',         leftIcon: 'time-outline',     leftColor: colors.warning,          selected: settings?.daily_limit_minutes === 30, onPress: () => updateDailyLimit(30) },
                    { label: '60 minutos',  sub: 'Uso estándar',         leftIcon: 'time-outline',     leftColor: colors.danger,          selected: settings?.daily_limit_minutes === 60, onPress: () => updateDailyLimit(60) },
                ]}
            />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.firstSection}>
                    <SectionHeader title="Perfil del niño (tablero AAC)" />
                </View>
                <Card>
                    {childProfile ? (
                        <>
                            <Text style={styles.childSectionLead}>
                                Nombre, género y foto se usan en el tablero, categorías y perfil del niño.
                            </Text>
                            <TouchableOpacity
                                style={styles.childAvatarWrap}
                                onPress={handleChildPhoto}
                                disabled={uploading || savingChild}
                                activeOpacity={0.85}
                            >
                                {uploading || savingChild ? (
                                    <ActivityIndicator size="large" color={colors.primary} />
                                ) : childProfile.avatar_url ? (
                                    <Image source={{ uri: childProfile.avatar_url }} style={styles.childAvatarImg} />
                                ) : (
                                    <View style={styles.childAvatarPh}>
                                        <Text style={styles.childAvatarLetter}>
                                            {(childProfile.name || 'N').charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.childCameraBadge}>
                                    <Ionicons name="camera" size={14} color={colors.onPrimary} />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.childPhotoHint}>Toca la foto para cambiarla</Text>
                            <Text style={styles.childFieldLabel}>Nombre</Text>
                            <TextInput
                                style={styles.childNameInput}
                                value={childNameDraft}
                                onChangeText={setChildNameDraft}
                                placeholder="Nombre del niño"
                                placeholderTextColor={colors.text.disabled}
                                autoCapitalize="words"
                            />
                            <TouchableOpacity
                                onPress={() => setChildGenderModalOpen(true)}
                                activeOpacity={0.7}
                                style={styles.childGenderRow}
                            >
                                <View style={sectionStyles.iconWrap}>
                                    <Ionicons name="body-outline" size={20} color={colors.tertiary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={sectionStyles.rowText}>Género</Text>
                                    <Text style={sectionStyles.rowSub}>
                                        {GENDER_LABELS[childProfile.gender ?? 'prefiero_no_decir']}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.text.disabled} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveChildBtn, savingChild && styles.saveChildBtnDisabled]}
                                onPress={() => void handleSaveChildName()}
                                disabled={savingChild}
                                activeOpacity={0.88}
                            >
                                <Text style={styles.saveChildBtnText}>Guardar nombre</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.childEmptyWrap}>
                            <Text style={styles.childEmptyTitle}>Sin perfil del niño todavía</Text>
                            <Text style={styles.childEmptySub}>
                                Podés completar nombre, foto, gustos y personas aquí mismo, o usar el asistente paso a paso.
                            </Text>
                            <TouchableOpacity
                                style={styles.saveChildBtn}
                                onPress={() => setChildProfileSetupOpen(true)}
                                activeOpacity={0.88}
                            >
                                <Text style={styles.saveChildBtnText}>Completar perfil aquí</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.childEmptySecondary}
                                onPress={() => router.push(ROUTES.onboarding)}
                                activeOpacity={0.88}
                            >
                                <Text style={styles.childEmptySecondaryText}>Ir a configuración inicial (paso a paso)</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card>

                <SectionHeader title="Tu cuenta" />
                <View style={styles.profileHeader}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress} activeOpacity={0.8}>
                        {uploading ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                        ) : (
                            <Image source={require('../assets/images/pinguin.png')} style={{ width: 90, height: 90 }} resizeMode="contain" />
                        )}
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={16} color={colors.onPrimary} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.username}>{displayName}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                {/* -- GENERAL -- */}
                <SectionHeader title="General" />
                <Card>
                    <Row icon="timer-outline"   label="Temporizador"        sub="Temporizador visual para tareas"  onPress={() => showTimer()} />
                    <RowSpacer />
                    <Row icon="list"            label="Mis oraciones"       sub="Historial de frases"              onPress={() => router.push('/sentences' as any)} />
                    <RowSpacer />
                    <Row icon="bar-chart"       label="Estadísticas de uso" sub="Reporte con actividad reciente"   onPress={() => router.push('/report' as any)} />
                    <RowSpacer />
                    <Row icon="volume-high"     label="Voz de pictogramas"  sub={VOICE_LABELS[voice].label}        onPress={() => setVoiceModalOpen(true)} />
                    <RowSpacer />
                    <Row
                        icon="chatbubble-outline"
                        label="Teclado de texto libre"
                        sub="Escribe y habla con voz neuronal"
                        right={
                            <Switch
                                value={showKeyboard}
                                onValueChange={toggleKeyboard}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={colors.white}
                            />
                        }
                    />
                </Card>

                <SectionHeader title="Apariencia" />
                <Card>
                    <Text
                        style={{
                            fontSize: 13,
                            fontFamily: Fonts.bodySemiBold,
                            color: colors.text.primary,
                            paddingHorizontal: 14,
                            paddingTop: 10,
                        }}
                    >
                        Color principal del tablero
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            fontFamily: Fonts.body,
                            color: colors.text.secondary,
                            paddingHorizontal: 14,
                            paddingTop: 4,
                            paddingBottom: 10,
                            lineHeight: 17,
                        }}
                    >
                        Se aplica al instante en tablero, pestañas y pantallas del niño.
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 14,
                            paddingHorizontal: 14,
                            paddingBottom: 14,
                            alignItems: 'center',
                        }}
                    >
                        {(['sage', 'rojo', 'azul'] as ThemeColor[]).map((key) => (
                            <TouchableOpacity
                                key={key}
                                onPress={() => setPalette(key)}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    key === 'sage' ? 'Verde salvia' : key === 'rojo' ? 'Rojo pálido' : 'Azul pizarra'
                                }
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 26,
                                    backgroundColor: Palettes[key].primary,
                                    borderWidth: palette === key ? 3 : 1,
                                    borderColor: palette === key ? colors.text.primary : 'rgba(29, 28, 18, 0.12)',
                                }}
                            />
                        ))}
                    </View>
                </Card>

                {/* -- CONTROL PARENTAL -- */}
                <SectionHeader title="Control parental" />
                <Card>
                    <Row
                        icon="pencil-outline"
                        label="Modo edición del tablero"
                        sub="Permite añadir y eliminar pictogramas"
                        right={
                            <Switch
                                value={isEditMode}
                                onValueChange={(v) => v ? enterEditMode() : lockEditMode()}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={colors.white}
                            />
                        }
                    />
                    <RowSpacer />
                    <Row
                        icon="layers-outline"
                        label="Nivel de vocabulario"
                        sub={currentLevelInfo.label}
                        onPress={() => setLevelModalOpen(true)}
                        right={
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={[styles.levelDot, { backgroundColor: currentLevelInfo.color }]} />
                                <Ionicons name="chevron-forward" size={18} color={colors.text.disabled} />
                            </View>
                        }
                    />
                    <RowSpacer />
                    <Row
                        icon="grid-outline"
                        label="Gestión de vocabulario"
                        sub="Activar/desactivar pictogramas individuales"
                        onPress={() => router.push('/vocabulary-manager' as any)}
                    />
                    <RowSpacer />
                    <Row
                        icon="clipboard-outline"
                        label="Actividades guiadas"
                        sub="Crear y gestionar actividades para el niño"
                        onPress={() => router.push('/activity-editor' as any)}
                    />
                    <RowSpacer />
                    <Row
                        icon="people-outline"
                        label="Equipo del niño"
                        sub="Invitar terapeutas y profesionales"
                        onPress={() => router.push('/team-manager' as any)}
                    />
                    <RowSpacer />
                    <Row
                        icon="location-outline"
                        label="Entorno activo"
                        sub={ENVIRONMENT_LABELS[activeEnvironment].label}
                        onPress={() => setEnvModalOpen(true)}
                    />
                    <RowSpacer />
                    <Row
                        icon="time-outline"
                        label="Límite de uso diario"
                        sub={settings?.daily_limit_minutes
                            ? `${settings.daily_limit_minutes} min • Usado hoy: ${Math.floor(usedSecondsToday / 60)} min`
                            : 'Desactivado'}
                        onPress={() => setLimitModalOpen(true)}
                    />
                    <RowSpacer />
                    <Row
                        icon="game-controller-outline"
                        label="Modo juego"
                        sub={settings?.game_mode_enabled ? 'Activado' : 'Desactivado'}
                        right={
                            <Switch
                                value={settings?.game_mode_enabled ?? false}
                                onValueChange={(v) => updateGameMode(v)}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={colors.white}
                            />
                        }
                    />
                </Card>

                {/* -- CONFIGURACIÓN SENSORIAL -- */}
                <SectionHeader title="Configuración sensorial" />
                <Card>
                    <Row icon="speedometer-outline" label="Velocidad de la voz"       sub={`${currentSpeedOpt.label} (${currentSpeedOpt.sub})`} onPress={() => setSpeedModalOpen(true)} />
                    <RowSpacer />
                    <Row icon="sparkles-outline"    label="Intensidad de animaciones" sub={currentAnimInfo.label}                                onPress={() => setAnimModalOpen(true)} />
                </Card>

                {/* -- CONFIGURACIÓN INICIAL -- */}
                <SectionHeader title="Configuración inicial" />
                <Card>
                    <Row
                        icon="refresh-outline"
                        label="Repetir configuración inicial"
                        sub="Volver a los pasos de ajuste del perfil"
                        onPress={() => {
                            Alert.alert(
                                'Repetir configuración',
                                'Se volverán a mostrar los pasos iniciales. ¿Continuar?',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Continuar',
                                        onPress: async () => {
                                            await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
                                            router.replace(ROUTES.onboarding);
                                        },
                                    },
                                ]
                            );
                        }}
                    />
                    <RowSpacer />
                    <Row
                        icon="school-outline"
                        label="Repetir tutorial"
                        sub={
                            profile?.level === 'BASICO'
                                ? 'Tutorial básico (nivel 1)'
                                : 'Tutorial guiado con voz grabada (intermedio / avanzado)'
                        }
                        onPress={() => {
                            Alert.alert(
                                'Repetir tutorial',
                                'Se abrirá el tutorial desde el inicio. ¿Continuar?',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Continuar',
                                        onPress: async () => {
                                            if (profile?.level === 'BASICO') {
                                                await AsyncStorage.removeItem(STORAGE_KEYS.TUTORIAL_BASIC_COMPLETED);
                                                router.push(ROUTES.tutorialBasic);
                                            } else {
                                                await AsyncStorage.removeItem(STORAGE_KEYS.TUTORIAL_COMPLETED);
                                                router.push(ROUTES.tutorial);
                                            }
                                        },
                                    },
                                ],
                            );
                        }}
                    />
                </Card>

                {/* -- PRIVACIDAD Y DATOS -- */}
                <SectionHeader title="Privacidad y datos" />
                <Card>
                    <Row
                        icon="document-text-outline"
                        label="Política de privacidad"
                        sub="Ver cómo usamos tus datos"
                        onPress={() => Linking.openURL('https://comuniteaapp.com/privacidad')}
                    />
                    <RowSpacer />
                    <Row
                        icon="trash-outline"
                        label="Eliminar todos mis datos"
                        sub="Borra tu cuenta y toda la información"
                        onPress={handleDeleteAccount}
                    />
                </Card>

                {/* -- CERRAR SESIÓN -- */}
                <TouchableOpacity
                    style={[styles.logoutButton, signingOut && { opacity: 0.6 }]}
                    activeOpacity={0.7}
                    onPress={handleSignOut}
                    disabled={signingOut}
                >
                    {signingOut
                        ? <ActivityIndicator color={colors.danger} />
                        : <Text style={styles.logoutText}>Cerrar sesión</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
function createSettingsScreenStyles(colors: AppColorPalette) {
    return StyleSheet.create({
    container:     { flex: 1, backgroundColor: colors.surface },
    scroll:        { paddingHorizontal: 20, paddingBottom: 40 },
    profileHeader: { alignItems: 'center', paddingVertical: 24 },
    avatarContainer: {
        width: 120, height: 120, borderRadius: Radii.xl,
        backgroundColor: colors.surfaceContainerLowest,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
        ...ShadowAmbientLight,
        overflow: 'visible',
    },
    avatar:    { width: 120, height: 120, borderRadius: Radii.xl },
    cameraIcon: {
        position: 'absolute', bottom: 2, right: 2,
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: colors.surface,
    },
    username:  { fontSize: 22, fontFamily: Fonts.displayBold, color: colors.text.primary, marginBottom: 4 },
    email:     { fontSize: 14, fontFamily: Fonts.body, color: colors.text.secondary },
    firstSection: {
        marginTop: 4,
    },
    childSectionLead: {
        fontSize: 13,
        fontFamily: Fonts.body,
        color: colors.text.secondary,
        paddingHorizontal: 14,
        marginBottom: 12,
        lineHeight: 18,
    },
    childEmptyWrap: {
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    childEmptyTitle: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: colors.text.primary,
        marginBottom: 8,
    },
    childEmptySub: {
        fontSize: 14,
        fontFamily: Fonts.body,
        color: colors.text.secondary,
        marginBottom: 16,
        lineHeight: 20,
    },
    childEmptySecondary: {
        marginTop: 4,
        marginBottom: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    childEmptySecondaryText: {
        fontSize: 14,
        fontFamily: Fonts.bodySemiBold,
        color: colors.primary,
        textDecorationLine: 'underline',
    },
    childAvatarWrap: {
        alignSelf: 'center',
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 8,
        overflow: 'visible',
        ...ShadowAmbientLight,
    },
    childAvatarImg: { width: 100, height: 100, borderRadius: 50 },
    childAvatarPh: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.surfaceContainerHigh,
        justifyContent: 'center',
        alignItems: 'center',
    },
    childAvatarLetter: { fontSize: 36, fontFamily: Fonts.displayBold, color: colors.primary },
    childCameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.surface,
    },
    childPhotoHint: {
        textAlign: 'center',
        fontSize: 12,
        fontFamily: Fonts.body,
        color: colors.text.secondary,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    childFieldLabel: {
        fontSize: 12,
        fontFamily: Fonts.bodyBold,
        color: colors.text.secondary,
        marginBottom: 6,
        paddingHorizontal: 14,
    },
    childNameInput: {
        marginHorizontal: 14,
        marginBottom: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16,
        fontFamily: Fonts.body,
        color: colors.text.primary,
        backgroundColor: colors.surface,
    },
    childGenderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Space.md,
        paddingHorizontal: 14,
        gap: 12,
    },
    saveChildBtn: {
        marginHorizontal: 14,
        marginTop: 8,
        marginBottom: 12,
        paddingVertical: 14,
        borderRadius: Radii.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    saveChildBtnDisabled: { opacity: 0.6 },
    saveChildBtnText: { fontSize: 15, fontFamily: Fonts.bodyBold, color: colors.onPrimary },
    levelDot:  { width: 10, height: 10, borderRadius: 5 },
    logoutButton: {
        marginTop: 8,
        paddingVertical: 18,
        borderRadius: Radii.lg,
        backgroundColor: colors.surfaceContainerLow,
        alignItems: 'center',
    },
    logoutText: { fontSize: 16, fontFamily: Fonts.bodyBold, color: colors.danger },
    });
}

function createSectionStyles(colors: AppColorPalette) {
    return StyleSheet.create({
    header: {
        fontSize: 11,
        fontFamily: Fonts.bodyBold,
        color: colors.text.secondary,
        letterSpacing: 1,
        marginTop: 24,
        marginBottom: Space.sm,
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: Radii.lg,
        paddingVertical: Space.sm,
        ...ShadowAmbientLight,
        overflow: 'hidden',
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: Radii.sm,
        backgroundColor: colors.surfaceContainerHigh,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Space.md,
        paddingHorizontal: 14,
        gap: 12,
    },
    rowText: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: colors.text.primary },
    rowSub:  { fontSize: 12, fontFamily: Fonts.body, color: colors.text.secondary, marginTop: 1 },
    rowSpacer: { height: Space.md },
    });
}

function createModalStyles(colors: AppColorPalette) {
    return StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(29, 28, 18, 0.35)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.surfaceContainerLowest,
        borderTopLeftRadius: Radii.xl,
        borderTopRightRadius: Radii.xl,
        paddingTop: 12,
        paddingBottom: 36,
        paddingHorizontal: 20,
        borderTopWidth: 6,
        borderTopColor: colors.secondaryContainer,
        ...ShadowAmbientLight,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 5,
        borderRadius: Radii.sm,
        backgroundColor: colors.surfaceContainerHighest,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontFamily: Fonts.displayBold,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: Fonts.body,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 18,
    },
    optionsList: { gap: 8, marginBottom: 16 },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: Radii.default,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    optionSelected: {
        backgroundColor: colors.surfaceContainerHigh,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: Radii.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionLabel: {
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: colors.text.primary,
    },
    optionLabelSelected: { color: colors.primary },
    optionSub: {
        fontSize: 12,
        fontFamily: Fonts.body,
        color: colors.text.secondary,
        marginTop: 1,
    },
    optionCheck: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: 'rgba(29, 28, 18, 0.15)',
    },
    cancelBtn: {
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: Radii.default,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 4,
    },
    cancelText: { fontSize: 15, fontFamily: Fonts.bodyBold, color: colors.text.secondary },
    });
}