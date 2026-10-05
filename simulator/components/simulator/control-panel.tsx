'use client'

import { PlayIcon, RotateCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { SolverMethod } from '@/lib/water-tank-model'

export type ParameterDraft = {
  area: string
  dischargeCoefficient: string
  maxHeight: string
  initialHeight: string
  baseFlow: string
  stepFlow: string
  horizon: string
}

type FieldSpec = {
  key: keyof ParameterDraft
  label: string
  unit: string
  step: string
  min?: string
}

const PLANT_FIELDS: FieldSpec[] = [
  { key: 'area', label: 'Área A', unit: 'm²', step: '0.5', min: '0.1' },
  { key: 'dischargeCoefficient', label: 'Coeficiente K', unit: 'm²·⁵/h', step: '0.01', min: '0.01' },
  { key: 'maxHeight', label: 'Altura máxima Hmax', unit: 'm', step: '0.5', min: '0.1' },
]

const SCENARIO_FIELDS: FieldSpec[] = [
  { key: 'initialHeight', label: 'Nivel inicial h(0)', unit: 'm', step: '0.1', min: '0' },
  { key: 'baseFlow', label: 'Caudal base Qi', unit: 'm³/h', step: '0.5', min: '0' },
  { key: 'stepFlow', label: 'Escalón ΔQi en t = 0', unit: 'm³/h', step: '0.5' },
  { key: 'horizon', label: 'Horizonte', unit: 'h', step: '5', min: '1' },
]

type ControlPanelProps = {
  draft: ParameterDraft
  onDraftChange: (draft: ParameterDraft) => void
  method: SolverMethod
  onMethodChange: (method: SolverMethod) => void
  onRun: () => void
  onReset: () => void
  isValid: boolean
  isPlaying: boolean
  fixedStep: number
}

export function ControlPanel({
  draft,
  onDraftChange,
  method,
  onMethodChange,
  onRun,
  onReset,
  isValid,
  isPlaying,
  fixedStep,
}: ControlPanelProps) {
  const update = (key: keyof ParameterDraft, value: string) =>
    onDraftChange({ ...draft, [key]: value })

  const getFieldError = (key: keyof ParameterDraft): string | null => {
    const value = Number(draft[key])
    switch (key) {
      case 'area':
        return Number.isFinite(value) && value > 0 ? null : 'El área debe ser mayor que 0.'
      case 'dischargeCoefficient':
        return Number.isFinite(value) && value > 0
          ? null
          : 'El coeficiente K debe ser mayor que 0.'
      case 'maxHeight':
        return Number.isFinite(value) && value > 0 ? null : 'Hmax debe ser mayor que 0.'
      case 'initialHeight': {
        const max = Number(draft.maxHeight)
        if (!Number.isFinite(value) || value < 0)
          return 'El nivel inicial debe ser mayor o igual que 0.'
        if (Number.isFinite(max) && value > max)
          return 'El nivel inicial no puede superar Hmax.'
        return null
      }
      case 'baseFlow':
        return Number.isFinite(value) && value >= 0
          ? null
          : 'El caudal base debe ser mayor o igual que 0.'
      case 'stepFlow': {
        const base = Number(draft.baseFlow)
        if (!Number.isFinite(value)) return 'El escalón debe ser un número válido.'
        if (Number.isFinite(base) && base + value < 0)
          return 'Qi + ΔQi debe ser mayor o igual que 0.'
        return null
      }
      case 'horizon':
        return Number.isFinite(value) && value > 0 && value <= 500
          ? null
          : 'El horizonte debe estar entre 1 y 500 h.'
    }
  }

  const renderField = ({ key, label, unit, step, min }: FieldSpec) => {
    const error = getFieldError(key)
    const inputId = `field-${key}`
    const errorId = `field-${key}-error`
    return (
      <Field key={key} orientation="responsive">
        <FieldLabel htmlFor={inputId} className="flex-1 text-sm">
          {label}
        </FieldLabel>
        <div className="flex w-full items-center gap-2 @md/field-group:w-36">
          <Input
            id={inputId}
            type="number"
            inputMode="decimal"
            step={step}
            min={min}
            value={draft[key]}
            onChange={(event) => update(key, event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="font-mono text-right tabular-nums"
          />
          <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">{unit}</span>
        </div>
        {error && (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        )}
      </Field>
    )
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Parámetros</CardTitle>
        <CardDescription>
          Unidad canónica de tiempo: horas. Edite y pulse Ejecutar para recalcular.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onRun()
          }}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <FieldSet>
              <FieldLegend variant="label">Planta</FieldLegend>
              <FieldGroup>{PLANT_FIELDS.map(renderField)}</FieldGroup>
            </FieldSet>
            <FieldSet>
              <FieldLegend variant="label">Escenario</FieldLegend>
              <FieldGroup>{SCENARIO_FIELDS.map(renderField)}</FieldGroup>
            </FieldSet>
            <FieldSet>
              <FieldLegend variant="label">Integrador numérico</FieldLegend>
              <ToggleGroup
                value={[method]}
                onValueChange={(value) => {
                  const next = value[0]
                  if (next === 'rk4' || next === 'euler') onMethodChange(next)
                }}
                variant="outline"
                spacing={0}
                aria-label="Método de integración"
                className="w-full"
              >
                <ToggleGroupItem value="rk4" className="flex-1 font-mono pointer-coarse:min-h-11">
                  RK4
                </ToggleGroupItem>
                <ToggleGroupItem value="euler" className="flex-1 font-mono pointer-coarse:min-h-11">
                  Euler
                </ToggleGroupItem>
              </ToggleGroup>
              <FieldDescription className="font-mono text-xs">
                Paso fijo Δt = {fixedStep} h
              </FieldDescription>
            </FieldSet>
          </FieldGroup>
          <button type="submit" className="sr-only">
            Ejecutar simulación
          </button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            type="button"
            onClick={onRun}
            disabled={!isValid}
            className="pointer-coarse:min-h-11"
          >
            <PlayIcon data-icon="inline-start" />
            {isPlaying ? 'Reiniciar' : 'Ejecutar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="pointer-coarse:min-h-11"
          >
            <RotateCcwIcon data-icon="inline-start" />
            Restablecer
          </Button>
        </div>
        {!isValid && (
          <p role="alert" className="text-xs text-destructive">
            Revise los valores: A, K y Hmax deben ser positivos; 0 ≤ h(0) ≤ Hmax; Qi + ΔQi ≥ 0;
            horizonte entre 1 y 500 h.
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
