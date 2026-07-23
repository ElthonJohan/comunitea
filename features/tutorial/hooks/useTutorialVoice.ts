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

type PlaybackToken = { cancelled: boolean };

/** Re-export para consumidores que lean scripts desde un solo lugar */
export { TUTORIAL_BASIC_SCRIPTS, TUTORIAL_STEP_SCRIPTS } from '../data/voice/tutorial';

function speakPromise(
    text: string,
    options: Speech.SpeechOptions,
    token?: PlaybackToken,
): Promise<void> {
    return new Promise((resolve) => {
        if (token?.cancelled) {
            resolve();
            return;
        }
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
    token?: PlaybackToken,
): Promise<void> {
    if (token?.cancelled) return;
    stopTutorialAudioPlayer(ref);
    const uri = await bundledModuleToPlayableUri(mod);
    if (token?.cancelled) return;

    // Detener cualquier reproductor activo previo
    stopTutorialAudioPlayer(ref);

    const player = createAudioPlayer({ uri });
    ref.current = player;

    if (token?.cancelled) {
        stopTutorialAudioPlayer(ref);
        return;
    }

    try {
        await playAudioPlayerUntilDone(player, 120_000);
    } finally {
        stopTutorialAudioPlayer(ref);
    }
}

export function useTutorialVoice() {
    const { voice, isLoading } = useVoice();
    const tutorialAudioRef = useRef<AudioPlayer | null>(null);
    const activeTokenRef = useRef<PlaybackToken>({ cancelled: false });

    const stopAll = useCallback(() => {
        activeTokenRef.current.cancelled = true;
        activeTokenRef.current = { cancelled: false };
        stopTutorialAudioPlayer(tutorialAudioRef);
        Speech.stop();
    }, []);

    const speak = useCallback(
        async (text: string) => {
            stopAll();
            const token = activeTokenRef.current;
            await speakPromise(text, SPEECH_OPTIONS, token);
        },
        [stopAll],
    );

    const speakWithDelay = useCallback(
        async (text: string, delayMs: number) => {
            await new Promise((r) => setTimeout(r, delayMs));
            const token = activeTokenRef.current;
            if (token.cancelled) return;
            stopTutorialAudioPlayer(tutorialAudioRef);
            await speakPromise(text, SPEECH_OPTIONS, token);
        },
        [stopAll],
    );

    const speakBasicWithDelay = useCallback(
        async (text: string, delayMs = 800) => {
            await new Promise((r) => setTimeout(r, delayMs));
            const token = activeTokenRef.current;
            if (token.cancelled) return;
            stopTutorialAudioPlayer(tutorialAudioRef);
            await speakPromise(text, BASIC_SPEECH_OPTIONS, token);
        },
        [stopAll],
    );

    const speakForStep = useCallback(
        async (step: TutorialStep) => {
            stopAll();
            const token = activeTokenRef.current;
            if (isLoading) return;

            const modules = getTutorialG1G2ClipModules(step, voice);
            if (modules.length > 0) {
                try {
                    for (const mod of modules) {
                        if (token.cancelled) break;
                        await playClipModule(mod, tutorialAudioRef, token);
                    }
                    return;
                } catch (err) {
                    console.warn('[Tutorial G1/G2] Falló audio grabado, usando TTS.', err);
                }
            }
            if (token.cancelled) return;
            const script = TUTORIAL_STEP_SCRIPTS[step as keyof typeof TUTORIAL_STEP_SCRIPTS];
            if (!script) return;
            await speakPromise(script, SPEECH_OPTIONS, token);
        },
        [voice, isLoading, stopAll],
    );

    const speakForBasicStep = useCallback(
        async (step: TutorialStepBasic) => {
            stopAll();
            const token = activeTokenRef.current;
            if (isLoading) return;

            const modules = getTutorialG3ClipModules(step, voice);
            if (modules.length > 0) {
                try {
                    await new Promise((r) => setTimeout(r, 800));
                    if (token.cancelled) return;
                    for (const mod of modules) {
                        if (token.cancelled) break;
                        await playClipModule(mod, tutorialAudioRef, token);
                    }
                    return;
                } catch (err) {
                    console.warn('[Tutorial G3] Falló audio grabado, usando TTS.', err);
                }
            }
            if (token.cancelled) return;
            const script = TUTORIAL_BASIC_SCRIPTS[step as keyof typeof TUTORIAL_BASIC_SCRIPTS];
            if (!script) return;
            await new Promise((r) => setTimeout(r, 800));
            if (token.cancelled) return;
            await speakPromise(script, BASIC_SPEECH_OPTIONS, token);
        },
        [voice, isLoading, stopAll],
    );

    const playCelebrationNarration = useCallback(async () => {
        stopAll();
        const token = activeTokenRef.current;
        const mod = getTutorialG1G2CelebrationModule(voice);
        if (mod != null) {
            try {
                await playClipModule(mod, tutorialAudioRef, token);
                return;
            } catch (err) {
                console.warn('[Tutorial G1/G2] Falló audio celebración, usando TTS.', err);
            }
        }
        if (token.cancelled) return;
        await speakPromise(TUTORIAL_CELEBRATION_NARRATION_INTERMEDIATE, SPEECH_OPTIONS, token);
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
