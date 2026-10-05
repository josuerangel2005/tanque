import { InfoIcon, TriangleAlertIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { formatNumber, type SolverMethod } from '@/lib/water-tank-model'

type LinearizationNoteProps = {
  deviation: number
  linearizationError: number
  timeConstant: number
  operatingHeight: number
  method: SolverMethod
}

const FAR_FROM_OPERATING_POINT_RATIO = 0.5
const SIGNIFICANT_ERROR_RATIO = 0.1

export function LinearizationNote({
  deviation,
  linearizationError,
  timeConstant,
  operatingHeight,
  method,
}: LinearizationNoteProps) {
  const farAway =
    deviation > FAR_FROM_OPERATING_POINT_RATIO * operatingHeight ||
    linearizationError > SIGNIFICANT_ERROR_RATIO * operatingHeight

  return (
    <Alert variant={farAway ? 'destructive' : 'default'}>
      {farAway ? <TriangleAlertIcon /> : <InfoIcon />}
      <AlertTitle>
        {farAway
          ? 'La trayectoria se aleja del punto de operación'
          : 'Linealización válida en el entorno del punto de operación'}
      </AlertTitle>
      <AlertDescription>
        <p>
          Desviación máxima |h − h̄| = {formatNumber(deviation)} m respecto a h̄ ={' '}
          {formatNumber(operatingHeight)} m. Error máximo entre modelo no lineal y linealizado:{' '}
          <span className="font-mono tabular-nums">{formatNumber(linearizationError, 3)} m</span>.
          Constante de tiempo τ = {formatNumber(timeConstant, 2)} h; integrador {method === 'rk4' ? 'RK4' : 'Euler'}.
        </p>
        {farAway && (
          <p>
            El modelo lineal H(s) solo aproxima bien la dinámica cerca de h̄: lejos de ese punto la
            raíz √h no se parece a su recta tangente y la ganancia estática real (h∞ = (Qi/K)²)
            difiere de la lineal (h̄ + ΔQi·τ/A).
          </p>
        )}
      </AlertDescription>
    </Alert>
  )
}
