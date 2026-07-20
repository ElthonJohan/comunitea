-- Fase 8: tabla sentence_log para el predictor personalizado de Fase 4.
-- Almacena cada frase construida (array de pictogram_ids) para aprender
-- las co-ocurrencias reales de cada niño.

CREATE TABLE IF NOT EXISTS public.sentence_log (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    pictogram_ids text[] NOT NULL,
    created_at  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sentence_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Los usuarios pueden gestionar su historial de frases." ON public.sentence_log;
CREATE POLICY "Los usuarios pueden gestionar su historial de frases."
    ON public.sentence_log FOR ALL
    USING ( auth.uid() = user_id );

-- Índice para consultas frecuentes por usuario ordenadas por fecha
CREATE INDEX IF NOT EXISTS sentence_log_user_created_idx
    ON public.sentence_log (user_id, created_at DESC);
