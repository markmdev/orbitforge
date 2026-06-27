# Architecture

Last updated: 2026-06-27

## Shape

OrbitForge should be a local-first web app with a visible self-improvement
control plane.

Recommended first build:

- Vite + React + TypeScript frontend.
- Static or lightweight local seeded data.
- Local API routes or a small Node server if Gemini calls need secret handling.
- Versioned JSON/YAML policy files for the in-app agent behavior.
- Trace files for scenarios, evaluations, mutations, and promotions.

## System Components

```text
Seeded scenario library
  -> scenario runner
  -> incident command deck
  -> Gemini operator agent
  -> deterministic evaluator
  -> improvement engine
  -> Gemini runtime adapters
  -> candidate policy mutation
  -> A/B evaluation
  -> promotion gate
  -> dashboard trace and replay
```

## App Surfaces

- **Console**: mission overview, live scenario, scenario-aware command deck,
  queue, alerts, agent version, improvement score.
- **Scenario Lab**: seeded incidents, run history, scenario generator.
- **Policy Lab**: current policy, candidate mutation, diff, promotion gate.
- **Evaluation**: scorecards, trace replay, before/after comparison.
- **Gemini Trace**: model calls, computer-use audit, generated
  scenario/policy artifacts, and any available Gemini API session ids.

## Planned Source Ownership

When source exists, keep Gemini behavior in normal app modules:

- `src/ai/` for Gemini client adapters, prompts, structured output schemas, and
  trace capture.
- `src/domain/` for orbital compute scenarios, policies, and seeded telemetry.
- `src/evals/` for deterministic scoring, guardrails, golden scenarios, and
  promotion gates.
- `src/components/` for UI surfaces that display plans, evaluations, diffs,
  traces, and audit results.

Do not create separate AGENTS/SKILL files for app runtime behavior. Gemini API
surfaces belong behind app-owned service modules under `src/ai/` like any other
product dependency.

## Data Model

Core domain entities:

- `OrbitalNode`
- `Workload`
- `Scenario`
- `Incident`
- `ContactWindow`
- `TelemetrySample`
- `AgentPolicy`
- `AgentRun`
- `EvaluationScore`
- `IncidentCommand`
- `IncidentReadiness`
- `PolicyMutation`
- `PromotionDecision`
- `ComputerUseAudit`
- `GeminiTrace`

## Gemini Integration Boundaries

Gemini is used for reasoning, critique, generation, and UI audit.

Deterministic app code owns:

- seeded scenario facts;
- scoring criteria;
- promotion thresholds;
- guardrail checks;
- trace storage;
- UI state.

Gemini should not be the only judge of whether a mutation is better. It can
explain, propose, and critique, but the promotion gate should use deterministic
scores so the demo has a crisp before/after proof.

## Improvement Loop

1. Run current policy against scenario set.
2. Evaluate with deterministic scorecard.
3. Ask Gemini to analyze the failures.
4. Ask the in-app Gemini improvement service to critique failures and recommend
   the next experiment through the same runtime service interface.
5. Run candidate policy against baseline and new scenarios.
6. Promote only if score improves and guardrails pass.
7. Record the diff and make it visible in the dashboard.

## Deployment

Local demo is enough for initial development. The Vite plugin registers Gemini
API routes for both `vite dev` and `vite preview`, so `npm run build` followed
by `npm run preview` can serve the built app with `/api/gemini/health`,
`/api/gemini/plan`, `/api/gemini/critique`, and
`/api/gemini/computer-audit`.

DigitalOcean deployment is useful only if it improves the judge experience:

- live URL;
- stable backend for Gemini calls;
- persistent traces during demo;
- easy reset button.

Do not optimize for DigitalOcean prize mechanics unless the core Gemini demo is
already strong.

## Verification

Source-ready:

- seeded scenarios load;
- deterministic evaluator returns repeatable scores;
- policy mutation can be diffed and rejected/promoted locally.

Demo-ready:

- one full scenario -> plan -> evaluation -> mutation -> A/B comparison ->
  promotion loop works in the browser;
- Gemini usage is visible in trace panels;
- computer-use audit has either live evidence or a clearly documented
  hackathon-access blocker;
- seeded data labels are visible;
- no UI text overlaps or placeholder states remain.
