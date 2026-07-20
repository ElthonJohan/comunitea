-- Personas importantes del niño (nombres libres) para pictogramas en el tablero.
ALTER TABLE public.child_profiles
    ADD COLUMN IF NOT EXISTS important_people text[] NOT NULL DEFAULT '{}';
