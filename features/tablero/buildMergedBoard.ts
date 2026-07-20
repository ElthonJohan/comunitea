import { TABLERO_CHILD_PICTO_ID } from '../../constants/TableroTheme';
import { ALL_SUBCATS, PERSONAS_ROW, pic, type Pictograma, type Subcategoria } from './data/tablero';
import { labelEmojiForPreferredActivity } from './data/preferredActivitiesCatalog';

const CUSTOM_PREFIX = 'custom:';

const DEFAULT_PERSON_EMOJI = '👤';

/** Una línea en `important_people`: `emoji|Nombre` (ej. `👩|Mamá`). */
export function formatImportantPersonLine(emoji: string, name: string): string {
    const e = (emoji.trim() || DEFAULT_PERSON_EMOJI).slice(0, 16);
    const n = name.trim();
    return `${e}|${n || 'Persona'}`;
}

export function parseImportantPersonLine(raw: string): { emoji: string; name: string } {
    const s = raw.trim();
    const i = s.indexOf('|');
    if (i > 0) {
        return {
            emoji: s.slice(0, i).trim() || DEFAULT_PERSON_EMOJI,
            name: s.slice(i + 1).trim() || 'Persona',
        };
    }
    return { emoji: DEFAULT_PERSON_EMOJI, name: s || 'Persona' };
}

/** Valores por defecto para sembrar la lista cuando el usuario agrega la primera persona desde el tablero. */
export function seedImportantPeopleFromPersonasRow(): string[] {
    return PERSONAS_ROW.map((p) => `${p.emoji}|${p.label}`);
}

function buildLeGustaSubcategoria(preferred: string[] | null | undefined): Subcategoria | null {
    const list = preferred?.filter(Boolean) ?? [];
    if (list.length === 0) return null;
    const pictogramas: Pictograma[] = list.map((raw, i) => {
        const { label, emoji } = labelEmojiForPreferredActivity(raw);
        const idBase = raw.startsWith(CUSTOM_PREFIX)
            ? `gusto-custom-${i}`
            : `gusto-${raw.replace(/[^a-z0-9_-]/gi, '-')}-${i}`;
        return pic(idBase, emoji, label, 'gustos');
    });
    return {
        id: 'le-gusta-personal',
        nombre: 'Le gusta',
        emoji: '❤️',
        categoriaId: 'gustos',
        pictogramas,
    };
}

/** Subcategorías del tablero + fila «Le gusta» si hay preferencias guardadas. */
export function mergeAllSubcats(preferred: string[] | null | undefined): Subcategoria[] {
    const extra = buildLeGustaSubcategoria(preferred);
    if (!extra) return ALL_SUBCATS;
    return [extra, ...ALL_SUBCATS];
}

/** Picto «Yo» / niño activo: primero en Personas y drawer; audio `core-yo`. */
function makeChildPersonaPicto(avatarUrl: string | null | undefined): Pictograma {
    const uri = avatarUrl?.trim();
    return pic(
        TABLERO_CHILD_PICTO_ID,
        '🧑',
        'Yo',
        'personas',
        false,
        'core-yo',
        uri && uri.length > 0 ? uri : undefined,
    );
}

/**
 * Personas del tablero y drawer: siempre el niño primero, luego el resto.
 * Si `important_people` está vacío: niño + `PERSONAS_ROW`.
 * Si hay entradas: niño + solo personalizadas (`emoji|nombre`), sin mocks.
 */
export function mergePersonasRow(
    importantPeople: string[] | null | undefined,
    childAvatarUrl?: string | null,
): Pictograma[] {
    const childPicto = makeChildPersonaPicto(childAvatarUrl ?? null);
    const lines = (importantPeople ?? []).map((n) => n.trim()).filter(Boolean);
    if (lines.length === 0) {
        return [childPicto, ...PERSONAS_ROW];
    }
    const customs = lines.map((line, i) => {
        const { emoji, name } = parseImportantPersonLine(line);
        return pic(`imp-persona-${i}`, emoji, name, 'personas');
    });
    return [childPicto, ...customs];
}
