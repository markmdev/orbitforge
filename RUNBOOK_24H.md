# OrbitForge 24-Hour Runbook

Last updated: 2026-06-27

## Mission

For a 24-hour execution window, build the most polished possible OrbitForge
hackathon demo:

> A Gemini 3.5 self-improving mission-ops stack where an orbital-compute agent
> handles seeded incidents, gets evaluated, mutates its own operating policy,
> proves improvement, and exposes Gemini managed-agent plus computer-use traces.

The run is not done early. If the core demo works before the timer ends, keep
improving polish, robustness, evals, traces, judge narrative, deployment,
fallbacks, and QA until the timer expires.

## North Star

Win the hackathon by making judges believe three things within the first minute:

1. This is not a chatbot or static dashboard.
2. Gemini 3.5 is central to the system, not a wrapper.
3. The system visibly improves itself and proves the improvement.

## Operating Model

One Controller thread owns:

- scope and product decisions;
- Linear truth;
- PRD/ADR changes;
- integration choices;
- final QA verdict;
- demo script;
- Mark-facing reporting.

Specialist Codex threads own bounded workstreams and report back to the
Controller. They do not decide product direction or mark work done.

Linear tracks active work, blockers, proof gates, and follow-ups. Project files
own architecture and product truth. The app owns runtime proof once it exists.

## 24-Hour Phases

### Phase 0 - Kickoff and Access, T+0:00 to T+0:45

Goals:

- create Codex goal for the 24-hour run;
- verify Google/Gemini API access;
- verify Linear access;
- decide whether DigitalOcean deployment is needed;
- create Linear project/issues from `LINEAR_PLAN.md`;
- spawn initial specialist threads from `THREAD_ORCHESTRATION.md`;
- start implementation without waiting for perfect research.

Exit criteria:

- live tracker exists;
- app implementation has started;
- API blockers are explicit;
- fallback path is documented but not treated as equivalent to live Gemini.

### Phase 1 - Foundation, T+0:45 to T+4:00

Goals:

- scaffold app;
- seed data;
- build deterministic evaluator;
- build scenario runner;
- build basic Console, Scenario Lab, Evaluation, Policy Lab, Gemini Trace.

Exit criteria:

- local app runs;
- one scenario can execute end to end without Gemini;
- evaluator returns repeatable scores;
- UI shows the self-improvement loop shape.

### Phase 2 - Gemini Core, T+4:00 to T+8:00

Goals:

- integrate Gemini operator planning;
- integrate Gemini critique;
- add trace storage and UI;
- make failed plan -> critique -> candidate policy visible;
- research and spike Gemini API feature paths in parallel.

Exit criteria:

- live Gemini can produce a plan and critique, or access blocker is exact;
- traces are visible in the app;
- fallback traces are clearly labeled if used.

### Phase 3 - Self-Improvement Proof, T+8:00 to T+12:00

Goals:

- implement policy versioning;
- implement candidate mutation path;
- implement A/B evaluation;
- implement promotion gate;
- tune seeded policies so the demo has a believable improvement.

Exit criteria:

- old/new policy comparison works;
- score delta is visible;
- promoted policy is saved in app state or trace;
- guardrail score can reject bad mutations.

### Phase 4 - Gemini Prize Depth, T+12:00 to T+16:00

Goals:

- connect Gemini managed-agent or Interactions API surface if available through
  the in-app `src/ai/` service layer;
- persist environment/session id when available;
- integrate Gemini 3.5 Flash computer-use audit or the closest live supported
  API path;
- add visible Gemini audit and improvement trace panels.

Exit criteria:

- judges can see at least two Gemini 3.5 prize-relevant capabilities;
- API-access limitations are labeled in-product if any capability is blocked;
- core demo still works without fragile manual setup.

### Phase 5 - Product Polish, T+16:00 to T+20:00

Goals:

- improve visual hierarchy and motion;
- remove rough edges;
- add reset/demo mode;
- add judge script mode;
- improve copy;
- tune scenario data;
- add exportable summary.

Exit criteria:

- first screen communicates the project in under 10 seconds;
- full demo loop takes under 3 minutes;
- no visible placeholders, dead controls, or text overlap;
- demo can be reset quickly.

### Phase 6 - Hardening and QA, T+20:00 to T+23:00

Goals:

- run QA matrix;
- run eval matrix;
- run browser checks;
- run design critique;
- fix top issues;
- verify clean start on fresh terminal/browser;
- prepare final demo state.

Exit criteria:

- QA verdict is ready;
- known risks are documented;
- app is demo-ready on the operating surface, not just code-ready.

### Phase 7 - Final Hour, T+23:00 to T+24:00

Goals:

- stop feature work except critical fixes;
- rehearse demo script;
- verify API keys and reset state;
- prepare final report;
- freeze the judge path.

Exit criteria:

- final demo path works;
- final fallback path is known;
- presentation is concise;
- Controller can explain exactly how Gemini 3.5 is used.

## Continuous Loop When Ahead

If a phase finishes early, rotate through this queue:

1. improve first 30 seconds of judge experience;
2. strengthen Gemini trace visibility;
3. add harder eval scenario;
4. improve visual polish;
5. improve reset/replay reliability;
6. run QA matrix again;
7. simplify confusing copy;
8. improve fallback behavior;
9. create a better final report/export;
10. remove anything that feels fake or wrapper-like.

## Stop Rules During the 24-Hour Goal

Do not stop because the app is "done." Stop only when:

- the 24-hour timer ends;
- Mark needs to create/pay/authenticate an account;
- a legal/security/secrets issue requires Mark;
- a required external capability is unavailable and the exact fallback needs
  Mark's approval;
- the project direction would change away from ADR-0001.

## Controller Cadence

- Keep one active Controller thread.
- Update Linear whenever work starts, blocks, verifies, or closes.
- Update `THREADS.md` when specialist threads are active.
- Give Mark concise status only when useful or at major phase boundaries.
- Keep private coordination out of public/demo artifacts.

## Quality Bar

The demo must be:

- beautiful;
- fast to understand;
- technically dense;
- honest about seeded data;
- visibly Gemini-native;
- resilient to API hiccups;
- supported by deterministic evals;
- manually verified in the browser.
