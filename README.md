# Taller 3 — Modelado y simulación del tanque de agua

Documentación del Trabajo 3 de la asignatura (modelado y simulación de sistemas continuos): un tanque de distribución de agua modelado por balance de masa + ley de Torricelli.

## Contenido del repositorio

| Archivo | Contenido |
|---|---|
| [`docs/01-modelo-matematico.md`](docs/01-modelo-matematico.md) | Transcripción fiel del modelo matemático entregado por el docente: ecuaciones (1)-(10), tabla de parámetros, actividades solicitadas, entrega y exposición. |
| [`docs/02-analisis-y-correcciones.md`](docs/02-analisis-y-correcciones.md) | Verificación de cada fórmula y dato, inconsistencias detectadas, correcciones propuestas y tabla de verificación cruzada entre dos análisis independientes. |
| [`docs/03-ruta-de-trabajo.md`](docs/03-ruta-de-trabajo.md) | Organigrama de 7 pasos para resolver el taller: supuestos → H(s) → ODE no lineal → h(t) lineal → comparación → agente IA → entrega. Incluye herramientas por paso. |
| [`docs/04-bitacora-prompts.md`](docs/04-bitacora-prompts.md) | Registro de prompts usados con el agente de IA, tal como exige la actividad 7 del taller (documentar prompts, superagente utilizado e ingeniería inversa). |

## Resumen del estado actual

- **Modelo verificado:** ecuaciones (1)-(10) correctas y consistentes; `K = 4.47` validado contra `Qo=10 m³/h`, `h_i=5 m`.
- **Inconsistencia detectada y pendiente de confirmar con el docente:** `τ_p = 1 min` no es compatible con `A, K, h_i` dados (el valor consistente es `τ ≈ 10 h`).
- **Supuestos fijados para poder simular** (no estaban en el enunciado): `h(0)=5 m`, escalón `Qi: 10→12 m³/h`, horizonte `50 h`, límites `h∈[0,10]`, protección de `sqrt`.
- **Próximo paso:** implementar la ODE no lineal (paso 3 de la ruta de trabajo) y/o avanzar con el agente de IA + ingeniería inversa (paso 6).

## Entrega del taller

- Formato: un solo PDF (informe + diapositivas).
- Fecha: viernes 9 de octubre de 2026, exposición de 10 minutos, en parejas.
