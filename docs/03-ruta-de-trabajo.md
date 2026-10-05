# Ruta de procesos — Taller tanque de agua

## 1. Fijar supuestos y unidades
- Confirmar con el docente: **¿manda `τ_p = 1 min`, o mandan `A, K, h̄` (que dan `τ = A·R = 10 h`)?** No son dos valores alternativos de lo mismo — no mezclar con `R` en la pregunta, porque `R = 2√h̄/K ≈ 1 h/m²` es la resistencia linealizada, un objeto distinto de `τ`.
- Unidad de tiempo canónica: horas (coherente con `Qi, Qo` en m³/h).
- Declarar `h(0) = 5 m`, escalón `Qi: 10 → 12 m³/h` en `t=0`, horizonte de simulación (50 h = 5·τ, llega a estacionario; con `Qi=12` el nuevo equilibrio es `h=(12/4.47)²≈7.2 m`, dentro de `Hmax=10`), solver (RK45 o Euler).
- Limitar `h` al rango `[0, 10]` y proteger `sqrt(max(h,0))` para evitar NaN.
- **Notas para blindar el informe:** la ec. (5) del `.docx` original trae un error de transcripción (`dV/dt` donde debe ir `dh/dt`); `ρ=1 g/cm³` es irrelevante porque se cancela algebraicamente en la derivación (no afecta a `m³/h`); `K=4.47` debe declararse en unidades `m²·⁵/h`, no en SI.
- **Herramientas:** Markdown/Word para registrar supuestos; consulta directa al docente.

## 2. Linealizar y obtener H(s)
- Linealizar `dh/dt = Qi/A − (K/A)√h` alrededor de `h̄ = 5 m`.
- Resultado: `H(s) = (1/A) / (s + K/(2A√h̄))`.
- **Herramientas:** cálculo a mano, o verificación con `sympy` (Python) / Symbolic Math Toolbox (MATLAB).

## 3. Simular la ODE no lineal
- Implementar `dh/dt = Qi(t)/A − (K/A)√h(t)` y resolver numéricamente.
- Graficar `h(t)` ante el escalón de entrada.
- **Herramientas:** Simulink (bloques Integrator + MATLAB Function para `√h`) o Python con `scipy.integrate.solve_ivp`.

## 4. Simular h(t) a partir de H(s)
- Obtener la respuesta al escalón de la función de transferencia linealizada (transformada inversa de Laplace).
- **Herramientas:** `python-control` / `sympy.inverse_laplace_transform`, o MATLAB `step()`.

## 5. Comparar las tres respuestas
- Graficar en un mismo eje: ODE no lineal, respuesta de `H(s)`, y `h(t)` analítico.
- Analizar el error de linealización cerca y lejos del punto de operación.
- **Herramientas:** `matplotlib` / `plotly`, o gráficas nativas de Simulink/MATLAB.

## 6. Agente de IA + ingeniería inversa
- Usar un agente de IA (Claude, Claude Code, etc.) para generar el programa de simulación.
- Guardar **todos los prompts** usados, desde el primero.
- Documentar el método numérico que usó el agente (Euler, RK4, `ode45`...), estructura del código y supuestos tomados.
- **Herramientas:** Claude / Claude Code; archivo de registro de prompts.

## 7. Simulador ejecutable + informe en PDF
- Construir un simulador interactivo (ej. página HTML/JS) con control de `Qi` y gráfica en vivo de `h(t)` no lineal vs. linealizada.
- Publicar el simulador y obtener el enlace ejecutable.
- Unir informe (texto) + diapositivas en un único PDF.
- Entregar antes de la exposición del viernes 9 de octubre de 2026 (10 min, en parejas).
- **Herramientas:** página web/artefacto interactivo para el simulador; Word/PowerPoint o skills de docx/pptx/pdf para combinar informe y diapositivas en el PDF final.
