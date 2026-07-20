import { useCallback, useEffect, useMemo, useState } from 'react';
import { useChildProfile } from '../../../context/ChildProfileContext';
import { useAuth } from '../../../context/AuthContext';
import { stopSpeakG2 } from '../../../lib/speakG2';
import { stopSpeakG3 } from '../../../lib/speakG3';
import { speakFrasePhrase, stopSpeakFrasePhrase } from '../../../lib/speakFrasePhrase';
import { useVoice } from '../../../lib/hooks/useVoice';
import { useNetwork } from '../../../context/NetworkContext';
import { useParental } from '../../../lib/hooks/useParental';
import { TABLERO_CHILD_PICTO_ID } from '../../../constants/TableroTheme';
import type { Pictograma } from '../data/tablero';
import { pic } from '../data/tablero';
import { expandTableroSlots } from '../../../lib/expandPhraseForTts';

/** Estado semántico de la barra de frase (tablero). */
export interface FraseState {
    slotPersona: Pictograma;
    slotPeticion: Pictograma | null;
    slotsObjeto: [Pictograma | null, Pictograma | null];
    /** true si hay petición (slot 2) — habilita ▶ en tablero principal */
    fraseLista: boolean;
}

/** Picto del niño en el tablero: en frase y audio se usa «Yo», no el nombre real. */
function makeChildPersonaPicto(avatarUrl: string | null | undefined): Pictograma {
    const uri = avatarUrl?.trim();
    return pic(
        TABLERO_CHILD_PICTO_ID,
        '🧑',
        'Yo',
        'personas',
        false,
        'core-yo',
        uri && uri.length > 0 ? uri : undefined,
    );
}

export function useFrase() {
    const { childProfile, recordSentenceSpoken } = useChildProfile();
    const { profile } = useAuth();
    const { voice } = useVoice();
    const { isConnected } = useNetwork();
    const { settings: parentalSettings } = useParental();
    const ttsSpeed = parentalSettings?.tts_speed ?? 1.0;

    const defaultPersona = useMemo(
        () => makeChildPersonaPicto(childProfile?.avatar_url),
        [childProfile?.avatar_url],
    );

    const [slotPersona, setSlotPersona] = useState<Pictograma>(() => makeChildPersonaPicto(null));
    const [slotPeticion, setSlotPeticion] = useState<Pictograma | null>(null);
    const [slotsObjeto, setSlotsObjeto] = useState<[Pictograma | null, Pictograma | null]>([
        null,
        null,
    ]);

    useEffect(() => {
        setSlotPersona((prev) =>
            prev.id === TABLERO_CHILD_PICTO_ID ? defaultPersona : prev,
        );
    }, [defaultPersona]);

    const slots = useMemo(
        (): (Pictograma | null)[] => [slotPersona, slotPeticion, slotsObjeto[0], slotsObjeto[1]],
        [slotPersona, slotPeticion, slotsObjeto],
    );

    const fraseLista = slotPeticion !== null;
    const puedeHablar = fraseLista;

    const agregarPersona = useCallback((picItem: Pictograma) => {
        setSlotPersona(picItem);
    }, []);

    const agregarPeticion = useCallback((picItem: Pictograma) => {
        setSlotPeticion(picItem);
    }, []);

    const agregarObjeto = useCallback((picItem: Pictograma) => {
        setSlotsObjeto((prev) => {
            if (prev[0] === null) return [picItem, prev[1]];
            if (prev[1] === null) return [prev[0], picItem];
            return [prev[0], picItem];
        });
    }, []);

    /** Enruta por `categoria` del pictograma (tablero principal y ejercicios). */
    const agregarPictograma = useCallback(
        (p: Pictograma) => {
            if (p.categoria === 'personas') {
                agregarPersona(p);
                return;
            }
            if (p.categoria === 'peticiones') {
                agregarPeticion(p);
                return;
            }
            agregarObjeto(p);
        },
        [agregarPersona, agregarPeticion, agregarObjeto],
    );

    const quitarPictograma = useCallback(
        (index: number) => {
            if (index === 0) {
                setSlotPersona(defaultPersona);
                return;
            }
            if (index === 1) {
                setSlotPeticion(null);
                return;
            }
            if (index === 2) {
                setSlotsObjeto((prev) => [null, prev[1]]);
                return;
            }
            if (index === 3) {
                setSlotsObjeto((prev) => [prev[0], null]);
            }
        },
        [defaultPersona],
    );

    const limpiarFrase = useCallback(() => {
        setSlotPeticion(null);
        setSlotsObjeto([null, null]);
        setSlotPersona(defaultPersona);
    }, [defaultPersona]);

    const leerFrase = useCallback(async () => {
        if (!slotPeticion) return;
        const parts: string[] = [
            slotPersona.label,
            slotPeticion.label,
            ...(slotsObjeto[0] ? [slotsObjeto[0].label] : []),
            ...(slotsObjeto[1] ? [slotsObjeto[1].label] : []),
        ];
        const text = parts.join(' ').trim();
        if (!text) return;

        stopSpeakG2();
        stopSpeakG3();
        stopSpeakFrasePhrase();

        const expanded = await expandTableroSlots(parts, profile?.level);
        const toSpeak = expanded ?? text;
        await speakFrasePhrase(toSpeak, { voice, isConnected, ttsSpeed });
        await recordSentenceSpoken();
    }, [voice, isConnected, ttsSpeed, slotPersona, slotPeticion, slotsObjeto, recordSentenceSpoken, profile?.level]);

    return {
        slotPersona,
        slotPeticion,
        slotsObjeto,
        slots,
        fraseLista,
        puedeHablar,
        agregarPersona,
        agregarPeticion,
        agregarObjeto,
        agregarPictograma,
        quitarPictograma,
        limpiarFrase,
        leerFrase,
    };
}
