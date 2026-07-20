-- Temporizador parental: límite de uso diario por usuario.
-- used_seconds_today se reinicia cuando date_today es distinto al día actual.

CREATE TABLE IF NOT EXISTS public.parental_settings (
    user_id     uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    daily_limit_minutes int NOT NULL DEFAULT 30,
    used_seconds_today  int NOT NULL DEFAULT 0,
    date_today          date NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'UTC')
);

ALTER TABLE public.parental_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden leer y actualizar su configuración parental" ON public.parental_settings;
CREATE POLICY "Usuarios pueden leer y actualizar su configuración parental"
    ON public.parental_settings FOR ALL
    USING ( auth.uid() = user_id );
