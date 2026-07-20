import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '../../../constants/Typography';
import { Colors } from '../../../constants/Colors';
import { TutorialTheme } from './tutorialTheme';
import TutorialAvatar from './TutorialAvatar';
import VoiceBubble from './VoiceBubble';
import FingerIndicator from './FingerIndicator';

type Phase = 1 | 2;

type Props = {
    phase: Phase;
    onYoQuiero: () => void;
    onJuice: () => void;
    onCookie: () => void;
};

export default function Exercise3({ phase, onYoQuiero, onJuice, onCookie }: Props) {
    const stripEmpty = phase === 1;
    const yoSelected = phase === 2;

    return (
        <View style={styles.root}>
            <TutorialAvatar mood="neutral" />
            <VoiceBubble
                text={phase === 1 ? 'Muy bien. Toca «yo quiero».' : 'Ahora toca el jugo.'}
            />
            <View style={styles.strip}>
                {stripEmpty ? (
                    <Text style={styles.placeholder}>tu frase aquí…</Text>
                ) : (
                    <View style={styles.stripInner}>
                        <View style={styles.chip}>
                            <Text style={styles.chipEmoji}>🧑</Text>
                            <Text style={styles.chipText}>YO</Text>
                        </View>
                        <View style={styles.chip}>
                            <Text style={styles.chipEmoji}>🦋</Text>
                            <Text style={styles.chipText}>QUIERO</Text>
                        </View>
                        <View style={styles.slot}>
                            <Text style={styles.q}>?</Text>
                        </View>
                    </View>
                )}
            </View>
            <TouchableOpacity
                activeOpacity={0.88}
                onPress={onYoQuiero}
                disabled={phase !== 1}
                style={[styles.yoWrap, phase === 2 && styles.yoLocked]}
            >
                <View style={[styles.yoBtn, yoSelected && styles.yoBtnSelected]}>
                    <View style={styles.pictoBox}>
                        <Text style={styles.pictoEmoji}>🧑</Text>
                        <Text style={styles.pictoLabel}>YO</Text>
                    </View>
                    <View style={styles.pictoBox}>
                        <Text style={styles.pictoEmoji}>🦋</Text>
                        <Text style={styles.pictoLabel}>QUIERO</Text>
                    </View>
                </View>
                {phase === 1 && <FingerIndicator style={styles.fingerYo} />}
            </TouchableOpacity>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.small, phase === 1 && styles.smallDim]}
                    onPress={onJuice}
                    disabled={phase === 1}
                    activeOpacity={0.85}
                >
                    <Text style={styles.smallEmoji}>🥤</Text>
                    <Text style={styles.smallLabel}>JUGO</Text>
                    {phase === 2 && <FingerIndicator style={styles.fingerJuice} />}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.small, phase === 1 && styles.smallDim]}
                    onPress={onCookie}
                    disabled={phase === 1}
                    activeOpacity={0.85}
                >
                    <Text style={styles.smallEmoji}>🍪</Text>
                    <Text style={styles.smallLabel}>GALLETA</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.footer}>cómo usar la app para comunicarse</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: TutorialTheme.baseBg,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    strip: {
        minHeight: 64,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginVertical: 16,
        justifyContent: 'center',
        paddingHorizontal: 12,
        borderWidth: 2,
        borderColor: 'rgba(91,75,138,0.25)',
    },
    placeholder: {
        fontSize: 16,
        fontFamily: Fonts.body,
        color: 'rgba(29,28,18,0.35)',
        textAlign: 'center',
        paddingVertical: 16,
    },
    stripInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceContainerLow,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    chipEmoji: { fontSize: 22 },
    chipText: {
        fontSize: 14,
        fontFamily: Fonts.bodyBold,
        color: Colors.onSurface,
    },
    slot: {
        flex: 1,
        minHeight: 48,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: Colors.primary,
        borderRadius: 12,
        backgroundColor: Colors.primaryLight + '44',
        justifyContent: 'center',
        alignItems: 'center',
    },
    q: {
        fontSize: 28,
        fontFamily: Fonts.bodyBold,
        color: Colors.primary,
    },
    yoWrap: {
        alignSelf: 'center',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
    },
    yoLocked: {
        opacity: 1,
    },
    yoBtn: {
        flexDirection: 'row',
        gap: 12,
        padding: 12,
        backgroundColor: 'rgba(91,75,138,0.08)',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(91,75,138,0.2)',
    },
    yoBtnSelected: {
        opacity: 0.92,
        transform: [{ scale: 0.98 }],
    },
    pictoBox: {
        width: 100,
        height: 110,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(29,28,18,0.15)',
    },
    pictoEmoji: { fontSize: 44, marginBottom: 4 },
    pictoLabel: { fontSize: 14, fontFamily: Fonts.bodyBold, color: '#1d1c12' },
    fingerYo: {
        right: 8,
        bottom: -4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    small: {
        width: 110,
        height: 120,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(29,28,18,0.15)',
        position: 'relative',
    },
    smallDim: {
        opacity: 0.38,
    },
    smallEmoji: { fontSize: 40, marginBottom: 4 },
    smallLabel: { fontSize: 14, fontFamily: Fonts.bodyBold, color: '#1d1c12' },
    fingerJuice: {
        bottom: -6,
        right: -4,
    },
    footer: {
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: 13,
        fontFamily: Fonts.bodyMedium,
        color: '#5B4B8A',
        marginBottom: 16,
    },
});
