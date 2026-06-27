---
name: policy-mutator
description: Use when proposing a small OrbitForge policy or prompt mutation after an evaluated failure.
---

# Policy Mutator

## What This Is For

Generate a small, testable policy or prompt change after an OrbitForge run
fails or underperforms.

## How To Work

Read the scenario, current policy, evaluator scorecard, and failure diagnosis.

Prefer:

- small diffs;
- clear rationale;
- changes tied to one failure pattern;
- guardrail-preserving behavior;
- testable predictions.

Avoid:

- broad rewrites;
- hiding uncertainty;
- optimizing only for explanation quality while worsening operational fit;
- removing seeded-data or no-real-control guardrails.

## Output

Return:

- `patch_summary`;
- `policy_diff`;
- `why_this_should_help`;
- `what_to_test`;
- `rollback_reason`.

