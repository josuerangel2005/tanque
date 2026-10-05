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

## Registro — sesión de construcción (agente local + v0)

Prompts usados en la sesión de construcción con el agente local. Redacción normalizada a partir de las instrucciones originales (errores de digitación corregidos, intención y resultado intactos).

| # | Prompt refinado | Resultado generado |
|---|---|---|
| 6 | "Analice el contenido del documento `.docx` del modelo matemático del tanque." | Extracción de 75 párrafos, 10 ecuaciones y diagrama; modelo final `dh/dt = Qi/A − (K/A)·√h`; parámetros y verificación `K = 10/√5 = 4.47`; ambigüedades bloqueantes (`H(s)` sin derivar, `h(0)` y perfil de `Qi` faltantes). |
| 7 | "Según lo asignado, ¿qué debería hacer para iniciar?" | Ruta rápida: fijar unidad canónica y supuestos, validar equilibrio `Qi = 10 → h = 5`, documentar prompts desde el día 1, incremento mínimo (solo ODE no lineal + gráfica). |
| 8 | "Genere un `.md` con todo el contexto, los problemas presentes y posibles correcciones." | `CONTEXTO_TANQUE.md`: 7 problemas (P1–P7) con evidencia e impacto, tabla de correcciones, `H(s)` linealizada y supuestos mínimos de arranque. |
| 9 | "Analice el archivo `RUTA_TALLER_TANQUE.md` en Descargas y valide la información." | Validación: ruta correcta y coherente; matiz `R ≈ 1 h/m²` frente a `τ_p = 1 min` (magnitudes distintas); omisiones detectadas (`ρ`, typo ec. 5, unidades de `K`). |
| 10 | "Según el documento, ¿se requiere frontend + backend?" | No: página única sin backend, con justificación (ODE escalar, sin base de datos ni usuarios; front + backend sería sobredimensionar). |
| 11 | "Tengo v0 para el diseño: deme el prompt para enviárselo y documente que usamos v0." | Prompt de v0 (ver texto íntegro abajo) + registro de toolchain en `CONTEXTO_TANQUE.md` §7 como prompt n.º 1 de la evidencia. |
| 12 | "Ejecute `git pull`." | Diagnóstico inicial sin remoto ni tracking; luego pull exitoso contra `origin` (`github.com:josuerangel2005/tanque`). |
| 13 | "Genere una estructura de carpetas adecuada para este proyecto." | `simulator/` (código v0, página única) y `entrega/` (PDF final), con `.gitkeep`; respeto a `docs/` existente. |
| 14 | "Haga `git commit` y `push`." | Commit `33dda60` (`chore: contexto, estructura y base openspec`), 5 archivos a `origin/main`; `.atl/` excluido por ser estado local. |
| 15 | "Una vez generado en v0, ¿lo descargo como `.zip` para pasárselo?" | Sí: `Export → Download as ZIP` hacia `simulator/`; alternativa `Push/Deploy` para obtener el enlace ejecutable de la tarea (b). |
| 16 | "El `.zip` ya está en Descargas; migrarlo e integrarlo en nuestra estructura." | `water-tank-simulator.zip` (39 archivos, Next.js 16 + React 19) integrado en `simulator/`; `.gitkeep` eliminado; rutas protegidas intactas; pendiente `pnpm install`. |
| 17 | "Valide el contexto matemático." | `simulator/lib/water-tank-model.ts` validado línea por línea: constantes, ODE con `√max(h,0)` y clamp, `H(s)`, `τ = 10 h`, equilibrio y analítica correctos; sin residuos de `τ = 1 min`. Hallazgos menores: nombre `dischargeCoefficient` (guarda `K`, no `c`) y punto de operación como constante de módulo. |
| 18 | "Refactorice los botones con `cursor-pointer` centralizado en el CSS (usa Tailwind)." | Regla base en `simulator/app/globals.css` (`@layer base`): `button`/`[role=button]` con `pointer`, deshabilitados con `not-allowed`. |
| 19 | "También `cursor-pointer` en los selectores de incrementar/decrementar de parámetros." | Spin buttons nativos WebKit con `cursor: pointer` en el mismo bloque base (Firefox no expone pseudo-elemento: limitación del navegador). |
| 20 | "Pase la página y sus componentes por las skills de impeccable y taste." | Auditoría read-only: 3 CRÍTICOS (gráficas dark en grises indistinguibles, `aria-live` inundando lectores, tema oscuro incoherente) y avisos (responsive <768px, táctil 44px, `aria-invalid` por campo, transiciones en geometría SVG). Sin cambios en esta fase. |
| 21 | Alcance de corrección elegido: todo (críticos + avisos). | 8 archivos en `simulator/` corregidos; `tsc --noEmit` limpio; oscuros con tonos propios, `aria-live` solo al estabilizar, responsive y `cursor: not-allowed` operativo. |
| 22 | "En las medidas del tanque no hay contraste (texto azul sobre agua azul)." | Etiquetas `h̄`/`h∞` con halo del color de la tarjeta y texto principal (11 px); se conserva el aviso de rebose en ámbar. |
| 23 | "Las dos líneas punteadas tampoco resaltan (naranja y azul)." | Riel sólido color tarjeta bajo cada línea + grosor mayor; colores y significado intactos (gris = referencia, azul = equilibrio, naranja = rebose). |
| 24 | "Asegure una bitácora con los prompts usados acá y el de v0, refinados." | Esta actualización. |

### Prompt íntegro enviado a v0 (prompt n.º 1 del rebuild)

```text
Build a single-page water tank simulator (client-side only, no backend) for a university modeling assignment. UI labels in neutral Spanish.

Reading this as: engineering lab tool for students, with a clean technical-instrument language, leaning toward Tailwind + shadcn-style controls, light mode, high readability over decoration.

Layout: header with title + equilibrium badge, left control panel, center tank visualization with animated water level, right/bottom chart with overlay of 3 curves.

Physics (canonical unit: hours):
- Nonlinear ODE: dh/dt = Qi(t)/A - (K/A)*sqrt(max(h,0)), clamp h to [0, Hmax]
- Parameters: A=10 m2, K=4.47 m2.5/h, Hmax=10 m, operating point h_bar=5 m, Q_bar=10 m3/h
- Linearized model: H(s) = (1/A)/(s + K/(2*A*sqrt(h_bar))), tau = 2*A*sqrt(h_bar)/K = 10 h
- Defaults: h(0)=5 m, step Qi: 10 -> 12 m3/h at t=0, horizon 50 h, solver RK4/Euler in JS with fixed dt
- Show: nonlinear h(t), linear H(s) step response, analytic inverse-Laplace h(t) on the same chart; linearization error note far from h_bar
- Validation badge: Qi=10 must converge to h=5; show protection sqrt(max(h,0))

Controls (editable): A, K, Hmax, h(0), Qi base, Qi step size, horizon. Buttons: run, reset. No purple gradients, no centered hero, no placeholder graphics. Real chart (recharts or canvas), real tank SVG animation, responsive, WCAG AA contrast, Spanish labels, equations shown with assumptions (rho treated as dimensionless 1, hours canonical).
```

## Ingeniería inversa (en curso — pasos 3/6 de la ruta de trabajo)

Programa obtenido con **v0** (prompt n.º 1 de arriba) e integrado en `simulator/`:

- Método numérico: RK4 (por defecto) y Euler explícito (conmutable), paso fijo `Δt = 0.05 h`, implementados en `simulator/lib/water-tank-model.ts` (`integrateStep`, `simulateTank`).
- Estructura: `TankParameters` + `DEFAULT_PARAMETERS` (A = 10, K = 4.47, Hmax = 10, h(0) = 5, base 10, escalón +2, horizonte 50), `SimulationPoint { time, nonlinear, linear, analytic }`, funciones `getEquilibriumHeight`, `validatesReferenceEquilibrium`, `getLinearizationTimeConstant`, `getLinearizationError`.
- Supuestos del agente verificados contra la teoría: usa horas como unidad canónica, `ρ` ausente (tratado como 1 adimensional), `√max(h,0)` con clamp `[0, Hmax]`, punto de operación `h̄ = 5` / `Q̄ = 10` como constantes de módulo.
- Comparación línea a línea: registrada en la validación del prompt n.º 17 (constantes, ODE, `H(s)`, `τ = 10 h`, equilibrio `(Q/K)²`, analítica del sistema de primer orden) — sin discrepancias matemáticas; solo el nombre `dischargeCoefficient` guarda `K` (no `c`) y el punto de operación está fijo en el módulo.
- Correcciones posteriores del agente local (prompts n.º 18–23): cursor centralizado, spin buttons, auditoría impeccable/taste con 3 críticos y avisos corregidos (`tsc` limpio), contraste de etiquetas y líneas del tanque.

Pendiente de la actividad 6: captura de pantalla o transcripción de la respuesta literal de v0 al prompt n.º 1 (esta bitácora conserva el prompt; el programa resultante vive en `simulator/`).
