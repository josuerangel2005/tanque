# Modelo del tanque — contexto, problemas y correcciones

Documento de trabajo para el simulador del tanque. Resume lo que pide la asignatura, el modelo extraido del `.docx`, las inconsistencias verificadas y las correcciones propuestas para poder avanzar sin adivinar.

## Ruta rapida

1. Fijar unidad canonica de tiempo y supuestos faltantes (ver tabla de correcciones).
2. Validar equilibrio: `Qi = 10 m3/h => h -> 5 m`.
3. Implementar solo la ODE no lineal y graficar `h(t)` ante un escalon.

## 1. Contexto

| Tema | Detalle |
|------|---------|
| Asignatura | Modelado, sistema continuo, distribucion de agua |
| Fuente | `Modelo matematico del Tanque.docx` (75 parrafos, 10 ecuaciones, 1 diagrama) |
| Tarea (a) | Simular ODE no lineal en Simulink, obtener `H(s)`, calcular `h(t)` por Laplace inversa, comparar las tres respuestas |
| Tarea (b) | Reconstruir con agente de ingenieria de software, documentar prompts/toolchain, entregar enlace ejecutable, presentacion 10 min 2026-10-09, en parejas, un solo PDF |
| Estado del repo | Repo git inicializado en `main`, sin commits. Contiene el `.docx`, `openspec/`, `.atl/` del init. Sin codigo todavia |
| Modelo base | Un tanque, seccion `A`, nivel `h(t)`. Entrada `Qi(t)` arriba, salida por gravedad `Qo(t)` abajo |

## 2. Modelo matematico extraido

Variables: `m(t)` masa, `V(t)` volumen, `h(t)` nivel (estado/salida), `Qi(t)` entrada, `Qo(t)` salida dependiente.

| # | Ecuacion |
|---|----------|
| (1) | `m(t) = rho * V(t)` |
| (2) | `V(t) = A * h(t)` |
| (3) | `dV/dt = A * dh/dt` |
| (4) | `rho * dV/dt = rho * A * dh/dt` |
| (5) | `rho * A * dh/dt = rho * (Qi(t) - Qo(t))` |
| (6) | `Qo(t) = c * a * sqrt(2 * g * h(t))` (Torricelli) |
| (7) | `K = c * a * sqrt(2 * g)` |
| (8) | `Qo(t) = K * sqrt(h(t))` |
| (9) | `rho * A * dh/dt = rho * Qi(t) - rho * K * sqrt(h(t))` |
| (10) | `dh/dt = Qi(t)/A - (K/A) * sqrt(h(t))` con `rho = 1` |

Parametros dados: `A = 10 m2`, `K = 4.47`, `Hmax = 10 m`, punto de operacion `h_bar = 5 m`, `Q_bar = 10 m3/h`, `tau_p = 1 min`, `rho = 1 g/cm3`.

Supuestos del documento: densidad constante, `A` constante, sin evaporacion/fugas, salida segun Torricelli con `c*a` constante, `rho` se cancela.

Verificacion hecha: `K = Q_bar / sqrt(h_bar) = 10 / sqrt(5) = 4.472`, coincide con `K = 4.47`. Correcto.

## 3. Problemas presentes

| # | Problema | Evidencia | Impacto |
|---|----------|-----------|---------|
| P1 | Ec. (5) con lado izquierdo incorrecto | Imprime `dV/dt` donde debe ser `dh/dt` | Si se codifica literal, el integrador queda escalado por `A` (factor 10) |
| P2 | Unidades inconsistentes | `rho = 1 g/cm3` frente a flujos en `m3/h`; `tau_p = 1 min` frente a flujos por hora; unidades de `K` sin declarar | No se puede simular sin decidir conversion. `K * sqrt(h)` debe dar `m3/h`, luego `K` debe ser `m^2.5/h` |
| P3 | `tau_p` contradice los parametros | Linealizado: `tau = 2 * A * sqrt(h_bar) / K = 2*10*sqrt(5)/4.47 = 10 h`, no 1 min | Respuesta 600 veces mas lenta o mas rapida segun que numero se obedezca |
| P4 | `H(s)` pedida pero no derivada | No hay linealizacion en el documento | Bloquea la comparacion no lineal vs lineal vs analitico |
| P5 | Faltan condiciones iniciales y excitacion | Sin `h(0)`, sin perfil de `Qi(t)`, sin horizonte, paso ni solver | No hay simulacion reproducible |
| P6 | Nomenclatura y referencias | `h_bar_i` frente a `h_bar`; referencia `[1]` sin bibliografia; Fig. 1 solo como imagen sin datos de geometria | Ambiguedad para citar y para reconstruir valvula/entrada |
| P7 | Restriccion implicita sin manejo en borde | `0 <= h <= Hmax`, `sqrt(h)` en `h = 0` | Riesgo de `NaN` y de sobrepasar `Hmax` si no se limita |

## 4. Correcciones propuestas

| Problema | Correccion |
|----------|------------|
| P1 | Leer (5) como `rho * A * dh/dt = rho * (Qi - Qo)`. Corregir en el informe |
| P2 | Tratar `rho` como 1 adimensional con comentario explicito. Declarar `K` en `m^2.5/h`. Elegir una unidad canonica de tiempo y sostenerla: recomendado horas para respetar `m3/h`, o convertir todo a minutos (`Q` en `m3/min`) |
| P3 | Adoptar `tau = 10 h` como consecuencia de `A, K, h_bar`, o pedir a la profesora cual valor manda. No usar `1 min` y `10 m3/h` a la vez sin conversion |
| P4 | Linealizar alrededor del punto de operacion: `sqrt(h) ~= sqrt(h_bar) + (h - h_bar)/(2*sqrt(h_bar))`. Forma desviacion: `d(dh)/dt = (-K/(2*A*sqrt(h_bar))) * dh + dQi/A`. Funcion de transferencia: `H(s) = (1/A) / (s + K/(2*A*sqrt(h_bar)))` |
| P5 | Supuestos minimos para arrancar (declararlos en el informe): `h(0) = 5 m`, escalon `Qi: 10 -> 12 m3/h` en `t = 0`, horizonte `50 h`, paso fijo documentado, solver explicito (Euler/RK45) |
| P6 | Unificar a `h_bar`, agregar bibliografia de Torricelli y describir Fig. 1 en texto (diametro, orificio, posicion de entrada) |
| P7 | Limitar `h` a `[0, Hmax]` en codigo, proteger `sqrt(max(h, 0))`, validar equilibrio `Qi = 10 => h -> 5` como prueba de aceptacion |

## 5. Lista de verificacion

- [ ] Unidad de tiempo canonica elegida y aplicada en `Q`, `K`, `tau` y graficas
- [ ] Ec. (5) corregida en el informe
- [ ] `H(s)` derivada por linealizacion y documentada
- [ ] `h(0)`, escalon de `Qi`, horizonte y solver declarados
- [ ] Equilibrio `10 m3/h -> 5 m` verificado en codigo
- [ ] `h` limitada a `[0, 10]` sin `NaN` en cero
- [ ] Prompts y toolchain guardados desde el dia 1 para la tarea (b)

## 6. Siguiente paso

Fijar los supuestos de la seccion 4 (P5) y construir el incremento minimo: integrar `dh/dt = (Qi - K*sqrt(h))/A` y graficar `h(t)`. Despues agregar el modelo linealizado para la comparacion triple.

## 7. Toolchain declarado (tarea b)

| Herramienta | Uso | Estado |
|-------------|-----|--------|
| v0 | Generacion del diseno UI del simulador (pagina unica, sin backend) | En uso desde 2026-10-05. Prompt registrado en la conversacion. Salida pendiente de pegar en el repo |
| Prompts | Todos los prompts (v0 + agentes) se guardan para el informe de ingenieria inversa | Activo: este prompt de v0 es el prompt #1 del rebuild |
