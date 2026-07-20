# Aplicar función de reportes (get_usage_report)

Si al entrar en **Reportes** ves: *"Could not find the function public.get_usage_report(p_days) in the schema cache"*, la función aún no está creada en tu base de datos.

## Opción 1: Supabase Dashboard (recomendado)

1. Entra en [Supabase Dashboard](https://supabase.com/dashboard) y abre tu proyecto.
2. Ve a **SQL Editor** (menú izquierdo).
3. Crea una **New query** y pega el contenido del archivo:
   `supabase/migrations/20260307000002_report_usage_function.sql`
4. Pulsa **Run** (o Ctrl+Enter).

Si prefieres, puedes pegar directamente el siguiente SQL:

```sql
-- Reportes con descripción inteligente
CREATE OR REPLACE FUNCTION public.get_usage_report(p_days integer DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_since timestamptz;
    v_by_type jsonb;
    v_by_hour jsonb;
    v_top_pictograms jsonb;
    v_sessions bigint;
    v_sentences bigint;
    v_taps bigint;
    v_morning bigint;
    v_afternoon bigint;
    v_evening bigint;
    v_turno text;
    v_desc text;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'No autenticado');
    END IF;

    v_since := timezone('utc', now()) - (p_days || ' days')::interval;

    SELECT jsonb_object_agg(event_type, cnt) INTO v_by_type
    FROM (
        SELECT event_type, count(*)::bigint AS cnt
        FROM usage_stats
        WHERE user_id = v_user_id AND created_at >= v_since
        GROUP BY event_type
    ) t;

    SELECT jsonb_object_agg(hour::text, cnt) INTO v_by_hour
    FROM (
        SELECT extract(hour from created_at)::int AS hour, count(*)::bigint AS cnt
        FROM usage_stats
        WHERE user_id = v_user_id AND created_at >= v_since
        GROUP BY extract(hour from created_at)
        ORDER BY 1
    ) t;

    WITH flat AS (
        SELECT unnest(pictogram_ids) AS pid
        FROM sentence_log
        WHERE user_id = v_user_id AND created_at >= v_since
    ),
    counted AS (
        SELECT pid AS id, count(*)::bigint AS count
        FROM flat
        GROUP BY pid
        ORDER BY count DESC
        LIMIT 10
    )
    SELECT jsonb_agg(jsonb_build_object('id', id, 'count', count))
    INTO v_top_pictograms FROM counted;

    v_sessions := coalesce((v_by_type->>'session_start')::bigint, 0);
    v_sentences := coalesce((v_by_type->>'sentence_play')::bigint, 0);
    v_taps := coalesce((v_by_type->>'pictogram_tap')::bigint, 0);

    SELECT
        coalesce(sum(CASE WHEN extract(hour from created_at) >= 6 AND extract(hour from created_at) < 12 THEN 1 ELSE 0 END), 0),
        coalesce(sum(CASE WHEN extract(hour from created_at) >= 12 AND extract(hour from created_at) < 18 THEN 1 ELSE 0 END), 0),
        coalesce(sum(CASE WHEN extract(hour from created_at) >= 18 OR extract(hour from created_at) < 6 THEN 1 ELSE 0 END), 0)
    INTO v_morning, v_afternoon, v_evening
    FROM usage_stats
    WHERE user_id = v_user_id AND created_at >= v_since;

    IF v_morning >= v_afternoon AND v_morning >= v_evening THEN v_turno := 'mañana';
    ELSIF v_afternoon >= v_evening THEN v_turno := 'tarde';
    ELSE v_turno := 'noche';
    END IF;

    v_desc := 'En los últimos ' || p_days || ' días ';
    IF v_sessions = 0 AND v_sentences = 0 THEN
        v_desc := v_desc || 'aún no hay actividad registrada.';
    ELSE
        IF v_sessions > 0 THEN
            v_desc := v_desc || 'hubo ' || v_sessions || ' sesión' || CASE WHEN v_sessions <> 1 THEN 'es' ELSE '' END || '. ';
        END IF;
        IF v_sentences > 0 THEN
            v_desc := v_desc || 'Se reprodujeron ' || v_sentences || ' frase' || CASE WHEN v_sentences <> 1 THEN 's' ELSE '' END || '. ';
        END IF;
        IF v_taps > 0 THEN v_desc := v_desc || 'Se tocaron pictogramas ' || v_taps || ' veces. '; END IF;
        v_desc := v_desc || 'El uso fue más frecuente por la ' || v_turno || '.';
    END IF;

    RETURN jsonb_build_object(
        'description', v_desc,
        'byEventType', coalesce(v_by_type, '{}'::jsonb),
        'byHour', coalesce(v_by_hour, '{}'::jsonb),
        'topPictograms', coalesce(v_top_pictograms, '[]'::jsonb),
        'sessions', v_sessions,
        'sentencePlays', v_sentences,
        'pictogramTaps', v_taps,
        'periodDays', p_days
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_usage_report(integer) TO authenticated;
```

5. Tras ejecutarlo, vuelve a abrir **Reportes** en la app.

## Opción 2: Supabase CLI

Si tienes el proyecto enlazado con `supabase link`:

```bash
npx supabase db push
```

O aplicar solo esta migración (si tu CLI está al día):

```bash
npx supabase migration up
```
