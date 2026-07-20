A continuación tienes un **resumen integral, técnico y aplicado** de las dos sesiones. Está organizado no solo como síntesis conceptual, sino como **marco operativo directo para diseño y desarrollo** del aplicativo **Comunitea**, alineando psicología clínica del TEA + CAA + PECS → decisiones concretas de UX, interacción y arquitectura funcional.

---

## 1) Propósito central de Comunitea

Comunitea no es “una app de pictogramas”.

Es un **sistema digital de comunicación funcional** diseñado específicamente para **niños con Trastorno del Espectro Autista (TEA)** que:

* Mejora la comunicación social
* Reduce frustración conductual
* Aumenta autonomía
* Facilita interacción en casa, escuela y terapia
* Traduce principios psicológicos y clínicos en interacción digital

Su diseño **debe partir del funcionamiento cognitivo del niño con TEA**, no de criterios tradicionales de UX.



---

## 2) Marco psicológico que gobierna TODO el diseño

El punto clave de la Sesión 1 es este:

> Si la app no respeta cómo procesa información un niño con TEA, la app fracasa.

### Características cognitivas críticas del usuario TEA

| Característica                          | Qué significa                               | Implicación directa en diseño                               |
| --------------------------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| Procesamiento centrado en detalles      | Dificultad para integrar información global | Pantallas simples, sin saturación, jerarquía visual extrema |
| Dificultades en comunicación pragmática | No comprenden mensajes implícitos           | Lenguaje literal, concreto, directo                         |
| Necesidad de estructura y rutina        | Resistencia a cambios                       | Navegación predecible, siempre igual                        |
| Sensibilidad sensorial                  | Hipersensibilidad visual/auditiva           | Sin animaciones innecesarias, sin sonidos abruptos          |
| Dificultad ante cambios inesperados     | Ansiedad ante variaciones                   | Estructura visual estable y repetitiva                      |

**Regla fundamental**:

> Menos estímulo = más comprensión = más comunicación.



---

## 3) Principios obligatorios de interfaz (no negociables)

Derivados directamente del perfil TEA:

* Organización visual jerárquica y clara
* Información presentada por partes
* Navegación simple, corta y repetitiva
* Secuencias de interacción siempre iguales
* Reducción extrema de carga cognitiva
* Uso intensivo de apoyos visuales (pictogramas)
* Cero elementos decorativos innecesarios

Estos principios no son “buenas prácticas UX”.
Son **requisitos clínicos**.



---

## 4) Qué es la CAA y por qué Comunitea existe gracias a ella

La **Comunicación Aumentativa y Alternativa (CAA)** es el marco teórico que permite que personas sin lenguaje verbal funcional puedan comunicarse.

Incluye:

* Gestos
* Pictogramas
* Tableros
* Apps digitales (aquí entra Comunitea)

Objetivos de la CAA:

* Expresar necesidades
* Comunicar emociones
* Tomar decisiones
* Iniciar interacción social

Impactos clínicos probados:

* Reduce frustración
* Mejora autonomía
* Favorece inclusión social



---

## 5) PECS: el modelo que define la progresión dentro de la app

El Sistema **PECS (Picture Exchange Communication System)** es el modelo conductual que debe definir la **progresión del usuario dentro de Comunitea**.

No es solo usar pictogramas.
Es seguir la **secuencia de aprendizaje comunicativo**.

### Las 6 fases PECS → traducidas a funcionalidades digitales

| Fase PECS                        | Qué aprende el niño         | Cómo se traduce en Comunitea           |
| -------------------------------- | --------------------------- | -------------------------------------- |
| Fase 1 – Intercambio             | Comunicar produce resultado | Toca pictograma → respuesta inmediata  |
| Fase 2 – Espontaneidad           | Iniciar comunicación        | El niño navega categorías y elige      |
| Fase 3 – Discriminación          | Elegir correctamente        | Múltiples pictogramas para seleccionar |
| Fase 4 – Construcción de frases  | Estructura del lenguaje     | “Yo quiero + objeto” combinando pictos |
| Fase 5 – Responder preguntas     | Interacción bidireccional   | La app pregunta y el niño responde     |
| Fase 6 – Comentarios espontáneos | Comunicación social         | “Veo…”, “Me gusta…” sin pedir nada     |

**Idea clave**:
Comunitea debe guiar al niño desde **pedir cosas → comunicarse socialmente**.



---

## 6) Principio más importante de CAA/PECS aplicado

> La comunicación debe ser funcional, no solo estructurada.

Esto significa:

* No es que el niño “complete ejercicios”
* Es que el niño logre comunicar algo real que produzca un efecto real

Ejemplo real:

* Selecciona “agua” → recibe agua

La app debe estar pensada para **contextos reales**: casa, escuela, terapia.



---

## 7) Diseño adaptativo según nivel TEA (clave para arquitectura)

La app no puede ser igual para todos.

| Nivel TEA        | Diseño requerido                               |
| ---------------- | ---------------------------------------------- |
| TEA 1 (leve)     | Más opciones, mayor autonomía, menos guía      |
| TEA 2 (moderado) | Estructura clara, guía constante               |
| TEA 3 (severo)   | Interfaz extremadamente simple + CAA intensivo |

Esto implica que Comunitea necesita:

* Configuración por nivel
* Modulación de apoyos
* Complejidad progresiva



---

## 8) Cómo se ve el flujo real dentro de Comunitea

Progresión natural del usuario:

1. Tocar pictograma
2. Elegir entre opciones
3. Buscar dentro de categorías
4. Construir frases
5. Responder preguntas
6. Comentar espontáneamente

Eso es exactamente la progresión PECS digitalizada.



---

## 9) Reglas críticas de interacción

* Siempre la misma estructura visual
* Siempre el mismo patrón de navegación
* Refuerzo inmediato tras cada selección
* Sin sobreestimulación visual
* Sin cambios bruscos de pantalla
* Pictogramas como lenguaje principal, texto como apoyo

---

## 10) Resultado final esperado de Comunitea

Si se respetan estos principios, Comunitea logra:

* Comunicación funcional real
* Menos conductas disruptivas
* Mayor autonomía del niño
* Mejor interacción con padres, docentes y terapeutas
* Transición de comunicación básica → comunicación social

---

## 11) En una sola frase

**Comunitea es la digitalización del modelo CAA + PECS, diseñada estrictamente según el perfil cognitivo del niño con TEA, para desarrollar comunicación funcional progresiva en contextos reales.**
