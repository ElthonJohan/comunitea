import { Platform } from 'react-native';

/** Igual en todas las paletas (baseSurface.onSurface) */
const ON_SURFACE = '#1d1c12';

/** Radios DESIGN.md — “none” prohibido en UI principal */
export const Radii = {
  sm: 8,
  default: 16,
  md: 24,
  lg: 32,
  xl: 48,
  full: 9999,
} as const;

/** Escala de espaciado */
export const Space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

/** Sombra ambiental: tinte on-surface, baja opacidad, blur alto */
export const ShadowAmbient = {
  shadowColor: ON_SURFACE,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: Platform.OS === 'android' ? 0.06 : 0.05,
  shadowRadius: 28,
  elevation: 3,
} as const;

export const ShadowAmbientLight = {
  shadowColor: ON_SURFACE,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.04,
  shadowRadius: 20,
  elevation: 2,
} as const;

/** Borde fantasma ~15% outline-variant */
export const outlineBorder = (width = 1) => ({
  borderWidth: width,
  borderColor: 'rgba(29, 28, 18, 0.15)',
});
