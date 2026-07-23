import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '../../../constants/Typography';
import { Colors } from '../../../constants/Colors';
import { useReplayAudio } from '../../../hooks/useReplayAudio';

type Props = {
    text: string;
    dark?: boolean;
    onReplay?: () => void;
};

export default function VoiceBubble({ text, dark, onReplay }: Props) {
    const { replayText, isPlaying } = useReplayAudio();

    const handlePress = () => {
        if (onReplay) {
            onReplay();
        } else {
            void replayText(text);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.bubble, dark && styles.bubbleDark]}
            onPress={handlePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Repetir audio: ${text}`}
            accessibilityHint="Toca para volver a escuchar la voz"
        >
            <View style={[styles.iconContainer, isPlaying && styles.iconContainerActive]}>
                <Ionicons
                    name={isPlaying ? 'volume-medium' : 'volume-high'}
                    size={20}
                    color={Colors.primary}
                />
            </View>
            <Text style={[styles.text, dark && styles.textDark]}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        padding: 14,
        borderRadius: 18,
        gap: 12,
        shadowColor: '#1d1c12',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    bubbleDark: {
        backgroundColor: 'rgba(255,255,255,0.95)',
    },
    iconContainer: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(164, 195, 178, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerActive: {
        backgroundColor: 'rgba(164, 195, 178, 0.5)',
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
