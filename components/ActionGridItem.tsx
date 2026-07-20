import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated, Image, ImageSourcePropType, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { Radii, ShadowAmbientLight } from '../constants/Theme';

const { width: SCREEN_W } = Dimensions.get('window');
export const CARD_W = Math.floor(SCREEN_W * 0.30);
export const CARD_H = Math.floor(CARD_W * 1.18);

interface ActionGridItemProps {
    label: string;
    onPress: () => void;
    onLongPress?: () => void;
    children?: React.ReactNode;
    backgroundColor?: string;
    /** Color del strip inferior (semántico por categoría) */
    stripColor?: string;
    /** URL de imagen remota (pictograma del usuario desde Supabase) */
    imageUri?: string;
    /** Asset local PNG de assets/pictogramas (via require) */
    localAsset?: ImageSourcePropType;
}

export default function ActionGridItem({ label, onPress, onLongPress, children, backgroundColor, stripColor, imageUri, localAsset }: ActionGridItemProps) {
    const scaleValue = React.useRef(new Animated.Value(1)).current;
    const elevValue = React.useRef(new Animated.Value(4)).current;

    const onPressIn = () => {
        Animated.parallel([
            Animated.spring(scaleValue, { toValue: 0.98, friction: 6, tension: 120, useNativeDriver: true }),
            Animated.timing(elevValue, { toValue: 1, duration: 80, useNativeDriver: false }),
        ]).start();
    };

    const onPressOut = () => {
        Animated.parallel([
            Animated.spring(scaleValue, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
            Animated.timing(elevValue, { toValue: 4, duration: 120, useNativeDriver: false }),
        ]).start();
    };

    // El strip color determina el color del fondo inferior del label
    const resolvedStrip = stripColor || backgroundColor || Colors.primary;

    return (
        // Nodo externo: sólo elevation (useNativeDriver: false)
        // Nodo interno: sólo scale   (useNativeDriver: true)
        // Mezclarlos en un solo nodo dispara el error de driver.
        <Animated.View style={[styles.container, { elevation: elevValue as unknown as number }]}>
            <Animated.View style={{ flex: 1, transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
                onLongPress={onLongPress}
                delayLongPress={600}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={1}
            >
                {/* Zona de imagen/emoji — fondo blanco */}
                <View style={styles.imageZone}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.customImage} resizeMode="contain" />
                    ) : localAsset ? (
                        <Image source={localAsset} style={styles.customImage} resizeMode="contain" accessibilityIgnoresInvertColors />
                    ) : (
                        <View style={styles.emojiWrapper}>
                            {children}
                        </View>
                    )}
                </View>

                {/* Strip inferior — siempre visible, color semántico de categoría */}
                <View style={[styles.labelStrip, { backgroundColor: resolvedStrip }]}>
                    <Text style={styles.label} numberOfLines={1}>{label}</Text>
                </View>
            </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_W,
        height: CARD_H,
        ...ShadowAmbientLight,
        shadowOpacity: 0.06,
        shadowRadius: 24,
    },
    card: {
        flex: 1,
        borderRadius: Radii.md,
        overflow: 'hidden',
        backgroundColor: Colors.surfaceContainerLowest,
        justifyContent: 'space-between',
    },
    imageZone: {
        flex: 1,
        backgroundColor: Colors.surfaceContainerLowest,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    emojiWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    customImage: {
        width: '100%',
        height: '100%',
    },
    labelStrip: {
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    label: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
        textAlign: 'center',
        letterSpacing: 0.2,
    },
});
