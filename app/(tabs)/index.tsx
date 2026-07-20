import { Redirect } from 'expo-router';
import { hrefCategorias } from '../../types/routes';

/** Expo Router no resuelve `/(tabs)` sin hijo; las tabs usan `initialRouteName="categorias"`. */
export default function TabsIndex() {
    return <Redirect href={hrefCategorias()} />;
}
