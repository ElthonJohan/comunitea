/**
 * Tokens del tablero y pantallas hijas alineados con DESIGN.md (The Tactile Sanctuary).
 * Derivados de la paleta activa — usar `useTableroTheme()` en componentes.
 */
import type { AppColorPalette } from './Colors';

/** Borde accesible ~15% on-surface (ghost) */
export const ghostOutline = {
    borderWidth: 1,
    borderColor: 'rgba(29, 28, 18, 0.15)',
} as const;

/** ID sintético del picto “yo / niño activo” en la barra de frase */
export const TABLERO_CHILD_PICTO_ID = '__tablero_child_active__';

export function buildTableroTheme(colors: AppColorPalette) {
    return {
        /** Fondo crema del tablero principal */
        tableroCanvas: '#F5F2EA',
        screen: colors.surface,
        surfaceNest: colors.surfaceContainerLow,
        surfaceCard: colors.surfaceContainerLowest,
        surfaceElevated: colors.surfaceContainerHigh,
        surfaceHighest: colors.surfaceContainerHighest,

        primary: colors.primary,
        primaryDark: colors.primaryDark,
        primaryContainer: colors.primaryContainer,
        primaryLight: colors.primaryLight,
        onPrimary: colors.onPrimary,
        tertiary: colors.tertiary,

        textPrimary: colors.text.primary,
        textSecondary: colors.text.secondary,
        textMuted: colors.text.disabled,

        headerBg: colors.header.background,
        headerText: colors.header.text,
        xpTrackBg: 'rgba(255,255,255,0.28)',
        xpFill: colors.header.badge,

        tabBarBg: colors.surfaceContainerLowest,
        tabBarActive: colors.primary,
        tabInactive: colors.text.disabled,

        /** FraseBar (rediseño slots semánticos) */
        fraseBarBg: '#FFFFFF',
        fraseBarBorder: 'rgba(61, 90, 62, 0.12)',
        fraseBarSeparator: 'rgba(0, 0, 0, 0.08)',
        slotPersonaBorderEmpty: 'rgba(123, 94, 167, 0.35)',
        slotPersonaBorderFull: '#9B7DD4',
        slotPersonaBgEmpty: 'rgba(123, 94, 167, 0.05)',
        slotPersonaBgFull: '#F3EFFE',
        slotPersonaMicroLabel: '#9B7DD4',
        slotPeticionBorderEmpty: 'rgba(61, 90, 62, 0.3)',
        slotPeticionBorderFull: '#6BAE7C',
        slotPeticionBgEmpty: 'rgba(61, 90, 62, 0.04)',
        slotPeticionBgFull: '#EDF4ED',
        slotPeticionMicroLabel: '#3D7A5A',
        slotObjetoBorderEmpty: 'rgba(0, 0, 0, 0.15)',
        slotObjetoBorderFull: '#E0A85A',
        slotObjetoBgFull: '#FFF8ED',
        fraseClearBg: '#FEE8E8',
        fraseClearFg: '#C0392B',
        fraseSpeakBg: colors.primaryDark,
        fraseSpeakFg: '#FFFFFF',
        /** Legacy FraseBar / CatButton gradient (overlay, ejercicios) */
        fraseRowBg: colors.surfaceContainerLow,
        fraseRowCompleteBg: colors.primaryLight,
        frasePillFrom: colors.primary,
        frasePillTo: colors.primaryContainer,
        slotEmptyBorder: 'rgba(80, 96, 116, 0.45)',
        slotFillBg: colors.surfaceContainerLowest,
        slotActiveBg: colors.primaryLight,
        fraseSpeakFrom: colors.primary,
        fraseSpeakTo: colors.primaryContainer,

        /** Personas + peticiones — card unificada */
        personasCardBg: '#FFFFFF',
        personasCardBorder: 'rgba(0, 0, 0, 0.07)',
        personasRowLabel: '#7B5EA7',
        peticionesRowLabel: '#3D7A5A',
        personasCardDivider: 'rgba(0, 0, 0, 0.06)',
        personaChipBg: '#F3EFFE',
        personaChipBorder: 'rgba(123, 94, 167, 0.15)',
        personaChipLabel: '#7B5EA7',
        peticionChipBg: '#EDF4ED',
        peticionChipBorder: 'rgba(61, 90, 62, 0.15)',
        peticionChipLabel: '#3D7A5A',
        personasPlusColor: '#CCCCCC',
        sectionNestBg: colors.surfaceContainerLow,
        chipBg: colors.surfaceContainerLowest,
        chipLabel: colors.text.primary,
        plusDash: colors.tertiary,

        /** Subcategorías */
        subcatTitle: colors.primaryDark,
        subcatHeaderRule: 'rgba(61, 90, 62, 0.1)',
        subcatPlus: colors.primaryContainer,
        pictoBg: '#FFFFFF',
        pictoBorder: 'rgba(0, 0, 0, 0.08)',
        pictoLabel: '#555555',
        pictoActiveBg: '#FFF8ED',
        pictoActiveBorder: '#E0A85A',

        /** CatButton tablero principal */
        catButtonSolid: colors.primaryDark,
        catButtonOnSolid: colors.onPrimary,

        /** Overlay categorías */
        overlayBg: colors.surfaceContainerLowest,
        overlayHeaderBg: colors.surfaceContainerLow,
        overlayRow: colors.surfaceContainerLow,
        overlayRowActive: colors.primaryLight,
        overlayTitle: colors.text.primary,
        overlayMeta: colors.text.secondary,
        overlayArrow: colors.tertiary,
        overlayNewBg: 'rgba(253, 197, 181, 0.35)',

        /** Ejercicios / perfil */
        ejercicioCardBg: colors.surfaceContainerLow,
        ejercicioAccent: colors.primary,
        ejercicioMeta: colors.text.secondary,
        ejercicioAccentStrip: colors.primaryContainer,

        perfilCardBg: colors.surfaceContainerLow,
        perfilAvatarBg: colors.primaryContainer,
        perfilAvatarText: colors.primaryDark,
        perfilXpTrack: colors.surfaceContainerHigh,
        perfilXpFill: colors.primary,
        statCardBg: colors.surfaceContainerLowest,

        /** Logros */
        logroOnBg: 'rgba(201, 162, 39, 0.2)',
        logroOnBorder: colors.warning,
        logroOffBg: colors.surfaceContainerHigh,
        logroOffBorder: 'rgba(29, 28, 18, 0.12)',
    } as const;
}

export type TableroThemeTokens = ReturnType<typeof buildTableroTheme>;

export const TABLERO_LAYOUT = {
    headerHeight: 72,
    catButtonHeight: 48,
} as const;
