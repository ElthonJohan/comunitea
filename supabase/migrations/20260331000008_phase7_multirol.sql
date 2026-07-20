-- ============================================================
-- FASE 7 — Multirol y coordinación
-- ============================================================

-- Extensión para gen_random_bytes (disponible en Supabase por defecto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- --------------------------------------------------------
-- 1. child_team — equipo de adultos vinculados a un niño
-- --------------------------------------------------------
CREATE TABLE public.child_team (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id        uuid REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
    invited_by      uuid REFERENCES public.profiles(id)        ON DELETE CASCADE NOT NULL,
    user_id         uuid REFERENCES public.profiles(id)        ON DELETE CASCADE,   -- NULL hasta aceptar
    role            text NOT NULL CHECK (role IN ('padre_madre','terapeuta','psicologo','docente')),
    can_view_reports    boolean NOT NULL DEFAULT true,
    can_edit_vocabulary boolean NOT NULL DEFAULT false,
    invite_token    text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
    invite_email    text,
    status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','revoked')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    accepted_at     timestamptz
);

ALTER TABLE public.child_team ENABLE ROW LEVEL SECURITY;

-- El propietario (quien invita) gestiona todo
DROP POLICY IF EXISTS "child_team_owner_all" ON public.child_team;
CREATE POLICY "child_team_owner_all"
    ON public.child_team FOR ALL
    USING (invited_by = auth.uid());

-- El miembro invitado puede leer su propia fila y actualizarla al aceptar
DROP POLICY IF EXISTS "child_team_member_read" ON public.child_team;
CREATE POLICY "child_team_member_read"
    ON public.child_team FOR SELECT
    USING (user_id = auth.uid());

-- --------------------------------------------------------
-- 2. share_tokens — tokens temporales para compartir reportes  
-- --------------------------------------------------------
CREATE TABLE public.share_tokens (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid REFERENCES public.profiles(id)       ON DELETE CASCADE NOT NULL,
    child_id    uuid REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
    token       text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex'),
    expires_at  timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
    created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.share_tokens ENABLE ROW LEVEL SECURITY;

-- Solo el dueño gestiona sus tokens
DROP POLICY IF EXISTS "share_tokens_owner_all" ON public.share_tokens;
CREATE POLICY "share_tokens_owner_all"
    ON public.share_tokens FOR ALL
    USING (user_id = auth.uid());

-- --------------------------------------------------------
-- 3. Función: aceptar invitación por token
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_team_invite(p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.child_team
    SET
        user_id     = auth.uid(),
        status      = 'active',
        accepted_at = now()
    WHERE
        invite_token = p_token
        AND status   = 'pending'
        AND user_id  IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Código inválido o ya utilizado';
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_team_invite(text) TO authenticated;

-- --------------------------------------------------------
-- 4. RLS ampliado: miembros del equipo ven reportes del dueño
-- --------------------------------------------------------

-- Helper: devuelve true si auth.uid() es miembro activo con permiso de reportes
--         vinculado al propietario p_owner_id a través de algún child_profile
CREATE OR REPLACE FUNCTION public.has_report_access(p_owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM   public.child_team  ct
        JOIN   public.child_profiles cp ON cp.id = ct.child_id
        WHERE  ct.user_id          = auth.uid()
          AND  ct.status           = 'active'
          AND  ct.can_view_reports = true
          AND  cp.user_id          = p_owner_id
    );
$$;

GRANT EXECUTE ON FUNCTION public.has_report_access(uuid) TO authenticated;

-- usage_stats: miembros del equipo pueden leer stats del dueño
DROP POLICY IF EXISTS "usage_stats_team_read" ON public.usage_stats;
CREATE POLICY "usage_stats_team_read"
    ON public.usage_stats FOR SELECT
    USING (
        auth.uid() = user_id
        OR public.has_report_access(user_id)
    );

-- game_sessions: miembros del equipo pueden leer sesiones de juego
DROP POLICY IF EXISTS "game_sessions_team_read" ON public.game_sessions;
CREATE POLICY "game_sessions_team_read"
    ON public.game_sessions FOR SELECT
    USING (
        auth.uid() = user_id
        OR public.has_report_access(user_id)
    );

-- sentence_log: miembros del equipo pueden leer historial de frases
DROP POLICY IF EXISTS "sentence_log_team_read" ON public.sentence_log;
CREATE POLICY "sentence_log_team_read"
    ON public.sentence_log FOR SELECT
    USING (
        auth.uid() = user_id
        OR public.has_report_access(user_id)
    );

-- --------------------------------------------------------
-- 5. Índices
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_child_team_child_id    ON public.child_team(child_id);
CREATE INDEX IF NOT EXISTS idx_child_team_user_id     ON public.child_team(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_child_team_token       ON public.child_team(invite_token);
CREATE INDEX IF NOT EXISTS idx_share_tokens_token     ON public.share_tokens(token);
CREATE INDEX IF NOT EXISTS idx_share_tokens_user_id   ON public.share_tokens(user_id);
