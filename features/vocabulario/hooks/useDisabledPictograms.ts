/**
 * useDisabledPictograms.ts
 * Gestiona el conjunto de IDs de pictogramas desactivados por el padre.
 * Persiste en AsyncStorage; la lectura es sincrónica tras la carga inicial.
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../constants/StorageKeys';
import { supabase } from '../../../lib/supabase';
import { auditLog } from '../../../lib/auditLog';

export function useDisabledPictograms() {
    const [disabled, setDisabled] = useState<Set<string>>(new Set());
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEYS.DISABLED_PICTOGRAMS).then((raw) => {
            if (raw) {
                try {
                    setDisabled(new Set(JSON.parse(raw) as string[]));
                } catch {
                    setDisabled(new Set());
                }
            }
            setLoaded(true);
        });
    }, []);

    const persist = useCallback(async (next: Set<string>) => {
        setDisabled(next);
        await AsyncStorage.setItem(
            STORAGE_KEYS.DISABLED_PICTOGRAMS,
            JSON.stringify([...next]),
        );
    }, []);

    const toggle = useCallback(
        async (id: string) => {
            const next = new Set(disabled);
            const wasDisabled = next.has(id);
            if (wasDisabled) next.delete(id);
            else next.add(id);
            await persist(next);
            // Audit log best-effort (no bloqueante)
            supabase.auth.getUser().then(({ data }) => {
                if (data?.user) {
                    auditLog(
                        data.user.id,
                        'vocabulary_pictogram_toggle',
                        wasDisabled ? 'disabled' : 'enabled',
                        wasDisabled ? 'enabled' : 'disabled',
                    ).catch(() => {});
                }
            });
        },
        [disabled, persist],
    );

    const isDisabled = useCallback((id: string) => disabled.has(id), [disabled]);

    return { disabled, isDisabled, toggle, loaded };
}
