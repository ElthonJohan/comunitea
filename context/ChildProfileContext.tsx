import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { addXpAndLevel } from '../lib/gamification/xpLevel';
import { evaluateNewAchievementIds } from '../features/perfil/data/achievements';
import {
    setExerciseGamificationListener,
    type ExerciseGamificationPayload,
} from '../lib/gamificationExerciseBridge';

export type AdultRole = 'padre_madre' | 'terapeuta' | 'psicologo' | 'docente';
export type ActiveEnvironment = 'hogar' | 'escuela' | 'terapia';
export type Diagnosis = 'dsm5_nivel1' | 'dsm5_nivel2' | 'dsm5_nivel3' | 'sin_diagnostico';
export type CommunicationLevel = 'sin_lenguaje' | 'palabras_aisladas' | 'frases_simples' | 'frases_complejas';
export type Gender = 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';

export interface ChildProfile {
    id: string;
    user_id: string;
    name: string;
    birth_date: string | null;
    gender: Gender | null;
    avatar_url: string | null;
    diagnosis: Diagnosis | null;
    communication_level: CommunicationLevel;
    environments: string[];
    preferred_activities: string[];
    /** Personas del tablero: `emoji|nombre` (ej. `👩|Mamá`); vacío = fila por defecto. */
    important_people: string[];
    sound_sensitive: boolean;
    onboarding_completed: boolean;
}

export type ChildProfileInput = Omit<ChildProfile, 'id' | 'user_id'>;

/** Fila `child_progress` (gamificación). */
export interface ChildProgress {
    id: string;
    child_profile_id: string;
    xp: number;
    level: number;
    sentences_today: number;
    streak_days: number;
    last_active_date: string | null;
    achievements: string[];
    correct_attempts: number;
    total_attempts: number;
}

const XP_FRASE = 10;
const XP_EJERCICIO_OK = 25;

function formatLocalDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function todayLocal(): string {
    return formatLocalDate(new Date());
}

function yesterdayLocal(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatLocalDate(d);
}

/** Racha según último día activo y el calendario local. */
function computeStreak(prevStreak: number, lastActive: string | null, today: string): number {
    if (lastActive === today) return prevStreak;
    if (lastActive === null) return 1;
    if (lastActive === yesterdayLocal()) return Math.max(1, prevStreak) + 1;
    return 1;
}

function asDateString(v: unknown): string | null {
    if (v == null) return null;
    if (typeof v === 'string') return v.slice(0, 10);
    return null;
}

function mapProgressRow(row: Record<string, unknown>): ChildProgress {
    const achievements = row.achievements;
    return {
        id: String(row.id),
        child_profile_id: String(row.child_profile_id),
        xp: typeof row.xp === 'number' ? row.xp : 0,
        level: typeof row.level === 'number' ? row.level : 1,
        sentences_today: typeof row.sentences_today === 'number' ? row.sentences_today : 0,
        streak_days: typeof row.streak_days === 'number' ? row.streak_days : 0,
        last_active_date: asDateString(row.last_active_date),
        achievements: Array.isArray(achievements) ? achievements.map(String) : [],
        correct_attempts: typeof row.correct_attempts === 'number' ? row.correct_attempts : 0,
        total_attempts: typeof row.total_attempts === 'number' ? row.total_attempts : 0,
    };
}

/** Si cambió el día calendario, las frases "de hoy" en BD ya no aplican hasta nueva actividad. */
function normalizeProgressCalendar(pr: ChildProgress): ChildProgress {
    const today = todayLocal();
    if (pr.last_active_date !== null && pr.last_active_date !== today) {
        return { ...pr, sentences_today: 0 };
    }
    return pr;
}

interface ChildProfileContextType {
    childProfile: ChildProfile | null;
    childProgress: ChildProgress | null;
    isLoadingChild: boolean;
    activeEnvironment: ActiveEnvironment;
    setEnvironment: (env: ActiveEnvironment) => Promise<void>;
    saveChildProfile: (data: ChildProfileInput) => Promise<void>;
    refreshChildProfile: () => Promise<void>;
    /** Tras reproducir una frase en el tablero (TTS terminó). */
    recordSentenceSpoken: () => Promise<void>;
}

const ChildProfileContext = createContext<ChildProfileContextType>({
    childProfile: null,
    childProgress: null,
    isLoadingChild: true,
    activeEnvironment: 'hogar',
    setEnvironment: async () => {},
    saveChildProfile: async () => {},
    refreshChildProfile: async () => {},
    recordSentenceSpoken: async () => {},
});

export function ChildProfileProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
    const [childProgress, setChildProgress] = useState<ChildProgress | null>(null);
    const [isLoadingChild, setIsLoadingChild] = useState(true);
    const [activeEnvironment, setActiveEnvironmentState] = useState<ActiveEnvironment>('hogar');

    const childProfileRef = useRef(childProfile);
    childProfileRef.current = childProfile;
    const childProgressRef = useRef(childProgress);
    childProgressRef.current = childProgress;
    const userRef = useRef(user);
    userRef.current = user;

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_ENVIRONMENT).then((val) => {
            if (val === 'hogar' || val === 'escuela' || val === 'terapia') {
                setActiveEnvironmentState(val);
            }
        });
    }, []);

    const setEnvironment = useCallback(async (env: ActiveEnvironment) => {
        setActiveEnvironmentState(env);
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ENVIRONMENT, env);
    }, []);

    const loadOrCreateProgress = useCallback(async (childProfileId: string) => {
        const { data: row, error } = await supabase
            .from('child_progress')
            .select('*')
            .eq('child_profile_id', childProfileId)
            .maybeSingle();

        if (error) {
            console.warn('[child_progress] select', error);
            setChildProgress(null);
            return;
        }

        if (!row) {
            const { data: created, error: e2 } = await supabase
                .from('child_progress')
                .insert({ child_profile_id: childProfileId })
                .select()
                .single();
            if (e2 || !created) {
                console.warn('[child_progress] insert', e2);
                setChildProgress(null);
                return;
            }
            setChildProgress(normalizeProgressCalendar(mapProgressRow(created as Record<string, unknown>)));
            return;
        }

        setChildProgress(normalizeProgressCalendar(mapProgressRow(row as Record<string, unknown>)));
    }, []);

    const loadChildProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('child_profiles')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                setChildProfile(null);
                setChildProgress(null);
                return;
            }

            if (data) {
                const row = data as ChildProfile & { important_people?: string[] };
                setChildProfile({
                    ...row,
                    important_people: row.important_people ?? [],
                });
                await loadOrCreateProgress(row.id);
                if (data.onboarding_completed) {
                    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
                }
            } else {
                setChildProfile(null);
                setChildProgress(null);
            }
        } catch {
            setChildProfile(null);
            setChildProgress(null);
        } finally {
            setIsLoadingChild(false);
        }
    }, [loadOrCreateProgress]);

    const refreshChildProfile = useCallback(async () => {
        const u = userRef.current;
        if (u) {
            setIsLoadingChild(true);
            await loadChildProfile(u.id);
        }
    }, [loadChildProfile]);

    useEffect(() => {
        const u = userRef.current;
        if (u) {
            setIsLoadingChild(true);
            void loadChildProfile(u.id);
        } else {
            setChildProfile(null);
            setChildProgress(null);
            setIsLoadingChild(false);
        }
    }, [user?.id, loadChildProfile]);

    const saveChildProfile = useCallback(async (data: ChildProfileInput) => {
        const u = userRef.current;
        if (!u) throw new Error('No hay sesión');
        const cp = childProfileRef.current;
        const payload = {
            ...data,
            user_id: u.id,
            preferred_activities: data.preferred_activities ?? [],
            important_people: data.important_people ?? [],
        };
        if (cp?.id) {
            const { data: updated, error } = await supabase
                .from('child_profiles')
                .update(payload)
                .eq('id', cp.id)
                .select()
                .single();
            if (error) throw error;
            if (updated) {
                const row = updated as ChildProfile & { important_people?: string[] };
                setChildProfile({
                    ...row,
                    important_people: row.important_people ?? [],
                });
                await loadOrCreateProgress(row.id);
            }
        } else {
            const { data: created, error } = await supabase
                .from('child_profiles')
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            if (created) {
                const row = created as ChildProfile & { important_people?: string[] };
                setChildProfile({
                    ...row,
                    important_people: row.important_people ?? [],
                });
                await loadOrCreateProgress(row.id);
            }
        }
    }, [loadOrCreateProgress]);

    const recordSentenceSpoken = useCallback(async () => {
        const cp = childProfileRef.current;
        const pr = childProgressRef.current;
        if (!cp?.id || !pr?.id) return;

        const today = todayLocal();
        let sentences = pr.sentences_today;
        let streak = pr.streak_days;
        const last = pr.last_active_date;

        if (last !== today) {
            sentences = 0;
            streak = computeStreak(pr.streak_days, last, today);
        }
        sentences += 1;

        const { xp, level } = addXpAndLevel(pr.xp, pr.level, XP_FRASE);
        const newIds = evaluateNewAchievementIds({
            sentencesToday: sentences,
            streakDays: streak,
            level,
            xp,
            correctAttempts: pr.correct_attempts,
            totalAttempts: pr.total_attempts,
            already: pr.achievements,
        });
        const achievements = [...pr.achievements, ...newIds];

        const { data, error } = await supabase
            .from('child_progress')
            .update({
                sentences_today: sentences,
                streak_days: streak,
                last_active_date: today,
                xp,
                level,
                achievements,
                updated_at: new Date().toISOString(),
            })
            .eq('id', pr.id)
            .select()
            .single();

        if (error) {
            console.warn('[child_progress] sentence', error);
            return;
        }
        if (data) {
            setChildProgress(normalizeProgressCalendar(mapProgressRow(data as Record<string, unknown>)));
        }
    }, []);

    const applyExerciseWrongAttempt = useCallback(async () => {
        const cp = childProfileRef.current;
        const pr = childProgressRef.current;
        if (!cp?.id || !pr?.id) return;

        const today = todayLocal();
        let sentences = pr.sentences_today;
        let streak = pr.streak_days;
        const last = pr.last_active_date;

        if (last !== today) {
            sentences = 0;
            streak = computeStreak(pr.streak_days, last, today);
        }

        const total = pr.total_attempts + 1;
        const correct = pr.correct_attempts;

        const newIds = evaluateNewAchievementIds({
            sentencesToday: sentences,
            streakDays: streak,
            level: pr.level,
            xp: pr.xp,
            correctAttempts: correct,
            totalAttempts: total,
            already: pr.achievements,
        });
        const achievements = [...pr.achievements, ...newIds];

        const { data, error } = await supabase
            .from('child_progress')
            .update({
                sentences_today: sentences,
                streak_days: streak,
                last_active_date: today,
                total_attempts: total,
                achievements,
                updated_at: new Date().toISOString(),
            })
            .eq('id', pr.id)
            .select()
            .single();

        if (error) {
            console.warn('[child_progress] exercise fail', error);
            return;
        }
        if (data) {
            setChildProgress(normalizeProgressCalendar(mapProgressRow(data as Record<string, unknown>)));
        }
    }, []);

    const applyExerciseCompleted = useCallback(async () => {
        const cp = childProfileRef.current;
        const pr = childProgressRef.current;
        if (!cp?.id || !pr?.id) return;

        const today = todayLocal();
        let sentences = pr.sentences_today;
        let streak = pr.streak_days;
        const last = pr.last_active_date;

        if (last !== today) {
            sentences = 0;
            streak = computeStreak(pr.streak_days, last, today);
        }

        const total = pr.total_attempts + 1;
        const correct = pr.correct_attempts + 1;
        const { xp, level } = addXpAndLevel(pr.xp, pr.level, XP_EJERCICIO_OK);

        const newIds = evaluateNewAchievementIds({
            sentencesToday: sentences,
            streakDays: streak,
            level,
            xp,
            correctAttempts: correct,
            totalAttempts: total,
            already: pr.achievements,
        });
        const achievements = [...pr.achievements, ...newIds];

        const { data, error } = await supabase
            .from('child_progress')
            .update({
                sentences_today: sentences,
                streak_days: streak,
                last_active_date: today,
                total_attempts: total,
                correct_attempts: correct,
                xp,
                level,
                achievements,
                updated_at: new Date().toISOString(),
            })
            .eq('id', pr.id)
            .select()
            .single();

        if (error) {
            console.warn('[child_progress] exercise ok', error);
            return;
        }
        if (data) {
            setChildProgress(normalizeProgressCalendar(mapProgressRow(data as Record<string, unknown>)));
        }
    }, []);

    useEffect(() => {
        const onExercise = (payload: ExerciseGamificationPayload) => {
            if (payload.kind === 'wrong_attempt') void applyExerciseWrongAttempt();
            else void applyExerciseCompleted();
        };
        setExerciseGamificationListener(onExercise);
        return () => setExerciseGamificationListener(null);
    }, [applyExerciseWrongAttempt, applyExerciseCompleted]);

    const value = useMemo<ChildProfileContextType>(
        () => ({
            childProfile,
            childProgress,
            isLoadingChild,
            activeEnvironment,
            setEnvironment,
            saveChildProfile,
            refreshChildProfile,
            recordSentenceSpoken,
        }),
        [
            childProfile,
            childProgress,
            isLoadingChild,
            activeEnvironment,
            setEnvironment,
            saveChildProfile,
            refreshChildProfile,
            recordSentenceSpoken,
        ],
    );

    return (
        <ChildProfileContext.Provider value={value}>
            {children}
        </ChildProfileContext.Provider>
    );
}

export function useChildProfile() {
    return useContext(ChildProfileContext);
}
