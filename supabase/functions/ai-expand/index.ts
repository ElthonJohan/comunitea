/**
 * Edge Function: ai-expand
 *
 * Recibe una lista de etiquetas de pictogramas y devuelve una frase natural
 * en español. La complejidad se adapta al nivel del niño (básico = frases
 * muy cortas y simples; avanzado = frases más completas).
 *
 * Body esperado:
 *   {
 *     pictogramLabels: string[];
 *     vocabularyLevel?: "BASICO" | "INTERMEDIO" | "AVANZADO";
 *     timeOfDay?: string;
 *     lastRoutine?: string;
 *   }
 *
 * Respuesta:
 *   { expandedText: string }
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
/** Modelo para frases naturales (p. ej. `gpt-5.4-nano`). Override: secreto `OPENAI_FRASE_MODEL` en Supabase. */
const OPENAI_FRASE_MODEL = Deno.env.get("OPENAI_FRASE_MODEL") ?? "gpt-5.4-nano";

const LEVEL_INSTRUCTIONS: Record<string, string> = {
  BASICO: `Nivel BÁSICO (niño pequeño o vocabulario inicial). Escribe frases MUY CORTAS y SIMPLES: 3 a 6 palabras máximo. Usa solo palabras muy comunes. Ejemplo: "Quiero agua." o "Tengo hambre."`,
  INTERMEDIO: `Nivel INTERMEDIO. Escribe frases cortas y claras: 5 a 10 palabras. Estructura simple pero completa. Ejemplo: "Yo quiero un vaso de agua." o "Me gusta la manzana."`,
  AVANZADO: `Nivel AVANZADO (niño con más vocabulario). Puedes escribir frases más completas y naturales: hasta 15 palabras. Incluye detalles cuando los pictogramas lo permitan. Ejemplo: "Quiero una manzana roja para el recreo."`,
};

const SYSTEM_BASE = `Eres un asistente de comunicación aumentativa para un niño con TEA.
Recibes una lista de pictogramas que el niño seleccionó y debes transformarlos en UNA sola frase.

Reglas que SIEMPRE debes seguir:
- Español sencillo y natural
- Siempre en primera persona del niño (usa "yo quiero", "tengo", "me gusta")
- Sin sarcasmo, sin ironía, sin lenguaje complicado
- Sin preguntas, sin emojis, sin nombres propios
- Sin información personal identificable
- Si los pictogramas no forman sentido claro, elige la interpretación más probable para un niño
- Responde SOLO con la frase, sin comillas, sin explicaciones`;

const INTENT_FORMADOR = `Modo FORMADOR "Yo quiero + objeto":
El niño armó un deseo con pictos. Las etiquetas suelen ser "Yo quiero" y el objeto (o solo el objeto).
Escribe UNA frase breve y oral, con artículos o cuantificadores cuando encajen ("un", "una", "un poco de", "algo de").
Usa conectores naturales si hace falta ("con", "para", "y"). No repitas palabras de más.`;

const INTENT_TABLERO = `Modo TABLERO (varios slots en orden):
Une las etiquetas en el orden dado en UNA frase hablada natural, añadiendo preposiciones o conjunciones ligeras ("y", "con", "para", "de") solo cuando mejoren la claridad. Primera persona del niño cuando encaje con el significado.`;

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

  try {
    const body = await req.json();
    const {
      pictogramLabels,
      vocabularyLevel,
      timeOfDay,
      lastRoutine,
      phraseIntent,
    }: {
      pictogramLabels: string[];
      vocabularyLevel?: "BASICO" | "INTERMEDIO" | "AVANZADO";
      voiceProfile?: string;
      timeOfDay?: string;
      lastRoutine?: string;
      /** "formador" | "tablero" — instrucciones extra para conectores y oralidad */
      phraseIntent?: string;
    } = body;

    if (!pictogramLabels || pictogramLabels.length === 0) {
      return new Response(
        JSON.stringify({ error: "Se requiere al menos un pictograma" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY no configurada" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const levelKey = vocabularyLevel && LEVEL_INSTRUCTIONS[vocabularyLevel]
      ? vocabularyLevel
      : "INTERMEDIO";
    const levelInstruction = LEVEL_INSTRUCTIONS[levelKey];
    const intentExtra =
      phraseIntent === "formador"
        ? `\n\n${INTENT_FORMADOR}`
        : phraseIntent === "tablero"
        ? `\n\n${INTENT_TABLERO}`
        : "";
    const systemPrompt = `${SYSTEM_BASE}\n\n${levelInstruction}.${intentExtra}`;

    const contextParts: string[] = [];
    if (timeOfDay) contextParts.push(`Hora del día: ${timeOfDay}`);
    if (lastRoutine) contextParts.push(`Última actividad completada: ${lastRoutine}`);

    const contextLine =
      contextParts.length > 0
        ? `\nContexto adicional: ${contextParts.join(". ")}.`
        : "";

    const userMessage = `Pictogramas seleccionados: ${pictogramLabels.join(" + ")}${contextLine}`;

    const openAiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_FRASE_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.35,
          max_tokens: phraseIntent === "tablero" ? 90 : 70,
        }),
      }
    );

    if (!openAiResponse.ok) {
      const errBody = await openAiResponse.text();
      console.error("[ai-expand] OpenAI error:", openAiResponse.status, errBody);
      return new Response(
        JSON.stringify({
          error: `OpenAI respondió ${openAiResponse.status}`,
          detail: errBody.slice(0, 200),
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const openAiData = await openAiResponse.json();
    const expandedText: string =
      openAiData.choices?.[0]?.message?.content?.trim() ?? "";

    if (!expandedText) {
      return new Response(
        JSON.stringify({ error: "OpenAI devolvió una respuesta vacía" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ expandedText }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[ai-expand] Error inesperado:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
