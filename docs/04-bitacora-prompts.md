# Bitácora de prompts — superagente de IA

Registro de los prompts usados con el agente de IA (Claude), exigido por la actividad 7 del taller ("Documentar el proceso completo: prompts introducidos, programa de simulación obtenido, superagente utilizado, ingeniería inversa y demás aspectos relevantes").

**Superagente utilizado:** Claude (claude.ai), modelo Claude Sonnet 5, con herramientas de archivos, análisis de datos y generación de artefactos/diagramas.

## Registro

| # | Prompt (resumen fiel) | Resultado generado |
|---|---|---|
| 1 | "Crea un plan de modelo de como realizar este taller del tanque de agua: 1) analiza la estructura del .md, 2) verifica viabilidad de fórmulas y datos, 3) corrige fallos si los hay, 4) crea un organizador de pasos, 5) genera cómo hacerlo y qué herramientas implementar." | Análisis de la estructura del `.md`, verificación simbólica de las ecuaciones (1)-(10), validación numérica de `K=4.47`, detección de la inconsistencia en `τ_p`, organizador de 8 pasos con herramientas sugeridas. |
| 2 | "Analiza este contexto de otro análisis diferente (`CONTEXTO_TANQUE.md`) donde esta IA marca algunos errores. Compara para saber quién tiene la verdad de los datos y formular." | Tabla comparativa entre ambos análisis, confirmación de que no hay contradicciones (coinciden en los puntos que comparten), adopción de los aportes adicionales de `CONTEXTO_TANQUE.md` (condiciones iniciales, manejo del borde `h=0`, nomenclatura), conjunto de verdades consolidado. |
| 3 | "Realiza un organigrama de ruta de procesos del taller para la simulación, herramientas como hacerlo paso a paso que debemos tener y demás. Genera solo esa ruta en formato .md" | Diagrama de flujo de 7 pasos (organigrama visual) + archivo `RUTA_TALLER_TANQUE.md` con la ruta, herramientas por paso. |
| 4 | Retroalimentación del usuario corrigiendo la ruta: separar la pregunta al docente sobre `τ_p` de `R` (son magnitudes distintas), y agregar como nota las omisiones de `CONTEXTO_TANQUE.md` (typo de la ec. 5, irrelevancia de `ρ`, unidades de `K`). | Corrección aplicada al punto 1 de la ruta de trabajo (`RUTA_TALLER_TANQUE.md` actualizado). |
| 5 | "En el taller se menciona sobre documentación del proyecto. Documenta todo lo que se ha discutido para después subirlo a un repo de GitHub." + enlace del repo `https://github.com/josuerangel2005/tanque.git` | Este conjunto de documentos (`README.md` + `docs/01-04`), estructurados para publicarse como repositorio de GitHub. |

## Ingeniería inversa (pendiente — paso 6 de la ruta de trabajo)

Cuando se use el agente de IA para generar el **programa de simulación** (código que resuelve la ODE no lineal y produce la gráfica), esta sección debe documentar:

- Método numérico utilizado por el agente (Euler explícito, RK4, `scipy.integrate.solve_ivp` con RK45, `ode45` de MATLAB, etc.).
- Estructura del código generado (funciones, parámetros de entrada, manejo de `h(0)`, protección de `sqrt`).
- Supuestos que el agente tomó por su cuenta (si los hubo) y cómo se verificaron contra el modelo teórico (ecs. 1-10) y los supuestos fijados en `02-analisis-y-correcciones.md`.
- Comparación línea a línea entre lo que el agente generó y lo que se esperaba teóricamente — esto es la "ingeniería inversa" que pide la actividad 6.

*(Esta sección se completará cuando se ejecute el paso 3/6 de la ruta de trabajo.)*
