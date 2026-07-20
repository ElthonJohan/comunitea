import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export type ActivityType = 'rutina_visual' | 'practica_vocabulario' | 'pregunta';

export interface ActivityStep {
    id:           string;
    label:        string;
    emoji:        string;
    instruction?: string;
}

export interface GuidedActivity {
    id:         string;
    user_id:    string;
    name:       string;
    type:       ActivityType;
    steps:      ActivityStep[];
    created_at: string;
}

export function useActivities() {
    const { user } = useAuth();
    const [activities, setActivities] = useState<GuidedActivity[]>([]);
    const [loading, setLoading]       = useState(false);

    const loadActivities = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('guided_activities')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (!error && data) setActivities(data as GuidedActivity[]);
        setLoading(false);
    }, [user]);

    const createActivity = useCallback(async (
        name:  string,
        type:  ActivityType,
        steps: ActivityStep[],
    ): Promise<GuidedActivity | null> => {
        if (!user) return null;
        const { data, error } = await supabase
            .from('guided_activities')
            .insert({ user_id: user.id, name, type, steps })
            .select()
            .single();
        if (error || !data) {
            console.warn('[useActivities] Error al crear actividad:', error?.message);
            return null;
        }
        const created = data as GuidedActivity;
        setActivities((prev) => [created, ...prev]);
        return created;
    }, [user]);

    const deleteActivity = useCallback(async (id: string) => {
        const { error } = await supabase
            .from('guided_activities')
            .delete()
            .eq('id', id);
        if (!error) setActivities((prev) => prev.filter((a) => a.id !== id));
    }, []);

    /** Registra una sesión completada para reportes. */
    const logSession = useCallback(async (
        activityId:     string,
        stepsTotal:     number,
        stepsCompleted: number,
    ) => {
        if (!user) return;
        await supabase.from('activity_sessions').insert({
            user_id:         user.id,
            activity_id:     activityId,
            steps_total:     stepsTotal,
            steps_completed: stepsCompleted,
        });
    }, [user]);

    return { activities, loading, loadActivities, createActivity, deleteActivity, logSession };
}
