import { Colors } from '../../../constants/Colors';

/**
 * Colores del tutorial alineados dinámicamente con la paleta de diseño principal
 * de constants/Colors.ts (Sage, Rojo, Azul).
 */
export const TutorialTheme = {
    get baseBg() {
        return Colors.surface; // Linen (#f8f4e3)
    },
    get baseHeader() {
        return (Colors as any).primaryDark || (Colors as any).primary;
    },
    get correctBg() {
        return '#f2f7f4'; // Verde pastel suave alineado con success
    },
    get correctAccent() {
        return Colors.success; // Verde Sage (#5a7a62)
    },
    get correctButton() {
        return Colors.success;
    },
    get incorrectBg() {
        return '#faf0ef'; // Rojo pastel suave alineado con danger
    },
    get incorrectAccent() {
        return Colors.danger; // Rojo Pálido (#b85c52)
    },
    get incorrectButton() {
        return Colors.danger;
    },
    get celebrationBg() {
        return Colors.surface; // Linen (#f8f4e3)
    },
    get celebrationGold() {
        return Colors.warning; // Amarillo/Oro (#c9a227)
    },
    get celebrationAccent() {
        return Colors.warning;
    },
} as const;
