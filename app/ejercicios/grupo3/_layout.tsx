import { Stack } from 'expo-router';

export default function Grupo3Layout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: '#F8F4E3' },
            }}
        />
    );
}
