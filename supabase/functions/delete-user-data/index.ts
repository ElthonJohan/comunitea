/**
 * Edge Function: delete-user-data
 *
 * Implementa el derecho al olvido (GDPR Art. 17 / COPPA).
 * Elimina todos los datos del usuario autenticado de forma irreversible.
 *
 * Solo acepta solicitudes POST con un JWT de usuario válido.
 * Usa SECURITY DEFINER a través de la service_role key para poder
 * eliminar datos en cascada y la cuenta de auth.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Cliente con el JWT del usuario para verificar identidad
  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Cliente con service_role para operaciones privilegiadas
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  try {
    const userId = user.id;

    // 1. Eliminar archivos de storage del usuario
    const { data: avatarList } = await supabaseAdmin.storage
      .from("avatars")
      .list(userId);
    if (avatarList && avatarList.length > 0) {
      const paths = avatarList.map((f) => `${userId}/${f.name}`);
      await supabaseAdmin.storage.from("avatars").remove(paths);
    }

    const { data: pictogramList } = await supabaseAdmin.storage
      .from("pictograms")
      .list(userId);
    if (pictogramList && pictogramList.length > 0) {
      const paths = pictogramList.map((f) => `${userId}/${f.name}`);
      await supabaseAdmin.storage.from("pictograms").remove(paths);
    }

    // 2. Eliminar datos de tabla en orden (las FKs con ON DELETE CASCADE
    //    se encargan de los datos relacionados automáticamente, pero
    //    listamos explícitamente para mayor claridad y auditoría)
    const tablesToDelete: string[] = [
      "sentence_log",
      "usage_stats",
      "config_audit_log",
      "ai_insights",
      "game_sessions",
      "game_progress",
      "activity_sessions",
      "guided_activities",
      "parental_settings",
      "child_team",
      "share_tokens",
      "child_profiles",
      "tasks",
      "custom_pictograms",
      "categories",
      "profiles",
    ];

    for (const table of tablesToDelete) {
      await supabaseAdmin.from(table).delete().eq("user_id", userId);
    }

    // 3. Eliminar la cuenta de auth (operación irreversible)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      throw deleteError;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[delete-user-data] Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to delete user data" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
