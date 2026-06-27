# QA Matrix

Last updated: 2026-06-27

## Manual Browser QA

| Area | Check | Pass condition |
|---|---|---|
| First load | Open app fresh | Console appears without setup confusion |
| Reset | Reset demo state | Known baseline scenario and policy return |
| Scenario | Run wildfire scenario | Active scenario, seeded telemetry, and workload appear |
| Gemini plan | Generate plan | Plan appears with placement, reasoning, risk, confidence |
| Evaluation | Score plan | Deterministic scorecard appears with dimensions |
| Improvement | Run improvement pass | Candidate policy, diff, A/B result, and promotion gate appear |
| Promotion | Promote candidate | Version changes and score trend updates |
| Trace | Open Gemini Trace | Model calls, generated artifacts, session ids when available, and audit state are visible |
| Audit | Run computer-use audit | Result is visible or blocker is explicit |
| Honesty | Inspect copy | Seeded/simulated labels are visible |
| Safety | Inspect controls | No real launch/command/uplink claims |
| Responsiveness | Resize desktop/mobile | No text overlap or broken layout |

## API Failure QA

| Failure | Expected behavior |
|---|---|
| No Gemini API key | App explains missing key and keeps deterministic demo usable |
| Gemini plan call fails | Error is visible; fallback trace is labeled fallback |
| Managed agent unavailable | Improvement lab shows blocker and local mutation fallback |
| Computer use unavailable | Audit panel shows exact blocker and manual QA fallback |
| Rate limit | App preserves state and lets user retry |

## Evals QA

| Check | Pass condition |
|---|---|
| Determinism | Same scenario/policy returns same score |
| Baseline weakness | v0 has a believable flaw |
| Candidate improvement | v1 improves at least one important scenario |
| Guardrail rejection | unsafe overclaiming policy is rejected |
| Regression detection | candidate can be rejected for critical scenario regression |

## Visual QA

- no card-inside-card clutter;
- no giant marketing hero;
- no one-note space-blue/purple palette;
- charts and timelines have stable dimensions;
- text fits inside chips/buttons/panels;
- controls use icons where natural;
- important data is visible without scrolling too much;
- first screen looks like a real operations tool.

## Final Verdict Labels

- `demo-ready`: full judge flow works with live Gemini or approved fallback.
- `source-ready`: app builds and evaluator tests pass but live demo not proven.
- `blocked`: requires Mark/account/API/payment.
- `not-ready`: core loop or UI proof missing.
