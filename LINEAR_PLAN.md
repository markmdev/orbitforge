# Linear Tracking Plan

Last updated: 2026-06-27

## Purpose

Linear should make the 24-hour run visible and controlled. It should not become
the architecture source, a chat log, or a graveyard of tiny tasks.

## Project

Project name:

`OrbitForge Hackathon Demo`

Existing project URL:

`https://linear.app/markmorgan/project/97a83c8d-9ed9-477f-b6f9-628f0e658c1b/overview`

Project description:

`Build a Gemini 3.5 self-improving orbital-ops demo for the hackathon. Primary target: overall first place and Best Usage of Gemini 3.5.`

## Labels

- `orbitforge`
- `gemini`
- `self-improvement`
- `frontend`
- `evals`
- `qa`
- `demo`
- `quality`
- `research-depth`
- `blocker`
- `stretch`

## Issue Structure

### P0 - Build runnable OrbitForge app shell

Proof gate:

- app opens locally;
- first screen is Console;
- reset/demo state exists.

### P0 - Implement scenario runner and deterministic evaluator

Proof gate:

- seeded scenarios execute;
- evaluator returns repeatable scorecards;
- tests cover scoring and promotion gates.

### P0 - Implement Gemini operator plan and critique traces

Proof gate:

- live Gemini plan appears in app or exact access blocker is shown;
- trace panel shows prompt/context/model output;
- fallback is labeled if used.

### P0 - Implement self-improvement loop

Proof gate:

- scenario -> plan -> score -> critique -> mutation -> A/B -> promotion works;
- score delta and policy diff are visible.

### P0 - Integrate in-app Gemini improvement service

Proof gate:

- Gemini app service runs a policy/scenario/eval task;
- managed/session API ids are visible when available;
- generated artifacts are visible in Gemini Trace.

### P0 - Integrate Gemini computer-use audit

Proof gate:

- audit inspects the UI or workflow;
- actions/findings are visible;
- unavailable API state is clearly documented if blocked.

### P1 - Build polished operations-console UI

Proof gate:

- no landing page;
- dense readable layout;
- no overlap;
- first minute demo is obvious.

### P1 - Deepen product quality and research owners

Proof gate:

- `QUALITY_BAR.md` review has no unresolved P0/P1 concerns;
- domain, AI-product, design, and eval docs have been deepened where they guide
  implementation;
- shallow draft docs are merged, removed, or marked as non-authoritative;
- current external claims used in demo copy or judge narrative are sourced.

### P1 - Add QA matrix and fix top findings

Proof gate:

- QA matrix run is recorded;
- P0/P1 issues are fixed or explicitly accepted.

### P1 - Prepare judge demo script and final reset state

Proof gate:

- three-minute flow rehearsed;
- reset state verified;
- final talking points match actual app behavior.

### P2 - DigitalOcean deployment

Proof gate:

- live URL works if selected;
- local demo remains primary fallback.

### P2 - Live Translate or GenMedia stretch

Proof gate:

- only add if core Gemini self-improvement loop is already strong.

## Status Rules

- `Todo`: accepted but not started.
- `In Progress`: currently owned by Controller or specialist thread.
- `In Review`: implementation exists and awaits integration/QA.
- `Blocked`: requires Mark, account/API access, or external state.
- `Done`: proof gate passed on the owner surface.

## Update Cadence

- At kickoff: create project and P0/P1 issues.
- Every phase boundary: update issue statuses and add concise status comment.
- Every blocker: mark blocked with exact requirement and owner.
- Every proof gate: comment with the proof surface, not raw logs.
- At final: close or leave follow-ups intentionally.

## Live Linear Creation

Use the existing Linear project above at the start of the 24-hour execution
run. Create the P0/P1 issues there after confirming Linear tool access. Do not
create a duplicate project.
