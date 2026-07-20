import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageKey } from './keys';

export async function storageGet(key: StorageKey): Promise<string | null> {
    return AsyncStorage.getItem(key);
}

export async function storageSet(key: StorageKey, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
}

export async function storageRemove(key: StorageKey): Promise<void> {
    await AsyncStorage.removeItem(key);
}

export async function storageGetJson<T>(key: StorageKey): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export async function storageSetJson(key: StorageKey, value: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
}
