-- Fase 3: Configuración sensorial + log de auditoría del panel parental.

-- 1. Nuevas columnas en parental_settings
ALTER TABLE public.parental_settings
    ADD COLUMN IF NOT EXISTS tts_speed          numeric(3,1) NOT NULL DEFAULT 1.0
                                                    CHECK (tts_speed BETWEEN 0.5 AND 2.0),
    ADD COLUMN IF NOT EXISTS animation_intensity text        NOT NULL DEFAULT 'normal'
                                                    CHECK (animation_intensity IN ('none', 'soft', 'normal')),
    ADD COLUMN IF NOT EXISTS game_mode_enabled   boolean     NOT NULL DEFAULT false;

-- 2. Tabla de auditoría de cambios de configuración parental
CREATE TABLE IF NOT EXISTS public.config_audit_log (
    id          bigserial   PRIMARY KEY,
    user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    changed_at  timestamptz NOT NULL DEFAULT now(),
    field_name  text        NOT NULL,
    old_value   text,
    new_value   text
);

ALTER TABLE public.config_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios leen y escriben su propio audit log" ON public.config_audit_log;
CREATE POLICY "Usuarios leen y escriben su propio audit log"
    ON public.config_audit_log FOR ALL
    USING  ( auth.uid() = user_id )
    WITH CHECK ( auth.uid() = user_id );

-- Índice para consultas por usuario y fecha (usadas en reportes futuros)
CREATE INDEX IF NOT EXISTS config_audit_log_user_date_idx
    ON public.config_audit_log (user_id, changed_at DESC);
