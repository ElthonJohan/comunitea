import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
    useTutorialBasicState,
    type TutorialStepBasic,
    isTutorialBasicCompleted,
} from '../../features/tutorial/hooks/useTutorialBasicState';
import { useTutorialVoice } from '../../features/tutorial/hooks/useTutorialVoice';
import TutorialScreenFrame from '../../features/tutorial/components/TutorialStep';
import TutorialHeader from '../../features/tutorial/components/TutorialHeader';
import FeedbackCorrect from '../../features/tutorial/components/FeedbackCorrect';
import FeedbackIncorrect from '../../features/tutorial/components/FeedbackIncorrect';
import CelebrationScreen from '../../features/tutorial/components/CelebrationScreen';
import { TutorialTheme } from '../../features/tutorial/components/tutorialTheme';
import Exercise0Basic from '../../features/tutorial/components/basic/Exercise0Basic';
import Exercise1Basic from '../../features/tutorial/components/basic/Exercise1Basic';
import Exercise2Basic from '../../features/tutorial/components/basic/Exercise2Basic';
import Exercise3Basic from '../../features/tutorial/components/basic/Exercise3Basic';
import Exercise3BasicSuccess from '../../features/tutorial/components/basic/Exercise3BasicSuccess';
import { Fonts } from '../../constants/Typography';
import { hrefCategorias } from '../../types/routes';

const BASIC_CELEBRATION_ACHIEVEMENTS = [
    'Tocar imágenes en la pantalla',
    'Encontrar la imagen igual',
    'Arrastrar objetos',
];

function stepBackground(step: TutorialStepBasic): string {
    switch (step) {
        case 'b_ex0_correct':
        case 'b_ex1_correct':
        case 'b_ex2_correct':
        case 'b_ex3_correct':
            return TutorialTheme.correctBg;
        case 'b_ex2_incorrect':
        case 'b_ex3_incorrect':
            return TutorialTheme.incorrectBg;
        case 'b_celebration':
            return TutorialTheme.celebrationBg;
        default:
            return TutorialTheme.baseBg;
    }
}

function SmallApplePicto() {
    return (
        <View style={styles.smallPicto}>
            <Text style={styles.smallEmoji}>🍎</Text>
            <Text style={styles.smallLabel}>MANZANA</Text>
        </View>
    );
}

export default function TutorialBasicScreen() {
    const router = useRouter();
    const {
        currentStep,
        setCurrentStep,
        starsFilled,
        starSlots,
        bumpAttempt,
        completeTutorialBasic,
    } = useTutorialBasicState();
    const { speakForBasicStep, stopAll } = useTutorialVoice();

    useEffect(() => {
        let cancelled = false;
        isTutorialBasicCompleted().then((done) => {
            if (!cancelled && done) router.replace(hrefCategorias());
        });
        return () => {
            cancelled = true;
        };
    }, [router]);

    useEffect(() => {
        speakForBasicStep(currentStep);
        return () => stopAll();
    }, [currentStep, speakForBasicStep, stopAll]);

    const bg = useMemo(() => stepBackground(currentStep), [currentStep]);

    const finishApp = useCallback(async () => {
        await completeTutorialBasic();
        router.replace(hrefCategorias());
    }, [completeTutorialBasic, router]);

    const renderBody = () => {
        switch (currentStep) {
            case 'b_ex0_base':
                return <Exercise0Basic onCorrect={() => setCurrentStep('b_ex0_correct')} />;
            case 'b_ex0_correct':
                return (
                    <FeedbackCorrect
                        message="¡Muy bien!"
                        onContinue={() => setCurrentStep('b_ex1_base')}
                    >
                        <View style={styles.smallPicto}>
                            <Text style={styles.smallEmoji}>🍎</Text>
                            <Text style={styles.smallLabel}>ALIMENTOS</Text>
                        </View>
                    </FeedbackCorrect>
                );
            case 'b_ex1_base':
                return <Exercise1Basic onCorrect={() => setCurrentStep('b_ex1_correct')} />;
            case 'b_ex1_correct':
                return (
                    <FeedbackCorrect
                        message="¡Muy bien!"
                        onContinue={() => setCurrentStep('b_ex2_base')}
                    >
                        <SmallApplePicto />
                    </FeedbackCorrect>
                );
            case 'b_ex2_base':
                return (
                    <Exercise2Basic
                        onCorrect={() => setCurrentStep('b_ex2_correct')}
                        onWrong={() => {
                            bumpAttempt('b_ex2');
                            setCurrentStep('b_ex2_incorrect');
                        }}
                    />
                );
            case 'b_ex2_correct':
                return (
                    <FeedbackCorrect
                        message="¡Muy bien!"
                        onContinue={() => setCurrentStep('b_ex3_base')}
                    >
                        <SmallApplePicto />
                    </FeedbackCorrect>
                );
            case 'b_ex2_incorrect':
                return (
                    <FeedbackIncorrect
                        showAvatar
                        onRetry={() => setCurrentStep('b_ex2_base')}
                    >
                        <Text style={styles.retryHint}>↺ puede volver a intentar</Text>
                        <View style={styles.dimRow}>
                            <View style={[styles.miniChoice, styles.dimmed]}>
                                <Text style={styles.miniEmoji}>🍎</Text>
                                <Text style={styles.miniLabel}>MANZANA</Text>
                            </View>
                            <View style={[styles.miniChoice, styles.dimmed]}>
                                <Text style={styles.miniEmoji}>🚗</Text>
                                <Text style={styles.miniLabel}>COCHE</Text>
                            </View>
                        </View>
                    </FeedbackIncorrect>
                );
            case 'b_ex3_base':
                return (
                    <Exercise3Basic
                        onSuccess={() => setCurrentStep('b_ex3_correct')}
                        onFail={() => {
                            bumpAttempt('b_ex3');
                            setCurrentStep('b_ex3_incorrect');
                        }}
                    />
                );
            case 'b_ex3_correct':
                return (
                    <Exercise3BasicSuccess onContinue={() => setCurrentStep('b_celebration')} />
                );
            case 'b_ex3_incorrect':
                return (
                    <FeedbackIncorrect
                        showAvatar
                        onRetry={() => setCurrentStep('b_ex3_base')}
                    >
                        <Text style={styles.retryHint}>↺ volver a intentar</Text>
                        <View style={styles.dragRemind}>
                            <View style={[styles.dragZoneMini, styles.dimmed]}>
                                <Text style={styles.miniEmoji}>🍎</Text>
                            </View>
                            <Text style={styles.dragArrow}>→</Text>
                            <View style={[styles.dragZoneMini, styles.dimmed]}>
                                <Text style={styles.miniEmoji}>👄</Text>
                            </View>
                        </View>
                    </FeedbackIncorrect>
                );
            case 'b_celebration':
                return (
                    <CelebrationScreen
                        title="¡LO LOGRASTE!"
                        subtitle="¡Muy bien! Completaste el tutorial"
                        achievements={BASIC_CELEBRATION_ACHIEVEMENTS}
                        buttonLabel="Empezar a usar la app →"
                        onContinue={finishApp}
                    />
                );
            default:
                return null;
        }
    };

    const hideHeader =
        currentStep === 'b_celebration' || currentStep === 'b_ex3_correct';

    return (
        <TutorialScreenFrame fadeKey={currentStep} backgroundColor={bg}>
            {!hideHeader ? <TutorialHeader starsFilled={starsFilled} starSlots={starSlots} /> : null}
            {renderBody()}
        </TutorialScreenFrame>
    );
}

const styles = StyleSheet.create({
    smallPicto: {
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
        width: 120,
        height: 120,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderWidth: 2,
        borderColor: 'rgba(46,125,50,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallEmoji: { fontSize: 52 },
    smallLabel: {
        marginTop: 4,
        fontSize: 16,
        fontFamily: Fonts.displayBold,
        color: '#1d1c12',
    },
    retryHint: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: Fonts.bodySemiBold,
        color: 'rgba(29,28,18,0.55)',
        marginBottom: 8,
    },
    dimRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 14,
        marginTop: 8,
    },
    miniChoice: {
        width: 110,
        height: 118,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(29,28,18,0.1)',
    },
    dimmed: {
        opacity: 0.6,
    },
    miniEmoji: { fontSize: 48 },
    miniLabel: {
        marginTop: 4,
        fontSize: 14,
        fontFamily: Fonts.bodyBold,
        color: '#1d1c12',
    },
    dragRemind: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 12,
    },
    dragZoneMini: {
        width: 88,
        height: 88,
        borderRadius: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(29,28,18,0.12)',
    },
    dragArrow: {
        fontSize: 28,
        color: TutorialTheme.incorrectAccent,
        fontFamily: Fonts.bodyBold,
    },
});
