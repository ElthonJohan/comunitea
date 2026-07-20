/**
 * useSentenceHistory.ts
 * Carga el historial de oraciones (sentence_log) para mostrar en lista "Mis oraciones".
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export interface SentenceLogEntry {
    id: string;
    pictogram_ids: string[];
    created_at: string;
}

const LIMIT = 50;

export function useSentenceHistory() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<SentenceLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
            .from('sentence_log')
            .select('id, pictogram_ids, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(LIMIT);

        if (error) {
            setError(error.message);
            setEntries([]);
        } else {
            setEntries((data ?? []) as SentenceLogEntry[]);
        }
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        load();
    }, [load]);

    return { entries, loading, error, refresh: load };
}
