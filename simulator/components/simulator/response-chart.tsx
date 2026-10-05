'use client'

import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatNumber, type SimulationPoint } from '@/lib/water-tank-model'

const chartConfig = {
  nonlinear: { label: 'No lineal h(t) · RK4/Euler', color: 'var(--chart-1)' },
  linear: { label: 'Lineal H(s) · escalón', color: 'var(--chart-2)' },
  analytic: { label: 'Analítica (Laplace inversa)', color: 'var(--chart-3)' },
} satisfies ChartConfig

type ResponseChartProps = {
  points: SimulationPoint[]
  playhead: number
  maxHeight: number
  operatingHeight: number
}

export function ResponseChart({ points, playhead, maxHeight, operatingHeight }: ResponseChartProps) {
  const data = useMemo(() => {
    const stride = Math.max(1, Math.floor(points.length / 400))
    return points.filter((_, index) => index % stride === 0 || index === points.length - 1)
  }, [points])

  const horizon = points[points.length - 1]?.time ?? 0
  const yMax = Math.max(
    maxHeight,
    ...points.map((point) => Math.max(point.linear, point.analytic)),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Respuesta temporal h(t)</CardTitle>
        <CardDescription>
          Superposición del modelo no lineal, el modelo linealizado y la solución analítica.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[4/3] min-h-[260px] w-full md:aspect-[16/9]">
          <LineChart data={data} margin={{ left: 4, right: 44, top: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              type="number"
              domain={[0, horizon]}
              tickFormatter={(value: number) => formatNumber(value, 0)}
              label={{ value: 't [h]', position: 'insideBottomRight', offset: -4, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, Math.ceil(yMax)]}
              tickFormatter={(value: number) => formatNumber(value, 1)}
              label={{ value: 'h [m]', angle: -90, position: 'insideLeft', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const t = Number(value)
                    return Number.isFinite(t) ? `t = ${formatNumber(t, 2)} h` : 't = —'
                  }}
                  formatter={(value, name, item) => (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="font-mono tabular-nums">
                        {Number.isFinite(Number(value)) ? `${formatNumber(Number(value), 3)} m` : '—'}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine
              y={operatingHeight}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              label={{ value: 'h̄', position: 'right', fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <ReferenceLine
              y={maxHeight}
              stroke="var(--warning)"
              strokeDasharray="2 4"
              label={{ value: 'Hmax', position: 'right', fontSize: 11, fill: 'var(--warning-foreground)' }}
            />
            <ReferenceLine x={playhead} stroke="var(--foreground)" strokeWidth={1} />
            <Line
              dataKey="linear"
              type="monotone"
              stroke="var(--color-linear)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="analytic"
              type="monotone"
              stroke="var(--color-analytic)"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="nonlinear"
              type="monotone"
              stroke="var(--color-nonlinear)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
