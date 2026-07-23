import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { TUTORIAL_POINTING_HAND_PNG } from '../../../../constants/tutorialHandAsset';

const AnimatedImage = Animated.createAnimatedComponent(Image);
import { Fonts } from '../../../../constants/Typography';
import { Colors } from '../../../../constants/Colors';
import { TutorialTheme } from '../tutorialTheme';
import TutorialAvatar from '../TutorialAvatar';
import VoiceBubble from '../VoiceBubble';
import DragDropArea from './DragDropArea';

type DragPhase = 'base' | 'dragging';

type Props = {
    onSuccess: () => void;
    onFail: () => void;
    onReplay?: () => void;
};

function SourceZone() {
    const o = useRef(new Animated.Value(0.55)).current;
    useEffect(() => {
        const a = Animated.loop(
            Animated.sequence([
                Animated.timing(o, { toValue: 1, duration: 800, useNativeDriver: false }),
                Animated.timing(o, { toValue: 0.45, duration: 800, useNativeDriver: false }),
            ]),
        );
        a.start();
        return () => a.stop();
    }, [o]);
    return (
        <Animated.View
            style={[
                styles.zone,
                {
                    borderColor: TutorialTheme.baseHeader,
                    borderStyle: 'dashed',
                    borderWidth: 3,
                    opacity: o,
                },
            ]}
        >
            <Text style={styles.zoneEmoji}>🍎</Text>
            <Text style={styles.zoneLabel}>Manzana</Text>
        </Animated.View>
    );
}

function TargetZone({ pulsing }: { pulsing: boolean }) {
    const glow = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        if (!pulsing) {
            glow.setValue(1);
            return;
        }
        const a = Animated.loop(
            Animated.sequence([
                Animated.timing(glow, { toValue: 1.12, duration: 500, useNativeDriver: true }),
                Animated.timing(glow, { toValue: 1, duration: 500, useNativeDriver: true }),
            ]),
        );
        a.start();
        return () => a.stop();
    }, [pulsing, glow]);

    return (
        <Animated.View style={[styles.zone, styles.targetZone, { transform: [{ scale: glow }] }]}>
            <Text style={styles.zoneEmoji}>👄</Text>
            <Text style={styles.zoneLabel}>Boca</Text>
            {pulsing ? <Text style={styles.here}>¡aquí!</Text> : null}
        </Animated.View>
    );
}

export default function Exercise3Basic({ onSuccess, onFail, onReplay }: Props) {
    const [dragPhase, setDragPhase] = useState<DragPhase>('base');
    const slideHint = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (dragPhase !== 'base') return;
        const a = Animated.loop(
            Animated.sequence([
                Animated.timing(slideHint, { toValue: 1, duration: 1400, useNativeDriver: true }),
                Animated.timing(slideHint, { toValue: 0, duration: 1400, useNativeDriver: true }),
            ]),
        );
        a.start();
        return () => a.stop();
    }, [dragPhase, slideHint]);

    const hintTranslate = slideHint.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 160],
    });

    const bubbleText =
        dragPhase === 'dragging'
            ? 'Arrastra la imagen / Llévala a la boca'
            : 'Muy bien / Arrastra la imagen / Llévala a la boca';

    return (
        <View style={styles.root}>
            <TutorialAvatar mood="neutral" />
            <VoiceBubble text={bubbleText} onReplay={onReplay} />

            <View style={styles.tagsRow}>
                <Text style={styles.tag}>tocar aquí</Text>
                <Text style={styles.tag}>soltar aquí</Text>
            </View>

            <View style={styles.dragContainer}>
                {/* <View style={styles.arrowRow} pointerEvents="none">
                    <Text style={styles.arrow}>——</Text>
                    <Text style={styles.arrowHead}>→</Text>
                </View> */}
                {dragPhase === 'base' ? (
                    <AnimatedImage
                        source={TUTORIAL_POINTING_HAND_PNG}
                        style={[styles.dragFinger, { transform: [{ translateX: hintTranslate }] }]}
                        accessibilityLabel="Arrastra"
                    />
                ) : null}
                <DragDropArea
                    hitSlop={40}
                    onDragStart={() => setDragPhase('dragging')}
                    onSuccess={onSuccess}
                    onFail={onFail}
                    sourceContent={<SourceZone />}
                    targetContent={<TargetZone pulsing={dragPhase === 'dragging'} />}
                />
            </View>

            {dragPhase === 'dragging' ? (
                <Text style={styles.draggingLine}>arrastrando...</Text>
            ) : null}
            {dragPhase === 'dragging' ? (
                <>
                    <Text style={styles.bocaAqui}>Boca ¡aquí!</Text>
                    <Text style={styles.destLine}>dedo presionado y deslizando →</Text>
                </>
            ) : null}
            <Text style={styles.legend}>toca → arrastra hasta → la boca</Text>
            <Text style={styles.legendSmall}>mover objetos · entender acciones (comer)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingBottom: 8,
    },
    dragContainer: {
        position: 'relative',
        width: '100%',
        marginTop: 10,
    },
    arrowRow: {
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    arrow: {
        fontSize: 18,
        color: TutorialTheme.baseHeader,
        letterSpacing: 2,
    },
    arrowHead: {
        fontSize: 22,
        color: TutorialTheme.baseHeader,
        marginLeft: 2,
    },
    dragFinger: {
        position: 'absolute',
        bottom: -22,
        left: '22%',
        width: 44,
        height: 44,
        resizeMode: 'contain',
        zIndex: 10,
    },
    zone: {
        width: 128,
        minHeight: 128,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    targetZone: {
        borderWidth: 3,
        borderColor: 'rgba(91,75,138,0.45)',
        borderStyle: 'dashed',
    },
    zoneEmoji: {
        fontSize: 52,
    },
    zoneLabel: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
        marginTop: 2,
    },
    here: {
        fontSize: 13,
        fontFamily: Fonts.bodyBold,
        color: TutorialTheme.correctButton,
        marginTop: 2,
    },
    tagsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginTop: 4,
        marginBottom: 2,
    },
    tag: {
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: Colors.text.primary,
    },
    draggingLine: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: Fonts.displayBold,
        color: TutorialTheme.baseHeader,
        marginTop: 6,
    },
    bocaAqui: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
        marginTop: 4,
    },
    destLine: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: Colors.text.primary,
        marginTop: 4,
    },
    legend: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
        marginTop: 'auto',
        paddingHorizontal: 12,
    },
    legendSmall: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
        marginTop: 4,
        paddingBottom: 6,
    },
});
