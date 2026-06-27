---
summary: Project-local guidance for the OrbitForge hackathon project.
last_updated: "2026-06-27"
---

# OrbitForge Agent Notes

This project owns research, product strategy, and demo implementation for
**OrbitForge**: a hackathon project that uses Gemini 3.5 to make a seeded
orbital-compute operations agent improve itself over repeated simulated use.

## Ownership

- `knowledge-base/` owns source-backed domain research, concept maps, and demo
  requirements.
- `HACKATHON.md` owns hackathon theme, prize strategy, and judging priorities.
- `REQUIREMENTS.md` owns current product requirements and acceptance criteria.
- `ARCHITECTURE.md` owns the current implementation shape before code exists.
- `QUALITY_BAR.md` owns the product depth, research depth, design, AI-product,
  and engineering quality standard.
- `RUNBOOK_24H.md` owns the 24-hour execution model once Mark kicks off a timed
  run.
- `LINEAR_PLAN.md` owns the planned Linear project/issues before live Linear
  state exists.
- `THREAD_ORCHESTRATION.md` owns planned specialist Codex thread scopes.
- `EVAL_PLAN.md` and `QA_MATRIX.md` own eval and QA proof shape.
- `reports/` owns longer synthesis reports worth preserving.
- `PRDs/` owns accepted product/build specs before implementation starts.
- `ADRs/` owns durable architecture, product-model, or data-model decisions.
- `notes/` owns reusable work memory, blockers, and follow-ups that should not
  live only in chat.
- Future app source should live in this project root after the PRD or Mark's
  explicit build request defines the surface.

## Rules

- Optimize for the hackathon themes and Gemini 3.5 prize first. The primary
  theme is the Self-Improvement Stack, with Continual Learning as the product
  behavior.
- Treat the product as a seeded demo unless Mark explicitly approves real
  integrations beyond Gemini API, optional DigitalOcean hosting, or other named
  hackathon resources.
- Do not build a generic chatbot or static dashboard. The demo must show an AI
  operations loop improving from scenario runs, feedback, evaluation, and policy
  updates.
- Treat hackathon speed as prioritization pressure, not permission for low
  quality. When a doc, feature, eval, or design surface is shallow, deepen it,
  merge it into a stronger owner, or remove it.
- Use Gemini inside the app as a runtime product capability. Do not create
  prebuilt AGENTS/SKILL scaffolding for development-time orchestration.
- Specialist Codex threads are helpers, not owners. The Controller must stay
  deep in product, code, research, QA, and verification; read and review helper
  work before treating it as project truth.
- The Controller has project-manager authority over the execution system. If
  the current thread plan, Linear shape, QA loop, research split, or phase order
  is not producing a better demo, change it and record the new operating truth
  in the relevant project file.
- Keep regulatory and orbital-safety material as background constraints only.
  Do not let compliance surfaces dominate the hackathon MVP.
- Ground current domain claims in primary or credible current sources. Do not
  rely on training memory for company status, regulations, launch economics, or
  space-infrastructure announcements.
- Separate real space operations concepts from demo fiction. Seeded data may be
  fictional, but the operational model, failure modes, metrics, and terminology
  should be credible.
- Do not create private Agent Control status in this project. Translate
  coordination details into project-owned research, notes, PRDs, ADRs, or
  reports only when future work needs them.
- Before building UI, read `HACKATHON.md`, `REQUIREMENTS.md`, `ARCHITECTURE.md`,
  `QUALITY_BAR.md`, `ADRs/ADR-0001-gemini-self-improving-orbital-ops.md`,
  `PRDs/PRD-0001-orbitforge-hackathon-demo.md`, and
  `knowledge-base/README.md`.
- Before starting a 24-hour timed execution run, read `RUNBOOK_24H.md`,
  `TOOLS_AND_ACCESS.md`, `LINEAR_PLAN.md`, `THREAD_ORCHESTRATION.md`,
  `EVAL_PLAN.md`, and `QA_MATRIX.md`.
- Use a real browser for UI verification once an app exists; screenshots or
  script-only checks are not enough.

## Stop Conditions

Stop and return to Mark before continuing if the work would choose a new product
wedge, add unapproved external integrations, broaden account/payment/secret
authority, change release posture, or make claims about feasibility without
enough source-backed research. Do not stop just to revise the internal execution
system; that is Controller-owned project management.
