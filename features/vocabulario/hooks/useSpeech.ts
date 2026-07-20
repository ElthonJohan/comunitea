import { useEffect, useRef } from 'react';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useVoice } from '../../../lib/hooks/useVoice';
import { useNetwork } from '../../../context/NetworkContext';
import { useParental } from '../../../lib/hooks/useParental';
import { getAudioAssets } from '../../../constants/AudioAssets';
import { Pictogram } from '../data/Vocabulary';
import { supabase } from '../../../lib/supabase';
import {
    bundledModuleToPlayableUri,
    normalizeFileUriForAudio,
    playAudioPlayerUntilDone,
} from '../../../lib/bundledAudioPlayback';
import {
    stopSpeakFrasePhrase,
    ELEVENLABS_VOICE_FRASE_FEMENINA,
    ELEVENLABS_VOICE_FRASE_MASCULINA,
} from '../../../lib/speakFrasePhrase';
import * as FileSystem from 'expo-file-system/legacy';

export const useSpeech = () => {
    const { voice } = useVoice();
    const { isConnected } = useNetwork();
    const { settings: parentalSettings } = useParental();
    const ttsSpeed = parentalSettings?.tts_speed ?? 1.0;
    const soundRef = useRef<AudioPlayer | null>(null);

    useEffect(() => {
        return () => {
            soundRef.current?.remove();
        };
    }, []);

    /** Fallback a voz del sistema (expo-speech) si ElevenLabs no está disponible o falla. */
    const fallbackSpeech = (text: string, onDone: () => void) => {
        const options: Speech.SpeechOptions = {
            language: 'es-MX',
            pitch: voice === 'femenina' ? 1.2 : 0.8,
            rate: 0.9 * ttsSpeed,
            onDone: () => onDone(),
            onError: () => onDone(),
        };
        Speech.speak(text, options);
    };

    /** Intenta reproducir con ElevenLabs; si falla o no hay red, usa expo-speech. */
    const playWithElevenLabs = async (text: string): Promise<void> => {
        // Sin conexión: usar directamente voz del sistema sin intentar la red
        if (!isConnected) {
            return new Promise((resolve) => fallbackSpeech(text, resolve));
        }
        const voiceId =
            voice === 'masculina'
                ? ELEVENLABS_VOICE_FRASE_MASCULINA
                : ELEVENLABS_VOICE_FRASE_FEMENINA;

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
        const edgeUrl = `${supabaseUrl}/functions/v1/elevenlabs-tts`;

        try {
            const response = await fetch(edgeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ text, voiceId, speed: ttsSpeed }),
            });

            if (!response.ok) {
                const errorBody = await response.text().catch(() => '(sin cuerpo)');
                console.warn(`[TTS] ElevenLabs falló — ${response.status}, usando voz del sistema.`, errorBody.slice(0, 200));
                return new Promise((resolve) => fallbackSpeech(text, resolve));
            }

            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < uint8Array.byteLength; i++) {
                binary += String.fromCharCode(uint8Array[i]);
            }
            const base64 = btoa(binary);

            const fileUri = (FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '') + `temp_speech_${Date.now()}.mp3`;
            await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const newSound = createAudioPlayer(normalizeFileUriForAudio(fileUri));
            soundRef.current?.pause();
            soundRef.current = newSound;

            await playAudioPlayerUntilDone(newSound, 120_000);
            FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
            return;
        } catch (err) {
            console.warn('[TTS] Error con ElevenLabs, usando voz del sistema.', err);
            return new Promise((resolve) => fallbackSpeech(text, resolve));
        }
    };

    const speak = async (text: string, id?: string): Promise<void> => {
        const audioAssets = getAudioAssets(voice);
        if (id && audioAssets[id]) {
            try {
                const mod = audioAssets[id] as number;
                const uri = await bundledModuleToPlayableUri(mod);
                const newSound = createAudioPlayer({ uri });
                soundRef.current?.pause();
                soundRef.current = newSound;
                await playAudioPlayerUntilDone(newSound, 12_000);
                return;
            } catch (err) {
                console.error('[Speak] Error cargando/reproduciendo audio local:', err);
            }
        }
        await playWithElevenLabs(text);
    };

    /**
     * Tablero AAC: intenta mp3 local en `getAudioAssets(voice)` para masculina y femenina;
     * si no hay clip, usa ElevenLabs / voz del sistema con `text`.
     */
    const speakWithAssetKey = async (text: string, assetKey: string): Promise<void> => {
        stopSpeakFrasePhrase();
        const audioAssets = getAudioAssets(voice);
        const mod = audioAssets[assetKey];
        if (mod) {
            try {
                const uri = await bundledModuleToPlayableUri(mod as number);
                const newSound = createAudioPlayer({ uri });
                soundRef.current?.pause();
                soundRef.current = newSound;
                await playAudioPlayerUntilDone(newSound, 12_000);
                return;
            } catch (err) {
                console.error('[Speak] Audio local (tablero):', err);
            }
        }
        await playWithElevenLabs(text);
    };

    const speakFreeText = async (text: string): Promise<void> => {
        await playWithElevenLabs(text);
    };

    const speakSentence = async (items: Pictogram[]) => {
        for (const item of items) {
            await speak(item.text, item.id);
        }
    };

    const stop = async () => {
        soundRef.current?.pause();
        Speech.stop();
    };

    return { speak, speakSentence, speakFreeText, speakWithAssetKey, stop };
};
