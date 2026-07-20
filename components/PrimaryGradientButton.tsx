import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../context/AppThemeContext';
import { Radii, ShadowAmbient } from '../constants/Theme';
import { Fonts } from '../constants/Typography';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  fullWidth?: boolean;
};

/** CTA primario: gradiente primary → primary_container, radio xl, escala 0.98 al pulsar */
export default function PrimaryGradientButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
  fullWidth,
}: Props) {
  const c = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.wrap,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
    >
      <LinearGradient
        colors={[c.primary, c.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={c.onPrimary} />
        ) : (
          <Text style={[styles.label, textStyle, { color: c.onPrimary }]}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radii.xl,
    overflow: 'hidden',
    ...ShadowAmbient,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  label: {
    fontSize: 17,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.3,
  },
});
