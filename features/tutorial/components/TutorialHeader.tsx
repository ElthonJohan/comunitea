import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '../../../constants/Typography';
import { TutorialTheme } from './tutorialTheme';

type Props = {
    starsFilled: number;
    /** Por defecto 3; el ejercicio 1 básico usa 2. */
    starSlots?: 2 | 3;
};

export default function TutorialHeader({ starsFilled, starSlots = 3 }: Props) {
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
                            color={i < starsFilled ? TutorialTheme.celebrationGold : 'rgba(255,255,255,0.45)'}
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
        backgroundColor: TutorialTheme.baseHeader,
    },
    brand: {
        fontSize: 18,
        fontFamily: Fonts.displayExtraBold,
        color: '#fff',
    },
    brandAccent: {
        color: TutorialTheme.celebrationGold,
    },
    right: {
        alignItems: 'flex-end',
        gap: 4,
    },
    level: {
        fontSize: 12,
        fontFamily: Fonts.bodyBold,
        color: 'rgba(255,255,255,0.9)',
    },
    stars: {
        flexDirection: 'row',
        gap: 4,
    },
});
