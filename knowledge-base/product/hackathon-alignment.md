# Hackathon Alignment

Last updated: 2026-06-27

## Pivot

The earlier research identified a credible seeded orbital compute platform. The
hackathon requirements change the center of gravity:

- old center: managing orbital datacenter infrastructure;
- new center: a self-improving AI operations stack using orbital datacenters as
  the simulation environment.

## Theme Mapping

### Self-Improvement Stack

OrbitForge is infrastructure for evaluating and upgrading an AI operations
agent:

- scenario runner;
- run traces;
- deterministic evaluator;
- failure analysis;
- policy/prompt mutation;
- A/B evaluation;
- promotion gate;
- score trend.

### Continual Learning

OrbitForge becomes more useful over repeated use:

- stores failures;
- generates harder scenarios;
- learns policy changes;
- preserves useful evaluations;
- tracks improvement across versions.

### Recursive Intelligence

Do not lead with this theme for MVP. The project does not improve raw weights.
It improves the surrounding agent system. If time allows, a stretch could
generate training examples from failed scenarios, but that should be clearly
labeled as dataset generation rather than weight updates.

## Gemini 3.5 Mapping

Required prize surfaces to target:

- Gemini managed agents / Interactions API surfaces, if available, for stateful
  hosted improvement work;
- Gemini 3.5 Flash computer use for UI and workflow audit.

Optional:

- Gemini Live Translate for a multilingual incident briefing.
- GenMedia for mission visuals.

## How To Talk About The Project

Good:

> OrbitForge is a self-improving mission-ops stack. It uses Gemini 3.5 to run,
> audit, and upgrade an orbital-compute operations agent over repeated seeded
> incidents.

Bad:

> We made a dashboard for space datacenters.

Bad:

> We made a chatbot for satellite operators.

## Judge Demo Beat Sheet

1. Show the live console.
2. Trigger an incident.
3. Show Gemini's first operational plan.
4. Show deterministic evaluation catching a weakness.
5. Run the Gemini improvement lab.
6. Show the policy diff and A/B result.
7. Promote the better policy.
8. Run Gemini computer-use audit on the UI.
9. End on the score trend and trace evidence.
