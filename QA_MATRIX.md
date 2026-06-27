# QA Matrix

Last updated: 2026-06-27

## Manual Browser QA

| Area | Check | Pass condition |
|---|---|---|
| First load | Open app fresh | Console appears without setup confusion |
| Reset | Reset demo state | Known baseline scenario and policy return |
| Scenario | Run wildfire scenario | Active scenario, seeded telemetry, and workload appear |
| Gemini plan | Generate plan | Plan appears with placement, reasoning, risk, confidence |
| Evaluation | Score plan | Deterministic scorecard appears with dimensions and guardrail canary rejection |
| Improvement | Run improvement pass | Candidate policy, diff, A/B result, learning-memory write, and promotion gate appear |
| Promotion | Promote candidate | Active policy changes, active score updates, operations log records promotion |
| Work queue | Complete demo actions | Readiness moves from `1/4` to `4/4` as promotion, report export, and audit run |
| Trace | Open Gemini Trace | Model calls, generated artifacts, session ids when available, and audit state are visible |
| Audit | Run computer-use audit | Audit frame is generated; propose-only mode, prompt guard, action proposals or exact blocker are visible |
| Honesty | Inspect copy | Seeded/simulated labels are visible |
| Safety | Inspect controls | No real launch/command/uplink claims |
| Responsiveness | Resize desktop/mobile | No text overlap or broken layout |

Current browser proof surfaces:

- In-app browser, desktop `1280x720`: Console shows active incident, fleet
  health, improvement proof, full five-row runtime flight recorder including
  computer-use audit status/source, operations log, and ground contact strip
  without overlap.
- In-app browser, mobile `390x844`: Console and active incident are visible in
  the first viewport; mobile nav is compact.
- Gemini Trace: plan, critique, and computer-use audit panels preserve
  prompt/output previews and label live/fallback state.
- Evaluation: guardrail canary is visible and blocks unsafe overclaiming
  mutation with deterministic evaluator proof.
- Policy Lab: learning-memory write is visible and ties current scenario,
  failure signature, golden sweep, and guardrail canary hold together.
- Stateful workflow: Policy Lab `Promote candidate` changes active policy from
  `v0 deadline-first` to `v1 generated thermal-contact candidate`, updates
  active policy score from `70` to `85`, records `Candidate promoted` in the
  operations log, and `Reset demo` restores baseline state.
- Incident work queue: starts at `1/4`, moves to `2/4` after promotion, `3/4`
  after report export, `4/4` after audit fallback/live result, and resets to
  `1/4`.
- Computer-use audit: Trace and judge report surface propose-only mode,
  prompt-injection guard state, and exact quota blocker when quota blocks live
  output.
- Browser console warnings/errors should be empty after each QA pass.

## Product Depth QA

| Area | Check | Pass condition |
|---|---|---|
| Product bar | Review against `QUALITY_BAR.md` | No core path feels like a toy, placeholder, or wrapper |
| Domain depth | Inspect scenario/entity data | Constraints feel orbital-compute-specific, not generic sci-fi |
| AI depth | Inspect Gemini Trace and eval flow | Gemini contribution is visible, structured, and bounded by deterministic proof |
| Doc depth | Review owner docs touched by build | Important docs answer implementation/proof questions or are marked draft |
| Judge depth | Run first-minute explanation | Judges see product, domain, AI loop, and improvement proof without setup talk |

## API Failure QA

| Failure | Expected behavior |
|---|---|
| No Gemini API key | App explains missing key and keeps deterministic demo usable |
| Gemini plan call fails | Error is visible; fallback trace is labeled fallback |
| Gemini runtime route unavailable | Plan, critique, or audit panel shows exact blocker and deterministic loop stays usable |
| Computer use unavailable | Audit panel shows exact blocker and manual QA fallback |
| Rate limit | App preserves state and lets user retry |

Known current blocker:

- Gemini can return `You do not have enough quota to make this request.` During
  that state, plan/critique/audit panels must show fallback status and exact
  blocker text. This is acceptable for development proof but should be rerun
  before final demo if quota clears.

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

## Documentation QA

- docs that govern implementation identify owner, decision, acceptance criteria,
  proof surface, and known limits;
- short draft docs are either deepened before they guide work or explicitly
  treated as temporary notes;
- current or unstable external claims link to inspected sources before they
  appear in demo copy or judge narrative;
- stale docs are merged, removed, or clearly superseded.

## Final Verdict Labels

- `demo-ready`: full judge flow works with live Gemini or approved fallback.
- `source-ready`: app builds and evaluator tests pass but live demo not proven.
- `blocked`: requires Mark/account/API/payment.
- `not-ready`: core loop or UI proof missing.

## Command Proof Handles

- `npm test`: deterministic domain and Gemini contract tests.
- `npm run build`: TypeScript/Vite production build.
- `npm run verify:runtime`: app shell plus Gemini configured-state health,
  without consuming a live model call.
- `npm run verify:preview`: one-command production preview proof; builds,
  starts preview, verifies app shell plus Gemini health, and stops preview.
- `npm run verify:gemini`: intentional live Gemini proof when quota allows.
- In-app browser: real click QA for Scenario Lab, Reset, Evaluation, Policy
  Lab, Gemini Trace, and Run audit.
