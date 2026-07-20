/** Catálogo de actividades predefinidas (onboarding + pictos «Le gusta»). */
export const PREFERRED_ACTIVITIES: { id: string; label: string; emoji: string }[] = [
    { id: 'musica',       label: 'Música',        emoji: '🎵' },
    { id: 'pintura',      label: 'Pintura',       emoji: '🎨' },
    { id: 'juguetes',     label: 'Juguetes',      emoji: '🧸' },
    { id: 'peliculas',    label: 'Películas',     emoji: '📺' },
    { id: 'lectura',      label: 'Lectura',       emoji: '📚' },
    { id: 'deporte',      label: 'Deporte',       emoji: '⚽' },
    { id: 'cocina',       label: 'Cocinar',       emoji: '🍳' },
    { id: 'naturaleza',   label: 'Naturaleza',    emoji: '🌿' },
    { id: 'animales',     label: 'Animales',      emoji: '🐾' },
    { id: 'agua',         label: 'Agua / Playas', emoji: '🌊' },
    { id: 'tecnologia',   label: 'Tecnología',    emoji: '💻' },
    { id: 'manualidades', label: 'Manualidades',  emoji: '✂️' },
];

const byId = new Map(PREFERRED_ACTIVITIES.map((a) => [a.id, a]));

export function labelEmojiForPreferredActivity(raw: string): { label: string; emoji: string } {
    if (raw.startsWith('custom:')) {
        return { label: raw.slice('custom:'.length).trim() || 'Actividad', emoji: '✨' };
    }
    const preset = byId.get(raw);
    if (preset) return { label: preset.label, emoji: preset.emoji };
    return { label: raw, emoji: '⭐' };
}
