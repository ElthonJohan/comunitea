-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 8: AI Engine — schema extensions
-- ─────────────────────────────────────────────────────────────────────────────

-- 8.1  Extend usage_stats with richer metadata for AI analysis
ALTER TABLE usage_stats
    ADD COLUMN IF NOT EXISTS sentence_length    int,
    ADD COLUMN IF NOT EXISTS category_id        text,
    ADD COLUMN IF NOT EXISTS response_latency_ms int;

CREATE INDEX IF NOT EXISTS usage_stats_category
    ON usage_stats (user_id, category_id, event_type, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8.2  AI insights table
--      Stores client-generated and edge-function-generated insights.
--      Auto-expire after 30 days. One unseen insight per type per day to avoid spam.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_insights (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type text        NOT NULL CHECK (insight_type IN (
                                 'unused_category',
                                 'sentence_length_trend',
                                 'sublevel_ready',
                                 'vocabulary_suggestion',
                                 'general'
                             )),
    payload      jsonb       NOT NULL DEFAULT '{}',
    seen         boolean     NOT NULL DEFAULT false,
    created_at   timestamptz NOT NULL DEFAULT now(),
    expires_at   timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_insights_own" ON ai_insights;
CREATE POLICY "ai_insights_own" ON ai_insights
    FOR ALL USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS ai_insights_user_active
    ON ai_insights (user_id, seen, expires_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8.3  Helper: upsert an insight (deduped per type per calendar day)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION upsert_ai_insight(
    p_user_id   uuid,
    p_type      text,
    p_payload   jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM ai_insights
        WHERE user_id    = p_user_id
          AND insight_type = p_type
          AND seen        = false
          AND created_at >= current_date
    ) THEN
        INSERT INTO ai_insights (user_id, insight_type, payload)
        VALUES (p_user_id, p_type, p_payload);
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_ai_insight TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8.4  Purge expired insights (run daily via pg_cron if available)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION purge_expired_insights() RETURNS void
LANGUAGE sql SECURITY DEFINER AS $$
    DELETE FROM ai_insights WHERE expires_at < now();
$$;

GRANT EXECUTE ON FUNCTION purge_expired_insights TO authenticated;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'purge-expired-insights',
            '0 3 * * *',
            'SELECT purge_expired_insights()'
        );
    END IF;
END;
$$;
