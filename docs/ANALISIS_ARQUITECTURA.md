# 🏛️ Análisis Arquitectónico y Guía de Continuidad - ComuniTEA

Este documento contiene el análisis técnico detallado, el mapa de rutas, la arquitectura de archivos y las consideraciones clave para el desarrollo y mantenimiento del proyecto **ComuniTEA**.

---

## 1. 📌 Visión General y Propósito del Proyecto

**ComuniTEA** es una aplicación móvil de **Comunicación Aumentativa y Alternativa (CAA)** desarrollada con Expo y React Native, diseñada para personas en el espectro autista (TEA) y sus familias/cuidadores.

### Características Clave:
* **Tablero de Comunicación Pictográfica**: Rejilla intuitiva organizada por categorías táctiles.
* **Barra de Construcción de Frases (*Sentence Strip*)**: Permite encadenar pictogramas (ej. *"Yo"* + *"Quiero"* + *"Agua"*) para su reproducción secuencial.
* **Motor Híbrido de Voz**: Audios neuronales pre-generados de alta calidad (**ElevenLabs**) respaldados por sintetizador **Text-To-Speech (TTS)** nativo.
* **Agenda Visual & Temporizador (*Time Timer*)**: Gestión de rutinas y apoyo visual para reducir la ansiedad temporal.
* **Parental Gate**: Sistema de bloqueo por tiempo/PIN para evitar modificaciones accidentales en la configuración por parte del usuario final.
* **Backend & Sincronización Nube**: Integración con **Supabase** (autenticación, perfiles, almacenamiento) y cola de peticiones *offline*.

---

## 2. 🗺️ Análisis y Mapa de Rutas (*Expo Router*)

El proyecto utiliza **Expo Router v6** (sistema de enrutamiento basado en archivos dentro de `app/`). Las rutas están fuertemente tipadas en `types/routes.ts`.

```
app/
├── _layout.tsx                     # Layout Raíz (Providers, comprobación de sesión y redirección)
├── index.tsx                       # Pantalla de entrada / Splash inicial
├── login.tsx                       # Autenticación con Supabase (Login / Registro)
├── voice-selection.tsx             # Configuración inicial de voz preferida
├── onboarding.tsx                  # Flujo de bienvenida e introducción
├── tutorial/                       # Módulo de tutorial interactivo
│   ├── _layout.tsx
│   ├── index.tsx                   # Tutorial principal
│   └── basic.tsx                   # Tutorial básico de comunicación
├── (tabs)/                         # Navegación principal por pestañas inferiores
│   ├── _layout.tsx                 # Tab Bar personalizado con sistema de sombras e íconos
│   ├── index.tsx                   # Redirección automática a categorías/tablero
│   ├── categorias.tsx              # Rejilla principal de categorías pictográficas
│   ├── tablero.tsx                 # Tablero interactivo con Sentence Strip
│   ├── ejercicios.tsx              # Dashboard de módulos y ejercicios
│   └── perfil.tsx                  # Perfil del niño, nivel de vocabulario y logros
├── category/
│   └── [id].tsx                    # Pantalla dinámica de pictogramas dentro de una categoría
├── ejercicios/                     # Módulos de aprendizaje adaptativo
│   ├── _layout.tsx
│   ├── [id].tsx                    # Ejercicio individual dinámico
│   ├── grupo2/                     # Ejercicios de estructuración (Nivel 2)
│   └── grupo3/                     # Ejercicios de comunicación avanzada (Nivel 3)
├── sentences.tsx                   # Frases rápidas predefinidas y rutinas de fraseo
├── report.tsx                      # Reportes de progreso y analíticas para tutores/terapeutas
├── vocabulary-manager.tsx          # "Mi mundo en fotos": creación de pictogramas personalizados
├── activity-editor.tsx             # Creador/editor de rutinas y actividades de agenda
├── activity-run.tsx                # Ejecutor de actividades con temporizador integrado
├── game.tsx                        # Gamificación y recompensas visuales
├── team-manager.tsx                # Gestión de equipo multidisciplinario (padres, terapeutas)
└── settings.tsx                    # Configuración global, temas, PIN parental y voz
```

### 🔐 Guardias de Autenticación y Flujo de Navegación (`RootLayoutNav`)
Definido en `app/_layout.tsx`:
1. **Sin Sesión**: Cualquier intento de acceder a rutas protegidas redirige automáticamente a `app/login.tsx`.
2. **Con Sesión Activa**:
   - Sin preferencia de voz seleccionada $\rightarrow$ `/voice-selection`
   - Sin onboarding completado $\rightarrow$ `/onboarding`
   - Sin tutorial completado (según nivel) $\rightarrow$ `/tutorial`
   - Estado válido $\rightarrow$ `/(tabs)/categorias`

---

## 3. 🧩 Estructura de Directorios ("Dónde está cada cosa")

| Directorio | Propósito y Contenido Principal |
| :--- | :--- |
| **`app/`** | Pantallas y layouts de navegación (File-based Routing). |
| **`components/`** | Componentes UI reutilizables (`SentenceStrip`, `ActionGridItem`, `VisualTimer`, `PinModal`, `CategoryPills`, etc.). |
| **`context/`** | Proveedores de estado global con React Context (`AuthContext`, `ChildProfileContext`, `EditModeContext`, `TimerContext`, `NetworkContext`, `AppThemeContext`). |
| **`stores/`** | Tiendas de estado reactivo y persistente con **Zustand** (`g2ProgressStore`, `g3ProgressStore`, `settingsStore`, `appThemeStore`, `rutinasProgressStore`). |
| **`lib/`** | Integraciones y lógica de negocio (`supabase.ts`, `speakFrasePhrase.ts`, `pictogramCache.ts`, `offlineQueue.ts`). |
| **`constants/`** | Paletas y configuraciones estáticas (`Colors.ts`, `TableroTheme.ts`, `AudioAssets.ts`, `Categories.ts`, `StorageKeys.ts`). |
| **`features/`** | Módulos de negocio encapsulados por dominio (`ejercicios`, `perfil`, `tablero`, `tutorial`, `vocabulario`). |
| **`assets/`** | Audios pre-grabados por IA (`assets/audio/`), fuentes e imágenes. |
| **`supabase/`** | Scripts SQL y configuraciones de migración de base de datos. |
| **`scripts/`** | Scripts de utilería (ej. `generate-elevenlabs-pictogram-audio.mjs`). |

---

## 4. 🛠️ Tecnologías y Librerías Utilizadas

* **Framework Core**: Expo SDK 57 / React Native 0.86 / React 19 / TypeScript 6.0.
* **Navegación**: `expo-router` v57 (basado en `@react-navigation/native` v7).
* **Backend & Auth**: Supabase JS Client (`@supabase/supabase-js` v2.98).
* **Estado Local & Persistencia**: Zustand v5 + React Context + `@react-native-async-storage/async-storage`.
* **Audio & Voz**: `expo-audio` (reproducción de audios local/remoto) + `expo-speech` (sintetizador TTS).
* **Animaciones & Gestos**: `react-native-reanimated` v4.5 + `react-native-gesture-handler` + `react-native-confetti-cannon`.
* **UI & Estilos**: `lucide-react-native`, `@expo/vector-icons`, `expo-linear-gradient`, `expo-blur`.
* **Tipografías**: `@expo-google-fonts/plus-jakarta-sans` y `@expo-google-fonts/be-vietnam-pro`.

---

## 5. ⚠️ Consideraciones de Ingeniería para Modificar el Proyecto

### A. Sistema de Diseño: "The Tactile Sanctuary" (`DESIGN.md`)
* **Regla del "No-Line"**: **Está prohibido el uso de bordes sólidos de 1px** para separar secciones. Usa graduaciones tonales de fondo (`surface`, `surface-container-low`, `surface-container-highest`).
* **Bordes Redondeados**: Usa esquinas extremadamente suaves (`xl` = 3rem, `full` = píldora). Evita esquinas en ángulo recto ($0\text{px}$).
* **Sombras Difusas**: Usa sombras ambientales extra-difusas (24px a 40px de blur, opacidades de 4% a 6%).
* **Colores Sensoriales**: Tonos tierra y pasteles desaturados. Prohibido el uso de negro puro (`#000000`).

### B. Sistema Híbrido de Voz
* Al añadir nuevos pictogramas en `constants/Categories.ts`, registra sus audios estáticos en `constants/AudioAssets.ts`.
* El motor reproductor usará el audio MP3 pre-grabado si está disponible; de lo contrario, recurrirá al TTS nativo (`expo-speech`).

### C. Parental Gate (Bloqueo de Configuración)
* El modo edición y la gestión de vocabulario están protegidos mediante `ParentalContext` y `EditModeContext`.
* Requiere interacción sostenida o ingreso de PIN (`PinModal.tsx`) para evitar manipulaciones accidentales por el niño.

### D. Estrategia Offline First
* Los eventos de uso y datos sensibles utilizan `lib/offlineQueue.ts`. Al perder la conexión a internet, los eventos se guardan en almacenamiento local y se sincronizan al recuperar señal.

---

## 6. 🚀 Comandos y Verificación

### Iniciar servidor de desarrollo en Linux:
```bash
ELECTRON_DISABLE_SANDBOX=1 npm run dev
```

### Verificación de Tipos y Tests:
```bash
# Verificación TypeScript
npm run typecheck

# Tests unitarios
npm run test
```
