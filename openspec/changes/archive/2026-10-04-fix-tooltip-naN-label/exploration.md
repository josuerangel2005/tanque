## Exploration: fix-tooltip-naN-label

### Current State

The tooltip title never receives the hovered `time` value. The chain fails inside
the shared shadcn wrapper, not in recharts or the chart data:

1. `simulator/components/simulator/response-chart.tsx:53-61` — `XAxis` uses
   `dataKey="time"` with `type="number"`. Recharts v3 therefore resolves the
   tooltip `label` as a **number** (the x value at the cursor;
   `TooltipContentProps.label?: string | number`), and each payload entry carries
   the raw datum at `payload[i].payload` (confirmed against recharts v3
   `Tooltip.tsx` / `DefaultTooltipContent.tsx` types and the canonical
   `TooltipContentProps` custom-tooltip pattern).
2. `simulator/components/ui/chart.tsx:148-166` (`ChartTooltipContent`) **does not
   forward that raw `label`** to `labelFormatter`. It computes an intermediate
   `value` first:
   - `key = labelKey ?? item?.dataKey ?? item?.name ?? "value"` — no `labelKey`
     is passed by `ResponseChart`, so `key` is the first series' `dataKey`
     (line order in `response-chart.tsx:110-134` is `linear`, `analytic`,
     `nonlinear`, so `key ≈ "linear"`).
   - `value = !labelKey && typeof label === "string"
     ? (config[label]?.label ?? label)
     : itemConfig?.label` — because the numeric-axis `label` is a `number`,
     the `typeof label === "string"` branch is **never taken**, so
     `value = config["linear"].label = 'Lineal H(s) · escalón'`.
   - Line 164 calls `labelFormatter(value, payload)` with that series-label
     string, not the time.
3. `response-chart.tsx:74-77` — `labelFormatter` does `Number(value)` on what it
   assumes is the time. `Number('Lineal H(s) · escalón')` is `NaN`, so before
   the guard it rendered `t = NaN h`; after the guard (`Number.isFinite` check
   → `'t = —'`) it renders the fallback **persistently**, because the input is
   wrong on every hover, not just on edge cases.

Ruled out (read, not guessed):
- Downsampled `data` memo (`response-chart.tsx:30-33`) only filters by stride;
  every surviving datum keeps its `time` field, so `payload[0].payload.time`
  is intact.
- `ReferenceLine x={playhead}` (`response-chart.tsx:109`) and the two `y`
  reference lines do not inject entries into the tooltip `payload` and cannot
  blank the label.
- `playhead` state in `tank-simulator.tsx` only positions the reference line
  and samples the current point; it is not wired to the tooltip.

So: the guard masks a deterministic wrapper-level misrouting — every hover
formats a series display name as if it were a timestamp.

### Affected Areas

- `simulator/components/simulator/response-chart.tsx` — owns the buggy
  `labelFormatter` assumption and is the minimal fix site.
- `simulator/components/ui/chart.tsx` — owns the root misrouting
  (`ChartTooltipContent` lines 148-166); any fix here affects every consumer
  of the shared tooltip.
- `simulator/components/simulator/tank-simulator.tsx` — context only
  (`playhead` prop); not a fix site.
- `simulator/lib/water-tank-model.ts` — context only (`SimulationPoint.time`);
  the datum shape the payload-based fix would rely on.

### Approaches

1. **Read `time` from the tooltip payload inside `labelFormatter`** — change
   only `response-chart.tsx`, e.g. resolve
   `Number(payload?.[0]?.payload?.time ?? value)` before formatting.
   - Pros: one-file, minimal blast radius; immune to the wrapper's `value`
     mangling and to `label` arriving as `number` vs `string`; `time` is
     guaranteed present because the downsampled data preserves the field.
   - Cons: couples the formatter to the `SimulationPoint` payload shape
     (`payload[0].payload.time`); silently depends on recharts keeping the raw
     datum at `item.payload` (stable across v2→v3, but still an implicit
     contract); leaves the shared wrapper trap in place for the next numeric
     chart.
   - Effort: Low

2. **Fix the label routing at the shared wrapper / use a bespoke tooltip** —
   e.g. pass a dedicated tooltip content (or `labelKey`) that forwards the raw
   recharts `label` (or `payload[0].payload.time`) instead of the
   config-derived series label; optionally correct `chart.tsx` so numeric
   `label`s reach `labelFormatter` untouched.
   - Pros: fixes the actual root cause for all current and future numeric-axis
     charts; semantically honest (tooltip title = x value, series rows = y
     values).
   - Cons: touches shared `ui/chart.tsx` (shadcn-owned file, diverges from
     upstream on future syncs); wider regression surface — every chart using
     `ChartTooltipContent` + `labelFormatter` must be re-verified; slightly
     more code (custom content component or wrapper branch for non-string
     labels).
   - Effort: Medium

Rejected: switching `XAxis` to `type="category"` so the label arrives as a
string and slips through the `config[label] ?? label` branch. It would
"fix" the title while breaking numeric scaling, hover interpolation,
`domain={[0, horizon]}`, and `ReferenceLine x={playhead}` positioning.

### Recommendation

Approach 1 (payload-derived `time` in `response-chart.tsx:74-77`) for this
change: it is a 3-line, single-file fix with no shared-component blast radius,
directly addresses the proven misrouting, and keeps the existing
non-finite guard as a genuine edge-case fallback instead of the steady state.
File approach 2 as follow-up hardening of `ui/chart.tsx` if more numeric-axis
charts appear.

### Risks

- If a future recharts major changes `TooltipPayload[i].payload` shape, the
  payload read needs revisiting (mitigated by the `?? value` fallback).
- Editing shared `ui/chart.tsx` (approach 2) without re-checking all tooltip
  consumers could change titles elsewhere; prefer approach 1 for now.
- `formatNumber` uses `es-ES` locale (`water-tank-model.ts:199-201`); the
  fixed title will render locale decimal commas (e.g. `t = 12,50 h`) — expected,
  not a bug.

### Ready for Proposal

Yes — root cause is proven from read code plus recharts v3 tooltip types; no
user clarification needed. Propose approach 1 as the fix, keep approach 2 as
optional hardening.
