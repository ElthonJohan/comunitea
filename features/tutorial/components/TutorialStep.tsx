import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
    fadeKey: string;
    backgroundColor: string;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

/**
 * Contenedor de paso con fade 300 ms al cambiar `fadeKey`.
 */
export default function TutorialStep({ fadeKey, backgroundColor, children, style }: Props) {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        opacity.setValue(0);
        Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [fadeKey, opacity]);

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }, style]} edges={['top', 'left', 'right', 'bottom']}>
            <Animated.View style={[styles.inner, { opacity }]}>{children}</Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    inner: {
        flex: 1,
    },
});
