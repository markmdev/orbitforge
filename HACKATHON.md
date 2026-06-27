# Hackathon Strategy

Last updated: 2026-06-27

## Goal

Build a polished, functional demo that can compete for:

- overall first place;
- Best Usage of Gemini 3.5.

DigitalOcean may be used for hosting if useful, but it is not a prize target.
LiveKit is not a target unless adding it becomes unusually cheap and clearly
improves the demo.

## Required Theme Fit

Primary theme: **The Self-Improvement Stack**.

OrbitForge is infrastructure for continuously evaluating, monitoring, and
upgrading an AI operations agent. The domain is seeded orbital-compute
operations, but the real project is the self-improvement loop around the agent.

Secondary theme: **Continual Learning**.

The agent improves over repeated simulated production episodes by storing
feedback, generating harder scenarios, comparing policy versions, and promoting
better prompts/skills/heuristics.

Avoid claiming the Recursive Intelligence theme unless the implementation
actually improves training data, hyperparameters, or model/agent architecture in
a way that is visible in the demo. Prompt/policy/skill improvement alone is
better framed as self-improvement stack plus continual learning.

## Product Name

**OrbitForge**

Tagline:

> A self-improving mission-ops stack for orbital AI infrastructure.

## What Judges Should See

1. A beautiful operations console for a seeded orbital compute fleet.
2. A workload or incident appears: wildfire SAR inference, ground-link outage,
   thermal throttle, radiation spike, or missed contact window.
3. A Gemini-powered operator agent proposes a plan.
4. The system evaluates that plan against seeded telemetry, SLAs, and risk.
5. Gemini 3.5 runs a self-improvement pass: critique the deterministic
   failures, recommend the next experiment, and produce an inspectable trace.
6. The dashboard shows before/after scores, trace diffs, policy changes, and
   why the app-owned candidate is better.
7. A Gemini computer-use auditor inspects the generated UI audit frame and
   returns proposed QA actions or the exact quota/API blocker.

The demo should feel like the agent is not just using Gemini. It is using
Gemini to improve the system that uses Gemini.

## Gemini 3.5 Prize Strategy

Use Gemini inside the app as a first-class product capability:

- **Gemini 3.5 Flash Computer Use**: primary prize feature. Use screenshots/UI
  audit frames to let Gemini inspect the demo console and propose
  UX/ops-readiness actions. Keep actions propose-only, enable prompt-injection
  detection, and never claim real UI execution when quota/API access is blocked.
- **Gemini runtime self-improvement service**: use Gemini from normal app
  modules to propose operator plans, critique deterministic failures, recommend
  experiments, and produce inspectable traces. The deterministic evaluator owns
  policy promotion.

Implemented API surface:

- **Gemini Interactions API through app routes**: plan, critique, and
  computer-use audit calls are product runtime capabilities behind Vite API
  routes. Do not make the Gemini Antigravity IDE, managed development
  environments, or development-time skills a dependency.

Optional stretch:

- **Gemini Live Translate**: translate the final mission incident briefing in
  real time for a multilingual operator room. Only add this if the core
  self-improvement loop is already strong.
- **GenMedia**: generate mission visuals or data-product thumbnails. Only add
  this if it does not distract from the self-improvement story.

## Demo Narrative

The winning story:

> Space datacenters are too dynamic for static runbooks. OrbitForge gives the
> orbital compute operator an AI agent that learns from every simulated
> incident. Gemini 3.5 proposes plans, critiques failures, and audits the UI;
> OrbitForge mutates and promotes policies only when deterministic evaluation
> and guardrail canaries agree.

## Non-Goals

- Do not build a regulatory compliance app.
- Do not build a static space dashboard.
- Do not build a generic chat wrapper.
- Do not make real satellite-control claims.
- Do not spend time competing for DigitalOcean or LiveKit prize criteria unless
  they support the primary demo.

## Source Notes

Primary docs checked on 2026-06-27:

- [Gemini API docs](https://ai.google.dev/gemini-api/docs/get-started)
- [Gemini 3.5 updates](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5)
- [Gemini API computer use](https://ai.google.dev/gemini-api/docs/computer-use)
- [Gemini Live Translate](https://ai.google.dev/gemini-api/docs/live-api/live-translate)
