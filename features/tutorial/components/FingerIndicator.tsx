import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, ViewStyle } from 'react-native';
import { TUTORIAL_POINTING_HAND_PNG } from '../../../constants/tutorialHandAsset';

const AnimatedImage = Animated.createAnimatedComponent(Image);

type Props = {
    style?: ViewStyle;
};

/** Indicador táctil: pulso de opacidad + escala. */
export default function FingerIndicator({ style }: Props) {
    const pulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [pulse]);

    const opacity = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.55, 1],
    });
    const scale = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.92, 1.08],
    });

    return (
        <Animated.View style={[styles.wrap, style, { opacity, transform: [{ scale }] }]}>
            <AnimatedImage source={TUTORIAL_POINTING_HAND_PNG} style={styles.handImg} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: 'absolute',
        zIndex: 20,
        pointerEvents: 'none',
    },
    handImg: {
        width: 48,
        height: 48,
        resizeMode: 'contain',
    },
});
