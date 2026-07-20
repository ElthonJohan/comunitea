
# ComuniTEA

Aplicación de comunicación aumentativa y alternativa (CAA) desarrollada con Expo y React Native.

## 📱 Descripción

ComuniTEA es una aplicación diseñada para facilitar la comunicación de personas con necesidades especiales, especialmente enfocada en el espectro autista (TEA). La app permite expresar necesidades, emociones y actividades cotidianas mediante un tablero de comunicación visual e intuitivo, ahora potenciado con **voces neuronales realistas** y herramientas avanzadas de estructuración.

## 🚀 Tecnologías Utilizadas

- **Framework**: Expo SDK 54
- **React Native**: 0.81.4
- **React**: 19.1.0
- **Navegación**: Expo Router 6.0.8
- **Audio**: Expo AV (Reproducción híbrida) & Expo Speech (TTS Fallback)
- **Gestión de Estado**: React Hooks (useState, Context)
- **Iconos**: @expo/vector-icons, lucide-react-native
- **TypeScript**: 5.9.2

## 📁 Estructura del Proyecto

```
comuniteav0/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab Navigation
│   │   ├── index.tsx           # Dashboard Principal (Con Sentence Strip)
│   │   ├── list.tsx            # Agenda Visual / Rutinas (Con Timer)
│   │   └── profile.tsx         # Perfil (Placeholder)
│   ├── category/[id].tsx       # Pantalla dinámica de subcategorías
│   ├── _layout.tsx             # Stack Navigation Raíz (Providers)
│   ├── index.tsx               # Bienvenida
│   ├── login.tsx               # Login (Decorativo)
│   └── voice-selection.tsx     # Configuración de voz
├── assets/
│   └── audio/                  # Audios generados por IA (ElevenLabs)
├── components/
│   ├── ActionGridItem.tsx      # Botón de pictograma
│   ├── VisualTimer.tsx         # Temporizador visual (Time Timer)
│   └── SentenceStrip.tsx       # Barra de construcción de frases
├── constants/
│   ├── Vocabulary.ts           # Definición de categorías y pictogramas
│   ├── AudioAssets.ts          # Mapeo estático de audios
│   └── Colors.ts               # Sistema de diseño
├── context/
│   ├── VoiceContext.tsx        # Persistencia de preferencias de voz
│   └── EditModeContext.tsx     # Parental Gate (Bloqueo/Desbloqueo)
├── hooks/
│   └── useSpeech.ts            # Hook híbrido (MP3 > TTS System)
└── script/
    └── main.py                 # Script de generación de audios (OpenAI/ElevenLabs)
```

## 🌟 Funcionalidades Principales

### 🗣️ Comunicación Híbrida
- **Voces Neuronales**: Audios pre-grabados de alta calidad para nivel básico.
- **Barra de Frases (Sentence Strip)**: Permite acumular pictogramas (ej: "YO" + "QUIERO" + "AGUA") y reproducirlos secuencialmente.

### 📅 Agenda Visual Interactiva
- Lista de rutinas con checkboxes.
- **Integración con Timer**: Las tareas pueden tener una duración asociada (ej: "5 min"). Al pulsar el icono de reloj en la tarea, se inicia el Temporizador Visual con ese tiempo automáticamente.

### ⏳ Temporizador Visual
- Herramienta de apoyo para la gestión del tiempo y ansiedad.
- Accesible globalmente o desde tareas específicas.
- Representación visual del tiempo restante (barra roja).

### 🔒 Parental Gate (Modo Edición)
- Protege la configuración de la app contra cambios accidentales.
- **Bloqueo/Desbloqueo**: Requiere mantener presionado el icono de candado por 3 segundos (simulado con alerta por ahora).
- Estado persistente durante la sesión.

## 🏃‍♂️ Cómo Ejecutar

```bash
# Instalar dependencias
npm install
npx expo install

# Iniciar el servidor de desarrollo
npm run dev
# O usa: npx expo start -c (para limpiar caché si hay problemas con audios)
```

## 📋 Estado Actual

### ✅ Completado (Sprint 4 & 5)
- [x] **Barra de Construcción de Frases (Sentence Strip)**
- [x] **Parental Gate (Contexto + UI de Bloqueo)**
- [x] **Integración Agenda - Temporizador**
- [x] **Módulo de Autenticación con Supabase**
- [x] **Preparación de Base de Datos y Storage en Nube**
- [x] **Lógica Local de "Mi mundo en fotos" (Creación de Pictogramas Custom)**

### 🚧 Pendiente (Post-MVP)
- [ ] Landing Page promocional
- [ ] Desplegar en tiendas (Android Play Store)

## 📄 Licencia

Proyecto privado - MandoLabs
