import { useCallback, useRef, type MutableRefObject } from 'react';
import * as Speech from 'expo-speech';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { bundledModuleToPlayableUri, playAudioPlayerUntilDone } from '../../../lib/bundledAudioPlayback';
import type { TutorialStep } from './useTutorialState';
import type { TutorialStepBasic } from './useTutorialBasicState';
import {
    TUTORIAL_BASIC_SCRIPTS,
    TUTORIAL_CELEBRATION_NARRATION_INTERMEDIATE,
    TUTORIAL_STEP_SCRIPTS,
} from '../data/voice/tutorial';
import {
    getTutorialG1G2CelebrationModule,
    getTutorialG1G2ClipModules,
} from '../data/voice/tutorialG1G2Assets';
import { getTutorialG3ClipModules } from '../data/voice/tutorialG3Assets';
import { useVoice } from '../../../lib/hooks/useVoice';

const SPEECH_OPTIONS: Speech.SpeechOptions = {
    language: 'es-MX',
    pitch: 1.1,
    rate: 0.85,
};

const BASIC_SPEECH_OPTIONS: Speech.SpeechOptions = {
    language: 'es-MX',
    pitch: 1.15,
    rate: 0.75,
};

/** Re-export para consumidores que lean scripts desde un solo lugar */
export { TUTORIAL_BASIC_SCRIPTS, TUTORIAL_STEP_SCRIPTS } from '../data/voice/tutorial';

function speakPromise(text: string, options: Speech.SpeechOptions): Promise<void> {
    return new Promise((resolve) => {
        Speech.stop();
        Speech.speak(text, {
            ...options,
            onDone: () => resolve(),
            onStopped: () => resolve(),
            onError: () => resolve(),
        });
    });
}

function stopTutorialAudioPlayer(ref: MutableRefObject<AudioPlayer | null>) {
    try {
        ref.current?.pause();
        ref.current?.remove();
    } catch {
        /* noop */
    }
    ref.current = null;
}

async function playClipModule(
    mod: number,
    ref: MutableRefObject<AudioPlayer | null>,
): Promise<void> {
    stopTutorialAudioPlayer(ref);
    const uri = await bundledModuleToPlayableUri(mod);
    const player = createAudioPlayer({ uri });
    ref.current = player;
    try {
        await playAudioPlayerUntilDone(player, 120_000);
    } finally {
        stopTutorialAudioPlayer(ref);
    }
}

export function useTutorialVoice() {
    const { voice } = useVoice();
    const tutorialAudioRef = useRef<AudioPlayer | null>(null);

    const stopAll = useCallback(() => {
        stopTutorialAudioPlayer(tutorialAudioRef);
        Speech.stop();
    }, []);

    const speak = useCallback(async (text: string) => {
        stopAll();
        await speakPromise(text, SPEECH_OPTIONS);
    }, [stopAll]);

    const speakWithDelay = useCallback(
        async (text: string, delayMs: number) => {
            await new Promise((r) => setTimeout(r, delayMs));
            stopAll();
            await speakPromise(text, SPEECH_OPTIONS);
        },
        [stopAll],
    );

    const speakBasicWithDelay = useCallback(
        async (text: string, delayMs = 800) => {
            await new Promise((r) => setTimeout(r, delayMs));
            stopAll();
            await speakPromise(text, BASIC_SPEECH_OPTIONS);
        },
        [stopAll],
    );

    const speakForStep = useCallback(
        async (step: TutorialStep) => {
            stopAll();
            const modules = getTutorialG1G2ClipModules(step, voice);
            if (modules.length > 0) {
                try {
                    for (const mod of modules) {
                        await playClipModule(mod, tutorialAudioRef);
                    }
                    return;
                } catch (err) {
                    console.warn('[Tutorial G1/G2] Falló audio grabado, usando TTS.', err);
                }
            }
            const script = TUTORIAL_STEP_SCRIPTS[step as keyof typeof TUTORIAL_STEP_SCRIPTS];
            if (!script) return;
            await speakPromise(script, SPEECH_OPTIONS);
        },
        [voice, stopAll],
    );

    const speakForBasicStep = useCallback(
        async (step: TutorialStepBasic) => {
            stopAll();
            const modules = getTutorialG3ClipModules(step, voice);
            if (modules.length > 0) {
                try {
                    await new Promise((r) => setTimeout(r, 800));
                    for (const mod of modules) {
                        await playClipModule(mod, tutorialAudioRef);
                    }
                    return;
                } catch (err) {
                    console.warn('[Tutorial G3] Falló audio grabado, usando TTS.', err);
                }
            }
            const script = TUTORIAL_BASIC_SCRIPTS[step as keyof typeof TUTORIAL_BASIC_SCRIPTS];
            if (!script) return;
            await new Promise((r) => setTimeout(r, 800));
            await speakPromise(script, BASIC_SPEECH_OPTIONS);
        },
        [voice, stopAll],
    );

    const playCelebrationNarration = useCallback(async () => {
        stopAll();
        const mod = getTutorialG1G2CelebrationModule(voice);
        if (mod != null) {
            try {
                await playClipModule(mod, tutorialAudioRef);
                return;
            } catch (err) {
                console.warn('[Tutorial G1/G2] Falló audio celebración, usando TTS.', err);
            }
        }
        await speakPromise(TUTORIAL_CELEBRATION_NARRATION_INTERMEDIATE, SPEECH_OPTIONS);
    }, [voice, stopAll]);

    return {
        speak,
        speakWithDelay,
        speakBasicWithDelay,
        speakForStep,
        speakForBasicStep,
        playCelebrationNarration,
        stopAll,
    };
}
