# OrbitForge

OrbitForge is a hackathon demo for a seeded, self-improving AI operations stack
around space-based datacenter infrastructure.

Public repo: https://github.com/markmdev/orbitforge

## Current Demo

The app is a runnable orbital-compute mission console. It shows:

- seeded orbital nodes, ground stations, workload scenarios, and link/thermal
  constraints;
- Gemini 3.5 operator plan and improvement critique traces through app runtime
  API routes;
- deterministic scorecards, policy mutation, A/B sweep, learning-memory
  writeback, promotion gate, stateful operator promotion, operations log, and
  a visible unsafe-policy guardrail canary;
- Gemini 3.5 Flash computer-use audit path with a generated audit frame,
  propose-only actions, prompt-injection guard state, and exact quota/API
  blocker display;
- judge report export with active policy state, current scores, Gemini status,
  audit mode, prompt guard, and seeded-data guardrail.

Known live state: Gemini API quota is currently returning
`You do not have enough quota to make this request.` The app preserves the exact
blocker and falls back honestly instead of presenting fallback output as live.

## Run Locally

```bash
npm install
npm run dev -- --host 127.0.0.1
```

The dev server usually lands on `http://127.0.0.1:5174/` if `5173` is occupied.

Useful proof commands:

```bash
npm test
npm run build
npm run verify:runtime
npm run verify:preview
npm run verify:demo
```

Use `npm run verify:gemini` only when a live Gemini quota check is worth
spending a model call.

## Project Map

- `HACKATHON.md` for theme and prize strategy.
- `REQUIREMENTS.md` for current product requirements.
- `ARCHITECTURE.md` for the initial implementation shape.
- `QUALITY_BAR.md` for the product, research, design, AI, and engineering bar.
- `IMPLEMENTATION_PLAN.md` for the build sequence.
- `RUNBOOK_24H.md` for the planned 24-hour execution model.
- `LINEAR_PLAN.md` for the Linear tracking structure.
- `THREAD_ORCHESTRATION.md` for specialist Codex thread roles.
- `EVAL_PLAN.md` and `QA_MATRIX.md` for proof strategy.
- `TOOLS_AND_ACCESS.md` for account/tool prerequisites.
- `SEED_DATA_PLAN.md` for the first scenario/entity set.
- `DEMO_SCRIPT.md` for the judge-facing narrative.
- `ADRs/ADR-0001-gemini-self-improving-orbital-ops.md` for the accepted product
  direction.
- `PRDs/PRD-0001-orbitforge-hackathon-demo.md` for the first build spec.
- `knowledge-base/README.md` for the linked research map.
- `reports/` for synthesis reports.
- `notes/` for durable work memory and follow-ups.
