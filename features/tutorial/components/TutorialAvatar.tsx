import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { useChildProfile } from '../../../context/ChildProfileContext';

type Mood = 'neutral' | 'happy' | 'sad';

type Props = {
    mood?: Mood;
};

export default function TutorialAvatar({ mood = 'neutral' }: Props) {
    const { childProfile } = useChildProfile();
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(scale, {
                    toValue: 1.05,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [scale]);

    const avatarUrl = childProfile?.avatar_url;

    return (
        <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
            {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.img} />
            ) : (
                <View style={[styles.placeholder, mood === 'happy' && styles.phHappy, mood === 'sad' && styles.phSad]}>
                    <Text style={styles.emoji}>
                        {mood === 'happy' ? '😊' : mood === 'sad' ? '😕' : '🙂'}
                    </Text>
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignSelf: 'center',
        marginBottom: 8,
    },
    img: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    placeholder: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: 'rgba(255,255,255,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    phHappy: {
        backgroundColor: 'rgba(200, 255, 200, 0.5)',
    },
    phSad: {
        backgroundColor: 'rgba(255, 220, 200, 0.55)',
    },
    emoji: {
        fontSize: 44,
    },
});
