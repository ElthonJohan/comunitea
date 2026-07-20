import requests
import os
import argparse
from dotenv import load_dotenv

# Carga variables de entorno desde .env
load_dotenv()

# ─────────────────────────────────────────────────────────────────────────────
# ARGUMENTOS CLI
# Uso:
#   python script/main.py                      → genera voz femenina (Daniela)
#   python script/main.py --profile masculina  → genera voz masculina (Santy)
#   python script/main.py --force              → sobreescribe archivos existentes
# ─────────────────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="Genera audios con ElevenLabs para ComuniTEA")
parser.add_argument(
    "--profile",
    choices=["femenina", "masculina"],
    default="femenina",
    help="Perfil de voz a generar (default: femenina)"
)
parser.add_argument(
    "--force",
    action="store_true",
    help="Sobreescribir archivos existentes"
)
args = parser.parse_args()

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURACIÓN DE VOCES (legacy — preferir npm run generate:pictogram-audio)
# Samanta / Luis — mismos IDs que scripts/generate-elevenlabs-pictogram-audio.mjs
# https://elevenlabs.io/voice-library
# ─────────────────────────────────────────────────────────────────────────────
VOICES = {
    "femenina":  "qBvury71WUJfVeT1STkG",   # Samanta
    "masculina": "WEXRePkZGpmcFLvCOaB1",   # Luis
}

API_KEY = os.environ.get("ELEVENLABS_API_KEY")
VOICE_ID = VOICES[args.profile]
MODEL_ID = "eleven_v3"

if not API_KEY:
    raise ValueError("❌ No se encontró ELEVENLABS_API_KEY en el archivo .env")

# Base path del proyecto
BASE_AUDIO_PATH = os.path.join(os.path.dirname(__file__), "..", "assets", "audio")

# Todos los perfiles se guardan en su propia carpeta:
# assets/audio/femenina/...  assets/audio/masculina/...
PROFILE_BASE = os.path.join(BASE_AUDIO_PATH, args.profile)

# ─────────────────────────────────────────────────────────────────────────────
# VOCABULARIO COMPLETO — todos los pictogramas del nivel básico
# Estructura: { "carpeta_relativa": { "id_archivo": "Texto a leer" } }
# ─────────────────────────────────────────────────────────────────────────────
VOCABULARY = {
    # ── Palabras núcleo (siempre visibles en la tira de frase) ──────────────
    "core": {
        "core-yo":          "Yo",
        "core-quiero":      "Quiero",
        "core-no":          "No",
        "core-me-gustaria": "Me gustaría",
        "core-necesito":    "Necesito",
        "core-no-me-gusta": "No me gusta",
        "core-hola":        "Hola",
        "core-gracias":     "Gracias",
    },

    # ── Dashboard (categorías raíz) ──────────────────────────────────────────
    "dashboard": {
        "yo":           "Yo",
        "comida":       "Comida",
        "emociones":    "Emociones",
        "baño":         "Baño",
        "dormir":       "Dormir",
        "jugar":        "Jugar",
        "ropa":         "Ropa",
        "quiero_si":    "Sí quiero",
        "no_quiero_no": "No quiero",        "juguetes":     "Juguetes",
        "mi_dia":       "Mi día",
        "lacteos":      "Lácteos",    },

    # ── YO ───────────────────────────────────────────────────────────────────
    "yo": {
        "mi-nombre":     "Mi nombre es...",
        "tengo-calor":   "Tengo calor",
        "tengo-frio":    "Tengo frío",
        "tengo-hambre":  "Tengo hambre",
        "tengo-sed":     "Tengo sed",
        "estoy-cansado": "Estoy cansado",
        "me-duele":      "Me duele",
    },

    # ── Emociones ────────────────────────────────────────────────────────────
    "emociones": {
        "calma":    "Calma",
        "alegria":  "Alegría",
        "tristeza": "Tristeza",
        "enojo":    "Enojo",
        "miedo":    "Miedo",
        "sorpresa": "Sorpresa",
        "asco":     "Asco",
    },

    # ── Baño ─────────────────────────────────────────────────────────────────
    "baño": {
        "baño_item": "Baño",
        "papel":     "Papel",
        "ducharse":  "Ducharse",
        "lavado":    "Lavar manos",
        "dientes":   "Dientes",
    },

    # ── Dormir ───────────────────────────────────────────────────────────────
    "dormir": {
        "dormir_item": "Dormir",
        "luz":         "Luz",
        "osito":       "Osito",
        "silencio":    "Silencio",
        "cama":        "Cama",        "pijama":      "Pijama",    },

    # ── Jugar ────────────────────────────────────────────────────────────────
    "jugar": {
        "formas":          "Formas",
        "animales":        "Animales",
        "gestos":          "Gestos",
        "emociones_juego": "Emociones",
        "pelota":          "Pelota",
        "carro":           "Carro",
        "legos":           "Legos",
        "dinosaurio":      "Dinosaurio",
        "muneca":          "Muñeca",
        "tren":            "Tren",
        "plastilina":      "Plastilina",
    },

    # ── Ropa ─────────────────────────────────────────────────────────────────
    "ropa": {
        "polo":       "Polo",
        "pantalon":   "Pantalón",
        "medias":     "Medias",
        "casaca":     "Casaca",
        "calzon":     "Ropa interior",
        "zapatos":    "Zapatos",
        "short":      "Short",
        "zapatillas": "Zapatillas",
        "gorro":      "Gorro",
        "chompa":     "Chompa",
        "vestido":    "Vestido",
        "falda":      "Falda",
    },

    # ── Quiero menú ──────────────────────────────────────────────────────────
    "quiero_menu": {
        "comer_q":    "Quiero comer",
        "television": "Televisión",
        "papa":       "Papá",
        "mama":       "Mamá",
    },

    # ── No quiero menú ───────────────────────────────────────────────────────
    "no_quiero_menu": {
        "no_me_gusta": "No me gusta",
        "no_jugar":    "No quiero jugar",
        "no_dormir":   "No quiero dormir",
        "no_hablar":   "No quiero hablar",
        "me_molesta":  "Me molesta",
    },

    # ── Comida → Frutas ───────────────────────────────────────────────────────
    "comida/frutas": {
        "manzana":   "Manzana",
        "platano":   "Plátano",
        "fresas":    "Fresas",
        "uvas":      "Uvas",
        "naranja":   "Naranja",
        "mandarina": "Mandarina",
        "pera":      "Pera",
        "sandia":    "Sandía",
        "mango":     "Mango",
        "durazno":   "Durazno",
        "pina":      "Piña",
        "limon":     "Limón",
    },

    # ── Comida → Verduras ─────────────────────────────────────────────────────
    "comida/verduras": {
        "zanahoria": "Zanahoria",
        "lechuga":   "Lechuga",
        "tomate":    "Tomate",
        "brocoli":   "Brócoli",        "pepino":    "Pepino",
        "palta":     "Palta",
        "espinaca":  "Espinaca",
        "cebolla":   "Cebolla",
        "papa":      "Papa",
        "yuca":      "Yuca",
        "camote":    "Camote",
        "choclo":    "Choclo",    },

    # ── Comida → Bebidas ──────────────────────────────────────────────────────
    "comida/bebidas": {
        "agua":       "Agua",
        "leche":      "Leche",
        "jugo":       "Jugo",
        "chocolatada":"Chocolatada",
        "gaseosa":    "Gaseosa",
        "limonada":   "Limonada",
    },

    # ── Comida → Lácteos ─────────────────────────────────────────────────
    "comida/lacteos": {
        "queso":       "Queso",
        "yogurt":      "Yogurt",
        "mantequilla": "Mantequilla",
        "manjar":      "Manjar",
    },

    # ── Comida → Dulces ───────────────────────────────────────────────────────
    "comida/dulces": {
        "paleta":    "Paleta",
        "chocolate": "Chocolate",
        "galleta":   "Galleta",        "gelatina":  "Gelatina",
        "pan":       "Pan",    },

    # ── Comida → Carnes ───────────────────────────────────────────────────────
    "comida/carnes": {
        "pollo":   "Pollo",
        "tocino":  "Tocino",
        "carne":   "Carne",
        "pescado": "Pescado",
    },
    # ── Comida (sub-catálogo de categorías) ─────────────────────────────────
    "comida": {
        "frutas":   "Frutas",
        "verduras": "Verduras",
        "bebidas":  "Bebidas",
        "dulces":   "Dulces",
        "carnes":   "Carnes",
        "lacteos":  "Lácteos",
    },

    # ── Juguetes (nueva categoría INTERMEDIO) ──────────────────────────────
    "juguetes": {
        "pelota":     "Pelota",
        "osito":      "Osito",
        "carro":      "Carro",
        "legos":      "Legos",
        "dinosaurio": "Dinosaurio",
        "muneca":     "Muñeca",
        "tren":       "Tren",
        "plastilina": "Plastilina",
    },

    # ── Mi Día (rutinas INTERMEDIO) ──────────────────────────────────────
    "mi_dia": {
        "levantarse":        "Levantarse",
        "cepillar-dientes":  "Cepillar dientes",
        "banarse":           "Bañarse",
        "lavar-cara":        "Lavar cara",
        "vestirse":          "Vestirse",
        "desayunar":         "Desayunar",
        "colegio":           "Ir al colegio",
        "llegar-casa":       "Llegar a casa",
        "pijama":            "Ponerse pijama",
        "dormir":            "Dormir",
    },

    # ── Higiene (INTERMEDIO) ────────────────────────────────────────────
    "higiene": {
        "lavar-manos":       "Lavar manos",
        "cepillar-dientes":  "Cepillar dientes",
        "banarse":           "Bañarse",
        "lavar-cara":        "Lavar cara",
        "peinarse":          "Peinarse",
    },}

# ─────────────────────────────────────────────────────────────────────────────

def generate_audio(text: str, folder: str, filename: str, skip_existing: bool = True):
    """Genera un archivo MP3 con ElevenLabs. Salta el archivo si ya existe."""
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, f"{filename}.mp3")

    if skip_existing and os.path.exists(file_path):
        print(f"⏭️  Ya existe: {file_path}")
        return

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": API_KEY
    }
    data = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.0,
            "use_speaker_boost": True
        }
    }

    response = requests.post(url, json=data, headers=headers)

    if response.status_code == 200:
        with open(file_path, "wb") as f:
            f.write(response.content)
        print(f"✅ Generado: {file_path}")
    else:
        print(f"❌ Error en '{text}': {response.status_code} - {response.text}")


# ─────────────────────────────────────────────────────────────────────────────
# INICIO DEL PROCESO
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    total = sum(len(items) for items in VOCABULARY.values())
    skip = not args.force

    print(f"🎙️  Perfil   : {args.profile.upper()}  (Voice ID: {VOICE_ID})")
    print(f"📁  Destino  : {os.path.abspath(PROFILE_BASE)}")
    print(f"🔢  Total    : {total} audios")
    print(f"⚙️  Modo     : {'forzar sobreescritura' if args.force else 'saltar existentes'}")
    print()

    for category, items in VOCABULARY.items():
        folder = os.path.join(PROFILE_BASE, category)
        for file_name, text in items.items():
            generate_audio(text, folder, file_name, skip_existing=skip)

    print(f"\n✨ ¡Listo! Audios generados en: {os.path.abspath(PROFILE_BASE)}")
    if args.profile != "femenina":
        print(f"\n📌 Recuerda registrar los nuevos paths en constants/AudioAssets.ts")
        print(f"   Sección: AUDIO_ASSETS_{args.profile.upper()}")
