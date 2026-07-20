import { Stack } from 'expo-router';
import { G2_BG } from '../../../../../constants/ejerciciosGrupo2';

export default function NivelG2Layout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: G2_BG },
            }}
        />
    );
}
