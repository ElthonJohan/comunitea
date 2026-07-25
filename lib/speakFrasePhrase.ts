/**
 * TTS ElevenLabs para frases armadas (tablero ▶, formadores «yo quiero…»).
 * Voces Samanta / Luis (mismas que TTS ElevenLabs en useSpeech para pictos sin clip local).
 */
import * as Speech from 'expo-speech';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import type { VoiceProfile } from '../constants/AudioAssets';
import { normalizeFileUriForAudio, playAudioPlayerUntilDone } from './bundledAudioPlayback';

// /** Samanta — formador de frases (femenina) */
// export const ELEVENLABS_VOICE_FRASE_FEMENINA = 'qBvury71WUJfVeT1STkG';
// /** Luis — formador de frases (masculina) */
// export const ELEVENLABS_VOICE_FRASE_MASCULINA = 'WEXRePkZGpmcFLvCOaB1';


// Voces por defecto permitidas en el plan gratuito de ElevenLabs:
// Femenina (Rachel - muy natural en español): '21m00Tcm4TlvDq8ikWAM'
// Masculina (Adam): 'pNInz6obpgDQGcFmaJgB'

export const ELEVENLABS_VOICE_FRASE_FEMENINA = '21m00Tcm4TlvDq8ikWAM';
export const ELEVENLABS_VOICE_FRASE_MASCULINA = 'pNInz6obpgDQGcFmaJgB';

let phrasePlayer: AudioPlayer | null = null;

export function stopSpeakFrasePhrase(): void {
    try {
        phrasePlayer?.pause();
        phrasePlayer?.remove();
    } catch {
        /* noop */
    }
    phrasePlayer = null;
    Speech.stop();
}

function fallbackFraseSpeech(text: string, voice: VoiceProfile, ttsSpeed: number): Promise<void> {
    return new Promise((resolve) => {
        Speech.speak(text, {
            language: 'es-MX',
            pitch: voice === 'femenina' ? 1.2 : 0.8,
            rate: 0.9 * ttsSpeed,
            onDone: () => resolve(),
            onError: () => resolve(),
        });
    });
}

async function playFraseWithElevenLabs(
    text: string,
    voiceId: string,
    voice: VoiceProfile,
    ttsSpeed: number,
    isConnected: boolean,
): Promise<void> {
    if (!isConnected) {
        await fallbackFraseSpeech(text, voice, ttsSpeed);
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    const edgeUrl = `${supabaseUrl}/functions/v1/elevenlabs-tts`;

    try {
        const response = await fetch(edgeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text, voiceId, speed: ttsSpeed }),
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '(sin cuerpo)');
            console.warn(
                `[TTS frase] ElevenLabs falló — ${response.status}, usando voz del sistema.`,
                errorBody.slice(0, 200),
            );
            await fallbackFraseSpeech(text, voice, ttsSpeed);
            return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.byteLength; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binary);

        const fileUri =
            (FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '') +
            `temp_frase_${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const newSound = createAudioPlayer(normalizeFileUriForAudio(fileUri));
        phrasePlayer?.pause();
        phrasePlayer?.remove();
        phrasePlayer = newSound;

        await playAudioPlayerUntilDone(newSound, 120_000);
        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
        try {
            newSound.remove();
        } catch {
            /* noop */
        }
        phrasePlayer = null;
    } catch (err) {
        console.warn('[TTS frase] Error ElevenLabs, usando voz del sistema.', err);
        await fallbackFraseSpeech(text, voice, ttsSpeed);
    }
}

export type SpeakFrasePhraseOptions = {
    voice: VoiceProfile;
    isConnected: boolean;
    ttsSpeed: number;
    /** Igual que speakG2/speakG3: espera antes de hablar */
    delayMs?: number;
};

/**
 * Lee la frase completa con ElevenLabs (Luis / Samanta) o expo-speech si falla o no hay red.
 */
export async function speakFrasePhrase(text: string, opts: SpeakFrasePhraseOptions): Promise<void> {
    const delayMs = opts.delayMs ?? 0;
    if (delayMs > 0) {
        await new Promise<void>((r) => setTimeout(r, delayMs));
    }

    stopSpeakFrasePhrase();

    const voiceId =
        opts.voice === 'masculina' ? ELEVENLABS_VOICE_FRASE_MASCULINA : ELEVENLABS_VOICE_FRASE_FEMENINA;

    await playFraseWithElevenLabs(text, voiceId, opts.voice, opts.ttsSpeed, opts.isConnected);
}
