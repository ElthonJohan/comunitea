import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Fonts } from '../../../../constants/Typography';
import type { G3NeedKind } from '../../../../constants/ejerciciosGrupo3';

type Props = {
    situBg: string;
    situEmoji: string;
    need: G3NeedKind;
    label: string;
    onPress: () => void;
    disabled?: boolean;
};

const NEED_STYLES: Record<G3NeedKind, { bg: string; text: string; emoji: string }> = {
    duele: { bg: '#FFCDD2', text: '#B71C1C', emoji: '😣' },
    agua: { bg: '#E3F2FD', text: '#1565C0', emoji: '🥤' },
    ayuda: { bg: '#FFF9C4', text: '#F57F17', emoji: '🙋' },
};

export function BotonNecesidad({ situBg, situEmoji, need, label, onPress, disabled }: Props) {
    const scale = useRef(new Animated.Value(1)).current;
    const fly = useRef(new Animated.Value(0)).current;
    const colors = NEED_STYLES[need];

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
        Animated.sequence([
            Animated.timing(fly, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.timing(fly, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
        onPress();
    };

    const flyY = fly.interpolate({ inputRange: [0, 1], outputRange: [0, -100] });

    return (
        <View style={styles.wrap}>
            <View style={[styles.situ, { backgroundColor: situBg }]}>
                <Text style={styles.situEmoji}>{situEmoji}</Text>
            </View>
            <View style={styles.spacer} />
            <Animated.View style={{ transform: [{ translateY: flyY }, { scale }] }}>
                <Pressable
                    onPress={handlePress}
                    disabled={disabled}
                    style={[styles.btn, { backgroundColor: colors.bg }]}
                >
                    <Text style={[styles.btnText, { color: colors.text }]}>
                        {label} {colors.emoji}
                    </Text>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        width: '100%',
    },
    situ: {
        width: 160,
        height: 120,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    situEmoji: {
        fontSize: 100,
    },
    spacer: {
        height: 32,
    },
    btn: {
        width: 200,
        minHeight: 72,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    btnText: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        textAlign: 'center',
    },
});
