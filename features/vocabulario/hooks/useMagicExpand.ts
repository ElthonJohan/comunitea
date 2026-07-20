/**
 * Hook para la "varita mágica": expandir frase con IA (Edge Function ai-expand).
 * Centraliza la lógica usada en Dashboard y Category para evitar duplicación.
 */
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useSentence } from '../../../lib/hooks/useSentence';
import { useStats } from '../../perfil/hooks/useStats';
import { useSpeech } from './useSpeech';
import { useRutinas } from '../../perfil/hooks/useRutinas';
import { useAuth } from '../../../context/AuthContext';

function getTimeOfDay(): 'mañana' | 'tarde' | 'noche' {
    const h = new Date().getHours();
    if (h >= 6 && h < 12) return 'mañana';
    if (h >= 12 && h < 20) return 'tarde';
    return 'noche';
}

export function useMagicExpand() {
    const { sentence, clearSentence } = useSentence();
    const { logEvent, logSentence } = useStats();
    const { speakFreeText } = useSpeech();
    const { rutinas } = useRutinas();
    const { profile } = useAuth();
    const [isExpanding, setIsExpanding] = useState(false);

    const handleMagicExpand = useCallback(async () => {
        if (sentence.length === 0 || isExpanding) return;

        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
            Alert.alert(
                'Configuración',
                'No está configurada la URL de Supabase. Revisa las variables de entorno.'
            );
            return;
        }

        setIsExpanding(true);
        try {
            const labels = sentence.map(item => item.speechText || item.label);
            const timeOfDay = getTimeOfDay();
            const lastCompletedTask = rutinas.filter(r => r.completed).slice(-1)[0];
            const lastRoutine = lastCompletedTask?.label;
            const startedAt = Date.now();
            let { data: { session } } = await supabase.auth.getSession();

            // Si no hay token (expirado o nulo), intentar refrescar la sesión
            if (!session?.access_token) {
                const { data: refreshed } = await supabase.auth.refreshSession();
                session = refreshed.session;
            }

            if (!session?.access_token) {
                Alert.alert('Sesión expirada', 'Por favor vuelve a iniciar sesión.');
                return;
            }

            const token = session.access_token;

            const res = await fetch(`${supabaseUrl}/functions/v1/ai-expand`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    pictogramLabels: labels,
                    vocabularyLevel: profile?.level ?? 'INTERMEDIO',
                    timeOfDay,
                    lastRoutine,
                }),
            });

            if (!res.ok) {
                const errBody = await res.text().catch(() => '');
                console.warn(`[ai-expand] Error ${res.status}: ${errBody.slice(0, 200)}`);
                Alert.alert(
                    'Error',
                    'No se pudo expandir la frase. Comprueba la conexión e inténtalo de nuevo.'
                );
                return;
            }

            const { expandedText } = await res.json();
            if (expandedText) {
                await speakFreeText(expandedText);
                logEvent('ai_expand', {
                    latencyMs: Date.now() - startedAt,
                    sentenceLength: sentence.length,
                });
                logSentence(sentence.map(s => s.id));
            }
        } catch (err) {
            console.error('[ai-expand] Error inesperado:', err);
            Alert.alert(
                'Error',
                'Ocurrió un error al expandir la frase. Inténtalo de nuevo.'
            );
        } finally {
            setIsExpanding(false);
        }
    }, [sentence, isExpanding, rutinas, profile?.level, logEvent, logSentence, speakFreeText]);

    return { handleMagicExpand, isExpanding };
}
