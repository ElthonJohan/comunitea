import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Fonts } from '../../../constants/Typography';
import { TABLERO_CHILD_PICTO_ID } from '../../../constants/TableroTheme';
import type { TableroThemeTokens } from '../../../constants/TableroTheme';
import { Space } from '../../../constants/Theme';
import { useTableroTheme } from '../../../hooks/useTableroTheme';
import type { Pictograma } from '../data/tablero';

type SlotKind = 'persona' | 'peticion' | 'objeto';

type Props = {
    slotPersona: Pictograma;
    slotPeticion: Pictograma | null;
    slotsObjeto: [Pictograma | null, Pictograma | null];
    puedeHablar: boolean;
    onClear: () => void;
    onSpeak: () => void;
    onRemoveSlot: (index: number) => void;
    /** Grupo 3 (BASICO): slot “Quién” con niño por defecto o “Qué” vacío abre drawer. */
    isBasico?: boolean;
    onOpenPersonaDrawer?: () => void;
    onOpenPeticionDrawer?: () => void;
};

const SLOT_W = 58;
const SLOT_H = 58;
const R_SLOT = 12;
/** RN Animated.spring: `tension` ~ rigidez (spec pedía stiffness 200). */
const SPRING_IN = { tension: 200, friction: 12, useNativeDriver: true as const };

function slotColors(T: TableroThemeTokens, kind: SlotKind, filled: boolean) {
    if (kind === 'persona') {
        return {
            border: filled ? T.slotPersonaBorderFull : T.slotPersonaBorderEmpty,
            bg: filled ? T.slotPersonaBgFull : T.slotPersonaBgEmpty,
            label: T.slotPersonaMicroLabel,
        };
    }
    if (kind === 'peticion') {
        return {
            border: filled ? T.slotPeticionBorderFull : T.slotPeticionBorderEmpty,
            bg: filled ? T.slotPeticionBgFull : T.slotPeticionBgEmpty,
            label: T.slotPeticionMicroLabel,
        };
    }
    return {
        border: filled ? T.slotObjetoBorderFull : T.slotObjetoBorderEmpty,
        bg: filled ? T.slotObjetoBgFull : T.fraseBarBg,
        label: T.textMuted,
    };
}

function SemanticSlot({
    styles,
    kind,
    pic,
    microLabel,
    onPress,
}: {
    styles: ReturnType<typeof createFraseBarStyles>;
    kind: SlotKind;
    pic: Pictograma | null;
    microLabel?: string;
    onPress: () => void;
}) {
    const T = useTableroTheme();
    const filled = pic !== null;
    const c = slotColors(T, kind, filled);
    const emojiScale = useRef(new Animated.Value(filled ? 1 : 0)).current;

    useEffect(() => {
        if (filled && pic) {
            emojiScale.setValue(0);
            Animated.spring(emojiScale, { ...SPRING_IN, toValue: 1 }).start();
        } else {
            emojiScale.setValue(0);
        }
    }, [filled, pic?.id, emojiScale]);

    const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };

    return (
        <Pressable
            onPress={onPress}
            hitSlop={hitSlop}
            accessibilityLabel={pic ? `${pic.label}, quitar` : microLabel ?? 'Vacío'}
            style={styles.slotColumn}
        >
            {microLabel ? (
                <Text style={[styles.microLabel, { color: c.label }]} numberOfLines={1}>
                    {microLabel}
                </Text>
            ) : (
                <View style={styles.microLabelSpacer} />
            )}
            <View
                style={[
                    styles.slotBox,
                    {
                        borderColor: c.border,
                        backgroundColor: c.bg,
                        borderStyle: filled ? 'solid' : 'dashed',
                    },
                ]}
            >
                {pic ? (
                    <Animated.Text style={[styles.slotEmoji, { transform: [{ scale: emojiScale }] }]}>
                        {pic.emoji}
                    </Animated.Text>
                ) : null}
            </View>
        </Pressable>
    );
}

export default function FraseBar({
    slotPersona,
    slotPeticion,
    slotsObjeto,
    puedeHablar,
    onClear,
    onSpeak,
    onRemoveSlot,
    isBasico = false,
    onOpenPersonaDrawer,
    onOpenPeticionDrawer,
}: Props) {
    const T = useTableroTheme();
    const styles = useMemo(() => createFraseBarStyles(T), [T]);
    const speakScale = useRef(new Animated.Value(1)).current;

    const pressSpeak = () => {
        if (!puedeHablar) return;
        Animated.sequence([
            Animated.timing(speakScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(speakScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
        onSpeak();
    };

    const personaIsDefaultChild = slotPersona.id === TABLERO_CHILD_PICTO_ID;

    const onPersonaSlotPress = () => {
        if (isBasico && personaIsDefaultChild) {
            onOpenPersonaDrawer?.();
            return;
        }
        onRemoveSlot(0);
    };

    const onPeticionSlotPress = () => {
        if (isBasico && slotPeticion === null) {
            onOpenPeticionDrawer?.();
            return;
        }
        onRemoveSlot(1);
    };

    return (
        <Pressable 
            style={styles.bar} 
            onPress={puedeHablar ? pressSpeak : undefined}
            accessibilityLabel={puedeHablar ? "Hablar frase completa" : "Frase vacía"}
        >
            <SemanticSlot
                styles={styles}
                kind="persona"
                pic={isBasico && personaIsDefaultChild ? null : slotPersona}
                microLabel="Quién"
                onPress={onPersonaSlotPress}
            />
            <SemanticSlot
                styles={styles}
                kind="peticion"
                pic={slotPeticion}
                microLabel="Qué"
                onPress={onPeticionSlotPress}
            />
            <View style={styles.sep} />
            <SemanticSlot styles={styles} kind="objeto" pic={slotsObjeto[0]} onPress={() => onRemoveSlot(2)} />
            <SemanticSlot styles={styles} kind="objeto" pic={slotsObjeto[1]} onPress={() => onRemoveSlot(3)} />

            <Pressable
                onPress={onClear}
                style={({ pressed }) => [styles.btnClear, pressed && styles.btnPressed]}
                accessibilityLabel="Limpiar frase"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Text style={styles.btnClearText}>✕</Text>
            </Pressable>

            <Animated.View style={{ transform: [{ scale: speakScale }] }}>
                <Pressable
                    onPress={pressSpeak}
                    disabled={!puedeHablar}
                    style={({ pressed }) => [
                        styles.btnSpeak,
                        !puedeHablar && styles.btnSpeakDisabled,
                        pressed && puedeHablar && styles.btnPressed,
                    ]}
                    accessibilityLabel="Hablar frase"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text style={styles.btnSpeakText}>▶</Text>
                </Pressable>
            </Animated.View>
        </Pressable>
    );
}

function createFraseBarStyles(T: TableroThemeTokens) {
    return StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Space.sm,
        marginTop: 8,
        marginHorizontal: 12,
        paddingVertical: 6,
        paddingHorizontal: 8,
        minHeight: 70,
        backgroundColor: T.fraseBarBg,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: T.fraseBarBorder,
    },
    slotColumn: {
        alignItems: 'center',
    },
    microLabel: {
        fontSize: 6,
        fontFamily: Fonts.bodyBold,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 2,
    },
    microLabelSpacer: {
        height: 8,
    },
    slotBox: {
        width: SLOT_W,
        height: SLOT_H,
        borderRadius: R_SLOT,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    slotEmoji: {
        fontSize: 30,
        textAlign: 'center',
    },
    sep: {
        width: 1,
        height: 54,
        backgroundColor: T.fraseBarSeparator,
        marginHorizontal: 2,
    },
    btnClear: {
        width: 40,
        height: 54,
        borderRadius: R_SLOT,
        backgroundColor: T.fraseClearBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    btnClearText: {
        color: T.fraseClearFg,
        fontSize: 17,
        fontFamily: Fonts.bodyBold,
    },
    btnSpeak: {
        width: 58,
        height: 54,
        borderRadius: R_SLOT,
        backgroundColor: T.fraseSpeakBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnSpeakDisabled: {
        opacity: 0.38,
    },
    btnSpeakText: {
        color: T.fraseSpeakFg,
        fontSize: 17,
        fontFamily: Fonts.bodyBold,
    },
    btnPressed: {
        opacity: 0.92,
    },
});
}
