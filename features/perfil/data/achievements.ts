import type { LogroItem } from '../components/LogrosGrid';

export type AchievementCheckCtx = {
    sentencesToday: number;
    streakDays: number;
    level: number;
    /** XP total (niveles anteriores + xp en el nivel actual). */
    totalXpApprox: number;
    correctAttempts: number;
    totalAttempts: number;
    unlocked: Set<string>;
};

export type AchievementDef = {
    id: string;
    emoji: string;
    title: string;
    check: (ctx: AchievementCheckCtx) => boolean;
};

/** Catálogo fijo de logros (orden = orden en la rejilla). */
export const ACHIEVEMENT_CATALOG: AchievementDef[] = [
    {
        id: 'first_sentence',
        emoji: '⭐',
        title: 'Primera frase',
        check: (c) => c.sentencesToday >= 1,
    },
    {
        id: 'streak_3',
        emoji: '🔥',
        title: '3 días seguidos',
        check: (c) => c.streakDays >= 3,
    },
    {
        id: 'level_3',
        emoji: '🏆',
        title: 'Nivel 3',
        check: (c) => c.level >= 3,
    },
    {
        id: 'xp_500',
        emoji: '🌟',
        title: '500 XP',
        check: (c) => c.totalXpApprox >= 500,
    },
    {
        id: 'practice_80',
        emoji: '🎯',
        title: '80% aciertos',
        check: (c) =>
            c.totalAttempts >= 5 && Math.round((100 * c.correctAttempts) / c.totalAttempts) >= 80,
    },
];

export function buildLogrosFromUnlocked(unlockedIds: string[]): LogroItem[] {
    const set = new Set(unlockedIds);
    return ACHIEVEMENT_CATALOG.map((a) => ({
        id: a.id,
        emoji: a.emoji,
        desbloqueado: set.has(a.id),
    }));
}

export function evaluateNewAchievementIds(ctx: {
    sentencesToday: number;
    streakDays: number;
    level: number;
    xp: number;
    correctAttempts: number;
    totalAttempts: number;
    already: string[];
}): string[] {
    const unlocked = new Set(ctx.already);
    let totalXpApprox = ctx.xp;
    for (let lv = 1; lv < ctx.level; lv++) {
        totalXpApprox += 80 + (lv - 1) * 40;
    }
    const base: AchievementCheckCtx = {
        sentencesToday: ctx.sentencesToday,
        streakDays: ctx.streakDays,
        level: ctx.level,
        totalXpApprox,
        correctAttempts: ctx.correctAttempts,
        totalAttempts: ctx.totalAttempts,
        unlocked,
    };
    const next: string[] = [];
    for (const def of ACHIEVEMENT_CATALOG) {
        if (unlocked.has(def.id)) continue;
        if (def.check(base)) next.push(def.id);
    }
    return next;
}
