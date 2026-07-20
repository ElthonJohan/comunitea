import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';

// Pantalla de entrada: solo muestra un indicador de carga mientras
// el guard en _layout.tsx determina a dÃ³nde redirigir al usuario.
export default function SplashScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
}
