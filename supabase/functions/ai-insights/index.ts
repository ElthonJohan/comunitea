/**
 * Edge Function: ai-insights
 *
 * Genera 2-3 sugerencias accionables en lenguaje natural para el adulto,
 * basadas en los patrones de uso del niño (RF-08.9).
 *
 * Body esperado (POST):
 *   {
 *     vocabularyLevel: "BASICO" | "INTERMEDIO" | "AVANZADO";
 *     sublevel: number;                        // sub-nivel actual en el juego
 *     avgSentenceLength: number;
 *     totalSentences: number;
 *     topPictogramLabels: string[];            // top 5 más usados
 *     unusedCategoryLabels: string[];          // categorías sin uso >14 días
 *   }
 *
 * Respuesta:
 *   { suggestions: string[] }
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

const SYSTEM_PROMPT = `Eres un asistente de apoyo para familias y terapeutas de niños con TEA que usan un sistema de comunicación aumentativa por pictogramas.

Recibes datos de uso de la app y debes generar EXACTAMENTE 3 sugerencias cortas y accionables en español para el adulto. Cada sugerencia debe:
- Estar en segunda persona ("Puedes...", "Te sugerimos...", "Considera...")
- Ser concreta y realizables en casa o terapia
- No sonar clínica ni alarmante — tono cálido y positivo
- Tener máximo 2 oraciones

Responde SOLO con un array JSON de 3 strings. Sin explicaciones adicionales. Ejemplo:
["Sugerencia 1.", "Sugerencia 2.", "Sugerencia 3."]`;

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "authorization, content-type",
            },
        });
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Método no permitido" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!OPENAI_API_KEY) {
        return new Response(
            JSON.stringify({ error: "OPENAI_API_KEY no configurada" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const body = await req.json();
        const {
            vocabularyLevel = "BASICO",
            sublevel = 1,
            avgSentenceLength = 1,
            totalSentences = 0,
            topPictogramLabels = [] as string[],
            unusedCategoryLabels = [] as string[],
        } = body as {
            vocabularyLevel?: string;
            sublevel?: number;
            avgSentenceLength?: number;
            totalSentences?: number;
            topPictogramLabels?: string[];
            unusedCategoryLabels?: string[];
        };

        const userMessage = [
            `Nivel de vocabulario del niño: ${vocabularyLevel}.`,
            `Sub-nivel actual en el modo juego: ${sublevel}/5.`,
            `Frases registradas en los últimos 30 días: ${totalSentences}.`,
            `Longitud promedio de frase: ${avgSentenceLength.toFixed(1)} pictogramas.`,
            topPictogramLabels.length > 0
                ? `Pictogramas más usados: ${topPictogramLabels.join(", ")}.`
                : "No hay datos de pictogramas frecuentes aún.",
            unusedCategoryLabels.length > 0
                ? `Categorías sin usar en más de 14 días: ${unusedCategoryLabels.join(", ")}.`
                : "Todas las categorías han sido usadas recientemente.",
        ].join(" ");

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                temperature: 0.7,
                max_tokens: 300,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userMessage },
                ],
            }),
        });

        if (!response.ok) {
            const err = await response.text().catch(() => "");
            return new Response(
                JSON.stringify({ error: `OpenAI ${response.status}: ${err.slice(0, 200)}` }),
                { status: 502, headers: { "Content-Type": "application/json" } }
            );
        }

        const openAIData = await response.json() as {
            choices: { message: { content: string } }[];
        };
        const raw = openAIData.choices?.[0]?.message?.content?.trim() ?? "[]";

        let suggestions: string[] = [];
        try {
            suggestions = JSON.parse(raw);
            if (!Array.isArray(suggestions)) suggestions = [];
        } catch {
            // Si no es JSON válido, devolvemos el texto como un solo ítem
            suggestions = [raw];
        }

        // Sanitizar: máximo 3 suggestions, sin strings vacíos
        suggestions = suggestions.filter((s): s is string => typeof s === "string" && s.trim().length > 0).slice(0, 3);

        return new Response(
            JSON.stringify({ suggestions }),
            { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        return new Response(
            JSON.stringify({ error: msg }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
});
