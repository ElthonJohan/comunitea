import * as Speech from 'expo-speech';

const PAUSA_MIN = 700;

let lastSpeakEnd = 0;

export async function speakG2(text: string, delayMs = 400): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, delayMs));
    const now = Date.now();
    const wait = Math.max(0, PAUSA_MIN - (now - lastSpeakEnd));
    if (wait > 0) {
        await new Promise<void>((r) => setTimeout(r, wait));
    }
    return new Promise((resolve) => {
        Speech.speak(text, {
            language: 'es-ES',
            rate: 0.82,
            pitch: 1.1,
            onDone: () => {
                lastSpeakEnd = Date.now();
                resolve();
            },
            onStopped: () => {
                lastSpeakEnd = Date.now();
                resolve();
            },
            onError: () => {
                lastSpeakEnd = Date.now();
                resolve();
            },
        });
    });
}

export function stopSpeakG2(): void {
    Speech.stop();
}
