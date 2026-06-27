# OrbitForge 24-Hour Runbook

Last updated: 2026-06-27

## Mission

For a 24-hour execution window, build the most polished possible OrbitForge
hackathon demo:

> A Gemini 3.5 self-improving mission-ops stack where an orbital-compute agent
> handles seeded incidents, gets evaluated, mutates its own operating policy,
> proves improvement, and exposes Gemini runtime plus computer-use traces.

The run is not done early. If the core demo works before the timer ends, keep
improving polish, robustness, evals, traces, judge narrative, deployment,
fallbacks, research depth, product depth, and QA until the timer expires.

## North Star

Win the hackathon by making judges believe three things within the first minute:

1. This is not a chatbot or static dashboard.
2. Gemini 3.5 is central to the system, not a wrapper.
3. The system visibly improves itself and proves the improvement.
4. The product feels unusually polished and credible for a 24-hour build.

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

Specialist threads are never fire-and-forget. Before accepting their output,
the Controller must understand the relevant domain context, inspect the changed
files or research sources, talk through gaps with the specialist when needed,
run or delegate the right proof, and decide whether the work is integrated,
revised, or rejected.

The Controller keeps enough direct context to explain every major product,
architecture, Gemini, eval, QA, and demo decision without pointing at a
specialist as the source of truth.

The Controller owns the operating system for the 24-hour run. If a phase plan,
thread split, Linear issue shape, QA loop, or research strategy is not helping,
change it. Do not wait for Mark to approve internal process repairs unless the
change would alter product scope, external authority, account/payment/security,
or the public demo claim.

Linear tracks active work, blockers, proof gates, and follow-ups. Project files
own architecture and product truth. The app owns runtime proof once it exists.
`QUALITY_BAR.md` owns the standard for how deep and polished the product must
become as the build progresses.

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

- connect Gemini runtime API surfaces through the in-app `src/ai/` service
  layer;
- persist API trace ids when available;
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

## Continuous Loop For Depth

When an implementation area, research note, or planning file feels superficial:

1. find the current source, runtime behavior, or product decision it should be
   grounded in;
2. deepen the owner doc with the decision, evidence, acceptance criteria, proof
   surface, and known limits;
3. update the app, seed data, evals, or QA matrix if the research changes what
   great should mean;
4. merge or delete docs that no longer own a distinct piece of truth.

Do not let a short first draft become the ceiling for the product.

## Continuous Loop When the System Is Not Working

If progress slows, quality drops, or coordination starts producing noise:

1. collapse or merge specialist scopes;
2. replace a weak thread with direct Controller work;
3. rewrite Linear issues around proof gates instead of tasks;
4. reorder phases around the current biggest demo risk;
5. narrow a feature until it is provable;
6. add a review or QA pass where defects are slipping through;
7. update the owner doc that future work will read;
8. repair missing ergonomics or observability: browser control, console logs,
   tests, build, runtime probes, dev-server visibility, or API health checks;
9. continue building.

The only bad move is to keep following an operating model that is no longer
serving the demo.

## Always-On Verification Handles

During implementation, keep these surfaces available and working:

- `npm test` for deterministic domain and Gemini contract behavior.
- `npm run build` for production TypeScript/Vite correctness.
- `npm run verify:runtime` against the active local dev server for app-shell and
  Gemini middleware configured-state health without consuming a live model call.
- `npm run verify:gemini` when live Gemini proof is required and the current
  quota/rate-limit state makes that worth doing.
- `browser:control-in-app-browser` for local UI interaction, including real
  clicks, reset checks, view checks, and browser console logs.
- `chrome:control-chrome` when the task depends on Mark's existing Chrome
  profile state, such as Linear, AI Studio, or logged-in account surfaces.

If one of these handles breaks, fix it or record the blocker before relying on
weaker proof.

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
- Review specialist outputs before integration: read their diffs or research,
  verify their claims against source/runtime evidence, and record any accepted
  decision in the project owner file.
- Change the execution system when evidence says it is not working, then record
  the replacement rule in `RUNBOOK_24H.md`, `THREAD_ORCHESTRATION.md`,
  `LINEAR_PLAN.md`, or the relevant note.
- Use `QUALITY_BAR.md` as a recurring review surface; the demo is not complete
  while the core product, AI loop, visual design, or proof still feels thin.
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
