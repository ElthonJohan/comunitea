import { useCallback, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../constants/StorageKeys';

export type TutorialStepBasic =
    | 'b_ex0_base'
    | 'b_ex0_correct'
    | 'b_ex1_base'
    | 'b_ex1_correct'
    | 'b_ex2_base'
    | 'b_ex2_correct'
    | 'b_ex2_incorrect'
    | 'b_ex3_base'
    | 'b_ex3_correct'
    | 'b_ex3_incorrect'
    | 'b_celebration';

export function useTutorialBasicState() {
    const [currentStep, setCurrentStep] = useState<TutorialStepBasic>('b_ex0_base');
    const [attempts, setAttempts] = useState<Record<string, number>>({});

    const bumpAttempt = useCallback((exerciseKey: string) => {
        setAttempts((prev) => ({
            ...prev,
            [exerciseKey]: (prev[exerciseKey] ?? 0) + 1,
        }));
    }, []);

    const { starSlots, starsFilled } = useMemo(() => {
        const slots = 4;
        switch (currentStep) {
            case 'b_ex0_base':
                return { starSlots: slots, starsFilled: 0 };
            case 'b_ex0_correct':
            case 'b_ex1_base':
                return { starSlots: slots, starsFilled: 1 };
            case 'b_ex1_correct':
            case 'b_ex2_base':
            case 'b_ex2_incorrect':
                return { starSlots: slots, starsFilled: 2 };
            case 'b_ex2_correct':
            case 'b_ex3_base':
            case 'b_ex3_incorrect':
                return { starSlots: slots, starsFilled: 3 };
            case 'b_ex3_correct':
            case 'b_celebration':
                return { starSlots: slots, starsFilled: 4 };
            default:
                return { starSlots: slots, starsFilled: 0 };
        }
    }, [currentStep]);

    const completeTutorialBasic = useCallback(async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.TUTORIAL_BASIC_COMPLETED, 'true');
    }, []);

    return {
        currentStep,
        setCurrentStep,
        attempts,
        bumpAttempt,
        starSlots,
        starsFilled,
        completeTutorialBasic,
    };
}

export async function isTutorialBasicCompleted(): Promise<boolean> {
    const v = await AsyncStorage.getItem(STORAGE_KEYS.TUTORIAL_BASIC_COMPLETED);
    return v === 'true';
}
