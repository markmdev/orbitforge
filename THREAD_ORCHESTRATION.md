# Codex Thread Orchestration

Last updated: 2026-06-27

## Rule

One Controller thread owns the project. Specialist threads execute bounded work
and report back. No specialist decides product direction, closes scope, or
declares the demo complete.

Specialist threads are not one-off outsourcing. The Controller must stay deep in
the project, understand the workstream before assigning it, review returned
diffs, inspect supporting sources, question weak assumptions, run or request
proof, and integrate only the parts that improve the product.

The thread plan is a tool, not a commitment. The Controller may merge, kill,
replace, or redefine specialist scopes whenever the current shape stops helping
the demo. Record the current truth here or in `THREADS.md`; do not preserve
stale role boundaries for politeness.

Use model `gpt-5.5` with `xhigh` reasoning for specialist threads unless Mark
asks otherwise.

## Planned Threads

### Controller

Owns:

- goal/timer;
- Linear;
- product decisions;
- integration;
- final QA verdict;
- Mark reporting;
- reviewing and accepting or rejecting every specialist output.

### Implementation Thread

Owns:

- app scaffold;
- state model;
- deterministic evaluator;
- scenario runner;
- policy versioning;
- tests.

Writes:

- source files only after scaffold exists.

Reports:

- changed files;
- commands run;
- proof status;
- blockers.

### UI and Design Thread

Owns:

- visual system;
- layout;
- first-screen clarity;
- responsive polish;
- copy polish for judge path.

Writes:

- frontend components and CSS/design tokens.

Reports:

- screenshots or browser-observed issues;
- polish risks;
- exact UI files changed.

### Gemini Integration Thread

Owns:

- Gemini API wrapper;
- operator planning prompts;
- critique prompts;
- Gemini product-module integration;
- Interactions/runtime API verification through app modules;
- computer-use spike;
- trace capture.

Writes:

- server/API integration files;
- Gemini prompt/schema/eval assets inside app modules;
- trace adapters.

Reports:

- API capability verified;
- exact blocker if unavailable;
- model names/endpoints used;
- visible trace behavior.

### Evals Thread

Owns:

- deterministic scoring;
- golden scenarios;
- promotion thresholds;
- guardrail checks;
- regression tests.

Writes:

- evaluator tests;
- seed scenario tests;
- eval fixtures.

Reports:

- scenario coverage;
- score stability;
- weaknesses in improvement proof.

### QA Thread

Owns:

- manual browser QA;
- demo rehearsal;
- edge-case matrix;
- first-minute judge clarity;
- reset-state verification.

Writes:

- QA reports only unless explicitly assigned fixes.

Reports:

- P0/P1 findings;
- reproduction steps;
- operating-surface proof.

### Research Thread

Owns:

- late Gemini docs clarification;
- hackathon resource updates;
- examples/patterns;
- fallback options.

Writes:

- research notes only.

Reports:

- source links;
- changed implementation implications;
- whether docs contradict assumptions.

### Deployment Thread

Owns:

- optional DigitalOcean deploy;
- environment variables;
- build/runtime smoke checks;
- public URL if used.

Writes:

- deployment config only after core demo works.

Reports:

- URL;
- env requirements;
- deploy proof;
- rollback/local fallback.

## Thread Lifecycle

1. Controller creates or spawns thread with bounded scope.
2. Controller records active thread in `THREADS.md`.
3. Thread reports back with files changed, proof, blockers, and next action.
4. Controller reads the returned work, verifies claims, asks follow-up questions
   when needed, and runs or assigns additional proof.
5. Controller integrates, revises, or rejects the work.
6. Controller removes inactive row from `THREADS.md`.

If the lifecycle itself creates drag, the Controller changes it and updates this
file or the active run note.

## Handoff Prompt Template

```text
You are a specialist thread for OrbitForge.

Project root: /Users/mark/clawd/projects/space-datacenter-platform
Read AGENTS.md, HACKATHON.md, REQUIREMENTS.md, ARCHITECTURE.md, PRD-0001, and
the relevant plan file before editing.

Your scope:
[specific work]

You are not alone in the codebase. Do not revert unrelated changes. Do not
decide product direction. Report changed files, checks run, proof, blockers,
and remaining risks back to the Controller.

Your report is input, not completion. The Controller will review, test, and
integrate or reject the work.
```
