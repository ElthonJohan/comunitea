import { useCallback, useState } from 'react';
import * as Speech from 'expo-speech';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { bundledModuleToPlayableUri, playAudioPlayerUntilDone } from '../lib/bundledAudioPlayback';

export type ReplayOptions = {
    language?: string;
    pitch?: number;
    rate?: number;
};

const DEFAULT_OPTIONS: ReplayOptions = {
    language: 'es-MX',
    pitch: 1.1,
    rate: 0.85,
};

/**
 * Hook reutilizable y dedicado para repetir la reproducción de voz o audios en cualquier
 * componente de ComuniTEA.
 *
 * Ofrece:
 * - `replayText(text, options)`: Detiene audios previos y reproduce un texto por TTS.
 * - `replayAudioModule(moduleNumber)`: Detiene audios previos y reproduce un archivo .mp3 estático.
 * - `stopPlayback()`: Cancela cualquier audio activo inmediatamente.
 * - `isPlaying`: Estado booleano para feedback visual (animaciones, íconos activos, etc.).
 */
export function useReplayAudio() {
    const [isPlaying, setIsPlaying] = useState(false);

    /**
     * Detiene cualquier reproducción en curso (TTS o reproductor nativo)
     */
    const stopPlayback = useCallback(() => {
        try {
            Speech.stop();
        } catch {
            /* noop */
        }
        setIsPlaying(false);
    }, []);

    /**
     * Reproduce una cadena de texto mediante el sintetizador nativo (TTS)
     */
    const replayText = useCallback(
        async (text: string, options?: ReplayOptions) => {
            if (!text || text.trim() === '') return;
            stopPlayback();
            setIsPlaying(true);

            const opts = { ...DEFAULT_OPTIONS, ...options };

            return new Promise<void>((resolve) => {
                Speech.speak(text, {
                    ...opts,
                    onDone: () => {
                        setIsPlaying(false);
                        resolve();
                    },
                    onStopped: () => {
                        setIsPlaying(false);
                        resolve();
                    },
                    onError: () => {
                        setIsPlaying(false);
                        resolve();
                    },
                });
            });
        },
        [stopPlayback],
    );

    /**
     * Reproduce un archivo de audio bundle/estático (.mp3)
     */
    const replayAudioModule = useCallback(
        async (audioModule: number) => {
            if (!audioModule) return;
            stopPlayback();
            setIsPlaying(true);

            let player: AudioPlayer | null = null;
            try {
                const uri = await bundledModuleToPlayableUri(audioModule);
                player = createAudioPlayer({ uri });
                await playAudioPlayerUntilDone(player, 60_000);
            } catch (err) {
                console.warn('[useReplayAudio] Error reproduciendo audioModule:', err);
            } finally {
                try {
                    player?.pause();
                    player?.remove();
                } catch {
                    /* noop */
                }
                setIsPlaying(false);
            }
        },
        [stopPlayback],
    );

    return {
        replayText,
        replayAudioModule,
        stopPlayback,
        isPlaying,
    };
}
