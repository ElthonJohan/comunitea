/**
 * Frase natural para TTS (ElevenLabs): llama a la edge `ai-expand` con intención explícita.
 * Si falla red o IA, devuelve `null` y el caller usa la plantilla simple.
 */
import { supabase } from './supabase';

export type PhraseIntentForExpand = 'formador' | 'tablero';

export type ExpandPhraseForTtsParams = {
    pictogramLabels: string[];
    vocabularyLevel?: 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
    phraseIntent: PhraseIntentForExpand;
    timeOfDay?: string;
    lastRoutine?: string;
};

export async function expandPhraseForTts(params: ExpandPhraseForTtsParams): Promise<string | null> {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || params.pictogramLabels.length === 0) return null;

    let { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        session = refreshed.session;
    }
    const token = session?.access_token ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!token) return null;

    try {
        const res = await fetch(`${supabaseUrl}/functions/v1/ai-expand`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                pictogramLabels: params.pictogramLabels,
                vocabularyLevel: params.vocabularyLevel ?? 'INTERMEDIO',
                phraseIntent: params.phraseIntent,
                ...(params.timeOfDay ? { timeOfDay: params.timeOfDay } : {}),
                ...(params.lastRoutine ? { lastRoutine: params.lastRoutine } : {}),
            }),
        });
        if (!res.ok) return null;
        const data = await res.json() as { expandedText?: string };
        const t = typeof data.expandedText === 'string' ? data.expandedText.trim() : '';
        if (!t) return null;
        return t.replace(/^["«]+|["»]+$/g, '').trim() || null;
    } catch {
        return null;
    }
}

function getTimeOfDay(): 'mañana' | 'tarde' | 'noche' {
    const h = new Date().getHours();
    if (h >= 6 && h < 12) return 'mañana';
    if (h >= 12 && h < 20) return 'tarde';
    return 'noche';
}

/** Atajos para formador «Yo quiero + objeto» y barra del tablero. */
export async function expandFormadorYoQuiero(
    palabraFrase: string,
    label: string,
    vocabularyLevel?: 'BASICO' | 'INTERMEDIO' | 'AVANZADO',
): Promise<string | null> {
    const word = palabraFrase.trim() || label.trim();
    if (!word) return null;
    return expandPhraseForTts({
        pictogramLabels: ['Yo quiero', word],
        vocabularyLevel,
        phraseIntent: 'formador',
        timeOfDay: getTimeOfDay(),
    });
}

export async function expandTableroSlots(
    labelsInOrder: string[],
    vocabularyLevel?: 'BASICO' | 'INTERMEDIO' | 'AVANZADO',
): Promise<string | null> {
    if (labelsInOrder.length === 0) return null;
    return expandPhraseForTts({
        pictogramLabels: labelsInOrder,
        vocabularyLevel,
        phraseIntent: 'tablero',
        timeOfDay: getTimeOfDay(),
    });
}
