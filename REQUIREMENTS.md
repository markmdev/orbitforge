# Requirements

Last updated: 2026-06-27

## Product

OrbitForge is a seeded hackathon demo where a Gemini-powered orbital-ops agent
continuously improves its own operating policy across simulated orbital
datacenter incidents.

## MVP Requirements

### R1 - Mission Console

The app must show a polished operational dashboard for a seeded orbital compute
fleet:

- fleet health;
- workload queue;
- power and thermal margin;
- contact windows;
- data products;
- active incidents;
- agent version and improvement score.
- active policy state and operator activity log.
- incident work queue with readiness status driven by completed app actions.
- first-viewport next-action strip derived from the same work queue.
- persisted seeded learning-memory ledger for improvement passes.
- scenario-aware incident command deck that changes seeded readiness state.
- seeded stress-drill generator that appends a what-if scenario to the current
  scenario library.
- seeded mission execution timeline that turns the active policy into node,
  station, freshness, and data-product handoff evidence.
- delivered data-product manifest with chunk sizes, confidence, watermark, and
  validation status.

### R2 - Scenario Runner

The app must run seeded scenarios that exercise realistic orbital compute
constraints:

- SAR wildfire inference with freshness deadline;
- optical ground-link outage;
- thermal throttle;
- radiation/ECC anomaly;
- missed contact window;
- storage/downlink pressure.

The Scenario Lab must also generate deterministic stress drills from the active
scenario, append them to the current eval set, and reset back to the original
seeded library on demo reset.

### R3 - Gemini Operator Agent

Gemini must propose an operational plan for a scenario:

- place workload on orbital edge, Earth cloud, ground edge, defer, split, or
  reject;
- explain why;
- identify constraints consumed;
- list risks and confidence.

### R4 - Evaluation Harness

The system must score the agent's plan using deterministic seeded criteria:

- SLA/freshness fit;
- power fit;
- thermal fit;
- contact-window fit;
- data-reduction benefit;
- incident-risk handling;
- explanation quality;
- safety/no-overclaiming.

### R5 - Self-Improvement Loop

The system must show improvement over time:

- store run traces and scores;
- identify failure patterns;
- generate or select a policy/prompt/heuristic mutation;
- require an explicit operator improvement pass before a candidate is staged;
- run the old and new versions against the same scenario set;
- include generated stress drills in the current scenario sweep;
- promote a better version only if it improves score without violating
  guardrails;
- let the operator promote the scenario-scoped candidate into active policy
  state;
- record promotion/reset actions in an activity log;
- expose contextual work-queue actions so the demo loop can be driven from the
  operator console rather than passive status rows;
- track incident readiness from real app actions such as command application,
  promotion, mission execution, audit result, and report export;
- show before/after diff and score delta in the UI.

### R6 - Gemini In-App Runtime Integration

The implementation should use Gemini through normal app modules for at least one
visible self-improvement function:

- proposing an operational plan from seeded scenario/policy context;
- critiquing deterministic evaluation failures;
- proposing the next policy experiment;
- producing a traceable improvement report.

All prompts, schemas, traces, and eval results should live in app-owned source
and data paths. Gemini API calls should be wrapped under the app's AI service
layer; Gemini Antigravity is an IDE and is not required.

The app must also surface Gemini runtime health from `/api/gemini/health` so
judges can see configured, blocked, or unavailable runtime state without a
terminal.

### R7 - Gemini Computer Use Integration

The implementation should use Gemini 3.5 Flash computer use for a visible UI or
operator workflow audit:

- inspect a screenshot or generated audit frame of the running dashboard;
- propose the next UI action or inspection a judge-readiness agent should take;
- produce critique and suggested UI/ops improvements;
- log the action proposals and findings in the app;
- never execute returned actions without a separate explicit execution surface.

### R8 - Hackathon Polish

The demo must be immediately legible:

- no landing page as the first screen;
- first screen is the live console;
- clear progress loop: scenario -> agent plan -> evaluation -> mutation ->
  before/after improvement -> operator promotion -> mission execution -> audit
  -> judge report;
- visually polished and technically dense;
- seeded data labeled honestly.

## Stretch Requirements

- Live Translate mission briefing.
- Public DigitalOcean deployment.
- generated mission visuals or thumbnails.
- replayable demo script.
- exportable judge report.

## Guardrails

- All orbital telemetry is seeded or simulated.
- Do not claim real satellite control.
- Do not make regulatory compliance the main product.
- Do not promote a policy mutation if it worsens guardrail score.
- Do not hide Gemini usage in a backend-only black box; make traces visible.

## Acceptance Criteria

The MVP is ready when a judge can watch one complete loop:

1. open the console;
2. select or trigger a scenario;
3. optionally generate a seeded stress drill and see the eval set expand;
4. apply incident commands and see seeded readiness change;
5. see Gemini propose a plan;
6. see deterministic evaluation score the plan;
7. run a Gemini-powered improvement pass;
8. compare old/new policy results;
9. see a promoted policy version with score improvement and trace evidence;
10. run a seeded mission execution timeline and see data-product handoff plus
    manifest validation evidence;
11. see Gemini computer-use audit evidence or a clearly marked unavailable
   integration fallback panel if API access fails during the hackathon.

Current accepted fallback: if Gemini quota blocks a live call, the panel must
show the exact quota/API blocker, preserve prompt/output previews when
available, and keep the deterministic demo usable.
