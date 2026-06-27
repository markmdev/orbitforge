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

### R2 - Scenario Runner

The app must run seeded scenarios that exercise realistic orbital compute
constraints:

- SAR wildfire inference with freshness deadline;
- optical ground-link outage;
- thermal throttle;
- radiation/ECC anomaly;
- missed contact window;
- storage/downlink pressure.

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
- run the old and new versions against the same scenario set;
- promote a better version only if it improves score without violating
  guardrails;
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
  before/after improvement;
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
3. see Gemini propose a plan;
4. see deterministic evaluation score the plan;
5. run a Gemini-powered improvement pass;
6. compare old/new policy results;
7. see a promoted policy version with score improvement and trace evidence;
8. see Gemini computer-use audit evidence or a clearly marked unavailable
   integration fallback panel if API access fails during the hackathon.

Current accepted fallback: if Gemini quota blocks a live call, the panel must
show the exact quota/API blocker, preserve prompt/output previews when
available, and keep the deterministic demo usable.
