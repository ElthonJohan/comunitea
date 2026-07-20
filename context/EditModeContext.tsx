/**
 * EditModeContext.tsx
 *
 * Control Parental — Modo Edición protegido por PIN de 4 dígitos.
 *
 * Flujo:
 *  - Primera vez: al intentar desbloquear, el padre crea un PIN (setup).
 *  - Futuras veces: se pide el PIN para entrar en modo edición.
 *  - Salir de modo edición: sin PIN (el padre ya está "dentro").
 *  - Cambiar el PIN: llama a `changePinRequest()` desde Configuración.
 *
 * El PIN se guarda en AsyncStorage como texto plano (solo 4 dígitos).
 * Para mayor seguridad futura se puede hashear con `expo-crypto`.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import PinModal from '../components/PinModal';

const PIN_STORAGE_KEY = STORAGE_KEYS.PARENTAL_PIN;

interface EditModeContextProps {
    isEditMode: boolean;
    hasPin: boolean;
    /** Solicita entrar al modo edición. Muestra el modal de PIN. */
    requestUnlock: () => void;
    /** Entra al modo edición directamente sin pedir PIN (usar solo cuando ya se verificó identidad). */
    enterEditMode: () => void;
    /** Cierra el modo edición sin pedir PIN. */
    lockEditMode: () => void;
    /** Abre el modal para cambiar el PIN (necesita el actual) */
    changePinRequest: () => void;
}

const EditModeContext = createContext<EditModeContextProps>({
    isEditMode: false,
    hasPin: false,
    requestUnlock: () => {},
    enterEditMode: () => {},
    lockEditMode: () => {},
    changePinRequest: () => {},
});

type ModalMode = 'setup' | 'verify' | 'change_old' | 'change_new' | null;

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [storedPin, setStoredPin] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>(null);

    // Carga el PIN guardado al iniciar
    useEffect(() => {
        AsyncStorage.getItem(PIN_STORAGE_KEY).then(pin => setStoredPin(pin));
    }, []);

    const hasPin = storedPin !== null;

    // ── API pública ──────────────────────────────────────────────────────────

    const requestUnlock = () => {
        if (isEditMode) {
            lockEditMode();
            return;
        }
        // Sin PIN guardado → modo setup (crear por primera vez)
        setModalMode(storedPin === null ? 'setup' : 'verify');
    };

    const enterEditMode = () => setIsEditMode(true);

    const lockEditMode = () => setIsEditMode(false);

    const changePinRequest = () => {
        if (!hasPin) {
            setModalMode('setup');
        } else {
            setModalMode('change_old');
        }
    };

    // ── Handlers del modal ───────────────────────────────────────────────────

    const handlePinSuccess = async (pin: string) => {
        if (modalMode === 'setup' || modalMode === 'change_new') {
            // Guardar nuevo PIN
            await AsyncStorage.setItem(PIN_STORAGE_KEY, pin);
            setStoredPin(pin);
            setModalMode(null);
            setIsEditMode(true);

        } else if (modalMode === 'verify') {
            if (pin === storedPin) {
                setModalMode(null);
                setIsEditMode(true);
            } else {
                // El modal mismo maneja shake; aquí sólo cerramos para re-abrir
                // En realidad PinModal no notifica error desde afuera — la lógica
                // de comparación la maneja el propio contexto. Necesitamos devolver
                // un "failure" al modal. Por simplicidad: cerramos y notificamos via
                // un segundo onSuccess con pin vacío como señal.
                // ↑ La lógica real: en 'verify' el modal emite onSuccess SIEMPRE.
                // Verificamos el PIN aquí:
                setModalMode(null);
                // Re-abrimos con error en el próx tick
                setTimeout(() => setModalMode('verify'), 100);
            }

        } else if (modalMode === 'change_old') {
            if (pin === storedPin) {
                setModalMode('change_new');
            } else {
                setModalMode(null);
                setTimeout(() => setModalMode('change_old'), 100);
            }
        }
    };

    const handlePinCancel = () => setModalMode(null);

    // ── Textos según estado ─────────────────────────────────────────────────
    const modalTitle: Record<Exclude<ModalMode, null>, string> = {
        setup:      'Crear PIN Parental 🔐',
        verify:     'Zona de Padres 🔐',
        change_old: 'Ingresa el PIN actual',
        change_new: 'Nuevo PIN Parental',
    };

    const modalSubtitle: Record<Exclude<ModalMode, null>, string> = {
        setup:      'Elige un PIN de 4 dígitos para proteger la edición',
        verify:     'Ingresa tu PIN para acceder al modo edición',
        change_old: 'Verifica que eres el padre/tutor',
        change_new: 'Elige tu nuevo PIN de 4 dígitos',
    };

    return (
        <EditModeContext.Provider value={{ isEditMode, hasPin, requestUnlock, enterEditMode, lockEditMode, changePinRequest }}>
            {children}
            {modalMode !== null && (
                <PinModal
                    visible={true}
                    mode={modalMode === 'setup' || modalMode === 'change_new' ? 'setup' : 'verify'}
                    title={modalTitle[modalMode]}
                    subtitle={modalSubtitle[modalMode]}
                    onSuccess={handlePinSuccess}
                    onCancel={handlePinCancel}
                />
            )}
        </EditModeContext.Provider>
    );
};

export const useEditMode = () => useContext(EditModeContext);

