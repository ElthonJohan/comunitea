import React from 'react';
import { EjercicioBase, type EjercicioSpeakBlock } from '../grupo3/EjercicioBase';
import { G2_BG } from '../../../../constants/ejerciciosGrupo2';
import { speakG2, stopSpeakG2 } from '../../../../lib/speakG2';

const G2_VOICE: EjercicioSpeakBlock = { speak: speakG2, stop: stopSpeakG2 };

type Props = Omit<
    React.ComponentProps<typeof EjercicioBase>,
    'backgroundColor' | 'speakBlock'
>;

export function EjercicioBaseG2(props: Props) {
    return <EjercicioBase {...props} backgroundColor={G2_BG} speakBlock={G2_VOICE} />;
}
