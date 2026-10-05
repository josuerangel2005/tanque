# Response Chart Tooltip Specification

## Purpose

This spec defines the intended behavior of the response-chart tooltip title in
`simulator/components/simulator/response-chart.tsx`: hovering the chart MUST show the
hovered simulation time, formatted with the existing locale-aware `formatNumber`, with the
`t = —` fallback reserved strictly for genuinely unresolvable payloads.

**Capability note (per proposal):** this change introduces no new capabilities and modifies
no existing specified contract — `openspec/specs/` is empty. This is a NEW spec (not a
delta) that records the restored, evidently intended tooltip-title behavior as the
authoritative requirement so the bug fix has a testable contract.

## Requirements

### Requirement: Tooltip Title Shows Hovered Simulation Time

The system MUST render the response-chart tooltip title as `t = <formatted time> h`, where
`<formatted time>` is the hovered datum's `time` resolved from the tooltip payload and
formatted with the existing `formatNumber(time, 2)` locale-aware formatter.

#### Scenario: Hover shows formatted time

- GIVEN the response chart is rendered with simulation points
- WHEN the user hovers the chart at a point with simulation time `t`
- THEN the tooltip title reads `t = <formatNumber(t, 2)> h`

#### Scenario: Title tracks cursor position

- GIVEN the response chart is rendered with simulation points
- WHEN the user moves the cursor from a point at time `t1` to a point at time `t2`
- THEN the tooltip title updates from `t = <formatNumber(t1, 2)> h` to `t = <formatNumber(t2, 2)> h`

#### Scenario: Title resolves time from hovered datum on downsampled data

- GIVEN the chart renders a downsampled subset of points that preserves each datum's `time` field
- WHEN the user hovers any rendered point
- THEN the tooltip title shows that datum's `time`, not a series name or config label

#### Scenario: Title uses locale-aware formatting

- GIVEN the user hovers the chart at a fractional time (e.g. `12.5`)
- WHEN the tooltip title renders
- THEN the time is formatted per the existing `formatNumber` locale convention (e.g. `t = 12,50 h` under `es-ES`), which SHALL NOT be treated as a defect

### Requirement: Non-Finite Tooltip Title Fallback

The system MUST render the tooltip title as `t = —` if and only if no finite simulation
time can be resolved from the hovered tooltip payload.

#### Scenario: Empty payload falls back

- GIVEN the user hovers the chart
- WHEN the tooltip payload is empty or carries no datum
- THEN the tooltip title reads `t = —`

#### Scenario: Corrupt time value falls back

- GIVEN the user hovers the chart
- WHEN the resolved `time` value is missing or non-numeric (resolving to a non-finite number)
- THEN the tooltip title reads `t = —`

#### Scenario: Fallback never appears for valid hovers

- GIVEN the user hovers any valid rendered data point with a finite `time`
- WHEN the tooltip renders
- THEN the title MUST show the formatted time and MUST NOT show `t = —` (the fallback is an edge-case guard, not the steady state)
