# Demo Script

Last updated: 2026-06-27

## One-Liner

OrbitForge is a self-improving mission-ops stack for orbital AI infrastructure.
It uses Gemini 3.5 to run, evaluate, audit, and upgrade an operations agent over
repeated simulated incidents.

## 90-Second Judge Flow

1. Open the Console.
2. Point to the active seeded fleet, current policy version, and improvement
   score.
3. Trigger `Wildfire SAR Rapid Response`.
4. Show Gemini's initial operational plan.
5. Show the deterministic evaluator catching a weakness.
6. Run the improvement pass.
7. Show Gemini's critique and app-generated policy mutation.
8. Show A/B score improvement and policy diff.
9. Show the promoted policy version.
10. Show Gemini computer-use audit result.

Closing line:

> The interesting part is not that Gemini answered a prompt. The interesting
> part is that Gemini helped improve the operating system around the agent, and
> the dashboard proves the improvement with traces and scores.

## Three-Minute Judge Flow

### 0:00 - 0:20: Set the Stakes

"Space datacenters are a perfect stress test for agentic systems: power,
thermal, network windows, radiation, and deadlines all change at once. Static
runbooks are not enough."

### 0:20 - 0:55: Run Incident

Trigger wildfire scenario:

- 420 GB raw SAR data;
- 15-minute freshness deadline;
- thermal pressure on one node;
- optical weather outage at one ground station.

Show Gemini operator plan.

### 0:55 - 1:25: Evaluate

Open scorecard:

- SLA fit;
- power fit;
- thermal fit;
- contact fit;
- data reduction;
- risk handling;
- explanation quality;
- no-overclaim guardrail.

Highlight one failure.

### 1:25 - 2:10: Improve

Run improvement pass:

- Gemini diagnoses the failure;
- the in-app Gemini improvement service creates a candidate policy;
- old and new policy run against the same scenarios;
- promotion gate checks score and guardrails.

Show diff and score delta.

### 2:10 - 2:40: Computer Use Audit

Show Gemini computer-use audit:

- screenshot inspected;
- interaction path attempted;
- top UI/ops issues;
- prize-relevant trace.

### 2:40 - 3:00: Close

"OrbitForge is a Self-Improvement Stack. The agent does not just act. It gets
evaluated, patched, retested, and promoted through a visible loop."

## Backup If Gemini Access Fails

If API access fails during the live demo:

- show the UI loop with seeded Gemini-like trace data labeled as fallback;
- show the exact blocker in the Gemini Trace panel;
- show where the real API call would attach;
- do not claim the blocked integration ran live.
