import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { STORAGE_KEYS } from '../constants/StorageKeys';

// Claves de AsyncStorage ligadas a un usuario concreto — se limpian al cerrar sesión
const USER_STORAGE_KEYS = [
    STORAGE_KEYS.ONBOARDING_COMPLETED,
    STORAGE_KEYS.TUTORIAL_COMPLETED,
    STORAGE_KEYS.TUTORIAL_BASIC_COMPLETED,
    STORAGE_KEYS.VOICE_PREFERENCE,
    STORAGE_KEYS.PARENTAL_PIN,
    STORAGE_KEYS.ELEVEN_CREDITS,
    STORAGE_KEYS.SHOW_KEYBOARD,
    STORAGE_KEYS.IMAGE_OVERRIDES,
    STORAGE_KEYS.OFFLINE_QUEUE,
    STORAGE_KEYS.DISABLED_PICTOGRAMS,
    STORAGE_KEYS.ACTIVE_ENVIRONMENT,
    STORAGE_KEYS.CONSENT_ACCEPTED,
    STORAGE_KEYS.PREFERRED_ACTIVITIES,
    STORAGE_KEYS.IMPORTANT_PEOPLE,
];

export type VocabLevel = 'BASICO' | 'INTERMEDIO' | 'AVANZADO';

export interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    level: VocabLevel;
}

type AuthContextType = {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    // Funciones centralizadas
    signIn: (email: string, password: string) => Promise<string | null>;
    signUp: (email: string, password: string, firstName: string) => Promise<string | null>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<string | null>;
    refreshProfile: () => Promise<void>;
    updateLevel: (level: VocabLevel) => Promise<void>;
    updateAvatar: (url: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    signIn: async () => null,
    signUp: async () => null,
    signOut: async () => {},
    resetPassword: async () => null,
    refreshProfile: async () => {},
    updateLevel: async () => {},
    updateAvatar: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Carga el perfil desde la tabla public.profiles
    const loadProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, avatar_url, level')
                .eq('id', userId)
                .single();
            if (!error && data) setProfile(data as UserProfile);
        } catch (e) {
            console.error('Error cargando perfil:', e);
        }
    };

    const refreshProfile = async () => {
        if (user) await loadProfile(user.id);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) loadProfile(session.user.id);
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // ── Funciones de autenticación ──────────────────────────────────────────

    const signIn = async (email: string, password: string): Promise<string | null> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? error.message : null;
    };

    const signUp = async (email: string, password: string, firstName: string): Promise<string | null> => {
        const { data: { session: newSession }, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { first_name: firstName },
            },
        });
        if (error) return error.message;
        // Si no hay sesión directa es porque requiere confirmación de email
        if (!newSession) return 'CHECK_EMAIL';
        return null;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        // Limpiar datos de usuario para que el siguiente login arranque el onboarding
        await AsyncStorage.multiRemove(USER_STORAGE_KEYS);
    };

    const resetPassword = async (email: string): Promise<string | null> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return error ? error.message : null;
    };

    /** Actualiza el nivel de vocabulario del usuario en Supabase y en el estado local. */
    const updateLevel = async (level: VocabLevel): Promise<void> => {
        if (!user) return;
        const { error } = await supabase
            .from('profiles')
            .update({ level })
            .eq('id', user.id);
        if (!error) {
            setProfile(prev => prev ? { ...prev, level } : prev);
        }
    };

    /** Actualiza la foto de perfil del usuario. */
    const updateAvatar = async (url: string): Promise<void> => {
        if (!user) return;
        const { error } = await supabase
            .from('profiles')
            .update({ avatar_url: url })
            .eq('id', user.id);
        if (!error) {
            setProfile(prev => prev ? { ...prev, avatar_url: url } : prev);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, isLoading, signIn, signUp, signOut, resetPassword, refreshProfile, updateLevel, updateAvatar }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
