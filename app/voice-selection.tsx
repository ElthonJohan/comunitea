import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { Radii, ShadowAmbientLight, Space } from '../constants/Theme';
import { Fonts, displayLg } from '../constants/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVoice } from '../lib/hooks/useVoice';
import { VoiceProfile } from '../constants/AudioAssets';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { isTutorialDoneForLevel } from '../features/tutorial/hooks/useTutorialState';
import { ROUTES, hrefCategorias } from '../types/routes';
import { useAuth } from '../context/AuthContext';
import PrimaryGradientButton from '../components/PrimaryGradientButton';

const VOICE_OPTIONS: { profile: VoiceProfile; label: string; emoji: string }[] = [
    { profile: 'femenina', label: 'Voz femenina', emoji: '👩' },
    { profile: 'masculina', label: 'Voz masculina', emoji: '👨' },
];

export default function VoiceSelectionScreen() {
    const router = useRouter();
    const { setVoice } = useVoice();
    const { profile } = useAuth();

    const handleSelection = async (voiceType: VoiceProfile) => {
        setVoice(voiceType);
        await AsyncStorage.setItem(STORAGE_KEYS.VOICE_PREFERENCE, voiceType);
        const onboardingDone = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        if (onboardingDone) {
            const tutDone = await isTutorialDoneForLevel(profile?.level);
            router.replace(tutDone ? hrefCategorias() : ROUTES.tutorial);
        } else {
            router.replace(ROUTES.onboarding);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.welcome}>Bienvenidos a</Text>

                <Text style={styles.wordmark}>
                    Comuni<Text style={styles.wordmarkAccent}>TEA</Text>
                </Text>

                <View style={styles.mascotWrap}>
                    <Text style={styles.mascotEmoji} accessibilityRole="image">🐧</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Elige tu voz</Text>
                    <Text style={styles.cardSub}>
                        Será la voz que escucharás al tocar los pictogramas.
                    </Text>

                    {VOICE_OPTIONS.map(({ profile, label, emoji }) => (
                        <View key={profile} style={styles.optionBlock}>
                            <PrimaryGradientButton
                                label={`${emoji}  ${label.toUpperCase()}`}
                                onPress={() => handleSelection(profile)}
                                fullWidth
                                textStyle={styles.voiceBtnText}
                            />
                        </View>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: Space.lg,
        paddingTop: Space.xl,
    },
    welcome: {
        fontSize: 22,
        fontFamily: Fonts.displayBold,
        color: Colors.text.secondary,
        marginBottom: Space.sm,
    },
    wordmark: {
        fontSize: displayLg,
        lineHeight: displayLg + 8,
        fontFamily: Fonts.displayExtraBold,
        color: Colors.text.primary,
        letterSpacing: -1,
        marginBottom: Space.md,
    },
    wordmarkAccent: {
        color: Colors.primary,
    },
    mascotWrap: {
        marginVertical: Space.md,
        padding: Space.md,
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: Radii.xl,
        ...ShadowAmbientLight,
    },
    mascotEmoji: {
        fontSize: 100,
        lineHeight: 110,
    },
    card: {
        backgroundColor: Colors.surfaceContainerLowest,
        width: '100%',
        borderRadius: Radii.xl,
        padding: Space.xl,
        alignItems: 'center',
        flex: 1,
        marginBottom: Space.lg,
        ...ShadowAmbientLight,
        shadowRadius: 32,
    },
    cardTitle: {
        fontSize: 24,
        fontFamily: Fonts.displayBold,
        color: Colors.text.primary,
        marginBottom: Space.sm,
    },
    cardSub: {
        fontSize: 14,
        fontFamily: Fonts.body,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: Space.lg,
        lineHeight: 22,
    },
    optionBlock: {
        width: '100%',
        marginBottom: Space.md,
    },
    voiceBtnText: {
        fontSize: 18,
    },
});
