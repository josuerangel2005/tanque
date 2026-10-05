# Modelo matemático del tanque de agua

> Transcripción fiel del documento entregado por el docente (`Modelo matematico del Tanque.docx`), tal como se usa de base para el taller.

## Proceso: tanque de distribución de agua

El taller presenta el modelo matemático de un tanque de distribución de agua. El modelo se basa en la conservación de la masa (balance de caudales) y en la ley de Torricelli para representar el flujo de salida por un orificio o válvula.

El documento original incluye una figura del proceso (Figura 1: "Proceso: Tanque de agua"): un tanque cilíndrico de área transversal `A`, con flujo de entrada `qi(t)` por arriba, nivel de agua `h(t)`, y flujo de salida `qo(t)` por abajo a través de una válvula de resistencia `R`.

## Modelo del proceso

### 1. Balance de masa

La masa de agua dentro del tanque es la densidad por el volumen:

$$
m(t) = \rho V(t) \tag{1}
$$

El volumen es el área transversal del tanque por la altura del agua:

$$
V(t) = A h(t) \tag{2}
$$

La variación del volumen es:

$$
\frac{dV(t)}{dt} = A\frac{dh(t)}{dt} \tag{3}
$$

Por tanto, la variación de la masa es:

$$
\rho\frac{dV(t)}{dt} = \rho A\frac{dh(t)}{dt} \tag{4}
$$

El balance de masa se expresa como "lo que se acumula = lo que entra − lo que sale":

$$
\rho A\frac{dh(t)}{dt} = \rho\bigl(Q_i(t)-Q_o(t)\bigr) \tag{5}
$$

> **Nota de transcripción:** el `.docx` original imprime `dV/dt` en el lado izquierdo de (5) en lugar de `dh/dt` — error de formato detectado y corregido aquí (ver `02-analisis-y-correcciones.md`, hallazgo P1).

### 2. Caudal de salida: ley de Torricelli

El caudal de salida a través de un orificio en la parte inferior depende de la altura del agua:

$$
Q_o(t) = c a\sqrt{2g h(t)} \tag{6}
$$

Se define la constante:

$$
K = c a\sqrt{2g} \tag{7}
$$

Así, el caudal de salida también puede escribirse como:

$$
Q_o(t) = K\sqrt{h(t)} \tag{8}
$$

Al sustituir (8) en el balance de masa:

$$
\rho A\frac{dh(t)}{dt} = \rho Q_i(t)-\rho K\sqrt{h(t)} \tag{9}
$$

Como la densidad del agua se toma igual a 1, la ecuación diferencial final del proceso (ecuación 10) es:

$$
\frac{dh(t)}{dt} = \frac{Q_i(t)}{A} - \frac{K}{A}\sqrt{h(t)} \tag{10}
$$

## Variables y parámetros indicados por el docente

| Símbolo | Descripción | Valor indicado |
|---|---|---|
| $h(t)$ | Altura del agua en el tanque | — |
| $A$ | Área transversal del tanque | $10\ \mathrm{m^2}$ |
| $K$ | Coeficiente de la válvula | $4.47$ |
| $H$ | Altura máxima del tanque | $10\ \mathrm{m}$ |
| $Q_i$ | Flujo de entrada en equilibrio | $10\ \mathrm{m^3/h}$ |
| $Q_o$ | Flujo de salida en equilibrio | $10\ \mathrm{m^3/h}$ |
| $h_i$ | Altura en equilibrio | $5\ \mathrm{m}$ |
| $\tau_p$ | Constante de tiempo del proceso | $1\ \mathrm{min}$ |
| $\rho$ | Densidad del líquido | $1\ \mathrm{g/cm^3}$ |
| $c$ | Coeficiente de descarga de la válvula u orificio, adimensional | Entre 0 y 1 |
| $a$ | Área de la sección transversal del orificio de salida | — |
| $g$ | Aceleración de la gravedad | $9.81\ \mathrm{m/s^2}$ |

## Actividades solicitadas

1. Simular en Simulink el proceso del tanque definido por la ecuación diferencial (10).
2. Obtener $H(s)$ en el dominio de la frecuencia.
3. Simular y obtener $h(t)$, descrita en el taller como la transformada inversa de $H(s)$.
4. Comparar y analizar las respuestas obtenidas mediante la ecuación diferencial, $H(s)$ y $h(t)$.
5. Simular el proceso y generar la gráfica de respuesta del sistema utilizando un superagente de ingeniería de software apoyado por IA.
6. Realizar ingeniería inversa del software de simulación obtenido.
7. Documentar el proceso completo en un informe: prompts introducidos, programa de simulación del autómata obtenido, superagente utilizado, ingeniería inversa y demás aspectos relevantes.
8. Incluir un enlace para ejecutar el programa de simulación.

## Entrega y exposición

- La entrega debe ser un solo PDF que contenga el informe y las diapositivas.
- La exposición será de 10 minutos, el viernes 9 de octubre de 2026, de acuerdo con los equipos conformados.
- Se mantienen los grupos de dos personas.

## Referencia citada en el documento

El Word cita una fuente como "[1]" en el texto, pero no incluye los datos bibliográficos de esa referencia. Pendiente de completar (ver hallazgo P6 en `02-analisis-y-correcciones.md`).
