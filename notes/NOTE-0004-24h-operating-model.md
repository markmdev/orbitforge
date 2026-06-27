# NOTE-0004 - 24-Hour Operating Model

Date: 2026-06-27

Mark wants the next execution run to be a 24-hour goal where the Controller does
not stop early and keeps improving until the timer ends.

Prepared owner files:

- `RUNBOOK_24H.md`
- `LINEAR_PLAN.md`
- `THREAD_ORCHESTRATION.md`
- `EVAL_PLAN.md`
- `QA_MATRIX.md`
- `GEMINI_RESEARCH_PLAN.md`
- `TOOLS_AND_ACCESS.md`

The 24-hour run should start only after Mark explicitly says to kick it off and
Gemini/Linear access requirements are either satisfied or clearly blocked.

Update: Mark created the Linear project at
`https://linear.app/markmorgan/project/97a83c8d-9ed9-477f-b6f9-628f0e658c1b/overview`.
Use that project and do not create a duplicate. Mark also clarified that Gemini
Antigravity is an IDE and is not required for this project; target Gemini API
surfaces instead.

Update: Gemini should be used inside the app as a runtime product capability,
not as development scaffolding. Remove `.agents/skills`-style prebuilt skill
templates and implement AI behavior as normal app modules.

Update: specialist Codex threads are helper roles, not fire-and-forget task
outsourcing. The Controller must stay deep in the product, review returned
work, question assumptions, verify claims, and integrate only accepted output.

Update: Mark gave the Controller full project-manager ownership over the
execution system. If the thread model, Linear structure, phase order, QA loop,
or research split is not working, change it and record the new project truth
instead of asking Mark to manage the process.

Update: Mark clarified that hackathon speed does not lower the quality bar.
The product should be genuinely great. Short `.md` files may start as drafts,
but the Controller must deepen research, product thinking, QA, and owner docs
as implementation reveals what matters.
