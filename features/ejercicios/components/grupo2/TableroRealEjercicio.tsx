import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useTablero, type Subcategoria, type Pictograma } from '../../../tablero/hooks/useTablero';
import { useFrase } from '../../../tablero/hooks/useFrase';
import { useUserGroup } from '../../hooks/useUserGroup';
import CatButton, { CAT_BUTTON_HEIGHT } from '../../../../features/tablero/components/CatButton';
import FraseBar from '../../../../features/tablero/components/FraseBar';
import PersonasPeticiones from '../../../../features/tablero/components/PersonasPeticiones';
import SubcategoriaRow from '../../../../features/tablero/components/SubcategoriaRow';
import CategoriasOverlay from '../../../../features/tablero/components/CategoriasOverlay';
import { useTableroTheme } from '../../../../hooks/useTableroTheme';
import { Fonts } from '../../../../constants/Typography';
import { G2_N4_E3 } from '../../data/grupo2';
import { buildFraseYoQuieroFromLabels, VOZ_TABLERO_G2_MIN_PICTOS } from '../../../../features/tablero/data/voice/frase';
import { speakG2, stopSpeakG2 } from '../../../../lib/speakG2';

/** FraseBar + márgenes (sin Header de tabs principal) */
const FRASE_BAR_AREA = 72;
const OVERLAY_TOP = CAT_BUTTON_HEIGHT + FRASE_BAR_AREA + 20;

type Props = {
    childName: string;
    /** Mínimo de pictogramas en la frase para aceptar ▶ (por defecto 2) */
    minSlotsParaCompletar?: number;
    onPhraseComplete: () => void;
    /** Si > 0, tras este tiempo sin actividad se da una pista por voz (una vez) */
    idleHintMs?: number;
    idleHintText?: string;
};

export function TableroRealEjercicio({
    childName,
    minSlotsParaCompletar = 2,
    onPhraseComplete,
    idleHintMs = 0,
    idleHintText = G2_N4_E3.vozIdle,
}: Props) {
    const T = useTableroTheme();
    const { pictoWidth, pictoHeight } = useUserGroup();
    const lastAct = useRef(Date.now());
    const hintSpoken = useRef(false);
    const completed = useRef(false);

    const bump = useCallback(() => {
        lastAct.current = Date.now();
    }, []);

    const {
        subcategorias,
        categorias,
        categoriaActiva,
        categoriaActivaLabel,
        overlayVisible,
        openOverlay,
        closeOverlay,
        selectCategoria,
        clearCategoriaActiva,
        listRef,
        personas,
        peticiones,
    } = useTablero();

    const openOverlayB = useCallback(() => {
        bump();
        openOverlay();
    }, [bump, openOverlay]);

    const selectCategoriaB = useCallback(
        (id: string) => {
            bump();
            selectCategoria(id);
        },
        [bump, selectCategoria],
    );

    const {
        slotPersona,
        slotPeticion,
        slotsObjeto,
        slots,
        agregarPictograma,
        quitarPictograma,
        limpiarFrase,
    } = useFrase();

    const filledCount = slots.filter(Boolean).length;

    const handleAddPic = useCallback(
        (p: Pictograma) => {
            bump();
            agregarPictograma(p);
        },
        [agregarPictograma, bump],
    );

    const handleAddPersona = useCallback(
        (p: Pictograma) => {
            bump();
            agregarPictograma(p);
        },
        [agregarPictograma, bump],
    );

    const handleAddPeticion = useCallback(
        (p: Pictograma) => {
            bump();
            agregarPictograma(p);
        },
        [agregarPictograma, bump],
    );

    const handleSpeak = useCallback(async () => {
        bump();
        if (completed.current) return;
        if (filledCount < minSlotsParaCompletar) {
            await speakG2(VOZ_TABLERO_G2_MIN_PICTOS, 300);
            return;
        }
        const labels = slots.filter(Boolean).map((p) => p!.label);
        if (labels.length === 0) return;
        const text = buildFraseYoQuieroFromLabels(labels);
        stopSpeakG2();
        await speakG2(text, 200);
        completed.current = true;
        onPhraseComplete();
    }, [filledCount, minSlotsParaCompletar, onPhraseComplete, slots]);

    useEffect(() => {
        if (!idleHintMs || idleHintMs <= 0) return;
        const t = setInterval(() => {
            if (hintSpoken.current || completed.current) return;
            if (Date.now() - lastAct.current >= idleHintMs) {
                hintSpoken.current = true;
                speakG2(idleHintText, 400);
            }
        }, 1000);
        return () => clearInterval(t);
    }, [idleHintMs, idleHintText]);

    const renderRow = useCallback(
        ({ item }: { item: Subcategoria }) => (
            <SubcategoriaRow
                nombre={item.nombre}
                pictogramas={item.pictogramas}
                onAddPictograma={handleAddPic}
                onPressPlus={() => Alert.alert('Próximamente', 'Agregar pictogramas a esta fila.')}
                pictoWidth={pictoWidth}
                pictoHeight={pictoHeight}
            />
        ),
        [handleAddPic, pictoHeight, pictoWidth],
    );

    const puedeHablarEjercicio = filledCount >= minSlotsParaCompletar;

    return (
        <View style={styles.layer} onTouchEnd={bump}>
            <CatButton
                categoriaActiva={categoriaActiva}
                labelActiva={categoriaActivaLabel}
                onPress={openOverlayB}
            />
            <FraseBar
                slotPersona={slotPersona}
                slotPeticion={slotPeticion}
                slotsObjeto={slotsObjeto}
                puedeHablar={puedeHablarEjercicio}
                onClear={() => {
                    bump();
                    limpiarFrase();
                }}
                onSpeak={() => {
                    void handleSpeak();
                }}
                onRemoveSlot={(i) => {
                    bump();
                    quitarPictograma(i);
                }}
            />
            <PersonasPeticiones
                personas={personas}
                peticiones={peticiones}
                onAddPersona={handleAddPersona}
                onAddPeticion={handleAddPeticion}
                onAddPersonaExtra={() => Alert.alert('Próximamente', 'Agregar persona')}
                onAddPeticionExtra={() => Alert.alert('Próximamente', 'Agregar petición')}
            />
            <View style={styles.sectionSpacer} />
            <FlatList
                ref={listRef}
                data={subcategorias}
                keyExtractor={(item) => item.id}
                renderItem={renderRow}
                ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator
                onScrollBeginDrag={bump}
                onTouchEnd={bump}
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
                    subcategorias.length > 2 ? (
                        <Text style={[styles.moreDots, { color: T.tabInactive }]}>· · ·</Text>
                    ) : null
                }
            />
            <CategoriasOverlay
                visible={overlayVisible}
                top={OVERLAY_TOP}
                categorias={categorias}
                categoriaActiva={categoriaActiva}
                onClose={closeOverlay}
                onSelectCategoria={selectCategoriaB}
                onClearCategoria={clearCategoriaActiva}
                onNuevaCategoria={() => {
                    closeOverlay();
                    Alert.alert('Próximamente', 'Crear categoría nueva');
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    layer: {
        flex: 1,
        position: 'relative',
        minHeight: 200,
    },
    sectionSpacer: {
        height: 16,
    },
    listContent: {
        padding: 6,
        paddingBottom: 24,
    },
    moreDots: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 8,
        fontFamily: Fonts.bodyBold,
    },
});
