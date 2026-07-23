import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EditModeProvider } from '../context/EditModeContext';
import { TimerProvider } from '../context/TimerContext';
import { ParentalProvider } from '../context/ParentalContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ChildProfileProvider } from '../context/ChildProfileContext';
import { NetworkProvider } from '../context/NetworkContext';
import { NetworkBanner } from '../components/NetworkBanner';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { setAudioModeAsync } from 'expo-audio';
import { isTutorialDoneForLevel } from '../features/tutorial/hooks/useTutorialState';
import { ROUTES, hrefCategorias } from '../types/routes';
import { supabase } from '../lib/supabase';
import { AppThemeProvider } from '../context/AppThemeContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Rutas que requieren sesión activa
const PROTECTED_ROUTES = ['(tabs)', 'category', 'voice-selection', 'sentences', 'report', 'onboarding', 'tutorial', 'vocabulary-manager', 'activity-editor', 'activity-run', 'game', 'team-manager', 'settings', 'ejercicios'];
// Rutas exclusivas para usuarios NO autenticados
const AUTH_ONLY_ROUTES = ['login', 'index'];

function RootLayoutNav() {
    const { session, isLoading, profile } = useAuth();
    const router = useRouter();
    const segments = useSegments();
    const loggedSessionId = useRef<string | null>(null);

    // Registrar session_start una única vez por sesión activa
    useEffect(() => {
        if (!isLoading && session?.user && session.user.id !== loggedSessionId.current) {
            loggedSessionId.current = session.user.id;
            supabase
                .from('usage_stats')
                .insert({ user_id: session.user.id, event_type: 'session_start' })
                .then(({ error }) => { if (error) console.warn('[stats] session_start:', error.message); });
        }
    }, [session?.user?.id, isLoading]);
    useEffect(() => {
        if (isLoading) return;

        const rootSegment = segments[0] as string | undefined;
        // Cuando segments está vacío, el usuario está en app/index.tsx (ruta raíz)
        const isOnRoot = !rootSegment;
        const isProtected = rootSegment ? PROTECTED_ROUTES.includes(rootSegment) : false;
        const isAuthOnly = rootSegment ? AUTH_ONLY_ROUTES.includes(rootSegment) : false;

        if (!session && (isProtected || isOnRoot)) {
            // Sin sesión: rutas protegidas y la pantalla de entrada van a /login
            router.replace('/login');
        } else if (session && (isAuthOnly || isOnRoot)) {
            if (isLoading || !profile) return;
            // Usuario autenticado en pantalla de login/splash/raíz → verificar flujo de primera vez
            AsyncStorage.getItem(STORAGE_KEYS.VOICE_PREFERENCE).then(async (voicePref) => {
                if (!voicePref) {
                    router.replace('/voice-selection');
                } else {
                    const onboardingDone = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
                    if (!onboardingDone) {
                        router.replace(ROUTES.onboarding);
                    } else {
                        const tutorialDone = await isTutorialDoneForLevel(profile.level);
                        if (!tutorialDone) {
                            router.replace(ROUTES.tutorial);
                        } else {
                            router.replace(hrefCategorias());
                        }
                    }
                }
            });
        }
    }, [session, isLoading, segments, profile]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="voice-selection" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="ejercicios" />
            <Stack.Screen name="category/[id]" />
            <Stack.Screen name="sentences" />
            <Stack.Screen name="report" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="tutorial" />
            <Stack.Screen name="vocabulary-manager" />
            <Stack.Screen name="activity-editor" />
            <Stack.Screen name="activity-run" />
            <Stack.Screen name="game" />
            <Stack.Screen name="team-manager" />
        </Stack>
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Nunito_300Light,
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
        Nunito_800ExtraBold,
    });

    useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
    }, [fontsLoaded]);

    useEffect(() => {
        void setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: false,
            interruptionMode: 'mixWithOthers',
            allowsRecording: false,
            shouldRouteThroughEarpiece: false,
        }).catch((e) => console.warn('[audio] setAudioModeAsync', e));
    }, []);

    if (!fontsLoaded) return null;

    return (
        <NetworkProvider>
            <AppThemeProvider>
                <AuthProvider>
                    <ChildProfileProvider>
                        <EditModeProvider>
                            <TimerProvider>
                                <ParentalProvider>
                                    <RootLayoutNav />
                                    <NetworkBanner />
                                    <StatusBar style="dark" />
                                </ParentalProvider>
                            </TimerProvider>
                        </EditModeProvider>
                    </ChildProfileProvider>
                </AuthProvider>
            </AppThemeProvider>
        </NetworkProvider>
    );
}
