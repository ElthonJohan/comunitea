import React, { useEffect } from 'react';
import { MapaCamino } from '../grupo3/MapaCamino';
import { G2_BG, MAPA_G2_BIENVENIDA, NIVEL_G2_NOMBRES } from '../../../../constants/ejerciciosGrupo2';
import { speakG2, stopSpeakG2 } from '../../../../lib/speakG2';
import type { NivelBadgeEstado } from '../grupo3/NivelBadge';

type Props = {
    estados: NivelBadgeEstado[];
    estrellas: (0 | 1 | 2 | 3)[];
    onSelectNivel: (nivel: number) => void;
};

export function MapaCaminoG2({ estados, estrellas, onSelectNivel }: Props) {
    useEffect(() => {
        speakG2(MAPA_G2_BIENVENIDA, 500);
        return () => stopSpeakG2();
    }, []);

    return (
        <MapaCamino
            estados={estados}
            estrellas={estrellas}
            onSelectNivel={onSelectNivel}
            levelNames={NIVEL_G2_NOMBRES}
            scrollContentBackgroundColor={G2_BG}
        />
    );
}
