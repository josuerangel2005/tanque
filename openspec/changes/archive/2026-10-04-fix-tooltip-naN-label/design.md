# Design: Fix Tooltip NaN Label (t = —)

## Technical Approach

Single-file fix in `simulator/components/simulator/response-chart.tsx` (lines 74-77), per the prescribed proposal approach. The `labelFormatter` stops trusting the `value` argument — which the shared shadcn `ChartTooltipContent` wrapper (`simulator/components/ui/chart.tsx:148-166`) deterministically replaces with the first series' config label on numeric axes — and instead resolves the hovered simulation time from the raw recharts tooltip payload: `Number(payload?.[0]?.payload?.time ?? value)`. The existing `Number.isFinite` guard is kept unchanged as a genuine edge-case fallback. No shared-wrapper edits, no other files touched (~3 lines).

This maps directly to exploration approach 1 and satisfies both spec requirements (time title + non-finite fallback) without altering any specified contract.

## Architecture Decisions

### Decision: Resolve time from tooltip payload, not from wrapper `value`

**Choice**: `const t = Number(payload?.[0]?.payload?.time ?? value)` inside `labelFormatter`.
**Alternatives considered**: Fixing label routing in shared `ui/chart.tsx` (approach 2); switching `XAxis` to `type="category"`.
**Rationale**: The wrapper mangles `value` on every hover for numeric axes (verified read of `chart.tsx:153-159`: numeric `label` skips the string branch, so `value` becomes `config["linear"].label`). Reading `payload[0].payload.time` bypasses the mangling with a one-file, minimal-blast-radius change. The wrapper fix touches shadcn-owned code with regression surface across all tooltip consumers — deferred as optional hardening. The `type="category"` switch would break numeric scaling, hover interpolation, `domain`, and playhead `ReferenceLine` positioning.

### Decision: Keep the non-finite guard as edge-case fallback

**Choice**: Preserve `Number.isFinite(t) ? ... : 't = —'` unchanged.
**Alternatives considered**: Removing the guard, or rendering an empty title on failure.
**Rationale**: The guard is correct behavior for genuinely unresolvable payloads (spec scenarios 5-6: empty/corrupt payload). The bug was never the guard itself but the wrong input it received on every hover. Keeping it means the `?? value` fallback path degrades to today's guarded state rather than to `NaN`, so the fix is strictly an improvement under all inputs.

### Decision: Leave `XAxis type="number"` and downsampling untouched

**Choice**: No changes to axis config, `data` memo, or `ReferenceLine`s.
**Alternatives considered**: None seriously — ruled out during exploration.
**Rationale**: The downsampled memo preserves `time` on every datum, so `payload[0].payload.time` is guaranteed present for rendered points. Axis and reference-line config are unrelated to the misrouting and verified (by read) to inject nothing into tooltip `payload`.

## Data Flow

Hover data path before and after the fix:

```
recharts Tooltip (label = numeric time, payload[i].payload = SimulationPoint)
        │
        ▼
ChartTooltipContent (chart.tsx:148-166)
  label is number → skips string branch → value = config["linear"].label
        │
        ▼ (calls labelFormatter(mangledValue, payload))
response-chart.tsx labelFormatter
  BEFORE: Number(value) → NaN → 't = —' on EVERY hover (bug)
  AFTER:  Number(payload[0].payload.time ?? value) → formatted time;
          't = —' only when no finite time resolves (edge case)
```

`?? value` (not `|| value`) is deliberate: a legitimate `time = 0` at the domain start is falsy but valid and must survive.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `simulator/components/simulator/response-chart.tsx` (lines 74-77) | Modify | `labelFormatter` resolves `time` from `payload[0].payload.time`, falling back to `value`; guard unchanged (~3 lines) |
| `simulator/components/ui/chart.tsx` | None (read-only context) | Root misrouting documented but explicitly untouched |
| `simulator/components/simulator/tank-simulator.tsx` | None | Context only (playhead prop) |
| `simulator/lib/water-tank-model.ts` | None | Context only (`SimulationPoint.time`, `formatNumber` locale) |

Planned diff (illustrative):

```tsx
labelFormatter={(value, payload) => {
  const raw = (payload?.[0] as { payload?: { time?: unknown } } | undefined)?.payload?.time ?? value
  const t = Number(raw)
  return Number.isFinite(t) ? `t = ${formatNumber(t, 2)} h` : 't = —'
}}
```

Note: exact typing follows the recharts `TooltipPayload` shape already in use; `payload` is the second `labelFormatter` parameter the wrapper already forwards (`chart.tsx:164`).

## Interfaces / Contracts

No new interfaces or API contracts. The fix relies on two existing, stable contracts:

- recharts tooltip payload: `payload[i].payload` carries the raw datum (`SimulationPoint`, including `time: number`). Stable from recharts v2 → v3; the wrapper already forwards the full `payload` array to `labelFormatter`.
- `SimulationPoint.time` (`water-tank-model.ts`) and `formatNumber(value, digits)` with `es-ES` locale (decimal commas, e.g. `t = 12,50 h`, are expected — not a defect).

## Testing Strategy

No automated test infrastructure exists in the repo (no `*.test.*` files found), so verification is manual against the dev server, mapped 1:1 to the 7 spec scenarios:

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Manual (spec req. 1) | Hover shows `t = <formatNumber(t, 2)> h` | Hover chart at a known point; compare title against datum `time` |
| Manual (spec req. 1) | Title tracks cursor (t1 → t2) | Drag cursor across chart; title must update per datum |
| Manual (spec req. 1) | Downsampled datum time, not series name | Hover with large point count (stride > 1); title must be a time, never a config label |
| Manual (spec req. 1) | Locale formatting (`12,50` under es-ES) | Hover fractional time; confirm comma decimals, not treated as defect |
| Manual (spec req. 2) | Empty payload → `t = —` | Code-read of guard + tooltip dismiss/edge hover; fallback renders |
| Manual (spec req. 2) | Corrupt/missing time → `t = —` | Code-read: `Number(missing)` is non-finite → fallback branch |
| Manual (spec req. 2) | Fallback never appears for valid hovers | Sweep cursor across full domain; `t = —` must never show on data |
| Static | No type/lint regressions | `tsc --noEmit` (or project typecheck) and lint pass; single-hunk diff review |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Single-hunk revert is the rollback: restoring `Number(value)` returns the tooltip to the current `t = —` steady state with no side effects.

## Open Questions

None. Root cause proven from read code plus recharts v3 tooltip types; prescribed approach confirmed against the actual files.
