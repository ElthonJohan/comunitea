import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, Image, type ImageSourcePropType } from 'react-native';
import { Fonts } from '../../constants/Typography';
import { ShadowAmbientLight } from '../../constants/Theme';
import { useTableroTheme } from '../../hooks/useTableroTheme';
import { TAB_ICON_EJERCICIOS, TAB_ICON_PERFIL, TAB_ICON_TABLERO } from '../../constants/tabBarIcons';

function TabPngIcon({
    focused,
    source,
    dotColor,
}: {
    focused: boolean;
    source: ImageSourcePropType;
    dotColor: string;
}) {
    return (
        <View style={styles.iconCol}>
            <Image
                source={source}
                style={[styles.tabIconImg, { opacity: focused ? 1 : 0.4 }]}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
            />
            <View style={styles.dotTrack}>
                {focused ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : <View style={styles.dotSpacer} />}
            </View>
        </View>
    );
}

export default function TabLayout() {
    const T = useTableroTheme();
    return (
        <Tabs
            initialRouteName="categorias"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: T.tabBarActive,
                tabBarInactiveTintColor: T.tabInactive,
                tabBarStyle: {
                    height: 84,
                    paddingBottom: Platform.OS === 'ios' ? 14 : 12,
                    paddingTop: 10,
                    backgroundColor: T.tabBarBg,
                    borderTopWidth: 0,
                    ...ShadowAmbientLight,
                    shadowOffset: { width: 0, height: -4 },
                },
            }}
        >
            <Tabs.Screen name="index" options={{ href: null }} />
            <Tabs.Screen name="categorias" options={{ href: null }} />
            <Tabs.Screen
                name="tablero"
                options={{
                    title: 'Tablero',
                    tabBarLabel: ({ focused, color }) => (
                        <Text
                            style={[
                                styles.label,
                                { color },
                                focused ? styles.labelActive : styles.labelInactive,
                            ]}
                        >
                            Tablero
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <TabPngIcon focused={focused} source={TAB_ICON_TABLERO} dotColor={T.primary} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ejercicios"
                options={{
                    title: 'Ejercicios',
                    tabBarLabel: ({ focused, color }) => (
                        <Text
                            style={[
                                styles.label,
                                { color },
                                focused ? styles.labelActive : styles.labelInactive,
                            ]}
                        >
                            Ejercicios
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <TabPngIcon focused={focused} source={TAB_ICON_EJERCICIOS} dotColor={T.primary} />
                    ),
                }}
            />
            <Tabs.Screen
                name="perfil"
                options={{
                    title: 'Perfil',
                    tabBarLabel: ({ focused, color }) => (
                        <Text
                            style={[
                                styles.label,
                                { color },
                                focused ? styles.labelActive : styles.labelInactive,
                            ]}
                        >
                            Perfil
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <TabPngIcon focused={focused} source={TAB_ICON_PERFIL} dotColor={T.primary} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconCol: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIconImg: {
        width: 44,
        height: 44,
    },
    dotTrack: {
        minHeight: 5,
        marginTop: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
    },
    dotSpacer: {
        width: 5,
        height: 5,
    },
    label: {
        fontSize: 13,
        marginTop: 2,
    },
    labelActive: {
        fontFamily: Fonts.bodyBold,
    },
    labelInactive: {
        fontFamily: Fonts.body,
    },
});
