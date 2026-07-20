/**
 * Reproducción fiable de MP3 empaquetados con `require()`.
 * En iOS, AVPlayer a veces no carga el recurso hasta que existe `localUri` tras `downloadAsync`
 * (ver comentarios en `expo-audio` → `resolveSourceWithDownload`).
 */
import { Asset } from 'expo-asset';
import type { AudioPlayer } from 'expo-audio';

const bundledUriCache = new Map<number, string>();

export async function bundledModuleToPlayableUri(moduleId: number): Promise<string> {
    const cached = bundledUriCache.get(moduleId);
    if (cached) return cached;
    const asset = Asset.fromModule(moduleId);
    if (!asset.downloaded) {
        await asset.downloadAsync();
    }
    const raw = asset.localUri ?? asset.uri;
    if (!raw) {
        throw new Error('bundledModuleToPlayableUri: el asset no tiene uri');
    }
    const uri =
        raw.startsWith('file:') || raw.startsWith('http://') || raw.startsWith('https://')
            ? raw
            : `file://${raw}`;
    bundledUriCache.set(moduleId, uri);
    return uri;
}

/** Rutas absolutas sin esquema → `file://` para el reproductor nativo. */
export function normalizeFileUriForAudio(pathOrUri: string): string {
    const t = pathOrUri.trim();
    if (t.startsWith('file:') || t.startsWith('http://') || t.startsWith('https://')) return t;
    if (t.startsWith('/')) return `file://${t}`;
    return t;
}

/** Espera fin de clip o tiempo máximo (evita Promesas colgadas si no llega `didJustFinish`). */
export function playAudioPlayerUntilDone(player: AudioPlayer, maxWaitMs: number): Promise<void> {
    return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            try {
                sub.remove();
            } catch {
                /* noop */
            }
            clearTimeout(tid);
            resolve();
        };
        const sub = player.addListener('playbackStatusUpdate', (status: { didJustFinish?: boolean }) => {
            if (status?.didJustFinish) finish();
        });
        const tid = setTimeout(finish, maxWaitMs);
        try {
            player.play();
        } catch {
            finish();
        }
    });
}
