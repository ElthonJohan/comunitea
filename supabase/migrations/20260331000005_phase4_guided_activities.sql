-- Fase 4: Actividades guiadas
-- Tabla principal de actividades creadas por el adulto

CREATE TABLE IF NOT EXISTS guided_activities (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    type        TEXT        NOT NULL CHECK (type IN ('rutina_visual', 'practica_vocabulario', 'pregunta')),
    steps       JSONB       NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guided_activities_user_idx ON guided_activities(user_id);
CREATE INDEX IF NOT EXISTS guided_activities_created_idx ON guided_activities(user_id, created_at DESC);

ALTER TABLE guided_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_guided_activities" ON guided_activities;
CREATE POLICY "users_own_guided_activities"
    ON guided_activities
    USING  (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Registro de sesiones de actividad para reportes (RF-07.1, RF-07.3)

CREATE TABLE IF NOT EXISTS activity_sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_id     UUID        NOT NULL REFERENCES guided_activities(id) ON DELETE CASCADE,
    steps_total     INT         NOT NULL,
    steps_completed INT         NOT NULL,
    completed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_sessions_user_idx     ON activity_sessions(user_id);
CREATE INDEX IF NOT EXISTS activity_sessions_activity_idx ON activity_sessions(activity_id);
CREATE INDEX IF NOT EXISTS activity_sessions_date_idx     ON activity_sessions(user_id, completed_at DESC);

ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_activity_sessions" ON activity_sessions;
CREATE POLICY "users_own_activity_sessions"
    ON activity_sessions
    USING  (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
