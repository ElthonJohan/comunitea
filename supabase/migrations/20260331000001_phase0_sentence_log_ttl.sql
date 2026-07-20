-- Fase 0 / Tarea 0.4
-- Purga automática de sentence_log: retención de 90 días.
-- Se ejecuta con pg_cron (disponible en Supabase Pro) o manualmente.
-- Si no hay pg_cron, aplicar como trigger programado o tarea serverless.

-- 1. Índice para acelerar el borrado por fecha
CREATE INDEX IF NOT EXISTS idx_sentence_log_created_at
  ON sentence_log (created_at);

-- 2. Función de purga
CREATE OR REPLACE FUNCTION purge_old_sentence_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM sentence_log
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- 3. Programar la purga diaria (requiere pg_cron habilitado en el proyecto)
--    Si no está disponible, comentar este bloque y llamar a la función manualmente.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'purge_sentence_log_daily',
      '0 3 * * *',            -- 3 AM UTC cada día
      'SELECT purge_old_sentence_logs();'
    );
  END IF;
END;
$$;
