-- Fase 1: Perfil del niño/a y rol del adulto.
-- child_profiles guarda el contexto clínico-funcional capturado en el onboarding.
-- Se agrega la columna `role` a la tabla profiles existente para identificar el rol del adulto.

-- 1. Rol del adulto en la tabla de perfiles existente
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS role text
    CHECK (role IN ('padre_madre', 'terapeuta', 'psicologo', 'docente'));

-- 2. Tabla de perfil del niño/a
CREATE TABLE IF NOT EXISTS public.child_profiles (
    id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Datos básicos
    name                 text        NOT NULL,
    birth_date           date,
    gender               text        CHECK (gender IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
    avatar_url           text,

    -- Perfil clínico y comunicativo
    diagnosis            text        CHECK (diagnosis IN ('dsm5_nivel1', 'dsm5_nivel2', 'dsm5_nivel3', 'sin_diagnostico')),
    communication_level  text        NOT NULL
                                     CHECK (communication_level IN ('sin_lenguaje', 'palabras_aisladas', 'frases_simples', 'frases_complejas'))
                                     DEFAULT 'sin_lenguaje',

    -- Contexto de uso
    environments         text[]      NOT NULL DEFAULT '{}',
    preferred_activities text[]      NOT NULL DEFAULT '{}',

    -- Configuración sensorial
    sound_sensitive      boolean     NOT NULL DEFAULT false,

    -- Estado del onboarding
    onboarding_completed boolean     NOT NULL DEFAULT false,

    created_at           timestamptz NOT NULL DEFAULT now()
);

-- Índice para buscar por usuario
CREATE INDEX IF NOT EXISTS child_profiles_user_id_idx ON public.child_profiles (user_id);

-- Row Level Security
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios acceden solo a los perfiles de sus niños" ON public.child_profiles;
CREATE POLICY "Usuarios acceden solo a los perfiles de sus niños"
    ON public.child_profiles FOR ALL
    USING (auth.uid() = user_id);
