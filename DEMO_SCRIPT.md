# Demo Script

Last updated: 2026-06-27

## One-Liner

OrbitForge is a self-improving mission-ops stack for orbital AI infrastructure.
It uses Gemini 3.5 to run, evaluate, audit, and upgrade an operations agent over
repeated simulated incidents.

## 90-Second Judge Flow

1. Open the Console.
2. Point to the active seeded fleet, current policy version, and improvement
   proof.
3. Trigger `Wildfire SAR Rapid Response`.
4. Generate a stress drill from the active scenario and show the scenario
   library/eval set expanding.
5. Apply the incident command deck and show seeded readiness improving.
6. Show Gemini's initial operational plan.
7. Show the deterministic evaluator catching a weakness.
8. Show the improvement pass.
9. Show Gemini's critique and the app-generated policy mutation.
10. Show A/B score improvement and policy diff.
11. Show the learning-memory writeback from failure signature to candidate
   patch.
12. Click `Promote candidate` and show the active policy and operations log
    change.
13. Use the incident work queue action rail to run the mission plan, audit, and
    report export.
14. Show the queue moving from open tasks toward readiness.
15. Show the guardrail canary rejecting an unsafe overclaiming mutation.
16. Show Gemini computer-use audit result, including propose-only mode and
    prompt-injection guard state.

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

Optional stress drill:

- open Scenario Lab;
- click `Generate stress drill`;
- show `Stress Drill 01` selected and the scenario library expanding from 3 to
  4 scenarios;
- open Evaluation and point to the 4-scenario sweep.

Apply incident commands:

- reroute through Svalbard relay;
- split hot preprocessing to Kepler-2;
- attach confidence watermark.

Show readiness rising and operations log entries for each command.

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

Also point to the guardrail canary: the unsafe overclaiming mutation removes
seeded-data/no-control guardrails, scores 25 on guardrail, and is blocked by
the deterministic promotion gate.

### 1:25 - 2:10: Improve

Run improvement pass:

- click `Run improvement pass`;
- Gemini critique diagnoses the deterministic failure or shows the exact quota
  fallback;
- the in-app improvement service stages a scenario-scoped candidate policy;
- old and new policy run against the same scenarios;
- Policy Lab records a seeded learning-memory write from failure signature to
  candidate patch;
- promotion gate checks score and guardrails.

Click `Promote candidate`, then show the Console:

- active policy changes to `v1 generated thermal-contact candidate`;
- active score changes from `70` to `85`;
- operations log records `Candidate promoted`.
- use the queue action rail to click `Run mission`;
- timeline shows `Fireline SAR tiles`, `Kepler-2 -> New Mexico RF/Optical
  Hybrid`, and freshness `T+14m met`;
- operations log records `Mission plan run`;
- incident work queue moves from `1/7` to `2/7` after command stabilization,
  then to `3/7` after improvement pass, `4/7` after promotion, `5/7` after
  mission execution, `6/7` after audit result, and `7/7` after report export.

Show diff, score delta, and the fact that `Reset demo` restores the baseline.

### 2:10 - 2:40: Computer Use Audit

Show Gemini computer-use audit:

- local audit-frame screenshot generated from current seeded app state;
- Gemini 3.5 Flash computer-use tool path attempted;
- computer-use actions remain propose-only and are not executed;
- prompt-injection guard is enabled for the tool request;
- proposed UI action or exact API/quota blocker shown;
- runtime health strip shows configured/blocked state directly in the product;
- result tied to judge-readiness QA.

### 2:40 - 3:00: Close

"OrbitForge is a Self-Improvement Stack. The agent does not just act. It gets
evaluated, patched, retested, and promoted through a visible loop."

## Backup If Gemini Access Fails

If API access fails during the live demo:

- show the UI loop with seeded Gemini-like trace data labeled as fallback;
- show the exact blocker in the Gemini Trace panel;
- show where the real API call would attach;
- do not claim the blocked integration ran live.

If quota is the blocker, say:

> The system is still doing the right product behavior: it preserves the prompt,
> output, model, status, and exact quota error, then falls back to deterministic
> evaluation so the operator can keep working. We can rerun the same buttons
> when quota clears.

## Final Reset State

Before handing the app to judges:

1. Click `Reset demo`.
2. Leave the app on `Console`.
3. Confirm the active incident is `Wildfire SAR Rapid Response`.
4. Confirm the baseline risk copy is visible:
   `Baseline policy favors hot accelerator node and misses optical outage.`
5. Confirm Policy Lab starts with no staged candidate, then click
   `Run improvement pass` and confirm candidate patch, active delta `+15`, and
   `Average sweep +11` appear.
6. Optionally generate one stress drill and confirm reset can restore the
   library to 3 scenarios.
7. Apply the three incident commands and confirm readiness reaches stabilized
   state.
8. Click `Promote candidate`, confirm Console shows active policy score `85`,
   and confirm operations log includes `Candidate promoted`.
9. Use the queue action rail to run the mission plan and confirm `Fireline SAR
   tiles` is `met` at `T+14m`.
10. Confirm incident work queue reaches `7/7` after mission execution, audit
   result, and report export.
11. Click `Reset demo`, confirm active policy score returns to `70` and work
   queue returns to `1/7`.
12. Confirm Evaluation shows `Guardrail canary held` and the unsafe canary is
   blocked.
13. Confirm Gemini Trace shows plan, critique, computer-use audit, and an honest
   live/fallback status for each Gemini surface.
14. Confirm the audit surface or judge report shows `propose-only` mode and
   `Prompt-injection guard: enabled` after running audit.

Latest rehearsal proof:

- Console showed the Wildfire SAR incident, improvement proof, Gemini trace
  status, and ground contact strip.
- Evaluation showed `Guardrail canary held` and blocked the unsafe overclaiming
  canary at guardrail score 25.
- Policy Lab initially showed no staged candidate; after `Run improvement pass`
  it showed candidate patch, `+15`, and `Average sweep +11`.
- Policy Lab showed `Learning memory write` for `wildfire-sar`, `thermal:21`,
  `contact:27`, golden sweep `+11`, and guardrail canary hold.
- Scenario Lab generated `Stress Drill 01: Wildfire SAR Rapid Response`,
  selected it, expanded the library from `3` to `4` scenarios, and reset
  restored the library to `3`.
- The generated drill received a generic command deck; applying all three
  commands raised readiness from `34%` active to `83%` stabilized.
- Evaluation after drill generation swept `4` scenarios including
  `stress-wildfire-sar-01`.
- Incident command deck applied `Reroute to Svalbard relay`,
  `Split preprocessing to Kepler-2`, and `Attach confidence watermark`, raising
  seeded readiness from `45%` active to `82%` stabilized and recording each
  command in the operations log.
- Policy Lab `Run improvement pass` wrote `Improvement pass run` to the
  operations log, and `Promote candidate` changed active policy to
  `v1 generated thermal-contact candidate`, updated active score from `70` to
  `85`, and wrote `Candidate promoted` to the operations log.
- Console `Run mission plan` produced `Fireline SAR tiles`, `Kepler-2 -> New
  Mexico RF/Optical Hybrid`, freshness `T+14m met`, a four-step timeline, and a
  `Mission plan run` log entry.
- Incident work queue moved from `1/7` to `7/7` as command stabilization,
  improvement pass, promotion, mission execution, audit result, and report
  export completed; unfinished rows exposed direct action buttons or short gate
  reasons; reset restored it to `1/7`.
- Gemini Trace retry showed the exact quota blocker, and Run audit showed
  fallback state with `Modepropose-only`, `Prompt guardenabled`, audit-frame
  `Candidate score: 85`, and `Promotion gate: accepted`.
- After promotion, selecting `Radiation Spike During Inference` reset active
  policy to baseline, active score to `81`, work queue to `1/7`, and the
  fallback plan switched to radiation validation copy instead of wildfire copy.
- Copy report included `Computer-use mode: propose-only`,
  `Prompt-injection guard: enabled`, active policy state, incident readiness,
  applied commands, mission execution state, runtime health, and seeded
  telemetry guardrail.
- Console runtime health strip showed `configured` and trace cache count from
  `/api/gemini/health`; judge report included
  `Runtime health: configured; cache entries 12`.
- Reset returned to Console with wildfire baseline.
- Browser warnings/errors were empty in the fresh QA window, and mobile
  `390x844` had no horizontal overflow.
