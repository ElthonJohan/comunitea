import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../supabase';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';

export function useImagePicker() {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);

    const pickAndUploadImage = async (useCamera = false): Promise<string | null> => {
        try {
            setUploading(true);

            // 1. Solicitar permisos requeridos
            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permiso denegado', 'Necesitamos permisos de tu cámara.');
                    return null;
                }
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos.');
                    return null;
                }
            }

            // 2. Abrir selector
            const result = useCamera
                ? await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return null;
            }

            const imageUri = result.assets[0].uri;

            if (!user) {
                Alert.alert('Error', 'Debes iniciar sesión para subir imágenes.');
                return null;
            }

            // 3. Preparar el archivo basado en su URI local
            const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
            const filePath = `${user.id}/${new Date().getTime()}.jpg`;

            // 4. Subir a Supabase Storage (Bucket 'pictograms')
            const { data, error } = await supabase.storage
                .from('pictograms')
                .upload(filePath, decode(base64), {
                    contentType: 'image/jpeg',
                });

            if (error) {
                throw error;
            }

            // 5. Retornar URL Pública
            const { data: publicUrlData } = supabase.storage
                .from('pictograms')
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;
        } catch (error: any) {
            Alert.alert('Error al subir', error.message || 'Ocurrió un error inesperado al subir la imagen.');
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { pickAndUploadImage, uploading };
}

// polyfill simple de decodificación base64 a byte array para que Supabase Native lo procese correctamente.
function decode(base64: string): Uint8Array {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }

    let bufferLength = base64.length * 0.75;
    if (base64[base64.length - 1] === '=') bufferLength--;
    if (base64[base64.length - 2] === '=') bufferLength--;

    const arraybuffer = new ArrayBuffer(bufferLength);
    const bytes = new Uint8Array(arraybuffer);

    let p = 0;
    for (let i = 0; i < base64.length; i += 4) {
        let encoded1 = lookup[base64.charCodeAt(i)];
        let encoded2 = lookup[base64.charCodeAt(i + 1)];
        let encoded3 = lookup[base64.charCodeAt(i + 2)];
        let encoded4 = lookup[base64.charCodeAt(i + 3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return bytes;
}
