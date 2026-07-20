/**
 * useCustomPictograms.ts
 *
 * Gestiona los pictogramas personalizados ("Mi Mundo en Fotos") del usuario.
 * Persiste en la tabla `custom_pictograms` de Supabase.
 *
 * - `pictograms` → lista filtrada por la categoría activa seleccionada.
 * - `savePictogram` → inserta un nuevo registro después de subir la imagen.
 * - `deletePictogram` → elimina el pictograma (la imagen en Storage queda;
 *    se puede limpiar con un job serverless en el futuro).
 * - `reload` → recarga manualmente (útil tras guardar).
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { prewarmCache, removeCached } from '../../../lib/pictogramCache';

export interface CustomPictogram {
    id: string;
    user_id: string;
    category_key: string | null;
    label: string;
    /** URL remota en Supabase Storage. Siempre disponible. */
    image_url: string;
    /** URI local en el filesystem del dispositivo. Disponible después del primer warmup offline. */
    local_uri?: string;
    audio_url: string | null;
    created_at: string;
}

export function useCustomPictograms(categoryKey: string | null) {
    const { user } = useAuth();
    const [pictograms, setPictograms] = useState<CustomPictogram[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!user || categoryKey === null) {
            setPictograms([]);
            return;
        }
        setLoading(true);

        const { data } = await supabase
            .from('custom_pictograms')
            .select('*')
            .eq('user_id', user.id)
            .eq('category_key', categoryKey)
            .order('created_at', { ascending: true });

        const loaded = (data as CustomPictogram[]) ?? [];
        setPictograms(loaded);
        setLoading(false);
        // Pre-calentar cache en background sin bloquear
        if (loaded.length > 0) prewarmCache(loaded);
    }, [user, categoryKey]);

    useEffect(() => { load(); }, [load]);

    /**
     * Guarda un nuevo pictograma en la DB.
     * @param imageUrl  URL pública devuelta por el Storage de Supabase.
     * @param label     Nombre del pictograma (ej: "Abuelita").
     */
    const savePictogram = async (imageUrl: string, label: string): Promise<void> => {
        if (!user || !categoryKey) return;
        const { data, error } = await supabase
            .from('custom_pictograms')
            .insert({
                user_id: user.id,
                category_key: categoryKey,
                label: label.trim(),
                image_url: imageUrl,
            })
            .select()
            .single();

        if (!error && data) {
            setPictograms(prev => [...prev, data as CustomPictogram]);
        }
    };

    const deletePictogram = async (id: string): Promise<void> => {
        const target = pictograms.find(p => p.id === id);
        setPictograms(prev => prev.filter(p => p.id !== id));

        // Eliminar cache local
        removeCached(id).catch(() => {});

        // Extraer la ruta del archivo dentro del bucket a partir de la URL pública
        // Formato: .../storage/v1/object/public/pictograms/<path>
        if (target?.image_url) {
            const marker = '/object/public/pictograms/';
            const idx = target.image_url.indexOf(marker);
            if (idx !== -1) {
                const storagePath = target.image_url.slice(idx + marker.length);
                await supabase.storage.from('pictograms').remove([storagePath]);
            }
        }

        await supabase.from('custom_pictograms').delete().eq('id', id);
    };

    return { pictograms, loading, savePictogram, deletePictogram, reload: load };
}
