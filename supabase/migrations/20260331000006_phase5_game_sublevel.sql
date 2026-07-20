-- Phase 5: Modo juego con sub-niveles PECS
-- game_progress  → sub-nivel actual del niño (insert = cambio, máximo reciente = activo)
-- game_sessions  → histórico de sesiones para criterio de avance y reportes

CREATE TABLE IF NOT EXISTS game_progress (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id     UUID        REFERENCES child_profiles(id) ON DELETE SET NULL,
    sublevel     INT         NOT NULL DEFAULT 1 CHECK (sublevel BETWEEN 1 AND 5),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_sessions (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sublevel      INT         NOT NULL CHECK (sublevel BETWEEN 1 AND 5),
    correct       INT         NOT NULL DEFAULT 0,
    total_trials  INT         NOT NULL DEFAULT 0,
    completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_own_game_progress" ON game_progress;
CREATE POLICY "user_own_game_progress" ON game_progress
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_own_game_sessions" ON game_sessions;
CREATE POLICY "user_own_game_sessions" ON game_sessions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_game_progress_user ON game_progress (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions (user_id, sublevel, completed_at DESC);
