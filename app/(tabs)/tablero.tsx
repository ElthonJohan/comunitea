import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    Pressable,
    Modal,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useChildProfile, type ChildProfileInput } from '../../context/ChildProfileContext';
import { useTablero, categoriasFromSubcats } from '../../features/tablero/hooks/useTablero';
import { useFrase } from '../../features/tablero/hooks/useFrase';
import { useUserGroup } from '../../features/ejercicios/hooks/useUserGroup';
import Header from '../../features/tablero/components/Header';
import FraseBar from '../../features/tablero/components/FraseBar';
import PersonasPeticiones from '../../features/tablero/components/PersonasPeticiones';
import PersonasPeticionesDrawer from '../../features/tablero/components/PersonasPeticionesDrawer';
import SubcategoriaRow from '../../features/tablero/components/SubcategoriaRow';
import { TABLERO_LAYOUT } from '../../constants/TableroTheme';
import type { TableroThemeTokens } from '../../constants/TableroTheme';
import { useTableroTheme } from '../../hooks/useTableroTheme';
import type { Subcategoria, Pictograma } from '../../features/tablero/hooks/useTablero';
import { getPictogramAudioKey } from '../../features/tablero/data/tablero';
import {
    mergeAllSubcats,
    formatImportantPersonLine,
    parseImportantPersonLine,
    seedImportantPeopleFromPersonasRow,
} from '../../features/tablero/buildMergedBoard';
import { useSpeech } from '../../features/vocabulario/hooks/useSpeech';
import { Fonts } from '../../constants/Typography';
import { ROUTES, hrefCategorias } from '../../types/routes';
import { headerGamificationDisplay } from '../../lib/gamificationHeader';

const CATEGORY_BAR_H = TABLERO_LAYOUT.catButtonHeight;

function parseCatParam(cat: string | string[] | undefined): string | undefined {
    if (typeof cat === 'string' && cat.length > 0) return cat;
    if (Array.isArray(cat) && cat[0]) return cat[0];
    return undefined;
}

function createTableroScreenStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
        safe: {
            flex: 1,
            backgroundColor: T.tableroCanvas,
        },
        layer: {
            flex: 1,
            position: 'relative',
        },
        categoryBar: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginTop: 8,
            marginHorizontal: 12,
            minHeight: CATEGORY_BAR_H,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 10,
            backgroundColor: T.catButtonSolid,
        },
        backHit: {
            minWidth: 48,
            minHeight: 48,
            justifyContent: 'center',
            alignItems: 'center',
        },
        backPressed: {
            opacity: 0.85,
        },
        categoryTitle: {
            flex: 1,
            fontSize: 16,
            fontFamily: Fonts.bodySemiBold,
            color: T.catButtonOnSolid,
        },
        sectionSpacer: {
            height: 8,
        },
        listBg: {
            flex: 1,
            backgroundColor: T.tableroCanvas,
        },
        subcatSeparator: {
            height: 10,
        },
        listContent: {
            paddingTop: 8,
            paddingHorizontal: 12,
            paddingBottom: 12,
        },
        moreDots: {
            textAlign: 'center',
            fontSize: 18,
            color: T.tabInactive,
            marginTop: 8,
            fontFamily: Fonts.bodyBold,
        },
    });
}

function createAddPersonaModalStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
        backdrop: {
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            backgroundColor: 'rgba(29, 28, 18, 0.45)',
        },
        sheet: {
            borderRadius: 16,
            padding: 20,
            backgroundColor: T.surfaceCard,
        },
        sheetTitle: {
            fontSize: 18,
            fontFamily: Fonts.bodyBold,
            color: T.textPrimary,
            marginBottom: 6,
        },
        sheetSub: {
            fontSize: 13,
            fontFamily: Fonts.body,
            color: T.textSecondary,
            marginBottom: 16,
            lineHeight: 18,
        },
        row: {
            flexDirection: 'row',
            gap: 10,
            marginBottom: 18,
        },
        emojiIn: {
            width: 56,
            height: 48,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'rgba(29, 28, 18, 0.15)',
            textAlign: 'center',
            fontSize: 26,
            color: T.textPrimary,
        },
        nameIn: {
            flex: 1,
            height: 48,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'rgba(29, 28, 18, 0.15)',
            paddingHorizontal: 12,
            fontSize: 16,
            fontFamily: Fonts.body,
            color: T.textPrimary,
        },
        btns: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 12,
        },
        btnGhost: {
            paddingVertical: 12,
            paddingHorizontal: 16,
        },
        btnGhostTxt: {
            fontSize: 15,
            fontFamily: Fonts.bodySemiBold,
            color: T.textSecondary,
        },
        btnPrimary: {
            paddingVertical: 12,
            paddingHorizontal: 22,
            borderRadius: 12,
            backgroundColor: T.catButtonSolid,
            minWidth: 100,
            alignItems: 'center',
            justifyContent: 'center',
        },
        btnPrimaryTxt: {
            fontSize: 15,
            fontFamily: Fonts.bodyBold,
            color: T.catButtonOnSolid,
        },
    });
}

export default function TableroScreen() {
    const T = useTableroTheme();
    const styles = useMemo(() => createTableroScreenStyles(T), [T]);
    const addPersonaStyles = useMemo(() => createAddPersonaModalStyles(T), [T]);
    const router = useRouter();
    const params = useLocalSearchParams<{ cat?: string | string[] }>();
    const catId = parseCatParam(params.cat);

    const { profile } = useAuth();
    const { childProfile, childProgress, saveChildProfile, refreshChildProfile } = useChildProfile();
    const { pictoWidth, pictoHeight, nivel, maxSubcategoriasVisibles } = useUserGroup();
    const { listRef, personas, peticiones } = useTablero();

    const {
        slotPersona,
        slotPeticion,
        slotsObjeto,
        puedeHablar,
        agregarPersona,
        agregarPeticion,
        agregarObjeto,
        quitarPictograma,
        limpiarFrase,
        leerFrase,
    } = useFrase();

    const { speakWithAssetKey } = useSpeech();
    const speakPictoRef = useRef(speakWithAssetKey);
    speakPictoRef.current = speakWithAssetKey;

    const [lastPictoId, setLastPictoId] = useState<string | null>(null);
    const [drawerKind, setDrawerKind] = useState<'persona' | 'peticion' | null>(null);
    const [addPersonaOpen, setAddPersonaOpen] = useState(false);
    const [addPersonEmoji, setAddPersonEmoji] = useState('👤');
    const [addPersonName, setAddPersonName] = useState('');
    const [addPersonSaving, setAddPersonSaving] = useState(false);

    useEffect(() => {
        if (addPersonaOpen) {
            setAddPersonEmoji('👤');
            setAddPersonName('');
        }
    }, [addPersonaOpen]);

    const openAddPersonaModal = useCallback(() => {
        setAddPersonaOpen(true);
    }, []);

    const handleSaveNewPersona = useCallback(async () => {
        const n = addPersonName.trim();
        if (!n) {
            Alert.alert('Nombre', 'Ingresá un nombre para la persona.');
            return;
        }
        if (!childProfile) {
            Alert.alert(
                'Perfil del niño',
                'Completá el perfil del niño en Ajustes antes de agregar personas.',
            );
            return;
        }
        setAddPersonSaving(true);
        try {
            const line = formatImportantPersonLine(addPersonEmoji, n);
            const current = [...(childProfile.important_people ?? [])];
            let next = current;
            if (next.length === 0) {
                next = seedImportantPeopleFromPersonasRow();
            }
            const dup = next.some((x) => parseImportantPersonLine(x).name === n);
            if (dup) {
                Alert.alert('Duplicado', 'Ya hay una persona con ese nombre.');
                return;
            }
            next.push(line);
            const { id: _id, user_id: _uid, ...editable } = childProfile;
            await saveChildProfile({ ...editable, important_people: next } as ChildProfileInput);
            await refreshChildProfile();
            setAddPersonaOpen(false);
        } catch {
            Alert.alert('Error', 'No se pudo guardar la persona.');
        } finally {
            setAddPersonSaving(false);
        }
    }, [addPersonEmoji, addPersonName, childProfile, refreshChildProfile, saveChildProfile]);

    const isBasico = nivel === 'basic';

    const mergedSubcats = useMemo(
        () => mergeAllSubcats(childProfile?.preferred_activities),
        [childProfile?.preferred_activities],
    );

    const categoriasResumen = useMemo(() => categoriasFromSubcats(mergedSubcats), [mergedSubcats]);

    const subcategoriasFiltradas = useMemo(() => {
        if (!catId) return [] as Subcategoria[];
        let rows = mergedSubcats.filter((s) => s.categoriaId === catId);
        if (isBasico) {
            rows = rows.slice(0, maxSubcategoriasVisibles);
        }
        return rows;
    }, [catId, isBasico, maxSubcategoriasVisibles, mergedSubcats]);

    const categoryTitle = useMemo(() => {
        if (!catId) return 'Tablero';
        return categoriasResumen.find((c) => c.id === catId)?.nombre ?? 'Tablero';
    }, [catId, categoriasResumen]);

    useFocusEffect(
        useCallback(() => {
            if (!catId) {
                router.replace(hrefCategorias());
            }
        }, [catId, router]),
    );

    const childName = childProfile?.name ?? 'Niño';
    const { nivelLabel, xpProgress } = headerGamificationDisplay(
        childProgress,
        profile?.level ?? 'BASICO',
    );

    const handleAddPersona = useCallback(
        (p: Pictograma) => {
            void speakPictoRef.current(p.label, getPictogramAudioKey(p));
            agregarPersona(p);
            setLastPictoId(null);
        },
        [agregarPersona],
    );

    const handleAddPeticion = useCallback(
        (p: Pictograma) => {
            void speakPictoRef.current(p.label, getPictogramAudioKey(p));
            agregarPeticion(p);
            setLastPictoId(null);
        },
        [agregarPeticion],
    );

    const handleAddObjeto = useCallback(
        (p: Pictograma) => {
            void speakPictoRef.current(p.label, getPictogramAudioKey(p));
            agregarObjeto(p);
            setLastPictoId(p.id);
        },
        [agregarObjeto],
    );

    const renderRow = useCallback(
        ({ item }: { item: Subcategoria }) => (
            <SubcategoriaRow
                nombre={item.nombre}
                pictogramas={item.pictogramas}
                onAddPictograma={handleAddObjeto}
                onPressPlus={() => Alert.alert('Próximamente', 'Agregar pictogramas a esta fila.')}
                pictoWidth={pictoWidth}
                pictoHeight={pictoHeight}
                activePictoId={lastPictoId}
                vertical={isBasico}
            />
        ),
        [handleAddObjeto, lastPictoId, pictoHeight, pictoWidth, isBasico],
    );

    if (!catId) {
        return null;
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <View style={styles.layer}>
                <Header
                    childName={childName}
                    nivelLabel={nivelLabel}
                    xpProgress={xpProgress}
                    avatarUri={childProfile?.avatar_url}
                    initialLetter={childName.charAt(0)}
                    onPressHome={() => router.replace(hrefCategorias())}
                    onPressStar={() => router.replace(ROUTES.perfil)}
                    onPressSettings={() => router.push(ROUTES.settings)}
                />
                <View style={styles.categoryBar}>
                    <Pressable
                        onPress={() => router.replace(hrefCategorias())}
                        style={({ pressed }) => [styles.backHit, pressed && styles.backPressed]}
                        accessibilityRole="button"
                        accessibilityLabel="Volver a categorías"
                        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                    >
                        <Ionicons name="arrow-back" size={32} color={T.catButtonOnSolid} />
                    </Pressable>
                    <Text style={styles.categoryTitle} numberOfLines={1}>
                        {categoryTitle}
                    </Text>
                </View>
                <FraseBar
                    slotPersona={slotPersona}
                    slotPeticion={slotPeticion}
                    slotsObjeto={slotsObjeto}
                    puedeHablar={puedeHablar}
                    onClear={limpiarFrase}
                    onSpeak={leerFrase}
                    onRemoveSlot={quitarPictograma}
                    isBasico={isBasico}
                    onOpenPersonaDrawer={() => setDrawerKind('persona')}
                    onOpenPeticionDrawer={() => setDrawerKind('peticion')}
                />
                {!isBasico ? (
                    <PersonasPeticiones
                        personas={personas}
                        peticiones={peticiones}
                        onAddPersona={handleAddPersona}
                        onAddPeticion={handleAddPeticion}
                        onAddPersonaExtra={openAddPersonaModal}
                        onAddPeticionExtra={() => Alert.alert('Próximamente', 'Agregar petición')}
                    />
                ) : null}
                <View style={styles.sectionSpacer} />
                <FlatList
                    ref={listRef}
                    data={subcategoriasFiltradas}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRow}
                    style={styles.listBg}
                    ItemSeparatorComponent={() => <View style={styles.subcatSeparator} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator
                    onScrollToIndexFailed={(info) => {
                        setTimeout(() => {
                            listRef.current?.scrollToIndex({
                                index: info.index,
                                animated: true,
                                viewPosition: 0,
                            });
                        }, 350);
                    }}
                    ListFooterComponent={
                        subcategoriasFiltradas.length > 2 ? (
                            <Text style={styles.moreDots}>· · ·</Text>
                        ) : null
                    }
                />
                {isBasico ? (
                    <PersonasPeticionesDrawer
                        visible={drawerKind !== null}
                        kind={drawerKind}
                        items={drawerKind === 'persona' ? personas : drawerKind === 'peticion' ? peticiones : []}
                        onSelect={(p) => {
                            if (drawerKind === 'persona') handleAddPersona(p);
                            else if (drawerKind === 'peticion') handleAddPeticion(p);
                        }}
                        onClose={() => setDrawerKind(null)}
                        onAddExtra={
                            drawerKind === 'persona'
                                ? openAddPersonaModal
                                : drawerKind === 'peticion'
                                  ? () => Alert.alert('Próximamente', 'Agregar petición')
                                  : undefined
                        }
                    />
                ) : null}
                <Modal
                    visible={addPersonaOpen}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setAddPersonaOpen(false)}
                >
                    <KeyboardAvoidingView
                        style={addPersonaStyles.backdrop}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <Pressable style={StyleSheet.absoluteFill} onPress={() => setAddPersonaOpen(false)} />
                        <View style={addPersonaStyles.sheet}>
                            <Text style={addPersonaStyles.sheetTitle}>Agregar persona</Text>
                            <Text style={addPersonaStyles.sheetSub}>
                                Elegí un emoji y un nombre. Si es la primera, se conservan Mamá, Papá… y se agrega la nueva.
                            </Text>
                            <View style={addPersonaStyles.row}>
                                <TextInput
                                    style={addPersonaStyles.emojiIn}
                                    value={addPersonEmoji}
                                    onChangeText={(t) => setAddPersonEmoji(t.trim().slice(0, 8) || '👤')}
                                    maxLength={8}
                                    autoCapitalize="none"
                                />
                                <TextInput
                                    style={addPersonaStyles.nameIn}
                                    value={addPersonName}
                                    onChangeText={setAddPersonName}
                                    placeholder="Nombre"
                                    placeholderTextColor={T.tabInactive}
                                    maxLength={30}
                                />
                            </View>
                            <View style={addPersonaStyles.btns}>
                                <TouchableOpacity
                                    style={addPersonaStyles.btnGhost}
                                    onPress={() => setAddPersonaOpen(false)}
                                    disabled={addPersonSaving}
                                >
                                    <Text style={addPersonaStyles.btnGhostTxt}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={addPersonaStyles.btnPrimary}
                                    onPress={() => void handleSaveNewPersona()}
                                    disabled={addPersonSaving}
                                >
                                    {addPersonSaving ? (
                                        <ActivityIndicator color={T.catButtonOnSolid} />
                                    ) : (
                                        <Text style={addPersonaStyles.btnPrimaryTxt}>Guardar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </SafeAreaView>
    );
}
