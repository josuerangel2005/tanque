| | |
|---|---|
| **Trabajo** | Trabajo 3. Modelado y simulación de sistemas continuos |
| **Tema** | Tanque de distribución de agua |
| **Integrantes** | Yenderson Josué Rangel Martínez (1127045112) |
| | Kevin Sebastian Medina Nava (1093294593) |
| | Cristian Julián Camargo García (1093592686) |
| **Simulador** | <https://tanque-six.vercel.app/> |
| **Repositorio** | <https://github.com/josuerangel2005/tanque> |
| **Fecha de entrega** | 9 de octubre de 2026 |

**Contenido**

1. Introducción
2. Modelo matemático del proceso
3. Análisis del enunciado y decisiones tomadas
4. Linealización y función de transferencia
5. Simulación en Simulink
6. Comparación y análisis de las respuestas
7. Simulación con superagente de inteligencia artificial
8. Ingeniería inversa del programa de simulación
9. Programa de simulación
10. Conclusiones
11. Referencias
12. Anexo A. Bitácora de prompts

# Introducción

Este informe documenta el Trabajo 3 de modelado y simulación de sistemas continuos. El proceso estudiado es un tanque de distribución de agua con un caudal de entrada en la parte superior y un caudal de salida por una válvula en la parte inferior. El modelo se obtiene del balance de masa y de la ley de Torricelli, y es no lineal porque el caudal de salida depende de la raíz cuadrada del nivel.

El trabajo tiene dos partes:

- **Parte (a).** Simular en Simulink la ecuación diferencial del proceso, obtener la función de transferencia $H(s)$, obtener $h(t)$ como transformada inversa de $H(s)$, y comparar y analizar las tres respuestas.
- **Parte (b).** Simular el proceso con un superagente de ingeniería de software apoyado en inteligencia artificial, hacer la ingeniería inversa del programa obtenido y documentar todo el proceso, desde los prompts hasta el programa final, con un enlace para ejecutarlo.

El enunciado deja varios puntos sin definir y contiene una inconsistencia entre sus datos. La sección 3 explica cada uno y la decisión que se tomó, de modo que todos los resultados del informe se puedan reproducir.

# Modelo matemático del proceso

La figura 1 muestra el proceso: un tanque de área transversal $A$, con caudal de entrada $Q_i(t)$, nivel $h(t)$ y caudal de salida $Q_o(t)$ a través de una válvula.

![Figura 1. Proceso: tanque de agua (tomada del enunciado).](figura1.png){width=3.3in}

## Balance de masa

La masa de agua dentro del tanque es la densidad por el volumen, y el volumen es el área transversal por la altura del agua:

$$m(t) = \rho\,V(t) \qquad (1)$$

$$V(t) = A\,h(t) \qquad (2)$$

Como el área es constante, la variación del volumen y de la masa son:

$$\frac{dV(t)}{dt} = A\,\frac{dh(t)}{dt} \qquad (3)$$

$$\rho\,\frac{dV(t)}{dt} = \rho\,A\,\frac{dh(t)}{dt} \qquad (4)$$

El balance de masa establece que lo que se acumula es igual a lo que entra menos lo que sale:

$$\rho\,A\,\frac{dh(t)}{dt} = \rho\,\bigl(Q_i(t) - Q_o(t)\bigr) \qquad (5)$$

## Caudal de salida: ley de Torricelli

El caudal de salida por un orificio o válvula en la parte inferior depende de la altura del líquido:

$$Q_o(t) = c\,a\,\sqrt{2\,g\,h(t)} \qquad (6)$$

donde $c$ es el coeficiente de descarga (adimensional, entre 0 y 1), $a$ es el área del orificio de salida y $g$ es la aceleración de la gravedad. Agrupando las constantes:

$$K = c\,a\,\sqrt{2\,g} \qquad (7)$$

$$Q_o(t) = K\,\sqrt{h(t)} \qquad (8)$$

Al sustituir (8) en (5):

$$\rho\,A\,\frac{dh(t)}{dt} = \rho\,Q_i(t) - \rho\,K\,\sqrt{h(t)} \qquad (9)$$

La densidad aparece en todos los términos y se cancela. La ecuación final del proceso es:

$$\frac{dh(t)}{dt} = \frac{Q_i(t)}{A} - \frac{K}{A}\,\sqrt{h(t)} \qquad (10)$$

## Parámetros del enunciado

| Símbolo | Descripción | Valor |
|---|---|---|
| $A$ | Área transversal del tanque | 10 m² |
| $K$ | Coeficiente de la válvula | 4.47 |
| $H$ | Altura máxima del tanque | 10 m |
| $Q_{i,e}$ | Caudal de entrada en equilibrio | 10 m³/h |
| $Q_{o,e}$ | Caudal de salida en equilibrio | 10 m³/h |
| $h_e$ | Altura en equilibrio | 5 m |
| $\tau_p$ | Constante de tiempo del proceso | 1 min |
| $\rho$ | Densidad del líquido | 1 g/cm³ |

# Análisis del enunciado y decisiones tomadas

Antes de simular se verificó cada ecuación y cada dato. Las ecuaciones (1) a (10) son correctas y consistentes entre sí, y el punto de equilibrio cumple el modelo:

$$K\sqrt{h_e} = 4.47\,\sqrt{5} = 9.995 \approx 10\ \mathrm{m^3/h} = Q_{o,e}$$

La tabla siguiente resume los puntos que requirieron una decisión.

| Punto | Qué se encontró | Decisión tomada |
|---|---|---|
| Ecuación (5) | El enunciado imprime $dV/dt$ en el lado izquierdo, donde corresponde $dh/dt$. | Se usa la forma correcta, $\rho A\,dh/dt = \rho(Q_i - Q_o)$, que es la que conduce a la ecuación (10). |
| Unidades | No se declaran las unidades de $K$, y $\rho$ está en g/cm³ mientras los caudales están en m³/h. | El tiempo se trabaja en horas. $K$ se declara en m²·⁵/h para que $K\sqrt{h}$ quede en m³/h. $\rho$ se cancela y no interviene en la simulación. |
| Constante de tiempo | $\tau_p = 1$ min no es compatible con $A$, $K$ y $h_e$. | Se adopta $\tau \approx 10$ h, que es el valor que resulta de los parámetros (sección 3.1). |
| Función de transferencia | El enunciado pide $H(s)$ pero no la deriva. | Se obtiene linealizando la ecuación (10) alrededor de $h_e = 5$ m (sección 4). |
| Condiciones de simulación | No se dan $h(0)$, la entrada, el tiempo de simulación ni el método numérico. | $h(0) = 5$ m, escalón de $Q_i$ de 10 a 12 m³/h en $t = 0$ y horizonte de 50 h. |
| Límites físicos | El nivel debe cumplir $0 \le h \le H$ y $\sqrt{h}$ no existe para $h < 0$. | En el simulador el nivel se limita a $[0, H]$ y la raíz se calcula como $\sqrt{\max(h, 0)}$. |
| Referencia [1] | El enunciado cita una fuente sin datos bibliográficos. | Se citan textos estándar de modelado de sistemas de nivel (sección 11). |

## Constante de tiempo del proceso

El enunciado da $\tau_p = 1$ min. Sin embargo, la constante de tiempo de un tanque no es un dato independiente: queda fijada por $A$, $K$ y el punto de operación. De la linealización de la sección 4:

$$\tau = \frac{2A\sqrt{h_e}}{K} = \frac{2\,(10)\,\sqrt{5}}{4.47} = 10.005\ \mathrm{h} \approx 10\ \mathrm{h}$$

Los dos valores no se pueden cumplir a la vez. Para que la constante de tiempo fuera 1 min con $A = 10$ m² y $h_e = 5$ m, la válvula tendría que ser $K \approx 2683$ m²·⁵/h, y entonces el caudal de equilibrio sería $K\sqrt{5} \approx 6000$ m³/h en lugar de los 10 m³/h del enunciado.

Se trabajó con $\tau \approx 10$ h por tres razones:

1. El enunciado pide simular la ecuación (10), y esa ecuación solo contiene $A$ y $K$. La constante de tiempo es una consecuencia de ellos y no un parámetro que se pueda fijar aparte.
2. $A$, $K$, $h_e$ y los caudales de equilibrio son consistentes entre sí, como muestra la verificación del equilibrio. El único dato que no encaja con los demás es $\tau_p$.
3. Imponer $\tau_p = 1$ min obligaría a cambiar $K$ o $A$, y con eso dejaría de cumplirse el equilibrio de 10 m³/h a 5 m que da el mismo enunciado.

En consecuencia, $\tau_p = 1$ min se reporta como un dato del enunciado que no se usó, y todos los resultados corresponden a $\tau \approx 10$ h.

## Condiciones de simulación

Las mismas condiciones se usaron en Simulink y en el simulador web, para que los resultados sean comparables.

| Condición | Valor | Justificación |
|---|---|---|
| Nivel inicial | $h(0) = 5$ m | El sistema parte del equilibrio del enunciado. |
| Entrada | Escalón de $Q_i$ de 10 a 12 m³/h en $t = 0$ | Perturbación del 20 % sobre el caudal de equilibrio. |
| Horizonte | 50 h | Equivale a $5\tau$, suficiente para acercarse al estado estacionario. |
| Nuevo equilibrio | $h_\infty = (12/4.47)^2 \approx 7.21$ m | Queda por debajo de la altura máxima de 10 m, de modo que el tanque no rebosa. |

# Linealización y función de transferencia

La ecuación (10) es no lineal por el término $\sqrt{h}$, y la transformada de Laplace solo se aplica a ecuaciones lineales. Por eso $H(s)$ se obtiene de una aproximación lineal válida cerca del punto de operación $h_e = 5$ m, $Q_{i,e} = 10$ m³/h.

## Linealización

La raíz se aproxima con una serie de Taylor de primer orden alrededor de $h_e$:

$$\sqrt{h} \approx \sqrt{h_e} + \frac{1}{2\sqrt{h_e}}\,(h - h_e)$$

Se definen las variables de desviación respecto al equilibrio, $h'(t) = h(t) - h_e$ y $q'(t) = Q_i(t) - Q_{i,e}$. Al sustituir en (10), y como en el equilibrio $Q_{i,e} = K\sqrt{h_e}$, los términos constantes se cancelan y queda:

$$\frac{dh'(t)}{dt} = \frac{1}{A}\,q'(t) - \frac{K}{2A\sqrt{h_e}}\,h'(t)$$

## Función de transferencia H(s)

Aplicando la transformada de Laplace con condición inicial nula en variables de desviación:

$$H(s) = \frac{H'(s)}{Q'(s)} = \frac{1/A}{s + \dfrac{K}{2A\sqrt{h_e}}} = \frac{K_p}{\tau s + 1}$$

Es un sistema de primer orden con:

$$\tau = \frac{2A\sqrt{h_e}}{K} \approx 10\ \mathrm{h} \qquad K_p = \frac{2\sqrt{h_e}}{K} \approx 1\ \frac{\mathrm{m}}{\mathrm{m^3/h}}$$

Con los valores numéricos:

$$H(s) = \frac{0.1}{s + 0.1}$$

## Respuesta en el tiempo h(t)

Para el escalón de 2 m³/h, $Q'(s) = 2/s$ y:

$$H'(s) = \frac{0.1}{s + 0.1}\cdot\frac{2}{s} = \frac{2}{s} - \frac{2}{s + 0.1}$$

La transformada inversa da la desviación del nivel, y al sumar el punto de operación se obtiene la respuesta analítica:

$$h(t) = 5 + 2\left(1 - e^{-0.1\,t}\right)$$

con $t$ en horas y $h$ en metros. Según el modelo lineal, el nivel tiende a 7 m.

# Simulación en Simulink

## Parámetros

Los parámetros se definieron como variables en el espacio de trabajo de MATLAB, y los bloques del modelo las usan por nombre.

![Figura 2. Definición de los parámetros en la ventana de comandos de MATLAB.](variables_matlab.jpeg){width=4in}

![Figura 3. Variables en el espacio de trabajo.](variables.jpeg){width=3in}

## Diagrama de bloques

El modelo contiene dos ramas que reciben el mismo escalón de entrada.

![Figura 4. Diagrama de bloques en Simulink: ecuación diferencial no lineal (arriba) y función de transferencia (abajo).](diagrama.jpeg){width=6.2in}

- **Rama superior, ecuación diferencial (10).** El sumador calcula $Q_i - K\sqrt{h}$, la ganancia $1/A$ lo convierte en $dh/dt$ y el integrador entrega $h(t)$ a partir de la condición inicial $h_0 = 5$ m. El nivel se realimenta por el bloque de raíz cuadrada y la ganancia $K$.
- **Rama inferior, función de transferencia.** Al escalón se le resta el caudal de equilibrio (10 m³/h) para obtener la desviación $q'(t)$, que entra al bloque $0.1/(s + 0.1)$. A la salida se le suma el nivel de equilibrio (5 m) para volver a la variable real.

La simulación se ejecutó de 0 a 50 h con el solucionador de paso variable automático de Simulink.

## Respuestas obtenidas

![Figura 5. Respuesta de la ecuación diferencial no lineal en Simulink.](scope_no_lineal.jpeg){width=6in}

![Figura 6. Respuesta no lineal (amarillo) y respuesta de la función de transferencia (azul) en el mismo Scope.](scope_ambas.jpeg){width=6in}

La respuesta analítica se graficó en MATLAB evaluando la expresión de la sección 4.3:

```matlab
t = 0:0.05:50;
h_ana = 5 + 2*(1 - exp(-0.1*t));
plot(t, h_ana)
```

![Figura 7. Respuesta analítica h(t), transformada inversa de H(s).](analitica.jpeg){width=6in}

# Comparación y análisis de las respuestas

La tabla compara las tres respuestas en varios instantes. La columna no lineal corresponde a la integración numérica de la ecuación (10). La función de transferencia y la expresión analítica dan los mismos valores, porque son dos formas del mismo modelo lineal.

| Tiempo (h) | Ecuación diferencial no lineal (m) | $H(s)$ y $h(t)$ analítica (m) | Diferencia (m) |
|---|---|---|---|
| 0 | 5.000 | 5.000 | 0.000 |
| 5 | 5.794 | 5.787 | 0.007 |
| 10 | 6.292 | 6.264 | 0.027 |
| 20 | 6.816 | 6.729 | 0.087 |
| 30 | 7.038 | 6.900 | 0.138 |
| 40 | 7.134 | 6.963 | 0.170 |
| 50 | 7.175 | 6.987 | 0.189 |
| Estado estacionario | 7.207 | 7.000 | 0.207 |

De la comparación se concluye lo siguiente:

- **La función de transferencia y la respuesta analítica coinciden.** La curva azul del Scope y la gráfica de MATLAB son la misma respuesta, lo que confirma que la transformada inversa se calculó bien.
- **Cerca del punto de operación las tres respuestas coinciden.** En las primeras 5 h la diferencia es menor que 1 cm, porque el nivel todavía está cerca de 5 m, donde la aproximación lineal es válida.
- **La diferencia crece a medida que el nivel se aleja de 5 m.** En estado estacionario el modelo no lineal llega a 7.21 m y el lineal a 7.00 m. La diferencia de 0.21 m equivale al 2.9 % del nivel final y a cerca del 9 % del cambio total de nivel.
- **El modelo lineal subestima el nivel final.** La curva $\sqrt{h}$ se aplana al subir el nivel, de modo que el caudal de salida crece cada vez menos y el tanque necesita más altura para evacuar los 12 m³/h. El modelo lineal supone la pendiente fija de $h_e = 5$ m y por eso predice un nivel menor.
- **El proceso real es más lento que el lineal.** La constante de tiempo local, $2A\sqrt{h}/K$, aumenta de 10 h en $h = 5$ m a unas 12 h en $h = 7.2$ m. Por eso a las 50 h el modelo no lineal aún no ha llegado a su valor final (7.175 m frente a 7.207 m).

En resumen, $H(s)$ describe bien el tanque para perturbaciones pequeñas alrededor del punto de operación, y la ecuación diferencial no lineal es la referencia cuando el nivel se aleja de él.

# Simulación con superagente de inteligencia artificial

## Superagentes utilizados

| Herramienta | Papel en el trabajo |
|---|---|
| Claude (claude.ai) | Análisis del enunciado, verificación de las ecuaciones, detección de inconsistencias y plan de trabajo. |
| v0 (Vercel) | Generación del programa de simulación a partir de un único prompt. |
| Agente local de programación | Integración del código en el repositorio, validación del modelo matemático, correcciones de accesibilidad y diseño, y documentación. |
| Vercel | Despliegue del simulador y enlace de ejecución. |

## Proceso seguido

1. **Análisis.** Se pidió al agente verificar las ecuaciones y los datos del enunciado. De ahí salieron los hallazgos de la sección 3.
2. **Contraste.** Se hizo un segundo análisis independiente y se compararon los dos. Coincidieron en los puntos comunes, lo que dio confianza en los hallazgos.
3. **Especificación.** Con las decisiones ya tomadas se redactó un prompt para v0 con la física, los parámetros, los valores por defecto y los requisitos de la interfaz.
4. **Generación.** v0 produjo una aplicación web de una sola página, sin servidor.
5. **Validación.** El agente local comparó el código generado con la teoría, línea por línea, antes de aceptarlo.
6. **Corrección.** Se corrigieron problemas de contraste, accesibilidad y comportamiento en pantallas pequeñas.
7. **Despliegue.** El simulador se publicó en Vercel.

## Prompt enviado a v0

El programa de simulación se generó con el siguiente prompt, transcrito de forma íntegra:

```text
Build a single-page water tank simulator (client-side only, no backend)
for a university modeling assignment. UI labels in neutral Spanish.

Reading this as: engineering lab tool for students, with a clean
technical-instrument language, leaning toward Tailwind + shadcn-style
controls, light mode, high readability over decoration.

Layout: header with title + equilibrium badge, left control panel,
center tank visualization with animated water level, right/bottom chart
with overlay of 3 curves.

Physics (canonical unit: hours):
- Nonlinear ODE: dh/dt = Qi(t)/A - (K/A)*sqrt(max(h,0)),
  clamp h to [0, Hmax]
- Parameters: A=10 m2, K=4.47 m2.5/h, Hmax=10 m,
  operating point h_bar=5 m, Q_bar=10 m3/h
- Linearized model: H(s) = (1/A)/(s + K/(2*A*sqrt(h_bar))),
  tau = 2*A*sqrt(h_bar)/K = 10 h
- Defaults: h(0)=5 m, step Qi: 10 -> 12 m3/h at t=0, horizon 50 h,
  solver RK4/Euler in JS with fixed dt
- Show: nonlinear h(t), linear H(s) step response, analytic
  inverse-Laplace h(t) on the same chart; linearization error note
  far from h_bar
- Validation badge: Qi=10 must converge to h=5;
  show protection sqrt(max(h,0))

Controls (editable): A, K, Hmax, h(0), Qi base, Qi step size, horizon.
Buttons: run, reset. No purple gradients, no centered hero, no
placeholder graphics. Real chart (recharts or canvas), real tank SVG
animation, responsive, WCAG AA contrast, Spanish labels, equations
shown with assumptions (rho treated as dimensionless 1, hours
canonical).
```

## Respuesta de v0

v0 trabajó en dos etapas, de unos seis minutos cada una, y dejó estos mensajes:

> La base está limpia y no hay restricciones de backend que resolver. Voy a implementar la integración numérica RK4, la respuesta lineal calculada por el modelo y su forma analítica —que deben coincidir— junto con el tanque animado y el gráfico sincronizado.

> Ya está confirmada la dependencia del gráfico. Estoy implementando el cálculo en un módulo separado de la interfaz; la curva lineal incluye la perturbación inicial y la respuesta analítica, y el selector permite comparar RK4 con Euler de paso fijo.

Los mensajes anticipan dos decisiones de diseño que se confirman en la ingeniería inversa: el cálculo está separado de la interfaz, y el modelo lineal se calcula de dos maneras que deben coincidir.

## Resumen de la bitácora de prompts

| Prompts | Etapa | Resultado |
|---|---|---|
| 1 a 5 | Análisis y planeación con Claude | Verificación de las ecuaciones, detección de la inconsistencia de $\tau_p$, ruta de trabajo y documentación base. |
| 6 a 10 | Contexto y decisiones con el agente local | Lectura del enunciado, lista de problemas y correcciones, y decisión de hacer una página única sin servidor. |
| 11 | Especificación para v0 | Prompt de la sección 7.3. |
| 12 y 13 | Integración y validación | Código de v0 integrado en el repositorio y revisión del modelo línea por línea, sin discrepancias con la teoría. |
| 14 a 18 | Correcciones de interfaz | Cursor, auditoría de accesibilidad y diseño, contraste de las etiquetas y de las líneas del tanque. |

El anexo A recoge los 18 prompts con su resultado.

# Ingeniería inversa del programa de simulación

## Arquitectura

El programa es una aplicación web de una sola página construida con Next.js 16, React 19 y TypeScript. No tiene servidor ni base de datos: todo el cálculo ocurre en el navegador. La gráfica usa la biblioteca Recharts y los estilos usan Tailwind CSS.

El código separa el cálculo de la interfaz:

| Archivo | Responsabilidad |
|---|---|
| `lib/water-tank-model.ts` | Modelo matemático e integración numérica. No depende de la interfaz. |
| `components/simulator/tank-simulator.tsx` | Componente principal: guarda el estado, ejecuta la simulación y coordina a los demás. |
| `components/simulator/control-panel.tsx` | Formulario de parámetros, selector de método y botones de ejecutar y reiniciar. |
| `components/simulator/tank-visualization.tsx` | Dibujo del tanque en SVG con el nivel animado. |
| `components/simulator/response-chart.tsx` | Gráfica con las tres curvas superpuestas. |
| `components/simulator/model-equations.tsx` | Ecuaciones y supuestos mostrados en pantalla. |
| `components/simulator/linearization-note.tsx` | Nota sobre el error de linealización. |

## Flujo de ejecución

1. El usuario edita los parámetros en el panel de control. Los valores se guardan como borrador y no afectan la simulación hasta que se ejecuta.
2. Al ejecutar, los parámetros se validan con `isValidParameters`. Si son válidos, pasan a ser los parámetros aplicados.
3. `simulateTank` calcula todos los puntos de la simulación de una vez y devuelve una lista. El resultado se memoriza y solo se recalcula si cambian los parámetros o el método.
4. La gráfica dibuja la lista completa. Un cursor de tiempo avanza con `requestAnimationFrame`, y el tanque muestra el nivel que corresponde a ese instante, obtenido con `sampleAtTime`.

La simulación no se calcula en tiempo real: primero se resuelve completa y después se reproduce.

## Estructuras de datos

| Estructura | Contenido |
|---|---|
| `TankParameters` | Área, coeficiente de la válvula, altura máxima, nivel inicial, caudal base, tamaño del escalón y horizonte. |
| `DEFAULT_PARAMETERS` | $A = 10$, $K = 4.47$, $H = 10$, $h(0) = 5$, caudal base 10, escalón +2, horizonte 50. |
| `SimulationPoint` | Un instante de la simulación: `time`, `nonlinear`, `linear` y `analytic`. |
| `SolverMethod` | Método numérico: `'rk4'` o `'euler'`. |

Además hay tres constantes de módulo: el nivel de operación (5 m), el caudal de operación (10 m³/h) y el paso de integración (0.05 h).

## Método numérico

La función `integrateStep` avanza un paso de tiempo con uno de dos métodos de paso fijo, $\Delta t = 0.05$ h (3 minutos):

- **Euler explícito:** $h_{n+1} = h_n + \Delta t\,f(h_n)$.
- **Runge-Kutta de cuarto orden (RK4),** que es el método por defecto:

$$h_{n+1} = h_n + \frac{\Delta t}{6}\,(k_1 + 2k_2 + 2k_3 + k_4)$$

donde $k_1$ a $k_4$ son evaluaciones de la derivada al inicio, en dos puntos intermedios y al final del paso.

En cada paso `simulateTank` calcula tres valores:

| Curva | Cómo se calcula |
|---|---|
| No lineal | Integra $f(h) = Q_i/A - (K/A)\sqrt{\max(h, 0)}$ y limita el resultado a $[0, H]$. |
| Lineal | Integra numéricamente la ecuación linealizada, $f(h) = (Q_i - Q_{i,e})/A - (h - h_e)/\tau$. |
| Analítica | Evalúa la solución cerrada del modelo lineal, sin integrar. |

La curva lineal y la analítica representan el mismo modelo calculado por dos caminos. Que coincidan en la gráfica verifica que el integrador funciona.

## Verificación contra la teoría

| Elemento | En el código | En la teoría | Coincide |
|---|---|---|---|
| Ecuación no lineal | `finalFlow / area - (coefficient / area) * Math.sqrt(Math.max(height, 0))` | Ecuación (10) | Sí |
| Polo del modelo lineal | `coefficient / (2 * area * Math.sqrt(OPERATING_HEIGHT))` | $K/(2A\sqrt{h_e}) = 0.1$ | Sí |
| Constante de tiempo | `getLinearizationTimeConstant` | $2A\sqrt{h_e}/K \approx 10$ h | Sí |
| Nivel de equilibrio | `getEquilibriumHeight`: `(flow / coefficient) ** 2` | $h_\infty = (Q_i/K)^2$ | Sí |
| Respuesta analítica | Solución de primer orden con condición inicial | Sección 4.3 | Sí |
| Límites físicos | `clamp(height, 0, maxHeight)` y `Math.max(height, 0)` | $0 \le h \le H$ | Sí |

La respuesta analítica del programa es más general que la de la sección 4.3, porque admite un nivel inicial distinto del equilibrio:

$$h(t) = h_e + \bigl(h(0) - h_e\bigr)\,e^{-t/\tau} + \frac{Q_i - Q_{i,e}}{A}\,\tau\,\bigl(1 - e^{-t/\tau}\bigr)$$

Con $h(0) = 5$ m y un escalón de 2 m³/h se reduce a $h(t) = 5 + 2(1 - e^{-0.1t})$.

El programa incluye una autoverificación, `validatesReferenceEquilibrium`: con $Q_i = 10$ m³/h simula el tanque partiendo de vacío y de lleno, y comprueba que en ambos casos el nivel converge a 5 m. El resultado se muestra como una insignia en el encabezado.

## Observaciones

- **Nombre de una variable.** El campo `dischargeCoefficient` guarda $K$, el coeficiente de la válvula, y no $c$, el coeficiente de descarga de la ecuación (6). El cálculo es correcto; solo el nombre puede confundir.
- **Punto de operación fijo.** El modelo lineal siempre se linealiza alrededor de 5 m y 10 m³/h, aunque el usuario cambie $A$ o $K$. Si se cambia $K$, ese punto deja de ser un equilibrio y la curva lineal pierde significado.
- **El modelo lineal no tiene límites.** Solo la curva no lineal se limita a $[0, H]$, lo que es coherente: el modelo lineal no conoce la altura del tanque.
- **Correcciones posteriores.** Después de la generación se corrigieron los colores de las curvas en tema oscuro, el contraste de las etiquetas del tanque, el comportamiento en pantallas angostas y los avisos para lectores de pantalla. Ninguna corrección modificó el modelo matemático.

# Programa de simulación

El simulador se ejecuta en el navegador, sin instalación, en la siguiente dirección:

<https://tanque-six.vercel.app/>

El código fuente está en la carpeta `simulator/` del repositorio <https://github.com/josuerangel2005/tanque>.

Para usarlo:

1. Ajustar los parámetros en el panel de control: área, coeficiente de la válvula, altura máxima, nivel inicial, caudal base, tamaño del escalón y horizonte.
2. Elegir el método numérico, RK4 o Euler.
3. Ejecutar la simulación. El tanque se llena de forma animada y la gráfica muestra las tres curvas: no lineal, lineal y analítica.
4. Reiniciar para volver a los valores por defecto, que son los de este informe.

Con los valores por defecto el simulador reproduce los resultados de la sección 6: el modelo no lineal tiende a 7.21 m y el lineal a 7.00 m.

# Conclusiones

- El modelo del tanque, $dh/dt = Q_i/A - (K/A)\sqrt{h}$, es correcto y consistente con el punto de equilibrio del enunciado: $K = 4.47$ produce un caudal de 10 m³/h a 5 m de nivel.
- La función de transferencia es $H(s) = 0.1/(s + 0.1)$, un sistema de primer orden con ganancia de 1 m por cada m³/h y constante de tiempo de 10 h.
- La constante de tiempo de 1 min del enunciado no es compatible con los demás datos. Se trabajó con 10 h porque es el valor que determinan $A$, $K$ y $h_e$, que son los parámetros de la ecuación que se pide simular.
- Las respuestas de $H(s)$ y de $h(t)$ analítica coinciden entre sí. Frente a la ecuación diferencial no lineal coinciden cerca del punto de operación y se separan al alejarse: 7.00 m frente a 7.21 m en estado estacionario.
- El modelo lineal subestima el nivel final y la lentitud del proceso, porque la resistencia de la válvula aumenta con el nivel.
- El superagente generó un programa correcto a partir de un solo prompt, pero ese resultado dependió de entregarle las decisiones ya tomadas: unidades, punto de operación, condiciones iniciales y límites. El análisis previo del enunciado fue lo que hizo posible un prompt preciso.
- La ingeniería inversa confirmó que el código implementa la teoría sin discrepancias, y permitió identificar el método numérico (RK4 y Euler de paso fijo) y dos limitaciones de diseño: el nombre de una variable y el punto de operación fijo.

# Referencias

1. K. Ogata, *Ingeniería de control moderna*, 5.ª ed. Madrid: Pearson Educación, 2010. Capítulo 4: modelado de sistemas de nivel de líquido.
2. D. E. Seborg, T. F. Edgar, D. A. Mellichamp y F. J. Doyle, *Process Dynamics and Control*, 4.ª ed. Hoboken: Wiley, 2016.
3. C. A. Smith y A. B. Corripio, *Control automático de procesos: teoría y práctica*. México: Limusa, 1991.
4. The MathWorks, *Simulink: documentación*. Disponible en: <https://www.mathworks.com/help/simulink/>
5. Vercel, *v0*. Disponible en: <https://v0.app/>
6. Anthropic, *Claude*. Disponible en: <https://claude.ai/>
7. Docente de la asignatura, *Trabajo 3. Modelado y simulación de sistemas continuos: modelo matemático del tanque*, documento del curso, 2026.

# Anexo A. Bitácora de prompts

Este anexo recoge los prompts significativos del trabajo, en el orden en que se usaron. La redacción se refinó a partir de las instrucciones originales para que cada prompt se entienda sin el resto de la conversación; la intención y el resultado no cambian. Se omiten las instrucciones operativas que no aportan al resultado, como las de control de versiones.

## Análisis y planeación

Prompts enviados a Claude (claude.ai).

| # | Prompt | Resultado |
|--|--------------|--------------|
| 1 | "Elabore un plan de trabajo para resolver el taller del tanque de agua. Analice la estructura del documento base, verifique la viabilidad de las fórmulas y de los datos, corrija los fallos que encuentre, organice la solución en pasos e indique las herramientas necesarias para cada uno." | Verificación simbólica de las ecuaciones (1) a (10), validación numérica de $K = 4.47$, detección de la inconsistencia de $\tau_p$ y un organizador de pasos con las herramientas sugeridas. |
| 2 | "Compare su análisis con este segundo análisis independiente del mismo enunciado, que señala varios errores. Determine en qué coinciden, en qué difieren y cuál de los dos tiene la razón en cada dato y en cada fórmula." | Tabla comparativa de los dos análisis, sin contradicciones en los puntos comunes. Se adoptaron los aportes del segundo: condiciones iniciales, manejo del borde $h = 0$ y nomenclatura. |
| 3 | "Construya la ruta de procesos del taller como un organigrama: los pasos en orden, lo que se debe tener listo antes de cada uno y la herramienta con la que se realiza. Entregue únicamente esa ruta, en formato Markdown." | Diagrama de flujo de siete pasos y un documento con la ruta y las herramientas de cada paso. |
| 4 | "Corrija la ruta en dos puntos. Primero, la pregunta para la docente debe ser solo sobre la constante de tiempo; no la mezcle con la resistencia de la válvula, porque son magnitudes distintas. Segundo, agregue como notas el error de la ecuación (5), la irrelevancia de la densidad y las unidades de $K$." | Paso 1 de la ruta corregido, con la pregunta sobre $\tau_p$ separada de $R$ y las tres notas incorporadas. |
| 5 | "El taller exige documentar el proceso. Organice todo lo discutido hasta ahora en documentos listos para publicar en un repositorio de GitHub: el modelo, el análisis con sus correcciones, la ruta de trabajo y el registro de prompts." | Documentación base del repositorio: un archivo de presentación y cuatro documentos temáticos. |

## Construcción del simulador

Prompts enviados al agente local de programación, salvo el número 11, que es el que el agente redactó para v0.

| # | Prompt | Resultado |
|--|--------------|--------------|
| 6 | "Analice el documento del modelo matemático del tanque. Extraiga las ecuaciones, los parámetros y las actividades solicitadas, verifique que los datos sean consistentes entre sí e identifique lo que el enunciado deja sin definir." | Extracción de las diez ecuaciones y del diagrama, verificación de $K = 10/\sqrt{5} = 4.47$ y lista de vacíos que impedían simular: $H(s)$ sin derivar, y $h(0)$ y la entrada sin definir. |
| 7 | "Con base en el enunciado, proponga la ruta mínima para empezar: qué supuestos y unidades hay que fijar primero, qué hay que validar antes de programar y cuál debe ser el primer incremento funcional." | Ruta de inicio: fijar la unidad de tiempo y los supuestos, validar el equilibrio ($Q_i = 10$ lleva a $h = 5$), registrar los prompts desde el primer día y empezar por la ecuación no lineal con su gráfica. |
| 8 | "Genere un documento de contexto que reúna el modelo, cada problema detectado en el enunciado con su evidencia y su impacto, y la corrección propuesta para cada uno." | Documento de contexto con siete problemas, su evidencia e impacto, la tabla de correcciones, $H(s)$ linealizada y los supuestos mínimos de arranque. |
| 9 | "Revise la ruta de trabajo elaborada en la etapa anterior y valide su contenido contra el enunciado y contra el documento de contexto. Señale lo que sea incorrecto y lo que falte." | Ruta validada como correcta y coherente. Se precisó que $R \approx 1$ h/m² y $\tau_p$ son magnitudes distintas y se señalaron tres omisiones: la densidad, el error de la ecuación (5) y las unidades de $K$. |
| 10 | "Según lo que pide el trabajo, determine si el simulador necesita una arquitectura con frontend y backend o si basta una aplicación del lado del cliente. Justifique la decisión." | Decisión de hacer una página única sin servidor: el modelo es una ecuación diferencial escalar, sin base de datos ni usuarios, y un backend sería sobredimensionar. |
| 11 | "Redacte el prompt para generar el simulador en v0. Debe incluir la física, los parámetros, los valores por defecto y los requisitos de la interfaz, y dejar registrado que la herramienta de generación fue v0." | Prompt de la sección 7.3, con el que v0 generó el programa. |
| 12 | "Integre en la estructura del repositorio el proyecto exportado de v0, sin alterar la documentación existente, y verifique que la aplicación quede lista para instalar y ejecutar." | Proyecto de 39 archivos (Next.js 16 y React 19) integrado en la carpeta `simulator/`, con la documentación intacta. |
| 13 | "Valide el modelo matemático del código generado contra la teoría: constantes, ecuación diferencial, función de transferencia, constante de tiempo, equilibrio y respuesta analítica. Reporte cualquier discrepancia." | Revisión línea por línea de `water-tank-model.ts` sin discrepancias matemáticas. Dos observaciones menores: el nombre `dischargeCoefficient` guarda $K$, y el punto de operación está fijo en el módulo. |
| 14 | "Centralice en la hoja de estilos el cursor de los elementos interactivos, de modo que los botones y los controles de incremento de los campos numéricos lo indiquen sin repetir clases en cada componente." | Regla base en `globals.css`: cursor de mano en botones y controles numéricos, y cursor de no permitido en los deshabilitados. |
| 15 | "Audite la página y sus componentes con criterios de diseño y de accesibilidad. Clasifique los hallazgos por gravedad y no modifique el código en esta fase." | Auditoría con tres hallazgos críticos (curvas indistinguibles en tema oscuro, avisos excesivos para lectores de pantalla y tema oscuro incoherente) y varios avisos sobre pantallas pequeñas, áreas táctiles y validación de campos. |
| 16 | "Corrija todos los hallazgos de la auditoría, los críticos y los avisos, sin modificar el modelo matemático. Verifique que el proyecto compile sin errores de tipos." | Ocho archivos corregidos y verificación de tipos sin errores: curvas con colores propios en tema oscuro, avisos solo al estabilizarse la simulación y diseño adaptable. |
| 17 | "Las etiquetas de nivel del tanque no se leen: el texto azul queda sobre el agua azul. Corrija el contraste sin cambiar el significado de los colores." | Etiquetas con un halo del color de la tarjeta y texto principal más grande. Se conservó el aviso de rebose en ámbar. |
| 18 | "Las dos líneas punteadas de referencia del tanque, la de equilibrio y la de rebose, tampoco resaltan sobre el agua. Hágalas visibles conservando su color y su significado." | Riel sólido bajo cada línea y mayor grosor. Los colores y su significado quedaron intactos. |
