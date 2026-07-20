-- =============================================================================
-- Fase 1: Tablas tasks, usage_stats y columna level en profiles
-- Proyecto: ComuniTEA
-- Fecha: 2026-03-03
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Columna `level` en profiles
--    Permite guardar el nivel de vocabulario activo del usuario.
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'BASICO'
    CHECK (level IN ('BASICO', 'INTERMEDIO', 'AVANZADO'));

-- Actualizar la función trigger para incluir `level` al crear el perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, level)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url',
    'BASICO'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -----------------------------------------------------------------------------
-- 2. Tabla `tasks` — Rutinas del usuario
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    label       text NOT NULL,
    emoji       text NOT NULL DEFAULT '📝',
    duration    integer,           -- duración en minutos (nullable)
    completed   boolean NOT NULL DEFAULT false,
    position    integer NOT NULL DEFAULT 0,  -- orden para ordenamiento futuro
    created_at  timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
    updated_at  timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- Índice para consultas por usuario ordenadas por posición
CREATE INDEX IF NOT EXISTS tasks_user_position_idx
    ON public.tasks (user_id, position);

-- RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Los usuarios gestionan sus propias tareas." ON public.tasks;
CREATE POLICY "Los usuarios gestionan sus propias tareas."
    ON public.tasks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_set_updated_at ON public.tasks;
CREATE TRIGGER tasks_set_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- 3. Tabla `usage_stats` — Eventos de uso para estadísticas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_stats (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_type  text NOT NULL
        CHECK (event_type IN ('pictogram_tap', 'sentence_play', 'free_text', 'session_start')),
    event_data  jsonb,             -- metadata flexible (pictogram_id, text, duration, etc.)
    created_at  timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- Índice compuesto para queries de estadísticas (por usuario, tipo y fecha)
CREATE INDEX IF NOT EXISTS usage_stats_user_type_date_idx
    ON public.usage_stats (user_id, event_type, created_at DESC);

-- RLS
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Los usuarios gestionan sus propias estadísticas." ON public.usage_stats;
CREATE POLICY "Los usuarios gestionan sus propias estadísticas."
    ON public.usage_stats FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
