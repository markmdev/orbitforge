# OrbitForge Quality Bar

Last updated: 2026-06-27

## Principle

OrbitForge is a hackathon project, but it should not feel like a hackathon
project. The timebox changes how aggressively we prioritize, not the quality
standard. The target is a genuinely impressive product demo: credible domain
model, sharp AI product loop, polished interface, clean implementation, and
honest proof.

Short planning files are acceptable as first drafts. They are not acceptable as
final truth if they still leave future builders inventing product behavior,
technical choices, domain assumptions, or proof criteria. As the project moves
from research to implementation, each owner doc must either deepen, merge into a
better owner, or be removed.

## What Great Means

### Product

- The first screen feels like a real orbital-compute operations console, not a
  landing page or generic dashboard.
- The user can understand the loop quickly: scenario, Gemini plan, evaluation,
  improvement, promotion, trace.
- Every control that appears important either works, is honestly disabled, or is
  removed.
- The product makes a hard thing legible without flattening it into toy
  language.

### Domain

- Seeded data may be fictional, but the constraints should feel real: power,
  thermal, contact windows, downlink, latency/freshness, radiation anomalies,
  workload placement, and ground-link limits.
- Space and datacenter terminology should be specific enough that a judge
  believes the team studied the domain.
- Current or unstable external claims must be source-backed before they affect
  product positioning, demo copy, or judge narrative.
- Regulatory material stays background unless it improves the demo; credibility
  should come from operational realism, not compliance theater.

### AI Product

- Gemini is visibly part of the product behavior, not hidden plumbing or a
  wrapper chatbot.
- Model outputs use structured contracts where the app depends on them.
- The app records traces, prompts, model names, outputs, failures, fallbacks,
  and promotion decisions in a way judges can inspect.
- Deterministic evals decide promotion. Gemini can diagnose, propose, critique,
  and audit, but it cannot silently grade itself into success.
- Failure states are productized: missing key, rate limit, unavailable computer
  use, malformed output, weak candidate, or guardrail rejection should teach the
  judge something about the system.

### Engineering

- The implementation should be small enough to finish and robust enough to demo.
- Core domain logic should live outside UI components.
- Seed data, policy versions, evaluator dimensions, Gemini traces, and demo
  state should have clear owners.
- Tests should cover scoring, promotion gates, structured output parsing, and
  any non-obvious state transitions.
- No placeholder source, fake TODO feature, dead button, or unexplained mock
  should survive into the final demo path.
- Runtime ergonomics are part of quality: the Controller should be able to run
  `npm test`, `npm run build`, `npm run verify:runtime`, inspect browser
  console logs, and use a browser controller without improvising new proof
  every time. Use `npm run verify:gemini` only when a live model call is worth
  the quota/rate-limit cost.
- If browser control, logs, tests, or runtime checks are broken, fix that system
  or escalate the exact blocker before doing fragile feature work on top of it.

### Design

- The UI should be dense, calm, and operational. Avoid a marketing hero, generic
  space wallpaper, or a one-note blue/purple theme.
- Visual polish matters: alignment, typography, spacing, hover/active states,
  charts, timelines, responsive behavior, empty states, and error states.
- The app should reward inspection. A judge should be able to click into traces,
  policy diffs, score breakdowns, and scenario constraints without needing a
  verbal explanation.
- Text should be precise and short. It should not explain the app's features in
  tutorial prose when the interface can make the behavior obvious.

### Demo

- The three-minute judge path must work from a clean state.
- The first minute must prove this is not a chatbot.
- The demo must show at least one believable before/after improvement.
- Fallbacks are allowed only when honest and visibly distinct from live Gemini.
- The final story should be: this is an AI operations system that improves
  itself under evaluation pressure.

## Living Depth Loop

Run this loop throughout the 24-hour build, especially when a file feels thin:

1. Identify the decision, feature, risk, or claim the doc is supposed to own.
2. Research current sources or inspect implementation/runtime evidence when the
   answer could be wrong, stale, or domain-specific.
3. Update the product, architecture, seed data, evals, or UI based on what was
   learned.
4. Update the owner doc with the deeper decision, acceptance criteria, proof
   surface, and known limits.
5. Remove or merge shallow docs that no longer have a distinct owner.

A doc is deep enough when a capable implementer can act from it without
inventing hidden product decisions, and a reviewer can tell how the claim will
be proven.

## Rework Triggers

Stop and improve the system when any of these are true:

- Gemini usage feels bolted on.
- The app works only as a rehearsed happy path.
- The evaluator can be gamed by worse policies.
- The scenario data feels like generic sci-fi instead of orbital compute.
- The UI is pretty but does not help the user reason.
- A doc controls implementation but cannot answer obvious builder questions.
- A specialist output is accepted because it exists, not because it is good.
- The current plan protects process over product quality.
- The Controller cannot comfortably operate the app, inspect logs, or verify
  runtime behavior.

## Final Standard

At the end, OrbitForge should feel like the seed of a real product: demo data,
but real product thinking; simulated operations, but credible constraints; fast
hackathon build, but polished enough that quality itself becomes part of the
pitch.
