import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import {
    useTutorialState,
    type TutorialStep as TutorialStepId,
    isTutorialDoneForLevel,
} from '../../features/tutorial/hooks/useTutorialState';
import { useTutorialVoice } from '../../features/tutorial/hooks/useTutorialVoice';
import TutorialScreenFrame from '../../features/tutorial/components/TutorialStep';
import TutorialHeader from '../../features/tutorial/components/TutorialHeader';
import Exercise0 from '../../features/tutorial/components/Exercise0';
import Exercise1 from '../../features/tutorial/components/Exercise1';
import Exercise2 from '../../features/tutorial/components/Exercise2';
import Exercise3 from '../../features/tutorial/components/Exercise3';
import Exercise3Complete from '../../features/tutorial/components/Exercise3Complete';
import FeedbackCorrect from '../../features/tutorial/components/FeedbackCorrect';
import FeedbackIncorrect from '../../features/tutorial/components/FeedbackIncorrect';
import CelebrationScreen from '../../features/tutorial/components/CelebrationScreen';
import { TutorialTheme } from '../../features/tutorial/components/tutorialTheme';
import { ROUTES, hrefCategorias } from '../../types/routes';

function stepBackground(step: TutorialStepId): string {
    switch (step) {
        case 'ex0_correct':
        case 'ex1_correct':
        case 'ex2_correct':
            return TutorialTheme.correctBg;
        case 'ex0_incorrect':
        case 'ex1_incorrect':
        case 'ex2_incorrect':
        case 'ex3_incorrect':
            return TutorialTheme.incorrectBg;
        case 'ex3_complete':
            return '#C8E6C9';
        case 'celebration':
            return TutorialTheme.celebrationBg;
        default:
            return TutorialTheme.baseBg;
    }
}

export default function TutorialIndex() {
    const router = useRouter();
    const { profile, isLoading } = useAuth();
    const { currentStep, setCurrentStep, starsFilled, bumpAttempt, completeTutorial } = useTutorialState();
    const { speakForStep, playCelebrationNarration, stopAll } = useTutorialVoice();

    useEffect(() => {
        if (isLoading || !profile) return;
        if (profile.level === 'BASICO') {
            router.replace(ROUTES.tutorialBasic);
        }
    }, [isLoading, profile, router]);

    useEffect(() => {
        let cancelled = false;
        if (isLoading || !profile) return;
        if (profile.level === 'BASICO') return;
        isTutorialDoneForLevel(profile.level).then((done) => {
            if (!cancelled && done) router.replace(hrefCategorias());
        });
        return () => {
            cancelled = true;
        };
    }, [router, isLoading, profile]);

    useEffect(() => {
        speakForStep(currentStep);
        return () => stopAll();
    }, [currentStep, speakForStep, stopAll]);

    useEffect(() => {
        if (currentStep === 'celebration') {
            playCelebrationNarration();
        }
    }, [currentStep, playCelebrationNarration]);

    const bg = useMemo(() => stepBackground(currentStep), [currentStep]);

    const finishApp = useCallback(async () => {
        await completeTutorial();
        router.replace(hrefCategorias());
    }, [completeTutorial, router]);

    const renderBody = () => {
        switch (currentStep) {
            case 'ex0_base':
                return (
                    <Exercise0
                        onCorrect={() => setCurrentStep('ex0_correct')}
                        onWrong={() => {
                            bumpAttempt('ex0');
                            setCurrentStep('ex0_incorrect');
                        }}
                        onReplay={() => speakForStep('ex0_base')}
                    />
                );
            case 'ex0_correct':
                return (
                    <FeedbackCorrect
                        onContinue={() => setCurrentStep('ex1_base')}
                        onReplay={() => speakForStep('ex0_correct')}
                    />
                );
            case 'ex0_incorrect':
                return (
                    <FeedbackIncorrect
                        onRetry={() => setCurrentStep('ex0_base')}
                        onReplay={() => speakForStep('ex0_incorrect')}
                    >
                        <TouchableOpacity
                            style={styles.reminderPicto}
                            activeOpacity={1}
                            accessibilityLabel="Recuerda alimentos"
                        >
                            <Text style={styles.reminderEmoji}>🍎</Text>
                            <Text style={styles.reminderLabel}>ALIMENTOS</Text>
                        </TouchableOpacity>
                    </FeedbackIncorrect>
                );
            case 'ex1_base':
                return (
                    <Exercise1
                        onCorrect={() => setCurrentStep('ex1_correct')}
                        onWrong={() => {
                            bumpAttempt('ex1');
                            setCurrentStep('ex1_incorrect');
                        }}
                    />
                );
            case 'ex1_correct':
                return (
                    <FeedbackCorrect
                        onContinue={() => setCurrentStep('ex2_base')}
                        onReplay={() => speakForStep('ex1_correct')}
                    />
                );
            case 'ex1_incorrect':
                return (
                    <FeedbackIncorrect
                        onRetry={() => setCurrentStep('ex1_base')}
                        onReplay={() => speakForStep('ex1_incorrect')}
                    >
                        <TouchableOpacity
                            style={styles.reminderPicto}
                            activeOpacity={1}
                            accessibilityLabel="Recuerda el jugo"
                        >
                            <Text style={styles.reminderEmoji}>🥤</Text>
                            <Text style={styles.reminderLabel}>JUGO</Text>
                        </TouchableOpacity>
                    </FeedbackIncorrect>
                );
            case 'ex2_base':
                return (
                    <Exercise2
                        onCorrect={() => setCurrentStep('ex2_correct')}
                        onWrong={() => {
                            bumpAttempt('ex2');
                            setCurrentStep('ex2_incorrect');
                        }}
                    />
                );
            case 'ex2_correct':
                return (
                    <FeedbackCorrect
                        onContinue={() => setCurrentStep('ex3_step1')}
                        onReplay={() => speakForStep('ex2_correct')}
                    />
                );
            case 'ex2_incorrect':
                return (
                    <FeedbackIncorrect
                        onRetry={() => setCurrentStep('ex2_base')}
                        onReplay={() => speakForStep('ex2_incorrect')}
                    >
                        <View style={styles.rowRemind}>
                            <View style={styles.miniPicto}>
                                <Text style={styles.reminderEmoji}>🥤</Text>
                                <Text style={styles.reminderLabel}>JUGO</Text>
                            </View>
                            <View style={styles.miniPicto}>
                                <Text style={styles.reminderEmoji}>🍪</Text>
                                <Text style={styles.reminderLabel}>GALLETA</Text>
                            </View>
                        </View>
                    </FeedbackIncorrect>
                );
            case 'ex3_step1':
                return (
                    <Exercise3
                        phase={1}
                        onYoQuiero={() => setCurrentStep('ex3_step2')}
                        onJuice={() => {}}
                        onCookie={() => {}}
                    />
                );
            case 'ex3_step2':
                return (
                    <Exercise3
                        phase={2}
                        onYoQuiero={() => {}}
                        onJuice={() => setCurrentStep('ex3_complete')}
                        onCookie={() => {
                            bumpAttempt('ex3');
                            setCurrentStep('ex3_incorrect');
                        }}
                    />
                );
            case 'ex3_incorrect':
                return (
                    <FeedbackIncorrect
                        onRetry={() => setCurrentStep('ex3_step2')}
                        onReplay={() => speakForStep('ex3_incorrect')}
                    >
                        <View style={styles.rowRemind}>
                            <View style={styles.miniPicto}>
                                <Text style={styles.reminderEmoji}>🥤</Text>
                                <Text style={styles.reminderLabel}>JUGO</Text>
                            </View>
                            <View style={styles.miniPicto}>
                                <Text style={styles.reminderEmoji}>🍪</Text>
                                <Text style={styles.reminderLabel}>GALLETA</Text>
                            </View>
                        </View>
                    </FeedbackIncorrect>
                );
            case 'ex3_complete':
                return (
                    <Exercise3Complete
                        onContinue={() => setCurrentStep('celebration')}
                        onReplay={() => speakForStep('ex3_complete')}
                    />
                );
            case 'celebration':
                return <CelebrationScreen onFinish={finishApp} onReplay={playCelebrationNarration} />;
            default:
                return null;
        }
    };

    return (
        <TutorialScreenFrame fadeKey={currentStep} backgroundColor={bg}>
            {currentStep !== 'celebration' ? (
                <TutorialHeader starsFilled={starsFilled} />
            ) : null}
            {renderBody()}
        </TutorialScreenFrame>
    );
}

const styles = StyleSheet.create({
    reminderPicto: {
        alignSelf: 'center',
        width: 160,
        height: 160,
        borderRadius: 24,
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#E53935',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    reminderEmoji: { fontSize: 56 },
    reminderLabel: { fontSize: 18, fontWeight: '800', color: '#1d1c12' },
    rowRemind: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 12,
    },
    miniPicto: {
        width: 120,
        height: 130,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(29,28,18,0.15)',
    },
});
