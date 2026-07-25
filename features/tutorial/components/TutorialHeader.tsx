import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '../../../constants/Typography';
import { TutorialTheme } from './tutorialTheme';
import { Colors } from '../../../constants/Colors';

type Props = {
    starsFilled: number;
    starSlots?: number;
};

export default function TutorialHeader({ starsFilled, starSlots = 4 }: Props) {
    const slots = starSlots;
    return (
        <View style={styles.bar}>
            <Text style={styles.brand}>Comuni<Text style={styles.brandAccent}>TEA</Text></Text>
            <View style={styles.right}>
                <Text style={styles.level}>Tutorial</Text>
                <View style={styles.stars}>
                    {Array.from({ length: slots }, (_, i) => (
                        <Ionicons
                            key={i}
                            name={i < starsFilled ? 'star' : 'star-outline'}
                            size={22}
                            color={i < starsFilled ? TutorialTheme.celebrationGold : 'rgba(0, 0, 0, 0.45)'}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    brand: {
        fontSize: 28,
        fontFamily: Fonts.displayExtraBold,
        color: Colors.onPrimary,
    },
    brandAccent: {
        color: Colors.primary,
    },
    right: {
        alignItems: 'flex-end',
        gap: 4,
    },
    level: {
        fontSize: 16,
        fontFamily: Fonts.bodyBold,
        color: Colors.text.primary,
    },
    stars: {
        flexDirection: 'row',
        gap: 4,
    },
});
