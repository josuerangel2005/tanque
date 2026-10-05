# Análisis, inconsistencias y correcciones

Este documento consolida dos análisis independientes del modelo del tanque (uno propio, verificando la derivación simbólica; otro de contexto previo — `CONTEXTO_TANQUE.md` — centrado en huecos de implementación) más las correcciones hechas por el usuario sobre ambos. Donde los dos análisis se solapan, llegan al mismo resultado por caminos independientes, lo cual es evidencia fuerte de que esos hallazgos son correctos.

## 1. Verificación de las ecuaciones (1)-(10)

| Ecuación | Verificación |
|---|---|
| (1)-(4) | Correctas: son solo definiciones (masa, volumen, derivada). |
| (5) balance de masa | Forma correcta: `ρA·dh/dt = ρ(Qi − Qo)`. El `.docx` original trae un error de transcripción: imprime `dV/dt` donde debe ir `dh/dt` (hallazgo P1 de `CONTEXTO_TANQUE.md`, confirmado de forma independiente). |
| (6)-(8) Torricelli | Correctas y consistentes entre sí. |
| (9) sustitución | Correcta: sustituir (8) en (5) da exactamente esa expresión. |
| (10) ecuación final (ρ=1) | Correcta: dividir (9) por `A` da `ḣ = Qi/A − (K/A)√h`. |

**Validación numérica del punto de equilibrio:**

$$K\sqrt{h_i} = 4.47\sqrt{5} = 9.996 \approx 10 = Q_o$$

El valor `K = 4.47` es consistente con `Qo = 10 m³/h` y `h_i = 5 m`. ✅

## 2. Inconsistencias detectadas

| # | Problema | Evidencia | Impacto |
|---|---|---|---|
| P1 | Ec. (5) con lado izquierdo incorrecto en el `.docx` original | Imprime `dV/dt` donde debe ser `dh/dt` | Si se codifica literal, el integrador queda mal escalado |
| P2 | Unidades de `ρ` y de `K` sin declarar | `ρ = 1 g/cm³` frente a flujos en `m³/h`; unidades de `K` no declaradas | `ρ` se cancela algebraicamente al dividir por `ρA` (su valor y unidades son irrelevantes para la ecuación 10 que se simula), **pero `K` sí debe declararse en `m²·⁵/h`** para que `K√h` dé `m³/h` |
| P3 | `τ_p = 1 min` no es compatible con `A, K, h_i` dados | Linealizando: `τ = 2A√h_i / K = 2(10)√5/4.47 ≈ 10` (en horas, porque `Qi` está en `m³/h`) | Respuesta ~600 veces más lenta o más rápida según qué dato se obedezca |
| P4 | `H(s)` pedida pero no derivada en el documento fuente | No hay linealización en el enunciado | Bloquea la comparación no lineal vs. lineal vs. analítico (actividad 4) |
| P5 | Faltan condiciones iniciales y excitación | Sin `h(0)`, sin perfil de `Qi(t)`, sin horizonte, paso ni solver | No hay simulación reproducible sin fijar supuestos |
| P6 | Nomenclatura y referencias | `h_i` vs. `h̄` en distintas fuentes; referencia `[1]` sin bibliografía; Fig. 1 solo como imagen, sin datos de geometría | Ambigüedad para citar y para describir la válvula/entrada en el informe |
| P7 | Restricción implícita sin manejo en el borde | `0 ≤ h ≤ H`; `√h` no está definida para `h < 0` | Riesgo de `NaN` y de sobrepasar `H` si no se limita numéricamente |

### Nota sobre P3 — precisión del hallazgo

`R ≈ 1` (resistencia de la válvula linealizada, `R = 2√h_i/K ≈ 1 h/m²`) y `τ_p` (constante de tiempo, `τ = A·R ≈ 10 h`) **no son dos valores alternativos de lo mismo** — son magnitudes distintas. La pregunta correcta para el docente es:

> "¿Manda `τ_p = 1 min`, o mandan `A, K, h_i` (que dan `τ ≈ 10 h`)?"

sin mezclar `R` en esa pregunta, porque confundiría más de lo que aclara.

## 3. Correcciones propuestas (no aplicadas en silencio — reportar en el informe)

| Problema | Corrección |
|---|---|
| P1 | Usar (5) en la forma `ρA·dh/dt = ρ(Qi − Qo)` y señalar el error de transcripción del `.docx` en el informe. |
| P2 | Declarar `K` en `m²·⁵/h`. Tratar `ρ` como factor que se cancela (irrelevante para la simulación). Unidad de tiempo canónica: **horas**, coherente con `Qi, Qo` en `m³/h`. |
| P3 | Reportar la discrepancia en el informe (no "corregir" el dato del docente unilateralmente). Presentar ambos valores: el dado (`1 min`) y el verificado (`≈10 h`), señalando la inconsistencia. |
| P4 | Linealizar `√h ≈ √h_i + (h − h_i)/(2√h_i)` alrededor de `h_i = 5 m`. Resultado: `H(s) = (1/A) / (s + K/(2A√h_i))`. |
| P5 | Fijar supuestos mínimos: `h(0) = 5 m`, escalón `Qi: 10 → 12 m³/h` en `t=0`, horizonte `50 h` (`= 5·τ`, llega a estacionario), solver RK45 o Euler. |
| P6 | Unificar notación a `h_i`, agregar bibliografía de Torricelli, describir la Fig. 1 en texto (diámetro, orificio, posición de entrada). |
| P7 | Limitar `h` al rango `[0, 10]` en código y proteger `sqrt(max(h, 0))`. |

## 4. Conjunto de verdades consolidado

**Correcto, sin tocar:**
- Ecuaciones (1)-(10), forma final `ḣ = Qi/A − (K/A)√h`.
- `K = 4.47 (m²·⁵/h)`, consistente con `Qi = Qo = 10 m³/h`, `h_i = 5 m`.

**Inconsistencia confirmada (reportar, no corregir en silencio):**
- `τ_p = 1 min` no es compatible con `A, K, h_i`. El valor que sí sale de esos datos es `τ ≈ 10 h`.

**Supuestos que el taller no da y hay que fijar:**
- `h(0) = 5 m` (parte en equilibrio).
- Escalón de entrada: `Qi: 10 → 12 m³/h` en `t = 0`.
- Horizonte: `50 h` (`≈5τ`); con `Qi = 12`, el nuevo equilibrio es `h = (12/4.47)² ≈ 7.2 m`, dentro de `H = 10 m`.
- Límite numérico `h ∈ [0, 10]`, protegiendo `√(max(h, 0))`.
- Solver: RK45 (o Euler simple, útil para la ingeniería inversa del paso 6).

## 5. Lista de verificación

- [ ] Unidad de tiempo canónica elegida y aplicada en `Q`, `K`, `τ` y en todas las gráficas.
- [ ] Ec. (5) corregida y explicada en el informe.
- [ ] `H(s)` derivada por linealización y documentada.
- [ ] `h(0)`, escalón de `Qi`, horizonte y solver declarados.
- [ ] Equilibrio `10 m³/h → 5 m` verificado en código.
- [ ] `h` limitada a `[0, 10]` sin `NaN` en `h=0`.
- [ ] Discrepancia de `τ_p` reportada al docente y documentada en el informe.
- [ ] Prompts y toolchain del agente de IA guardados desde el primer uso.
