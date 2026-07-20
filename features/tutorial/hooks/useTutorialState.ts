import { useCallback, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../constants/StorageKeys';
import type { VocabLevel } from '../../../context/AuthContext';
import { isTutorialBasicCompleted } from './useTutorialBasicState';

export type TutorialStep =
    | 'ex0_base'
    | 'ex0_correct'
    | 'ex0_incorrect'
    | 'ex1_base'
    | 'ex1_correct'
    | 'ex1_incorrect'
    | 'ex2_base'
    | 'ex2_correct'
    | 'ex2_incorrect'
    | 'ex3_step1'
    | 'ex3_step2'
    | 'ex3_incorrect'
    | 'ex3_complete'
    | 'celebration';

export interface TutorialState {
    currentStep: TutorialStep;
    attempts: Record<string, number>;
    completedAt?: Date;
}

export function useTutorialState() {
    const [currentStep, setCurrentStep] = useState<TutorialStep>('ex0_base');
    const [attempts, setAttempts] = useState<Record<string, number>>({});

    const bumpAttempt = useCallback((exerciseKey: string) => {
        setAttempts((prev) => ({
            ...prev,
            [exerciseKey]: (prev[exerciseKey] ?? 0) + 1,
        }));
    }, []);

    const starsFilled = useMemo(() => {
        switch (currentStep) {
            case 'ex0_base':
            case 'ex0_incorrect':
            case 'ex0_correct':
            case 'ex1_base':
            case 'ex1_incorrect':
                return 0;
            case 'ex1_correct':
            case 'ex2_base':
            case 'ex2_incorrect':
                return 1;
            case 'ex2_correct':
            case 'ex3_step1':
            case 'ex3_step2':
            case 'ex3_incorrect':
                return 2;
            case 'ex3_complete':
            case 'celebration':
                return 3;
            default:
                return 0;
        }
    }, [currentStep]);

    const completeTutorial = useCallback(async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
    }, []);

    return {
        currentStep,
        setCurrentStep,
        attempts,
        bumpAttempt,
        starsFilled,
        completeTutorial,
    };
}

export async function isTutorialCompleted(): Promise<boolean> {
    const v = await AsyncStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED);
    return v === 'true';
}

/** Tutorial obligatorio según nivel de vocabulario del perfil. */
export async function isTutorialDoneForLevel(level: VocabLevel | null | undefined): Promise<boolean> {
    if (!level) return false;
    if (level === 'BASICO') return isTutorialBasicCompleted();
    return isTutorialCompleted();
}
