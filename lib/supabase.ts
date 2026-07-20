import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '[ComuniTEA] Faltan variables de entorno requeridas.\n' +
        'Asegúrate de que tu archivo .env tenga:\n' +
        '  EXPO_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co\n' +
        '  EXPO_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>'
    );
}

// Adaptador SecureStore compatible con la interfaz de Supabase storage
const SecureStoreAdapter = {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
