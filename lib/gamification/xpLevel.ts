/** XP necesario para pasar del nivel L al L+1 (segmento actual). */
const XP_PER_LEVEL_BASE = 80;

export function xpRequiredForCurrentLevel(level: number): number {
    return XP_PER_LEVEL_BASE + (level - 1) * 40;
}

/** xp = puntos acumulados dentro del nivel actual (0 .. requerido-1); level >= 1 */
export function xpProgress01(xp: number, level: number): number {
    const need = xpRequiredForCurrentLevel(level);
    if (need <= 0) return 0;
    return Math.max(0, Math.min(1, xp / need));
}

export function addXpAndLevel(
    xp: number,
    level: number,
    delta: number,
): { xp: number; level: number } {
    let x = xp + delta;
    let lv = level;
    while (true) {
        const need = xpRequiredForCurrentLevel(lv);
        if (x < need) break;
        x -= need;
        lv += 1;
    }
    return { xp: x, level: lv };
}
