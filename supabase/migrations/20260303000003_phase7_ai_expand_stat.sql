-- Fase 7: Agregar 'ai_expand' al CHECK de usage_stats
-- Permite registrar el evento cuando el niño usa el botón de Varita Mágica.

ALTER TABLE public.usage_stats
    DROP CONSTRAINT IF EXISTS usage_stats_event_type_check;

ALTER TABLE public.usage_stats
    ADD CONSTRAINT usage_stats_event_type_check
    CHECK (event_type IN (
        'session_start',
        'pictogram_tap',
        'sentence_play',
        'free_text',
        'ai_expand'
    ));
