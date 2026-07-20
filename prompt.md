## CONTEXTO
Ya tenemos implementados los ejercicios del Grupo 2 con
5 niveles. Necesitamos REEMPLAZAR los Niveles 2 y 3
actuales con nuevas versiones más ricas en mecánicas.
NO tocar los Niveles 1, 4 y 5 — esos se quedan igual.

---

## QUÉ REEMPLAZAR

### ANTES — Nivel 2 (borrar):
Pantalla simple con imagen situacional + 4 opciones
de emoción en una sola ronda.

### ANTES — Nivel 3 (borrar):
Pantalla de necesidad básica con 1-3 botones sin
distinción de a quién dirigirse.

---

## NUEVO NIVEL 2 — "MIS EMOCIONES"

### Estructura general
El nivel tiene 3 ejercicios con dificultad progresiva,
navegables mediante tabs superiores: E1 | E2 | E3.

Header del nivel:
- Fondo morado (#5C35A0)
- Badge "Nivel 2" (pill gris claro, texto blanco)
- Título "Mis emociones" (blanco, 14px)
- 3 círculos de estrella a la derecha:
  ⭐ llena = ejercicio completado
  ○ vacía = pendiente
  Se llenan de izquierda a derecha conforme avanza.

Tabs superiores (fuera del phone frame, como navegación
de sección):
- E1 — Reconocer | E2 — Unir | E3 — Identificar
- Tab activo: fondo #5C35A0, texto blanco, border radius pill
- Tab inactivo: texto #888, sin fondo
- Al completar un ejercicio: el tab siguiente se desbloquea

Badge de dificultad (debajo de los tabs):
- "Nivel 2 · Ejercicio X — [nombre]" + pill de dificultad
- E1: pill verde "Muy fácil"
- E2: pill amarillo "Un poco más difícil"  
- E3: pill naranja "Más difícil"

---

### E1 — RECONOCER (Muy fácil)

Mecánica: 3 rondas automáticas. Cada ronda muestra
una escena situacional y 2 opciones de emoción.
El niño debe identificar cómo se siente el personaje.

Componente: ReconocerEmocion.tsx

Layout de cada ronda:
- Burbuja de instrucción arriba:
  Ícono 👀 (ojos) + texto "¿Cómo se siente?"
  Fondo blanco, border 1px #E0E0E0, border radius 12px
- Contador "Escena X de 3" (11px, color #888, centrado)
- Tarjeta de escena (fondo blanco, border radius 16px,
  border 1px #E8E8F0, padding 24px):
  - Emoji grande de situación (80px, centrado)
  - Texto descriptivo debajo (14px, color #5C35A0,
    font-weight 500, centrado)
- Texto "Toca cómo se siente" (12px, #888, centrado)
- 2 botones de emoción en fila (igual ancho, gap 12px):
  Cada botón: fondo blanco, border 1px #E0E0E0,
  border radius 16px, padding 16px, flex 1
  - Emoji de emoción (48px, centrado)
  - Label debajo (12px, #5C35A0, font-weight 500)
- Dots de progreso abajo: 3 puntos
  Activo: #5C35A0 relleno | Pendiente: #E0E0E0

Las 3 escenas y respuestas:
Ronda 1: 🎂 "El niño recibió un regalo"
  Opciones: 😊 Feliz | 😢 Triste → correcta: Feliz
Ronda 2: 😤 "El niño no puede abrir la caja"  
  Opciones: 😊 Feliz | 😠 Enojado → correcta: Enojado
Ronda 3: 🤗 "El niño abraza a mamá"
  Opciones: 😊 Feliz | 😢 Triste → correcta: Feliz

Al acertar en cada ronda:
- Overlay verde semitransparente sobre la tarjeta
- Confeti suave (count: 30)
- Sonido suave de acierto
- Botón "Siguiente →" aparece (si hay más rondas)
  o "¡Completado!" si es la ronda 3
- El dot de progreso correspondiente se llena

Al fallar:
- Shake animation en el botón tocado (translateX)
- X roja aparece sobre ese botón
- El botón sigue activo — no desaparece
- Voz: repite "¿Cómo se siente?"
- NO avanza de ronda hasta acertar

Al completar las 3 rondas:
- Primera estrella del header se llena (⭐○○ → ⭐○○ animado)
- Tab E2 se desbloquea
- Voz: "¡Muy bien! Ahora el siguiente."

---

### E2 — UNIR (Un poco más difícil)

Mecánica: selección en DOS toques secuenciales.
Primero toca una cara de emoción, luego toca la
palabra que le corresponde. Sin arrastre (no drag).
3 rondas automáticas.

Componente: UnirEmocion.tsx

Layout:
- Burbuja instrucción: ícono 🔗 + "Une la cara con
  la palabra"
- Zona izquierda (caras): columna de 2-3 emojis grandes
  (64px) en tarjetas individuales, fondo blanco,
  border 2px #E0E0E0, border radius 12px, 70x70px
- Zona derecha (palabras): columna de 2-3 palabras
  en tarjetas individuales, mismo tamaño
  Texto: 13px bold #5C35A0
- Las columnas están alineadas pero NO conectadas
  visualmente hasta que el niño las una

Flujo de interacción:
PASO 1: Niño toca una cara
  → La tarjeta se marca (borde #5C35A0 2px, 
    fondo #EDE7F6)
  → Voz: dice el nombre de la emoción

PASO 2: Niño toca una palabra
  → Si es correcto: línea de conexión animada entre
    los dos (color #4CAF50, width 2px)
    + ambas tarjetas fondo #E8F5E9
    + sonido suave
  → Si es incorrecto: shake en la palabra tocada
    + la cara vuelve a estado normal (sin selección)
    + voz repite instrucción

Al conectar todos los pares de la ronda:
- Confeti + botón "Siguiente"
- Dot de progreso se llena

Las 3 rondas:
Ronda 1: 😊↔Feliz | 😢↔Triste (2 pares)
Ronda 2: 😊↔Feliz | 😠↔Enojado | 😢↔Triste (3 pares)
Ronda 3: 😊↔Feliz | 😰↔Nervioso | 😠↔Enojado (3 pares)

Al completar las 3 rondas:
- Segunda estrella se llena (⭐⭐○)
- Tab E3 se desbloquea

---

### E3 — IDENTIFICAR (Más difícil)

Mecánica: se muestra UNA emoción grande (sin contexto
de escena) y el niño debe identificarla entre 3 opciones
en cuadrícula. 3 rondas con emociones distintas.

Componente: IdentificarEmocion.tsx

Layout:
- Burbuja instrucción: ícono ❓ + "¿Cuál es esta emoción?"
- Emoji grande central (100px) sobre fondo neutro
  tarjeta blanca, border radius 16px, padding 32px
  El emoji NO tiene label — solo la cara
- Texto "Toca la respuesta correcta" (12px, #888)
- Grid 3 opciones (2 columnas si son 3: 2+1 centrado,
  o fila de 3 más pequeños):
  Cada opción: tarjeta blanca, border radius 12px,
  border 1px #E0E0E0, padding 12px
  - Emoji 40px + label 11px #5C35A0

Las 3 rondas:
Ronda 1: Mostrar 😊 → opciones: Feliz | Triste | Enojado
  correcta: Feliz
Ronda 2: Mostrar 😰 → opciones: Feliz | Nervioso | Triste
  correcta: Nervioso  
Ronda 3: Mostrar 😠 → opciones: Enojado | Feliz | Triste
  correcta: Enojado

Al acertar:
- Overlay confeti + "¡Correcto!" + botón Siguiente
- Dot de progreso se llena

Al fallar:
- Shake + X roja en opción tocada
- Opción sigue activa
- Voz: "Intenta otra vez"

Al completar las 3 rondas:
- Tercera estrella se llena (⭐⭐⭐)
- Pantalla de celebración completa del nivel:
  "¡Completaste Mis Emociones!"
  Confeti continuo + animación de las 3 estrellas
  Botón "Continuar al Nivel 3 →"

---

## NUEVO NIVEL 3 — "PEDIR AYUDA"

### Estructura general
3 ejercicios con dificultad progresiva.
Mismo sistema de tabs, estrellas y badges que el Nivel 2.
Color de header: ámbar/naranja (#F57F17) — distinto
al morado del Nivel 2, para diferenciación visual.

Tabs: E1 — ¿Qué necesito? | E2 — ¿Cómo lo digo? |
      E3 — ¿A quién le pido?

Badge de dificultad:
- E1: "Muy fácil"
- E2: "Un poco más difícil"
- E3: "Más difícil"

---

### E1 — ¿QUÉ NECESITO? (Muy fácil)

Mecánica: imagen situacional + 1 botón de necesidad
(sin distractor). El niño solo debe reconocer y tocar.
3 rondas.

Componente: QueNecesito.tsx (reutilizar/adaptar
ContextoSituacional.tsx del Grupo 2)

Las 3 rondas:
Ronda 1: 🩹 "El niño tiene una herida"
  Botón único: "ME DUELE 😣" (fondo #FFCDD2)
  Voz: "El niño tiene dolor. Toca 'me duele'."
  Al tocar: voz habla "Me duele." + celebración

Ronda 2: ☀️ "El niño tiene mucho calor y sed"
  Botón único: "QUIERO AGUA 🥤" (fondo #E3F2FD)
  Voz: "El niño tiene sed. Toca para pedir agua."
  Al tocar: voz habla "Quiero agua." + celebración

Ronda 3: 😴 "El niño está muy cansado"
  Botón único: "QUIERO DESCANSAR 😴" (fondo #EDE7F6)
  Voz: "El niño está cansado. Toca para descansar."
  Al tocar: voz habla "Quiero descansar." + celebración

---

### E2 — ¿CÓMO LO DIGO? (Un poco más difícil)

Mecánica: imagen situacional + 3 botones de necesidad.
El niño debe elegir el correcto según el contexto.
3 rondas.

Componente: ComoLoDigo.tsx

Las 3 rondas:
Ronda 1: 🤢 "El niño se siente mal del estómago"
  Opciones: 😣 Me duele | 🥤 Quiero agua | 🙋 Ayuda
  Correcta: Me duele
  Pista tras 2 fallos: resalta con borde dorado pulsante

Ronda 2: 😭 "El niño está llorando y no sabe qué hacer"
  Opciones: 😣 Me duele | 🥤 Quiero agua | 🙋 Ayuda
  Correcta: Ayuda
  
Ronda 3: 🌵 "El niño lleva horas sin tomar nada"
  Opciones: 😣 Me duele | 🥤 Quiero agua | 🚽 Baño
  Correcta: Quiero agua

Al fallar: shake + X + opción sigue activa (no desaparece)
Al acertar: voz habla la frase en voz alta + confeti

---

### E3 — ¿A QUIÉN LE PIDO? (Más difícil)

Mecánica: situación específica + elegir a la persona
correcta a quien dirigir la necesidad. 3 rondas.
Introduce razonamiento contextual — el desafío más
alto del nivel.

Componente: AQuienLePido.tsx

Layout:
- Imagen situacional emoji (80px) + texto descripción
- Texto: "¿A quién le pides ayuda?"
- 3 opciones de persona en tarjetas (igual que opciones
  de emoción pero con avatar de persona):
  Cada tarjeta: emoji persona (48px) + rol (12px bold)

Las 3 rondas:
Ronda 1: 🤢 "Me duele el estómago en casa"
  Opciones: 👩 Mamá/Papá | 👩‍🏫 Maestra | 👨‍⚕️ Doctor
  Correcta: Mamá/Papá
  Voz: "Estás en casa. ¿A quién le pides ayuda?"
  Feedback correcto: "¡Correcto! En casa le pides
    a mamá o papá."

Ronda 2: 😖 "Me caí en el patio del colegio"
  Opciones: 👩 Mamá/Papá | 👩‍🏫 Maestra | 👨‍⚕️ Doctor
  Correcta: Maestra
  Feedback: "¡Muy bien! En el colegio le avisas
    a la maestra."

Ronda 3: 🤒 "Me duele mucho la cabeza y tengo fiebre"
  Opciones: 👩 Mamá/Papá | 👩‍🏫 Maestra | 👨‍⚕️ Doctor
  Correcta: Doctor (o Mamá/Papá también válida)
  Feedback correcto Doctor: "¡Bien! El doctor puede
    ayudarte cuando estás muy enfermo."
  Feedback correcto Mamá/Papá: "¡También! Primero
    le dices a mamá o papá y ellos te llevan al doctor."
  → Esta ronda acepta 2 respuestas correctas.

Al completar E3:
- ⭐⭐⭐ completas
- Celebración de nivel completo
- Botón "Continuar al Nivel 4 →"

---

## ARCHIVOS A CREAR/MODIFICAR

components/ejercicios/grupo1/nivel2/
  ReconocerEmocion.tsx
  UnirEmocion.tsx
  IdentificarEmocion.tsx

components/ejercicios/grupo1/nivel3/
  QueNecesito.tsx
  ComoLoDigo.tsx
  AQuienLePido.tsx

Modificar:
  app/ejercicios/grupo1/nivel/[nivel].tsx
  → casos 2 y 3: reemplazar componentes anteriores
    por los nuevos, mantener casos 1, 4 y 5 intactos

hooks/useEjerciciosG1.ts
  → agregar al estado:
  emocionesRegistradas: string[]
  ayudasRegistradas: { situacion: string, persona: string }[]
  estrellasPorEjercicio: Record<string, 0|1|2|3>
    (clave: "nivel-ejercicio", ej: "2-E1", "2-E2")

---

## SISTEMA DE ESTRELLAS POR EJERCICIO

Antes: estrellas por nivel completo.
Ahora: estrellas por ejercicio individual (E1, E2, E3).

Lógica de estrellas por ejercicio:
- 0 fallos en las 3 rondas → 3 estrellas
- 1-2 fallos totales → 2 estrellas
- 3+ fallos totales → 1 estrella
- Siempre mínimo 1 estrella al completar

Las 3 estrellas del header del nivel representan
el estado de E1, E2 y E3 respectivamente.

---

## LÍNEA DE CONEXIÓN — UnirEmocion.tsx

Para dibujar la línea entre cara y palabra al unir:
Usar react-native-svg (verificar si ya está instalado).

```typescript
// Calcular posición del centro de cada tarjeta
// con ref + onLayout, luego dibujar:
<Svg style={StyleSheet.absoluteFill}>
  <Line
    x1={fromCenter.x} y1={fromCenter.y}
    x2={toCenter.x}   y2={toCenter.y}
    stroke="#4CAF50"
    strokeWidth={2}
    strokeDasharray="4 2"  // línea punteada animada
  />
</Svg>
```

Si react-native-svg NO está instalado, usar
una View absoluta rotada como alternativa:
calcular ángulo y distancia entre los dos centros
y posicionar la View como línea.

---

## BOTONES DE DEBUG (solo en desarrollo)

Mantener los botones "Simular error" y "Reiniciar"
visibles solo cuando __DEV__ === true.

```typescript
{__DEV__ && (
  <View style={styles.debugRow}>
    <TouchableOpacity onPress={simulateError}
      style={styles.debugBtnError}>
      <Text>Simular error</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={resetEjercicio}
      style={styles.debugBtnReset}>
      <Text>Reiniciar</Text>
    </TouchableOpacity>
  </View>
)}
```

---

## RESTRICCIONES

- NO modificar Niveles 1, 4 y 5 del Grupo 2
- Al fallar: la opción incorrecta hace shake + X roja
  pero NUNCA desaparece — el niño reintenta sobre
  las mismas opciones
- Tabs E1/E2/E3: E2 bloqueado hasta completar E1,
  E3 bloqueado hasta completar E2
- Rondas dentro de cada ejercicio: NO se puede
  saltar ni retroceder, progresión lineal
- El dot de progreso se llena solo al ACERTAR,
  no al intentar
- UnirEmocion: si el niño toca una segunda cara
  sin haber completado el par anterior, deselecciona
  la primera y selecciona la nueva
- AQuienLePido ronda 3: registrar cuál de las 2
  respuestas válidas eligió el niño en el historial