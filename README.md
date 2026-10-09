# Taller 3 — Modelado y simulación del tanque de agua

Trabajo 3 de modelado y simulación de sistemas continuos: un tanque de distribución de agua modelado por balance de masa y ley de Torricelli, simulado en Simulink y con un simulador web generado con un superagente de IA.

**Simulador en línea:** <https://tanque-six.vercel.app/>

## Integrantes

- Yenderson Josué Rangel Martínez (1127045112)
- Kevin Sebastian Medina Nava (1093294593)
- Cristian Julián Camargo García (1093592686)

## Contenido del repositorio

| Ruta | Contenido |
|---|---|
| [`entrega/`](entrega/) | Documentos finales: el informe (`informe_tanque.docx` y `informe_tanque.pdf`) y las diapositivas (`diapositivas_tanque.pptx`). |
| [`fuentes/`](fuentes/) | Fuentes para regenerar la entrega: texto del informe, scripts de construcción, capturas de Simulink y plantillas de la universidad. |
| [`simulator/`](simulator/) | Simulador web (Next.js, React y TypeScript). El modelo matemático está en `lib/water-tank-model.ts`. |
| [`Simulink/`](Simulink/) | Modelo de Simulink del tanque (`simulacion_tanqueAgua_completo.slx`), con la ecuación diferencial y la función de transferencia. |
| [`docs/`](docs/) | Enunciado de la docente (`Modelo matematico del Tanque.docx`) y documentación de trabajo: análisis y correcciones, ruta de trabajo, bitácora de prompts, guion de exposición y evidencias. |

## Resultados

- **Modelo:** `dh/dt = Qi/A − (K/A)·√h`, con `A = 10 m²` y `K = 4.47 m²·⁵/h`. El equilibrio del enunciado se cumple: `K·√5 ≈ 10 m³/h`.
- **Función de transferencia:** linealizando alrededor de 5 m, `H(s) = 0.1 / (s + 0.1)`, un sistema de primer orden con ganancia de 1 m por cada m³/h.
- **Respuesta analítica:** para un escalón de 10 a 12 m³/h, `h(t) = 5 + 2(1 − e^(−0.1t))`, con `t` en horas.
- **Comparación:** el modelo no lineal llega a 7.21 m y el lineal a 7.00 m. Coinciden cerca del punto de operación y se separan al alejarse de él.
- **Constante de tiempo:** el enunciado da `τ_p = 1 min`, que no es compatible con `A`, `K` y la altura de equilibrio. Se trabajó con `τ ≈ 10 h`, el valor que determinan esos parámetros; el informe lo justifica en la sección 3.1.

Las condiciones de simulación que el enunciado no define se fijaron así: `h(0) = 5 m`, escalón de `Qi` de 10 a 12 m³/h en `t = 0`, horizonte de 50 h y nivel limitado a `[0, 10]` m.

## Ejecutar el simulador en local

```bash
cd simulator
pnpm install
pnpm dev
```

## Regenerar la entrega

```bash
python3 fuentes/informe/build.py        # informe .docx (requiere pandoc)
python fuentes/diapositivas/build.py    # diapositivas .pptx (requiere python-pptx)
bash fuentes/generar_pdf.sh             # PDF único (requiere OnlyOffice y poppler)
```

El contenido del informe se edita en `fuentes/informe/informe.md`, y el de las diapositivas en `fuentes/diapositivas/build.py`.

## Entrega

- Formato: un solo PDF con el informe y las diapositivas.
- Fecha: viernes 9 de octubre de 2026, con exposición de 10 minutos.
