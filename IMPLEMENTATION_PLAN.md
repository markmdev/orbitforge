# Implementation Plan

Last updated: 2026-06-27

## Phase 1 - Local App Shell

- Create Vite + React + TypeScript app.
- Build Console, Scenario Lab, Evaluation, Policy Lab, and Gemini Trace shells.
- Load seed data from local JSON/TypeScript files.
- Add reset-to-demo-state behavior.

## Phase 2 - Deterministic Core

- Implement scenario runner.
- Implement policy runner.
- Implement evaluator.
- Add seed scenarios and policy versions.
- Add basic tests for evaluator and promotion gate.

## Phase 3 - Gemini Operator Agent

- Add server-side Gemini API wrapper for operator plans.
- Store run traces.
- Show prompts/context/model output in the Gemini Trace panel.
- Use fallback seeded traces only when API access is blocked, labeled clearly.

## Phase 4 - Self-Improvement Loop

- Analyze failed score dimensions.
- Generate candidate policy changes.
- Run old/new policies against scenario set.
- Promote better policy only if guardrails pass.
- Show diff and score delta.

## Phase 5 - Gemini Managed-Agent or Interactions

- Mount `.agents/AGENTS.md` and `.agents/skills/` instructions where supported.
- Use Gemini managed-agent or Interactions API surfaces, if available, for
  scenario generation, policy mutation, or evaluation work.
- Persist environment id in app state when supported.
- Make managed-agent artifacts visible in the UI.

## Phase 6 - Gemini Computer Use Audit

- Run computer-use audit against the browser demo.
- Log screenshot/action/critique trace.
- Surface judge-readiness verdict in the app.

## Phase 7 - Polish

- Tighten first-screen story.
- Add demo script mode.
- Remove placeholder states.
- Verify responsive layout.
- Run manual browser QA.

## Stop Points

Return to Mark before changing the core product direction, dropping Gemini
managed agents, dropping computer use, or replacing the self-improvement loop
with a static demo.
