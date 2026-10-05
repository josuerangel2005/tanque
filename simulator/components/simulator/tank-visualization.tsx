'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/water-tank-model'

type TankVisualizationProps = {
  height: number
  maxHeight: number
  operatingHeight: number
  equilibriumHeight: number
  inflow: number
  outflow: number
  time: number
  horizon: number
  overflows: boolean
  isPlaying?: boolean
}

const VIEW_W = 320
const VIEW_H = 420
const TANK_X = 70
const TANK_Y = 50
const TANK_W = 180
const TANK_H = 300

export function TankVisualization({
  height,
  maxHeight,
  operatingHeight,
  equilibriumHeight,
  inflow,
  outflow,
  time,
  horizon,
  overflows,
  isPlaying = false,
}: TankVisualizationProps) {
  const fraction = Math.min(1, Math.max(0, height / maxHeight))
  const waterH = TANK_H * fraction
  const waterY = TANK_Y + TANK_H - waterH
  const levelY = (value: number) =>
    TANK_Y + TANK_H - TANK_H * Math.min(1, Math.max(0, value / maxHeight))
  const ticks = Array.from({ length: 6 }, (_, index) => (maxHeight * index) / 5)
  const inflowStroke = Math.max(2, Math.min(14, inflow * 0.7))
  const outflowStroke = Math.max(1, Math.min(14, outflow * 0.7))
  const operatingY = levelY(operatingHeight)
  const equilibriumY = levelY(equilibriumHeight)
  // Las etiquetas h̄ (ancla end, derecha) y h∞ (ancla start, izquierda) colisionan
  // en vertical cuando ambas alturas coinciden; se desplaza h∞ debajo de su línea.
  const markerLabelsCollide = Math.abs(operatingY - equilibriumY) < 14

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tanque</CardTitle>
        <CardDescription>
          Nivel del modelo no lineal en t = {formatNumber(time, 1)} h de {formatNumber(horizon, 0)} h
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label={`Tanque con nivel ${formatNumber(height)} metros de ${formatNumber(maxHeight)} máximos`}
          className="mx-auto w-full max-w-xs"
        >
          <defs>
            <linearGradient id="water-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--water)" />
              <stop offset="1" stopColor="var(--water-deep)" />
            </linearGradient>
            <clipPath id="tank-clip">
              <rect x={TANK_X} y={TANK_Y} width={TANK_W} height={TANK_H} />
            </clipPath>
          </defs>

          {/* Inflow pipe */}
          <path
            d={`M 20 24 H ${TANK_X + 24} V ${TANK_Y - 6}`}
            fill="none"
            stroke="var(--border)"
            strokeWidth={18}
            strokeLinecap="butt"
          />
          <path
            d={`M 20 24 H ${TANK_X + 24} V ${TANK_Y - 6}`}
            fill="none"
            stroke="var(--water-deep)"
            strokeWidth={inflowStroke}
          />
          {inflow > 0 && (
            <rect
              x={TANK_X + 24 - inflowStroke / 2}
              y={TANK_Y - 6}
              width={inflowStroke}
              height={Math.max(0, waterY - (TANK_Y - 6))}
              fill="var(--water)"
              opacity={0.7}
            />
          )}

          {/* Water */}
          <g clipPath="url(#tank-clip)">
            <rect
              x={TANK_X}
              y={waterY}
              width={TANK_W}
              height={waterH}
              fill="url(#water-fill)"
            />
            <path
              d={`M ${TANK_X} ${waterY} q 22 -6 45 0 t 45 0 t 45 0 t 45 0 V ${waterY + 10} H ${TANK_X} Z`}
              fill="var(--water)"
              opacity={0.9}
            />
          </g>

          {/* Tank walls */}
          <path
            d={`M ${TANK_X} ${TANK_Y} V ${TANK_Y + TANK_H} H ${TANK_X + TANK_W} V ${TANK_Y}`}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={3}
            strokeLinejoin="round"
          />

          {/* Operating point and equilibrium markers (casing in card color so the dashes read over water) */}
          <line
            x1={TANK_X}
            x2={TANK_X + TANK_W}
            y1={operatingY}
            y2={operatingY}
            stroke="var(--card)"
            strokeWidth={4}
          />
          <line
            x1={TANK_X}
            x2={TANK_X + TANK_W}
            y1={operatingY}
            y2={operatingY}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <text
            x={TANK_X + TANK_W - 4}
            y={operatingY - 4}
            textAnchor="end"
            fontSize={11}
            fontFamily="var(--font-mono)"
            fill="var(--foreground)"
            stroke="var(--card)"
            strokeWidth={3}
            paintOrder="stroke"
            strokeLinejoin="round"
          >
            h̄ = {formatNumber(operatingHeight)} m
          </text>
          <line
            x1={TANK_X}
            x2={TANK_X + TANK_W}
            y1={equilibriumY}
            y2={equilibriumY}
            stroke="var(--card)"
            strokeWidth={5}
          />
          <line
            x1={TANK_X}
            x2={TANK_X + TANK_W}
            y1={equilibriumY}
            y2={equilibriumY}
            stroke={overflows ? 'var(--warning)' : 'var(--primary)'}
            strokeDasharray="2 3"
            strokeWidth={2}
          />
          <text
            x={TANK_X + 4}
            y={markerLabelsCollide ? equilibriumY + 12 : equilibriumY - 4}
            textAnchor="start"
            fontSize={11}
            fontFamily="var(--font-mono)"
            fill={overflows ? 'var(--warning-foreground)' : 'var(--foreground)'}
            stroke="var(--card)"
            strokeWidth={3}
            paintOrder="stroke"
            strokeLinejoin="round"
          >
            h∞ = {formatNumber(equilibriumHeight)} m
          </text>

          {/* Scale */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={TANK_X - 10}
                x2={TANK_X - 2}
                y1={levelY(tick)}
                y2={levelY(tick)}
                stroke="var(--muted-foreground)"
                strokeWidth={1}
              />
              <text
                x={TANK_X - 14}
                y={levelY(tick) + 3}
                textAnchor="end"
                fontSize={10}
                fontFamily="var(--font-mono)"
                fill="var(--muted-foreground)"
              >
                {formatNumber(tick, 1)}
              </text>
            </g>
          ))}

          {/* Outflow orifice */}
          <path
            d={`M ${TANK_X + TANK_W} ${TANK_Y + TANK_H - 14} H ${VIEW_W - 20} V ${VIEW_H - 10}`}
            fill="none"
            stroke="var(--border)"
            strokeWidth={18}
          />
          <path
            d={`M ${TANK_X + TANK_W} ${TANK_Y + TANK_H - 14} H ${VIEW_W - 20} V ${VIEW_H - 10}`}
            fill="none"
            stroke="var(--water-deep)"
            strokeWidth={outflowStroke}
          />
        </svg>

        <dl className="grid grid-cols-1 gap-3 border-t border-border pt-4 font-mono text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">h(t)</dt>
            <dd
              className="tabular-nums"
              aria-live={isPlaying ? 'off' : 'polite'}
              aria-atomic="true"
            >
              {formatNumber(height, 3)} m
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">Qi</dt>
            <dd className="tabular-nums">{formatNumber(inflow)} m³/h</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">Qo = K√h</dt>
            <dd className="tabular-nums">{formatNumber(outflow)} m³/h</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
