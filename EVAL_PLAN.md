# Evaluation Plan

Last updated: 2026-06-27

## Purpose

The demo must prove self-improvement, not merely narrate it. Evals provide that
proof.

## Evaluation Layers

### Layer 1 - Deterministic Operational Score

Every agent run gets a deterministic score:

- freshness score;
- power score;
- thermal score;
- contact score;
- data-reduction score;
- risk score;
- explanation score;
- guardrail score.

Promotion requires:

- total score improvement;
- no decrease in guardrail score;
- no critical scenario regression;
- policy diff is small and explainable.

### Layer 2 - Golden Scenario Regression

Maintain a small suite:

- wildfire SAR rapid response;
- optical ground-link outage;
- radiation/ECC anomaly;
- thermal throttle;
- secure archive replication;
- climate reprocessing;
- adversarial overclaim prompt.

Run old and candidate policy on all golden scenarios before promotion.

### Layer 3 - Gemini Critique

Gemini critiques:

- why the agent failed;
- what policy change should help;
- which scenario should test the change;
- what risk the change introduces.

Gemini critique informs candidate generation but does not replace deterministic
promotion criteria.

### Layer 4 - UI/Judge Readiness Eval

Gemini computer use or manual QA checks:

- first screen clarity;
- visible Gemini trace;
- visible self-improvement proof;
- seeded-data honesty;
- no fake satellite-control language;
- no text overlap;
- no dead controls.

### Layer 5 - Final Demo Eval

Run the complete judge script:

1. reset app;
2. trigger wildfire scenario;
3. run agent plan;
4. view scorecard;
5. run improvement pass;
6. view diff and score delta;
7. promote policy;
8. view Gemini audit;
9. export or show final summary.

## Metrics

- `baseline_score`
- `candidate_score`
- `delta`
- `guardrail_score`
- `scenario_pass_rate`
- `critical_regressions`
- `visible_gemini_features`
- `time_to_first_a-ha`
- `demo_completion_time`

## Failure Policy

If a candidate policy improves one scenario but regresses another critical
scenario, reject or mark retest. The demo should show this discipline if time
allows; it makes the self-improvement stack feel real.

