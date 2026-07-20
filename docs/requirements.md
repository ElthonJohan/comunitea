# Requisitos del sistema — ComuniTEA

> Generado el 31/03/2026. Fuente: doc1.md (visión de producto) y doc2.md (marco clínico-funcional).

---

## Requisitos funcionales (RF)

### RF-01 · Configuración de perfil

| ID | Descripción |
|---|---|
| RF-01.1 | El sistema debe solicitar el rol del configurador al iniciar el perfil (padre/tutor, terapeuta, psicólogo, docente). |
| RF-01.2 | El formulario de perfil debe adaptar su terminología y complejidad según el rol seleccionado: versión cotidiana para padres, versión clínica para profesionales. |
| RF-01.3 | Se deben registrar los datos básicos del niño: nombre/apodo, fecha de nacimiento, foto de perfil (opcional) y género (campo abierto). |
| RF-01.4 | El sistema debe permitir indicar el nivel de TEA según DSM-5 (Nivel 1, 2 o 3), con descripciones funcionales en lenguaje accesible en lugar de etiquetas numéricas solas. |
| RF-01.5 | Si no hay diagnóstico formal, el sistema debe permitir seleccionar un perfil funcional descriptivo como punto de partida. |
| RF-01.6 | Se debe registrar el perfil de comunicación actual del niño (ausencia de lenguaje, palabras aisladas, frases simples). |
| RF-01.7 | Se deben registrar los entornos de uso (hogar, escuela, consulta terapéutica). |
| RF-01.8 | Se deben registrar las actividades preferidas del niño para poblar el vocabulario inicial con categorías relevantes. |
| RF-01.9 | Se deben registrar las personas importantes del entorno del niño como posibles pictogramas personalizados. |
| RF-01.10 | Se debe registrar si el niño tiene sensibilidad a sonidos fuertes; el sistema debe ajustar volumen y tipo de efectos de sonido en consecuencia. |
| RF-01.11 | La configuración completa de perfil debe realizarse una sola vez; debe haber separación clara entre configuración inicial obligatoria y configuración ampliada opcional. |

---

### RF-02 · Interfaz de comunicación principal

| ID | Descripción |
|---|---|
| RF-02.1 | La pantalla principal debe operar en modo horizontal (landscape). |
| RF-02.2 | La pantalla debe dividirse en dos zonas: tira de comunicación (≈20% superior) y área de vocabulario activo (≈80% restante). |
| RF-02.3 | Al seleccionar un pictograma del área de vocabulario, este debe añadirse a la tira de comunicación en orden. |
| RF-02.4 | La tira de comunicación debe incluir un botón de reproducción, un botón de borrar el último pictograma, y un botón de limpiar toda la tira. |
| RF-02.5 | Al presionar reproducir, el sistema debe leer en voz alta la frase construida con voz natural. |
| RF-02.6 | El área de vocabulario debe organizarse por intenciones comunicativas: Quiero, Siento, Hago, Veo, No quiero. |
| RF-02.7 | Al seleccionar una categoría de intención, deben mostrarse los pictogramas correspondientes con un máximo de 6 por pantalla. |
| RF-02.8 | Cada pictograma debe reproducir su sonido inmediatamente al ser seleccionado. |
| RF-02.9 | El padre debe poder configurar manualmente qué pictogramas aparecen dentro de cada categoría (versión beta). |

---

### RF-03 · Modo comunicación libre

| ID | Descripción |
|---|---|
| RF-03.1 | El modo comunicación libre debe ser el punto de partida por defecto de la experiencia del niño; no debe presentar presión, calificación ni tiempo límite. |
| RF-03.2 | El niño debe poder navegar por todas las categorías de intenciones comunicativas y construir frases a su ritmo. |
| RF-03.3 | El padre debe tener acceso a un registro simple de uso al finalizar la sesión: qué pictogramas se seleccionaron y cuántas veces (versión beta, sin análisis automático). |

---

### RF-04 · Modo actividad guiada

| ID | Descripción |
|---|---|
| RF-04.1 | El padre o terapeuta debe poder preparar una secuencia o actividad desde el panel de configuración antes de la sesión. |
| RF-04.2 | Los tipos de actividad disponibles deben incluir: rutina visual, pregunta simple con respuesta por pictograma, y práctica de vocabulario temático. |
| RF-04.3 | El niño debe ver la propuesta en pantalla y responder con pictogramas; no debe haber calificación ni consecuencia ante respuestas distintas a las esperadas. |
| RF-04.4 | Todo intento comunicativo del niño debe ser reconocido por el sistema con refuerzo visual y auditivo, independientemente de si coincide con la respuesta esperada. |

---

### RF-05 · Modo juego — sistema de sub-niveles

| ID | Descripción |
|---|---|
| RF-05.1 | El modo juego debe activarse únicamente si el padre lo habilita desde la configuración. |
| RF-05.2 | El sistema debe implementar 5 sub-niveles alineados con las fases del PECS. |
| RF-05.3 | **Sub-nivel 1:** 2 opciones por reto; vocabulario de necesidades concretas (agua, comida, baño). Criterio de avance: 8/10 aciertos en 2 sesiones consecutivas. |
| RF-05.4 | **Sub-nivel 2:** 3 opciones por reto; incluye emociones además de necesidades. Mismo criterio de avance. |
| RF-05.5 | **Sub-nivel 3:** 4 opciones por reto; combina emociones, acciones y comentarios. Incorpora las intenciones "Veo" y "Hago". |
| RF-05.6 | **Sub-nivel 4:** El reto consiste en construir una respuesta con 2 pictogramas en la tira de comunicación (equivalente a Fase 4 del PECS). |
| RF-05.7 | **Sub-nivel 5:** Situaciones abiertas donde el niño construye frases de 2-3 pictogramas de forma espontánea, eligiendo también la intención comunicativa. |
| RF-05.8 | Al completar un sub-nivel por primera vez debe mostrarse una animación de celebración diferenciada del feedback de acierto normal (confeti, música, mensaje de logro). La intensidad de esta celebración debe ser configurable por los padres. |
| RF-05.9 | El sistema no debe retroceder de sub-nivel automáticamente; si el rendimiento baja, debe mantener el nivel actual y notificar al padre en el resumen de sesión. |
| RF-05.10 | El padre debe poder avanzar o retroceder el sub-nivel manualmente. |
| RF-05.11 | Cada reto debe incluir una barra de tiempo representada como franja de color (verde a amarillo, sin números). |
| RF-05.12 | Ante un error, el sistema debe mostrar: borde de color distinto en la opción tocada, sonido neutro, e iluminación de la respuesta correcta durante 2 segundos. No deben mostrarse mensajes de "incorrecto" ni contadores de errores al niño. |
| RF-05.13 | Al final de cada sesión el padre debe ver un resumen con: sub-nivel actual, retos presentados, aciertos y proximidad al siguiente sub-nivel. El resumen no debe mostrarse al niño. |

---

### RF-06 · Panel de configuración parental

| ID | Descripción |
|---|---|
| RF-06.1 | El padre debe poder acceder a un panel de configuración protegido (no accesible desde la interfaz del niño). |
| RF-06.2 | Desde el panel se debe poder activar o desactivar el modo juego. |
| RF-06.3 | Desde el panel se debe poder gestionar el vocabulario activo por categoría. |
| RF-06.4 | Desde el panel se debe poder configurar ajustes de accesibilidad sensorial (volumen, tipo de efectos, intensidad de animaciones). |
| RF-06.5 | El panel debe definir claramente quién puede modificar configuraciones y qué cambios pueden hacer los distintos roles (padre, terapeuta, otro). |

---

### RF-07 · Reportes y seguimiento (Fase Beta)

| ID | Descripción |
|---|---|
| RF-07.1 | El sistema debe registrar por sesión: frecuencia de uso por pictograma, intenciones comunicativas utilizadas, y tiempo total de sesión. |
| RF-07.2 | El padre debe poder acceder a un resumen de sesión simple con los datos del RF-07.1. |
| RF-07.3 | En el modo juego, el resumen debe incluir sub-nivel actual, retos presentados, aciertos y proyección de avance. |

---

### RF-08 · Motor de IA — adaptación y personalización (Fase 2)

| ID | Descripción |
|---|---|
| RF-08.1 | El motor de IA debe registrar: frecuencia y momento de uso de cada pictograma, latencia de respuesta, longitud de frases construidas, categorías de acierto/error en modo juego, e intenciones comunicativas dominantes. |
| RF-08.2 | La IA debe reordenar automáticamente los pictogramas dentro de cada categoría, priorizando los de mayor frecuencia de uso. |
| RF-08.3 | La IA debe sugerir nuevos pictogramas relacionados con los que el niño ya domina. |
| RF-08.4 | Si el niño no utiliza una categoría entera durante varias sesiones, la IA debe notificarlo al padre con una sugerencia de actividad para trabajar esa intención comunicativa. |
| RF-08.5 | La IA debe detectar cuándo el niño está construyendo frases de 2 pictogramas de forma consistente y sugerir habilitar frases más largas en la tira. |
| RF-08.6 | La IA debe gestionar el avance de sub-nivel en modo juego de forma automática al cumplirse el criterio (8/10 en 2 sesiones consecutivas), sin intervención del padre. |
| RF-08.7 | La IA debe ajustar la dificultad dentro de cada sub-nivel de forma continua: si el rendimiento baja, debe reducir la complejidad sin cambiar de sub-nivel. |
| RF-08.8 | En sub-niveles avanzados, la IA debe diversificar el tipo de retos (escenas con elemento faltante, secuencias de rutina incompletas). |

---

### RF-09 · Reportes avanzados (Fase 2)

| ID | Descripción |
|---|---|
| RF-09.1 | Después de cada sesión se debe generar un reporte automático que incluya: vocabulario más utilizado y comparación histórica, intenciones comunicativas usadas (Quiero vs. Siento vs. Veo), categorías consolidadas vs. categorías con dificultad, tiempo promedio de respuesta, y progreso en modo juego semana a semana. |
| RF-09.2 | El reporte debe incluir sugerencias generadas por la IA basadas en los patrones detectados. |
| RF-09.3 | El reporte debe poder compartirse con el terapeuta y descargarse en formato PDF. |

---

## Requisitos no funcionales (RNF)

### RNF-01 · Accesibilidad y diseño UI/UX

| ID | Descripción |
|---|---|
| RNF-01.1 | La interfaz debe seguir el principio de predictibilidad estructural: patrones repetitivos, navegación sin cambios abruptos y secuencias de interacción estables (seleccionar → confirmar → comunicar). |
| RNF-01.2 | La pantalla no debe mostrar más de 6 elementos seleccionables a la vez. |
| RNF-01.3 | La interfaz no debe incluir estímulos visuales o auditivos irrelevantes para la tarea actual. |
| RNF-01.4 | Todos los elementos interactivos deben tener áreas de toque amplias y bien definidas. |
| RNF-01.5 | Todo feedback debe ser inmediato: visual y auditivo simultáneamente, sin demora perceptible. |
| RNF-01.6 | La navegación no debe requerir más de 2 niveles de profundidad desde la pantalla principal para acceder a cualquier función del niño. |
| RNF-01.7 | La interfaz debe usar alto contraste e iconografía clara; no debe depender solo del color para transmitir información. |
| RNF-01.8 | Los elementos de celebración (confeti, música, animaciones) deben ser configurables en intensidad para adaptarse a sensibilidades sensoriales individuales. |
| RNF-01.9 | El sistema no debe mostrar al niño mensajes de error en lenguaje textual; los errores deben comunicarse solo mediante señales visuales neutras y sonidos no estridentes. |

---

### RNF-02 · Adaptación contextual

| ID | Descripción |
|---|---|
| RNF-02.1 | El sistema debe soportar la contextualización por entorno: hogar, escuela y terapia deben poder tener configuraciones de vocabulario distintas. |
| RNF-02.2 | El motor de adaptación debe considerar contexto temporal (hora del día, rutinas recurrentes) además del historial de selección. |
| RNF-02.3 | Los cambios automáticos en la interfaz del niño (reordenamiento de pictogramas, cambio de dificultad) no deben alterar la estructura visual general de la pantalla para preservar predictibilidad. |

---

### RNF-03 · Disponibilidad y rendimiento

| ID | Descripción |
|---|---|
| RNF-03.1 | La app debe funcionar en modo offline; todas las funciones del niño deben estar disponibles sin conexión a internet. |
| RNF-03.2 | La reproducción de voz y el feedback auditivo deben iniciarse en menos de 200 ms tras la interacción del usuario. |
| RNF-03.3 | La sincronización de datos entre actores (familia y profesionales) debe realizarse cuando se recupere la conexión, sin pérdida de datos de sesión. |

---

### RNF-04 · Seguridad y privacidad

| ID | Descripción |
|---|---|
| RNF-04.1 | Los datos del niño (perfil, historial de uso, reportes) son información sensible y deben almacenarse y transmitirse de forma cifrada. |
| RNF-04.2 | El acceso al panel de configuración parental debe estar protegido mediante autenticación separada de la interfaz del niño. |
| RNF-04.3 | El sistema debe definir y respetar niveles de visibilidad diferenciados por rol (padre, terapeuta, otro cuidador) sobre los datos del niño. |
| RNF-04.4 | El sistema debe cumplir con la normativa aplicable de protección de datos de menores. |

---

### RNF-05 · Arquitectura

| ID | Descripción |
|---|---|
| RNF-05.1 | La arquitectura debe ser modular: los módulos de comunicación libre, actividad guiada, modo juego e IA deben poder habilitarse o deshabilitarse de forma independiente. |
| RNF-05.2 | La base de datos debe soportar perfiles individuales por usuario con vocabulario, historial y configuración propios. |
| RNF-05.3 | El motor de IA (Fase 2) debe integrarse como un componente adicional sin afectar el funcionamiento de los módulos base. |
| RNF-05.4 | El sistema de reportes debe generar salidas procesables tanto para visualización interna como para exportación (PDF). |

---

### RNF-06 · Coordinación entre actores

| ID | Descripción |
|---|---|
| RNF-06.1 | La app debe soportar múltiples actores (padre, terapeuta, cuidador) con acceso diferenciado al perfil del niño. |
| RNF-06.2 | Los cambios en la configuración del vocabulario o del modo juego deben quedar registrados con el rol que los realizó y la fecha. |
| RNF-06.3 | El sistema debe permitir compartir reportes de sesión con profesionales de forma segura. |

---

## Decisiones de diseño pendientes (no resueltas en los documentos fuente)

| # | Decisión |
|---|---|
| D-01 | ¿Qué elementos de la interfaz del niño nunca pueden cambiar automáticamente (posición, ícono, etc.)? Definir lista de elementos fijos. |
| D-02 | ¿Cuál es el límite máximo de volumen y complejidad visual de los estímulos, independientemente de la configuración del padre? |
| D-03 | ¿Qué datos exactamente se guardan, con qué granularidad, y cuánto tiempo se retienen? |
| D-04 | ¿Cuál es el criterio mínimo de uso para que la IA tenga suficiente historial para activarse en Fase 2? |
| D-05 | ¿Qué métricas de los reportes son accionables clínicamente y cuáles son solo informativas? Priorizar para evitar sobrecarga de datos en los reportes. |
| D-06 | ¿Puede el terapeuta modificar configuraciones directamente, o solo propone cambios que el padre debe aprobar? |
