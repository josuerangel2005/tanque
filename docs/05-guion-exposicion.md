# Guion de exposición — Taller 3, tanque de agua

Guion para la exposición de 10 minutos, basado en `entrega/diapositivas_tanque.pptx` (13 diapositivas). El texto está escrito para decirse en voz alta; no hace falta memorizarlo palabra por palabra, pero sí respetar las ideas y los tiempos.

## Reparto

| Expositor | Diapositivas | Tema | Tiempo |
|-----|---|------------|--|
| Kevin Medina | 1 a 4 | Presentación del equipo, objetivo, modelo y decisiones | 2:55 |
| Josué Rangel | 5 a 8 | Parte (a): linealización, Simulink y comparación | 3:30 |
| Cristian Camargo | 9 a 13 | Parte (b): superagente de IA, ingeniería inversa, simulador y cierre | 3:25 |

Tiempo total: 9:50. Quedan diez segundos de margen, así que hay que evitar improvisar explicaciones largas.

## Guion

### Diapositiva 1 — Portada · Kevin · 0:30

Buenos días. Somos el equipo conformado por Cristian Camargo, Josué Rangel y yo, Kevin Medina.

Vamos a presentar el Trabajo 3: el modelado y la simulación de un tanque de distribución de agua. Lo resolvimos por dos caminos: primero en Simulink, y después con un simulador web generado con un superagente de inteligencia artificial.

Yo presento el modelo y las decisiones que tomamos, Josué explica la simulación en Simulink y Cristian la parte de inteligencia artificial.

### Diapositiva 2 — Qué pide el trabajo · Kevin · 0:35

El objetivo es modelar, simular y analizar el tanque por dos caminos y comparar los resultados.

La parte (a) pide simular la ecuación diferencial en Simulink, obtener la función de transferencia H(s), obtener h(t) por transformada inversa y comparar las tres respuestas.

La parte (b) pide generar un simulador con un superagente de IA, hacerle ingeniería inversa y documentar todo el proceso, incluidos los prompts.

Los entregables son el informe y las diapositivas en un solo PDF, y un enlace para ejecutar el simulador.

### Diapositiva 3 — Modelo matemático del proceso · Kevin · 0:50

El proceso es un tanque con un caudal de entrada por arriba y una salida por una válvula en el fondo.

El modelo sale de dos principios. El balance de masa dice que lo que se acumula es lo que entra menos lo que sale. Y la ley de Torricelli dice que el caudal de salida es proporcional a la raíz cuadrada del nivel.

Al combinarlos se obtiene la ecuación diez del enunciado: la derivada del nivel es el caudal de entrada sobre el área, menos K sobre el área por la raíz del nivel.

Los parámetros son un área de diez metros cuadrados, K igual a 4.47 y un equilibrio de cinco metros con diez metros cúbicos por hora.

Lo importante es que el modelo es no lineal, por la raíz del nivel. Eso condiciona todo lo que sigue.

### Diapositiva 4 — Decisiones sobre el enunciado · Kevin · 1:00

Antes de simular revisamos el enunciado y encontramos puntos que requerían una decisión.

Primero, la ecuación cinco imprime la derivada del volumen donde corresponde la derivada del nivel; usamos la forma correcta. Segundo, las unidades: trabajamos el tiempo en horas, porque los caudales están en metros cúbicos por hora. Tercero, el enunciado no da condiciones de simulación, así que fijamos un nivel inicial de cinco metros y un escalón de diez a doce metros cúbicos por hora. Y cuarto, limitamos el nivel entre cero y la altura del tanque.

La decisión más importante es la constante de tiempo. El enunciado dice un minuto, pero con el área, K y el nivel de equilibrio que da el mismo enunciado, la constante de tiempo resulta de diez horas. Para que fuera un minuto, el caudal de equilibrio tendría que ser de seis mil metros cúbicos por hora, y no de diez. Por eso trabajamos con diez horas.

Ahora Josué explica cómo obtuvimos la función de transferencia.

### Diapositiva 5 — Linealización y función de transferencia · Josué · 1:00

Gracias, Kevin. La transformada de Laplace solo se aplica a ecuaciones lineales, y nuestro modelo no lo es. Por eso hay que linealizarlo.

Tomamos el punto de operación del enunciado, cinco metros y diez metros cúbicos por hora. Aproximamos la raíz del nivel con una serie de Taylor de primer orden alrededor de ese punto. Después definimos variables de desviación, es decir, cuánto se aleja el nivel y el caudal de su valor de equilibrio. Con eso la ecuación queda lineal y se puede aplicar Laplace.

El resultado es la función de transferencia H(s) igual a 0.1 sobre s más 0.1. Es un sistema de primer orden, con ganancia de un metro por cada metro cúbico por hora y constante de tiempo de diez horas.

Para el escalón de dos metros cúbicos por hora, la transformada inversa da h(t) igual a cinco más dos por uno menos e a la menos 0.1 t. Según el modelo lineal, el nivel tiende a siete metros.

### Diapositiva 6 — Simulación en Simulink · Josué · 0:50

Este es el diagrama de bloques. El mismo escalón de entrada alimenta dos ramas.

La rama superior es la ecuación diferencial no lineal: un sumador calcula lo que entra menos lo que sale, la ganancia uno sobre A lo convierte en la derivada del nivel, y el integrador entrega el nivel partiendo de cinco metros. El nivel se realimenta pasando por la raíz cuadrada y por K.

La rama inferior es la función de transferencia. Como trabaja con desviaciones, al escalón se le restan los diez de equilibrio, y a la salida se le suman los cinco metros.

Simulamos de cero a cincuenta horas, que son cinco constantes de tiempo.

### Diapositiva 7 — Tres respuestas, dos comportamientos · Josué · 0:45

Aquí están las respuestas. A la izquierda, el Scope de Simulink: la curva amarilla es la ecuación no lineal y la azul es la función de transferencia. A la derecha, la respuesta analítica graficada en MATLAB.

Hay tres respuestas, pero solo dos comportamientos. La función de transferencia y la respuesta analítica coinciden, porque son el mismo modelo lineal escrito de dos formas. Eso confirma que la transformada inversa está bien calculada.

La no lineal, en cambio, arranca igual que las otras y se va separando a medida que el nivel sube.

### Diapositiva 8 — Dónde falla el modelo lineal · Josué · 0:55

La tabla cuantifica esa diferencia. En las primeras horas es de milímetros, porque el nivel todavía está cerca de cinco metros, donde la aproximación lineal es válida.

Al final, el modelo no lineal llega a 7.21 metros y el lineal a siete. La diferencia es de 21 centímetros, cerca del tres por ciento del nivel final.

La razón es física: al subir el nivel, la válvula opone más resistencia, de modo que el tanque necesita más altura para evacuar los doce metros cúbicos por hora. El modelo lineal supone una resistencia fija, la de cinco metros, y por eso subestima el nivel final y también lo lento que es el proceso.

En resumen, H(s) sirve para perturbaciones pequeñas alrededor del punto de operación. Cristian continúa con la parte (b).

### Diapositiva 9 — Simulación con superagente de IA · Cristian · 0:50

Gracias, Josué. Para la parte (b) seguimos seis pasos: análisis, contraste, prompt, generación, validación y despliegue.

Usamos Claude para analizar el enunciado y planear el trabajo, v0 para generar el programa, un agente local de programación para integrarlo, validarlo y corregirlo, y Vercel para publicarlo.

Lo más importante es que el simulador se generó con un solo prompt. Y funcionó a la primera porque ese prompt ya llevaba las decisiones tomadas: las unidades, el punto de operación, las condiciones iniciales y los límites. Si le hubiéramos pasado el enunciado tal cual, el agente habría tenido que adivinar, por ejemplo, la constante de tiempo.

En el informe están documentados los dieciocho prompts significativos.

### Diapositiva 10 — Ingeniería inversa del simulador · Cristian · 0:55

Después analizamos el código generado para entender qué hizo el agente.

En arquitectura, es una aplicación de Next.js, React y TypeScript, sin servidor: todo el cálculo ocurre en el navegador, y está separado de la interfaz en un solo archivo.

En el método numérico, usa Runge-Kutta de cuarto orden por defecto, o Euler, con un paso fijo de 0.05 horas, que son tres minutos. Resuelve toda la simulación primero y después la reproduce de forma animada.

Calcula tres curvas: la no lineal, la lineal integrada numéricamente y la analítica con la fórmula cerrada. Que estas dos últimas coincidan verifica que el integrador funciona.

Comparamos el código con la teoría línea por línea y coincide. Encontramos dos observaciones: una variable llamada coeficiente de descarga que en realidad guarda K, y que el punto de operación está fijo en cinco metros.

### Diapositiva 11 — Programa de simulación · Cristian · 0:45

El simulador está publicado en este enlace y se ejecuta desde el navegador, sin instalar nada.

El uso es sencillo: se ajustan los parámetros, se elige el método, se ejecuta y se comparan las tres curvas.

Muestra el tanque con el nivel animado, la gráfica, las ecuaciones con sus supuestos y una insignia de verificación: con un caudal de diez, el nivel debe converger a cinco metros.

Con los valores por defecto reproduce lo que obtuvimos en Simulink: 7.21 metros para el modelo no lineal y siete para el lineal.

*(Si hay tiempo y conexión, abrir el enlace y ejecutar una vez. Si no, seguir de largo.)*

### Diapositiva 12 — Conclusiones · Cristian · 0:45

Para cerrar, cinco conclusiones.

Uno: el modelo es correcto y consistente con el equilibrio del enunciado.

Dos: la función de transferencia es de primer orden, con constante de tiempo de diez horas y no de un minuto.

Tres: el modelo lineal sirve cerca de cinco metros; lejos se queda corto, siete metros frente a 7.21.

Cuatro: el superagente acertó con un solo prompt porque el análisis ya estaba hecho. La herramienta no reemplazó el análisis; lo ejecutó.

Y cinco: la ingeniería inversa confirmó que el código implementa la teoría.

### Diapositiva 13 — Cierre · Cristian · 0:10

Muchas gracias. Quedamos atentos a sus preguntas.

## Preguntas probables

| Pregunta | Respuesta corta | Responde |
|---------|------------------|---|
| ¿Por qué no usaron la constante de tiempo de 1 min? | Porque no es un dato independiente: la fijan A, K y el nivel de equilibrio, y con los valores del enunciado da 10 h. Con 1 min el caudal de equilibrio sería de 6000 m³/h en lugar de 10. | Kevin |
| ¿Por qué el tiempo está en horas? | Porque los caudales están en m³/h. Con otra unidad habría que convertir K y los caudales. | Kevin |
| ¿Por qué la función de transferencia no coincide con la ecuación diferencial? | Porque H(s) es una aproximación lineal válida cerca de 5 m. Al subir el nivel, la raíz se aleja de la recta que la aproxima. | Josué |
| ¿Por qué el modelo no lineal no llega a 7.21 m en 50 h? | Porque su constante de tiempo local crece con el nivel, de 10 h a unas 12 h; a las 50 h va en 7.175 m. | Josué |
| ¿Qué método numérico usa el simulador y por qué? | RK4 con paso fijo de 0.05 h; es más preciso que Euler para el mismo paso. Euler queda disponible para comparar. | Cristian |
| ¿Cómo saben que el código generado es correcto? | Por tres verificaciones: revisión línea por línea contra la teoría, coincidencia de las curvas lineal y analítica, y coincidencia con Simulink (7.21 m y 7.00 m). | Cristian |
| ¿Qué hizo cada herramienta de IA? | Claude analizó y planeó, v0 generó el programa, el agente local integró, validó y corrigió, y Vercel lo publicó. | Cristian |
