# Tasks: Fix Tooltip NaN Label (t = —)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 3–5 lines (1 hunk) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Fix tooltip title to resolve hovered time from payload + verify all 7 spec scenarios and typecheck | PR 1 (single) | `tsc --noEmit` (or project typecheck) in `simulator/` | Dev server (`pnpm dev` / `npm run dev`) + hover response chart across full time domain | Revert single `labelFormatter` hunk in `simulator/components/simulator/response-chart.tsx` — returns tooltip to current `t = —` steady state, no other files affected |

## Phase 1: Core Implementation

- [x] 1.1 Modify `simulator/components/simulator/response-chart.tsx` `labelFormatter` (lines 74–77) to resolve time from the raw tooltip payload: `const t = Number(payload?.[0]?.payload?.time ?? value)`; keep the `Number.isFinite(t) ? ... : 't = —'` guard unchanged. Use `??` (not `||`) so a legitimate `time = 0` survives. Verify against `simulator/components/ui/chart.tsx` (read-only) lines 148–166 to confirm no shared-wrapper edit is needed.
- [x] 1.2 Confirm no other edits: `simulator/components/ui/chart.tsx` (read-only) untouched, `XAxis type="number"` and downsampling memo untouched, no changes to `simulator/components/simulator/tank-simulator.tsx` (read-only) or `simulator/lib/water-tank-model.ts` (read-only). Diff must be a single hunk (~3 lines).

## Phase 2: Verification (acceptance against all 7 spec scenarios)

- [ ] 2.1 Verify Requirement 1 — hover shows formatted time: run dev server, hover chart at a known simulation time `t` and confirm tooltip title reads `t = <formatNumber(t, 2)> h` (spec scenario 1).
- [ ] 2.2 Verify Requirement 1 — title tracks cursor: move cursor from `t1` to `t2` and confirm title updates accordingly (spec scenario 2).
- [ ] 2.3 Verify Requirement 1 — downsampled datum: with a large point count (stride > 1), hover a rendered point and confirm title shows that datum's `time`, never a series/config label such as the linear-series label (spec scenario 3).
- [ ] 2.4 Verify Requirement 1 — locale formatting: hover a fractional time (e.g. `12.5`) and confirm `es-ES` comma rendering (e.g. `t = 12,50 h`) is accepted, not treated as a defect (spec scenario 4).
- [ ] 2.5 Verify Requirement 2 — fallbacks: confirm empty/missing payload renders `t = —` and a missing/non-numeric `time` (non-finite) renders `t = —` via code-read of the guard plus edge-hover/dismiss check (spec scenarios 5–6).
- [ ] 2.6 Verify Requirement 2 — no false fallback: sweep cursor across the full valid domain and confirm `t = —` never appears on valid data points (spec scenario 7).
- [x] 2.7 Run static checks: project typecheck (`tsc --noEmit` from `simulator/`) and lint pass; review single-hunk diff for scope compliance. (Done 2026-10-05: `tsc --noEmit` clean, exit 0; no lint script exists in project — N/A; diff is a single 2-line hunk plus symmetric context. Browser-hover scenarios 2.1–2.6 remain pending manual verification.)

## Phase 3: Cleanup

- [x] 3.1 Confirm no temporary, debug, or scaffolding code remains and the working tree contains only the single-file fix. (Done 2026-10-05: `git status` shows only `M simulator/components/simulator/response-chart.tsx`; stray `tsconfig.tsbuildinfo` and `next-env.d.ts` churn from typecheck reverted/removed.)
