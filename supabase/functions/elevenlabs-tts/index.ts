// Este archivo corre en el runtime de Deno (Supabase Edge Functions), no en Node.js.
import { corsHeaders } from '../_shared/cors.ts'

/** Samanta — misma voz que clips pictogramas / formador de frases */
const VOICE_ID_FEMENINA = 'qBvury71WUJfVeT1STkG'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API Key no configurada en Supabase')
    }

    const { text, voiceId, speed } = await req.json()

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Falta el texto' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const selectedVoiceId = typeof voiceId === 'string' && voiceId.trim() ? voiceId : VOICE_ID_FEMENINA
    const ttsSpeed = typeof speed === 'number' && speed >= 0.5 && speed <= 2.0 ? speed : 1.0

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
            speed: ttsSpeed,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error de ElevenLabs: ${response.status} - ${errorText}`)
    }

    const audioBlob = await response.blob()

    return new Response(audioBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/elevenlabs-tts' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
