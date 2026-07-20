/**
 * LabelModal.tsx
 *
 * Modal cross-platform (iOS + Android) para ingresar el nombre
 * de un pictograma personalizado después de haber subido la imagen.
 *
 * Props:
 *  - visible       → controla si el modal se muestra.
 *  - imageUrl      → URL de la imagen ya subida (para previsualización).
 *  - onConfirm(label) → se llama cuando el usuario confirma.
 *  - onCancel      → se llama al cancelar (la imagen ya está en Storage).
 */
import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    StyleSheet, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface LabelModalProps {
    visible: boolean;
    imageUrl: string | null;
    onConfirm: (label: string) => void;
    onCancel: () => void;
}

export default function LabelModal({ visible, imageUrl, onConfirm, onCancel }: LabelModalProps) {
    const [label, setLabel] = useState('');

    useEffect(() => {
        if (visible) setLabel('');
    }, [visible]);

    const handleConfirm = () => {
        const trimmed = label.trim();
        if (!trimmed) return;
        onConfirm(trimmed);
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.card}>
                    <Text style={styles.title}>Nombra tu pictograma</Text>

                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.preview}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={{ fontSize: 56, marginBottom: 16 }}>🖼️</Text>
                    )}

                    <TextInput
                        style={styles.input}
                        placeholder="Ej: Abuelita, Mi perro, Parque..."
                        placeholderTextColor={Colors.text.disabled}
                        value={label}
                        onChangeText={setLabel}
                        autoFocus
                        maxLength={30}
                        onSubmitEditing={handleConfirm}
                        returnKeyType="done"
                    />

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmBtn, !label.trim() && styles.confirmDisabled]}
                            onPress={handleConfirm}
                            disabled={!label.trim()}
                        >
                            <Text style={styles.confirmText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: 28,
        padding: 24,
        alignItems: 'center',
        shadowColor: Colors.onSurface,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 16,
        textAlign: 'center',
    },
    preview: {
        width: 120,
        height: 120,
        borderRadius: 20,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 17,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    confirmDisabled: {
        opacity: 0.4,
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});
