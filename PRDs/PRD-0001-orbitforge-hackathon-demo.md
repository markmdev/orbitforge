---
status: implemented-demo
date: "2026-06-27"
owner: "space-datacenter-platform"
---

# PRD-0001 - OrbitForge Hackathon Demo

## Summary

OrbitForge is a polished hackathon demo where a Gemini-powered orbital compute
operations agent improves itself over repeated simulated incidents.

It should win attention by showing a live self-improvement loop:

```text
incident -> Gemini plan -> deterministic score -> Gemini critique -> policy mutation -> A/B test -> promoted improvement
```

## Target User

Hackathon judges evaluating whether the project is:

- useful;
- technically ambitious;
- clearly within the required themes;
- an impressive use of Gemini 3.5;
- polished enough to trust as a demo.

In-product user persona: an orbital compute operator managing a small fleet of
seeded orbital AI infrastructure.

## Core Demo Story

A wildfire detection workload arrives from an orbital SAR data source:

- 420 GB raw data;
- 15-minute freshness target;
- limited downlink;
- one node has thermal pressure;
- one ground station has an optical-weather outage.

The current agent policy makes an imperfect placement or weak risk explanation.
OrbitForge evaluates the result, uses Gemini inside the app to critique the
failure, generates a candidate policy update through the app's improvement
service, reruns the scenario set, and promotes the improved policy only if it
performs better.

## MVP Screens

### Console

First screen. No landing page.

Must show:

- seeded orbital fleet status;
- active scenario;
- workload queue;
- contact windows;
- thermal/power/radiation status;
- current agent policy version;
- improvement score trend;
- primary action: run scenario or run improvement pass.

### Scenario Lab

Must show:

- scenario library;
- selected incident details;
- seeded telemetry;
- expected constraints;
- run history.

### Agent Run

Must show:

- Gemini plan;
- placement decision;
- reasoning;
- risk and confidence;
- trace of important prompt/context inputs.

### Evaluation

Must show:

- deterministic scorecard;
- pass/fail guardrails;
- before/after comparison;
- score delta;
- reason a policy was promoted or rejected.

### Policy Lab

Must show:

- current policy/prompt;
- candidate mutation;
- diff;
- source of mutation: in-app Gemini improvement service;
- promotion gate.

### Gemini Audit

Must show:

- Gemini computer-use audit result;
- UI/ops critique;
- proposed actions, not executed actions;
- propose-only mode and prompt-injection guard state;
- timestamp/model;
- whether the audit ran live or is blocked by API access.

## Functional Requirements

- Seed at least three golden scenarios.
- Run a deterministic evaluator with repeatable scores.
- Store baseline/candidate policy versions and generate additional candidate or
  canary policies from the improvement loop.
- Show traceable Gemini usage.
- Support at least one full policy improvement pass.
- Show a visible before/after improvement.
- Show a visible guardrail canary rejection for unsafe overclaiming mutations.
- Label all telemetry as seeded or simulated.

## Gemini Requirements

Use Gemini for:

- operator planning;
- critique and improvement proposal;
- traceable experiment recommendation;
- propose-only computer-use UI audit with prompt-injection guard state.

The Gemini integration should be visible in the product, not hidden in logs.

## Data Requirements

Core seed data:

- orbital nodes;
- workloads;
- scenarios/incidents;
- contact windows;
- telemetry samples;
- agent policies;
- run traces;
- evaluation scores;
- policy mutations;
- audit reports.

## UX Requirements

- Dense but readable operations-console feel.
- No hero landing page.
- Clear visual loop from incident to improvement.
- Avoid one-note dark-blue/purple space theme.
- Use compact charts, timelines, scorecards, diffs, and status chips.
- Every seeded/simulated surface should be labeled honestly.

## Out of Scope for MVP

- Real satellite integration.
- Real launch-provider workflows.
- Regulatory compliance dashboard.
- Real user accounts or billing.
- LiveKit integration.
- DigitalOcean-specific functionality beyond optional hosting.
- Raw model-weight training.

## Acceptance Criteria

Demo-ready means:

1. The app opens to the Console.
2. The judge can trigger the wildfire SAR scenario.
3. Gemini produces an operator plan.
4. The deterministic evaluator scores the plan.
5. The improvement loop generates a candidate policy.
6. The app reruns the old and new policies.
7. The app shows a promoted improvement with a score delta and diff.
8. The app shows an unsafe guardrail canary being blocked by deterministic
   evaluation.
9. Gemini computer use produces a visible propose-only UI/ops audit with prompt
   guard state, or the app shows a clear blocker if hackathon API access is
   unavailable.
10. No UI placeholders, overlapping text, or fake real-satellite claims remain.

## Verification

Code checks:

- typecheck;
- lint if configured;
- deterministic evaluator tests;
- seed-data validity checks.

Operating-surface checks:

- manually run the full demo loop in a browser;
- verify Gemini traces are visible;
- verify guardrail canary rejection is visible;
- verify seeded labels are visible;
- verify the app can reset to a clean demo state;
- verify desktop and mobile layouts do not overflow;
- verify the final judge script works without hidden setup.
