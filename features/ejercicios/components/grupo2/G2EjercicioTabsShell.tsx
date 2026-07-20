import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../../../../constants/Typography';
import { G2_BG } from '../../../../constants/ejerciciosGrupo2';

export type G2TabItem = { key: string; label: string };

type Props = {
    headerBg: string;
    nivelDisplay: number;
    tituloNivel: string;
    tabs: G2TabItem[];
    activeTabIndex: number;
    /** Tab i habilitado si true */
    tabEnabled: (i: number) => boolean;
    exerciseDone: [boolean, boolean, boolean];
    onTabPress: (i: number) => void;
    badgeText: string;
    difficultyLabel: string;
    difficultyPillBg: string;
    children: React.ReactNode;
};

export function G2EjercicioTabsShell({
    headerBg,
    nivelDisplay,
    tituloNivel,
    tabs,
    activeTabIndex,
    tabEnabled,
    exerciseDone,
    onTabPress,
    badgeText,
    difficultyLabel,
    difficultyPillBg,
    children,
}: Props) {
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={[styles.header, { backgroundColor: headerBg }]}>
                <View style={styles.headerTop}>
                    <View style={styles.nivelBadge}>
                        <Text style={styles.nivelBadgeTxt}>Nivel {nivelDisplay}</Text>
                    </View>
                    <View style={styles.starsHeader}>
                        {[0, 1, 2].map((i) => (
                            <Text key={i} style={styles.starChar}>
                                {exerciseDone[i] ? '⭐' : '○'}
                            </Text>
                        ))}
                    </View>
                </View>
                <Text style={styles.titulo}>{tituloNivel}</Text>
            </View>
            <View style={styles.tabBar}>
                {tabs.map((t, i) => {
                    const active = i === activeTabIndex;
                    const enabled = tabEnabled(i);
                    return (
                        <Pressable
                            key={t.key}
                            disabled={!enabled}
                            onPress={() => onTabPress(i)}
                            style={[
                                styles.tabBtn,
                                active && { backgroundColor: headerBg, borderRadius: 20 },
                                !enabled && styles.tabDisabled,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabLabel,
                                    active && styles.tabLabelActive,
                                    !active && styles.tabLabelIdle,
                                ]}
                                numberOfLines={1}
                            >
                                {t.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
            <View style={styles.subBadgeRow}>
                <Text style={styles.subBadgeTxt}>{badgeText}</Text>
                <View style={[styles.diffPill, { backgroundColor: difficultyPillBg }]}>
                    <Text style={styles.diffPillTxt}>{difficultyLabel}</Text>
                </View>
            </View>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: G2_BG },
    header: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 14,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    nivelBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    nivelBadgeTxt: { color: '#fff', fontSize: 12, fontFamily: Fonts.bodyBold },
    starsHeader: { flexDirection: 'row', gap: 6 },
    starChar: { fontSize: 22 },
    titulo: {
        color: '#fff',
        fontSize: 14,
        fontFamily: Fonts.displayBold,
    },
    tabBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: G2_BG,
    },
    tabBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        minHeight: 44,
        justifyContent: 'center',
    },
    tabDisabled: { opacity: 0.35 },
    tabLabel: { fontSize: 12, fontFamily: Fonts.bodySemiBold },
    tabLabelActive: { color: '#fff' },
    tabLabelIdle: { color: '#888' },
    subBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    subBadgeTxt: {
        flex: 1,
        fontSize: 12,
        fontFamily: Fonts.bodySemiBold,
        color: '#424242',
    },
    diffPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    diffPillTxt: { fontSize: 11, fontFamily: Fonts.bodyBold, color: '#333' },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 14, paddingBottom: 32 },
});
