# Guía Estratégica para el Diseño de Interfaces Dirigidas a Niños con TEA

Esta guía establece los fundamentos neuropsicológicos y las directrices de Diseño de Interacción (IxD) necesarios para el desarrollo de herramientas digitales de Comunicación Aumentativa y Alternativa (CAA), tomando como eje técnico el modelo del aplicativo Comunitea.


--------------------------------------------------------------------------------


1. Marco Psicológico y Clínico del Usuario

El Trastorno del Espectro Autista (TEA) es una condición de vida que impacta la interacción social, el lenguaje, la conducta y la integración sensorial. Como especialistas, debemos diseñar para un perfil cognitivo con necesidades específicas de procesamiento.

Cifras de Prevalencia ( Ground Truth)

* OMS: 1 de cada 160 niños a nivel global.
* Autism Speaks (2016): 1 de cada 115 niños.

Perfil Cognitivo y Procesamiento de Información

El procesamiento de información en el TEA se caracteriza por una atención selectiva extrema hacia detalles específicos, con una marcada dificultad para la integración global (coherencia central débil).

* Implicación IxD: La interfaz debe evitar elementos periféricos distractores. La jerarquía visual debe ser absoluta para compensar la dificultad de percibir el "todo".

Desafíos en Comunicación Social y Neuropsicología

El usuario presenta fallos en la pragmática y la comprensión de mensajes implícitos. Clínicamente, se observa a menudo un pobre contacto ocular y movimientos motores estereotipados.

* Recomendaciones de Diseño:
  * Lenguaje: Directo, concreto y desprovisto de metáforas.
  * UX Táctil: Implementar áreas de interacción (touch targets) amplias para acomodar estereotipias motoras y asegurar el éxito del input.
  * Pragmática: En usuarios de Nivel 1, el sistema debe modelar el respeto de turnos (turn-taking) para fortalecer la competencia social.

Regulación Conductual y Estructuras

La rigidez cognitiva exige estructuras claras y secuencias predecibles. La imprevisibilidad en la interfaz genera angustia y desregulación.


--------------------------------------------------------------------------------


2. Procesamiento Sensorial y Entorno Digital

El Desorden Sensorial

La hipersensibilidad a estímulos visuales y auditivos es un factor crítico. El diseño debe prevenir la "inundación sensorial" (sensory flooding).

Directrices de Diseño Visual (Comandos Activos)

* Reducción de Carga Cognitiva: Eliminar cualquier elemento decorativo que no cumpla una función comunicativa.
* Paleta de Colores Muted: Utilizar tonos suaves y evitar contrastes lumínicos agresivos.
* Interfaz V-Enfórica (Visualmente Simple): Priorizar el espacio en blanco y la organización lineal.
* Feedback Auditivo Controlado: Sonidos breves y no estridentes para el refuerzo.


--------------------------------------------------------------------------------


3. Fundamentos de la Comunicación Aumentativa y Alternativa (CAA)

Siguiendo a Beukelman y Mirenda, la CAA agrupa estrategias para sustituir o apoyar el lenguaje oral. Desde la perspectiva de IxD, las soluciones digitales (Alta Tecnología) ofrecen un menor costo de interacción y una autonomía superior gracias al feedback auditivo inmediato.

Tipología de Sistemas de CAA

Tipo de Sistema	Características Clínicas	Ejemplos
No asistidos	Requieren solo el cuerpo; alta carga motora/memoria.	Gestos, señas, expresiones.
Baja tecnología	Soportes físicos; limitados por el espacio físico.	Tableros físicos, tarjetas.
Alta tecnología	Dispositivos/Software; permiten autonomía y voz sintética.	Comunitea, comunicadores digitales.


--------------------------------------------------------------------------------


4. Integración del Sistema PECS (Intercambio de Imágenes)

Desarrollado por Andy Bondy y Lori Frost bajo principios del Análisis Conductual Aplicado (ABA), el sistema PECS evoluciona de la comunicación funcional básica a la comunicación social compleja.

Progresión de las 6 Fases en la Interfaz Digital

1. Fase 1 (Intercambio Físico): El niño toca un pictograma y la app emite una respuesta inmediata (Refuerzo contingente).
2. Fase 2 (Espontaneidad): El niño busca pictogramas dentro de categorías; se fomenta la iniciativa comunicativa.
3. Fase 3 (Discriminación): Elección entre múltiples estímulos (ej. jugo vs. galleta). La interfaz debe validar la selección correcta.
4. Fase 4 (Construcción de frases): Uso obligatorio de la Tira de frase. Estructura: "Yo quiero + [Objeto]".
5. Fase 5 (Responder preguntas): La app genera una Pregunta guiada con audio (ej. "¿Qué quieres?") y el usuario debe responder usando la tira de frase.
6. Fase 6 (Comentarios espontáneos): Hito de comunicación social. El niño expresa estados internos o ideas ("Veo un avión", "Me gusta").


--------------------------------------------------------------------------------


5. Adaptación por Niveles de Apoyo (Matriz de Personalización)

Variable	Nivel 1 (Leve)	Nivel 2 (Moderado)	Nivel 3 (Severo)
Comunicación Social	Problemas pragmáticos y de turnos.	Comunicación limitada; Ecolalia frecuente.	Comunicación mínima o inexistente.
Conductas	Rigidez cognitiva leve.	Resistencia clara al cambio.	Alta inflexibilidad; conductas desafiantes.
Autonomía/Apoyo	Relativamente independiente.	Requiere guía constante.	Alta dependencia.
Diseño Adaptativo	Más opciones y personalización.	Guía estructurada y menús fijos.	CAA Intensivo; interfaz ultra-simplificada.


--------------------------------------------------------------------------------


6. Arquitectura Funcional del Aplicativo: Caso Comunitea

Para un desarrollo robusto, se deben cumplir los cinco pilares de análisis: Finalidad (resolver brecha comunicativa), Usuarios (niño, familia, terapeuta), Contextos (hogar, escuela), Interacción (intercambio digital) y Funciones (seguimiento y construcción).

Componentes Esenciales de la Interfaz (UI Mockup)

Basado en las sugerencias de diseño clínico, la pantalla principal debe integrar:

* Pregunta guiada con audio: Un prompt visual y auditivo central que inquiere "¿Qué quieres?".
* Menú por categorías: Iconos limpios para "Comida", "Juegos" y "Personas".
* Constructor de Frases (Tira de frase): Área de ensamblaje con la secuencia lógica: [Imagen Yo] + [Imagen quiero] + [Imagen objeto].
* Refuerzo Auditivo Inmediato: Al pulsar el botón "Hablar", la app debe vocalizar la frase completa.
* Interfaz V-Enfórica: Estética clara, ordenada y visualmente simple.
* Barra de Navegación Estándar: Acceso directo mediante iconos a: Inicio (Home), Frases, Comentarios y el icono de Estrella (Progreso/Logros).
* Sistema de Gamificación: Uso de "Refuerzo positivo contingente" mediante una barra de progreso y recompensas (estrellas) para incentivar el uso funcional.


--------------------------------------------------------------------------------


7. Conclusiones para el Desarrollador

El éxito de una interfaz para TEA no radica en su complejidad estética, sino en su capacidad para reducir la frustración del usuario. La comunicación debe ser funcional antes que gramaticalmente perfecta. El objetivo es transitar desde una interacción básica de necesidad hacia una interacción social significativa, modulando siempre la carga cognitiva según el nivel de apoyo requerido.
