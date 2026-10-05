'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ControlPanel, type ParameterDraft } from '@/components/simulator/control-panel'
import { TankVisualization } from '@/components/simulator/tank-visualization'
import { ResponseChart } from '@/components/simulator/response-chart'
import { ModelEquations } from '@/components/simulator/model-equations'
import { LinearizationNote } from '@/components/simulator/linearization-note'
import {
  DEFAULT_PARAMETERS,
  FIXED_STEP_HOURS,
  OPERATING_HEIGHT,
  formatNumber,
  getEquilibriumHeight,
  getLinearizationError,
  getLinearizationTimeConstant,
  isValidParameters,
  maxOperatingDeviation,
  sampleAtTime,
  simulateTank,
  validatesReferenceEquilibrium,
  type SolverMethod,
  type TankParameters,
} from '@/lib/water-tank-model'

const PLAYBACK_SECONDS = 6

function toDraft(parameters: TankParameters): ParameterDraft {
  return {
    area: String(parameters.area),
    dischargeCoefficient: String(parameters.dischargeCoefficient),
    maxHeight: String(parameters.maxHeight),
    initialHeight: String(parameters.initialHeight),
    baseFlow: String(parameters.baseFlow),
    stepFlow: String(parameters.stepFlow),
    horizon: String(parameters.horizon),
  }
}

function parseDraft(draft: ParameterDraft): TankParameters {
  return {
    area: Number(draft.area),
    dischargeCoefficient: Number(draft.dischargeCoefficient),
    maxHeight: Number(draft.maxHeight),
    initialHeight: Number(draft.initialHeight),
    baseFlow: Number(draft.baseFlow),
    stepFlow: Number(draft.stepFlow),
    horizon: Number(draft.horizon),
  }
}

export function TankSimulator() {
  const [draft, setDraft] = useState<ParameterDraft>(() => toDraft(DEFAULT_PARAMETERS))
  const [method, setMethod] = useState<SolverMethod>('rk4')
  const [applied, setApplied] = useState<{ parameters: TankParameters; method: SolverMethod }>({
    parameters: DEFAULT_PARAMETERS,
    method: 'rk4',
  })
  const [playhead, setPlayhead] = useState(DEFAULT_PARAMETERS.horizon)
  const [isPlaying, setIsPlaying] = useState(false)
  const frameRef = useRef<number | null>(null)

  const points = useMemo(
    () => simulateTank(applied.parameters, applied.method),
    [applied],
  )
  const referenceOk = useMemo(() => validatesReferenceEquilibrium(), [])

  const parsedDraft = parseDraft(draft)
  const draftIsValid = isValidParameters(parsedDraft)

  const { parameters } = applied
  const finalFlow = parameters.baseFlow + parameters.stepFlow
  const equilibriumHeight = getEquilibriumHeight(finalFlow, parameters.dischargeCoefficient)
  const equilibriumClamped = Math.min(equilibriumHeight, parameters.maxHeight)
  const overflows = equilibriumHeight > parameters.maxHeight
  const timeConstant = getLinearizationTimeConstant(parameters)
  const linearizationError = getLinearizationError(points)
  const deviation = maxOperatingDeviation(points)
  const current = sampleAtTime(points, playhead)
  const settled =
    Math.abs(current.nonlinear - equilibriumClamped) < 0.01 * Math.max(equilibriumClamped, 1)

  const stopPlayback = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    setIsPlaying(false)
  }, [])

  const run = useCallback(() => {
    if (!draftIsValid) return
    stopPlayback()
    const nextParameters = parsedDraft
    setApplied({ parameters: nextParameters, method })
    setIsPlaying(true)
    setPlayhead(0)
    const started = performance.now()
    const tick = (now: number) => {
      const fraction = Math.min(1, (now - started) / (PLAYBACK_SECONDS * 1000))
      setPlayhead(fraction * nextParameters.horizon)
      if (fraction < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        frameRef.current = null
        setIsPlaying(false)
      }
    }
    frameRef.current = requestAnimationFrame(tick)
  }, [draftIsValid, method, parsedDraft, stopPlayback])

  const reset = useCallback(() => {
    stopPlayback()
    setDraft(toDraft(DEFAULT_PARAMETERS))
    setMethod('rk4')
    setApplied({ parameters: DEFAULT_PARAMETERS, method: 'rk4' })
    setPlayhead(DEFAULT_PARAMETERS.horizon)
  }, [stopPlayback])

  useEffect(() => stopPlayback, [stopPlayback])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Modelado de sistemas dinámicos · Práctica
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-balance md:text-2xl">
              Simulador de tanque con descarga por gravedad
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="gap-2 font-mono"
              aria-live="polite"
            >
              <span
                aria-hidden="true"
                className={
                  settled && !overflows
                    ? 'size-2 rounded-full bg-primary'
                    : 'size-2 rounded-full bg-warning'
                }
              />
              {overflows
                ? `Rebose: h∞ = ${formatNumber(equilibriumHeight)} m > Hmax`
                : settled
                  ? `Equilibrio alcanzado · h∞ = ${formatNumber(equilibriumClamped)} m`
                  : `Transitorio · h∞ = ${formatNumber(equilibriumClamped)} m`}
            </Badge>
            <Badge
              variant={referenceOk ? 'secondary' : 'destructive'}
              className="font-mono"
            >
              {referenceOk
                ? 'Validación: Qi = 10 m³/h → h = 5 m'
                : 'Validación fallida'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 gap-4 px-4 py-4 md:px-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_minmax(0,1.3fr)]">
        <aside className="flex flex-col gap-4">
          <ControlPanel
            draft={draft}
            onDraftChange={setDraft}
            method={method}
            onMethodChange={setMethod}
            onRun={run}
            onReset={reset}
            isValid={draftIsValid}
            isPlaying={isPlaying}
            fixedStep={FIXED_STEP_HOURS}
          />
        </aside>

        <section
          aria-label="Visualización del tanque"
          className="flex flex-col gap-4"
        >
          <TankVisualization
            height={current.nonlinear}
            maxHeight={parameters.maxHeight}
            operatingHeight={OPERATING_HEIGHT}
            equilibriumHeight={equilibriumClamped}
            inflow={finalFlow}
            outflow={parameters.dischargeCoefficient * Math.sqrt(Math.max(current.nonlinear, 0))}
            time={playhead}
            horizon={parameters.horizon}
            overflows={overflows}
            isPlaying={isPlaying}
          />
        </section>

        <section
          aria-label="Respuesta temporal y modelo"
          className="flex flex-col gap-4 lg:col-span-2 xl:col-span-1"
        >
          <ResponseChart
            points={points}
            playhead={playhead}
            maxHeight={parameters.maxHeight}
            operatingHeight={OPERATING_HEIGHT}
          />
          <LinearizationNote
            deviation={deviation}
            linearizationError={linearizationError}
            timeConstant={timeConstant}
            operatingHeight={OPERATING_HEIGHT}
            method={applied.method}
          />
          <ModelEquations parameters={parameters} timeConstant={timeConstant} />
        </section>
      </main>
    </div>
  )
}
