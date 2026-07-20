-- Progreso y gamificación por perfil del niño (1 fila por child_profile).
CREATE TABLE IF NOT EXISTS public.child_progress (
    id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    child_profile_id     uuid        NOT NULL UNIQUE REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    xp                   integer     NOT NULL DEFAULT 0 CHECK (xp >= 0),
    level                integer     NOT NULL DEFAULT 1 CHECK (level >= 1),
    sentences_today      integer     NOT NULL DEFAULT 0 CHECK (sentences_today >= 0),
    streak_days          integer     NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
    last_active_date     date,
    achievements         text[]      NOT NULL DEFAULT '{}',
    correct_attempts     integer     NOT NULL DEFAULT 0 CHECK (correct_attempts >= 0),
    total_attempts       integer     NOT NULL DEFAULT 0 CHECK (total_attempts >= 0),
    updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS child_progress_child_profile_id_idx ON public.child_progress (child_profile_id);

ALTER TABLE public.child_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Progreso del niño vía perfil del usuario" ON public.child_progress;
CREATE POLICY "Progreso del niño vía perfil del usuario"
    ON public.child_progress FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.child_profiles cp
            WHERE cp.id = child_progress.child_profile_id
              AND cp.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.child_profiles cp
            WHERE cp.id = child_progress.child_profile_id
              AND cp.user_id = auth.uid()
        )
    );
