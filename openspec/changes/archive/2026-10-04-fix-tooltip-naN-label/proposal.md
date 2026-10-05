# Proposal: Fix Tooltip NaN Label (t = —)

## Intent

The response-chart tooltip title persistently renders `t = —` (previously `t = NaN`) on every hover instead of the hovered simulation time. Exploration proved the cause is deterministic misrouting in the shared shadcn `ChartTooltipContent` wrapper (`simulator/components/ui/chart.tsx:148-166`): it substitutes the first series' config label for the numeric tooltip label, so `labelFormatter` in `response-chart.tsx` always receives a series name (`Number(...)` → `NaN`). This change restores a correct, trustworthy time title on hover.

## Scope

### In Scope
- Fix `labelFormatter` in `simulator/components/simulator/response-chart.tsx` (lines 74-77) to resolve time from the tooltip payload: `Number(payload?.[0]?.payload?.time ?? value)` before formatting.
- Keep the existing non-finite guard (`Number.isFinite` → `'t = —'`) as a genuine edge-case fallback.
- Verify hover title shows the formatted time (locale-aware via existing `formatNumber`).

### Out of Scope
- Shared-wrapper fix in `simulator/components/ui/chart.tsx` (approach 2) — deferred as optional follow-up hardening.
- Switching `XAxis` to `type="category"` — rejected (breaks numeric scaling, hover interpolation, `domain`, and playhead `ReferenceLine` positioning).
- Any other tooltip, chart, simulation-model, or playhead behavior changes.

## Capabilities

### New Capabilities
None — pure bugfix, no new spec-level behavior.

### Modified Capabilities
None — `openspec/specs/` is empty; no existing capability requirements change. The fix restores the evidently intended tooltip-title behavior without altering any specified contract.

## Approach

Apply exploration approach 1 only: single-file change in `response-chart.tsx`. The formatter reads `time` from the raw recharts payload datum (`payload[0].payload.time`, guaranteed present since the downsampled memo preserves the field), falling back to `value` via `?? value`. This is immune to the wrapper's `value` mangling and to `label` arriving as `number` vs `string`, with no shared-component blast radius.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `simulator/components/simulator/response-chart.tsx` (lines 74-77) | Modified | Resolve tooltip title time from payload instead of wrapper-mangled `value` |
| `simulator/components/ui/chart.tsx` (lines 148-166) | None (read-only context) | Root misrouting documented but explicitly untouched in this change |
| `simulator/components/simulator/tank-simulator.tsx` | None | Context only (playhead prop) |
| `simulator/lib/water-tank-model.ts` | None | Context only (`SimulationPoint.time`, `formatNumber` locale) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Future recharts major changes `TooltipPayload[i].payload` shape | Low | `?? value` fallback preserves current (guarded) behavior |
| Formatter couples to `SimulationPoint` payload shape | Low | Field is stable and preserved by downsampling; single call site |
| Locale comma decimals (`t = 12,50 h`) mistaken for a bug | Low | Expected `es-ES` `formatNumber` behavior; noted in success criteria |

## Rollback Plan

Revert the single `labelFormatter` edit in `response-chart.tsx` (one hunk). Tooltip returns to the current `t = —` fallback state; no migrations, no shared-component side effects, no other files touched.

## Dependencies

- None. No new packages, no config changes, no prerequisite changes.

## Success Criteria

- [ ] Hovering the response chart shows `t = <formatted time> h` matching the cursor x-position.
- [ ] Empty/corrupt payload still renders the `'t = —'` fallback (guard preserved as edge case, not steady state).
- [ ] No changes to `ui/chart.tsx` or any other file (single-file diff).
