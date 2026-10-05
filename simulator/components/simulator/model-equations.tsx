import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  OPERATING_FLOW,
  OPERATING_HEIGHT,
  formatNumber,
  type TankParameters,
} from '@/lib/water-tank-model'

type ModelEquationsProps = {
  parameters: TankParameters
  timeConstant: number
}

function Equation({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-sm text-foreground">
        {children}
      </code>
    </div>
  )
}

export function ModelEquations({ parameters, timeConstant }: ModelEquationsProps) {
  const { area, dischargeCoefficient: coefficient } = parameters
  const pole = coefficient / (2 * area * Math.sqrt(OPERATING_HEIGHT))
  const gain = 1 / area

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelo y supuestos</CardTitle>
        <CardDescription>
          Balance de masa con descarga por orificio (Torricelli). ρ constante y adimensional (ρ = 1), A
          uniforme, unidades canónicas: m, m³/h, h.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Equation label="Modelo no lineal (EDO integrada con paso fijo)">
          {'dh/dt = Qi(t)/A − (K/A)·√(max(h, 0)),   0 ≤ h ≤ Hmax'}
        </Equation>
        <Equation label="Punto de operación">
          {`Q̄ = K·√h̄ → h̄ = ${formatNumber(OPERATING_HEIGHT)} m, Q̄ = ${formatNumber(OPERATING_FLOW)} m³/h`}
        </Equation>
        <Equation label="Linealización (variables de desviación Δh, ΔQi)">
          {'dΔh/dt = ΔQi/A − (K / (2·A·√h̄))·Δh'}
        </Equation>
        <Equation label="Función de transferencia">
          {`H(s) = ΔH(s)/ΔQi(s) = (1/A) / (s + K/(2·A·√h̄)) = ${formatNumber(gain, 3)} / (s + ${formatNumber(pole, 4)})`}
        </Equation>
        <Equation label="Constante de tiempo">
          {`τ = 2·A·√h̄ / K = ${formatNumber(timeConstant, 2)} h`}
        </Equation>
        <Equation label="Respuesta analítica (Laplace inversa, escalón ΔQi en t = 0)">
          {'h(t) = h̄ + (h(0) − h̄)·e^(−t/τ) + (ΔQ·τ/A)·(1 − e^(−t/τ)),   ΔQ = Qi − Q̄'}
        </Equation>
        <Separator />
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li>
            Protección numérica: la raíz se evalúa como √(max(h, 0)) para evitar NaN si el integrador
            propone h &lt; 0; después de cada paso h se recorta a [0, Hmax].
          </li>
          <li>
            La curva lineal integra la EDO linealizada con el mismo integrador; la curva analítica es la
            expresión cerrada. Deben coincidir salvo error de discretización.
          </li>
          <li>
            Validación: con Qi = Q̄ = 10 m³/h, K = 4,47 y A = 10 el modelo no lineal converge a h ≈ 5 m
            desde cualquier condición inicial (h∞ = (Qi/K)²).
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
