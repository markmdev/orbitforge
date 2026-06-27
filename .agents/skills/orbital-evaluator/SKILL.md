---
name: orbital-evaluator
description: Use when evaluating an OrbitForge policy run against seeded orbital-compute scenario constraints.
---

# Orbital Evaluator

## What This Is For

Score an operator policy run against seeded orbital-compute constraints.

## How To Work

Use deterministic criteria supplied by the app when present. If criteria are
missing, ask for them rather than inventing a success definition.

Evaluate:

- SLA/freshness fit;
- power margin;
- thermal margin;
- contact-window fit;
- data-reduction benefit;
- incident-risk handling;
- explanation quality;
- seeded-data honesty;
- no real-satellite overclaiming.

## Output

Return a scorecard with:

- total score;
- per-dimension scores;
- failure modes;
- one recommended policy improvement;
- whether the run should be promoted, rejected, or retested.

