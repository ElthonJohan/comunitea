/**
 * Tokens del design system "The Tactile Sanctuary" (DESIGN.md).
 * Jerarquía de superficies sin líneas duras: capas crema / papel orgánico + elevaciones blandas.
 */

export type ThemeColor = 'sage' | 'rojo' | 'azul';

const baseSurface = {
  /** Base de pantalla (Linen) */
  surface: '#f8f4e3',
  surfaceContainerLow: '#f48383ff',
  surfaceContainerLowest: '#ffffff',
  /** Hover / feedback suave en listas y tarjetas */
  surfaceContainerHigh: '#ebe8da',
  surfaceContainerHighest: '#e6e3d2',
  surfaceContainerButtons: 'rgba(182, 182, 182, 1)',


  /** Alias retrocompat: fondo de pantalla = surface base */
  background: '#f8f4e3',
  /** Superficie intermedia (antes surface2) */
  surface2: '#f2eedc',

  onSurface: '#1d1c12',
  tertiary: '#506074',
  secondaryContainer: '#fdc5b5',
  outlineVariant: '#1d1c12',
  border: 'rgba(29, 28, 18, 0.12)',
  danger: '#b85c52',
  success: '#5a7a62',
  warning: '#c9a227',
  white: '#ffffff',

  text: {
    primary: '#1d1c12',
    secondary: '#4a473c',
    disabled: '#9a9688',
    inverse: '#ffffff',
    logo: {
      orange: '#c45c3a',
      red: '#b85c52',
      green: '#5a7a62',
      blue: '#486456',
    },
    titleCyan: '#37475a', // Actualizado a azul pizarra para títulos
  },

  category: {
    acciones: '#c17f3a',
    comida: '#c45c3a',
    emociones: '#c9a227',
    personas: '#b85c7a',
    lugares: '#3d8a7a',
    objetos: '#506074',
    yo: '#a4c3b2',
    bano: '#4a8fab',
    dormir: '#6b5a8a',
    jugar: '#5a7a62',
    ropa: '#8a5a8f',
    quiero: '#c45c3a',
    'no-quiero': '#b85c52',
    default: '#6b6f72',
  }
};

export const Palettes = {
  sage: {
    ...baseSurface,
    primary: '#a4c3b2',
    primaryDark: '#83a391',
    primaryLight: '#d2e1d9',
    primaryContainer: '#cce0d5',
    onPrimary: '#1d1c12',
    borderFocus: '#a4c3b2',
    primaryButton: '#a4c3b2',
    accent: '#eab4a4', // Rojo pálido como acento
    header: {
      background: '#a4c3b2',
      text: '#1d1c12',
      badge: '#ffffff',
    }
  },
  rojo: {
    ...baseSurface,
    primary: '#eab4a4',
    primaryDark: '#c99383',
    primaryLight: '#f5dad3',
    primaryContainer: '#f0c8bc',
    onPrimary: '#1d1c12',
    borderFocus: '#eab4a4',
    primaryButton: '#eab4a4',
    accent: '#a4c3b2', // Verde sage como acento
    header: {
      background: '#eab4a4',
      text: '#1d1c12',
      badge: '#ffffff',
    }
  },
  azul: {
    ...baseSurface,
    primary: '#37475a',
    primaryDark: '#232e3b',
    primaryLight: '#5c6b7d',
    primaryContainer: '#4a5c70',
    onPrimary: '#ffffff',
    borderFocus: '#37475a',
    primaryButton: '#37475a',
    accent: '#eab4a4', // Rojo pálido como acento
    header: {
      background: '#37475a',
      text: '#ffffff',
      badge: '#a4c3b2',
    }
  }
} as const;

/** Paleta completa (superficies + primario dinámico) — unión de las 3 variantes */
export type AppColorPalette = (typeof Palettes)[ThemeColor];

/** Color por id de categoría/pictograma (requiere la paleta activa) */
/** Objeto mutable sincronizado con la paleta activa (ver `syncStaticColors`) */
export const Colors = {
  ...Palettes.sage,
  text: { ...Palettes.sage.text, logo: { ...Palettes.sage.text.logo } },
  header: { ...Palettes.sage.header },
  category: { ...Palettes.sage.category },
} as unknown as AppColorPalette;

export function syncStaticColors(theme: ThemeColor) {
  const s = Palettes[theme];
  (Object.keys(s) as (keyof AppColorPalette)[]).forEach((k) => {
    if (k === 'text' || k === 'header' || k === 'category') return;
    (Colors as Record<string, unknown>)[k as string] = s[k] as unknown;
  });
  Object.assign(Colors.text.logo, s.text.logo);
  Object.assign(Colors.text, { ...s.text, logo: Colors.text.logo });
  Object.assign(Colors.header, s.header);
  Object.assign(Colors.category, s.category);
}

export function getCategoryColor(categoryId: string, palette: AppColorPalette = Colors): string {
  const key = categoryId as keyof typeof palette.category;
  return palette.category[key] ?? palette.category.default;
}
