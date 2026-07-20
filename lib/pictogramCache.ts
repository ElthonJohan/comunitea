/**
 * pictogramCache.ts
 *
 * Cache local de imágenes de pictogramas personalizados en el filesystem del dispositivo.
 * Las imágenes se descargan de Supabase Storage tras la carga inicial y se sirven
 * desde el dispositivo cuando no hay conexión.
 *
 * Estructura de archivos:
 *   documentDirectory/pictogram-cache/<id>.<ext>
 *
 * Metadata persistida en AsyncStorage:
 *   { [pictogramId]: localFileUri }
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const CACHE_META_KEY = 'pictogram_cache_meta';
const CACHE_DIR = (FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '') + 'pictogram-cache/';

async function ensureCacheDir(): Promise<void> {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true }).catch(() => {});
}

async function loadMeta(): Promise<Record<string, string>> {
    try {
        const raw = await AsyncStorage.getItem(CACHE_META_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

async function saveMeta(meta: Record<string, string>): Promise<void> {
    await AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
}

/** Descarga una imagen y la guarda en el filesystem. Devuelve el URI local. */
async function downloadAndCache(id: string, remoteUrl: string): Promise<string> {
    await ensureCacheDir();
    // Extraer extensión sin query params
    const ext = remoteUrl.split('?')[0].split('.').pop() ?? 'jpg';
    const localUri = CACHE_DIR + id + '.' + ext;
    const result = await FileSystem.downloadAsync(remoteUrl, localUri);
    if (result.status === 200) {
        const meta = await loadMeta();
        meta[id] = localUri;
        await saveMeta(meta);
        return localUri;
    }
    return remoteUrl;
}

/**
 * Devuelve el URI local de un pictograma si está cacheado y el archivo existe.
 * Si no, lo descarga de forma síncrona y devuelve el URI local (o el remoto como fallback).
 */
export async function getCachedUri(id: string, remoteUrl: string): Promise<string> {
    try {
        const meta = await loadMeta();
        const localUri = meta[id];
        if (localUri) {
            const info = await FileSystem.getInfoAsync(localUri);
            if (info.exists) return localUri;
        }
        return await downloadAndCache(id, remoteUrl);
    } catch {
        return remoteUrl;
    }
}

/**
 * Pre-calienta el cache en background para los pictogramas que aún no están guardados.
 * Fire-and-forget: no bloquea la carga inicial.
 */
export function prewarmCache(items: Array<{ id: string; image_url: string }>): void {
    loadMeta().then(meta => {
        for (const item of items) {
            if (!meta[item.id]) {
                downloadAndCache(item.id, item.image_url).catch(() => {});
            }
        }
    }).catch(() => {});
}

/** Elimina el archivo cacheado localmente cuando se borra un pictograma. */
export async function removeCached(id: string): Promise<void> {
    try {
        const meta = await loadMeta();
        const localUri = meta[id];
        if (localUri) {
            await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
            delete meta[id];
            await saveMeta(meta);
        }
    } catch (e) {
        console.warn('[PictogramCache] Error eliminando cache:', e);
    }
}

/** Guarda un archivo ya descargado (ej: tras subida) directamente en el cache. */
export async function setCached(id: string, localUri: string): Promise<void> {
    try {
        const meta = await loadMeta();
        meta[id] = localUri;
        await saveMeta(meta);
    } catch (e) {
        console.warn('[PictogramCache] Error guardando metadata:', e);
    }
}
