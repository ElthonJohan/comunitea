-- Phase 6: Report improvements
-- Adds daily breakdown and game progress views for enhanced reporting

-- View: daily usage breakdown (sessions per day)
CREATE OR REPLACE VIEW daily_usage AS
SELECT
    user_id,
    DATE_TRUNC('day', created_at AT TIME ZONE 'UTC') AS day,
    COUNT(*) FILTER (WHERE event_type = 'session_start') AS sessions,
    COUNT(*) FILTER (WHERE event_type = 'sentence_play')  AS sentence_plays,
    COUNT(*) FILTER (WHERE event_type = 'pictogram_tap')  AS pictogram_taps,
    COUNT(*) FILTER (WHERE event_type = 'ai_expand')      AS ai_expands
FROM usage_stats
GROUP BY user_id, day;

-- RLS: users only see their own daily usage via the RLS policies on usage_stats.

-- Function: get daily breakdown for a user in the last N days
CREATE OR REPLACE FUNCTION get_daily_usage(p_days integer DEFAULT 7)
RETURNS TABLE (
    day          date,
    sessions     bigint,
    sentence_plays bigint,
    pictogram_taps bigint,
    ai_expands   bigint
)
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT
        DATE_TRUNC('day', created_at AT TIME ZONE 'UTC')::date AS day,
        COUNT(*) FILTER (WHERE event_type = 'session_start')   AS sessions,
        COUNT(*) FILTER (WHERE event_type = 'sentence_play')   AS sentence_plays,
        COUNT(*) FILTER (WHERE event_type = 'pictogram_tap')   AS pictogram_taps,
        COUNT(*) FILTER (WHERE event_type = 'ai_expand')       AS ai_expands
    FROM usage_stats
    WHERE user_id = auth.uid()
      AND created_at >= NOW() - (p_days || ' days')::interval
    GROUP BY 1
    ORDER BY 1 ASC;
$$;

-- Function: get game sublevel history for a user
CREATE OR REPLACE FUNCTION get_game_history(p_limit integer DEFAULT 10)
RETURNS TABLE (
    completed_at timestamptz,
    sublevel     integer,
    correct      integer,
    total_trials integer,
    pct          numeric
)
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT
        completed_at,
        sublevel,
        correct,
        total_trials,
        ROUND((correct::numeric / NULLIF(total_trials, 0)) * 100, 0) AS pct
    FROM game_sessions
    WHERE user_id = auth.uid()
    ORDER BY completed_at DESC
    LIMIT p_limit;
$$;

-- Grant execution
GRANT EXECUTE ON FUNCTION get_daily_usage(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_game_history(integer)  TO authenticated;
