-- =============================================================================
-- Fase 4: Añadir category_key a custom_pictograms
-- Proyecto: ComuniTEA
-- Fecha: 2026-03-03
--
-- La columna `category_key` almacena el ID de vocabulario de la categoría
-- estándar (ej: 'comida', 'baño') en lugar de un UUID, permitiendo asociar
-- pictogramas personalizados con las categorías fijas de la app.
-- =============================================================================

ALTER TABLE public.custom_pictograms
    ADD COLUMN IF NOT EXISTS category_key text;

-- Índice para consultas por usuario + categoría (carga de la grilla)
CREATE INDEX IF NOT EXISTS custom_pictograms_user_category_key_idx
    ON public.custom_pictograms (user_id, category_key);
