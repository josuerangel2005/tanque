export type TankParameters = {
  area: number
  dischargeCoefficient: number
  maxHeight: number
  initialHeight: number
  baseFlow: number
  stepFlow: number
  horizon: number
}

export type SolverMethod = 'rk4' | 'euler'

export type SimulationPoint = {
  time: number
  nonlinear: number
  linear: number
  analytic: number
}

export const DEFAULT_PARAMETERS: TankParameters = {
  area: 10,
  dischargeCoefficient: 4.47,
  maxHeight: 10,
  initialHeight: 5,
  baseFlow: 10,
  stepFlow: 2,
  horizon: 50,
}

export const OPERATING_HEIGHT = 5
export const OPERATING_FLOW = 10
export const FIXED_STEP_HOURS = 0.05

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function integrateStep(
  value: number,
  dt: number,
  derivative: (height: number) => number,
  method: SolverMethod,
  clampState?: (height: number) => number,
) {
  const stage = (height: number) => (clampState ? clampState(height) : height)
  if (method === 'euler') {
    const next = value + dt * derivative(value)
    return clampState ? clampState(next) : next
  }

  const k1 = derivative(value)
  const k2 = derivative(stage(value + (dt * k1) / 2))
  const k3 = derivative(stage(value + (dt * k2) / 2))
  const k4 = derivative(stage(value + dt * k3))
  const next = value + (dt * (k1 + 2 * k2 + 2 * k3 + k4)) / 6
  return clampState ? clampState(next) : next
}

export function simulateTank(
  parameters: TankParameters,
  method: SolverMethod = 'rk4',
): SimulationPoint[] {
  const {
    area,
    dischargeCoefficient: coefficient,
    maxHeight,
    initialHeight,
    baseFlow,
    stepFlow,
    horizon,
  } = parameters
  const dt = FIXED_STEP_HOURS
  const decayRate = coefficient / (2 * area * Math.sqrt(OPERATING_HEIGHT))
  const finalFlow = baseFlow + stepFlow
  const points: SimulationPoint[] = []
  let nonlinear = clamp(initialHeight, 0, maxHeight)
  let linear = initialHeight
  let time = 0

  while (true) {
    const exponential = Math.exp(-decayRate * time)
    const analytic =
      OPERATING_HEIGHT +
      (initialHeight - OPERATING_HEIGHT) * exponential +
      ((finalFlow - OPERATING_FLOW) / area / decayRate) * (1 - exponential)

    points.push({ time, nonlinear, linear, analytic })
    if (time >= horizon) break

    const step = Math.min(dt, horizon - time)
    nonlinear = integrateStep(
      nonlinear,
      step,
      (height) =>
        finalFlow / area -
        (coefficient / area) * Math.sqrt(Math.max(height, 0)),
      method,
      (height) => clamp(height, 0, maxHeight),
    )
    linear = integrateStep(
      linear,
      step,
      (height) =>
        (finalFlow - OPERATING_FLOW) / area -
        decayRate * (height - OPERATING_HEIGHT),
      method,
    )
    time = Math.min(horizon, time + step)
  }

  return points
}

export function getEquilibriumHeight(flow: number, coefficient: number) {
  if (flow <= 0 || coefficient <= 0) return 0
  return (flow / coefficient) ** 2
}

export function maxOperatingDeviation(points: SimulationPoint[]) {
  return points.reduce(
    (largest, point) =>
      Math.max(largest, Math.abs(point.nonlinear - OPERATING_HEIGHT)),
    0,
  )
}

export function validatesReferenceEquilibrium() {
  const dt = FIXED_STEP_HOURS
  const area = DEFAULT_PARAMETERS.area
  const coefficient = DEFAULT_PARAMETERS.dischargeCoefficient
  const steadyFlow = OPERATING_FLOW
  const derivative = (height: number) =>
    steadyFlow / area -
    (coefficient / area) * Math.sqrt(Math.max(height, 0))
  const clampHeight = (height: number) => clamp(height, 0, DEFAULT_PARAMETERS.maxHeight)
  const settlingHorizon = 200
  const analyticEquilibrium = getEquilibriumHeight(steadyFlow, coefficient)

  const convergesFrom = (initial: number) => {
    let height = initial
    for (let time = 0; time < settlingHorizon; time += dt) {
      height = integrateStep(height, dt, derivative, 'rk4', clampHeight)
    }
    return Math.abs(height - OPERATING_HEIGHT) < 0.01
  }

  return (
    Math.abs(analyticEquilibrium - OPERATING_HEIGHT) < 0.01 &&
    convergesFrom(0) &&
    convergesFrom(DEFAULT_PARAMETERS.maxHeight)
  )
}

export function isValidParameters(parameters: TankParameters) {
  return (
    Number.isFinite(parameters.area) && parameters.area > 0 &&
    Number.isFinite(parameters.dischargeCoefficient) && parameters.dischargeCoefficient > 0 &&
    Number.isFinite(parameters.maxHeight) && parameters.maxHeight > 0 &&
    Number.isFinite(parameters.initialHeight) && parameters.initialHeight >= 0 && parameters.initialHeight <= parameters.maxHeight &&
    Number.isFinite(parameters.baseFlow) && parameters.baseFlow >= 0 &&
    Number.isFinite(parameters.stepFlow) && parameters.baseFlow + parameters.stepFlow >= 0 &&
    Number.isFinite(parameters.horizon) && parameters.horizon > 0 && parameters.horizon <= 500
  )
}

export function getLinearizationTimeConstant(parameters: TankParameters) {
  return (2 * parameters.area * Math.sqrt(OPERATING_HEIGHT)) / parameters.dischargeCoefficient
}

export function getLinearizationError(points: SimulationPoint[]) {
  return points.reduce(
    (largest, point) => Math.max(largest, Math.abs(point.nonlinear - point.linear)),
    0,
  )
}

export function sampleAtTime(points: SimulationPoint[], time: number) {
  if (points.length === 0) return { time, nonlinear: 0, linear: 0, analytic: 0 }
  let low = 0
  let high = points.length - 1

  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if (points[middle].time < time) low = middle + 1
    else high = middle
  }

  const right = points[low]
  const left = points[Math.max(0, low - 1)]
  if (right.time === left.time || right.time === time) return right
  const fraction = (time - left.time) / (right.time - left.time)
  return {
    time,
    nonlinear: left.nonlinear + (right.nonlinear - left.nonlinear) * fraction,
    linear: left.linear + (right.linear - left.linear) * fraction,
    analytic: left.analytic + (right.analytic - left.analytic) * fraction,
  }
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits }).format(value)
}
