import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '../../../constants/Typography';
import { Colors } from '../../../constants/Colors';

type Props = {
    text: string;
    dark?: boolean;
};

export default function VoiceBubble({ text, dark }: Props) {
    return (
        <View style={[styles.bubble, dark && styles.bubbleDark]}>
            <Ionicons
                name="volume-high"
                size={18}
                color={dark ? Colors.primary : Colors.primary}
                style={styles.icon}
            />
            <Text style={[styles.text, dark && styles.textDark]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    bubble: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        padding: 14,
        borderRadius: 18,
        gap: 10,
        shadowColor: '#1d1c12',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    bubbleDark: {
        backgroundColor: 'rgba(255,255,255,0.95)',
    },
    icon: {
        marginTop: 2,
    },
    text: {
        flex: 1,
        fontSize: 16,
        fontFamily: Fonts.bodySemiBold,
        color: Colors.onSurface,
        lineHeight: 22,
    },
    textDark: {
        color: Colors.onSurface,
    },
});
