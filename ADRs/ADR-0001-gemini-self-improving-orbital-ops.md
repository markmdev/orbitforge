---
status: accepted
date: "2026-06-27"
---

# ADR-0001 - Build OrbitForge as a Gemini Self-Improving Orbital Ops Demo

## Context

The hackathon requires projects to build under Continual Learning, the
Self-Improvement Stack, or Recursive Intelligence. Mark wants to target overall
first place and Best Usage of Gemini 3.5, not DigitalOcean or LiveKit prizes.

The existing project research identified a strong domain: a seeded orbital
compute operations platform. That alone would be a polished space datacenter
dashboard, but it would not be enough for the hackathon themes or Gemini prize.

The Gemini 3.5 prize specifically rewards new Gemini ecosystem surfaces such as
managed-agent or interaction-style API capabilities, Gemini 3.5 Flash computer
use, Live Translate, and GenMedia. A static dashboard or wrapper chatbot would
be weak.

## Decision

Build **OrbitForge**: a self-improving operations stack for seeded orbital
compute infrastructure.

OrbitForge will use the orbital datacenter domain as the environment where an
AI operations agent repeatedly faces incidents, proposes actions, receives
deterministic evaluation, and improves its own policy, prompt, scenario set, or
skills over time.

The primary hackathon theme is **The Self-Improvement Stack**. The secondary
theme is **Continual Learning**.

Gemini 3.5 is not an add-on. It is the center of the demo:

- Gemini proposes operational plans.
- Gemini critiques failures and suggests improvements.
- Gemini managed agents generate or test candidate improvements in hosted
  environments.
- Gemini 3.5 Flash computer use audits the running UI or operator workflow.

## Consequences

The product is no longer just "Orbital ComputeOps." Orbital ComputeOps is the
domain surface. OrbitForge is the self-improvement system around it.

Regulatory and legal material become background realism, not the MVP center.

The first app must show a complete improvement loop, not merely dashboards:

```text
scenario -> agent plan -> evaluation -> critique -> mutation -> A/B test -> promotion
```

The UI must expose traces and score deltas so judges can see improvement rather
than only hear about it.

## Gemini Prize Requirements

MVP should include:

- Gemini managed-agent or Interactions API surfaces, if available, for scenario
  generation, policy mutation, or evaluation-harness work.
- Gemini 3.5 Flash computer use for visible UI/ops audit.

Stretch:

- Live Translate for mission briefing translation.
- GenMedia for generated mission visuals.

## Rejected Alternatives

### Static Orbital Datacenter Dashboard

Rejected because it is visually plausible but weak against the required themes.
It would look like DCIM in space rather than self-improving AI infrastructure.

### Generic Agent Chatbot for Space Ops

Rejected because the prize notes explicitly discourage standard wrapper
chatbots or basic prompts.

### Compliance/Risk Platform

Rejected for the hackathon MVP because Mark specifically wants a working,
beautiful, impressive demo and not a regulatory project.

### Recursive Intelligence Claim

Deferred. The current concept improves policies, prompts, skills, scenarios,
and evaluation loops. It does not directly improve raw model weights. Calling it
Recursive Intelligence would overclaim unless later implementation adds genuine
training-data, hyperparameter, architecture, or model-improvement work.

## Sources

- [Gemini API docs](https://ai.google.dev/gemini-api/docs/get-started)
- [Gemini 3.5 updates](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5)
- [Gemini API computer use](https://ai.google.dev/gemini-api/docs/computer-use)
- [Gemini Live Translate](https://ai.google.dev/gemini-api/docs/live-api/live-translate)
- [Prior synthesis](../reports/2026-06-27-research-synthesis.md)
