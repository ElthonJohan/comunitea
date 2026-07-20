/**
 * useRutinas.ts
 *
 * Hook para gestionar las rutinas diarias del usuario.
 * Persiste en la tabla `tasks` de Supabase con RLS por user_id.
 *
 * - Carga las rutinas del usuario autenticado.
 * - Si el usuario no tiene ninguna, siembra las predeterminadas.
 * - Permite añadir, eliminar y marcar como completadas.
 * - `resetCompleted` desmarca todas (útil al comenzar el día).
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export interface Rutina {
    id: string;
    user_id: string;
    label: string;
    emoji: string;
    completed: boolean;
    duration: number | null;
    position: number;
}

const DEFAULT_RUTINAS: Pick<Rutina, 'label' | 'emoji' | 'duration' | 'position'>[] = [
    { label: 'Despertar',         emoji: '☀️',  duration: null, position: 0 },
    { label: 'Baño',              emoji: '🚽',  duration: 5,    position: 1 },
    { label: 'Lavarse los dientes', emoji: '🪥', duration: 2,  position: 2 },
    { label: 'Desayunar',         emoji: '🥞',  duration: 15,   position: 3 },
    { label: 'Ir a la escuela',   emoji: '🏫',  duration: null, position: 4 },
];

export function useRutinas() {
    const { user } = useAuth();
    const [rutinas, setRutinas] = useState<Rutina[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!user) { setLoading(false); return; }
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('position', { ascending: true });

        if (fetchError) {
            setError(fetchError.message);
            setLoading(false);
            return;
        }

        // Primera vez: sembrar rutinas predeterminadas
        if (!data || data.length === 0) {
            const seeds = DEFAULT_RUTINAS.map(r => ({ ...r, user_id: user.id, completed: false }));
            const { data: inserted, error: insertError } = await supabase
                .from('tasks')
                .insert(seeds)
                .select();

            if (!insertError && inserted) {
                setRutinas(inserted as Rutina[]);
            }
        } else {
            setRutinas(data as Rutina[]);
        }

        setLoading(false);
    }, [user]);

    useEffect(() => {
        load();
    }, [load]);

    // ── Acciones ──────────────────────────────────────────────────────────────

    const toggleCompleted = async (id: string) => {
        const task = rutinas.find(t => t.id === id);
        if (!task) return;
        const newVal = !task.completed;
        // Actualización optimista
        setRutinas(prev => prev.map(t => t.id === id ? { ...t, completed: newVal } : t));
        await supabase.from('tasks').update({ completed: newVal }).eq('id', id);
    };

    const addRutina = async (label: string, emoji = '📝', duration?: number) => {
        if (!user || !label.trim()) return;
        const position = rutinas.length;
        const { data, error: insertError } = await supabase
            .from('tasks')
            .insert({
                user_id: user.id,
                label: label.trim(),
                emoji,
                duration: duration ?? null,
                completed: false,
                position,
            })
            .select()
            .single();

        if (!insertError && data) {
            setRutinas(prev => [...prev, data as Rutina]);
        }
    };

    const deleteRutina = async (id: string) => {
        setRutinas(prev => prev.filter(t => t.id !== id));
        await supabase.from('tasks').delete().eq('id', id);
    };

    /** Desmarca todas las tareas (para empezar el día desde cero). */
    const resetCompleted = async () => {
        if (!user) return;
        setRutinas(prev => prev.map(t => ({ ...t, completed: false })));
        await supabase
            .from('tasks')
            .update({ completed: false })
            .eq('user_id', user.id);
    };

    return { rutinas, loading, error, toggleCompleted, addRutina, deleteRutina, resetCompleted, reload: load };
}
